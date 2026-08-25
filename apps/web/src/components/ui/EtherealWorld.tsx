"use client";

export type EtherealPhase = "open" | "awakening" | "filled";

interface EtherealWorldProps {
  phase?: EtherealPhase;
  memoryUrl?: string | null;
  memoryIsVideo?: boolean;
  variant?: "pearl" | "moon";
}

export function EtherealWorld({
  phase = "open",
  memoryUrl,
  memoryIsVideo,
  variant = "pearl",
}: EtherealWorldProps) {
  return (
    <div className="ethereal-world" aria-hidden data-phase={phase} data-variant={variant}>
      <div className="ethereal-world__base" />
      <div className="ethereal-world__depth-blue" />
      <div className="ethereal-world__bloom" />
      <div className="ethereal-world__god-rays" />
      <div className="ethereal-world__mist ethereal-world__mist--pink" />
      <div className="ethereal-world__mist ethereal-world__mist--lavender" />
      <div className="ethereal-world__mist ethereal-world__mist--gold" />
      <div className="ethereal-world__orb ethereal-world__orb--a" />
      <div className="ethereal-world__orb ethereal-world__orb--b" />
      <div className="ethereal-world__orb ethereal-world__orb--c" />
      <div className="ethereal-world__iridescent" />
      <div className="ethereal-world__water">
        <div className="ethereal-world__water-shimmer" />
      </div>
      {memoryUrl && (
        <div className="ethereal-world__memory-wash">
          {memoryIsVideo ? (
            <video src={memoryUrl} className="h-full w-full object-cover" muted autoPlay loop playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memoryUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}
      <div className="ethereal-world__floaters" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="ethereal-world__floater" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="ethereal-world__grain" />
      <div className="ethereal-world__vignette-soft" />
    </div>
  );
}
