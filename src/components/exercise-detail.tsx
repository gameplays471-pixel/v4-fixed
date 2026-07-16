"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { X, Heart, Dumbbell, ListChecks, AlertCircle, Lightbulb } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles: string | null;
  equipment: string | null;
  category: string;
  equipmentType: string | null;
  level: string;
  description: string | null;
  executionSteps: string | null;
  commonMistakes: string | null;
  tips: string | null;
};

interface ExerciseDetailProps {
  exerciseId: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export function ExerciseDetail({ exerciseId, isFavorite, onToggleFavorite, onClose }: ExerciseDetailProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ exercise: Exercise }>(`/api/exercises/${exerciseId}`)
      .then((data) => setExercise(data.exercise))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex-1">
              <DialogTitle className="text-xl">{exercise?.name || "Carregando..."}</DialogTitle>
              <DialogDescription className="mt-1">
                {exercise && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{exercise.muscleGroup}</Badge>
                    <Badge variant="secondary">{exercise.level}</Badge>
                    <Badge variant="outline">{exercise.equipmentType}</Badge>
                    <Badge variant="outline">{exercise.category}</Badge>
                  </div>
                )}
              </DialogDescription>
            </div>
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exercise ? (
          <div className="space-y-5">
            {/* Mídia placeholder (sem GIF real) */}
            <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex flex-col items-center justify-center gap-2 border border-border">
              <Dumbbell className="w-12 h-12 text-primary/60" />
              <p className="text-xs text-muted-foreground">GIF/Imagem ilustrativa</p>
            </div>

            {/* Descrição */}
            {exercise.description && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{exercise.description}</p>
              </div>
            )}

            {/* Músculos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Músculo primário</p>
                <p className="text-sm font-medium">{exercise.muscleGroup}</p>
              </div>
              {exercise.secondaryMuscles && (
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Músculos secundários</p>
                  <p className="text-sm font-medium">{exercise.secondaryMuscles}</p>
                </div>
              )}
            </div>

            {/* Execução */}
            {exercise.executionSteps && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Como executar</h3>
                </div>
                <ol className="space-y-2">
                  {exercise.executionSteps.split("\n").map((step, i) => {
                    const clean = step.replace(/^\d+\.\s*/, "").trim();
                    if (!clean) return null;
                    return (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{clean}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* Erros comuns */}
            {exercise.commonMistakes && (
              <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <h3 className="font-semibold text-sm text-destructive">Erros comuns</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{exercise.commonMistakes}</p>
              </div>
            )}

            {/* Dicas */}
            {exercise.tips && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm text-primary">Dicas do coach</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{exercise.tips}</p>
              </div>
            )}

            {/* Equipamento */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex gap-2">
                <Badge variant="outline">{exercise.equipment}</Badge>
                {exercise.equipmentType && <Badge variant="outline">{exercise.equipmentType}</Badge>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Exercício não encontrado.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
