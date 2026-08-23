"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useExperienceMode } from "@/lib/experience/mode";

const EDIT_NAV = [
  { href: "/", label: "Now" },
  { href: "/timeline", label: "Timeline" },
  { href: "/inbox", label: "Inbox" },
  { href: "/scrapbook", label: "Scrapbook" },
  { href: "/archive", label: "More" },
];

const VIEW_NAV = [
  { href: "/", label: "Now" },
  { href: "/timeline", label: "Timeline" },
  { href: "/scrapbook", label: "Scrapbook" },
  { href: "/chapters", label: "Chapters" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isViewMode } = useExperienceMode();
  const onNow = pathname === "/";

  const hideNav =
    pathname.startsWith("/login") ||
    pathname.startsWith("/add") ||
    /\/timeline\/\d{4}-\d{2}-\d{2}$/.test(pathname) ||
    /\/scrapbook\/\d{4}-\d{2}-\d{2}$/.test(pathname);

  if (hideNav) return null;

  const items = isViewMode ? VIEW_NAV : EDIT_NAV;

  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] transition-all duration-700",
        isViewMode && !onNow && "opacity-50 hover:opacity-90",
        onNow && isViewMode && "opacity-60 hover:opacity-95",
      )}
    >
      <div className="mx-auto w-full max-w-none px-4 pb-3 md:px-8">
        <div
          className={cn(
            "flex items-stretch justify-around rounded-full px-2 py-1 transition-all duration-700",
            onNow
              ? "ethereal-nav__bar mx-auto max-w-2xl"
              : isViewMode
                ? "mx-auto max-w-md rounded-full bg-black/20 backdrop-blur-md"
                : "glass-strong mx-auto max-w-2xl",
          )}
        >
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[44px] flex-1 flex-col items-center justify-center px-1 py-2",
                  "text-[9px] uppercase tracking-[0.14em] transition-all duration-300",
                  onNow
                    ? cn(
                        "ethereal-nav__link",
                        active && "ethereal-nav__link--active",
                      )
                    : active
                      ? isViewMode
                        ? "text-white/80"
                        : "text-ice-deep"
                      : isViewMode
                        ? "text-white/35 hover:text-white/60"
                        : "text-muted hover:text-foreground-soft",
                )}
              >
                {active && (
                  <span
                    className={cn(
                      "mb-1 h-1 w-1 rounded-full",
                      onNow
                        ? "ethereal-nav__dot"
                        : isViewMode
                          ? "bg-white/60"
                          : "bg-ice shadow-[0_0_8px_var(--glow-ice)]",
                    )}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
