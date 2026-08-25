"use client";

interface IllustratedSceneProps {
  mediaUrl?: string | null;
  isVideo?: boolean;
}

/** Painterly placeholder scene — arches, water, sky. Replaced by user photo when present. */
export function IllustratedScene({ mediaUrl, isVideo }: IllustratedSceneProps) {
  if (mediaUrl) {
    return (
      <div className="illustrated-scene relative">
        {isVideo ? (
          <video
            src={mediaUrl}
            className="illustrated-scene__media"
            muted
            autoPlay
            loop
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl} alt="" className="illustrated-scene__media memory-resolve" />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(255,250,240,0.15) 0%, transparent 40%, rgba(244,234,216,0.2) 100%)",
          }}
        />
      </div>
    );
  }

  return (
    <svg
      className="illustrated-scene"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8dce8" />
          <stop offset="40%" stopColor="#f0e0e8" />
          <stop offset="70%" stopColor="#f8e8d8" />
          <stop offset="100%" stopColor="#e8eef8" />
        </linearGradient>
        <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8d8e8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a8c0d8" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="arch" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f4f0" />
          <stop offset="100%" stopColor="#e0d8d0" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#sky)" />
      {/* Water */}
      <rect x="0" y="320" width="800" height="180" fill="url(#water)" opacity="0.7" />
      <ellipse cx="400" cy="340" rx="350" ry="20" fill="#fff" opacity="0.3" style={{ animation: "water-shimmer 4s ease-in-out infinite" }} />
      {/* Distant arches */}
      <path d="M120 320 L120 180 Q200 80 280 180 L280 320 Z" fill="url(#arch)" opacity="0.85" />
      <path d="M280 320 L280 140 Q400 40 520 140 L520 320 Z" fill="url(#arch)" />
      <path d="M520 320 L520 180 Q600 80 680 180 L680 320 Z" fill="url(#arch)" opacity="0.85" />
      {/* Reflection */}
      <path d="M280 320 L280 380 Q400 420 520 380 L520 320 Z" fill="#b8cce0" opacity="0.35" />
      {/* Lilies */}
      <ellipse cx="180" cy="300" rx="8" ry="20" fill="#fff" opacity="0.9" transform="rotate(-15 180 300)" />
      <ellipse cx="620" cy="290" rx="6" ry="16" fill="#fff" opacity="0.85" transform="rotate(10 620 290)" />
      {/* Birds */}
      <g style={{ animation: "bird-drift 12s ease-in-out infinite" }}>
        <path d="M350 120 Q355 115 360 120 Q355 125 350 120" fill="#fff" opacity="0.7" />
        <path d="M380 100 Q385 95 390 100 Q385 105 380 100" fill="#fff" opacity="0.6" />
        <path d="M420 130 Q425 125 430 130 Q425 135 420 130" fill="#fff" opacity="0.65" />
      </g>
      {/* Stars */}
      <circle cx="650" cy="80" r="2" fill="#c8a878" opacity="0.8" />
      <circle cx="700" cy="120" r="1.5" fill="#c8a878" opacity="0.6" />
      <circle cx="100" cy="100" r="1.5" fill="#c8a878" opacity="0.5" />
    </svg>
  );
}
