"use client";

import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

/** Chapters emerge from lived experience — placeholder for gradual creation */
const PLACEHOLDER_CHAPTERS = [
  {
    id: "1",
    number: "ONE",
    title: "Arrival",
    subtitle: "Not yet written",
    atmosphere: "ice" as const,
  },
];

export function ChaptersPage() {
  return (
    <PageShell>
      <header className="mb-10 memory-appear">
        <h1 className="font-serif text-3xl font-light text-gradient-angel">Chapters</h1>
        <p className="mt-2 text-sm text-muted">
          Eras emerge from lived experience. You decide when.
        </p>
      </header>

      <div className="space-y-6">
        {PLACEHOLDER_CHAPTERS.map((chapter) => (
          <GlassPanel key={chapter.id} strong className="overflow-hidden">
            <div className="relative px-6 py-10">
              <div className="now-light-sweep absolute inset-0 opacity-30" />
              <p className="relative text-[10px] uppercase tracking-[0.35em] text-muted">
                Chapter {chapter.number}
              </p>
              <h2 className="relative mt-3 font-serif text-2xl tracking-wide text-gradient-angel">
                {chapter.title}
              </h2>
              <p className="relative mt-2 font-hand text-lg text-blush-deep">
                {chapter.subtitle}
              </p>
            </div>
          </GlassPanel>
        ))}

        <GlassPanel className="border-dashed px-6 py-8 text-center">
          <p className="font-serif text-sm italic text-muted">
            New chapters appear when you are ready to name an era.
          </p>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
