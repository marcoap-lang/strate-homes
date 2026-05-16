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
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#100d0b]/88 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 lg:px-8 lg:py-4">
        <Link href={homeHref} className="flex min-w-0 items-center gap-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={brandName}
              width={360}
              height={140}
              className="h-auto max-h-16 w-auto max-w-[11.5rem] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.28)] sm:max-h-20 sm:max-w-[16rem]"
              unoptimized
            />
          ) : (
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#c8ad83]">Inmobiliaria</p>
              <p className="mt-1 truncate text-base font-medium text-[#f8efe3]">{brandName}</p>
            </div>
          )}
        </Link>
        <nav className="hidden shrink-0 items-center gap-2 md:flex">
          <Link
            href={homeHref}
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/86 transition hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
          >
            Inicio
          </Link>
          <Link
            href={propertiesHref}
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/86 transition hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
          >
            Propiedades
          </Link>
        </nav>
      </div>
    </header>
  );
}
