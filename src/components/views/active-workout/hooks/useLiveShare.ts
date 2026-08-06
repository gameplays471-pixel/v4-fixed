import { useCallback, useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

/** Snapshot enviado periodicamente pro servidor enquanto a transmissão está ligada. */
export interface LiveSnapshot {
  elapsed: number;
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  totalCardioMin: number;
  exercises: Array<{
    name: string;
    isCardio: boolean;
    totalSets: number;
    completedSets: number;
    current: boolean;
  }>;
}

const SNAPSHOT_INTERVAL_MS = 12_000;

/**
 * Controla o ciclo "compartilhar treino ao vivo" — start/stop e o envio
 * periódico de progresso. Desligado por padrão ("off-live"): só existe
 * transmissão enquanto `sharing` for true, e a pessoa escolhe isso na hora.
 *
 * `getSnapshot` é lido via ref pra sempre pegar o estado mais recente do
 * treino (setsMap/cardioMap mudam a cada toque) sem precisar recriar o
 * intervalo a cada render.
 */
export function useLiveShare(workoutId: string, workoutName: string, getSnapshot: () => LiveSnapshot) {
  const [sharing, setSharing] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getSnapshotRef = useRef(getSnapshot);
  useEffect(() => {
    getSnapshotRef.current = getSnapshot;
  });

  const pushSnapshot = useCallback(() => {
    apiPost("/api/sessions/live/snapshot", { snapshot: getSnapshotRef.current() }).catch(() => {
      // Best-effort — uma falha pontual de rede não deveria interromper o treino.
    });
  }, []);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiPost<{ slug: string }>("/api/sessions/live/start", { workoutId, workoutName });
      setSlug(res.slug);
      setSharing(true);
      return res.slug;
    } catch (e) {
      console.error("Erro ao iniciar transmissão ao vivo:", e);
      toast.error("Não foi possível iniciar a transmissão ao vivo.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [workoutId, workoutName]);

  const stop = useCallback(() => {
    setSharing(false);
    setSlug(null);
    apiPost("/api/sessions/live/stop").catch(() => {});
  }, []);

  useEffect(() => {
    if (!sharing) return;
    pushSnapshot(); // imediato ao ligar, não espera o primeiro intervalo
    const id = setInterval(pushSnapshot, SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sharing, pushSnapshot]);

  // Se a pessoa fechar a aba/app com a transmissão ligada sem clicar em
  // "Cancelar"/"Finalizar" (que já chamam stop explicitamente), tentamos
  // avisar o servidor mesmo assim — best-effort, sem bloquear o unload.
  useEffect(() => {
    if (!sharing) return;
    const handleUnload = () => {
      navigator.sendBeacon?.("/api/sessions/live/stop", new Blob([], { type: "application/json" }));
    };
    window.addEventListener("pagehide", handleUnload);
    return () => window.removeEventListener("pagehide", handleUnload);
  }, [sharing]);

  return { sharing, slug, loading, start, stop };
}
