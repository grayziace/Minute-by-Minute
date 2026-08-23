"use client";

interface HaloLoaderProps {
  label?: string;
}

export function HaloLoader({ label }: HaloLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="halo-loader" role="status" aria-label={label ?? "Loading"} />
      {label && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      )}
    </div>
  );
}
