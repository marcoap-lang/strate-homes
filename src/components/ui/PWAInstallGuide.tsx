"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function detectPlatform() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  return "desktop";
}

export function PWAInstallGuide() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => (typeof window === "undefined" ? false : isStandalone()));
  const [platform] = useState<"ios" | "android" | "desktop">(() => (typeof window === "undefined" ? "desktop" : detectPlatform()));
  const [installStatus, setInstallStatus] = useState<"idle" | "prompted" | "dismissed">("idle");

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const platformLabel = useMemo(() => {
    if (platform === "ios") return "iPhone o iPad";
    if (platform === "android") return "Android";
    return "computadora";
  }, [platform]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstallStatus("prompted");
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setInstallStatus(choice.outcome === "accepted" ? "prompted" : "dismissed");
    setDeferredPrompt(null);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <article className="rounded-[2.4rem] border border-[#d8c9b4] bg-[#fffaf3] p-6 shadow-[0_24px_70px_rgba(43,33,24,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a6a43]">Instalacion detectada</p>
        <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#17120e]">
          {installed ? "Strate Homes ya esta instalada." : `Estas entrando desde ${platformLabel}.`}
        </h2>
        <p className="mt-5 text-sm leading-7 text-[#655848]">
          {installed
            ? "Puedes abrirla desde tu pantalla de inicio como una app normal, sin buscar la liga cada vez."
            : "Instalarla deja Strate Homes en la pantalla de inicio, abre en una ventana mas limpia y facilita operar propiedades, interesados y equipo desde el telefono."}
        </p>

        {deferredPrompt && !installed ? (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-7 w-full rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-semibold text-[#17120e] shadow-[0_18px_40px_rgba(215,171,91,0.28)] transition hover:bg-[#e3ba72] sm:w-auto"
          >
            Instalar Strate Homes
          </button>
        ) : null}

        {!deferredPrompt && platform === "android" && !installed ? (
          <div className="mt-7 rounded-[1.6rem] border border-[#e2d4c0] bg-white p-5 text-sm leading-7 text-[#655848]">
            Si no aparece el boton automatico, abre el menu de Chrome y toca <strong className="text-[#17120e]">Instalar app</strong> o <strong className="text-[#17120e]">Agregar a pantalla principal</strong>.
          </div>
        ) : null}

        {installStatus === "dismissed" ? (
          <p className="mt-4 text-sm leading-6 text-[#8a6a43]">No pasa nada: puedes volver a intentar desde esta misma pagina o desde el menu del navegador.</p>
        ) : null}
      </article>

      <article className="overflow-hidden rounded-[2.4rem] bg-[#17120e] p-6 text-[#fff8ee] shadow-[0_24px_70px_rgba(43,33,24,0.18)] sm:p-8">
        <div className="absolute" />
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7ab5b]">Guia rapida</p>
        <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em]">Como dejar Homes como app en tu telefono.</h2>
        <div className="mt-7 grid gap-3">
          {[
            ["iPhone", "Abre esta pagina en Safari, toca el icono Compartir y elige Agregar a pantalla de inicio."],
            ["Android", "Toca Instalar si aparece el boton. Si no, abre el menu de Chrome y elige Instalar app."],
            ["Despues", "Entra desde el nuevo icono de Strate Homes y opera la app en pantalla completa."],
          ].map(([title, body], index) => (
            <div key={title} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-4 sm:grid-cols-[52px_1fr]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7ab5b] text-sm font-bold text-[#17120e]">{index + 1}</span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-white/62">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
