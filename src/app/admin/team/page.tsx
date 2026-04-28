import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminTeamManager } from "@/components/ui/AdminTeamManager";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminTeamPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <AdminTeamManager teamMembers={access.teamMembers} standaloneAgents={access.standaloneAgents} />
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
