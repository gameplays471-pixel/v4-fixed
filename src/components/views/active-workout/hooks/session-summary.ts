import type { WorkoutSummaryData } from "@/lib/store";
import type { CardioState, SetState, Workout } from "../types";

/**
 * Totais agregados da sessão em andamento (usados no header do treino e na
 * finalização) — puramente derivados de workout + setsMap/cardioMap, sem
 * nenhum estado próprio.
 */
export function computeSessionTotals(
  workout: Workout | null,
  setsMap: Record<string, SetState[]>,
  cardioMap: Record<string, CardioState>
) {
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

  return { totalSets, completedSets, totalVolume, totalCardioMin };
}

export type SetPayload = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  restSeconds: number;
  rir?: number;
  durationSec?: number;
  distanceKm?: number;
  avgBpm?: number;
  intensity?: string;
};

/** "4+" (opção do seletor de RIR) vira 4 pra fins de cálculo; o resto é parseFloat direto. */
export function parseRir(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseFloat(value.replace("+", ""));
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Monta o payload de séries completas (força + cardio) a partir do estado da
 * sessão, no formato esperado por POST /api/sessions. Sets/cardio não
 * marcados como "completed" (ou de força sem peso/reps) ficam de fora.
 */
export function buildSetsPayload(
  workout: Workout,
  setsMap: Record<string, SetState[]>,
  cardioMap: Record<string, CardioState>
): SetPayload[] {
  const setsData: SetPayload[] = [];

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

    for (const set of setsMap[ex.id] || []) {
      if (set.completed && set.weight && set.reps) {
        setsData.push({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exercise.name,
          weight: parseFloat(set.weight) || 0,
          reps: parseInt(set.reps) || 0,
          restSeconds: ex.restSeconds,
          rir: parseRir(set.rir),
        });
      }
    }
  }

  return setsData;
}

/**
 * Reconstrói o resumo por exercício (pra tela de resumo pós-treino) na mesma
 * ordem em que os sets foram enviados em `buildSetsPayload`, atribuindo a
 * cada um a flag de PR devolvida pela API em `/api/sessions`.
 */
export function buildSummaryData(params: {
  workout: Workout;
  setsMap: Record<string, SetState[]>;
  cardioMap: Record<string, CardioState>;
  isPRBySetIndex: boolean[];
  elapsed: number;
  totalVolume: number;
}): WorkoutSummaryData {
  const { workout, setsMap, cardioMap, isPRBySetIndex, elapsed, totalVolume } = params;

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
          isPR: isPRBySetIndex[setIdx] ?? false,
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
            isPR: isPRBySetIndex[setIdx] ?? false,
          });
          setIdx++;
        }
      }
    }
  }

  return {
    workoutName: workout.name,
    durationSec: elapsed,
    totalVolume,
    finishedAt: new Date().toISOString(),
    exercises: [...exerciseMap.values()].filter((e) => e.sets.length > 0),
  };
}
