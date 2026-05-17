"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useActiveWorkspace } from "@/components/providers/WorkspaceProvider";
import { getPublicBaseUrl } from "@/lib/public-links";

type PrimaryNavItem = {
  label: string;
  shortLabel: string;
  icon: string;
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
    shortLabel: "Hoy",
    icon: "⌂",
    href: "/app",
    description: "Prioridades comerciales de hoy.",
    match: (pathname) => pathname === "/app" || pathname === "/admin",
  },
  {
    label: "Inventario",
    shortLabel: "Inv.",
    icon: "▦",
    href: "/app/properties",
    description: "Propiedades, recorridos y publicación.",
    match: (pathname) => pathname.startsWith("/app/properties") || pathname.startsWith("/app/tours") || pathname.startsWith("/admin/properties") || pathname.startsWith("/admin/tours"),
  },
  {
    label: "Interesados",
    shortLabel: "Interés",
    icon: "◉",
    href: "/app/leads",
    description: "Clientes potenciales, citas y seguimiento.",
    match: (pathname) => pathname.startsWith("/app/leads") || pathname.startsWith("/admin/leads"),
  },
  {
    label: "Presencia",
    shortLabel: "Marca",
    icon: "◇",
    href: "/app/public",
    description: "Sitio público, marca y escaparate.",
    match: (pathname) => pathname.startsWith("/app/public") || pathname.startsWith("/admin/public"),
  },
  {
    label: "Equipo",
    shortLabel: "Equipo",
    icon: "●",
    href: "/app/team",
    description: "Acceso interno y perfiles comerciales.",
    match: (pathname) => pathname.startsWith("/app/team") || pathname.startsWith("/app/subscription") || pathname.startsWith("/admin/team"),
  },
];

function getSecondaryNavItems(workspaceSlug: string | null | undefined): Record<string, SecondaryNavItem[]> {
  const publicHome = workspaceSlug ? `${getPublicBaseUrl()}/w/${workspaceSlug}` : getPublicBaseUrl();

  return {
    Hoy: [
      { label: "Resumen", href: "/app" },
      { label: "Inmobiliaria", href: "/app/public" },
      { label: "Agregar propiedad", href: "/app/properties/new" },
    ],
    Inventario: [
      { label: "Propiedades", href: "/app/properties" },
      { label: "Nueva propiedad", href: "/app/properties/new" },
      { label: "Recorridos", href: "/app/tours" },
    ],
    Interesados: [
      { label: "Interesados", href: "/app/leads" },
      { label: "Recorridos", href: "/app/tours" },
    ],
    Presencia: [
      { label: "Inmobiliaria", href: "/app/public" },
      { label: "Publicidad", href: "/app/public#publicidad" },
      { label: "Perfiles comerciales", href: "/app/public/agents" },
      { label: "Inventario público", href: "/app/public/properties" },
      { label: "Ver sitio público", href: publicHome, external: true },
    ],
    Equipo: [
      { label: "Usuarios y perfiles", href: "/app/team" },
      { label: "Inmobiliaria", href: "/app/public" },
      { label: "Cuenta", href: "/app/subscription" },
    ],
  };
}

function getPillClasses(isActive: boolean, compact = false) {
  const base = compact ? "px-4 py-2.5 text-sm" : "px-4 py-3 text-sm";
  const state = isActive
    ? "border-[color:var(--admin-sand)]/45 bg-[color:var(--admin-sand-soft)] text-[color:var(--admin-ink)] shadow-[0_12px_26px_rgba(20,33,61,0.10)]"
    : "border-[color:var(--admin-line)] bg-white text-slate-700 hover:border-[color:var(--admin-sand)]/35 hover:bg-[color:var(--admin-cloud)]";

  return `flex items-center justify-center rounded-full border font-medium transition ${base} ${state}`;
}

function getPanelLinkClasses(isActive: boolean) {
  return `block rounded-[1.35rem] border px-4 py-4 transition ${
    isActive
      ? "border-[color:var(--admin-sand)]/45 bg-[linear-gradient(180deg,#fff8eb_0%,#fff2db_100%)] shadow-[0_18px_40px_rgba(20,33,61,0.09)]"
      : "border-[color:var(--admin-line)] bg-white hover:border-slate-300 hover:bg-[color:var(--admin-cloud)]"
  }`;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useSupabaseAuth();
  const { activeWorkspace, memberships, setActiveWorkspaceId } = useActiveWorkspace();
  const pathname = usePathname();

  const activePrimaryItem = primaryNavItems.find((item) => item.match(pathname)) ?? primaryNavItems[0];
  const secondaryNavItems = getSecondaryNavItems(activeWorkspace?.workspaceSlug);
  const currentSecondaryItems = secondaryNavItems[activePrimaryItem.label] ?? [];

  const workspaceBrandLabel = activeWorkspace?.brandName ?? activeWorkspace?.workspaceName ?? activeWorkspace?.workspaceSlug ?? "Tu inmobiliaria";
  const workspaceSupportLabel = activeWorkspace?.publicClaim ?? activeWorkspace?.workspaceSlug ?? activeWorkspace?.workspaceId ?? "Configura la presencia pública de tu inmobiliaria";
  const canSwitchWorkspace = memberships.length > 1;

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/app";
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8ee_0%,#f8fafc_34%,#edf3f8_100%)] text-slate-950">
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/92 px-3 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Inmobiliaria activa</p>
            <h1 className="truncate text-lg font-semibold text-slate-950">{workspaceBrandLabel}</h1>
            <p className="truncate text-xs text-slate-500">{workspaceSupportLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 rounded-full bg-[color:var(--admin-ink)] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[color:var(--admin-ink-soft)]"
          >
            Salir
          </button>
        </div>

        {canSwitchWorkspace ? (
          <select
            aria-label="Cambiar inmobiliaria activa"
            value={activeWorkspace?.workspaceId ?? ""}
            onChange={(event) => setActiveWorkspaceId(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none"
          >
            {memberships.map((membership) => (
              <option key={membership.workspaceId ?? "none"} value={membership.workspaceId ?? ""}>
                {membership.brandName ?? membership.workspaceName ?? membership.workspaceSlug ?? "Inmobiliaria"}
              </option>
            ))}
          </select>
        ) : null}

        <nav className="mt-3 grid grid-cols-5 gap-1.5">
          {primaryNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              title={`${item.label}: ${item.description}`}
              aria-label={`${item.label}: ${item.description}`}
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl border px-1 py-2 text-center transition ${
                item.match(pathname)
                  ? "border-[color:var(--admin-sand)]/55 bg-[color:var(--admin-sand-soft)] text-[color:var(--admin-ink)] shadow-[0_12px_24px_rgba(20,33,61,0.10)]"
                  : "border-[color:var(--admin-line)] bg-white text-slate-600"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="mt-1 max-w-full truncate text-[11px] font-semibold leading-none">{item.shortLabel}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-3">
          <PWAInstallPrompt compact />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1480px] gap-4 px-3 py-4 sm:px-5 sm:py-6 xl:grid-cols-[320px_1fr] xl:gap-6 xl:px-8 xl:py-8">
        <aside className="hidden rounded-[2.35rem] border border-[color:var(--admin-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.96))] p-6 shadow-[0_28px_70px_rgba(20,33,61,0.10)] backdrop-blur xl:block">
          <div className="rounded-[1.9rem] border border-slate-200/90 bg-white/90 p-5">
            <p className="text-[10px] uppercase tracking-[0.30em] text-slate-400">Tu inmobiliaria</p>
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
            <div className="mt-5 rounded-[1.4rem] border border-[color:var(--admin-sand)]/35 bg-[linear-gradient(180deg,#fff8eb_0%,#fdf1dd_100%)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#9b7b3a]">Operación</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Controla inventario, clientes, perfiles comerciales y sitio público desde un mismo lugar.</p>
            </div>
            {canSwitchWorkspace ? (
              <label className="mt-4 block space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Cambiar inmobiliaria</span>
                <select
                  value={activeWorkspace?.workspaceId ?? ""}
                  onChange={(event) => setActiveWorkspaceId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none"
                >
                  {memberships.map((membership) => (
                    <option key={membership.workspaceId ?? "none"} value={membership.workspaceId ?? ""}>
                      {membership.brandName ?? membership.workspaceName ?? membership.workspaceSlug ?? "Inmobiliaria"}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
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
                    <span className={`mt-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${isActive ? "bg-[color:var(--admin-ink)] text-white" : "bg-slate-100 text-slate-500"}`}>
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
                <Link href="/app/subscription" className="mt-3 inline-flex text-xs font-semibold text-slate-500 transition hover:text-slate-950">
                  Ver cuenta y capacidad
                </Link>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-[color:var(--admin-line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[color:var(--admin-cloud)]"
              >
                Salir
              </button>
            </div>
            <div className="mt-4">
              <PWAInstallPrompt />
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-[color:var(--admin-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,251,254,0.95))] p-4 shadow-[0_20px_55px_rgba(20,33,61,0.08)] backdrop-blur sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Operación de la inmobiliaria</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{activePrimaryItem.label}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{activePrimaryItem.description}</p>
              </div>
              <div className="rounded-[1.4rem] border border-[color:var(--admin-line)] bg-[color:var(--admin-cloud)] px-4 py-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{workspaceBrandLabel}</p>
                <p className="mt-1">{activeWorkspace?.workspaceSlug ? `/${activeWorkspace.workspaceSlug}` : "Inmobiliaria activa"}</p>
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

          <section className="rounded-[1.6rem] border border-[color:var(--admin-line)] bg-white/95 p-4 shadow-[0_20px_50px_rgba(20,33,61,0.07)] backdrop-blur sm:p-6 lg:rounded-[2rem] lg:p-8">
            {children}
          </section>
        </section>
      </div>
    </div>
  );
}
