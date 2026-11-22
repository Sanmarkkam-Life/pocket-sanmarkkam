"use client";

import { useEffect } from "react";

/** Registers the service worker in production builds only (a worker caching `next dev` files gets in the way). */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline reading is an extra; never show an error for it */
    });
  }, []);
  return null;
}
