import { useEffect, useRef, useState } from "react";
import { useAppStore, type WorkoutSummaryData } from "@/lib/store";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import {
  loadWorkoutDraft,
  saveWorkoutDraft,
  clearWorkoutDraft,
} from "@/lib/workout-draft";
import type { CardioState, SetState, Workout } from "../types";

/**
 * Concentra todo o ciclo de vida de uma sessão de treino ativa: carregar o
 * treino + histórico, hidratar/(auto)salvar o rascunho local, manter o
 * estado de séries/cardio, calcular totais e finalizar/cancelar o treino.
 *
 * O timer de descanso fica de fora (ver useRestTimer) porque é uma
 * preocupação independente (UI de contagem regressiva), acionada aqui só
 * através do valor de retorno de `toggleSetComplete`.
 */
export function useWorkoutSession() {
  const setView = useAppStore((s) => s.setView);
  const activeWorkoutId = useAppStore((s) => s.activeWorkoutId);
  const setActiveWorkoutId = useAppStore((s) => s.setActiveWorkoutId);
  const setWorkoutSummaryData = useAppStore((s) => s.setWorkoutSummaryData);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [startedAt, setStartedAt] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sets state: Map<exerciseId, SetState[]>
  const [setsMap, setSetsMap] = useState<Record<string, SetState[]>>({});
  // Cardio state: Map<exerciseId, CardioState> (exercícios de cardio não usam setsMap)
  const [cardioMap, setCardioMap] = useState<Record<string, CardioState>>({});

  // Últimos sets registrados para cada exerciseId (histórico do usuário)
  // Usado para mostrar como placeholder "última vez" nos inputs.
  const [lastSetsMap, setLastSetsMap] = useState<Record<string, Array<{ weight: number; reps: number }>>>({});

  // Só começa a salvar o rascunho depois que o estado inicial (novo ou
  // restaurado) já foi montado, pra não sobrescrever o rascunho salvo com
  // um estado vazio momentâneo durante o carregamento.
  const hydratedRef = useRef(false);

  // Ref para evitar redirect ao workouts quando o treino for finalizado
  // (nesse caso setView("workout-summary") já foi chamado)
  const finishingRef = useRef(false);

  // Carregar treino + últimos sets do histórico
  useEffect(() => {
    // Guarda contra o double-invoke do React Strict Mode em dev (monta,
    // desmonta, remonta): sem isso, a 1ª chamada (cancelada) ainda podia
    // resolver depois da 2ª e sobrescrever o estado com dados obsoletos,
    // além de duplicar o toast de "treino restaurado".
    let cancelled = false;

    if (!activeWorkoutId) {
      // Só redireciona se não estamos indo para o resumo
      if (!finishingRef.current) {
        setView("workouts");
      }
      return;
    }
    apiGet<{ workout: Workout }>(`/api/workouts/${activeWorkoutId}`)
      .then(async (data) => {
        if (cancelled) return;
        setWorkout(data.workout);

        const draft = loadWorkoutDraft(activeWorkoutId);

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
            const lastData = await apiGet<{ lastSets: Record<string, Array<{ weight: number; reps: number }>> }>(
              `/api/sessions/last-sets?exerciseIds=${encodeURIComponent(exerciseIds.join(","))}`
            );
            if (!cancelled) setLastSetsMap(lastData.lastSets || {});
          } catch (e) {
            console.error("Erro ao buscar últimos sets:", e);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkoutId, setView]);

  // Autosave: salva o progresso no localStorage sempre que algo muda,
  // pra sobreviver a um reload/aba fechada sem querer.
  useEffect(() => {
    if (!hydratedRef.current || !activeWorkoutId) return;
    saveWorkoutDraft({
      workoutId: activeWorkoutId,
      startedAt: startedAt.toISOString(),
      setsMap,
      cardioMap,
      collapsedExercises: Array.from(collapsedExercises),
      savedAt: new Date().toISOString(),
    });
  }, [activeWorkoutId, setsMap, cardioMap, collapsedExercises, startedAt]);

  // Cronômetro de treino
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  /**
   * Alterna o "completed" de um set. Retorna `true` quando o set acabou de
   * ser marcado como concluído (para o chamador decidir se inicia o timer
   * de descanso), ou `false` quando foi desmarcado / não existe.
   */
  const toggleSetComplete = (exerciseId: string, setIdx: number): boolean => {
    const sets = setsMap[exerciseId];
    if (!sets) return false;
    const wasCompleted = sets[setIdx].completed;

    const updated = [...sets];
    updated[setIdx] = { ...updated[setIdx], completed: !wasCompleted };
    setSetsMap({ ...setsMap, [exerciseId]: updated });

    return !wasCompleted;
  };

  const updateSet = (exerciseId: string, setIdx: number, field: "weight" | "reps", value: string) => {
    const sets = setsMap[exerciseId];
    if (!sets) return;
    const updated = [...sets];
    updated[setIdx] = { ...updated[setIdx], [field]: value };
    setSetsMap({ ...setsMap, [exerciseId]: updated });
  };

  const addSet = (exerciseId: string) => {
    const sets = setsMap[exerciseId];
    if (!sets) return;
    const lastSet = sets[sets.length - 1];
    setSetsMap({
      ...setsMap,
      [exerciseId]: [...sets, { weight: lastSet?.weight || "", reps: lastSet?.reps || "10", completed: false }],
    });
  };

  const removeSet = (exerciseId: string, setIdx: number) => {
    const sets = setsMap[exerciseId];
    if (!sets || sets.length === 1) return;
    setSetsMap({
      ...setsMap,
      [exerciseId]: sets.filter((_, i) => i !== setIdx),
    });
  };

  // Formata resumo compacto do último treino: "20kg × 10, 20kg × 8"
  const formatLastSets = (exerciseId: string): string | null => {
    const last = lastSetsMap[exerciseId];
    if (!last || last.length === 0) return null;
    return last.map((s) => `${s.weight}kg × ${s.reps}`).join(" · ");
  };

  const updateCardio = (exerciseId: string, updates: Partial<CardioState>) => {
    const current = cardioMap[exerciseId];
    if (!current) return;
    setCardioMap({ ...cardioMap, [exerciseId]: { ...current, ...updates } });
  };

  const toggleCardioComplete = (exerciseId: string) => {
    const current = cardioMap[exerciseId];
    if (!current) return;
    setCardioMap({ ...cardioMap, [exerciseId]: { ...current, completed: !current.completed } });
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

  const totalSets =
    (workout?.exercises.reduce((acc, ex) => acc + (setsMap[ex.id]?.length || 0), 0) || 0) +
    (workout?.exercises.filter((ex) => ex.exercise.category === "Cardio").length || 0);
  const completedSets =
    (workout?.exercises.reduce((acc, ex) => {
      return acc + (setsMap[ex.id]?.filter((s) => s.completed).length || 0);
    }, 0) || 0) +
    (workout?.exercises.filter((ex) => cardioMap[ex.id]?.completed).length || 0);

  const totalVolume =
    workout?.exercises.reduce((acc, ex) => {
      return (
        acc + (setsMap[ex.id]?.reduce((s, set) => s + (set.completed ? (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0) : 0), 0) || 0)
      );
    }, 0) || 0;

  const totalCardioMin =
    workout?.exercises.reduce((acc, ex) => {
      const c = cardioMap[ex.id];
      return acc + (c?.completed ? parseInt(c.durationMin) || 0 : 0);
    }, 0) || 0;

  const handleFinish = async () => {
    if (!workout) return;
    setSaving(true);

    const setsData: Array<{
      exerciseId: string;
      exerciseName: string;
      weight: number;
      reps: number;
      restSeconds: number;
      durationSec?: number;
      distanceKm?: number;
      avgBpm?: number;
      intensity?: string;
    }> = [];
    for (const ex of workout.exercises) {
      if (ex.exercise.category === "Cardio") {
        const c = cardioMap[ex.id];
        if (c?.completed) {
          setsData.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            weight: 0,
            reps: 0,
            restSeconds: 0,
            durationSec: (parseInt(c.durationMin) || 0) * 60,
            distanceKm: c.distanceKm ? parseFloat(c.distanceKm) : undefined,
            avgBpm: c.avgBpm ? parseInt(c.avgBpm) : undefined,
            intensity: c.intensity,
          });
        }
        continue;
      }
      const sets = setsMap[ex.id] || [];
      for (const set of sets) {
        if (set.completed && set.weight && set.reps) {
          setsData.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps) || 0,
            restSeconds: ex.restSeconds,
          });
        }
      }
    }

    if (setsData.length === 0) {
      toast.error("Nenhum set completo. Marque pelo menos um set antes de finalizar.");
      setSaving(false);
      return;
    }

    try {
      const { session } = await apiPost<{
        session: {
          sets: Array<{
            exerciseId: string;
            weight: number;
            reps: number;
            isPR: boolean;
            durationSec: number | null;
            distanceKm: number | null;
            avgBpm: number | null;
            intensity: string | null;
          }>;
        };
      }>("/api/sessions", {
        workoutId: workout.id,
        workoutName: workout.name,
        startedAt: startedAt.toISOString(),
        endedAt: new Date().toISOString(),
        durationSec: elapsed,
        sets: setsData,
      });

      // Monta o resumo por exercício, aproveitando as flags de PR vindas da API
      const prByIndex: Record<number, boolean> = {};
      session.sets.forEach((s, i) => {
        prByIndex[i] = s.isPR;
      });

      // Agrupa os sets de volta por exercício (mesma ordem de setsData)
      const exerciseMap = new Map<string, WorkoutSummaryData["exercises"][number]>();
      let setIdx = 0;
      for (const ex of workout.exercises) {
        const isCardio = ex.exercise.category === "Cardio";
        const key = ex.exerciseId;

        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            name: ex.exercise.name,
            muscleGroup: ex.exercise.muscleGroup,
            secondaryMuscles: ex.exercise.secondaryMuscles ?? null,
            category: ex.exercise.category,
            sets: [],
          });
        }
        const entry = exerciseMap.get(key)!;

        if (isCardio) {
          const c = cardioMap[ex.id];
          if (c?.completed) {
            entry.sets.push({
              weight: 0,
              reps: 0,
              isPR: prByIndex[setIdx] ?? false,
              durationSec: (parseInt(c.durationMin) || 0) * 60,
              distanceKm: c.distanceKm ? parseFloat(c.distanceKm) : undefined,
              avgBpm: c.avgBpm ? parseInt(c.avgBpm) : undefined,
              intensity: c.intensity,
            });
            setIdx++;
          }
        } else {
          for (const set of setsMap[ex.id] || []) {
            if (set.completed && set.weight && set.reps) {
              entry.sets.push({
                weight: parseFloat(set.weight) || 0,
                reps: parseInt(set.reps) || 0,
                isPR: prByIndex[setIdx] ?? false,
              });
              setIdx++;
            }
          }
        }
      }

      const summaryData: WorkoutSummaryData = {
        workoutName: workout.name,
        durationSec: elapsed,
        totalVolume,
        exercises: [...exerciseMap.values()].filter((e) => e.sets.length > 0),
      };

      clearWorkoutDraft(workout.id);
      setWorkoutSummaryData(summaryData);
      finishingRef.current = true;
      setView("workout-summary");
      setActiveWorkoutId(null);
    } catch (e) {
      toast.error("Erro ao salvar treino");
      console.error(e);
    } finally {
      setSaving(false);
      setShowFinishModal(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Cancelar treino? O progresso salvo será apagado.")) {
      if (workout) clearWorkoutDraft(workout.id);
      setActiveWorkoutId(null);
      setView("workouts");
    }
  };

  return {
    workout,
    loading,
    elapsed,
    setView,

    setsMap,
    cardioMap,
    lastSetsMap,
    collapsedExercises,

    showFinishModal,
    setShowFinishModal,
    saving,

    totalSets,
    completedSets,
    totalVolume,
    totalCardioMin,

    toggleSetComplete,
    updateSet,
    addSet,
    removeSet,
    updateCardio,
    toggleCardioComplete,
    toggleCollapse,
    formatLastSets,

    handleFinish,
    handleCancel,
  };
}
