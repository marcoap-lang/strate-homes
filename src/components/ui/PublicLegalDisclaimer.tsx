import { PUBLIC_PROPERTY_DISCLAIMER } from "@/lib/public-legal";

const [legalHeading = "Información importante", ...legalBody] = PUBLIC_PROPERTY_DISCLAIMER.split("\n").filter(Boolean);

export function PublicLegalDisclaimer() {
  return (
    <section className="rounded-[1.8rem] border border-slate-200/80 bg-white/75 p-5 text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400">Aviso legal</p>
          <h2 className="mt-2 text-base font-semibold tracking-tight text-slate-900">{legalHeading.replace(/[¡!]/g, "")}</h2>
        </div>
        <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-800">
          Informativo
        </span>
      </div>

      <div className="mt-5 grid gap-4 text-xs leading-6 text-slate-500 md:grid-cols-2">
        {legalBody.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
