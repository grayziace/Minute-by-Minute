"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createEntryLocal, updateEntryLocal } from "@/lib/sync/engine";
import { generateId, nowIso, formatNowDayUpper, formatNowDateUpper } from "@/lib/utils";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { VisibilityPicker } from "@/components/ui/VisibilityPicker";
import type { Visibility } from "@/lib/types";
import { db } from "@/lib/dexie/db";

function WritePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const dateParam = params.get("date");

  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryId = useRef<string | null>(editId);

  useEffect(() => {
    if (!editId) return;
    void db.entries.get(editId).then((e) => {
      if (!e) return;
      setText(e.text ?? "");
      setLocation(e.locationName ?? "");
      setVisibility(e.visibility);
      entryId.current = editId;
    });
  }, [editId]);

  const persist = useCallback(
    async (draft: string, loc: string) => {
      if (!draft.trim() && !entryId.current) return;
      setStatus("saving");
      const ts = dateParam ? `${dateParam}T12:00:00.000Z` : nowIso();
      if (entryId.current) {
        await updateEntryLocal(entryId.current, {
          text: draft,
          locationName: loc.trim() || null,
          visibility,
        });
      } else if (draft.trim()) {
        const id = generateId();
        entryId.current = id;
        await createEntryLocal({
          id,
          userId: "local-user",
          recordedAt: ts,
          recordedAtPrecision: dateParam ? "approximate" : "exact",
          text: draft,
          moodNote: null,
          locationName: loc.trim() || null,
          locationLat: null,
          locationLng: null,
          locationAccuracy: null,
          locationPrivacy: "approximate",
          visibility,
          source: "user",
          clientId: id,
          updatedAt: ts,
          createdAt: ts,
        });
      }
      setStatus("saved");
    },
    [dateParam, visibility],
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void persist(text, location);
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, location, persist]);

  const now = new Date();

  return (
    <StorybookShell>
      <div className="write-page memory-appear">
        <header className="write-page__header">
          <p className="write-page__day">{formatNowDayUpper(now)}</p>
          <p className="write-page__date">{formatNowDateUpper(now)}</p>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="write-page__location"
          />
        </header>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What is happening?"
          className="write-page__body"
          autoFocus
        />

        <footer className="write-page__foot">
          <VisibilityPicker value={visibility} onChange={setVisibility} />
          <span className="write-page__status">
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
          </span>
          <button
            type="button"
            className="storybook-widget__link"
            onClick={() => router.push(dateParam ? `/days/${dateParam}` : "/")}
          >
            Done
          </button>
        </footer>
      </div>
    </StorybookShell>
  );
}

export function WritePage() {
  return (
    <EditModeGuard>
      <Suspense fallback={null}>
        <WritePageInner />
      </Suspense>
    </EditModeGuard>
  );
}
