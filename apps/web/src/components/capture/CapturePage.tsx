"use client";

import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createEntryLocal, updateEntryLocal } from "@/lib/sync/engine";
import { queueFileUpload } from "@/lib/uploads/client";
import { generateId, nowIso } from "@/lib/utils";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { VisibilityPicker } from "@/components/ui/VisibilityPicker";
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
      setMode(e.text && e.text.length > 120 ? "write" : "thought");
    });
  }, [editId]);

  const recordedAtForDay = useCallback(() => {
    if (!dateParam) return nowIso();
    return `${dateParam}T12:00:00.000Z`;
  }, [dateParam]);

  async function saveEntry(opts: { text: string; location?: string }) {
    setSaving(true);
    setStatus("saving");
    const now = editId ? undefined : recordedAtForDay();
    if (editId) {
      await updateEntryLocal(editId, {
        text: opts.text,
        locationName: opts.location?.trim() || null,
        visibility,
      });
    } else {
      const id = generateId();
      const ts = now ?? nowIso();
      await createEntryLocal({
        id,
        userId: "local-user",
        recordedAt: ts,
        recordedAtPrecision: dateParam ? "approximate" : "exact",
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
    router.push(dateParam ? `/days/${dateParam}` : "/");
  }

  async function saveLocationOnly(name: string, lat?: number, lng?: number) {
    setSaving(true);
    const id = generateId();
    const ts = recordedAtForDay();
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
    router.push(dateParam ? `/days/${dateParam}` : "/");
  }

  async function handleFiles(files: FileList | null, kind: "photo" | "video" | "voice") {
    if (!files?.length) return;
    setSaving(true);
    for (const file of Array.from(files)) {
      const id = generateId();
      const ts = recordedAtForDay();
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
    router.push(dateParam ? `/days/${dateParam}` : "/");
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
      <div className="capture-hub memory-appear">
        <header className="capture-hub__header">
          <h1 className="spread-title">{editId ? "Edit moment" : "Capture"}</h1>
          <p className="spread-subtitle">What is happening right now?</p>
        </header>

        {mode === "hub" && (
          <div className="capture-hub__grid">
            <button type="button" className="capture-hub__tile" onClick={() => photoRef.current?.click()}>
              <span className="capture-hub__icon">▣</span>
              <span className="capture-hub__label">Photo</span>
            </button>
            <button type="button" className="capture-hub__tile" onClick={() => videoRef.current?.click()}>
              <span className="capture-hub__icon">▷</span>
              <span className="capture-hub__label">Video</span>
            </button>
            <button type="button" className="capture-hub__tile" onClick={() => setMode("thought")}>
              <span className="capture-hub__icon">◦</span>
              <span className="capture-hub__label">Quick thought</span>
            </button>
            <button type="button" className="capture-hub__tile" onClick={() => router.push(`/write${dateParam ? `?date=${dateParam}` : ""}`)}>
              <span className="capture-hub__icon">✎</span>
              <span className="capture-hub__label">Write</span>
            </button>
            <button type="button" className="capture-hub__tile" onClick={() => voiceRef.current?.click()}>
              <span className="capture-hub__icon">♪</span>
              <span className="capture-hub__label">Voice</span>
            </button>
            <button type="button" className="capture-hub__tile" onClick={() => setMode("location")}>
              <span className="capture-hub__icon">⌖</span>
              <span className="capture-hub__label">Location</span>
            </button>
          </div>
        )}

        {(mode === "thought" || editId) && (
          <div className="capture-hub__panel paper-note">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={mode === "thought" ? 3 : 6}
              placeholder="What is happening?"
              className="capture-hub__textarea"
              autoFocus
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="capture-hub__location"
            />
            <VisibilityPicker value={visibility} onChange={setVisibility} className="mt-3" />
            <button
              type="button"
              disabled={saving || !text.trim()}
              className="capture-hub__save"
              onClick={() => void saveEntry({ text: text.trim(), location })}
            >
              {saving ? "Saving…" : editId ? "Update" : "Save moment"}
            </button>
            {status === "saved" && <p className="capture-hub__status">Saved</p>}
          </div>
        )}

        {mode === "location" && (
          <div className="capture-hub__panel paper-note">
            <p className="text-sm text-[var(--ink-soft)] mb-3">
              Save where you are. Exact GPS is optional — you can type a place name only.
            </p>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Huadu, Guangzhou"
              className="capture-hub__location"
            />
            <VisibilityPicker value={visibility} onChange={setVisibility} className="mt-3" />
            <button
              type="button"
              disabled={saving}
              className="capture-hub__save"
              onClick={() => captureGeolocation()}
            >
              {saving ? "Saving…" : "Save location"}
            </button>
          </div>
        )}

        {(mode === "hub" || mode === "photo" || mode === "video" || mode === "voice") && (
          <VisibilityPicker value={visibility} onChange={setVisibility} className="capture-hub__visibility" />
        )}

        <input ref={photoRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files, "photo")} />
        <input ref={videoRef} type="file" accept="video/*" capture="environment" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files, "video")} />
        <input ref={voiceRef} type="file" accept="audio/*" capture className="hidden" onChange={(e) => void handleFiles(e.target.files, "voice")} />
      </div>
    </StorybookShell>
  );
}

export function CapturePage() {
  return (
    <EditModeGuard>
      <CapturePageInner />
    </EditModeGuard>
  );
}
