"use client";

import { BookNav } from "@/components/storybook/BookNav";

interface StorybookShellProps {
  children: React.ReactNode;
}

export function StorybookShell({ children }: StorybookShellProps) {
  return (
    <div className="storybook">
      <BookNav />
      <div className="storybook__page">
        <div className="storybook__content">{children}</div>
      </div>
    </div>
  );
}
