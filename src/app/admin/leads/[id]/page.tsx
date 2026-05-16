import { notFound, redirect } from "next/navigation";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminShell } from "@/components/ui/AdminShell";
import { LeadDetailManager } from "@/components/ui/LeadDetailManager";
import { getAdminAccessState } from "@/lib/admin-access";
import { getLeadDetail } from "@/lib/lead-detail";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccessState();
  if (access.kind === "no-session") redirect("/login?next=/app/leads");

  if (access.kind !== "ready") {
    return (
      <AdminShell>
        <AdminAccessClient />
      </AdminShell>
    );
  }

  const { id } = await params;
  const detail = await getLeadDetail(id);
  if (!detail) notFound();

  return (
    <AdminShell>
      <LeadDetailManager detail={detail} />
    </AdminShell>
  );
}
