"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

const COLOR_OPTIONS = ["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#84cc16"];
const INTENSITY_OPTIONS = ["Leve","Moderada","Intensa"];

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

  useEffect(() => { load(); }, []);
  useEffect(() => { if (editingWorkoutId) setShowEditor(true); }, [editingWorkoutId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este treino?")) return;
    await apiDelete(`/api/workouts/${id}`).then(() => { toast.success("Treino excluído"); load(); }).catch(() => toast.error("Erro ao excluir"));
  };

  const handleCloseEditor = () => { setShowEditor(false); setEditingWorkoutId(null); load(); };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Treinos</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize suas divisões e inicie treinos.</p>
        </div>
        <Button
          onClick={() => { setEditingWorkoutId(null); setShowEditor(true); }}
          className="shrink-0 rounded-xl h-10 px-4 gap-2 bg-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Criar
        </Button>
      </div>

      {/* Empty state com sugestões */}
      {workouts.length === 0 && !loading && (
        <Card className="p-5">
          <p className="text-sm font-semibold mb-3 text-muted-foreground">Divisões populares para começar</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: "Treino A", desc: "Peito + Tríceps", color: "#ef4444" },
              { name: "Treino B", desc: "Costas + Bíceps", color: "#10b981" },
              { name: "Treino C", desc: "Pernas", color: "#f59e0b" },
              { name: "Push", desc: "Empurrar", color: "#3b82f6" },
            ].map((t) => (
              <button
                key={t.name}
                onClick={() => { setEditingWorkoutId(null); setShowEditor(true); }}
                className="text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg mb-2" style={{ background: t.color }} />
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-card rounded-2xl border border-border/60 animate-pulse-slow" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workouts.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-5 flex flex-col gap-4 hover:border-border transition-colors">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ background: w.color || "var(--primary)" }}
                    >
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{w.name}</p>
                      <p className="text-[11px] text-muted-foreground">{w._count.sessions}× realizado</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setEditingWorkoutId(w.id); setShowEditor(true); }}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive" onClick={() => handleDelete(w.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Exercícios */}
                <div className="flex-1 space-y-1.5">
                  {w.exercises.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Nenhum exercício</p>
                  ) : (
                    <>
                      {w.exercises.slice(0, 5).map((ex) => (
                        <div key={ex.id} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate flex-1 pr-2">{ex.exercise.name}</span>
                          <span className="text-[11px] text-muted-foreground/60 shrink-0 tabular-nums">
                            {ex.exercise.category === "Cardio"
                              ? `${Math.round((ex.targetDurationSec ?? 1800) / 60)}min`
                              : `${ex.targetSets}×${ex.targetReps}`}
                          </span>
                        </div>
                      ))}
                      {w.exercises.length > 5 && (
                        <p className="text-[11px] text-muted-foreground/50">+{w.exercises.length - 5} exercícios</p>
                      )}
                    </>
                  )}
                </div>

                {/* Botão */}
                <Button
                  onClick={() => { setActiveWorkoutId(w.id); setView("active-workout"); }}
                  className="w-full h-9 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> Iniciar treino
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

// ─── EDITOR ───────────────────────────────────────────────────────────────────
function WorkoutEditor({ workoutId, onClose }: { workoutId: string | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [defaultRest, setDefaultRest] = useState(90);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(!!workoutId);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [lightbox, setLightbox] = useState<Exercise | null>(null);

  useEffect(() => {
    if (!workoutId) return;
    apiGet<{ workout: Workout }>(`/api/workouts/${workoutId}`).then(({ workout: w }) => {
      setName(w.name); setDescription(w.description || ""); setColor(w.color || COLOR_OPTIONS[0]);
      setDefaultRest(w.defaultRest); setExercises(w.exercises);
    }).finally(() => setLoading(false));
  }, [workoutId]);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Digite um nome");
    if (exercises.length === 0) return toast.error("Adicione pelo menos um exercício");
    setSaving(true);
    const payload = {
      name, description, color, defaultRest,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId, targetSets: ex.targetSets, targetReps: ex.targetReps,
        restSeconds: ex.restSeconds, notes: ex.notes, targetDurationSec: ex.targetDurationSec,
        targetDistanceKm: ex.targetDistanceKm, targetIntensity: ex.targetIntensity,
      })),
    };
    try {
      if (workoutId) { await apiPut(`/api/workouts/${workoutId}`, payload); toast.success("Treino atualizado!"); }
      else { await apiPost("/api/workouts", payload); toast.success("Treino criado!"); }
      onClose();
    } catch { toast.error("Erro ao salvar"); } finally { setSaving(false); }
  };

  const addExercise = (ex: Exercise) => {
    const isCardio = ex.category === "Cardio";
    setExercises([...exercises, {
      id: `temp-${Date.now()}`, exerciseId: ex.id, order: exercises.length + 1,
      targetSets: 3, targetReps: 10, restSeconds: defaultRest, notes: null,
      targetDurationSec: isCardio ? 1800 : null, targetDistanceKm: null,
      targetIntensity: isCardio ? "Moderada" : null, exercise: ex,
    }]);
    setShowPicker(false);
  };

  const removeExercise = (idx: number) => setExercises(exercises.filter((_, i) => i !== idx));
  const updateExercise = (idx: number, u: Partial<WorkoutExercise>) => setExercises(exercises.map((ex, i) => i === idx ? { ...ex, ...u } : ex));
  const moveExercise = (idx: number, dir: -1 | 1) => {
    const n = idx + dir;
    if (n < 0 || n >= exercises.length) return;
    const a = [...exercises]; [a[idx], a[n]] = [a[n], a[idx]]; setExercises(a);
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl">
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open) { if (showPicker) { setShowPicker(false); return; } onClose(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showPicker ? (
            <ExercisePickerContent
              onPick={addExercise}
              onBack={() => setShowPicker(false)}
              excludeIds={exercises.map((e) => e.exerciseId)}
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{workoutId ? "Editar treino" : "Criar treino"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-1">
                {/* Nome */}
                <div className="space-y-1.5">
                  <Label htmlFor="wname">Nome do treino</Label>
                  <Input id="wname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Treino A — Peito e Tríceps" className="h-10" />
                </div>

                {/* Cor */}
                <div className="space-y-1.5">
                  <Label>Cor</Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-offset-background ring-white scale-110" : "opacity-70 hover:opacity-100"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <Label htmlFor="wdesc">Descrição <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                  <Textarea id="wdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notas sobre este treino" rows={2} />
                </div>

                {/* Descanso padrão */}
                <div className="space-y-1.5">
                  <Label htmlFor="wrest">Descanso padrão (segundos)</Label>
                  <Input id="wrest" type="number" value={defaultRest} onChange={(e) => setDefaultRest(parseInt(e.target.value) || 90)} className="h-10 w-32" />
                </div>

                {/* Exercícios */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Exercícios <span className="text-muted-foreground font-normal">({exercises.length})</span></Label>
                    <Button size="sm" variant="outline" onClick={() => setShowPicker(true)} className="h-8 rounded-lg gap-1">
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </Button>
                  </div>

                  {exercises.length === 0 ? (
                    <button
                      onClick={() => setShowPicker(true)}
                      className="w-full py-8 text-sm text-muted-foreground border border-dashed border-border/60 rounded-xl hover:border-primary/40 hover:text-primary transition-all"
                    >
                      + Adicionar exercícios
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {exercises.map((ex, idx) => (
                        <div key={ex.id} className="bg-muted/30 rounded-xl p-3 border border-border/40">
                          <div className="flex items-center gap-2 mb-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                            <ExerciseThumb images={ex.exercise.images} name={ex.exercise.name} className="w-9 h-9 rounded-lg shrink-0" onClick={() => setLightbox(ex.exercise)} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{ex.exercise.name}</p>
                              <p className="text-[11px] text-muted-foreground">{ex.exercise.muscleGroup}</p>
                            </div>
                            <div className="flex gap-0.5">
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground" onClick={() => moveExercise(idx, -1)} disabled={idx === 0}>↑</Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground" onClick={() => moveExercise(idx, 1)} disabled={idx === exercises.length - 1}>↓</Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:text-destructive" onClick={() => removeExercise(idx)}><X className="w-3.5 h-3.5" /></Button>
                            </div>
                          </div>

                          {ex.exercise.category === "Cardio" ? (
                            <div className="grid grid-cols-3 gap-2 pl-5">
                              <div>
                                <label className="text-[10px] text-muted-foreground">Duração (min)</label>
                                <Input type="number" value={Math.round((ex.targetDurationSec ?? 1800) / 60)} onChange={(e) => updateExercise(idx, { targetDurationSec: (parseInt(e.target.value) || 30) * 60 })} className="h-8 text-sm mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Distância (km)</label>
                                <Input type="number" step="0.1" placeholder="—" value={ex.targetDistanceKm ?? ""} onChange={(e) => updateExercise(idx, { targetDistanceKm: e.target.value ? parseFloat(e.target.value) : null })} className="h-8 text-sm mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Intensidade</label>
                                <select value={ex.targetIntensity ?? "Moderada"} onChange={(e) => updateExercise(idx, { targetIntensity: e.target.value })} className="h-8 w-full text-sm rounded-lg border border-input bg-background px-2 mt-1">
                                  {INTENSITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 pl-5">
                              <div>
                                <label className="text-[10px] text-muted-foreground">Séries</label>
                                <Input type="number" value={ex.targetSets} onChange={(e) => updateExercise(idx, { targetSets: parseInt(e.target.value) || 3 })} className="h-8 text-sm mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Reps</label>
                                <Input type="number" value={ex.targetReps} onChange={(e) => updateExercise(idx, { targetReps: parseInt(e.target.value) || 10 })} className="h-8 text-sm mt-1" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Descanso (s)</label>
                                <Input type="number" value={ex.restSeconds} onChange={(e) => updateExercise(idx, { restSeconds: parseInt(e.target.value) || 90 })} className="h-8 text-sm mt-1" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-primary">
                  {saving ? "Salvando..." : workoutId ? "Salvar" : "Criar treino"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ExerciseImageDialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)} images={lightbox?.images} name={lightbox?.name || ""} />
    </>
  );
}

// ─── SELETOR DE EXERCÍCIOS ────────────────────────────────────────────────────
function ExercisePickerContent({ onPick, onBack, excludeIds }: { onPick: (ex: Exercise) => void; onBack: () => void; excludeIds: string[] }) {
  const [search, setSearch] = useState("");
  const [filterMuscles, setFilterMuscles] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Exercise | null>(null);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (filterMuscles.length) p.set("muscleGroup", filterMuscles.join(","));
    apiGet<{ exercises: Exercise[] }>(`/api/exercises?${p}`).then((d) => setExercises(d.exercises)).finally(() => setLoading(false));
  }, [search, filterMuscles]);

  const filtered = exercises.filter((e) => !excludeIds.includes(e.id));

  return (
    <div className="flex flex-col gap-3 max-h-[80vh]">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 -ml-2 rounded-lg" onClick={onBack}>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <DialogTitle>Adicionar exercício</DialogTitle>
        </div>
      </DialogHeader>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" autoFocus />
      </div>

      {/* Filtros de músculo */}
      <div className="flex flex-wrap gap-1.5">
        {muscleGroups.map((m) => (
          <button
            key={m} type="button"
            onClick={() => setFilterMuscles((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m])}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterMuscles.includes(m) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-accent"
            }`}
          >{m}</button>
        ))}
        {filterMuscles.length > 0 && (
          <button type="button" onClick={() => setFilterMuscles([])} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Limpar</button>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-0.5 min-h-0">
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Nenhum exercício encontrado</div>
        ) : filtered.map((ex) => (
          <div key={ex.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-accent/50 transition-colors">
            <ExerciseThumb images={ex.images} name={ex.name} className="w-10 h-10 rounded-lg shrink-0" onClick={() => setLightbox(ex)} />
            <button type="button" onClick={() => onPick(ex)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{ex.name}</p>
                <p className="text-[11px] text-muted-foreground">{ex.muscleGroup} · {ex.equipment}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        ))}
      </div>

      <ExerciseImageDialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)} images={lightbox?.images} name={lightbox?.name || ""} />
    </div>
  );
}
