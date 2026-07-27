import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, type WorkoutSummaryData } from "@/lib/store";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { clearWorkoutDraft } from "@/lib/workout-draft";
import { addToQueue } from "@/lib/sync-queue";
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

  /** Encapsula a lógica de limpar draft + navegar para resumo (usado no caminho feliz e no offline). */
  const finishWorkoutLocally = (params: {
    workout: NonNullable<typeof workout>;
    setsMap: typeof setsMap;
    cardioMap: typeof cardioMap;
    isPRBySetIndex: boolean[];
    elapsed: number;
    totalVolume: number;
  }) => {
    const summaryData: WorkoutSummaryData = buildSummaryData(params);
    clearWorkoutDraft(params.workout.id);
    setWorkoutSummaryData(summaryData);
    setActiveWorkoutId(null);
    router.push(`/treinos/${params.workout.id}/resumo`);
  };

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
      finishWorkoutLocally({ workout, setsMap, cardioMap, isPRBySetIndex, elapsed, totalVolume });
    } catch (e) {
      // Detecta se é erro de rede (TypeError do fetch quando offline)
      // vs erro de servidor (4xx/5xx com mensagem específica).
      const isNetworkError =
        e instanceof TypeError ||
        (e instanceof Error &&
          (e.message.includes("Failed to fetch") ||
            e.message.includes("NetworkError") ||
            e.message.includes("net::ERR_")));

      if (isNetworkError) {
        // Enfileira o payload para envio automático quando voltar online.
        // O treino é finalizado localmente mesmo assim — o usuário vê o
        // resumo e pode sair da academia. A sincronização roda em background.
        const payload = {
          workoutId: workout.id,
          workoutName: workout.name,
          startedAt: startedAt.toISOString(),
          endedAt: new Date().toISOString(),
          durationSec: elapsed,
          sets: setsData,
        };
        addToQueue({ url: "/api/sessions", method: "POST", body: payload });

        // Finaliza localmente sem PR flags (serão calculadas pelo servidor
        // quando a sincronização acontecer; o resumo local é só visual).
        finishWorkoutLocally({
          workout,
          setsMap,
          cardioMap,
          isPRBySetIndex: setsData.map(() => false),
          elapsed,
          totalVolume,
        });

        toast.warning(
          "Sem conexão. Treino salvo localmente e será sincronizado automaticamente.",
          { duration: 5000 }
        );
      } else {
        // Erro de servidor (4xx/5xx) — não enfileira, mostra erro normal.
        toast.error(e instanceof Error ? e.message : "Erro ao salvar treino");
        console.error(e);
      }
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
