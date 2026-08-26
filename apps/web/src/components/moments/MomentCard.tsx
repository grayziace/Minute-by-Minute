"use client";

import Link from "next/link";
import { useState } from "react";
import type { Entry, MediaAsset } from "@/lib/types";
import { EditableText } from "@/components/ui/EditableText";
import { VisibilityPicker } from "@/components/ui/VisibilityPicker";
import { DateTimeFields, combineDateTime, splitDateTime } from "@/components/ui/DateTimeFields";
import { useExperienceMode } from "@/lib/experience/mode";
import { patchEntry, removeEntry, momentKind } from "@/lib/entries-helpers";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MomentCardProps {
  entry: Entry;
  media?: MediaAsset[];
  variant?: "note" | "photo" | "hero";
}

const KIND_LABEL: Record<string, string> = {
  photo: "Photograph",
  video: "Video",
  voice: "Voice",
  thought: "Thought",
  writing: "Writing",
  location: "Place",
};

export function MomentCard({ entry, media, variant = "note" }: MomentCardProps) {
  const { canEdit } = useExperienceMode();
  const [editingWhen, setEditingWhen] = useState(false);
  const initial = splitDateTime(entry.recordedAt);
  const [momentDate, setMomentDate] = useState(initial.date);
  const [momentTime, setMomentTime] = useState(initial.time);
  const kind = momentKind(entry, media);
  const image = media?.find((m) => m.mimeType.startsWith("image/"));
  const video = media?.find((m) => m.mimeType.startsWith("video/"));
  const audio = media?.find((m) => m.mimeType.startsWith("audio/"));

  async function setVisibility(v: typeof entry.visibility) {
    await patchEntry(entry.id, { visibility: v });
  }

  async function saveWhen() {
    await patchEntry(entry.id, {
      recordedAt: combineDateTime(momentDate, momentTime),
    });
    setEditingWhen(false);
  }

  return (
    <article
      className={cn(
        "moment-card",
        variant === "hero" && "moment-card--hero",
        variant === "photo" && "moment-card--photo",
        `moment-card--${kind}`,
      )}
    >
      <header className="moment-card__head">
        {editingWhen && canEdit ? (
          <div className="moment-card__when-edit">
            <DateTimeFields
              date={momentDate}
              time={momentTime}
              onDateChange={setMomentDate}
              onTimeChange={setMomentTime}
              location={entry.locationName ?? ""}
              onLocationChange={() => {}}
              showLocation={false}
            />
            <button type="button" className="moment-card__link" onClick={() => void saveWhen()}>
              Save time
            </button>
          </div>
        ) : (
          <>
            <time className="moment-card__time">{formatTime(entry.recordedAt)}</time>
            {canEdit && (
              <button
                type="button"
                className="moment-card__when-btn"
                onClick={() => setEditingWhen(true)}
              >
                Change
              </button>
            )}
          </>
        )}
        <span className="moment-card__kind">{KIND_LABEL[kind] ?? "Moment"}</span>
      </header>

      {image?.localBlobUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.localBlobUrl} alt="" className="moment-card__img" />
      )}

      {video?.localBlobUrl && (
        <video
          src={video.localBlobUrl}
          controls
          className="moment-card__video"
          preload="metadata"
        />
      )}

      {audio?.localBlobUrl && (
        <audio src={audio.localBlobUrl} controls className="moment-card__audio" preload="metadata" />
      )}

      {(entry.text || canEdit) && (
        <EditableText
          value={entry.text ?? ""}
          onSave={(text) => patchEntry(entry.id, { text })}
          placeholder={kind === "thought" ? "A quick thought…" : "What happened?"}
          className={cn(
            "moment-card__text",
            kind === "thought" && "moment-card__text--thought",
          )}
          multiline={kind === "writing"}
        />
      )}

      <EditableText
        value={entry.locationName ?? ""}
        onSave={(locationName) => patchEntry(entry.id, { locationName })}
        placeholder="Location"
        className="moment-card__location"
        as="span"
      />

      {canEdit && (
        <footer className="moment-card__foot edit-only">
          <VisibilityPicker value={entry.visibility} onChange={setVisibility} />
          <div className="moment-card__actions">
            <Link href={`/add?edit=${entry.id}`} className="moment-card__link">
              Edit
            </Link>
            <button
              type="button"
              className="moment-card__link moment-card__link--danger"
              onClick={() => {
                if (confirm("Remove this moment from your archive?")) {
                  void removeEntry(entry.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </footer>
      )}
    </article>
  );
}
