"use client";

import { useRef, useState } from "react";
import { createEntryLocal } from "@/lib/sync/engine";
import { queueFileUpload } from "@/lib/uploads/client";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import {
  DateTimeFields,
  combineDateTime,
  splitDateTime,
} from "@/components/ui/DateTimeFields";
import { VisibilityPicker } from "@/components/ui/VisibilityPicker";
import { useExperienceMode } from "@/lib/experience/mode";
import { useFrameFavourites, useFrameGallery } from "@/lib/frame-favourites";
import { formatDayHeading, generateId } from "@/lib/utils";
import type { Visibility } from "@/lib/types";

export function FramePage() {
  return <FramePageInner />;
}

function FramePageInner() {
  const { isViewMode, canEdit } = useExperienceMode();
  const gallery = useFrameGallery(isViewMode);
  const { add, update, remove } = useFrameFavourites();
  const fileRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const [adding, setAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [captureDate, setCaptureDate] = useState(today);
  const [captureTime, setCaptureTime] = useState(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAddPhoto(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const file = files[0];
    const ts = combineDateTime(captureDate, captureTime);
    const entryId = generateId();

    await createEntryLocal({
      id: entryId,
      userId: "local-user",
      recordedAt: ts,
      recordedAtPrecision: "exact",
      text: description.trim() || null,
      moodNote: null,
      locationName: location.trim() || null,
      locationLat: null,
      locationLng: null,
      locationAccuracy: null,
      locationPrivacy: "approximate",
      visibility,
      source: "user",
      clientId: entryId,
      updatedAt: ts,
      createdAt: ts,
    });

    const asset = await queueFileUpload(file, { entryId, toInbox: false });
    await add({
      entryId,
      mediaAssetId: asset.id,
      description: description.trim(),
      locationName: location.trim(),
      recordedAt: ts,
    });

    setDescription("");
    setLocation("");
    setAdding(false);
    setBusy(false);
  }

  async function saveEdit(id: string, desc: string, loc: string, date: string, time: string) {
    const item = gallery?.find((g) => g.id === id);
    if (!item) return;
    const ts = combineDateTime(date, time);
    await update(id, {
      description: desc,
      locationName: loc,
      recordedAt: ts,
    });
    setEditingId(null);
  }

  return (
    <StorybookShell>
      <div className="page-spread frame-spread memory-appear">
        <header className="page-spread__header">
          <h1 className="spread-title spread-title--vivid">Frame</h1>
          <p className="spread-subtitle">
            Your favourite photographs — a living wall of the moments you love most.
          </p>
          {canEdit && (
            <button
              type="button"
              className="frame-spread__add-btn"
              onClick={() => setAdding((v) => !v)}
            >
              {adding ? "Close" : "+ Add to wall"}
            </button>
          )}
        </header>

        {adding && canEdit && (
          <section className="frame-add paper-note paper-note--taped paper-note--blush">
            <p className="storybook-widget__title">New favourite</p>
            <div className="frame-add__layout">
              <div className="frame-add__upload">
                <button
                  type="button"
                  className="frame-add__dropzone"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="frame-add__dropzone-icon">▣</span>
                  <span>{busy ? "Adding…" : "Choose a photo"}</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleAddPhoto(e.target.files)}
                />
              </div>
              <div className="frame-add__meta">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What makes this moment special?"
                  className="frame-add__textarea"
                />
                <DateTimeFields
                  date={captureDate}
                  time={captureTime}
                  onDateChange={setCaptureDate}
                  onTimeChange={setCaptureTime}
                  location={location}
                  onLocationChange={setLocation}
                />
                <VisibilityPicker value={visibility} onChange={setVisibility} className="mt-3" />
              </div>
            </div>
          </section>
        )}

        <div className="frame-mosaic">
          {gallery?.map((item, i) => {
            const { date, time } = splitDateTime(item.recordedAt);
            const isEditing = editingId === item.id;

            return (
              <article
                key={item.id}
                className="frame-mosaic__item polaroid polaroid--vivid"
                style={{ transform: `rotate(${(i % 7 - 3) * 2.2}deg)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.media!.localBlobUrl!}
                  alt={item.description || "Favourite"}
                  className="frame-mosaic__img"
                />
                {isEditing && canEdit ? (
                  <FrameEditForm
                    description={item.description}
                    location={item.locationName}
                    date={date}
                    time={time}
                    onSave={(d, l, dt, tm) => void saveEdit(item.id, d, l, dt, tm)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="frame-mosaic__caption">
                    {item.description && <p className="frame-mosaic__desc">{item.description}</p>}
                    <p className="frame-mosaic__when">
                      {formatDayHeading(`${date}T12:00:00`)} · {time}
                    </p>
                    {item.locationName && (
                      <p className="frame-mosaic__where">{item.locationName}</p>
                    )}
                    {canEdit && (
                      <div className="frame-mosaic__actions">
                        <button type="button" onClick={() => setEditingId(item.id)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => void remove(item.id)}>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {!gallery?.length && (
          <div className="frame-empty paper-note paper-note--sky">
            <p className="frame-empty__title">Your wall is waiting</p>
            <p className="frame-empty__text">
              Add photos you love — with a description, place, and the exact moment they happened.
            </p>
          </div>
        )}
      </div>
    </StorybookShell>
  );
}

function FrameEditForm({
  description,
  location,
  date,
  time,
  onSave,
  onCancel,
}: {
  description: string;
  location: string;
  date: string;
  time: string;
  onSave: (desc: string, loc: string, date: string, time: string) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState(description);
  const [l, setL] = useState(location);
  const [dt, setDt] = useState(date);
  const [tm, setTm] = useState(time);

  return (
    <div className="frame-mosaic__edit">
      <textarea value={d} onChange={(e) => setD(e.target.value)} rows={2} className="frame-add__textarea" />
      <DateTimeFields
        date={dt}
        time={tm}
        onDateChange={setDt}
        onTimeChange={setTm}
        location={l}
        onLocationChange={setL}
      />
      <div className="frame-mosaic__actions">
        <button type="button" onClick={() => onSave(d, l, dt, tm)}>
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
