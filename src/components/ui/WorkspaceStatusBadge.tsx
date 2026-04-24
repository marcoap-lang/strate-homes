"use client";

import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";

export function WorkspaceStatusBadge() {
  const { activeWorkspace, isLoading } = useActiveWorkspace();

  if (isLoading) {
    return <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-500">Preparando workspace...</span>;
  }

  if (!activeWorkspace?.workspaceId) {
    return <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">Espacio pendiente</span>;
  }

  return (
    <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs text-sky-700">
      Workspace: {activeWorkspace.workspaceName ?? activeWorkspace.workspaceSlug ?? activeWorkspace.workspaceId}
      {activeWorkspace.role ? ` · ${activeWorkspace.role}` : ""}
    </span>
  );
}
