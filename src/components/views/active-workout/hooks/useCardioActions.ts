import type { CardioState } from "../types";

/**
 * Equivalente a `useSetActions`, mas para exercícios de cardio — que não
 * usam `setsMap` (uma única entrada de estado por exercício, não uma lista
 * de séries). Opera sobre o `cardioMap` mantido por `useSessionPersistence`.
 */
export function useCardioActions(
  cardioMap: Record<string, CardioState>,
  setCardioMap: (next: Record<string, CardioState>) => void
) {
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

  return {
    updateCardio,
    toggleCardioComplete,
  };
}
