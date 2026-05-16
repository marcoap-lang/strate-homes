"use client";

import { useActionState, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import { bootstrapInitialOwnerAction, type BootstrapOwnerState } from "@/app/admin/actions";
import { getAuthRedirectUrl, getReadableAuthError, getReadableSignupResult } from "@/lib/auth";

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
      const { data, error } = await supabase.auth.signUp({
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

      const result = getReadableSignupResult({
        hasSession: Boolean(data.session),
        hasUser: Boolean(data.user),
        identitiesCount: data.user?.identities?.length ?? 0,
      });

      if (result.kind === "signed-in") {
        window.location.href = "/admin";
        return;
      }

      if (result.kind === "existing-user") {
        setMode("login");
        setPassword("");
      }

      setMessage(result.message);
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
      <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-4 sm:rounded-[2rem] sm:p-8 text-sm text-stone-500 shadow-sm shadow-stone-200/50">
        Preparando tu acceso a Strate Homes...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="inline-flex w-full rounded-full border border-slate-200 bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-2.5 transition ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-full px-4 py-2.5 transition ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleAuth} className="mt-6 space-y-4">
          {mode === "register" ? (
            <label className="space-y-2 text-sm text-slate-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Nombre</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition focus:border-slate-400 sm:text-sm"
                placeholder="Tu nombre o negocio"
              />
            </label>
          ) : null}

          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Correo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition focus:border-slate-400 sm:text-sm"
              placeholder="tu-correo@ejemplo.com"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition focus:border-slate-400 sm:text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </label>

          {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#d7ab5b] px-5 py-3.5 text-center text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    );
  }

  if (!activeWorkspace?.workspaceId) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[1.5rem] border border-stone-200 bg-gradient-to-br from-white via-amber-50 to-stone-50 p-4 sm:rounded-[2rem] sm:p-8 shadow-[0_30px_80px_rgba(120,113,108,0.12)]">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Primer acceso</p>
          <h3 className="mt-3 text-3xl font-semibold text-stone-950">Crea tu inmobiliaria</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Tu cuenta ya está lista. Ahora solo falta crear la inmobiliaria donde vas a organizar inventario, administrar propiedades y empezar a operar.
          </p>

          <form action={bootstrapAction} className="mt-8 space-y-5">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre de la inmobiliaria</span>
              <input
                name="workspaceName"
                required
                defaultValue="Strate Homes"
                className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                placeholder="Ej. Rivera Propiedades"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Slug público inicial (opcional)</span>
              <input
                name="workspaceSlug"
                placeholder="rivera-propiedades"
                className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            {bootstrapState.message ? (
              <p className={`rounded-2xl border px-4 py-3 text-sm ${bootstrapState.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {bootstrapState.message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button disabled={bootstrapPending} className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm sm:w-auto font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
                {bootstrapPending ? "Preparando tu inmobiliaria..." : "Crear inmobiliaria y continuar"}
              </button>
              <button type="button" onClick={handleSignOut} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-4 sm:rounded-[2rem] sm:p-8 shadow-sm shadow-stone-200/50">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Lo que obtienes</p>
          <h4 className="mt-3 text-2xl font-semibold text-stone-950">Tu base operativa desde el primer día</h4>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
            <li>• una inmobiliaria lista para administrar propiedades y clientes</li>
            <li>• acceso como owner de la cuenta principal</li>
            <li>• una entrada limpia al admin sin pasos confusos</li>
            <li>• mejor guía para cargar fotos y presentar cada propiedad</li>
          </ul>
          <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5 text-sm leading-6 text-stone-600">
            Si algo falla, verás un mensaje claro para volver a intentar. La idea es que este paso se sienta como onboarding de producto, no como configuración técnica.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-4 sm:rounded-[2rem] sm:p-8 text-sm leading-7 text-emerald-800 shadow-sm shadow-emerald-100">
      <p className="text-xs uppercase tracking-[0.24em] text-emerald-700/70">Acceso listo</p>
      <h3 className="mt-3 text-2xl font-semibold text-stone-950">Tu inmobiliaria ya está operativa</h3>
      <p className="mt-4 text-stone-700">
        Iniciaste sesión como <span className="font-medium text-stone-950">{user.email ?? user.id}</span> en
        <span className="font-medium text-stone-950"> {activeWorkspace.workspaceName ?? activeWorkspace.workspaceSlug ?? activeWorkspace.workspaceId}</span>.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/admin" className="rounded-full bg-[#d7ab5b] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#c99a46]">
          Entrar al admin
        </a>
        <button onClick={handleSignOut} className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-700 transition hover:bg-white/70">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
