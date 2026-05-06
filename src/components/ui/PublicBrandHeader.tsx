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
        <Link href={homeHref} className="flex min-w-0 items-center">
          {logoUrl ? (
            <Image src={logoUrl} alt={brandName} width={260} height={100} className="h-auto max-h-14 w-auto max-w-44 object-contain drop-shadow-[0_10px_22px_rgba(15,23,42,0.12)] sm:max-h-16 sm:max-w-56" unoptimized />
          ) : (
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-800">{brandName}</span>
          )}
        </Link>
        <nav className="hidden shrink-0 items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href={homeHref} className="transition hover:text-slate-950">Inicio</Link>
          <Link href={propertiesHref} className="transition hover:text-slate-950">Propiedades</Link>
        </nav>
      </div>
    </header>
  );
}
