// Store global para estado de UI que NÃO deveria estar na URL (ex.: qual
// treino está sendo editado, dados temporários entre telas). A navegação
// entre views principais foi migrada para rotas reais do App Router — ver
// src/app/(app)/**. Este store não controla mais "qual tela está visível".
import { create } from "zustand";
import { getPersistedActiveWorkoutId, setPersistedActiveWorkoutId } from "@/lib/workout-draft";

export type WorkoutSummaryData = {
  workoutName: string;
  durationSec: number;
  totalVolume: number;
  // Data/hora em que o treino foi finalizado (ISO) — usada no card
  // compartilhável e no PDF exportado (ver share-workout-card.tsx).
  finishedAt: string;
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
  /** Sugestões de progressão geradas ao finalizar (POST /api/sessions). */
  progressions?: Array<{
    exerciseId: string;
    exerciseName: string;
    lastWeight: number;
    lastReps: number;
    suggestedWeight: number;
    suggestedReps: number;
    reason: string;
  }>;
};

interface AppState {
  // ID do treino em andamento (persistido em localStorage) — usado só para
  // sabermos, ao abrir o app do zero (ex.: PWA), se devemos levar o usuário
  // direto de volta para /treinos/[id]/ativo em vez do dashboard. A tela em
  // si é sempre resolvida pela URL, não por este valor.
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

  // Controla o tour de boas-vindas (ver components/onboarding-tour.tsx).
  // Fica no store (em vez de estado local do layout) pra outras telas —
  // como o card "Rever tour" em Perfil — poderem reabri-lo também.
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Restaura o treino ativo salvo no localStorage (se houver) já na
  // inicialização, para o layout conseguir decidir se redireciona para a
  // rota do treino em andamento.
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

  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),
}));
