import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPropertiesIndex } from "@/components/ui/AdminPropertiesManager";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminPropertiesPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <AdminPropertiesIndex workspaceName={access.activeWorkspace.workspaceName} properties={access.properties} />
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
