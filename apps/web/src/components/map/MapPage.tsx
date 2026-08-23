"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";

declare global {
  interface Window {
    AMap?: new (...args: unknown[]) => {
      destroy: () => void;
    };
    _AMapSecurityConfig?: { securityJsCode?: string };
  }
}

export function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const entries = useLiveQuery(() =>
    db.entries.filter((e) => e.locationLat != null && e.locationLng != null).toArray(),
  );

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!key || !mapRef.current) return;

    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.AMap) return;
    const map = new window.AMap(mapRef.current, {
      zoom: 11,
      center: [113.2644, 23.1291],
      mapStyle: "amap://styles/dark",
    });
    return () => map.destroy();
  }, [loaded]);

  return (
    <main className="mx-auto min-h-screen max-w-lg pb-32 pt-10">
      <header className="mb-4 px-5">
        <h1 className="font-display text-2xl">Map</h1>
        <p className="mt-1 text-sm text-muted">
          Places visited · approximate by default
        </p>
      </header>

      <div ref={mapRef} className="mx-5 h-[50vh] bg-surface" />

      {!process.env.NEXT_PUBLIC_AMAP_KEY && (
        <p className="mx-5 mt-4 text-sm text-muted">
          Set NEXT_PUBLIC_AMAP_KEY to enable the map. Showing {entries?.length ?? 0} located entries in archive.
        </p>
      )}

      <ul className="mt-6 divide-y divide-border/30 px-5">
        {entries?.map((e) => (
          <li key={e.id} className="py-3">
            <p className="text-sm">{e.locationName ?? "Unknown place"}</p>
            <p className="text-xs text-muted">
              {e.locationPrivacy === "hidden"
                ? "Location hidden"
                : `${e.locationLat?.toFixed(3)}, ${e.locationLng?.toFixed(3)}`}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
