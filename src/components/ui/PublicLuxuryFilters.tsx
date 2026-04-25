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
      { label: "Miami", value: "Miami" },
      { label: "Brickell", value: "Brickell" },
      { label: "Coral Gables", value: "Coral Gables" },
    ],
  },
  {
    key: "type",
    label: "Tipo",
    options: [
      { label: "Casa", value: "house" },
      { label: "Depto", value: "apartment" },
      { label: "Oficina", value: "office" },
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
      <div className="rounded-[2rem] bg-white px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          {filterGroups.map((group) => (
            <div key={group.key} className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[11px] uppercase tracking-[0.26em] text-zinc-400">{group.label}</span>
              {group.options.map((option) => {
                const active = current[group.key] === option.value;

                return (
                  <Link
                    key={`${group.key}-${option.value}`}
                    href={buildHref(basePath, current, group.key, option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition ${active ? "bg-zinc-900 text-white" : "border border-black/8 bg-[#fcfbf8] text-zinc-700 hover:border-black/15 hover:bg-white hover:text-zinc-950"}`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          ))}
          <Link href={basePath} className="ml-auto rounded-full border border-black/8 px-4 py-2 text-sm text-zinc-600 transition hover:bg-[#fcfbf8] hover:text-zinc-950">
            Limpiar
          </Link>
        </div>
      </div>
    </section>
  );
}
