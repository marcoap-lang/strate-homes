"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AuthStatusBadge } from "@/components/ui/AuthStatusBadge";
import { WorkspaceStatusBadge } from "@/components/ui/WorkspaceStatusBadge";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";

const navItems = [
  { label: "Resumen", hint: "Vista general del workspace", active: true },
  { label: "Propiedades", hint: "Inventario y publicación" },
  { label: "Fotos", hint: "Cobertura visual por propiedad" },
  { label: "Equipo", hint: "Usuarios y agentes" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useSupabaseAuth();
  const { activeWorkspace } = useActiveWorkspace();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f9f6f1_0%,#f4efe7_100%)] text-stone-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[290px_1fr] lg:px-8 lg:py-8">
        <aside className="rounded-[2rem] border border-stone-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(120,113,108,0.10)] backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Strate Homes</p>
            <h1 className="mt-3 text-2xl font-semibold text-stone-950">Admin</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Un espacio claro para ordenar inventario, mejorar la presentación de cada propiedad y operar con más confianza.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Workspace activo</p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {activeWorkspace?.workspaceName ?? activeWorkspace?.workspaceSlug ?? activeWorkspace?.workspaceId ?? "Pendiente"}
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {user?.email ? `Sesión: ${user.email}` : "Inicia sesión para operar tu admin."}
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`block rounded-2xl border px-4 py-3 transition ${item.active ? "border-stone-200 bg-stone-950 text-white shadow-sm" : "border-transparent bg-stone-50 text-stone-700 hover:border-stone-200 hover:bg-white"}`}
              >
                <p className="text-sm font-medium">{item.label}</p>
                <p className={`mt-1 text-xs ${item.active ? "text-white/70" : "text-stone-500"}`}>{item.hint}</p>
              </a>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            <a href="/" className="flex items-center justify-center rounded-full border border-stone-300 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-100">
              Ver sitio público
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-stone-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(120,113,108,0.10)] backdrop-blur lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Panel principal</p>
              <h2 className="mt-3 text-3xl font-semibold text-stone-950">Operación inmobiliaria más clara</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
                Administra propiedades, revisa la cobertura visual de cada publicación y mantén tu operación con una experiencia más limpia y profesional.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AuthStatusBadge />
              <WorkspaceStatusBadge />
            </div>
          </div>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </div>
  );
}
