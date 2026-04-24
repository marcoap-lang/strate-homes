"use client";

import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

export function AuthStatusBadge() {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-500">Preparando sesión...</span>;
  }

  if (!user) {
    return <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">Sin sesión activa</span>;
  }

  return (
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
      Usuario: {user.email ?? user.id}
    </span>
  );
}
