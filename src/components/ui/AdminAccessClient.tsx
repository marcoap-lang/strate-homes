"use client";

import { useActionState, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import { bootstrapInitialOwnerAction, type BootstrapOwnerState } from "@/app/admin/actions";
import { getAuthRedirectUrl, getReadableAuthError } from "@/lib/auth";

const initialBootstrapState: BootstrapOwnerState = { success: false, message: "" };

type AuthMode = "login" | "register";

export function AdminAccessClient() {
  const { user, isLoading } = useSupabaseAuth();
  const { activeWorkspace, isLoading: workspaceLoading } = useActiveWorkspace();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bootstrapState, bootstrapAction, bootstrapPending] = useActionState(bootstrapInitialOwnerAction, initialBootstrapState);

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const redirectTo = getAuthRedirectUrl();

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
            name: fullName,
          },
        },
      });

      if (error) {
        setError(getReadableAuthError(error.message));
        setIsSubmitting(false);
        return;
      }

      setMessage("Tu cuenta fue creada. Si tu proyecto pide confirmación por correo, revisa tu inbox. Después podrás entrar al admin.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(getReadableAuthError(error.message));
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/admin";
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  if (isLoading || workspaceLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-8 text-sm text-white/60">
        Preparando acceso a Strate Homes...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Strate Homes Admin</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">Acceso privado para operar tu inventario</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
            Entra con tu cuenta para administrar propiedades reales, mantener tu workspace activo y operar Strate Homes como producto, no como demo.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 transition ${mode === "login" ? "bg-white text-zinc-950" : "text-white/65 hover:text-white"}`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 transition ${mode === "register" ? "bg-white text-zinc-950" : "text-white/65 hover:text-white"}`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            {mode === "register" ? (
              <label className="space-y-2 text-sm text-white/80">
                <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Nombre</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="Tu nombre o nombre comercial"
                />
              </label>
            ) : null}

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

            <label className="space-y-2 text-sm text-white/80">
              <span className="block text-xs uppercase tracking-[0.2em] text-white/40">Contraseña</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
                placeholder="Mínimo 6 caracteres"
              />
            </label>

            {message ? <p className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {isSubmitting ? "Procesando..." : mode === "login" ? "Entrar al admin" : "Crear cuenta"}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-8 text-sm leading-7 text-white/60">
          <p className="font-medium text-white">Ruta del producto</p>
          <ul className="mt-4 space-y-2">
            <li>• Acceso principal: <span className="text-white">correo + contraseña</span></li>
            <li>• Ruta correcta del admin: <span className="text-white">/admin</span></li>
            <li>• Primer acceso: onboarding para crear workspace inicial</li>
            <li>• Supabase Auth sigue siendo el backend de autenticación</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!activeWorkspace?.workspaceId) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-8 text-sm leading-7 text-amber-100">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-100/70">Primer acceso</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Activa tu espacio de trabajo inicial</h3>
          <p className="mt-4 max-w-2xl">
            Tu cuenta ya existe. Solo falta crear tu workspace inicial para habilitar Strate Homes y dejarte como owner del primer espacio operativo.
          </p>

          <form action={bootstrapAction} className="mt-6 space-y-4">
            <label className="space-y-2 text-sm text-amber-50">
              <span className="block text-xs uppercase tracking-[0.2em] text-amber-100/70">Nombre del workspace</span>
              <input
                name="workspaceName"
                required
                defaultValue="Strate Homes"
                className="w-full max-w-xl rounded-2xl border border-amber-100/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/40"
              />
            </label>

            <label className="space-y-2 text-sm text-amber-50">
              <span className="block text-xs uppercase tracking-[0.2em] text-amber-100/70">Slug (opcional)</span>
              <input
                name="workspaceSlug"
                placeholder="strate-homes"
                className="w-full max-w-xl rounded-2xl border border-amber-100/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/40"
              />
            </label>

            {bootstrapState.message ? (
              <p className={`rounded-2xl px-4 py-3 text-sm ${bootstrapState.success ? "bg-emerald-500/15 text-emerald-100" : "bg-rose-500/15 text-rose-100"}`}>
                {bootstrapState.message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button disabled={bootstrapPending} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60">
                {bootstrapPending ? "Configurando..." : "Crear workspace y continuar"}
              </button>
              <button type="button" onClick={handleSignOut} className="rounded-full border border-amber-200/30 px-4 py-2 text-xs transition hover:bg-amber-200/10">
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-8 text-sm leading-7 text-white/60">
          <p className="font-medium text-white">Qué está pasando</p>
          <ul className="mt-4 space-y-2">
            <li>• tu cuenta ya está autenticada</li>
            <li>• todavía no existe workspace activo</li>
            <li>• este paso crea tu primer workspace</li>
            <li>• quedas habilitado automáticamente como <span className="text-white">owner</span></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-8 text-sm leading-7 text-emerald-100">
      <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">Acceso listo</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">Tu espacio ya está operativo</h3>
      <p className="mt-4">
        Sesión activa como <span className="text-white">{user.email ?? user.id}</span> en el workspace
        <span className="text-white"> {activeWorkspace.workspaceName ?? activeWorkspace.workspaceSlug ?? activeWorkspace.workspaceId}</span>.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/admin" className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-950 transition hover:bg-zinc-200">
          Entrar al admin
        </a>
        <button onClick={handleSignOut} className="rounded-full border border-emerald-200/30 px-4 py-2 text-xs transition hover:bg-emerald-200/10">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
