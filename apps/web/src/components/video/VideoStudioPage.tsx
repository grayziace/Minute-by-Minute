"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { useLocalVideoProjects } from "@/lib/video/local-studio";
import { formatTime } from "@/lib/utils";

type Step = "upload" | "style" | "review";

export function VideoStudioPage() {
  return (
    <EditModeGuard>
      <VideoStudioPageInner />
    </EditModeGuard>
  );
}

function VideoStudioPageInner() {
  const [step, setStep] = useState<Step>("upload");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [style, setStyle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const media = useLiveQuery(
    () =>
      db.mediaAssets
        .filter((m) => m.mimeType.startsWith("image/") || m.mimeType.startsWith("video/"))
        .toArray(),
    [],
  );

  const { projects, create, addRevision } = useLocalVideoProjects();

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null,
    [projects, activeProjectId],
  );

  function toggleMedia(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!style.trim() || selected.size === 0) return;
    setBusy(true);
    const project = await create(Array.from(selected), style.trim());
    setActiveProjectId(project.id);
    setStep("review");
    setBusy(false);
  }

  async function handleRevision() {
    if (!activeProject || !editNote.trim()) return;
    setBusy(true);
    await addRevision(activeProject.id, editNote.trim());
    setEditNote("");
    setBusy(false);
  }

  return (
    <StorybookShell>
      <div className="studio-spread memory-appear">
        <header className="studio-spread__header">
          <Link href="/archive/ai" className="day-chapter__back">
            ← Studios
          </Link>
          <h1 className="spread-title">Video studio</h1>
          <p className="spread-subtitle">
            Upload clips, describe the mood, then refine with edit notes.
          </p>
        </header>

        <ol className="studio-steps">
          {(
            [
              ["upload", "1 · Choose clips"],
              ["style", "2 · Describe style"],
              ["review", "3 · Review & revise"],
            ] as const
          ).map(([key, label]) => (
            <li
              key={key}
              className={`studio-steps__item${step === key ? " studio-steps__item--active" : ""}`}
            >
              <button type="button" onClick={() => setStep(key)}>
                {label}
              </button>
            </li>
          ))}
        </ol>

        {step === "upload" && (
          <section className="studio-panel paper-note">
            <p className="storybook-widget__title">Your footage</p>
            <p className="studio-panel__hint">
              Pick photos and videos from your archive. Add more from{" "}
              <Link href="/add" className="storybook-widget__link">
                Capture
              </Link>
              .
            </p>
            {!media?.length ? (
              <p className="studio-panel__empty">No photos or videos yet.</p>
            ) : (
              <ul className="media-picker">
                {media.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className={`media-picker__tile${selected.has(m.id) ? " media-picker__tile--on" : ""}`}
                      onClick={() => toggleMedia(m.id)}
                    >
                      {m.localBlobUrl && m.mimeType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.localBlobUrl} alt="" className="media-picker__img" />
                      ) : (
                        <span className="media-picker__video">Video</span>
                      )}
                      <span className="media-picker__name">{m.originalFilename}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="studio-panel__primary"
              disabled={selected.size === 0}
              onClick={() => setStep("style")}
            >
              Continue ({selected.size} selected)
            </button>
          </section>
        )}

        {step === "style" && (
          <section className="studio-panel paper-note paper-note--taped">
            <p className="storybook-widget__title">What kind of video?</p>
            <textarea
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              rows={6}
              placeholder="90 seconds, warm and slow. Open on the metro ride, cut to street food at dusk, soft piano, no fast transitions…"
              className="studio-panel__textarea"
              autoFocus
            />
            <div className="studio-panel__actions">
              <button type="button" className="studio-panel__ghost" onClick={() => setStep("upload")}>
                Back
              </button>
              <button
                type="button"
                className="studio-panel__primary"
                disabled={!style.trim() || selected.size === 0 || busy}
                onClick={() => void handleCreate()}
              >
                {busy ? "Creating draft…" : "Make video draft"}
              </button>
            </div>
          </section>
        )}

        {step === "review" && (
          <section className="studio-panel">
            {!activeProject ? (
              <div className="paper-note">
                <p className="studio-panel__empty">Create a draft first.</p>
                <button type="button" className="storybook-widget__link" onClick={() => setStep("style")}>
                  Describe style →
                </button>
              </div>
            ) : (
              <>
                <div className="video-draft paper-note paper-note--taped">
                  <p className="storybook-widget__title">Draft</p>
                  <p className="video-draft__title">{activeProject.title}</p>
                  <p className="video-draft__meta">
                    {activeProject.mediaIds.length} clips · updated{" "}
                    {formatTime(activeProject.updatedAt)}
                  </p>
                  <div className="video-draft__preview">
                    {activeProject.mediaIds.slice(0, 4).map((id) => {
                      const asset = media?.find((m) => m.id === id);
                      if (!asset?.localBlobUrl) return null;
                      return asset.mimeType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={id} src={asset.localBlobUrl} alt="" />
                      ) : (
                        <video key={id} src={asset.localBlobUrl} muted preload="metadata" />
                      );
                    })}
                  </div>
                  <p className="video-draft__note">
                    Full render will stitch clips with your style notes. For now this draft tracks
                    your intent and revision history locally.
                  </p>
                </div>

                <div className="studio-panel paper-note">
                  <p className="storybook-widget__title">Suggest an edit</p>
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    rows={3}
                    placeholder="Shorten the opening, add more captions, swap the last clip…"
                    className="studio-panel__textarea"
                  />
                  <button
                    type="button"
                    className="studio-panel__primary"
                    disabled={!editNote.trim() || busy}
                    onClick={() => void handleRevision()}
                  >
                    {busy ? "Saving…" : "Add revision"}
                  </button>
                </div>

                {activeProject.revisions.length > 0 && (
                  <ol className="revision-list">
                    {activeProject.revisions.map((r, i) => (
                      <li key={r.id} className="revision-list__item paper-note">
                        <span className="revision-list__num">v{i + 1}</span>
                        <p>{r.instruction}</p>
                        <time>{formatTime(r.createdAt)}</time>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </section>
        )}

        {projects.length > 1 && (
          <aside className="studio-sidebar paper-note">
            <p className="storybook-widget__title">Other projects</p>
            <ul className="studio-sidebar__list">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={p.id === activeProject?.id ? "studio-sidebar__active" : undefined}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setStep("review");
                    }}
                  >
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </StorybookShell>
  );
}
