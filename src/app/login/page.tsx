import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { getSafeAuthNextPath } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = getSafeAuthNextPath(params?.next);
  const isPlatformAdminLogin = nextPath === "/admin";

  return (
    <main className={`min-h-screen px-4 py-8 text-slate-950 sm:px-6 lg:px-8 ${isPlatformAdminLogin ? "bg-[radial-gradient(circle_at_top_left,#2f251b_0%,#101723_42%,#060a12_100%)]" : "bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)]"}`}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <p className={`text-xs uppercase tracking-[0.28em] ${isPlatformAdminLogin ? "text-[#d7ab5b]" : "text-slate-500"}`}>Strate Homes</p>
          <h1 className={`mt-3 text-3xl font-semibold tracking-tight ${isPlatformAdminLogin ? "text-white" : "text-slate-950"}`}>
            {isPlatformAdminLogin ? "Admin interno Strate" : "Entrar a la app"}
          </h1>
          <p className={`mt-3 text-sm leading-6 ${isPlatformAdminLogin ? "text-white/60" : "text-slate-600"}`}>
            {isPlatformAdminLogin
              ? "Acceso reservado para operar, monitorear y dar soporte a cuentas de Strate Homes."
              : "Acceso privado para operar propiedades, leads y equipo."}
          </p>
        </div>

        <AdminAccessClient postAuthRedirectPath={nextPath} allowRegistration={!isPlatformAdminLogin} />
      </div>
    </main>
  );
}
