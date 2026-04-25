"use client";

import { useState } from "react";

export function PublicShareActions({
  propertyUrl,
  whatsappUrl,
}: {
  propertyUrl: string;
  whatsappUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-sky-100"
      >
        Contactar por WhatsApp
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {copied ? "Link copiado" : "Copiar link de propiedad"}
      </button>
    </div>
  );
}
