import Link from "next/link";

type FilterOption = { label: string; value: string };

const filterGroups: Array<{ key: string; label: string; options: FilterOption[] }> = [
  {
    key: "operation",
    label: "Operación",
    options: [
      { label: "Venta", value: "sale" },
      { label: "Renta", value: "rent" },
    ],
  },
  {
    key: "location",
    label: "Ubicación",
    options: [
      { label: "Veracruz", value: "Veracruz" },
      { label: "Boca del Río", value: "Boca del Río" },
      { label: "Riviera", value: "Riviera" },
    ],
  },
  {
    key: "price",
    label: "Precio",
    options: [
      { label: "<$1M", value: "under-1m" },
      { label: "$1M-$3M", value: "1m-3m" },
      { label: ">$3M", value: "3m-plus" },
    ],
  },
  {
    key: "bedrooms",
    label: "Recámaras",
    options: [
      { label: "2+", value: "2" },
      { label: "3+", value: "3" },
      { label: "4+", value: "4" },
    ],
  },
];

function buildHref(basePath: string, current: Record<string, string | undefined>, key: string, value: string) {
  const params = new URLSearchParams();

  Object.entries(current).forEach(([entryKey, entryValue]) => {
    if (entryValue && entryKey !== key) params.set(entryKey, entryValue);
  });

  if (current[key] !== value) {
    params.set(key, value);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function PublicLuxuryFilters({
  compact = false,
  basePath = "/properties",
  current = {},
}: {
  compact?: boolean;
  basePath?: string;
  current?: Record<string, string | undefined>;
}) {
  return (
    <section className={compact ? "pt-4" : "pt-8"}>
      <div className="rounded-[2.15rem] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)] px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.10)] ring-1 ring-[#eadcc8] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4">
          {filterGroups.map((group) => (
            <div key={group.key} className="grid gap-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start">
              <span className="pt-1 text-[11px] uppercase tracking-[0.28em] text-[#8d7960]">{group.label}</span>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const active = current[group.key] === option.value;

                  return (
                    <Link
                      key={`${group.key}-${option.value}`}
                      href={buildHref(basePath, current, group.key, option.value)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                        active
                          ? "border-[#d0a35b] bg-[#d0a35b] text-[#1a1510] shadow-[0_10px_24px_rgba(208,163,91,0.26)]"
                          : "border-[#eadfce] bg-white text-[#4d4034] hover:border-[#d8bc90] hover:bg-[#f9f2e8] hover:text-[#1d1813]"
                      }`}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <Link
              href={basePath}
              className="rounded-full border border-[#d7c7b1] bg-white px-4 py-2.5 text-sm font-medium text-[#5c4b3d] transition hover:border-[#cdae7f] hover:bg-[#fbf3e8] hover:text-[#1d1813]"
            >
              Limpiar filtros
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
