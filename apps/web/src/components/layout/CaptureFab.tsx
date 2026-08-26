"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExperienceMode } from "@/lib/experience/mode";

export function CaptureFab() {
  const pathname = usePathname();
  const { canEdit } = useExperienceMode();

  if (!canEdit) return null;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/add") ||
    pathname.startsWith("/write")
  ) {
    return null;
  }

  return (
    <Link href="/add" className="capture-fab edit-only" title="Capture a moment" aria-label="Capture a moment">
      <span className="capture-fab__ring" aria-hidden />
      <span className="capture-fab__icon" aria-hidden>+</span>
    </Link>
  );
}
