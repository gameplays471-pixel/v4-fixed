import { useCallback, useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

/** Snapshot enviado periodicamente pro servidor enquanto a transmissão está ligada. */
export interface LiveSetSnapshot {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  isPR?: boolean;
}

export interface LiveExerciseSnapshot {
  name: string;
  isCardio: boolean;
  muscleGroup?: string;
  imageUrl?: string | null;
  totalSets: number;
  completedSets: number;
  current: boolean;
  targetReps?: number;
  /** Séries com peso/reps — espelha a tela do treino ativo */
  sets?: LiveSetSnapshot[];
  cardio?: {
    completed: boolean;
    durationSec?: number | null;
    distanceKm?: number | null;
    intensity?: string | null;
  };
}

export interface LiveSnapshot {
  elapsed: number;
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  totalCardioMin: number;
  exercises: LiveExerciseSnapshot[];
}

// Push mais agressivo = espectador vê série a série quase em tempo real
const SNAPSHOT_INTERVAL_MS = 2_500;

export function useLiveShare(
  workoutId: string,
  workoutName: string,
  getSnapshot: () => LiveSnapshot
) {
  const [sharing, setSharing] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const getSnapshotRef = useRef(getSnapshot);
  getSnapshotRef.current = getSnapshot;

  const pushSnapshot = useCallback(() => {
    if (!slug) return;
    const snapshot = getSnapshotRef.current();
    // fire-and-forget; falha silenciosa (rede instável não deve spammar toast)
    apiPost(`/api/sessions/live/snapshot`, { snapshot }).catch(() => {});
  }, [slug]);

  // Push imediato quando estado muda — debounce curto
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const schedulePush = useCallback(() => {
    if (!sharing || !slug) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushSnapshot();
    }, 400);
  }, [sharing, slug, pushSnapshot]);

  useEffect(() => {
    if (!sharing) return;
    pushSnapshot();
    const id = setInterval(pushSnapshot, SNAPSHOT_INTERVAL_MS);
    return () => {
      clearInterval(id);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sharing, pushSnapshot]);

  const start = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      const res = await apiPost<{ slug: string }>("/api/sessions/live/start", {
        workoutId,
        workoutName,
      });
      // envia snapshot logo após criar a sessão
      await apiPost(`/api/sessions/live/snapshot`, {
        snapshot: getSnapshotRef.current(),
      }).catch(() => {});
      setSlug(res.slug);
      setSharing(true);
      toast.success("Transmissão ao vivo ligada");
      return res.slug;
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Não foi possível iniciar o ao vivo"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [workoutId, workoutName]);

  const stop = useCallback(async () => {
    if (!slug) {
      setSharing(false);
      return;
    }
    setLoading(true);
    try {
      await apiPost(`/api/sessions/live/stop`, {});
    } catch {
      /* ignore */
    } finally {
      setSlug(null);
      setSharing(false);
      setLoading(false);
    }
  }, [slug]);

  return { sharing, slug, loading, start, stop, schedulePush };
}
