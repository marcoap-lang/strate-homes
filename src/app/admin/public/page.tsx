import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPublicBrandingManager } from "@/components/ui/AdminPublicBrandingManager";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminPublicBrandingPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <AdminPublicBrandingManager workspace={access.activeWorkspace} />
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
