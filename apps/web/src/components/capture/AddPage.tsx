"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createEntryLocal } from "@/lib/sync/engine";
import { queueFileUpload } from "@/lib/uploads/client";
import { generateId, nowIso } from "@/lib/utils";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function AddPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveTextEntry() {
    if (!text.trim()) return;
    setSaving(true);
    const id = generateId();
    const now = nowIso();
    await createEntryLocal({
      id,
      userId: "local-user",
      recordedAt: now,
      recordedAtPrecision: "exact",
      text: text.trim(),
      moodNote: null,
      locationName: location.trim() || null,
      locationLat: null,
      locationLng: null,
      locationAccuracy: null,
      locationPrivacy: "approximate",
      visibility: "private",
      source: "user",
      clientId: id,
      updatedAt: now,
      createdAt: now,
    });
    setSaving(false);
    router.push("/");
  }

  async function handleFiles(files: FileList | null, toInbox: boolean) {
    if (!files?.length) return;
    setSaving(true);
    for (const file of Array.from(files)) {
      await queueFileUpload(file, { toInbox });
    }
    setSaving(false);
    router.push(toInbox ? "/inbox" : "/");
  }

  return (
    <PageShell className="pt-10">
      <header className="mb-10 memory-appear">
        <h1 className="font-serif text-3xl font-light text-gradient-angel">Capture</h1>
        <p className="mt-2 text-sm text-muted">What is happening now?</p>
      </header>

      <div className="space-y-8">
        <GlassPanel className="p-5 memory-appear">
          <label className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-muted">
            Text moment
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Wake up. Metro. Lunch."
            className="w-full resize-none bg-transparent font-serif text-lg outline-none placeholder:text-muted/60"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className="mt-4 w-full border-t border-white/50 bg-transparent py-3 text-sm outline-none placeholder:text-muted/60"
          />
          <button
            onClick={() => void saveTextEntry()}
            disabled={saving || !text.trim()}
            className="mt-5 w-full rounded-full bg-gradient-to-r from-ice/80 to-blush/60 py-3.5 text-[10px] uppercase tracking-[0.2em] text-midnight disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save moment"}
          </button>
        </GlassPanel>

        <section className="space-y-3 memory-appear">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted">Media</h2>
          <button
            onClick={() => fileRef.current?.click()}
            className="glass w-full py-4 text-[10px] uppercase tracking-[0.2em] text-foreground-soft transition-all hover:shadow-[0_8px_32px_rgba(140,180,230,0.15)]"
          >
            Photo or video
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,audio/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files, false)}
          />
          <button
            onClick={() => bulkRef.current?.click()}
            className="w-full border border-dashed border-ice/40 py-4 text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-blush/50 hover:text-foreground-soft"
          >
            Dump to inbox (bulk)
          </button>
          <input
            ref={bulkRef}
            type="file"
            accept="image/*,video/*,audio/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files, true)}
          />
        </section>
      </div>
    </PageShell>
  );
}
