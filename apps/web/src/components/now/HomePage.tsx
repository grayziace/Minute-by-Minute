"use client";

import { VisitorGate } from "@/components/visitor/VisitorCover";
import { NowPage } from "@/components/now/NowPage";

export function HomePage() {
  return (
    <VisitorGate>
      <NowPage />
    </VisitorGate>
  );
}
