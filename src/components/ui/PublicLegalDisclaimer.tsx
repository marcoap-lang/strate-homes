import { PUBLIC_PROPERTY_DISCLAIMER } from "@/lib/public-legal";

const [legalHeading = "Información importante", ...legalBody] = PUBLIC_PROPERTY_DISCLAIMER.split("\n").filter(Boolean);
const cleanHeading = legalHeading.replace(/[¡!]/g, "");

export function PublicLegalDisclaimer() {
  return (
    <section className="rounded-[1.6rem] border border-slate-200/80 bg-white/70 p-4 text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.04)] backdrop-blur sm:rounded-[2rem] sm:p-5">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[1.2rem] outline-none transition hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-[#d7ab5b]/50">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-slate-400">Aviso legal</p>
            <h2 className="mt-1 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{cleanHeading}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              La información publicada es ilustrativa y debe confirmarse antes de cualquier operación.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition group-open:bg-slate-950 group-open:text-white">
            Ver detalle
          </span>
        </summary>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="grid gap-4 text-xs leading-6 text-slate-500 md:grid-cols-2">
            {legalBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
