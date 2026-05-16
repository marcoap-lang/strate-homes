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
    <header className="sticky top-3 z-50 px-4 lg:top-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#120f0c]/72 px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl lg:rounded-[1.85rem] lg:px-7 lg:py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-[linear-gradient(90deg,rgba(208,163,91,0.16),rgba(208,163,91,0.04),transparent)] lg:w-36" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]" />

          <div className="relative flex items-center justify-between gap-3">
            <Link href={homeHref} className="flex min-w-0 flex-1 items-center gap-3">
              {logoUrl ? (
                <div className="rounded-[1.05rem] border border-[#e6d3b0]/26 bg-[linear-gradient(180deg,rgba(250,244,235,0.94),rgba(236,222,198,0.78))] px-2 py-1.5 shadow-[0_16px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.48)] sm:px-2.5 sm:py-2">
                  <Image
                    src={logoUrl}
                    alt={brandName}
                    width={420}
                    height={150}
                    className="h-auto max-h-[3.1rem] w-auto max-w-[9.6rem] object-contain object-left drop-shadow-[0_10px_18px_rgba(15,23,42,0.18)] sm:max-h-[3.9rem] sm:max-w-[14.25rem] lg:max-h-[4.5rem] lg:max-w-[17.5rem]"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#c8ad83]">Inmobiliaria</p>
                  <p className="mt-1 truncate text-base font-medium text-[#f8efe3]">{brandName}</p>
                </div>
              )}

              <div className="hidden min-w-0 lg:block">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#c8ad83]">Residencias y propiedades</p>
                <p className="mt-1 truncate text-sm text-white/74">{brandName}</p>
              </div>
            </Link>

            <nav className="flex shrink-0 items-center gap-2">
              <Link
                href={homeHref}
                className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/84 transition hover:border-white/24 hover:bg-white/[0.10] hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Inicio
              </Link>
              <Link
                href={propertiesHref}
                className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/84 transition hover:border-white/24 hover:bg-white/[0.10] hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
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
