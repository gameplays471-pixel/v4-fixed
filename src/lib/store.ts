// Store global para navegação entre views (sem router)
import { create } from "zustand";

export type ViewKey =
  | "dashboard"
  | "library"
  | "workouts"
  | "active-workout"
  | "history"
  | "stats"
  | "profile"
  | "auth";

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
}

export const useAppStore = create<AppState>((set) => ({
  view: "dashboard",
  setView: (view) => set({ view }),
  
  activeWorkoutId: null,
  setActiveWorkoutId: (id) => set({ activeWorkoutId: id }),
  
  editingWorkoutId: null,
  setEditingWorkoutId: (id) => set({ editingWorkoutId: id }),
  
  selectedExerciseId: null,
  setSelectedExerciseId: (id) => set({ selectedExerciseId: id }),
  
  selectedSessionId: null,
  setSelectedSessionId: (id) => set({ selectedSessionId: id }),
}));
