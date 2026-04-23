"use client";

import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";

export function WorkspaceStatusBadge() {
  const { activeWorkspace, isLoading } = useActiveWorkspace();

  if (isLoading) {
    return <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60">Workspace loading…</span>;
  }

  if (!activeWorkspace?.workspaceId) {
    return <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-xs text-fuchsia-100">No active workspace</span>;
  }

  return (
    <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs text-sky-100">
      {activeWorkspace.workspaceName ?? activeWorkspace.workspaceSlug ?? activeWorkspace.workspaceId}
      {activeWorkspace.role ? ` · ${activeWorkspace.role}` : ""}
    </span>
  );
}
