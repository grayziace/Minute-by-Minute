"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExperienceMode } from "@/lib/experience/mode";
import { cn } from "@/lib/utils";

export function FloatingAddButton() {
  const pathname = usePathname();
  const { isEditMode } = useExperienceMode();
  const onNow = pathname === "/";

  const hide =
    !isEditMode ||
    pathname.startsWith("/add") ||
    pathname.startsWith("/login") ||
    /\/timeline\/\d{4}-\d{2}-\d{2}$/.test(pathname) ||
    /\/scrapbook\/\d{4}-\d{2}-\d{2}$/.test(pathname);

  if (hide) return null;

  return (
    <Link
      href="/add"
      aria-label="Add something"
      className={cn(
        "edit-only halo-ring fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-50",
        "flex h-14 w-14 items-center justify-center rounded-full text-2xl font-light",
        "transition-all duration-500 hover:scale-105 active:scale-95 md:right-8",
        onNow
          ? "ethereal-add"
          : "border border-white/20 bg-white/10 text-white/90 shadow-[0_8px_40px_rgba(140,190,240,0.2)] backdrop-blur-xl",
      )}
    >
      +
    </Link>
  );
}
