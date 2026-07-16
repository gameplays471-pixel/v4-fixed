"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import {
  Check,
  X,
  Plus,
  Minus,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Trophy,
  Dumbbell,
  Clock,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Workout = {
  id: string;
  name: string;
  defaultRest: number;
  exercises: Array<{
    id: string;
    exerciseId: string;
    order: number;
    targetSets: number;
    targetReps: number;
    restSeconds: number;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      equipment: string | null;
    };
  }>;
};

type SetState = {
  weight: string;
  reps: string;
  completed: boolean;
};

export function ActiveWorkoutView() {
  const setView = useAppStore((s) => s.setView);
  const activeWorkoutId = useAppStore((s) => s.activeWorkoutId);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [startedAt] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sets state: Map<exerciseId, SetState[]>
  const [setsMap, setSetsMap] = useState<Record<string, SetState[]>>({});

  // Timer state
  const [restTimer, setRestTimer] = useState<{ active: boolean; remaining: number; total: number; paused: boolean }>({
    active: false,
    remaining: 0,
    total: 0,
    paused: false,
  });
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar treino
  useEffect(() => {
    if (!activeWorkoutId) {
      setView("workouts");
      return;
    }
    apiGet<{ workout: Workout }>(`/api/workouts/${activeWorkoutId}`)
      .then((data) => {
        setWorkout(data.workout);
        // Inicializar sets
        const initial: Record<string, SetState[]> = {};
        for (const ex of data.workout.exercises) {
          initial[ex.id] = Array.from({ length: ex.targetSets }, () => ({
            weight: "",
            reps: ex.targetReps.toString(),
            completed: false,
          }));
        }
        setSetsMap(initial);
      })
      .finally(() => setLoading(false));
  }, [activeWorkoutId, setView]);

  // Cronômetro de treino
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // Timer de descanso
  useEffect(() => {
    if (!restTimer.active || restTimer.paused) return;
    if (restTimer.remaining <= 0) {
      // Timer concluído
      if (soundOn) {
        playBeep();
      }
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      toast.success("Descanso concluído! 🔥");
      setRestTimer({ active: false, remaining: 0, total: 0, paused: false });
      return;
    }
    const interval = setInterval(() => {
      setRestTimer((prev) => ({ ...prev, remaining: prev.remaining - 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.paused, restTimer.remaining, soundOn]);

  const playBeep = () => {
    try {
      // Web Audio API beep
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleCompleteSet = (exerciseId: string, setIdx: number, restSeconds: number) => {
    const sets = setsMap[exerciseId];
    if (!sets) return;
    const wasCompleted = sets[setIdx].completed;
    
    const updated = [...sets];
    updated[setIdx] = { ...updated[setIdx], completed: !wasCompleted };
    setSetsMap({ ...setsMap, [exerciseId]: updated });

    // Iniciar timer de descanso ao completar
    if (!wasCompleted) {
      setRestTimer({
        active: true,
        remaining: restSeconds,
        total: restSeconds,
        paused: false,
      });
    }
  };

  const updateSet = (exerciseId: string, setIdx: number, field: "weight" | "reps", value: string) => {
    const sets = setsMap[exerciseId];
    if (!sets) return;
    const updated = [...sets];
    updated[setIdx] = { ...updated[setIdx], [field]: value };
    setSetsMap({ ...setsMap, [exerciseId]: updated });
  };

  const addSet = (exerciseId: string) => {
    const sets = setsMap[exerciseId];
    if (!sets) return;
    const lastSet = sets[sets.length - 1];
    setSetsMap({
      ...setsMap,
      [exerciseId]: [...sets, { weight: lastSet?.weight || "", reps: lastSet?.reps || "10", completed: false }],
    });
  };

  const removeSet = (exerciseId: string, setIdx: number) => {
    const sets = setsMap[exerciseId];
    if (!sets || sets.length === 1) return;
    setSetsMap({
      ...setsMap,
      [exerciseId]: sets.filter((_, i) => i !== setIdx),
    });
  };

  const toggleCollapse = (exerciseId: string) => {
    const newSet = new Set(collapsedExercises);
    if (newSet.has(exerciseId)) {
      newSet.delete(exerciseId);
    } else {
      newSet.add(exerciseId);
    }
    setCollapsedExercises(newSet);
  };

  const totalSets = workout?.exercises.reduce((acc, ex) => acc + (setsMap[ex.id]?.length || 0), 0) || 0;
  const completedSets = workout?.exercises.reduce((acc, ex) => {
    return acc + (setsMap[ex.id]?.filter((s) => s.completed).length || 0);
  }, 0) || 0;

  const totalVolume = workout?.exercises.reduce((acc, ex) => {
    return acc + (setsMap[ex.id]?.reduce((s, set) => s + (set.completed ? (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0) : 0), 0) || 0);
  }, 0) || 0;

  const handleFinish = async () => {
    if (!workout) return;
    setSaving(true);

    const setsData: Array<{ exerciseId: string; exerciseName: string; weight: number; reps: number; restSeconds: number }> = [];
    for (const ex of workout.exercises) {
      const sets = setsMap[ex.id] || [];
      for (const set of sets) {
        if (set.completed && set.weight && set.reps) {
          setsData.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps) || 0,
            restSeconds: ex.restSeconds,
          });
        }
      }
    }

    if (setsData.length === 0) {
      toast.error("Nenhum set completo. Marque pelo menos um set antes de finalizar.");
      setSaving(false);
      return;
    }

    try {
      await apiPost("/api/sessions", {
        workoutId: workout.id,
        workoutName: workout.name,
        startedAt: startedAt.toISOString(),
        endedAt: new Date().toISOString(),
        durationSec: elapsed,
        sets: setsData,
      });
      toast.success("Treino finalizado! 💪 Confira seus recordes.");
      setView("history");
    } catch (e) {
      toast.error("Erro ao salvar treino");
      console.error(e);
    } finally {
      setSaving(false);
      setShowFinishModal(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Cancelar treino? Os dados não serão salvos.")) {
      setView("workouts");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workout) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Treino não encontrado</p>
        <Button onClick={() => setView("workouts")} className="mt-4">Voltar</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-24">
      {/* Header fixo */}
      <div className="sticky top-14 md:top-0 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{workout.name}</h1>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(elapsed)}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {completedSets}/{totalSets} sets
              </span>
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                {Math.round(totalVolume)} kg
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>Cancelar</Button>
            <Button size="sm" onClick={() => setShowFinishModal(true)} className="bg-primary">
              Finalizar
            </Button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Timer de descanso (overlay quando ativo) */}
      <AnimatePresence>
        {restTimer.active && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-32 md:top-24 z-20"
          >
            <Card className="p-4 bg-primary/10 border-primary/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-primary font-medium">Descanso</p>
                  <p className="text-3xl font-bold tabular-nums">{formatTime(restTimer.remaining)}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => setRestTimer((prev) => ({ ...prev, paused: !prev.paused }))}
                  >
                    {restTimer.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => setRestTimer((prev) => ({ ...prev, remaining: prev.remaining + 15 }))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => setRestTimer((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - 15) }))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => setSoundOn(!soundOn)}
                  >
                    {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => setRestTimer({ active: false, remaining: 0, total: 0, paused: false })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* Barra de progresso do timer */}
              <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${restTimer.total > 0 ? (restTimer.remaining / restTimer.total) * 100 : 0}%` }}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercícios */}
      <div className="space-y-3 mt-4">
        {workout.exercises.map((ex, exIdx) => {
          const sets = setsMap[ex.id] || [];
          const isCollapsed = collapsedExercises.has(ex.id);
          const completedCount = sets.filter((s) => s.completed).length;

          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: exIdx * 0.03 }}
            >
              <Card className="overflow-hidden">
                {/* Header do exercício */}
                <div
                  className="p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => toggleCollapse(ex.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {exIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{ex.exercise.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {ex.exercise.muscleGroup} · {sets.length} séries · descanso {ex.restSeconds}s
                      </p>
                    </div>
                    {completedCount > 0 && completedCount === sets.length && (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                        <Check className="w-3 h-3 mr-1" />
                        {completedCount}/{sets.length}
                      </Badge>
                    )}
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Sets */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
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
                          {sets.map((set, setIdx) => (
                            <div
                              key={setIdx}
                              className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center p-1 rounded-lg transition-colors ${
                                set.completed ? "bg-primary/10" : ""
                              }`}
                            >
                              <div className="text-center text-sm font-medium text-muted-foreground">
                                {setIdx + 1}
                              </div>
                              <Input
                                type="number"
                                step="0.5"
                                placeholder="0"
                                value={set.weight}
                                onChange={(e) => updateSet(ex.id, setIdx, "weight", e.target.value)}
                                className={`h-10 text-center font-medium ${set.completed ? "bg-background" : ""}`}
                                disabled={set.completed}
                              />
                              <Input
                                type="number"
                                placeholder="0"
                                value={set.reps}
                                onChange={(e) => updateSet(ex.id, setIdx, "reps", e.target.value)}
                                className={`h-10 text-center font-medium ${set.completed ? "bg-background" : ""}`}
                                disabled={set.completed}
                              />
                              <div className="flex gap-0.5">
                                {sets.length > 1 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-7 hover:text-destructive"
                                    onClick={() => removeSet(ex.id, setIdx)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant={set.completed ? "default" : "outline"}
                                  className={`h-9 w-9 shrink-0 ${set.completed ? "bg-primary" : ""}`}
                                  onClick={() => handleCompleteSet(ex.id, setIdx, ex.restSeconds)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Adicionar set */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addSet(ex.id)}
                          className="w-full mt-2 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar série
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de finalização */}
      <AnimatePresence>
        {showFinishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFinishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-1">Finalizar treino?</h2>
                <p className="text-sm text-muted-foreground mb-6">Confira o resumo do seu treino:</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-2xl font-bold">{completedSets}</p>
                    <p className="text-xs text-muted-foreground">sets</p>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-2xl font-bold">{Math.round(totalVolume)}</p>
                    <p className="text-xs text-muted-foreground">kg total</p>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-2xl font-bold">{formatTime(elapsed)}</p>
                    <p className="text-xs text-muted-foreground">tempo</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowFinishModal(false)} className="flex-1">
                    Continuar
                  </Button>
                  <Button onClick={handleFinish} disabled={saving} className="flex-1 bg-primary">
                    {saving ? "Salvando..." : "Finalizar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} preload="auto" />
    </div>
  );
}
