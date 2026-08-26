"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";

interface AiSuggestion {
  id: string;
  suggestionType: string;
  contentJson: { label?: string; message?: string; tags?: string[] };
  status: string;
}

const WORKFLOWS = [
  {
    href: "/archive/video",
    title: "Video studio",
    desc: "Upload clips, describe the mood, revise until it feels right.",
    icon: "▷",
  },
  {
    href: "/characters",
    title: "Characters",
    desc: "Create and edit the cast — names, traits, and notes for consistent manga.",
    icon: "◉",
  },
  {
    href: "/story",
    title: "Manga story",
    desc: "Chapters from days you closed at bedtime — pick which story angles to include.",
    icon: "☷",
  },
  {
    href: "/days",
    title: "Close a day",
    desc: "Open any day, tap “I went to bed”, then choose manga story ideas.",
    icon: "☾",
  },
];

export function AiStudioPage() {
  return (
    <EditModeGuard>
      <AiStudioPageInner />
    </EditModeGuard>
  );
}

function AiStudioPageInner() {
  const [jobs, setJobs] = useState<unknown[]>([]);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTools, setShowTools] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/ai/jobs");
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setSuggestions(data.suggestions ?? []);
    } catch {
      /* offline / no server */
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function runJob(type: string) {
    setLoading(true);
    try {
      await fetch("/api/ai/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, input: {} }),
      });
      setTimeout(() => void load(), 1500);
    } finally {
      setLoading(false);
    }
  }

  const pending = suggestions.filter((s) => s.status === "pending");

  return (
    <StorybookShell>
      <div className="studio-spread memory-appear">
        <header className="studio-spread__header">
          <h1 className="spread-title">Creative studio</h1>
          <p className="spread-subtitle">
            Turn raw days into videos and manga — you stay in control at every step.
          </p>
        </header>

        <div className="studio-workflows">
          {WORKFLOWS.map((w) => (
            <Link key={w.href} href={w.href} className="studio-workflow paper-note paper-note--taped">
              <span className="studio-workflow__icon">{w.icon}</span>
              <div>
                <p className="studio-workflow__title">{w.title}</p>
                <p className="studio-workflow__desc">{w.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {pending.length > 0 && (
          <section className="studio-panel paper-note">
            <p className="storybook-widget__title">Suggestions waiting</p>
            <ul className="ai-suggestions">
              {pending.map((s) => (
                <li key={s.id} className="ai-suggestions__item">
                  <span className="ai-suggestions__label">
                    {s.contentJson.label ?? s.suggestionType}
                  </span>
                  <p>{s.contentJson.message ?? ""}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="studio-tools">
          <button
            type="button"
            className="studio-tools__toggle"
            onClick={() => setShowTools((v) => !v)}
          >
            {showTools ? "Hide" : "Show"} archive tools
          </button>
          {showTools && (
            <div className="studio-panel paper-note">
              <p className="storybook-widget__title">Background helpers</p>
              <div className="studio-tools__grid">
                {[
                  ["group_media", "Group by date"],
                  ["duplicate_detection", "Find duplicates"],
                  ["suggest_tags", "Suggest tags"],
                ].map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    disabled={loading}
                    className="studio-tools__btn"
                    onClick={() => void runJob(type)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="studio-panel__hint">{jobs.length} jobs in history</p>
            </div>
          )}
        </section>
      </div>
    </StorybookShell>
  );
}
