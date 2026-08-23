import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { EDL, EDLClip } from "@/lib/video/edl-types";

export type { EDL, EDLClip };

export async function proposeEdit(
  userId: string,
  sourceMediaIds: string[],
  instruction: string,
) {
  const db = getDb();
  const [project] = await db
    .insert(schema.editProjects)
    .values({
      userId,
      title: instruction.slice(0, 80) || "Untitled edit",
      description: instruction,
      status: "proposed",
    })
    .returning();

  const clips: EDLClip[] = sourceMediaIds.map((id, i) => ({
    sourceMediaId: id,
    inMs: 0,
    outMs: null,
    order: i,
    transition: i === 0 ? "cut" : "crossfade",
    speed: 1,
    audioTreatment: "keep",
  }));

  const edl: EDL = {
    projectId: project.id,
    title: project.title,
    description: instruction,
    clips,
    targetDurationMs: 90000,
  };

  for (const clip of clips) {
    await db.insert(schema.editClips).values({
      editProjectId: project.id,
      sourceMediaId: clip.sourceMediaId,
      inMs: clip.inMs,
      outMs: clip.outMs,
      orderIndex: clip.order,
      transition: clip.transition,
      speed: clip.speed,
      audioTreatment: clip.audioTreatment,
    });
  }

  const [revision] = await db
    .insert(schema.editRevisions)
    .values({
      editProjectId: project.id,
      instructionText: instruction,
      edlSnapshotJson: edl,
    })
    .returning();

  return { project, edl, revisionId: revision.id };
}

export async function reviseEdit(projectId: string, instruction: string) {
  const db = getDb();
  const existingClips = await db
    .select()
    .from(schema.editClips)
    .where(eq(schema.editClips.editProjectId, projectId));

  const [project] = await db
    .select()
    .from(schema.editProjects)
    .where(eq(schema.editProjects.id, projectId))
    .limit(1);

  if (!project) throw new Error("Project not found");

  let clips = existingClips.map((c) => ({
    sourceMediaId: c.sourceMediaId,
    inMs: c.inMs,
    outMs: c.outMs,
    order: c.orderIndex,
    transition: (c.transition ?? "cut") as EDLClip["transition"],
    speed: c.speed ?? 1,
    audioTreatment: (c.audioTreatment ?? "keep") as EDLClip["audioTreatment"],
  }));

  const lower = instruction.toLowerCase();
  if (lower.includes("faster") || lower.includes("fast opening")) {
    clips = clips.map((c, i) => (i === 0 ? { ...c, speed: 1.5 } : c));
  }
  if (lower.includes("remove") && lower.includes("clip") && clips.length > 1) {
    clips = clips.slice(1);
  }
  if (lower.includes("chaotic")) {
    clips = clips.map((c) => ({ ...c, transition: "metro_glitch" as const }));
  }
  if (lower.includes("quieter")) {
    clips = clips.map((c) => ({ ...c, audioTreatment: "duck" as const }));
  }

  clips = clips.map((c, i) => ({ ...c, order: i }));

  await db
    .delete(schema.editClips)
    .where(eq(schema.editClips.editProjectId, projectId));

  for (const clip of clips) {
    await db.insert(schema.editClips).values({
      editProjectId: projectId,
      sourceMediaId: clip.sourceMediaId,
      inMs: clip.inMs,
      outMs: clip.outMs,
      orderIndex: clip.order,
      transition: clip.transition,
      speed: clip.speed,
      audioTreatment: clip.audioTreatment,
    });
  }

  const edl: EDL = {
    projectId,
    title: project.title,
    description: instruction,
    clips,
  };

  const [revision] = await db
    .insert(schema.editRevisions)
    .values({
      editProjectId: projectId,
      instructionText: instruction,
      edlSnapshotJson: edl,
    })
    .returning();

  return { edl, revisionId: revision.id };
}

export async function renderEdit(projectId: string, revisionId: string) {
  const db = getDb();
  const [project] = await db
    .select()
    .from(schema.editProjects)
    .where(eq(schema.editProjects.id, projectId))
    .limit(1);

  if (!project) throw new Error("Project not found");

  const outputMediaId = crypto.randomUUID();
  await db.insert(schema.mediaAssets).values({
    id: outputMediaId,
    userId: project.userId,
    entryId: null,
    storageKey: `renders/${projectId}/${revisionId}.mp4`,
    originalFilename: `${project.title}.mp4`,
    mimeType: "video/mp4",
    byteSize: 0,
    uploadStatus: "processing",
    visibility: "private",
  });

  await db.insert(schema.renderedVideos).values({
    editProjectId: projectId,
    editRevisionId: revisionId,
    mediaAssetId: outputMediaId,
  });

  await db
    .update(schema.editProjects)
    .set({ status: "rendered", updatedAt: new Date() })
    .where(eq(schema.editProjects.id, projectId));

  // Worker renders via FFmpeg — queue job
  fetch(`${process.env.RP_ORIGIN ?? "http://localhost:3000"}/api/worker/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, revisionId, outputMediaId }),
  }).catch(() => {});

  return { outputMediaId, status: "queued" };
}
