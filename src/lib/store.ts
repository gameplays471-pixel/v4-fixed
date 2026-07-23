// Store global para navegação entre views (sem router)
import { create } from "zustand";
import { getPersistedActiveWorkoutId, setPersistedActiveWorkoutId } from "@/lib/workout-draft";

export type ViewKey =
  | "dashboard"
  | "library"
  | "workouts"
  | "active-workout"
  | "workout-summary"
  | "history"
  | "stats"
  | "profile"
  | "auth";

export type WorkoutSummaryData = {
  workoutName: string;
  durationSec: number;
  totalVolume: number;
  exercises: Array<{
    name: string;
    muscleGroup: string;
    secondaryMuscles?: string | null;
    category: string;
    sets: Array<{
      weight: number;
      reps: number;
      isPR?: boolean;
      // cardio fields
      durationSec?: number;
      distanceKm?: number;
      avgBpm?: number;
      intensity?: string;
    }>;
  }>;
};

interface AppState {
  view: ViewKey;
  setView: (view: ViewKey) => void;

  // Parâmetros para as views
  activeWorkoutId: string | null;
  setActiveWorkoutId: (id: string | null) => void;

  editingWorkoutId: string | null;
  setEditingWorkoutId: (id: string | null) => void;

  selectedExerciseId: string | null;
  setSelectedExerciseId: (id: string | null) => void;

  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;

  workoutSummaryData: WorkoutSummaryData | null;
  setWorkoutSummaryData: (data: WorkoutSummaryData | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "dashboard",
  setView: (view) => set({ view }),

  // Restaura o treino ativo salvo no localStorage (se houver) já na
  // inicialização, para o app conseguir decidir a tela certa ao carregar.
  activeWorkoutId: getPersistedActiveWorkoutId(),
  setActiveWorkoutId: (id) => {
    setPersistedActiveWorkoutId(id);
    set({ activeWorkoutId: id });
  },

  editingWorkoutId: null,
  setEditingWorkoutId: (id) => set({ editingWorkoutId: id }),

  selectedExerciseId: null,
  setSelectedExerciseId: (id) => set({ selectedExerciseId: id }),

  selectedSessionId: null,
  setSelectedSessionId: (id) => set({ selectedSessionId: id }),

  workoutSummaryData: null,
  setWorkoutSummaryData: (data) => set({ workoutSummaryData: data }),
}));
