"use client";

import { useState } from "react";

export function VideoStudioPage() {
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState("");

  async function proposeEdit() {
    setStatus("Proposing edit…");
    const res = await fetch("/api/video/edits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "propose",
        sourceMediaIds: [],
        instruction,
      }),
    });
    const data = await res.json();
    setStatus(data.project ? `Project created: ${data.project.title}` : "Failed");
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl">Video Studio</h1>
        <p className="mt-1 text-sm text-muted">
          Describe an edit. Approve before rendering.
        </p>
      </header>

      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        rows={5}
        placeholder="Make a 90-second video about my first week in Guangzhou…"
        className="mb-4 w-full border border-border/50 bg-surface px-4 py-3 font-serif text-sm outline-none focus:border-accent"
      />

      <button
        onClick={() => void proposeEdit()}
        disabled={!instruction.trim()}
        className="w-full bg-accent py-3 text-xs uppercase tracking-wider text-background disabled:opacity-40"
      >
        Propose edit
      </button>

      {status && <p className="mt-4 text-sm text-muted">{status}</p>}
    </main>
  );
}
