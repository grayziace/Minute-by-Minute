"use client";

import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createEntryLocal, updateEntryLocal } from "@/lib/sync/engine";
import { queueFileUpload } from "@/lib/uploads/client";
import { generateId } from "@/lib/utils";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { VisibilityPicker } from "@/components/ui/VisibilityPicker";
import {
  DateTimeFields,
  combineDateTime,
  splitDateTime,
} from "@/components/ui/DateTimeFields";
import type { Visibility } from "@/lib/types";
import { db } from "@/lib/dexie/db";

function CapturePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const dateParam = params.get("date");
  const modeParam = params.get("mode");

  type CaptureMode = "hub" | "photo" | "video" | "thought" | "write" | "voice" | "location";
  const [mode, setMode] = useState<CaptureMode>(
    (modeParam as CaptureMode) ?? "hub",
  );
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "saving">("idle");
  const [captureDate, setCaptureDate] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return dateParam ?? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [captureTime, setCaptureTime] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const voiceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editId) return;
    void db.entries.get(editId).then((e) => {
      if (!e) return;
      setText(e.text ?? "");
      setLocation(e.locationName ?? "");
      setVisibility(e.visibility);
      const { date, time } = splitDateTime(e.recordedAt);
      setCaptureDate(date);
      setCaptureTime(time);
      setMode(e.text && e.text.length > 120 ? "write" : "thought");
    });
  }, [editId]);

  useEffect(() => {
    if (dateParam && !editId) setCaptureDate(dateParam);
  }, [dateParam, editId]);

  const recordedAtIso = useCallback(() => {
    return combineDateTime(captureDate, captureTime);
  }, [captureDate, captureTime]);

  async function saveEntry(opts: { text: string; location?: string }) {
    setSaving(true);
    setStatus("saving");
    const ts = recordedAtIso();
    if (editId) {
      await updateEntryLocal(editId, {
        text: opts.text,
        locationName: opts.location?.trim() || null,
        visibility,
        recordedAt: ts,
        recordedAtPrecision: "exact",
      });
    } else {
      const id = generateId();
      await createEntryLocal({
        id,
        userId: "local-user",
        recordedAt: ts,
        recordedAtPrecision: "exact",
        text: opts.text,
        moodNote: null,
        locationName: opts.location?.trim() || null,
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
    setSaving(false);
    const dayKey = captureDate;
    router.push(dateParam || dayKey ? `/days/${dateParam ?? dayKey}` : "/");
  }

  async function saveLocationOnly(name: string, lat?: number, lng?: number) {
    setSaving(true);
    const id = generateId();
    const ts = recordedAtIso();
    await createEntryLocal({
      id,
      userId: "local-user",
      recordedAt: ts,
      recordedAtPrecision: "exact",
      text: null,
      moodNote: null,
      locationName: name,
      locationLat: lat ?? null,
      locationLng: lng ?? null,
      locationAccuracy: lat ? 50 : null,
      locationPrivacy: lat ? "exact" : "approximate",
      visibility,
      source: "user",
      clientId: id,
      updatedAt: ts,
      createdAt: ts,
    });
    setSaving(false);
    router.push(dateParam || captureDate ? `/days/${dateParam ?? captureDate}` : "/");
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setSaving(true);
    for (const file of Array.from(files)) {
      const id = generateId();
      const ts = recordedAtIso();
      await createEntryLocal({
        id,
        userId: "local-user",
        recordedAt: ts,
        recordedAtPrecision: "exact",
        text: null,
        moodNote: null,
        locationName: location.trim() || null,
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
      await queueFileUpload(file, { entryId: id, toInbox: false });
    }
    setSaving(false);
    router.push(dateParam || captureDate ? `/days/${dateParam ?? captureDate}` : "/");
  }

  function captureGeolocation() {
    if (!navigator.geolocation) {
      void saveLocationOnly(location.trim() || "Somewhere");
      return;
    }
    setSaving(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const name = location.trim() || "Here";
        void saveLocationOnly(name, pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        void saveLocationOnly(location.trim() || "Somewhere");
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  useEffect(() => {
    if (modeParam === "write") {
      const q = new URLSearchParams();
      if (editId) q.set("edit", editId);
      if (dateParam) q.set("date", dateParam);
      router.replace(`/write${q.toString() ? `?${q}` : ""}`);
    }
  }, [modeParam, editId, dateParam, router]);

  if (modeParam === "write") return null;

  return (
    <StorybookShell>
      <div className="page-spread capture-spread memory-appear">
        <header className="page-spread__header capture-spread__header">
          <h1 className="spread-title spread-title--vivid">{editId ? "Edit moment" : "Capture"}</h1>
          <p className="spread-subtitle">
            Every moment counts — from right now or years ago. Set when and where, then add what happened.
          </p>
        </header>

        <div className="capture-spread__layout">
          <aside className="capture-spread__side">
            <div className="capture-hub__when paper-note paper-note--taped paper-note--lavender">
              <p className="storybook-widget__title">When & where</p>
              <DateTimeFields
                date={captureDate}
                time={captureTime}
                onDateChange={setCaptureDate}
                onTimeChange={setCaptureTime}
                location={location}
                onLocationChange={setLocation}
              />
            </div>
            <VisibilityPicker value={visibility} onChange={setVisibility} className="capture-spread__visibility" />
          </aside>

          <main className="capture-spread__main">
            {mode === "hub" && (
              <div className="capture-hub__grid">
                <button type="button" className="capture-hub__tile capture-hub__tile--rose" onClick={() => photoRef.current?.click()}>
                  <span className="capture-hub__icon">▣</span>
                  <span className="capture-hub__label">Photo</span>
                </button>
                <button type="button" className="capture-hub__tile capture-hub__tile--sky" onClick={() => videoRef.current?.click()}>
                  <span className="capture-hub__icon">▷</span>
                  <span className="capture-hub__label">Video</span>
                </button>
                <button type="button" className="capture-hub__tile capture-hub__tile--peach" onClick={() => setMode("thought")}>
                  <span className="capture-hub__icon">◦</span>
                  <span className="capture-hub__label">Quick thought</span>
                </button>
                <button type="button" className="capture-hub__tile capture-hub__tile--mint" onClick={() => router.push(`/write?date=${captureDate}`)}>
                  <span className="capture-hub__icon">✎</span>
                  <span className="capture-hub__label">Write</span>
                </button>
                <button type="button" className="capture-hub__tile capture-hub__tile--gold" onClick={() => voiceRef.current?.click()}>
                  <span className="capture-hub__icon">♪</span>
                  <span className="capture-hub__label">Voice</span>
                </button>
                <button type="button" className="capture-hub__tile capture-hub__tile--lavender" onClick={() => setMode("location")}>
                  <span className="capture-hub__icon">⌖</span>
                  <span className="capture-hub__label">Location</span>
                </button>
              </div>
            )}

            {(mode === "thought" || editId) && (
              <div className="capture-hub__panel paper-note paper-note--peach">
                <p className="storybook-widget__title">Your words</p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={mode === "thought" ? 4 : 8}
                  placeholder="What is happening?"
                  className="capture-hub__textarea"
                  autoFocus
                />
                <button
                  type="button"
                  disabled={saving || !text.trim()}
                  className="capture-hub__save capture-hub__save--vivid"
                  onClick={() => void saveEntry({ text: text.trim(), location })}
                >
                  {saving ? "Saving…" : editId ? "Update" : "Save moment"}
                </button>
                {status === "saved" && <p className="capture-hub__status">Saved</p>}
                {!editId && (
                  <button type="button" className="capture-hub__back" onClick={() => setMode("hub")}>
                    ← Back
                  </button>
                )}
              </div>
            )}

            {mode === "location" && (
              <div className="capture-hub__panel paper-note paper-note--mint">
                <p className="storybook-widget__title">Pin a place</p>
                <p className="capture-panel__hint">
                  Save where you are — type a name or use GPS for exact coordinates.
                </p>
                <button
                  type="button"
                  disabled={saving}
                  className="capture-hub__save capture-hub__save--vivid"
                  onClick={() => captureGeolocation()}
                >
                  {saving ? "Saving…" : "Save location"}
                </button>
                <button type="button" className="capture-hub__back" onClick={() => setMode("hub")}>
                  ← Back
                </button>
              </div>
            )}

            {saving && mode === "hub" && (
              <p className="capture-spread__saving">Uploading…</p>
            )}
          </main>
        </div>

        <input ref={photoRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
        <input ref={videoRef} type="file" accept="video/*" capture="environment" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
        <input ref={voiceRef} type="file" accept="audio/*" capture className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
      </div>
    </StorybookShell>
  );
}

export function CapturePage() {
  return (
    <EditModeGuard>
      <Suspense fallback={null}>
        <CapturePageInner />
      </Suspense>
    </EditModeGuard>
  );
}
