import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPropertiesIndex } from "@/components/ui/AdminPropertiesManager";
import type { AgentOption, PropertyRecord } from "@/lib/admin-types";

export function AdminAccessGate({
  activeWorkspace,
  properties,
  agents,
}: {
  activeWorkspace: {
    workspaceId: string;
    workspaceName: string | null | undefined;
    workspaceSlug?: string | null | undefined;
  } | null;
  properties: PropertyRecord[];
  agents: AgentOption[];
}) {
  if (!activeWorkspace?.workspaceId) {
    return <AdminAccessClient />;
  }

  return <AdminPropertiesIndex workspaceName={activeWorkspace.workspaceName} workspaceSlug={activeWorkspace.workspaceSlug} properties={properties} />;
}
