"use client";

import { LuminousWorld, type LuminousPhase } from "@/components/ui/LuminousWorld";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  layout?: "full" | "narrow" | "immersive-scroll";
  memoryUrl?: string | null;
  memoryIsVideo?: boolean;
  luminousPhase?: LuminousPhase;
}

export function PageShell({
  children,
  className,
  layout = "narrow",
  memoryUrl,
  memoryIsVideo,
  luminousPhase = "open",
}: PageShellProps) {
  const isFull = layout === "full" || layout === "immersive-scroll";

  return (
    <div className={cn("relative min-h-[100dvh] w-full", isFull && "overflow-x-hidden")}>
      {isFull ? (
        <LuminousWorld
          phase={luminousPhase}
          memoryUrl={memoryUrl}
          memoryIsVideo={memoryIsVideo}
        />
      ) : (
        <div className="angel-atmosphere fixed inset-0 -z-10" aria-hidden>
          <div className="angel-orb angel-orb--ice h-[320px] w-[320px] -left-20 top-0" />
          <div className="angel-orb angel-orb--blush h-[280px] w-[280px] -right-16 top-32" />
          <div className="angel-orb angel-orb--lavender h-[360px] w-[360px] bottom-0 left-1/3" />
        </div>
      )}

      <div
        className={cn(
          "relative w-full",
          layout === "full" && "min-h-[100dvh]",
          layout === "immersive-scroll" && "min-h-[100dvh] pb-24",
          layout === "narrow" && "mx-auto min-h-screen max-w-lg px-5 pb-32 pt-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
