"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperienceMode } from "@/lib/experience/mode";

/** Redirect visitors away from edit-only routes */
export function EditModeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { canEdit } = useExperienceMode();

  useEffect(() => {
    if (!canEdit) {
      router.replace("/");
    }
  }, [canEdit, router]);

  if (!canEdit) return null;
  return <>{children}</>;
}
