"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Entry } from "@/lib/types";
import { generateStorySuggestions, type StorySuggestion } from "@/lib/story-suggestions";
import {
  loadStorySuggestions,
  saveApprovedStories,
  saveStorySuggestions,
} from "@/lib/video/local-studio";
import { isDayCompleted, type DayMeta } from "@/lib/day-meta";
import { formatDayHeading } from "@/lib/utils";

interface StorySuggestionsPanelProps {
  dateKey: string;
  meta: DayMeta;
  entries: Entry[];
  onMarkComplete: () => Promise<void>;
}

export function StorySuggestionsPanel({
  dateKey,
  meta,
  entries,
  onMarkComplete,
}: StorySuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const completed = isDayCompleted(meta);

  useEffect(() => {
    let cancelled = false;
    void loadStorySuggestions(dateKey).then((stored) => {
      if (cancelled) return;
      setSuggestions(stored);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  async function handleMarkComplete() {
    setBusy(true);
    await onMarkComplete();
    const generated = generateStorySuggestions(entries, meta.title);
    setSuggestions(generated);
    await saveStorySuggestions(dateKey, generated);
    setBusy(false);
  }

  async function regenerate() {
    setBusy(true);
    const generated = generateStorySuggestions(entries, meta.title);
    setSuggestions(generated);
    await saveStorySuggestions(dateKey, generated);
    setBusy(false);
  }

  async function toggleApproved(id: string) {
    const next = suggestions.map((s) =>
      s.id === id ? { ...s, approved: !s.approved } : s,
    );
    setSuggestions(next);
    await saveStorySuggestions(dateKey, next);
    await saveApprovedStories(dateKey, next);
  }

  async function approveAll() {
    const next = suggestions.map((s) => ({ ...s, approved: true }));
    setSuggestions(next);
    await saveStorySuggestions(dateKey, next);
    await saveApprovedStories(dateKey, next);
  }

  async function approveNone() {
    const next = suggestions.map((s) => ({ ...s, approved: false }));
    setSuggestions(next);
    await saveStorySuggestions(dateKey, next);
    await saveApprovedStories(dateKey, next);
  }

  const approvedCount = suggestions.filter((s) => s.approved).length;
  const completedLabel = meta.completedAt
    ? new Date(meta.completedAt).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="day-complete paper-note paper-note--taped">
      <header className="day-complete__head">
        <div>
          <p className="storybook-widget__title">End of day</p>
          <p className="day-complete__hint">
            Mark the day complete when you go to bed — not at midnight. You can finish at 4am
            and still close out yesterday.
          </p>
        </div>
        {!completed && (
          <button
            type="button"
            className="day-complete__bed-btn"
            disabled={busy || entries.length === 0}
            onClick={() => void handleMarkComplete()}
          >
            {busy ? "Closing day…" : "I went to bed"}
          </button>
        )}
      </header>

      {completed && (
        <>
          <p className="day-complete__stamp">
            Day closed {completedLabel} · {formatDayHeading(`${dateKey}T12:00:00`)}
          </p>

          {loading ? (
            <p className="day-complete__empty">Preparing story ideas…</p>
          ) : suggestions.length === 0 ? (
            <div className="day-complete__empty">
              <p>No story angles yet.</p>
              <button
                type="button"
                className="storybook-widget__link"
                disabled={busy}
                onClick={() => void regenerate()}
              >
                Generate ideas from today&apos;s moments
              </button>
            </div>
          ) : (
            <>
              <div className="day-complete__toolbar">
                <p className="day-complete__toolbar-label">
                  Pick which stories become manga chapters ({approvedCount} selected)
                </p>
                <div className="day-complete__toolbar-actions">
                  <button type="button" className="day-complete__link" onClick={() => void approveAll()}>
                    All
                  </button>
                  <button type="button" className="day-complete__link" onClick={() => void approveNone()}>
                    None
                  </button>
                  <button
                    type="button"
                    className="day-complete__link"
                    disabled={busy}
                    onClick={() => void regenerate()}
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              <ul className="story-suggestions">
                {suggestions.map((s) => (
                  <li key={s.id} className="story-suggestions__item">
                    <label className="story-suggestions__card">
                      <input
                        type="checkbox"
                        checked={s.approved}
                        onChange={() => void toggleApproved(s.id)}
                        className="story-suggestions__check"
                      />
                      <div>
                        <p className="story-suggestions__tone">{s.tone}</p>
                        <p className="story-suggestions__title">{s.title}</p>
                        <p className="story-suggestions__summary">{s.summary}</p>
                        <p className="story-suggestions__meta">
                          {s.momentIds.length} moment{s.momentIds.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>

              {approvedCount > 0 && (
                <Link href="/story" className="day-complete__manga-link">
                  View manga story →
                </Link>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
