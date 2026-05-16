"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import { getPublicBaseUrl } from "@/lib/public-links";

type PrimaryNavItem = {
  label: string;
  href: string;
  description: string;
  match: (pathname: string) => boolean;
};

type SecondaryNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

const primaryNavItems: PrimaryNavItem[] = [
  {
    label: "Hoy",
    href: "/admin",
    description: "Pendientes, prioridades y visión general.",
    match: (pathname) => pathname === "/admin",
  },
  {
    label: "Inventario",
    href: "/admin/properties",
    description: "Propiedades, recorridos y publicación.",
    match: (pathname) => pathname.startsWith("/admin/properties") || pathname.startsWith("/admin/tours"),
  },
  {
    label: "Clientes",
    href: "/admin/leads",
    description: "Leads y seguimiento comercial.",
    match: (pathname) => pathname.startsWith("/admin/leads"),
  },
  {
    label: "Sitio",
    href: "/admin/public",
    description: "Marca, inventario visible y vista pública.",
    match: (pathname) => pathname.startsWith("/admin/public"),
  },
  {
    label: "Equipo",
    href: "/admin/team",
    description: "Usuarios, asesores y perfiles.",
    match: (pathname) => pathname.startsWith("/admin/team"),
  },
];

function getSecondaryNavItems(workspaceSlug: string | null | undefined): Record<string, SecondaryNavItem[]> {
  const publicHome = workspaceSlug ? `${getPublicBaseUrl()}/w/${workspaceSlug}` : getPublicBaseUrl();

  return {
    Hoy: [
      { label: "Resumen", href: "/admin" },
      { label: "Marca", href: "/admin/public" },
      { label: "Agregar propiedad", href: "/admin/properties/new" },
    ],
    Inventario: [
      { label: "Propiedades", href: "/admin/properties" },
      { label: "Nueva propiedad", href: "/admin/properties/new" },
      { label: "Recorridos", href: "/admin/tours" },
    ],
    Clientes: [
      { label: "Leads", href: "/admin/leads" },
      { label: "Recorridos", href: "/admin/tours" },
    ],
    Sitio: [
      { label: "Marca", href: "/admin/public" },
      { label: "Asesores públicos", href: "/admin/public/agents" },
      { label: "Inventario público", href: "/admin/public/properties" },
      { label: "Ver sitio público", href: publicHome, external: true },
    ],
    Equipo: [
      { label: "Equipo", href: "/admin/team" },
      { label: "Marca", href: "/admin/public" },
    ],
  };
}

function getPillClasses(isActive: boolean, compact = false) {
  const base = compact ? "px-4 py-2.5 text-sm" : "px-4 py-3 text-sm";
  const state = isActive
    ? "border-[#d7ab5b]/40 bg-[#fff7e7] text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.07)]"
    : "border-slate-200/90 bg-white text-slate-700 hover:border-[#d7ab5b]/25 hover:bg-[#fffaf1]";

  return `flex items-center justify-center rounded-full border font-medium transition ${base} ${state}`;
}

function getPanelLinkClasses(isActive: boolean) {
  return `block rounded-[1.35rem] border px-4 py-4 transition ${
    isActive
      ? "border-[#d7ab5b]/40 bg-[#fff7e7] shadow-[0_18px_40px_rgba(15,23,42,0.07)]"
      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
  }`;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useSupabaseAuth();
  const { activeWorkspace } = useActiveWorkspace();
  const pathname = usePathname();

  const activePrimaryItem = primaryNavItems.find((item) => item.match(pathname)) ?? primaryNavItems[0];
  const secondaryNavItems = getSecondaryNavItems(activeWorkspace?.workspaceSlug);
  const currentSecondaryItems = secondaryNavItems[activePrimaryItem.label] ?? [];

  const workspaceBrandLabel = activeWorkspace?.brandName ?? activeWorkspace?.workspaceName ?? activeWorkspace?.workspaceSlug ?? "Tu inmobiliaria";
  const workspaceSupportLabel = activeWorkspace?.publicClaim ?? activeWorkspace?.workspaceSlug ?? activeWorkspace?.workspaceId ?? "Configura tu presencia pública";

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fffaf0_0%,#f7fbff_38%,#eef4fb_100%)] text-slate-950">
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/92 px-3 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Strate Homes Admin</p>
            <h1 className="truncate text-lg font-semibold text-slate-950">{workspaceBrandLabel}</h1>
            <p className="truncate text-xs text-slate-500">{workspaceSupportLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            Salir
          </button>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {primaryNavItems.map((item) => (
            <Link key={item.label} href={item.href} className={getPillClasses(item.match(pathname), true)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1480px] gap-4 px-3 py-4 sm:px-5 sm:py-6 xl:grid-cols-[320px_1fr] xl:gap-6 xl:px-8 xl:py-8">
        <aside className="hidden rounded-[2.35rem] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.95))] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur xl:block">
          <div className="rounded-[1.9rem] border border-slate-200/90 bg-white/90 p-5">
            <p className="text-[10px] uppercase tracking-[0.30em] text-slate-400">Strate Homes</p>
            <div className="mt-4 flex items-center gap-4">
              {activeWorkspace?.publicLogoUrl ? (
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
                  <Image
                    src={activeWorkspace.publicLogoUrl}
                    alt={workspaceBrandLabel}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-[#f3e6c9] text-xl font-semibold text-[#8f6a2f]">
                  {workspaceBrandLabel.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-[1.45rem] font-semibold tracking-tight text-slate-950">{workspaceBrandLabel}</h1>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{workspaceSupportLabel}</p>
              </div>
            </div>
            <div className="mt-5 rounded-[1.4rem] border border-[#ead6ad] bg-[#fff8ea] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#9b7b3a]">Sistema</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Operación, captación y publicación centralizadas para tu inmobiliaria.</p>
            </div>
          </div>

          <nav className="mt-6 space-y-3">
            {primaryNavItems.map((item) => {
              const isActive = item.match(pathname);
              return (
                <Link key={item.label} href={item.href} className={getPanelLinkClasses(isActive)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                    <span className={`mt-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${isActive ? "bg-[#d7ab5b] text-white" : "bg-slate-100 text-slate-500"}`}>
                      {isActive ? "Ahora" : "Ir"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.9rem] border border-slate-200 bg-white/85 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sesión activa</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{user?.email ?? "Sin sesión cargada"}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Salir
              </button>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-slate-200/90 bg-white/92 p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Strate Homes Admin</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{activePrimaryItem.label}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{activePrimaryItem.description}</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{workspaceBrandLabel}</p>
                <p className="mt-1">{activeWorkspace?.workspaceSlug ? `/${activeWorkspace.workspaceSlug}` : "Workspace activo"}</p>
              </div>
            </div>

            {currentSecondaryItems.length ? (
              <nav className="mt-5 flex flex-wrap gap-2">
                {currentSecondaryItems.map((item) => {
                  const isActive = item.external ? false : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  if (item.external) {
                    return (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={getPillClasses(false, true)}>
                        {item.label}
                      </a>
                    );
                  }

                  return (
                    <Link key={item.label} href={item.href} className={getPillClasses(isActive, true)}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>

          <section className="rounded-[1.6rem] border border-slate-200/90 bg-white/94 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur sm:p-6 lg:rounded-[2rem] lg:p-8">
            {children}
          </section>
        </section>
      </div>
    </div>
  );
}
