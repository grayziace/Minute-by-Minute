import { WritePage } from "@/components/capture/WritePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WritePage />
    </Suspense>
  );
}
