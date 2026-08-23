"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { EntryCard } from "@/components/timeline/EntryCard";
import { toDateKey } from "@/lib/utils";

export function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useLiveQuery(async () => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const entries = await db.entries.toArray();
    const tags = await db.tags.toArray();
    const tagMap = new Map(tags.map((t) => [t.id, t.name]));

    const entryTags = await db.table("entryTags").toArray().catch(() => []);

    return entries.filter((e) => {
      const textMatch =
        e.text?.toLowerCase().includes(q) ||
        e.moodNote?.toLowerCase().includes(q) ||
        e.locationName?.toLowerCase().includes(q) ||
        toDateKey(e.recordedAt).includes(q);
      return textMatch;
    });
  }, [query]);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl">Search</h1>
      </header>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="night market, metro, September…"
        className="mb-8 w-full border border-border/50 bg-surface px-4 py-3 text-base outline-none focus:border-accent"
        autoFocus
      />

      <div className="space-y-2">
        {results?.map((entry) => (
          <Link key={entry.id} href={`/timeline/${toDateKey(entry.recordedAt)}`}>
            <EntryCard entry={entry} compact />
          </Link>
        ))}

        {query && results?.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No matches.</p>
        )}
      </div>
    </main>
  );
}
