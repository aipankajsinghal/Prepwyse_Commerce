"use client";

import { useEffect, useState } from "react";
import { useToast } from "./ToastProvider";

export function ServiceWorkerRegistration() {
  const toast = useToast();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setRegistration(reg);

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New service worker available
                setWaitingWorker(newWorker);
                toast.info("New version available! Refresh to update.", 0); // 0 = no auto-dismiss
              }
            });
          }
        });

        // Check if there's a waiting worker on load
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          toast.info("New version available! Refresh to update.", 0);
        }

        console.log("[SW] Service Worker registered successfully");
      } catch (error) {
        console.error("[SW] Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      toast.success("App updated! Changes will apply on next page load.");
    });

    // Check for updates periodically (every hour)
    const updateInterval = setInterval(() => {
      if (registration) {
        registration.update();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(updateInterval);
  }, [toast, registration]);

  // Handle update click
  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  // This component doesn't render anything visible
  return null;
}
