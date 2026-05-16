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
    <header className="sticky top-4 z-50 px-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-white/10 bg-[#120f0c]/78 px-5 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:px-7 lg:py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-36 bg-[linear-gradient(90deg,rgba(208,163,91,0.18),rgba(208,163,91,0.04),transparent)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]" />

          <div className="relative flex items-center justify-between gap-5">
            <Link href={homeHref} className="flex min-w-0 items-center gap-4">
              {logoUrl ? (
                <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-4 sm:py-3">
                  <Image
                    src={logoUrl}
                    alt={brandName}
                    width={420}
                    height={150}
                    className="h-auto max-h-[3.25rem] w-auto max-w-[11rem] object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.28)] sm:max-h-[4.4rem] sm:max-w-[16.75rem]"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#c8ad83]">Inmobiliaria</p>
                  <p className="mt-1 truncate text-base font-medium text-[#f8efe3]">{brandName}</p>
                </div>
              )}

              <div className="hidden min-w-0 xl:block">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#c8ad83]">Residencias y propiedades</p>
                <p className="mt-1 truncate text-sm text-white/74">{brandName}</p>
              </div>
            </Link>

            <nav className="hidden shrink-0 items-center gap-2 md:flex">
              <Link
                href={homeHref}
                className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/84 transition hover:border-white/24 hover:bg-white/[0.10] hover:text-white"
              >
                Inicio
              </Link>
              <Link
                href={propertiesHref}
                className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/84 transition hover:border-white/24 hover:bg-white/[0.10] hover:text-white"
              >
                Propiedades
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
