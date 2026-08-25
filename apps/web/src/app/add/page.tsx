import { AddPage } from "@/components/capture/AddPage";
import { EditModeGuard } from "@/components/layout/EditModeGuard";

export default function Page() {
  return (
    <EditModeGuard>
      <AddPage />
    </EditModeGuard>
  );
}
