import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessGate } from "@/components/ui/AdminAccessGate";
import { getAdminPropertiesData } from "@/lib/admin-properties-data";

export default async function AdminPage() {
  const { activeWorkspace, properties, agents } = await getAdminPropertiesData();

  return (
    <AdminShell>
      <AdminAccessGate activeWorkspace={activeWorkspace} properties={properties} agents={agents} />
    </AdminShell>
  );
}
