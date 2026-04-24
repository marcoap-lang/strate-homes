import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPropertyCreateView } from "@/components/ui/AdminPropertiesManager";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminPropertiesNewPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <AdminPropertyCreateView agents={access.agents} />
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
