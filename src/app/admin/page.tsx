import { AdminShell } from "@/components/ui/AdminShell";
import Link from "next/link";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Resumen</p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-950">Admin principal</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Tu operación ya está separada por vistas. Entra a propiedades para ver el inventario real del workspace, crear una nueva propiedad o editar una existente en su propia pantalla.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/properties" className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800">
                Ver propiedades
              </Link>
              <Link href="/admin/properties/new" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
                Agregar propiedad
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
