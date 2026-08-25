"use client";

import { useExperienceMode } from "@/lib/experience/mode";

export function ViewModeBanner() {
  const { isViewMode, isOwner, viewLocked } = useExperienceMode();

  if (!isViewMode) return null;
  if (isOwner && !viewLocked) return null;

  const message = viewLocked
    ? "You are reading this archive — moments shared for you."
    : "Viewing shared moments.";

  return (
    <div className="view-banner" role="status">
      <p className="view-banner__text">{message}</p>
    </div>
  );
}
