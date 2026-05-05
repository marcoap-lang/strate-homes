"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import { getPublicBaseUrl } from "@/lib/public-links";

const primaryNavItems = [
  { label: "Inicio", href: "/admin" },
  { label: "Propiedades", href: "/admin/properties" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Equipo", href: "/admin/team" },
];

const publicNavItems = [
  { label: "Ver sitio público", href: "/admin/public/properties" },
  { label: "Branding público", href: "/admin/public" },
  { label: "Propiedades públicas", href: "/admin/public/properties" },
  { label: "Asesores públicos", href: "/admin/public/agents" },
];

function getNavClasses(isActive: boolean, compact = false) {
  const size = compact ? "shrink-0 px-4 py-2.5 text-sm" : "px-4 py-3 text-sm";
  const state = isActive
    ? "border-[#d7ab5b]/40 bg-[#fff8ec] text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.07)]"
    : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/70";

  return `flex items-center justify-center rounded-full border font-medium transition ${size} ${state}`;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useSupabaseAuth();
  const { activeWorkspace } = useActiveWorkspace();
  const pathname = usePathname();

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  const workspaceLabel = activeWorkspace?.workspaceName ?? activeWorkspace?.workspaceSlug ?? activeWorkspace?.workspaceId ?? "Pendiente";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_100%)] text-slate-950">
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-3 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Strate Homes</p>
            <h1 className="truncate text-lg font-semibold text-slate-950">Admin</h1>
            <p className="truncate text-xs text-slate-500">{workspaceLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 rounded-full bg-[#d7ab5b] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#c99a46]"
          >
            Salir
          </button>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {primaryNavItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.label} href={item.href} className={getNavClasses(isActive, true)}>
                {item.label}
              </Link>
            );
          })}
          <Link href="/admin/public" className={getNavClasses(pathname.startsWith("/admin/public"), true)}>
            Público
          </Link>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-5 sm:py-6 lg:grid-cols-[290px_1fr] lg:gap-6 lg:px-8 lg:py-8">
        <aside className="hidden rounded-[2.2rem] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:block">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Strate Homes</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950">Admin</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Un espacio claro para ordenar inventario, mejorar la presentación de cada propiedad y operar con más confianza.
            </p>
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-sky-50/70 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace activo</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{workspaceLabel}</p>
            <p className="mt-2 break-words text-sm text-slate-600">
              {user?.email ? `Sesión: ${user.email}` : "Inicia sesión para operar tu admin."}
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {primaryNavItems.map((item) => {
              const isActive = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.label} href={item.href} className={getNavClasses(isActive)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.8rem] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Área Pública</p>
            <div className="mt-3 space-y-2">
              {publicNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const href = item.label === "Ver sitio público" ? (activeWorkspace?.workspaceSlug ? `${getPublicBaseUrl()}/w/${activeWorkspace.workspaceSlug}` : getPublicBaseUrl()) : item.href;
                const external = item.label === "Ver sitio público";
                return external ? (
                  <a key={item.label} href={href} target="_blank" rel="noopener noreferrer" className={getNavClasses(isActive)}>
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={href} className={getNavClasses(isActive)}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center rounded-full bg-[#d7ab5b] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white/94 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur sm:rounded-[2rem] sm:p-6 lg:rounded-[2.2rem] lg:p-8 lg:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          {children}
        </section>
      </div>
    </div>
  );
}
