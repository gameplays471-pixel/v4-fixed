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

/** Monta o payload enviado pro espectador — séries, peso, reps e imagem. */
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
    const imageUrl =
      Array.isArray(ex.exercise.images) && ex.exercise.images.length > 0
        ? ex.exercise.images[0]
        : null;

    let exTotal: number;
    let exCompleted: number;
    let sets:
      | Array<{
          setNumber: number;
          weight: number;
          reps: number;
          completed: boolean;
          isPR?: boolean;
        }>
      | undefined;
    let cardio:
      | {
          completed: boolean;
          durationSec?: number | null;
          distanceKm?: number | null;
          intensity?: string | null;
        }
      | undefined;

    if (isCardio) {
      const c = cardioMap[ex.id];
      exTotal = 1;
      exCompleted = c?.completed ? 1 : 0;
      // CardioDraft guarda duração em minutos (string); o snapshot usa segundos.
      const parsedMin = c?.durationMin ? parseInt(c.durationMin, 10) : NaN;
      const durationSec = Number.isFinite(parsedMin)
        ? parsedMin * 60
        : ex.targetDurationSec;
      const parsedKm = c?.distanceKm ? parseFloat(c.distanceKm) : NaN;
      const distanceKm = Number.isFinite(parsedKm)
        ? parsedKm
        : ex.targetDistanceKm;
      cardio = {
        completed: !!c?.completed,
        durationSec,
        distanceKm,
        intensity: c?.intensity ?? ex.targetIntensity,
      };
    } else {
      const raw = setsMap[ex.id] || [];
      exTotal = raw.length || ex.targetSets;
      exCompleted = raw.filter((s) => s.completed).length;
      sets = (raw.length ? raw : Array.from({ length: ex.targetSets }, () => ({
        weight: 0,
        reps: ex.targetReps,
        completed: false,
      }))).map((s, i) => ({
        setNumber: i + 1,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
        completed: !!s.completed,
        isPR: !!(s as SetState & { isPR?: boolean }).isPR,
      }));
    }

    totalSets += exTotal;
    completedSets += exCompleted;

    const current = !currentAssigned && exCompleted < exTotal;
    if (current) currentAssigned = true;

    return {
      name: ex.exercise.name,
      isCardio,
      muscleGroup: ex.exercise.muscleGroup,
      imageUrl,
      totalSets: exTotal,
      completedSets: exCompleted,
      current,
      targetReps: ex.targetReps,
      sets,
      cardio,
    };
  });

  return { elapsed, totalSets, completedSets, totalVolume, totalCardioMin, exercises };
}
