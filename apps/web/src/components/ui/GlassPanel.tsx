"use client";

import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}

export function GlassPanel({ children, className, strong }: GlassPanelProps) {
  return (
    <div className={cn(strong ? "glass-strong" : "glass", "rounded-sm", className)}>
      {children}
    </div>
  );
}
