import { notFound } from "next/navigation";
import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPropertyInterestedView } from "@/components/ui/AdminPropertiesManager";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminPropertyInterestedPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccessState();

  if (access.kind !== "ready") {
    return (
      <AdminShell>
        <AdminAccessClient />
      </AdminShell>
    );
  }

  const { id } = await params;
  const property = access.properties.find((item) => item.id === id);

  if (!property) {
    notFound();
  }

  return (
    <AdminShell>
      <AdminPropertyInterestedView property={property} />
    </AdminShell>
  );
}
