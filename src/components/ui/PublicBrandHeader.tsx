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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {logoUrl ? <Image src={logoUrl} alt={brandName} fill className="object-contain p-2" unoptimized /> : <span className="text-sm font-semibold text-slate-700">{brandName.slice(0, 1).toUpperCase()}</span>}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-800">{brandName}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href={homeHref} className="transition hover:text-slate-950">Inicio</Link>
          <Link href={propertiesHref} className="transition hover:text-slate-950">Propiedades</Link>
        </nav>
      </div>
    </header>
  );
}
