"use client";

import type { Visibility } from "@/lib/types";
import { useExperienceMode } from "@/lib/experience/mode";
import { VISIBILITY_LABELS } from "@/lib/entries-helpers";
import { cn } from "@/lib/utils";

const OPTIONS: Visibility[] = ["private", "shared", "unlisted"];

interface VisibilityPickerProps {
  value: Visibility;
  onChange: (v: Visibility) => void | Promise<void>;
  className?: string;
}

export function VisibilityPicker({ value, onChange, className }: VisibilityPickerProps) {
  const { canEdit } = useExperienceMode();

  if (!canEdit) {
    if (value === "shared" || value === "public") return null;
    return null;
  }

  return (
    <div className={cn("visibility-picker", className)} role="group" aria-label="Who can see this">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          className={cn(
            "visibility-picker__opt",
            value === opt && "visibility-picker__opt--active",
          )}
          onClick={() => void onChange(opt)}
          aria-pressed={value === opt}
          title={
            opt === "private"
              ? "Only you"
              : opt === "shared"
                ? "Visible in visitor mode"
                : "In your archive, hidden from visitors"
          }
        >
          {VISIBILITY_LABELS[opt]}
        </button>
      ))}
    </div>
  );
}
