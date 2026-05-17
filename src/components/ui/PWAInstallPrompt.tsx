"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PWAInstallPrompt({ compact = false }: { compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(() => typeof window !== "undefined" && isIOS() && !isStandalone());
  const [isInstalled, setIsInstalled] = useState(() => typeof window !== "undefined" && isStandalone());

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowIOSHelp(false);
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowIOSHelp(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (isInstalled) {
    return compact ? null : (
      <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Strate Homes ya esta instalada como app en este dispositivo.
      </div>
    );
  }

  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className={compact
          ? "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          : "w-full rounded-full bg-[color:var(--admin-ink)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-ink-soft)]"}
      >
        Instalar app
      </button>
    );
  }

  if (showIOSHelp) {
    return (
      <div className={compact ? "rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600" : "rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600"}>
        En iPhone: toca Compartir y luego Agregar a pantalla de inicio.
      </div>
    );
  }

  return null;
}
