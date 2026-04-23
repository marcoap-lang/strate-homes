import { AdminShell } from "@/components/ui/AdminShell";
import { AdminPropertiesManager } from "@/components/ui/AdminPropertiesManager";
import { getAdminPropertiesData } from "@/lib/admin-properties-data";

export default async function AdminPage() {
  const { activeWorkspace, properties, agents } = await getAdminPropertiesData();

  return (
    <AdminShell>
      <AdminPropertiesManager workspaceName={activeWorkspace.workspaceName} properties={properties} agents={agents} />
    </AdminShell>
  );
}
