import { AdminShell } from "@/components/ui/AdminShell";
import Link from "next/link";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Acceso requerido</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Inicia sesión para entrar al admin</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Si ya tienes cuenta, entra desde la pantalla dedicada de acceso. Si todavía no la tienes, puedes crearla ahí mismo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]">
                Ir a /login
              </Link>
              <Link href="/" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Volver al sitio público
              </Link>
            </div>
          </div>
          <AdminAccessClient />
        </div>
      ) : access.kind === "ready" ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resumen</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Admin principal</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Tu operación ya está separada por vistas. Entra a propiedades para ver el inventario real del workspace, crear una nueva propiedad o editar una existente en su propia pantalla.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/properties" className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]">
                Ver propiedades
              </Link>
              <Link href="/admin/properties/new" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Agregar propiedad
              </Link>
              <Link href="/admin/team" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Ver equipo
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
