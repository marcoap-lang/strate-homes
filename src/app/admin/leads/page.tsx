import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminLeadsManager } from "@/components/ui/AdminLeadsManager";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminLeadsPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <AdminLeadsManager leads={access.leads} />
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
