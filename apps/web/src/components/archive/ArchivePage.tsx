"use client";

import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

const LINKS = [
  { href: "/search", label: "Search" },
  { href: "/videos", label: "Videos" },
  { href: "/chapters", label: "Chapters" },
  { href: "/map", label: "Map" },
  { href: "/people", label: "People" },
  { href: "/places", label: "Places" },
  { href: "/music", label: "Music" },
  { href: "/archive/settings", label: "Settings" },
  { href: "/archive/ai", label: "AI Studio" },
  { href: "/archive/video", label: "Video Studio" },
  { href: "/login", label: "Account" },
];

export function ArchivePage() {
  return (
    <PageShell>
      <header className="mb-10 memory-appear">
        <h1 className="font-serif text-3xl font-light text-gradient-angel">Archive</h1>
        <p className="mt-2 text-sm text-muted">Your private collection.</p>
      </header>

      <GlassPanel className="divide-y divide-white/50 overflow-hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-5 py-4 text-[10px] uppercase tracking-[0.15em] text-foreground-soft transition-colors hover:bg-white/30 hover:text-ice-deep"
          >
            {link.label}
          </Link>
        ))}
      </GlassPanel>

      <footer className="mt-16 text-center memory-appear">
        <p className="font-serif text-base italic text-muted">
          You are here. This is happening now.
        </p>
      </footer>
    </PageShell>
  );
}
