import { PUBLIC_PROPERTY_DISCLAIMER } from "@/lib/public-legal";

export function PublicLegalDisclaimer() {
  return (
    <section className="border-t border-black/6 pt-8 text-sm leading-7 text-zinc-500">
      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-400">Aviso legal</p>
      <p className="mt-4 whitespace-pre-line">{PUBLIC_PROPERTY_DISCLAIMER}</p>
    </section>
  );
}
