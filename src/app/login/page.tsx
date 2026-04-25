import Link from "next/link";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f9f6f1_0%,#f4efe7_100%)] px-6 py-10 text-stone-950 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Strate Homes</p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-950">Acceso para usuarios existentes</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Inicia sesión o crea tu cuenta para entrar al admin de Strate Homes.
            </p>
          </div>
          <Link href="/" className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
            Volver al sitio
          </Link>
        </div>

        <AdminAccessClient />
      </div>
    </main>
  );
}
