import { AdminAccessClient } from "@/components/ui/AdminAccessClient";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Strate Homes</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Entrar a la app</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Acceso privado para operar propiedades, leads y equipo.</p>
        </div>

        <AdminAccessClient />
      </div>
    </main>
  );
}
