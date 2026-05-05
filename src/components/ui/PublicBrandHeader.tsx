import Image from "next/image";
import Link from "next/link";

export function PublicBrandHeader({
  brandName,
  logoUrl,
  homeHref,
  propertiesHref,
}: {
  brandName: string;
  logoUrl?: string | null;
  homeHref: string;
  propertiesHref: string;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#f7fbff]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8 lg:py-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-12 sm:w-12">
            {logoUrl ? <Image src={logoUrl} alt={brandName} fill className="object-contain p-2" unoptimized /> : <span className="text-sm font-semibold text-slate-700">{brandName.slice(0, 1).toUpperCase()}</span>}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-slate-800 sm:text-sm sm:tracking-[0.32em]">{brandName}</p>
          </div>
        </div>
        <nav className="hidden shrink-0 items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href={homeHref} className="transition hover:text-slate-950">Inicio</Link>
          <Link href={propertiesHref} className="transition hover:text-slate-950">Propiedades</Link>
        </nav>
      </div>
    </header>
  );
}
