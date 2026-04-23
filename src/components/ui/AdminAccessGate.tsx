import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPropertiesManager } from "@/components/ui/AdminPropertiesManager";
import type { AgentOption, PropertyRecord } from "@/lib/admin-types";

export function AdminAccessGate({
  activeWorkspace,
  properties,
  agents,
}: {
  activeWorkspace: {
    workspaceId: string;
    workspaceName: string | null | undefined;
  } | null;
  properties: PropertyRecord[];
  agents: AgentOption[];
}) {
  if (!activeWorkspace?.workspaceId) {
    return <AdminAccessClient />;
  }

  return <AdminPropertiesManager workspaceName={activeWorkspace.workspaceName} properties={properties} agents={agents} />;
}
