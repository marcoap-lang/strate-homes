import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessGate } from "@/components/ui/AdminAccessGate";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <AdminAccessGate activeWorkspace={access.activeWorkspace} properties={access.properties} agents={access.agents} />
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
