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
      <div className="rounded-[2.15rem] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)] px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.10)] ring-1 ring-[#e2d1b8] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4">
          {filterGroups.map((group) => (
            <div key={group.key} className="grid gap-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start">
              <span className="pt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-[#7f6749]">{group.label}</span>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const active = current[group.key] === option.value;

                  return (
                    <Link
                      key={`${group.key}-${option.value}`}
                      href={buildHref(basePath, current, group.key, option.value)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "border-[#d6b27a] bg-[#1b1611] text-[#f7e7c8] shadow-[0_12px_26px_rgba(27,22,17,0.20)]"
                          : "border-[#d8c3a1] bg-[#fffaf3] text-[#2f251c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-[#cda66d] hover:bg-[#fbf1e2] hover:text-[#17120d]"
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
              className="rounded-full border border-[#d1b892] bg-[#fff8ee] px-4 py-2.5 text-sm font-semibold text-[#3f3227] transition hover:border-[#be9660] hover:bg-[#f6ead8] hover:text-[#17120d]"
            >
              Limpiar filtros
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
