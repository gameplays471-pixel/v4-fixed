"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExerciseImageDialog } from "@/components/exercise-media";
import { ExerciseSubstituteDialog, type SubstitutableExercise } from "@/components/exercise-substitute-dialog";

import { useWorkoutSession } from "./hooks/useWorkoutSession";
import { useRestTimer } from "./hooks/useRestTimer";
import { useLiveShare } from "./hooks/useLiveShare";
import { buildLiveSnapshot } from "./hooks/build-live-snapshot";
import { WorkoutHeader } from "./components/WorkoutHeader";
import { RestTimerCard } from "./components/RestTimerCard";
import { ExerciseCard } from "./components/ExerciseCard";
import { FinishModal } from "./components/FinishModal";
import type { WorkoutExercise } from "./types";

interface ActiveWorkoutViewProps {
  workoutId: string;
}

export function ActiveWorkoutView({ workoutId }: ActiveWorkoutViewProps) {
  const router = useRouter();
  const session = useWorkoutSession(workoutId);
  const restTimer = useRestTimer();
  const liveShare = useLiveShare(workoutId, session.workout?.name || "", () =>
    buildLiveSnapshot({
      workout: session.workout!,
      setsMap: session.setsMap,
      cardioMap: session.cardioMap,
      elapsed: session.elapsed,
      totalVolume: session.totalVolume,
      totalCardioMin: session.totalCardioMin,
    })
  );

  const [lightboxExercise, setLightboxExercise] = useState<{ name: string; images: string[] } | null>(null);
  const [substitutingEx, setSubstitutingEx] = useState<WorkoutExercise | null>(null);

  const handleCompleteSet = (exerciseId: string, setIdx: number, restSeconds: number, exerciseName: string) => {
    const justCompleted = session.toggleSetComplete(exerciseId, setIdx);
    if (justCompleted) restTimer.start(restSeconds, exerciseName);
  };

  if (session.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { workout } = session;

  if (!workout) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Treino não encontrado</p>
        <Button onClick={() => router.push("/treinos")} className="mt-4">
          Voltar
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-24">
      <WorkoutHeader
        workoutName={workout.name}
        elapsed={session.elapsed}
        completedSets={session.completedSets}
        totalSets={session.totalSets}
        totalVolume={session.totalVolume}
        totalCardioMin={session.totalCardioMin}
        onCancel={() => session.handleCancel(liveShare.stop)}
        onFinishClick={() => session.setShowFinishModal(true)}
        liveSharing={liveShare.sharing}
        liveSlug={liveShare.slug}
        liveLoading={liveShare.loading}
        onLiveStart={liveShare.start}
        onLiveStop={liveShare.stop}
      />

      <RestTimerCard
        restTimer={restTimer.restTimer}
        soundOn={restTimer.soundOn}
        onTogglePause={restTimer.togglePause}
        onAdjust={restTimer.adjust}
        onToggleSound={() => restTimer.setSoundOn(!restTimer.soundOn)}
        onDismiss={restTimer.dismiss}
      />

      {/* Exercícios */}
      <div className="space-y-3 mt-4">
        {workout.exercises.map((ex, exIdx) => {
          const isCardio = ex.exercise.category === "Cardio";
          const sets = session.setsMap[ex.id] || [];
          const cardio = session.cardioMap[ex.id];
          const isCollapsed = session.collapsedExercises.has(ex.id);

          return (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              index={exIdx}
              isCardio={isCardio}
              sets={sets}
              cardio={cardio}
              isCollapsed={isCollapsed}
              lastSets={session.lastSetsMap[ex.exerciseId]}
              lastSetsSummary={session.formatLastSets(ex.exerciseId)}
              suggestion={session.suggestionsMap[ex.id]}
              onToggleCollapse={() => session.toggleCollapse(ex.id)}
              onOpenLightbox={() => setLightboxExercise({ name: ex.exercise.name, images: ex.exercise.images })}
              onUpdateSet={(setIdx, field, value) => session.updateSet(ex.id, setIdx, field, value)}
              onUpdateSetRir={(setIdx, value) => session.updateSetRir(ex.id, setIdx, value)}
              onApplySuggestion={(weight) => session.applySuggestedWeight(ex.id, weight)}
              onAddSet={() => session.addSet(ex.id)}
              onRemoveSet={(setIdx) => session.removeSet(ex.id, setIdx)}
              onCompleteSet={(setIdx) => handleCompleteSet(ex.id, setIdx, ex.restSeconds, ex.exercise.name)}
              onUpdateCardio={(updates) => session.updateCardio(ex.id, updates)}
              onToggleCardioComplete={() => session.toggleCardioComplete(ex.id)}
              onSubstitute={() => setSubstitutingEx(ex)}
            />
          );
        })}
      </div>

      {/* Modal de finalização — portal estável fora do scroll container */}
      {session.showFinishModal && (
        <FinishModal
          completedSets={session.completedSets}
          totalVolume={session.totalVolume}
          elapsed={session.elapsed}
          saving={session.saving}
          onClose={() => session.setShowFinishModal(false)}
          onFinish={() => session.handleFinish(liveShare.stop)}
        />
      )}

      <audio ref={restTimer.audioRef} preload="auto" />

      <ExerciseImageDialog
        open={!!lightboxExercise}
        onOpenChange={(o) => !o && setLightboxExercise(null)}
        images={lightboxExercise?.images}
        name={lightboxExercise?.name || ""}
      />

      {substitutingEx && (
        <ExerciseSubstituteDialog
          currentExercise={substitutingEx.exercise as SubstitutableExercise}
          excludeIds={workout.exercises.filter((e) => e.id !== substitutingEx.id).map((e) => e.exerciseId)}
          onSelect={(newEx) => {
            session.substituteExercise(substitutingEx.id, newEx);
            setSubstitutingEx(null);
          }}
          onClose={() => setSubstitutingEx(null)}
        />
      )}
    </div>
  );
}
