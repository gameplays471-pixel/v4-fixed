import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { loadWorkoutDraft, saveWorkoutDraft } from "@/lib/workout-draft";
import type { CardioState, SetState, Workout } from "../types";
import { suggestNextLoad, type LoadSuggestion } from "../utils";
import { computeSessionTotals } from "./session-summary";

/**
 * Concentra o ciclo de vida "de dados" de uma sessão de treino ativa:
 * carregar o treino + histórico da API, hidratar o estado inicial de
 * sets/cardio a partir do rascunho local (`workout-draft.ts`) quando existir,
 * manter esse rascunho salvo a cada mudança, e expor os totais/sugestões
 * derivados desse estado.
 *
 * Não decide navegação nem finaliza/cancela o treino — isso fica em
 * `useWorkoutSession`, que compõe este hook com `useSetActions` e
 * `useCardioActions`.
 */
export function useSessionPersistence(workoutId: string) {
  const router = useRouter();
  const setActiveWorkoutId = useAppStore((s) => s.setActiveWorkoutId);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [startedAt, setStartedAt] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());

  // Sets state: Map<exerciseId, SetState[]>
  const [setsMap, setSetsMap] = useState<Record<string, SetState[]>>({});
  // Cardio state: Map<exerciseId, CardioState> (exercícios de cardio não usam setsMap)
  const [cardioMap, setCardioMap] = useState<Record<string, CardioState>>({});

  // Últimos sets registrados para cada exerciseId (histórico do usuário)
  // Usado para mostrar como placeholder "última vez" nos inputs.
  const [lastSetsMap, setLastSetsMap] = useState<Record<string, Array<{ weight: number; reps: number; rir: number | null }>>>({});

  // Só começa a salvar o rascunho depois que o estado inicial (novo ou
  // restaurado) já foi montado, pra não sobrescrever o rascunho salvo com
  // um estado vazio momentâneo durante o carregamento.
  const hydratedRef = useRef(false);

  // Carregar treino + últimos sets do histórico
  useEffect(() => {
    // Guarda contra o double-invoke do React Strict Mode em dev (monta,
    // desmonta, remonta): sem isso, a 1ª chamada (cancelada) ainda podia
    // resolver depois da 2ª e sobrescrever o estado com dados obsoletos,
    // além de duplicar o toast de "treino restaurado".
    let cancelled = false;

    apiGet<{ workout: Workout }>(`/api/workouts/${workoutId}`)
      .then(async (data) => {
        if (cancelled) return;
        setWorkout(data.workout);
        // Marca este treino como "em andamento" (persistido), para que o
        // app saiba levar o usuário de volta pra cá se ele reabrir na raiz.
        setActiveWorkoutId(workoutId);

        const draft = loadWorkoutDraft(workoutId);

        // Inicializar sets/cardio (usa o rascunho salvo quando existir)
        const initial: Record<string, SetState[]> = {};
        const initialCardio: Record<string, CardioState> = {};
        for (const ex of data.workout.exercises) {
          const isCardio = ex.exercise.category === "Cardio";
          if (isCardio) {
            initialCardio[ex.id] = draft?.cardioMap[ex.id] || {
              durationMin: ex.targetDurationSec ? String(Math.round(ex.targetDurationSec / 60)) : "30",
              distanceKm: ex.targetDistanceKm ? String(ex.targetDistanceKm) : "",
              avgBpm: "",
              intensity: ex.targetIntensity || "Moderada",
              completed: false,
            };
          } else {
            initial[ex.id] =
              draft?.setsMap[ex.id] ||
              Array.from({ length: ex.targetSets }, () => ({
                weight: "",
                reps: ex.targetReps.toString(),
                completed: false,
              }));
          }
        }
        if (cancelled) return;
        setSetsMap(initial);
        setCardioMap(initialCardio);

        if (draft) {
          setStartedAt(new Date(draft.startedAt));
          setCollapsedExercises(new Set(draft.collapsedExercises));
          toast.info("Treino em andamento restaurado 💾");
        } else {
          setStartedAt(new Date());
        }
        hydratedRef.current = true;

        // Buscar últimos sets de cada exercício do histórico do usuário
        // (trazer mesmo se o exercício está em outro treino)
        const exerciseIds = data.workout.exercises.map((e) => e.exerciseId);
        if (exerciseIds.length > 0) {
          try {
            const lastData = await apiGet<{ lastSets: Record<string, Array<{ weight: number; reps: number; rir: number | null }>> }>(
              `/api/sessions/last-sets?exerciseIds=${encodeURIComponent(exerciseIds.join(","))}`
            );
            if (!cancelled) setLastSetsMap(lastData.lastSets || {});
          } catch (e) {
            console.error("Erro ao buscar últimos sets:", e);
          }
        }
      })
      .catch((e) => {
        if (cancelled) return;
        // Treino não existe (ou pertence a outro usuário) — o backend
        // responde 404 nos dois casos. Volta pra lista em vez de travar
        // numa tela de treino que nunca vai carregar.
        console.error("Erro ao carregar treino:", e);
        toast.error("Treino não encontrado");
        router.replace("/treinos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId]);

  // Autosave: salva o progresso no localStorage sempre que algo muda,
  // pra sobreviver a um reload/aba fechada sem querer.
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveWorkoutDraft({
      workoutId,
      startedAt: startedAt.toISOString(),
      setsMap,
      cardioMap,
      collapsedExercises: Array.from(collapsedExercises),
      savedAt: new Date().toISOString(),
    });
  }, [workoutId, setsMap, cardioMap, collapsedExercises, startedAt]);

  // Cronômetro de treino
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // Formata resumo compacto do último treino: "20kg × 10, 20kg × 8"
  const formatLastSets = (exerciseId: string): string | null => {
    const last = lastSetsMap[exerciseId];
    if (!last || last.length === 0) return null;
    return last.map((s) => `${s.weight}kg × ${s.reps}`).join(" · ");
  };

  const toggleCollapse = (exerciseId: string) => {
    const newSet = new Set(collapsedExercises);
    if (newSet.has(exerciseId)) {
      newSet.delete(exerciseId);
    } else {
      newSet.add(exerciseId);
    }
    setCollapsedExercises(newSet);
  };

  // Sugestão de progressão de carga por exercício do treino (chave = ex.id,
  // não exerciseId, já que o mesmo exercício pode aparecer 2x num treino
  // com metas de reps diferentes). Recalcula só quando o treino ou o
  // histórico mudam — não a cada tecla digitada.
  const suggestionsMap = useMemo(() => {
    const map: Record<string, LoadSuggestion | null> = {};
    if (!workout) return map;
    for (const ex of workout.exercises) {
      if (ex.exercise.category === "Cardio") continue;
      map[ex.id] = suggestNextLoad(lastSetsMap[ex.exerciseId], ex.targetReps);
    }
    return map;
  }, [workout, lastSetsMap]);

  const { totalSets, completedSets, totalVolume, totalCardioMin } = computeSessionTotals(workout, setsMap, cardioMap);

  return {
    workout,
    loading,
    startedAt,
    elapsed,

    setsMap,
    setSetsMap,
    cardioMap,
    setCardioMap,
    lastSetsMap,
    collapsedExercises,
    toggleCollapse,
    formatLastSets,
    suggestionsMap,

    totalSets,
    completedSets,
    totalVolume,
    totalCardioMin,
  };
}
