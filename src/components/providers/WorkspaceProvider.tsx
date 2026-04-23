"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import {
  clearClientStoredWorkspaceId,
  getClientActiveWorkspace,
  setClientStoredWorkspaceId,
} from "@/lib/workspace/client";
import type { ActiveWorkspace } from "@/lib/workspace/shared";

type WorkspaceContextValue = {
  activeWorkspace: ActiveWorkspace | null;
  isLoading: boolean;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  activeWorkspace: null,
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncWorkspace() {
      if (!user) {
        setActiveWorkspace(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const workspace = await getClientActiveWorkspace(user.id);

      if (cancelled) return;

      setActiveWorkspace({
        profileId: user.id,
        workspaceId: workspace.workspaceId,
        workspaceName: workspace.workspaceName,
        workspaceSlug: workspace.workspaceSlug,
        role: workspace.role,
      });
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
      isLoading,
      setActiveWorkspaceId: (workspaceId: string | null) => {
        if (!user) return;

        if (!workspaceId) {
          clearClientStoredWorkspaceId();
        } else {
          setClientStoredWorkspaceId(workspaceId);
        }

        setActiveWorkspace((current) =>
          current
            ? {
                ...current,
                workspaceId,
              }
            : current,
        );
      },
    }),
    [activeWorkspace, isLoading, user],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useActiveWorkspace() {
  return useContext(WorkspaceContext);
}
