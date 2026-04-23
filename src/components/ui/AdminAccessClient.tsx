"use client";

import { useMemo, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";

export function AdminAccessClient() {
  const { user, isLoading } = useSupabaseAuth();
  const { activeWorkspace, isLoading: workspaceLoading } = useActiveWorkspace();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/admin`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Revisa tu correo. Te envié un magic link para entrar al admin.");
    setIsSubmitting(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  if (isLoading || workspaceLoading) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 text-sm text-white/60">
        Verificando acceso al admin...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Acceso</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Entrar al admin</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
            El admin real vive en <span className="font-medium text-white">/admin</span>. Para entrar, inicia sesión con el correo autorizado en Supabase Auth.
          </p>

          <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
            <label className="space-y-2 text-sm text-white/80">
              <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Correo</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
                placeholder="tu-correo@ejemplo.com"
              />
            </label>

            {message ? <p className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {isSubmitting ? "Enviando link..." : "Enviar magic link"}
            </button>
          </form>
        </div>

        <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 p-6 text-sm leading-7 text-white/60">
          <p className="font-medium text-white">Notas de acceso</p>
          <ul className="mt-4 space-y-2">
            <li>• Ruta correcta del admin: <span className="text-white">/admin</span></li>
            <li>• Si tu usuario existe pero no pertenece a un workspace, no podrás operar propiedades.</li>
            <li>• El workspace activo determina qué propiedades ves y editas.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!activeWorkspace?.workspaceId) {
    return (
      <div className="rounded-[1.75rem] border border-amber-400/20 bg-amber-400/10 p-6 text-sm leading-7 text-amber-100">
        <p className="font-medium">Tu sesión sí existe, pero no hay workspace activo.</p>
        <p className="mt-3">
          Esto normalmente significa que tu usuario todavía no tiene `workspace_members` activos o no tiene `default_workspace_id` resoluble. Antes de usar el admin, hay que asignarte un workspace.
        </p>
        <button onClick={handleSignOut} className="mt-5 rounded-full border border-amber-200/30 px-4 py-2 text-xs transition hover:bg-amber-200/10">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-6 text-sm leading-7 text-emerald-100">
      <p className="font-medium">Acceso listo.</p>
      <p className="mt-3">
        Sesión activa como <span className="text-white">{user.email ?? user.id}</span> en el workspace
        <span className="text-white"> {activeWorkspace.workspaceName ?? activeWorkspace.workspaceSlug ?? activeWorkspace.workspaceId}</span>.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href="/admin" className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-950 transition hover:bg-zinc-200">
          Entrar al CRUD
        </a>
        <button onClick={handleSignOut} className="rounded-full border border-emerald-200/30 px-4 py-2 text-xs transition hover:bg-emerald-200/10">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
