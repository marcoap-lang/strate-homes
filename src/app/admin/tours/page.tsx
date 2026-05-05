import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminShell } from "@/components/ui/AdminShell";
import { AdminToursManager } from "@/components/ui/AdminToursManager";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminToursPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <AdminToursManager
          workspaceName={access.activeWorkspace.workspaceName}
          workspaceSlug={access.activeWorkspace.workspaceSlug}
          properties={access.properties}
          tours={access.tours}
        />
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
