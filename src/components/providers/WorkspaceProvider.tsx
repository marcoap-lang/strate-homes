"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import {
  clearClientStoredWorkspaceId,
  getClientActiveWorkspace,
  setClientStoredWorkspaceId,
} from "@/lib/workspace/client";
import type { ActiveWorkspace, WorkspaceMembershipSummary } from "@/lib/workspace/shared";

type WorkspaceContextValue = {
  activeWorkspace: ActiveWorkspace | null;
  memberships: WorkspaceMembershipSummary[];
  isLoading: boolean;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  activeWorkspace: null,
  memberships: [],
  isLoading: true,
  setActiveWorkspaceId: () => undefined,
});

export function WorkspaceProvider({
  children,
  initialWorkspace,
}: {
  children: React.ReactNode;
  initialWorkspace: ActiveWorkspace | null;
}) {
  const { user } = useSupabaseAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace | null>(initialWorkspace);
  const [memberships, setMemberships] = useState<WorkspaceMembershipSummary[]>(
    initialWorkspace?.workspaceId
      ? [
          {
            workspaceId: initialWorkspace.workspaceId,
            workspaceName: initialWorkspace.workspaceName,
            workspaceSlug: initialWorkspace.workspaceSlug,
            role: initialWorkspace.role,
          },
        ]
      : [],
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncWorkspace() {
      if (!user) {
        setActiveWorkspace(null);
        setMemberships([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const workspace = await getClientActiveWorkspace(user.id);

      if (cancelled) return;

      setMemberships(workspace.memberships);
      setActiveWorkspace(
        workspace.workspaceId
          ? {
              profileId: user.id,
              workspaceId: workspace.workspaceId,
              workspaceName: workspace.workspaceName,
              workspaceSlug: workspace.workspaceSlug,
              role: workspace.role,
            }
          : null,
      );
      setIsLoading(false);
    }

    void syncWorkspace();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo(
    () => ({
      activeWorkspace,
      memberships,
      isLoading,
      setActiveWorkspaceId: (workspaceId: string | null) => {
        if (!user) return;

        if (!workspaceId) {
          clearClientStoredWorkspaceId();
        } else {
          setClientStoredWorkspaceId(workspaceId);
        }

        const selected = memberships.find((membership) => membership.workspaceId === workspaceId) ?? null;

        setActiveWorkspace(
          selected
            ? {
                profileId: user.id,
                workspaceId: selected.workspaceId,
                workspaceName: selected.workspaceName,
                workspaceSlug: selected.workspaceSlug,
                role: selected.role,
              }
            : null,
        );

        window.location.href = "/admin";
      },
    }),
    [activeWorkspace, memberships, isLoading, user],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useActiveWorkspace() {
  return useContext(WorkspaceContext);
}
