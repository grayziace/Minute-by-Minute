"use client";

import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { SparkleField } from "@/components/ui/SparkleField";

const CREATE_ITEMS = [
  {
    href: "/archive/video",
    title: "Video diary",
    desc: "Turn today's clips into a vlog. Talk to the editor until it's right.",
    tag: "Vlog",
  },
  {
    href: "/add",
    title: "Capture",
    desc: "Photo, video, voice, writing — attach it to this minute.",
    tag: "Now",
  },
  {
    href: "/archive/ai",
    title: "Manga episode",
    desc: "Turn a day into a visual comic from your own material.",
    tag: "Soon",
  },
];

export function CreatePage() {
  return (
    <PageShell layout="immersive-scroll" sparkles={false} className="create-page mx-auto max-w-lg px-5 pt-12">
      <SparkleField />
      <header className="create-page__header memory-appear">
        <h1 className="create-page__title font-serif">Create</h1>
        <p className="create-page__subtitle">Turn raw life into something you can revisit.</p>
      </header>
      <div className="create-page__grid">
        {CREATE_ITEMS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="create-card memory-appear group"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className="create-card__tag">{item.tag}</span>
            <h2 className="create-card__title font-serif">{item.title}</h2>
            <p className="create-card__desc">{item.desc}</p>
            <span className="create-card__shimmer" aria-hidden />
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
