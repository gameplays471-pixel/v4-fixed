"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Registra o service worker do app e avisa o usuário quando uma nova
 * versão já foi baixada e está pronta (basta recarregar pra aplicar).
 * Não renderiza nada visível por padrão — só o toast de atualização.
 */
export function PwaRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Se já existe uma versão esperando (ex.: app foi aberto de novo
        // depois de uma atualização baixada em segundo plano).
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker);
            }
          });
        });
      } catch (err) {
        console.warn("[PWA] Falha ao registrar service worker:", err);
      }
    }

    // Recarrega a página uma única vez quando o novo SW assume o controle.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    register();
  }, []);

  useEffect(() => {
    if (!waitingWorker) return;

    toast("Nova versão do GEMgym disponível", {
      description: "Toque para atualizar agora.",
      duration: Infinity,
      action: {
        label: "Atualizar",
        onClick: () => {
          waitingWorker.postMessage("SKIP_WAITING");
        },
      },
    });
  }, [waitingWorker]);

  return null;
}
