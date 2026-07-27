import type { SetState } from "../types";

/**
 * Ações de edição das séries de exercícios de força (não-cardio). Opera
 * sobre o `setsMap` mantido por `useSessionPersistence` — recebe o estado
 * atual e o setter, não guarda nada por conta própria, pra ter uma única
 * fonte de verdade (o rascunho autosave-ado depende desse mesmo estado).
 */
export function useSetActions(
  setsMap: Record<string, SetState[]>,
  setSetsMap: (next: Record<string, SetState[]>) => void
) {
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

  const updateSetRir = (exerciseId: string, setIdx: number, value: string) => {
    const sets = setsMap[exerciseId];
    if (!sets) return;
    const updated = [...sets];
    updated[setIdx] = { ...updated[setIdx], rir: value };
    setSetsMap({ ...setsMap, [exerciseId]: updated });
  };

  /** Preenche o peso de todos os sets ainda não feitos com o valor sugerido. */
  const applySuggestedWeight = (exerciseId: string, weight: number) => {
    const sets = setsMap[exerciseId];
    if (!sets) return;
    const updated = sets.map((s) => (s.completed ? s : { ...s, weight: String(weight) }));
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

  return {
    toggleSetComplete,
    updateSet,
    updateSetRir,
    applySuggestedWeight,
    addSet,
    removeSet,
  };
}
