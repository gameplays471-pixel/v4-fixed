import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, type WorkoutSummaryData } from "@/lib/store";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { clearWorkoutDraft } from "@/lib/workout-draft";
import { useSessionPersistence } from "./useSessionPersistence";
import { useSetActions } from "./useSetActions";
import { useCardioActions } from "./useCardioActions";
import { buildSetsPayload, buildSummaryData } from "./session-summary";

/**
 * Compõe o ciclo de vida de uma sessão de treino ativa a partir de três
 * hooks menores:
 * - `useSessionPersistence` — carregar treino/histórico, hidratar e
 *   autosalvar o rascunho local, expor totais e sugestões derivados.
 * - `useSetActions` — editar séries de exercícios de força.
 * - `useCardioActions` — equivalente para exercícios de cardio.
 *
 * Este hook cuida só do que sobra: o modal de finalização, e finalizar ou
 * cancelar o treino (que envolve API + navegação + limpar o rascunho).
 *
 * O timer de descanso fica de fora (ver useRestTimer) porque é uma
 * preocupação independente (UI de contagem regressiva), acionada aqui só
 * através do valor de retorno de `toggleSetComplete`.
 */
export function useWorkoutSession(workoutId: string) {
  const router = useRouter();
  const setActiveWorkoutId = useAppStore((s) => s.setActiveWorkoutId);
  const setWorkoutSummaryData = useAppStore((s) => s.setWorkoutSummaryData);

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const persistence = useSessionPersistence(workoutId);
  const setActions = useSetActions(persistence.setsMap, persistence.setSetsMap);
  const cardioActions = useCardioActions(persistence.cardioMap, persistence.setCardioMap);

  const { workout, startedAt, elapsed, setsMap, cardioMap, totalVolume } = persistence;

  const handleFinish = async () => {
    if (!workout) return;
    setSaving(true);

    const setsData = buildSetsPayload(workout, setsMap, cardioMap);

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

      // Reconstrói o resumo por exercício, aproveitando as flags de PR
      // vindas da API (mesma ordem em que os sets foram enviados acima).
      const isPRBySetIndex = session.sets.map((s) => s.isPR);
      const summaryData: WorkoutSummaryData = buildSummaryData({
        workout,
        setsMap,
        cardioMap,
        isPRBySetIndex,
        elapsed,
        totalVolume,
      });

      clearWorkoutDraft(workout.id);
      setWorkoutSummaryData(summaryData);
      setActiveWorkoutId(null);
      router.push(`/treinos/${workout.id}/resumo`);
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
      router.push("/treinos");
    }
  };

  return {
    workout,
    loading: persistence.loading,
    elapsed,

    setsMap,
    cardioMap,
    lastSetsMap: persistence.lastSetsMap,
    suggestionsMap: persistence.suggestionsMap,
    collapsedExercises: persistence.collapsedExercises,

    showFinishModal,
    setShowFinishModal,
    saving,

    totalSets: persistence.totalSets,
    completedSets: persistence.completedSets,
    totalVolume,
    totalCardioMin: persistence.totalCardioMin,

    toggleSetComplete: setActions.toggleSetComplete,
    updateSet: setActions.updateSet,
    updateSetRir: setActions.updateSetRir,
    applySuggestedWeight: setActions.applySuggestedWeight,
    addSet: setActions.addSet,
    removeSet: setActions.removeSet,
    updateCardio: cardioActions.updateCardio,
    toggleCardioComplete: cardioActions.toggleCardioComplete,
    toggleCollapse: persistence.toggleCollapse,
    formatLastSets: persistence.formatLastSets,

    handleFinish,
    handleCancel,
  };
}
