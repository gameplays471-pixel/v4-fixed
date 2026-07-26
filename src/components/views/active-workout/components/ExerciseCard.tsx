import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Plus, History, HeartPulse, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseThumb } from "@/components/exercise-media";
import type { CardioState, SetState, WorkoutExercise } from "../types";
import type { LoadSuggestion } from "../utils";
import { SetRow } from "./SetRow";
import { CardioForm } from "./CardioForm";

interface ExerciseCardProps {
  ex: WorkoutExercise;
  index: number;
  isCardio: boolean;
  sets: SetState[];
  cardio: CardioState | undefined;
  isCollapsed: boolean;
  lastSets: Array<{ weight: number; reps: number }> | undefined;
  lastSetsSummary: string | null;
  suggestion?: LoadSuggestion | null;
  onToggleCollapse: () => void;
  onOpenLightbox: () => void;
  onUpdateSet: (setIdx: number, field: "weight" | "reps", value: string) => void;
  onUpdateSetRir: (setIdx: number, value: string) => void;
  onApplySuggestion?: (weight: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setIdx: number) => void;
  onCompleteSet: (setIdx: number) => void;
  onUpdateCardio: (updates: Partial<CardioState>) => void;
  onToggleCardioComplete: () => void;
}

export function ExerciseCard({
  ex,
  index,
  isCardio,
  sets,
  cardio,
  isCollapsed,
  lastSets,
  lastSetsSummary,
  suggestion,
  onToggleCollapse,
  onOpenLightbox,
  onUpdateSet,
  onUpdateSetRir,
  onApplySuggestion,
  onAddSet,
  onRemoveSet,
  onCompleteSet,
  onUpdateCardio,
  onToggleCardioComplete,
}: ExerciseCardProps) {
  const completedCount = sets.filter((s) => s.completed).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Card className="overflow-hidden hover:border-primary/20 transition-colors">
        {/* Header do exercício */}
        <div className="p-4 cursor-pointer hover:bg-accent/20 transition-colors select-none" onClick={onToggleCollapse}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <ExerciseThumb
                images={ex.exercise.images}
                name={ex.exercise.name}
                className="w-12 h-12 rounded-lg"
                onClick={onOpenLightbox}
              />
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {isCardio ? <HeartPulse className="w-2.5 h-2.5" /> : index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{ex.exercise.name}</h3>
              <p className="text-xs text-muted-foreground">
                {isCardio
                  ? `${ex.exercise.muscleGroup} · cardio`
                  : `${ex.exercise.muscleGroup} · ${sets.length} séries · descanso ${ex.restSeconds}s`}
              </p>
              {!isCardio && lastSetsSummary && (
                <p className="text-[11px] text-primary/80 flex items-center gap-1 mt-0.5 font-medium">
                  <History className="w-3 h-3 shrink-0" />
                  <span className="truncate">Última vez: {lastSetsSummary}</span>
                </p>
              )}
            </div>
            {isCardio ? (
              cardio?.completed && (
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                  <Check className="w-3 h-3 mr-1" />
                  Feito
                </Badge>
              )
            ) : (
              completedCount > 0 &&
              completedCount === sets.length && (
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                  <Check className="w-3 h-3 mr-1" />
                  {completedCount}/{sets.length}
                </Badge>
              )
            )}
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          {/* Sugestão de progressão de carga — baseada no RIR/reps da última
              vez. Botão "usar" preenche o peso dos sets ainda não feitos. */}
          {!isCardio && suggestion && completedCount === 0 && (
            <div
              className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-[11px] text-foreground/90 flex-1 leading-snug">{suggestion.message}</p>
              {onApplySuggestion && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-6 px-2 text-[10px] font-semibold shrink-0 bg-primary/20 hover:bg-primary/30 text-primary"
                  onClick={() => onApplySuggestion(suggestion.weight)}
                >
                  Usar
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo: cardio ou séries de força */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              {isCardio && cardio ? (
                <CardioForm cardio={cardio} onUpdate={onUpdateCardio} onToggleComplete={onToggleCardioComplete} />
              ) : (
                <div className="px-4 pb-3">
                  {/* Cabeçalho */}
                  <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 px-1 mb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    <div className="text-center">SET</div>
                    <div className="text-center">KG</div>
                    <div className="text-center">REPS</div>
                    <div></div>
                  </div>

                  {/* Sets */}
                  <div className="space-y-1.5">
                    {sets.map((set, setIdx) => {
                      const lastSet = lastSets?.[setIdx];
                      const weightPlaceholder = lastSet ? String(lastSet.weight) : "0";
                      const repsPlaceholder = lastSet ? String(lastSet.reps) : "0";
                      return (
                        <SetRow
                          key={setIdx}
                          set={set}
                          setIdx={setIdx}
                          canRemove={sets.length > 1}
                          weightPlaceholder={weightPlaceholder}
                          repsPlaceholder={repsPlaceholder}
                          onUpdate={(field, value) => onUpdateSet(setIdx, field, value)}
                          onUpdateRir={(value) => onUpdateSetRir(setIdx, value)}
                          onRemove={() => onRemoveSet(setIdx)}
                          onComplete={() => onCompleteSet(setIdx)}
                        />
                      );
                    })}
                  </div>

                  {/* Adicionar set */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddSet}
                    className="w-full mt-3 h-9 text-xs rounded-xl border border-dashed border-border/60 hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Adicionar série
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
