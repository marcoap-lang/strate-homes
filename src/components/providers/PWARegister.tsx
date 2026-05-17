"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (window.location.protocol !== "https:" && !isLocalhost) return;

    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    }).catch((error) => {
      console.warn("PWA service worker registration failed", error);
    });
  }, []);

  return null;
}
