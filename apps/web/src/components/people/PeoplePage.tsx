"use client";

import { useEffect, useState } from "react";

interface Person {
  id: string;
  name: string;
  nickname: string | null;
  notes: string | null;
}

export function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    void fetch("/api/people")
      .then((r) => r.json())
      .then((d) => setPeople(d.people ?? []));
  }, []);

  async function addPerson() {
    if (!name.trim()) return;
    const res = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    setPeople((p) => [...p, data.person]);
    setName("");
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl">People</h1>
        <p className="mt-1 text-sm text-muted">Manually tagged. No facial recognition.</p>
      </header>

      <div className="mb-8 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name or nickname"
          className="flex-1 border border-border/50 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={() => void addPerson()}
          className="bg-accent px-4 py-2 text-xs uppercase tracking-wider text-background"
        >
          Add
        </button>
      </div>

      <ul className="divide-y divide-border/30">
        {people.map((p) => (
          <li key={p.id} className="py-4">
            <p className="font-serif">{p.name}</p>
            {p.nickname && <p className="text-sm text-muted">{p.nickname}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
