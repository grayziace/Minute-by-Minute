"use client";

import { useEffect, useState } from "react";

interface AiSuggestion {
  id: string;
  suggestionType: string;
  contentJson: { label?: string; message?: string; tags?: string[] };
  status: string;
}

export function AiStudioPage() {
  const [jobs, setJobs] = useState<unknown[]>([]);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/ai/jobs");
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setSuggestions(data.suggestions ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function runJob(type: string, input: Record<string, unknown> = {}) {
    setLoading(true);
    await fetch("/api/ai/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, input }),
    });
    setTimeout(() => {
      void load();
      setLoading(false);
    }, 1500);
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl">AI Studio</h1>
        <p className="mt-1 text-sm text-muted">
          Suggestions only — you approve everything.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-2">
        {[
          ["group_media", "Group by date"],
          ["duplicate_detection", "Find duplicates"],
          ["suggest_tags", "Suggest tags"],
        ].map(([type, label]) => (
          <button
            key={type}
            disabled={loading}
            onClick={() => void runJob(type)}
            className="border border-border/50 py-3 text-[10px] uppercase tracking-wider hover:border-accent disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Suggestions</h2>
        {suggestions.filter((s) => s.status === "pending").map((s) => (
          <div
            key={s.id}
            className="mb-3 border border-secondary/30 bg-secondary/5 p-3"
          >
            <span className="text-[10px] uppercase tracking-wider text-secondary">
              {s.contentJson.label ?? "AI suggestion"}
            </span>
            <p className="mt-1 text-sm">{s.contentJson.message ?? s.suggestionType}</p>
            {s.contentJson.tags && (
              <p className="mt-1 text-xs text-muted">
                {s.contentJson.tags.map((t) => `#${t}`).join(" ")}
              </p>
            )}
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted">Recent jobs</h2>
        <p className="text-sm text-muted">{jobs.length} jobs in queue/history</p>
      </section>
    </main>
  );
}
