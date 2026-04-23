"use client";

import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

export function AuthStatusBadge() {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60">Auth loading…</span>;
  }

  if (!user) {
    return <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs text-amber-100">No session</span>;
  }

  return (
    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-100">
      Signed in as {user.email ?? user.id}
    </span>
  );
}
