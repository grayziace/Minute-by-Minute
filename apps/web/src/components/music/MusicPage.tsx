"use client";

import { useEffect, useState } from "react";

interface Track {
  id: string;
  title: string;
  artist: string | null;
  externalUrl: string | null;
}

export function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    void fetch("/api/music")
      .then((r) => r.json())
      .then((d) => setTracks(d.tracks ?? []));
  }, []);

  async function addTrack() {
    if (!title.trim()) return;
    const res = await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        artist: artist.trim() || null,
        externalUrl: url.trim() || null,
      }),
    });
    const data = await res.json();
    setTracks((t) => [...t, data.track]);
    setTitle("");
    setArtist("");
    setUrl("");
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl">Music</h1>
        <p className="mt-1 text-sm text-muted">Links and metadata only — no downloads.</p>
      </header>

      <div className="mb-8 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
          className="w-full border border-border/50 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist"
          className="w-full border border-border/50 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Spotify / NetEase / Apple Music link"
          className="w-full border border-border/50 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={() => void addTrack()}
          className="w-full bg-accent py-2 text-xs uppercase tracking-wider text-background"
        >
          Add track
        </button>
      </div>

      <ul className="divide-y divide-border/30">
        {tracks.map((t) => (
          <li key={t.id} className="py-4">
            <p className="font-serif">{t.title}</p>
            {t.artist && <p className="text-sm text-muted">{t.artist}</p>}
            {t.externalUrl && (
              <a
                href={t.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-secondary hover:text-accent"
              >
                Open link
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
