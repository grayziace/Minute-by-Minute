"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useExperienceMode } from "@/lib/experience/mode";

const NAV = [
  { href: "/", label: "Now" },
  { href: "/days", label: "Days" },
  { href: "/create", label: "Create" },
  { href: "/frame", label: "Frame" },
  { href: "/me", label: "Me" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isViewMode } = useExperienceMode();
  const onNow = pathname === "/";

  const hideNav =
    pathname.startsWith("/login") ||
    pathname.startsWith("/add") ||
    /\/days\/\d{4}-\d{2}-\d{2}$/.test(pathname) ||
    /\/timeline\/\d{4}-\d{2}-\d{2}$/.test(pathname);

  if (hideNav) return null;

  return (
    <nav
      className={cn(
        "ethereal-nav fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]",
        isViewMode && "ethereal-nav--view",
      )}
    >
      <div className="ethereal-nav__reflect" aria-hidden />
      <div className="mx-auto max-w-xl px-6 pb-3">
        <div className={cn("ethereal-nav__bar", onNow && "ethereal-nav__bar--now")}>
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "ethereal-nav__link",
                  active && "ethereal-nav__link--active",
                )}
              >
                {active && <span className="ethereal-nav__pool" aria-hidden />}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
