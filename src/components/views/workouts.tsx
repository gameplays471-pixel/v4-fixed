"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Play, Edit2, Trash2, ChevronRight, X, Search, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { muscleGroups } from "@/lib/exercises-data";
import { ExerciseThumb, ExerciseImageDialog } from "@/components/exercise-media";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  equipmentType: string | null;
  level: string;
  category: string;
  images: string[];
};

type WorkoutExercise = {
  id: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  notes: string | null;
  targetDurationSec: number | null;
  targetDistanceKm: number | null;
  targetIntensity: string | null;
  exercise: Exercise;
};

type Workout = {
  id: string;
  name: string;
  description: string | null;
  defaultRest: number;
  color: string | null;
  exercises: WorkoutExercise[];
  _count: { sessions: number };
};

const COLOR_OPTIONS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const INTENSITY_OPTIONS = ["Leve", "Moderada", "Intensa"];

export function WorkoutsView() {
  const setView = useAppStore((s) => s.setView);
  const setActiveWorkoutId = useAppStore((s) => s.setActiveWorkoutId);
  const editingWorkoutId = useAppStore((s) => s.editingWorkoutId);
  const setEditingWorkoutId = useAppStore((s) => s.setEditingWorkoutId);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  const load = () => {
    setLoading(true);
    apiGet<{ workouts: Workout[] }>("/api/workouts")
      .then((d) => setWorkouts(d.workouts))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editingWorkoutId) {
      setShowEditor(true);
    }
  }, [editingWorkoutId]);

  const startWorkout = (id: string) => {
    setActiveWorkoutId(id);
    setView("active-workout");
  };

  const handleEdit = (id: string) => {
    setEditingWorkoutId(id);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;
    try {
      await apiDelete(`/api/workouts/${id}`);
      toast.success("Treino excluído");
      load();
    } catch (e) {
      toast.error("Erro ao excluir");
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingWorkoutId(null);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Treinos</h1>
          <p className="text-sm text-muted-foreground mt-1">Crie divisões (ABC, PPL, Upper/Lower) e personalize.</p>
        </div>
        <Button
          onClick={() => {
            setEditingWorkoutId(null);
            setShowEditor(true);
          }}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar treino
        </Button>
      </div>

      {/* Sugestões de divisão */}
      {workouts.length === 0 && !loading && (
        <Card className="p-6">
          <h2 className="font-semibold mb-3">Comece com uma divisão popular:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: "Treino A", desc: "Peito + Tríceps", color: "#ef4444" },
              { name: "Treino B", desc: "Costas + Bíceps", color: "#10b981" },
              { name: "Treino C", desc: "Pernas", color: "#f59e0b" },
              { name: "Push", desc: "Empurrar", color: "#3b82f6" },
            ].map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setEditingWorkoutId(null);
                  setShowEditor(true);
                }}
                className="text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-md mb-2" style={{ background: t.color }} />
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de treinos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workouts.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: w.color || "var(--primary)" }}>
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{w.name}</h3>
                      <p className="text-xs text-muted-foreground">{w._count.sessions}× realizado</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(w.id)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(w.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {w.description && <p className="text-xs text-muted-foreground mb-3">{w.description}</p>}

                <div className="space-y-2 mb-4">
                  {w.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate flex-1">{ex.exercise.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {ex.exercise.category === "Cardio"
                          ? `${Math.round((ex.targetDurationSec ?? 1800) / 60)} min · ${ex.targetIntensity || "Moderada"}`
                          : `${ex.targetSets}×${ex.targetReps} · ${ex.restSeconds}s`}
                      </span>
                    </div>
                  ))}
                  {w.exercises.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Sem exercícios</p>
                  )}
                </div>

                <Button onClick={() => startWorkout(w.id)} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar treino
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {showEditor && <WorkoutEditor workoutId={editingWorkoutId} onClose={handleCloseEditor} />}
    </div>
  );
}

// ============== EDITOR DE TREINO ==============
function WorkoutEditor({ workoutId, onClose }: { workoutId: string | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [defaultRest, setDefaultRest] = useState(90);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(!!workoutId);
  const [saving, setSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [lightboxExercise, setLightboxExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (workoutId) {
      apiGet<{ workout: Workout }>(`/api/workouts/${workoutId}`)
        .then((data) => {
          const w = data.workout;
          setName(w.name);
          setDescription(w.description || "");
          setColor(w.color || COLOR_OPTIONS[0]);
          setDefaultRest(w.defaultRest);
          setExercises(w.exercises);
        })
        .finally(() => setLoading(false));
    }
  }, [workoutId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Digite um nome para o treino");
      return;
    }
    if (exercises.length === 0) {
      toast.error("Adicione pelo menos um exercício");
      return;
    }

    setSaving(true);
    const payload = {
      name,
      description,
      color,
      defaultRest,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        restSeconds: ex.restSeconds,
        notes: ex.notes,
        targetDurationSec: ex.targetDurationSec,
        targetDistanceKm: ex.targetDistanceKm,
        targetIntensity: ex.targetIntensity,
      })),
    };

    try {
      if (workoutId) {
        await apiPut(`/api/workouts/${workoutId}`, payload);
        toast.success("Treino atualizado!");
      } else {
        await apiPost("/api/workouts", payload);
        toast.success("Treino criado!");
      }
      onClose();
    } catch (e) {
      toast.error("Erro ao salvar treino");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addExercise = (ex: Exercise) => {
    const isCardio = ex.category === "Cardio";
    setExercises([
      ...exercises,
      {
        id: `temp-${Date.now()}`,
        exerciseId: ex.id,
        order: exercises.length + 1,
        targetSets: 3,
        targetReps: 10,
        restSeconds: defaultRest,
        notes: null,
        targetDurationSec: isCardio ? 1800 : null,
        targetDistanceKm: null,
        targetIntensity: isCardio ? "Moderada" : null,
        exercise: ex,
      },
    ]);
    setShowExercisePicker(false);
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const updateExercise = (idx: number, updates: Partial<WorkoutExercise>) => {
    setExercises(exercises.map((ex, i) => (i === idx ? { ...ex, ...updates } : ex)));
  };

  const moveExercise = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    const newArr = [...exercises];
    [newArr[idx], newArr[newIdx]] = [newArr[newIdx], newArr[idx]];
    setExercises(newArr);
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl">
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Importante (correção do bug mobile): o seletor de exercícios NÃO é mais
  // um <Dialog> separado. Dois <Dialog> do Radix empilhados usam portais
  // independentes; no toque (mobile), o clique dentro do segundo dialog é
  // interpretado como "fora" do primeiro, fechando o editor e perdendo o
  // treino. Agora existe um único Dialog cujo conteúdo interno alterna
  // entre o formulário do treino e o seletor de exercícios.
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (open) return;
          // Se o seletor estiver aberto, fechar apenas ele (voltar ao formulário).
          if (showExercisePicker) {
            setShowExercisePicker(false);
            return;
          }
          onClose();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showExercisePicker ? (
            <ExercisePickerContent
              onPick={addExercise}
              onBack={() => setShowExercisePicker(false)}
              excludeIds={exercises.map((e) => e.exerciseId)}
            />
          ) : (
          <>
          <DialogHeader>
            <DialogTitle>{workoutId ? "Editar treino" : "Criar treino"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do treino</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Tríceps"
              />
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição (opcional)</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas gerais sobre este treino"
                rows={2}
              />
            </div>

            {/* Descanso padrão */}
            <div className="space-y-2">
              <Label htmlFor="rest">Descanso padrão (segundos)</Label>
              <Input
                id="rest"
                type="number"
                value={defaultRest}
                onChange={(e) => setDefaultRest(parseInt(e.target.value) || 90)}
              />
            </div>

            {/* Exercícios */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Exercícios ({exercises.length})</Label>
                <Button size="sm" variant="outline" onClick={() => setShowExercisePicker(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                  Nenhum exercício. Clique em "Adicionar".
                </div>
              ) : (
                <div className="space-y-2">
                  {exercises.map((ex, idx) => (
                    <div key={ex.id} className="bg-card rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <ExerciseThumb
                          images={ex.exercise.images}
                          name={ex.exercise.name}
                          className="w-9 h-9 rounded-md"
                          onClick={() => setLightboxExercise(ex.exercise)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ex.exercise.name}</p>
                          <p className="text-xs text-muted-foreground">{ex.exercise.muscleGroup}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => moveExercise(idx, -1)}
                            disabled={idx === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => moveExercise(idx, 1)}
                            disabled={idx === exercises.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={() => removeExercise(idx)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      {ex.exercise.category === "Cardio" ? (
                        <div className="grid grid-cols-3 gap-2 pl-6">
                          <div>
                            <label className="text-[10px] text-muted-foreground">Duração (min)</label>
                            <Input
                              type="number"
                              value={Math.round((ex.targetDurationSec ?? 1800) / 60)}
                              onChange={(e) =>
                                updateExercise(idx, { targetDurationSec: (parseInt(e.target.value) || 30) * 60 })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Distância (km)</label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="opcional"
                              value={ex.targetDistanceKm ?? ""}
                              onChange={(e) =>
                                updateExercise(idx, { targetDistanceKm: e.target.value ? parseFloat(e.target.value) : null })
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Intensidade</label>
                            <select
                              value={ex.targetIntensity ?? "Moderada"}
                              onChange={(e) => updateExercise(idx, { targetIntensity: e.target.value })}
                              className="h-8 w-full text-sm rounded-md border border-input bg-background px-1"
                            >
                              {INTENSITY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                      <div className="grid grid-cols-3 gap-2 pl-6">
                        <div>
                          <label className="text-[10px] text-muted-foreground">Séries</label>
                          <Input
                            type="number"
                            value={ex.targetSets}
                            onChange={(e) => updateExercise(idx, { targetSets: parseInt(e.target.value) || 3 })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Reps</label>
                          <Input
                            type="number"
                            value={ex.targetReps}
                            onChange={(e) => updateExercise(idx, { targetReps: parseInt(e.target.value) || 10 })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Descanso (s)</label>
                          <Input
                            type="number"
                            value={ex.restSeconds}
                            onChange={(e) => updateExercise(idx, { restSeconds: parseInt(e.target.value) || 90 })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : workoutId ? "Salvar alterações" : "Criar treino"}
            </Button>
          </DialogFooter>
          </>
          )}
        </DialogContent>
      </Dialog>

      <ExerciseImageDialog
        open={!!lightboxExercise}
        onOpenChange={(o) => !o && setLightboxExercise(null)}
        images={lightboxExercise?.images}
        name={lightboxExercise?.name || ""}
      />
    </>
  );
}

// ============== SELETOR DE EXERCÍCIOS ==============
// Renderizado DENTRO do mesmo <Dialog> do editor de treino (ver acima).
// Não é mais um <Dialog> próprio — isso evita o bug em que, no celular,
// tocar num exercício era interpretado como clique "fora" do editor.
function ExercisePickerContent({
  onPick,
  onBack,
  excludeIds,
}: {
  onPick: (ex: Exercise) => void;
  onBack: () => void;
  excludeIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [filterMuscles, setFilterMuscles] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxExercise, setLightboxExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterMuscles.length > 0) params.set("muscleGroup", filterMuscles.join(","));
    apiGet<{ exercises: Exercise[] }>(`/api/exercises?${params.toString()}`)
      .then((d) => setExercises(d.exercises))
      .finally(() => setLoading(false));
  }, [search, filterMuscles]);

  const toggleMuscle = (m: string) => {
    setFilterMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const filtered = exercises.filter((e) => !excludeIds.includes(e.id));

  return (
    <div className="flex flex-col max-h-[80vh]">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 -ml-2"
            onClick={onBack}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <DialogTitle>Adicionar exercício</DialogTitle>
        </div>
      </DialogHeader>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercício (sem acento, minúsculo tudo bem)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {muscleGroups.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleMuscle(m)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterMuscles.includes(m)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {m}
            </button>
          ))}
          {filterMuscles.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterMuscles([])}
              className="px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1 mt-2">
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Nenhum exercício encontrado</div>
        ) : (
          filtered.map((ex) => (
            <div
              key={ex.id}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <ExerciseThumb
                images={ex.images}
                name={ex.name}
                className="w-10 h-10 rounded-lg"
                onClick={() => setLightboxExercise(ex)}
              />
              <button
                type="button"
                onClick={() => onPick(ex)}
                className="flex-1 min-w-0 flex items-center gap-2 text-left active:opacity-70"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{ex.muscleGroup} · {ex.equipment}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </div>
          ))
        )}
      </div>

      <ExerciseImageDialog
        open={!!lightboxExercise}
        onOpenChange={(o) => !o && setLightboxExercise(null)}
        images={lightboxExercise?.images}
        name={lightboxExercise?.name || ""}
      />
    </div>
  );
}
