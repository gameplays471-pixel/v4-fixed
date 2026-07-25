import type { SetDraft, CardioDraft } from "@/lib/workout-draft";

export type Workout = {
  id: string;
  name: string;
  defaultRest: number;
  exercises: Array<{
    id: string;
    exerciseId: string;
    order: number;
    targetSets: number;
    targetReps: number;
    restSeconds: number;
    targetDurationSec: number | null;
    targetDistanceKm: number | null;
    targetIntensity: string | null;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      secondaryMuscles?: string | null;
      equipment: string | null;
      category: string;
      images: string[];
    };
  }>;
};

export type WorkoutExercise = Workout["exercises"][number];

export type SetState = SetDraft;
export type CardioState = CardioDraft;

export type RestTimerState = {
  active: boolean;
  remaining: number;
  total: number;
  paused: boolean;
};

export const INTENSITY_OPTIONS = ["Leve", "Moderada", "Intensa"];
