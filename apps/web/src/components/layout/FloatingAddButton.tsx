"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExperienceMode } from "@/lib/experience/mode";
import { cn } from "@/lib/utils";

export function FloatingAddButton() {
  const pathname = usePathname();
  const { isEditMode } = useExperienceMode();

  const hide =
    !isEditMode ||
    pathname === "/" ||
    pathname.startsWith("/add") ||
    pathname.startsWith("/login") ||
    /\/days\/\d{4}-\d{2}-\d{2}$/.test(pathname) ||
    /\/timeline\/\d{4}-\d{2}-\d{2}$/.test(pathname);

  if (hide) return null;

  return (
    <Link
      href="/add"
      aria-label="Add something"
      className={cn(
        "edit-only capture-orb capture-orb--fab fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-50 md:right-8",
      )}
    >
      <span className="capture-orb__visual">
        <span className="capture-orb__ring capture-orb__ring--outer" aria-hidden />
        <span className="capture-orb__core" aria-hidden />
      </span>
    </Link>
  );
}
