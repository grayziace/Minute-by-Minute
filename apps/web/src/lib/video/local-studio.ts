"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { generateId } from "@/lib/utils";
import type { StorySuggestion } from "@/lib/story-suggestions";

export interface LocalVideoProject {
  id: string;
  title: string;
  style: string;
  mediaIds: string[];
  revisions: { id: string; instruction: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

const PROJECT_PREFIX = "video.project.";

export function useLocalVideoProjects() {
  const rows = useLiveQuery(
    () =>
      db.syncMeta
        .where("key")
        .startsWith(PROJECT_PREFIX)
        .toArray(),
    [],
  );

  const projects: LocalVideoProject[] = (rows ?? [])
    .map((r) => {
      try {
        return JSON.parse(r.value) as LocalVideoProject;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as LocalVideoProject[];

  projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const save = async (project: LocalVideoProject) => {
    await db.syncMeta.put({
      key: `${PROJECT_PREFIX}${project.id}`,
      value: JSON.stringify(project),
    });
  };

  const create = async (mediaIds: string[], style: string) => {
    const now = new Date().toISOString();
    const project: LocalVideoProject = {
      id: generateId(),
      title: style.slice(0, 60) || "New video",
      style,
      mediaIds,
      revisions: [{ id: generateId(), instruction: style, createdAt: now }],
      createdAt: now,
      updatedAt: now,
    };
    await save(project);
    return project;
  };

  const addRevision = async (projectId: string, instruction: string) => {
    const row = await db.syncMeta.get(`${PROJECT_PREFIX}${projectId}`);
    if (!row) return;
    const project = JSON.parse(row.value) as LocalVideoProject;
    project.revisions.push({
      id: generateId(),
      instruction,
      createdAt: new Date().toISOString(),
    });
    project.updatedAt = new Date().toISOString();
    await save(project);
  };

  return { projects, create, addRevision, save };
}

export function useApprovedStories() {
  const rows = useLiveQuery(
    () =>
      db.syncMeta
        .where("key")
        .startsWith("day.")
        .filter((r) => r.key.endsWith(".approvedStories"))
        .toArray(),
    [],
  );

  const chapters: { dateKey: string; stories: StorySuggestion[] }[] = [];
  for (const row of rows ?? []) {
    const dateKey = row.key.replace("day.", "").replace(".approvedStories", "");
    try {
      chapters.push({ dateKey, stories: JSON.parse(row.value) });
    } catch {
      /* skip */
    }
  }
  return chapters.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export async function saveApprovedStories(dateKey: string, stories: StorySuggestion[]) {
  await db.syncMeta.put({
    key: `day.${dateKey}.approvedStories`,
    value: JSON.stringify(stories.filter((s) => s.approved)),
  });
}

export async function saveStorySuggestions(dateKey: string, suggestions: StorySuggestion[]) {
  await db.syncMeta.put({
    key: `day.${dateKey}.storySuggestions`,
    value: JSON.stringify(suggestions),
  });
}

export async function loadStorySuggestions(dateKey: string): Promise<StorySuggestion[]> {
  const row = await db.syncMeta.get(`day.${dateKey}.storySuggestions`);
  if (!row?.value) return [];
  try {
    return JSON.parse(row.value);
  } catch {
    return [];
  }
}
