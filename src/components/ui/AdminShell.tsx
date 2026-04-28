"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AuthStatusBadge } from "@/components/ui/AuthStatusBadge";
import { WorkspaceStatusBadge } from "@/components/ui/WorkspaceStatusBadge";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";

const navItems = [
  { label: "Inicio", href: "/admin" },
  { label: "Propiedades", href: "/admin/properties" },
  { label: "Equipo", href: "/admin/team" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useSupabaseAuth();
  const { activeWorkspace } = useActiveWorkspace();
  const pathname = usePathname();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_100%)] text-slate-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[290px_1fr] lg:px-8 lg:py-8">
        <aside className="rounded-[2.2rem] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Strate Homes</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950">Admin</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Un espacio claro para ordenar inventario, mejorar la presentación de cada propiedad y operar con más confianza.
            </p>
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-sky-50/70 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace activo</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {activeWorkspace?.workspaceName ?? activeWorkspace?.workspaceSlug ?? activeWorkspace?.workspaceId ?? "Pendiente"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {user?.email ? `Sesión: ${user.email}` : "Inicia sesión para operar tu admin."}
            </p>

          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const classes = `flex items-center justify-between rounded-[1.4rem] border px-4 py-3 transition ${isActive ? "border-[#d7ab5b]/30 bg-[#fff8ec] text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.08)]" : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60"}`;

              return (
                <Link key={item.label} href={item.href} className={classes}>
                  <p className="text-sm font-medium">{item.label}</p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-3">
            <a href={activeWorkspace?.workspaceSlug ? `/w/${activeWorkspace.workspaceSlug}` : "/"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50">
              Ver sitio público
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center rounded-full bg-[#d7ab5b] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section className="rounded-[2.2rem] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Panel principal</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Operación inmobiliaria más clara</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Administra propiedades, revisa la cobertura visual de cada publicación y mantén tu operación con una experiencia más limpia, profesional y navegable.
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
