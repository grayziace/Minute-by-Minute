"use client";

import { usePathname } from "next/navigation";
import { useExperienceMode } from "@/lib/experience/mode";

export function ExperienceToggle() {
  const pathname = usePathname();
  const { mode, setMode, isOwner, viewLocked } = useExperienceMode();

  if (pathname.startsWith("/login")) return null;

  /** Only the signed-in owner can switch modes */
  if (!isOwner || viewLocked) return null;

  return (
    <div className="experience-toggle" aria-label="Edit or preview visitor view">
      <button
        type="button"
        onClick={() => setMode("edit")}
        className={`experience-toggle__link ${mode === "edit" ? "experience-toggle__link--active" : ""}`}
        title="Your editing view — capture and organise"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => setMode("view")}
        className={`experience-toggle__link ${mode === "view" ? "experience-toggle__link--active" : ""}`}
        title="Preview what family and friends see"
      >
        Visitor view
      </button>
    </div>
  );
}
