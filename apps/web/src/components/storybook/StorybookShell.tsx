"use client";

import { BookNav } from "@/components/storybook/BookNav";
import { LensRibbon } from "@/components/storybook/LensRibbon";
import { useExperienceMode } from "@/lib/experience/mode";
import { cn } from "@/lib/utils";

interface StorybookShellProps {
  children: React.ReactNode;
}

export function StorybookShell({ children }: StorybookShellProps) {
  const { mode } = useExperienceMode();

  return (
    <div className={cn("storybook", mode === "view" && "storybook--reading")}>
      <BookNav />
      <div className="storybook__page" data-lens={mode}>
        <LensRibbon />
        <div className="storybook__content">{children}</div>
      </div>
    </div>
  );
}
