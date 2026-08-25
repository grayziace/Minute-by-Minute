"use client";

import { EtherealWorld, type EtherealPhase } from "@/components/ui/EtherealWorld";
import { SparkleField } from "@/components/ui/SparkleField";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  layout?: "full" | "narrow" | "immersive-scroll";
  memoryUrl?: string | null;
  memoryIsVideo?: boolean;
  etherealPhase?: EtherealPhase;
  sparkles?: boolean;
  variant?: "pearl" | "moon";
}

export function PageShell({
  children,
  className,
  layout = "narrow",
  memoryUrl,
  memoryIsVideo,
  etherealPhase = "open",
  sparkles = true,
  variant = "pearl",
}: PageShellProps) {
  const isFull = layout === "full" || layout === "immersive-scroll";

  return (
    <div className={cn("relative min-h-[100dvh] w-full", isFull && "overflow-x-hidden")}>
      {isFull ? (
        <>
          <EtherealWorld
            phase={etherealPhase}
            memoryUrl={memoryUrl}
            memoryIsVideo={memoryIsVideo}
            variant={variant}
          />
          {sparkles && <SparkleField />}
        </>
      ) : (
        <div className="ethereal-atmosphere fixed inset-0 -z-10" aria-hidden>
          <div className="ethereal-atmosphere__orb ethereal-atmosphere__orb--ice" />
          <div className="ethereal-atmosphere__orb ethereal-atmosphere__orb--blush" />
          <div className="ethereal-atmosphere__orb ethereal-atmosphere__orb--gold" />
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
