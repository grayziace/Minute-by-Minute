import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function createAiJob(
  userId: string,
  type: string,
  input: Record<string, unknown>,
) {
  const db = getDb();
  const [job] = await db
    .insert(schema.aiJobs)
    .values({
      userId,
      type,
      status: "queued",
      inputJson: input,
      costEstimate: estimateCost(type, input),
    })
    .returning();
  return job;
}

function estimateCost(type: string, input: Record<string, unknown>): number {
  switch (type) {
    case "transcribe":
      return 0.006 * ((input.durationMinutes as number) ?? 1);
    case "group_media":
      return 0.01;
    case "suggest_tags":
      return 0.01 * ((input.count as number) ?? 1);
    case "day_summary":
      return 0.05;
    case "propose_edit":
      return 0.25;
    default:
      return 0.01;
  }
}

export async function processAiJob(jobId: string) {
  const db = getDb();
  await db
    .update(schema.aiJobs)
    .set({ status: "running" })
    .where(eq(schema.aiJobs.id, jobId));

  const [job] = await db
    .select()
    .from(schema.aiJobs)
    .where(eq(schema.aiJobs.id, jobId))
    .limit(1);

  if (!job) return;

  try {
    const output = await runJobLogic(job.type, job.inputJson as Record<string, unknown>, job.userId);
    await db
      .update(schema.aiJobs)
      .set({
        status: "completed",
        outputJson: output,
        completedAt: new Date(),
      })
      .where(eq(schema.aiJobs.id, jobId));

    if (output.suggestions) {
      for (const s of output.suggestions as Array<Record<string, unknown>>) {
        await db.insert(schema.aiSuggestions).values({
          userId: job.userId,
          targetType: s.targetType as string,
          targetId: s.targetId as string,
          suggestionType: s.suggestionType as string,
          contentJson: s.content as Record<string, unknown>,
          status: "pending",
        });
      }
    }
  } catch (error) {
    await db
      .update(schema.aiJobs)
      .set({
        status: "failed",
        outputJson: { error: String(error) },
        completedAt: new Date(),
      })
      .where(eq(schema.aiJobs.id, jobId));
  }
}

async function runJobLogic(
  type: string,
  input: Record<string, unknown>,
  userId: string,
) {
  const db = getDb();

  switch (type) {
    case "group_media": {
      const assets = await db
        .select()
        .from(schema.mediaAssets)
        .where(eq(schema.mediaAssets.userId, userId));

      const groups = new Map<string, string[]>();
      for (const a of assets) {
        if (!a.capturedAt) continue;
        const key = a.capturedAt.toISOString().slice(0, 10);
        const list = groups.get(key) ?? [];
        list.push(a.id);
        groups.set(key, list);
      }

      const suggestions = Array.from(groups.entries())
        .filter(([, ids]) => ids.length >= 3)
        .map(([date, ids]) => ({
          targetType: "media_group",
          targetId: date,
          suggestionType: "date_group",
          content: {
            label: "AI suggestion",
            message: `${ids.length} items from ${date} could be grouped.`,
            mediaIds: ids,
          },
        }));

      return { groups: Object.fromEntries(groups), suggestions };
    }

    case "duplicate_detection": {
      const assets = await db
        .select()
        .from(schema.mediaAssets)
        .where(eq(schema.mediaAssets.userId, userId));

      const byHash = new Map<string, string[]>();
      for (const a of assets) {
        if (!a.sha256) continue;
        const list = byHash.get(a.sha256) ?? [];
        list.push(a.id);
        byHash.set(a.sha256, list);
      }

      const suggestions = Array.from(byHash.entries())
        .filter(([, ids]) => ids.length > 1)
        .map(([hash, ids]) => ({
          targetType: "media",
          targetId: ids[0],
          suggestionType: "duplicate",
          content: {
            label: "AI suggestion",
            message: "Possible duplicate media detected.",
            hash,
            mediaIds: ids,
          },
        }));

      return { duplicates: suggestions.length, suggestions };
    }

    case "suggest_tags": {
      const suggestions = [
        {
          targetType: "entry",
          targetId: (input.entryId as string) ?? "unknown",
          suggestionType: "tags",
          content: {
            label: "AI suggestion",
            tags: ["guangzhou", "metro", "night"],
          },
        },
      ];
      return { suggestions };
    }

    case "transcribe":
      return {
        text: "[AI transcription placeholder — connect OpenAI Whisper API]",
        source: "ai",
        suggestions: [],
      };

    case "propose_edit":
      return {
        message: "Edit proposal ready — use Video Studio to preview.",
        suggestions: [],
      };

    default:
      return { message: "Job completed", suggestions: [] };
  }
}
