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
      <div className="rounded-[2.15rem] bg-[#fffaf4] px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.10)] ring-1 ring-[#dac7aa] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-5">
          {filterGroups.map((group) => (
            <div key={group.key} className="rounded-[1.5rem] border border-[#eadcc6] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6f573a]">{group.label}</span>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {group.options.map((option) => {
                  const active = current[group.key] === option.value;

                  return (
                    <Link
                      key={`${group.key}-${option.value}`}
                      href={buildHref(basePath, current, group.key, option.value)}
                      className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "border-[#17120e] bg-[#17120e] text-[#fff7ec] shadow-[0_12px_24px_rgba(23,18,14,0.18)]"
                          : "border-[#cdb38b] bg-[#fff7ea] text-[#221a13] hover:border-[#b9925b] hover:bg-[#f6ead8] hover:text-[#17120d]"
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
              className="rounded-full border border-[#bda27d] bg-[#f5e8d2] px-4 py-2.5 text-sm font-semibold text-[#241c15] transition hover:border-[#9f7b4c] hover:bg-[#edd9b7] hover:text-[#17120d]"
            >
              Limpiar filtros
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
