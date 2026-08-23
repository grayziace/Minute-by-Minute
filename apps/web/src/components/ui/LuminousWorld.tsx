"use client";

export type LuminousPhase = "open" | "awakening" | "filled";

interface LuminousWorldProps {
  phase?: LuminousPhase;
  /** Very faint memory wash — light only, never dark */
  memoryUrl?: string | null;
  memoryIsVideo?: boolean;
}

export function LuminousWorld({
  phase = "open",
  memoryUrl,
  memoryIsVideo,
}: LuminousWorldProps) {
  return (
    <div className="luminous-world" aria-hidden data-phase={phase}>
      {/* Pearl ground */}
      <div className="luminous-world__ground" />

      {/* Central bloom — dominant white light */}
      <div className="luminous-world__bloom" />

      {/* Cloud-like mist masses */}
      <div className="luminous-world__cloud luminous-world__cloud--a" />
      <div className="luminous-world__cloud luminous-world__cloud--b" />
      <div className="luminous-world__cloud luminous-world__cloud--c" />

      {/* Ice-blue and blush haze layers */}
      <div className="luminous-world__haze luminous-world__haze--ice" />
      <div className="luminous-world__haze luminous-world__haze--blush" />
      <div className="luminous-world__haze luminous-world__haze--lavender" />

      {/* Light rays from above */}
      <div className="luminous-world__rays" />

      {/* Reflective water band */}
      <div className="luminous-world__water">
        <div className="luminous-world__water-shimmer" />
      </div>

      {/* Distant memory as light wash */}
      {memoryUrl && (
        <div className="luminous-world__memory-wash">
          {memoryIsVideo ? (
            <video src={memoryUrl} className="h-full w-full object-cover" muted autoPlay loop playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memoryUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}

      {/* Soft peripheral depth — edges only, not centre */}
      <div className="luminous-world__periphery" />

      {/* Fine haze grain */}
      <div className="luminous-world__grain" />
    </div>
  );
}
