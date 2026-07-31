"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { apiGet } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { Search, Repeat } from "lucide-react";
import { muscleGroups } from "@/lib/exercises-data";
import { ExerciseThumb, ExerciseImageDialog } from "@/components/exercise-media";

export type SubstitutableExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  equipmentType: string | null;
  level: string;
  category: string;
  images: string[];
};

/**
 * Dialog de substituição de exercício — usado tanto no editor de treino
 * (menu "Meus treinos") quanto no treino ativo, pra adequar um exercício
 * à academia ou ao gosto do aluno sem precisar recriar o item do treino
 * (mantém séries/reps/descanso já configurados).
 *
 * Por padrão filtra pelo grupo muscular do exercício atual (substitutos
 * mais prováveis), mas o filtro é editável e a busca cobre todos os
 * exercícios da mesma categoria (força/hipertrofia não vira cardio e
 * vice-versa, pra não quebrar o formato dos dados da série).
 */
export function ExerciseSubstituteDialog({
  currentExercise,
  excludeIds = [],
  onSelect,
  onClose,
}: {
  currentExercise: SubstitutableExercise;
  /** Exercícios já usados no mesmo treino (evita duplicar). */
  excludeIds?: string[];
  onSelect: (exercise: SubstitutableExercise) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterMuscles, setFilterMuscles] = useState<string[]>([currentExercise.muscleGroup]);
  const [lightbox, setLightbox] = useState<SubstitutableExercise | null>(null);

  const exercisesQuery = useQuery({
    queryKey: queryKeys.exercises,
    queryFn: () => apiGet<{ exercises: SubstitutableExercise[] }>("/api/exercises").then((d) => d.exercises),
  });
  const allExercises = exercisesQuery.data ?? [];
  const loading = exercisesQuery.isLoading;

  useEffect(() => {
    if (exercisesQuery.isError) {
      console.error("Erro ao carregar exercícios para substituição:", exercisesQuery.error);
      toast.error("Não foi possível carregar a lista de exercícios.");
    }
  }, [exercisesQuery.isError, exercisesQuery.error]);

  const exclude = new Set([currentExercise.id, ...excludeIds]);

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allExercises
      // Trocar força/hipertrofia por cardio (ou vice-versa) quebraria o
      // formato da série (peso×reps vs duração/distância) — restringe à
      // mesma categoria pra manter o slot consistente.
      .filter((ex) => ex.category === currentExercise.category)
      .filter((ex) => !exclude.has(ex.id))
      .filter((ex) => {
        if (filterMuscles.length > 0 && !filterMuscles.includes(ex.muscleGroup)) return false;
        if (term && !ex.name.toLowerCase().includes(term) && !ex.muscleGroup.toLowerCase().includes(term)) return false;
        return true;
      })
      .sort((a, b) => {
        const aMatch = a.muscleGroup === currentExercise.muscleGroup ? 0 : 1;
        const bMatch = b.muscleGroup === currentExercise.muscleGroup ? 0 : 1;
        return aMatch - bMatch || a.name.localeCompare(b.name);
      });
  }, [allExercises, search, filterMuscles, currentExercise, excludeIds]);

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-primary" />
              <DialogTitle className="font-black">Substituir exercício</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Trocando <span className="font-semibold text-foreground">{currentExercise.name}</span> — séries, reps e descanso configurados são mantidos.
          </p>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exercício ou músculo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pb-1">
              {muscleGroups.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFilterMuscles((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filterMuscles.includes(m)
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:bg-accent hover:border-primary/30"
                  }`}
                >
                  {m}
                </button>
              ))}
              {filterMuscles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterMuscles([])}
                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Ver todos
                </button>
              )}
            </div>

            <div className="space-y-0.5 min-h-0 overflow-y-auto" style={{ maxHeight: "45vh" }}>
              {loading ? (
                <div className="space-y-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                      <LoadingSkeleton className="w-10 h-10 rounded-lg shrink-0" style={{ animationDelay: `${i * 0.05}s` }} />
                      <div className="flex-1 space-y-1.5">
                        <LoadingSkeleton className="h-3.5 w-2/3 rounded" style={{ animationDelay: `${i * 0.05}s` }} />
                        <LoadingSkeleton className="h-2.5 w-1/3 rounded" style={{ animationDelay: `${i * 0.05}s` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : candidates.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum exercício encontrado para substituir
                </div>
              ) : (
                candidates.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all cursor-pointer hover:bg-accent/50"
                  >
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                      <ExerciseThumb images={ex.images} name={ex.name} className="w-10 h-10 rounded-lg" onClick={() => setLightbox(ex)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{ex.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {ex.muscleGroup} · {ex.equipment}
                        {ex.muscleGroup === currentExercise.muscleGroup && (
                          <Badge className="ml-1.5 bg-primary/15 text-primary border-primary/20 text-[9px] rounded-full align-middle">
                            mesmo grupo
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ExerciseImageDialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)} images={lightbox?.images} name={lightbox?.name || ""} />
    </>
  );
}
