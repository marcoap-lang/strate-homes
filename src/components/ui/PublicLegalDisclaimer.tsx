import { PUBLIC_PROPERTY_DISCLAIMER } from "@/lib/public-legal";

export function PublicLegalDisclaimer() {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 text-sm leading-7 text-zinc-500 shadow-sm">
      <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Aviso legal</p>
      <p className="mt-4 whitespace-pre-line">{PUBLIC_PROPERTY_DISCLAIMER}</p>
    </section>
  );
}
