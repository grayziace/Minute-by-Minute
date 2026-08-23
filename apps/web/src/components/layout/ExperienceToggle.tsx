"use client";

import { usePathname } from "next/navigation";
import { useExperienceMode } from "@/lib/experience/mode";
import { cn } from "@/lib/utils";

export function ExperienceToggle() {
  const pathname = usePathname();
  const { mode, setMode } = useExperienceMode();
  const onNow = pathname === "/";

  return (
    <div
      className={cn(
        "experience-toggle fixed top-[max(1rem,env(safe-area-inset-top))] right-5 z-50",
        onNow && "experience-toggle--on-now",
      )}
    >
      <button
        type="button"
        onClick={() => setMode("edit")}
        className={cn(
          "experience-toggle__link",
          mode === "edit" && "experience-toggle__link--active",
        )}
      >
        Archive
      </button>
      <button
        type="button"
        onClick={() => setMode("view")}
        className={cn(
          "experience-toggle__link",
          mode === "view" && "experience-toggle__link--active",
        )}
      >
        Experience
      </button>
    </div>
  );
}
