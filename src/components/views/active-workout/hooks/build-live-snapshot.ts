import type { Workout, SetState, CardioState } from "../types";
import type { LiveSnapshot } from "./useLiveShare";

interface BuildLiveSnapshotParams {
  workout: Workout;
  setsMap: Record<string, SetState[]>;
  cardioMap: Record<string, CardioState | undefined>;
  elapsed: number;
  totalVolume: number;
  totalCardioMin: number;
}

/** Monta o payload enviado pro espectador — mesma lógica usada pro header local, só reempacotada. */
export function buildLiveSnapshot({
  workout,
  setsMap,
  cardioMap,
  elapsed,
  totalVolume,
  totalCardioMin,
}: BuildLiveSnapshotParams): LiveSnapshot {
  let totalSets = 0;
  let completedSets = 0;
  let currentAssigned = false;

  const exercises = workout.exercises.map((ex) => {
    const isCardio = ex.exercise.category === "Cardio";
    let exTotal: number;
    let exCompleted: number;

    if (isCardio) {
      exTotal = 1;
      exCompleted = cardioMap[ex.id]?.completed ? 1 : 0;
    } else {
      const sets = setsMap[ex.id] || [];
      exTotal = sets.length;
      exCompleted = sets.filter((s) => s.completed).length;
    }

    totalSets += exTotal;
    completedSets += exCompleted;

    // "Exercício atual" = primeiro que ainda não foi 100% concluído.
    const current = !currentAssigned && exCompleted < exTotal;
    if (current) currentAssigned = true;

    return { name: ex.exercise.name, isCardio, totalSets: exTotal, completedSets: exCompleted, current };
  });

  return { elapsed, totalSets, completedSets, totalVolume, totalCardioMin, exercises };
}
