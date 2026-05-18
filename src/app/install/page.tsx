import type { Metadata } from "next";
import Link from "next/link";
import { PWAInstallGuide } from "@/components/ui/PWAInstallGuide";

export const metadata: Metadata = {
  title: "Instalar app",
  description: "Instala Strate Homes en iPhone, Android o escritorio para operar tu inmobiliaria desde la pantalla de inicio.",
};

export default function InstallPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4efe6] text-[#15110d]">
      <header className="border-b border-[#e0d4c2]/70 bg-[#f7f1e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#a18461]">Strate Homes</p>
            <p className="mt-1 hidden text-sm text-[#4d4236] sm:block">Instalacion en telefono y escritorio</p>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login?next=/app" className="rounded-full border border-[#d8c9b4] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#2a2118] transition hover:bg-white">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-5 py-14 sm:py-18 lg:px-8 lg:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_14%,rgba(215,171,91,0.34),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(23,18,14,0.16),transparent_34%),linear-gradient(180deg,#f7f1e8_0%,#efe6da_100%)]" />
        <div className="mx-auto max-w-7xl">
          <p className="inline-flex rounded-full border border-[#d8c9b4] bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8a6a43] shadow-sm">
            App instalable
          </p>
          <h1 className="mt-7 max-w-5xl font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#17120e] sm:text-7xl lg:text-[6.4rem]">
            Instala Strate Homes en tu pantalla de inicio.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#655848]">
            Usa Homes como una app: abre mas rapido, entra directo a tu operacion y evita buscar la liga cada vez que necesitas revisar propiedades, interesados o equipo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/app" className="inline-flex justify-center rounded-full bg-[#17120e] px-6 py-4 text-sm font-semibold text-[#fff8ee] transition hover:bg-[#2a2118]">
              Ir a la app
            </Link>
            <Link href="/" className="inline-flex justify-center rounded-full border border-[#d8c9b4] bg-white/72 px-6 py-4 text-sm font-semibold text-[#2a2118] transition hover:bg-white">
              Volver al sitio
            </Link>
          </div>
        </div>
      </section>

      <PWAInstallGuide />
    </main>
  );
}
