"use client";

import { useState } from "react";

export function PublicShareActions({
  propertyUrl,
  whatsappUrl,
  sticky = false,
}: {
  propertyUrl: string;
  whatsappUrl?: string;
  sticky?: boolean;
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

  if (sticky) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/40 bg-white/88 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-full bg-[#d7ab5b] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(215,171,91,0.35)] transition hover:bg-[#c99a46]"
            >
              WhatsApp
            </a>
          ) : (
            <div className="flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-600">
              Sin WhatsApp
            </div>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {copied ? "Copiado" : "Compartir"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 hidden space-y-3 md:block">
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-sky-100"
        >
          Contactar por WhatsApp
        </a>
      ) : (
        <div className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600">
          Sin WhatsApp disponible por ahora
        </div>
      )}
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
