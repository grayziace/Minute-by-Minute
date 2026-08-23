"use client";

interface ImmersiveEnvironmentProps {
  /** Optional blurred media URL for distant memory layer */
  memoryUrl?: string | null;
  memoryIsVideo?: boolean;
  intensity?: "open" | "filled";
}

export function ImmersiveEnvironment({
  memoryUrl,
  memoryIsVideo,
  intensity = "open",
}: ImmersiveEnvironmentProps) {
  return (
    <div className="immersive-env" aria-hidden data-intensity={intensity}>
      {/* Deep space / water darkness */}
      <div className="immersive-env__depth" />

      {/* God-ray light from above */}
      <div className="immersive-env__light-rays" />

      {/* Moving atmospheric orbs — full viewport scale */}
      <div className="immersive-env__orb immersive-env__orb--ice" />
      <div className="immersive-env__orb immersive-env__orb--blush" />
      <div className="immersive-env__orb immersive-env__orb--lavender" />

      {/* Water-like reflection band */}
      <div className="immersive-env__reflection" />

      {/* Distant blurred memory */}
      {memoryUrl && (
        <div className="immersive-env__memory">
          {memoryIsVideo ? (
            <video
              src={memoryUrl}
              className="h-full w-full object-cover"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memoryUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}

      {/* Subtle film grain */}
      <div className="immersive-env__grain" />

      {/* Vignette for cinematic depth */}
      <div className="immersive-env__vignette" />
    </div>
  );
}
