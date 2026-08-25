"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useExperienceMode } from "@/lib/experience/mode";

const VIEW_TABS = [
  { href: "/", label: "Now", desc: "the present moment", icon: "◷" },
  { href: "/days", label: "Days", desc: "life archive", icon: "☰" },
  { href: "/frame", label: "Frame", desc: "favourite photos", icon: "▣" },
  { href: "/video", label: "Video", desc: "video diary", icon: "▷" },
  { href: "/story", label: "Story", desc: "manga & stories", icon: "✦" },
  { href: "/me", label: "Me", desc: "reflections", icon: "☽" },
];

const EDIT_TABS = [
  ...VIEW_TABS.slice(0, 5),
  { href: "/characters", label: "Cast", desc: "characters", icon: "◎" },
  VIEW_TABS[5],
];

export function BookNav() {
  const pathname = usePathname();
  const { isViewMode } = useExperienceMode();

  const hide =
    pathname.startsWith("/login") ||
    pathname.startsWith("/add") ||
    /\/days\/\d{4}-\d{2}-\d{2}$/.test(pathname);

  if (hide) return null;

  const tabs = isViewMode ? VIEW_TABS : EDIT_TABS;

  return (
    <nav className="storybook__nav" aria-label="Book sections">
      {tabs.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn("book-tab", active && "book-tab--active")}
          >
            <span className="book-tab__icon" aria-hidden>{tab.icon}</span>
            <span className="book-tab__label">{tab.label}</span>
            <span className="book-tab__desc">{tab.desc}</span>
          </Link>
        );
      })}
      <div className="book-tab__avatar hidden md:block" aria-hidden>
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <circle cx="20" cy="20" r="20" fill="#e8dce8" />
          <ellipse cx="20" cy="22" rx="10" ry="12" fill="#f0e8f0" />
          <ellipse cx="20" cy="14" rx="12" ry="8" fill="#d8c8e0" />
        </svg>
      </div>
    </nav>
  );
}
