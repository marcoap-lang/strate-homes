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
        className="flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Compartir por WhatsApp
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-center rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
      >
        {copied ? "Link copiado" : "Copiar link de propiedad"}
      </button>
    </div>
  );
}
