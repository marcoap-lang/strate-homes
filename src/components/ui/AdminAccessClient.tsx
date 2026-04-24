"use client";

import { useActionState, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import { bootstrapInitialOwnerAction, type BootstrapOwnerState } from "@/app/admin/actions";
import { getAuthRedirectUrl, getReadableAuthError, getReadableSignupResult } from "@/lib/auth";

const initialBootstrapState: BootstrapOwnerState = { success: false, message: "" };

type AuthMode = "login" | "register";

function AccessFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/80 p-5 shadow-sm shadow-stone-200/60">
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}

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
      <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-8 text-sm text-stone-500 shadow-sm shadow-stone-200/50">
        Preparando tu acceso a Strate Homes...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-amber-50 shadow-[0_30px_80px_rgba(120,113,108,0.14)]">
          <div className="border-b border-stone-200/80 px-8 py-7">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Strate Homes</p>
            <h3 className="mt-3 text-3xl font-semibold text-stone-950">Admin claro, profesional y listo para vender mejor</h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Strate Homes te ayuda a organizar tu inventario, presentar propiedades con mejor claridad y operar tu espacio comercial desde un solo lugar.
            </p>
          </div>

          <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="inline-flex rounded-full border border-stone-200 bg-stone-100 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-full px-4 py-2 transition ${mode === "login" ? "bg-white text-stone-950 shadow-sm" : "text-stone-600 hover:text-stone-950"}`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-full px-4 py-2 transition ${mode === "register" ? "bg-white text-stone-950 shadow-sm" : "text-stone-600 hover:text-stone-950"}`}
                >
                  Crear cuenta
                </button>
              </div>

              <form onSubmit={handleAuth} className="mt-6 space-y-4">
                {mode === "register" ? (
                  <label className="space-y-2 text-sm text-stone-700">
                    <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre</span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                      placeholder="Tu nombre o el nombre de tu negocio"
                    />
                  </label>
                ) : null}

                <label className="space-y-2 text-sm text-stone-700">
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Correo</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                    placeholder="tu-correo@ejemplo.com"
                  />
                </label>

                <label className="space-y-2 text-sm text-stone-700">
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Contraseña</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                    placeholder="Mínimo 6 caracteres"
                  />
                </label>

                {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
                {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
                >
                  {isSubmitting ? "Entrando..." : mode === "login" ? "Entrar al admin" : "Crear cuenta"}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <AccessFeature
                title="Qué hace Strate Homes"
                description="Te permite centralizar propiedades, mantener orden comercial y preparar una presentación más sólida desde tu admin."
              />
              <AccessFeature
                title="Primer acceso simple"
                description="Creas tu cuenta, activas tu espacio de trabajo y sigues directo al admin, sin pasos técnicos visibles."
              />
              <AccessFeature
                title="Experiencia más profesional"
                description="Diseñado para sentirse como producto real: claro, limpio y listo para crecer contigo." 
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white/75 p-8 shadow-sm shadow-stone-200/50">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Cómo funciona</p>
          <h4 className="mt-3 text-2xl font-semibold text-stone-950">Tu acceso en tres pasos</h4>
          <ol className="mt-6 space-y-4 text-sm leading-7 text-stone-600">
            <li><span className="font-semibold text-stone-900">1.</span> Crea tu cuenta o entra con tu correo.</li>
            <li><span className="font-semibold text-stone-900">2.</span> Activa tu espacio de trabajo inicial.</li>
            <li><span className="font-semibold text-stone-900">3.</span> Empieza a capturar propiedades y preparar su presentación.</li>
          </ol>
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            La primera experiencia está enfocada en operación inmobiliaria básica: acceso, inventario y fotos mejor guiadas. Todavía no abre CRM, campañas ni branding avanzado.
          </div>
        </div>
      </div>
    );
  }

  if (!activeWorkspace?.workspaceId) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white via-amber-50 to-stone-50 p-8 shadow-[0_30px_80px_rgba(120,113,108,0.12)]">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Primer acceso</p>
          <h3 className="mt-3 text-3xl font-semibold text-stone-950">Activa tu espacio de trabajo</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Tu cuenta ya está lista. Ahora solo falta crear el espacio donde vas a organizar tu inventario, administrar propiedades y empezar a operar Strate Homes.
          </p>

          <form action={bootstrapAction} className="mt-8 space-y-5">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre del espacio</span>
              <input
                name="workspaceName"
                required
                defaultValue="Strate Homes"
                className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
                placeholder="Ej. Rivera Propiedades"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Identificador corto (opcional)</span>
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
              <button disabled={bootstrapPending} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
                {bootstrapPending ? "Preparando tu espacio..." : "Crear espacio y continuar"}
              </button>
              <button type="button" onClick={handleSignOut} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-sm shadow-stone-200/50">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Lo que obtienes</p>
          <h4 className="mt-3 text-2xl font-semibold text-stone-950">Tu base operativa desde el primer día</h4>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
            <li>• un espacio claro para administrar tus propiedades</li>
            <li>• acceso como owner del workspace inicial</li>
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
    <div className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-8 text-sm leading-7 text-emerald-800 shadow-sm shadow-emerald-100">
      <p className="text-xs uppercase tracking-[0.24em] text-emerald-700/70">Acceso listo</p>
      <h3 className="mt-3 text-2xl font-semibold text-stone-950">Tu espacio ya está operativo</h3>
      <p className="mt-4 text-stone-700">
        Iniciaste sesión como <span className="font-medium text-stone-950">{user.email ?? user.id}</span> en
        <span className="font-medium text-stone-950"> {activeWorkspace.workspaceName ?? activeWorkspace.workspaceSlug ?? activeWorkspace.workspaceId}</span>.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/admin" className="rounded-full bg-stone-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800">
          Entrar al admin
        </a>
        <button onClick={handleSignOut} className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-700 transition hover:bg-white/70">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
