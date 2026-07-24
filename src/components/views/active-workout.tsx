"use client";
"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useAppStore, type WorkoutSummaryData } from "@/lib/store";
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
  History,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadWorkoutDraft,
  saveWorkoutDraft,
  clearWorkoutDraft,
  type SetDraft,
  type CardioDraft,
} from "@/lib/workout-draft";
import { ExerciseThumb, ExerciseImageDialog } from "@/components/exercise-media";

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
    targetDurationSec: number | null;
    targetDistanceKm: number | null;
    targetIntensity: string | null;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      secondaryMuscles?: string | null;
      equipment: string | null;
      category: string;
      images: string[];
    };
  }>;
};

type SetState = SetDraft;
type CardioState = CardioDraft;

const INTENSITY_OPTIONS = ["Leve", "Moderada", "Intensa"];

export function ActiveWorkoutView() {
  const setView = useAppStore((s) => s.setView);
  const activeWorkoutId = useAppStore((s) => s.activeWorkoutId);
  const setActiveWorkoutId = useAppStore((s) => s.setActiveWorkoutId);
  const setWorkoutSummaryData = useAppStore((s) => s.setWorkoutSummaryData);

  const [lightboxExercise, setLightboxExercise] = useState<{ name: string; images: string[] } | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [startedAt, setStartedAt] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sets state: Map<exerciseId, SetState[]>
  const [setsMap, setSetsMap] = useState<Record<string, SetState[]>>({});
  // Cardio state: Map<exerciseId, CardioState> (exercícios de cardio não usam setsMap)
  const [cardioMap, setCardioMap] = useState<Record<string, CardioState>>({});

  // Só começa a salvar o rascunho depois que o estado inicial (novo ou
  // restaurado) já foi montado, pra não sobrescrever o rascunho salvo com
  // um estado vazio momentâneo durante o carregamento.
  const hydratedRef = useRef(false);

  // Últimos sets registrados para cada exerciseId (histórico do usuário)
  // Usado para mostrar como placeholder "última vez" nos inputs.
  const [lastSetsMap, setLastSetsMap] = useState<Record<string, Array<{ weight: number; reps: number }>>>({});

  // Timer state
  const [restTimer, setRestTimer] = useState<{ active: boolean; remaining: number; total: number; paused: boolean }>({
    active: false,
    remaining: 0,
    total: 0,
    paused: false,
  });
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar treino + últimos sets do histórico
  // Ref para evitar redirect ao workouts quando o treino for finalizado
  // (nesse caso setView("workout-summary") já foi chamado)
  const finishingRef = useRef(false);

  useEffect(() => {
    if (!activeWorkoutId) {
      // Só redireciona se não estamos indo para o resumo
      if (!finishingRef.current) {
        setView("workouts");
      }
      return;
    }
    apiGet<{ workout: Workout }>(`/api/workouts/${activeWorkoutId}`)
      .then(async (data) => {
        setWorkout(data.workout);

        const draft = loadWorkoutDraft(activeWorkoutId);

        // Inicializar sets/cardio (usa o rascunho salvo quando existir)
        const initial: Record<string, SetState[]> = {};
        const initialCardio: Record<string, CardioState> = {};
        for (const ex of data.workout.exercises) {
          const isCardio = ex.exercise.category === "Cardio";
          if (isCardio) {
            initialCardio[ex.id] = draft?.cardioMap[ex.id] || {
              durationMin: ex.targetDurationSec ? String(Math.round(ex.targetDurationSec / 60)) : "30",
              distanceKm: ex.targetDistanceKm ? String(ex.targetDistanceKm) : "",
              avgBpm: "",
              intensity: ex.targetIntensity || "Moderada",
              completed: false,
            };
          } else {
            initial[ex.id] =
              draft?.setsMap[ex.id] ||
              Array.from({ length: ex.targetSets }, () => ({
                weight: "",
                reps: ex.targetReps.toString(),
                completed: false,
              }));
          }
        }
        setSetsMap(initial);
        setCardioMap(initialCardio);

        if (draft) {
          setStartedAt(new Date(draft.startedAt));
          setCollapsedExercises(new Set(draft.collapsedExercises));
          toast.info("Treino em andamento restaurado 💾");
        } else {
          setStartedAt(new Date());
        }
        hydratedRef.current = true;

        // Buscar últimos sets de cada exercício do histórico do usuário
        // (trazer mesmo se o exercício está em outro treino)
        const exerciseIds = data.workout.exercises.map((e) => e.exerciseId);
        if (exerciseIds.length > 0) {
          try {
            const lastData = await apiGet<{ lastSets: Record<string, Array<{ weight: number; reps: number }>> }>(
              `/api/sessions/last-sets?exerciseIds=${encodeURIComponent(exerciseIds.join(","))}`
            );
            setLastSetsMap(lastData.lastSets || {});
          } catch (e) {
            console.error("Erro ao buscar últimos sets:", e);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [activeWorkoutId, setView]);

  // Autosave: salva o progresso no localStorage sempre que algo muda,
  // pra sobreviver a um reload/aba fechada sem querer.
  useEffect(() => {
    if (!hydratedRef.current || !activeWorkoutId) return;
    saveWorkoutDraft({
      workoutId: activeWorkoutId,
      startedAt: startedAt.toISOString(),
      setsMap,
      cardioMap,
      collapsedExercises: Array.from(collapsedExercises),
      savedAt: new Date().toISOString(),
    });
  }, [activeWorkoutId, setsMap, cardioMap, collapsedExercises, startedAt]);

  // Cronômetro de treino
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // Timer de descanso — baseado em Date.now() para não ter drift
  // restEndRef guarda o timestamp (ms) em que o descanso termina
  const restEndRef = useRef<number | null>(null);
  const restPausedAtRef = useRef<number | null>(null); // ms restantes quando pausou

  useEffect(() => {
    if (!restTimer.active) {
      restEndRef.current = null;
      restPausedAtRef.current = null;
      return;
    }
    if (restTimer.paused) return;

    // Na primeira vez que o timer fica ativo e não pausado, define o endTime
    if (restEndRef.current === null) {
      restEndRef.current = Date.now() + restTimer.remaining * 1000;
    }

    const tick = () => {
      if (!restEndRef.current) return;
      const remaining = Math.max(0, Math.round((restEndRef.current - Date.now()) / 1000));
      setRestTimer((prev) => ({ ...prev, remaining }));
      if (remaining <= 0) {
        restEndRef.current = null;
        if (soundOn) playBeep();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        toast.success("Descanso concluído! 🔥");
        setRestTimer({ active: false, remaining: 0, total: 0, paused: false });
      }
    };

    tick(); // roda imediatamente
    const interval = setInterval(tick, 500); // 500ms para maior precisão
    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.paused, soundOn]); // sem restTimer.remaining nas deps!

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

  // Formata resumo compacto do último treino: "20kg × 10, 20kg × 8"
  const formatLastSets = (exerciseId: string): string | null => {
    const last = lastSetsMap[exerciseId];
    if (!last || last.length === 0) return null;
    return last.map((s) => `${s.weight}kg × ${s.reps}`).join(" · ");
  };

  const removeSet = (exerciseId: string, setIdx: number) => {
    const sets = setsMap[exerciseId];
    if (!sets || sets.length === 1) return;
    setSetsMap({
      ...setsMap,
      [exerciseId]: sets.filter((_, i) => i !== setIdx),
    });
  };

  const updateCardio = (exerciseId: string, updates: Partial<CardioState>) => {
    const current = cardioMap[exerciseId];
    if (!current) return;
    setCardioMap({ ...cardioMap, [exerciseId]: { ...current, ...updates } });
  };

  const toggleCardioComplete = (exerciseId: string) => {
    const current = cardioMap[exerciseId];
    if (!current) return;
    setCardioMap({ ...cardioMap, [exerciseId]: { ...current, completed: !current.completed } });
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

  const totalSets =
    (workout?.exercises.reduce((acc, ex) => acc + (setsMap[ex.id]?.length || 0), 0) || 0) +
    (workout?.exercises.filter((ex) => ex.exercise.category === "Cardio").length || 0);
  const completedSets =
    (workout?.exercises.reduce((acc, ex) => {
      return acc + (setsMap[ex.id]?.filter((s) => s.completed).length || 0);
    }, 0) || 0) +
    (workout?.exercises.filter((ex) => cardioMap[ex.id]?.completed).length || 0);

  const totalVolume = workout?.exercises.reduce((acc, ex) => {
    return acc + (setsMap[ex.id]?.reduce((s, set) => s + (set.completed ? (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0) : 0), 0) || 0);
  }, 0) || 0;

  const totalCardioMin =
    workout?.exercises.reduce((acc, ex) => {
      const c = cardioMap[ex.id];
      return acc + (c?.completed ? parseInt(c.durationMin) || 0 : 0);
    }, 0) || 0;

  const handleFinish = async () => {
    if (!workout) return;
    setSaving(true);

    const setsData: Array<{
      exerciseId: string;
      exerciseName: string;
      weight: number;
      reps: number;
      restSeconds: number;
      durationSec?: number;
      distanceKm?: number;
      avgBpm?: number;
      intensity?: string;
    }> = [];
    for (const ex of workout.exercises) {
      if (ex.exercise.category === "Cardio") {
        const c = cardioMap[ex.id];
        if (c?.completed) {
          setsData.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            weight: 0,
            reps: 0,
            restSeconds: 0,
            durationSec: (parseInt(c.durationMin) || 0) * 60,
            distanceKm: c.distanceKm ? parseFloat(c.distanceKm) : undefined,
            avgBpm: c.avgBpm ? parseInt(c.avgBpm) : undefined,
            intensity: c.intensity,
          });
        }
        continue;
      }
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
      const { session } = await apiPost<{ session: { sets: Array<{ exerciseId: string; weight: number; reps: number; isPR: boolean; durationSec: number | null; distanceKm: number | null; avgBpm: number | null; intensity: string | null }> } }>("/api/sessions", {
        workoutId: workout.id,
        workoutName: workout.name,
        startedAt: startedAt.toISOString(),
        endedAt: new Date().toISOString(),
        durationSec: elapsed,
        sets: setsData,
      });

      // Monta o resumo por exercício, aproveitando as flags de PR vindas da API
      const prByIndex: Record<number, boolean> = {};
      session.sets.forEach((s, i) => { prByIndex[i] = s.isPR; });

      // Agrupa os sets de volta por exercício (mesma ordem de setsData)
      const exerciseMap = new Map<string, WorkoutSummaryData["exercises"][number]>();
      let setIdx = 0;
      for (const ex of workout.exercises) {
        const isCardio = ex.exercise.category === "Cardio";
        const key = ex.exerciseId;

        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            name: ex.exercise.name,
            muscleGroup: ex.exercise.muscleGroup,
            secondaryMuscles: ex.exercise.secondaryMuscles ?? null,
            category: ex.exercise.category,
            sets: [],
          });
        }
        const entry = exerciseMap.get(key)!;

        if (isCardio) {
          const c = cardioMap[ex.id];
          if (c?.completed) {
            entry.sets.push({
              weight: 0,
              reps: 0,
              isPR: prByIndex[setIdx] ?? false,
              durationSec: (parseInt(c.durationMin) || 0) * 60,
              distanceKm: c.distanceKm ? parseFloat(c.distanceKm) : undefined,
              avgBpm: c.avgBpm ? parseInt(c.avgBpm) : undefined,
              intensity: c.intensity,
            });
            setIdx++;
          }
        } else {
          for (const set of setsMap[ex.id] || []) {
            if (set.completed && set.weight && set.reps) {
              entry.sets.push({
                weight: parseFloat(set.weight) || 0,
                reps: parseInt(set.reps) || 0,
                isPR: prByIndex[setIdx] ?? false,
              });
              setIdx++;
            }
          }
        }
      }

      const summaryData: WorkoutSummaryData = {
        workoutName: workout.name,
        durationSec: elapsed,
        totalVolume,
        exercises: [...exerciseMap.values()].filter((e) => e.sets.length > 0),
      };

      clearWorkoutDraft(workout.id);
      setWorkoutSummaryData(summaryData);
      finishingRef.current = true;
      setView("workout-summary");
      setActiveWorkoutId(null);
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
      <div className="sticky top-14 md:top-0 z-30 -mx-4 px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg truncate">{workout.name}</h1>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs font-semibold text-primary tabular-nums">
                <Clock className="w-3 h-3" />{formatTime(elapsed)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="w-3 h-3 text-orange-400" />{completedSets}/{totalSets} sets
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Dumbbell className="w-3 h-3" />{Math.round(totalVolume)} kg
              </span>
              {totalCardioMin > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <HeartPulse className="w-3 h-3 text-rose-400" />{totalCardioMin}min
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-9 rounded-xl text-muted-foreground">Cancelar</Button>
            <Button size="sm" onClick={() => setShowFinishModal(true)}
              className="h-9 rounded-xl bg-primary font-semibold shadow-md shadow-primary/20 px-4">
              Finalizar
            </Button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-2.5 h-1.5 bg-muted/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
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
            <Card className="p-4 border-primary/30" style={{ background: "linear-gradient(135deg, oklch(0.17 0.012 255), oklch(0.20 0.020 162 / 0.5))" }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">⏱ Descanso</p>
                  <p className="text-4xl font-black tabular-nums text-primary">{formatTime(restTimer.remaining)}</p>
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
                    onClick={() => {
                      // Ajusta o endTime real em +15s
                      if (restEndRef.current) restEndRef.current += 15000;
                      setRestTimer((prev) => ({ ...prev, remaining: prev.remaining + 15 }));
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => {
                      // Ajusta o endTime real em -15s
                      if (restEndRef.current) restEndRef.current = Math.max(Date.now(), restEndRef.current - 15000);
                      setRestTimer((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - 15) }));
                    }}
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
          const isCardio = ex.exercise.category === "Cardio";
          const sets = setsMap[ex.id] || [];
          const cardio = cardioMap[ex.id];
          const isCollapsed = collapsedExercises.has(ex.id);
          const completedCount = sets.filter((s) => s.completed).length;

          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: exIdx * 0.03 }}
            >
              <Card className="overflow-hidden hover:border-primary/20 transition-colors">
                {/* Header do exercício */}
                <div
                  className="p-4 cursor-pointer hover:bg-accent/20 transition-colors select-none"
                  onClick={() => toggleCollapse(ex.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <ExerciseThumb
                        images={ex.exercise.images}
                        name={ex.exercise.name}
                        className="w-12 h-12 rounded-lg"
                        onClick={() => setLightboxExercise({ name: ex.exercise.name, images: ex.exercise.images })}
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                        {isCardio ? <HeartPulse className="w-2.5 h-2.5" /> : exIdx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{ex.exercise.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {isCardio
                          ? `${ex.exercise.muscleGroup} · cardio`
                          : `${ex.exercise.muscleGroup} · ${sets.length} séries · descanso ${ex.restSeconds}s`}
                      </p>
                      {!isCardio && formatLastSets(ex.exerciseId) && (
                        <p className="text-[11px] text-primary/80 flex items-center gap-1 mt-0.5 font-medium">
                          <History className="w-3 h-3 shrink-0" />
                          <span className="truncate">Última vez: {formatLastSets(ex.exerciseId)}</span>
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
                      completedCount > 0 && completedCount === sets.length && (
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                          <Check className="w-3 h-3 mr-1" />
                          {completedCount}/{sets.length}
                        </Badge>
                      )
                    )}
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Conteúdo: cardio ou séries de força */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      {isCardio && cardio ? (
                        <div className="px-4 pb-4 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground">Duração (min)</label>
                              <Input
                                type="number"
                                value={cardio.durationMin}
                                onChange={(e) => updateCardio(ex.id, { durationMin: e.target.value })}
                                className="h-10 text-center font-medium"
                                disabled={cardio.completed}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Distância (km) · opcional</label>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="0"
                                value={cardio.distanceKm}
                                onChange={(e) => updateCardio(ex.id, { distanceKm: e.target.value })}
                                className="h-10 text-center font-medium"
                                disabled={cardio.completed}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">BPM médio · opcional</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={cardio.avgBpm}
                                onChange={(e) => updateCardio(ex.id, { avgBpm: e.target.value })}
                                className="h-10 text-center font-medium"
                                disabled={cardio.completed}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Intensidade</label>
                              <select
                                value={cardio.intensity}
                                onChange={(e) => updateCardio(ex.id, { intensity: e.target.value })}
                                disabled={cardio.completed}
                                className="h-10 w-full text-sm text-center font-medium rounded-md border border-input bg-background disabled:opacity-60"
                              >
                                {INTENSITY_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <Button
                            variant={cardio.completed ? "default" : "outline"}
                            className={`w-full ${cardio.completed ? "bg-primary" : ""}`}
                            onClick={() => toggleCardioComplete(ex.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            {cardio.completed ? "Concluído" : "Marcar como concluído"}
                          </Button>
                        </div>
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
                            const lastForExercise = lastSetsMap[ex.exerciseId];
                            const lastSet = lastForExercise?.[setIdx];
                            const weightPlaceholder = lastSet ? String(lastSet.weight) : "0";
                            const repsPlaceholder = lastSet ? String(lastSet.reps) : "0";
                            return (
                            <div
                              key={setIdx}
                              className={`grid grid-cols-[1.75rem_1fr_1fr_auto] gap-2 items-center px-1.5 py-1.5 rounded-xl transition-all ${
                                set.completed
                                  ? "bg-primary/10 border border-primary/15"
                                  : "hover:bg-muted/30"
                              }`}
                            >
                              <div className="text-center text-sm font-bold text-muted-foreground">
                                {setIdx + 1}
                              </div>
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="0.5"
                                placeholder={weightPlaceholder}
                                value={set.weight}
                                onChange={(e) => updateSet(ex.id, setIdx, "weight", e.target.value)}
                                className={`h-11 text-center font-bold text-base placeholder:text-muted-foreground/40 ${set.completed ? "bg-background" : ""}`}
                                disabled={set.completed}
                              />
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder={repsPlaceholder}
                                value={set.reps}
                                onChange={(e) => updateSet(ex.id, setIdx, "reps", e.target.value)}
                                className={`h-11 text-center font-bold text-base placeholder:text-muted-foreground/40 ${set.completed ? "bg-background" : ""}`}
                                disabled={set.completed}
                              />
                              <div className="flex items-center gap-1 shrink-0">
                                {sets.length > 1 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                                    onClick={() => removeSet(ex.id, setIdx)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant={set.completed ? "default" : "outline"}
                                  className={`h-11 w-11 shrink-0 rounded-xl transition-all ${set.completed ? "bg-primary shadow-md shadow-primary/20" : "hover:border-primary/40"}`}
                                  onClick={() => handleCompleteSet(ex.id, setIdx, ex.restSeconds)}
                                >
                                  <Check className={`w-4 h-4 ${set.completed ? "stroke-[3]" : ""}`} />
                                </Button>
                              </div>
                            </div>
                            );
                          })}
                        </div>

                        {/* Adicionar set */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addSet(ex.id)}
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
        })}
      </div>

      {/* Modal de finalização — portal estável fora do scroll container */}
      {showFinishModal && (
        <FinishModal
          completedSets={completedSets}
          totalVolume={totalVolume}
          elapsed={elapsed}
          saving={saving}
          onClose={() => setShowFinishModal(false)}
          onFinish={handleFinish}
          formatTime={formatTime}
        />
      )}

      <audio ref={audioRef} preload="auto" />

      <ExerciseImageDialog
        open={!!lightboxExercise}
        onOpenChange={(o) => !o && setLightboxExercise(null)}
        images={lightboxExercise?.images}
        name={lightboxExercise?.name || ""}
      />
    </div>
  );
}

// ─── FINISH MODAL ─────────────────────────────────────────────────────────────
// Componente separado com portal próprio para garantir que os handlers
// funcionem corretamente sem depender do AnimatePresence do pai.
interface FinishModalProps {
  completedSets: number;
  totalVolume: number;
  elapsed: number;
  saving: boolean;
  onClose: () => void;
  onFinish: () => void;
  formatTime: (s: number) => string;
}

function FinishModal({ completedSets, totalVolume, elapsed, saving, onClose, onFinish, formatTime }: FinishModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // bloqueia scroll do body enquanto modal está aberto
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onMouseDown={onClose}
    >
      <div
        className="bg-card border border-border/60 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Ícone */}
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center"
            style={{ boxShadow: "0 0 40px oklch(0.80 0.18 162 / 0.30)" }}
          >
            <Trophy className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-center mb-1">Finalizar treino?</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Confira o resumo antes de salvar:</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-muted/50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black tabular-nums">{completedSets}</p>
            <p className="text-xs text-muted-foreground mt-0.5">sets</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black tabular-nums">{Math.round(totalVolume)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">kg total</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black tabular-nums">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">tempo</p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 h-12 rounded-xl font-semibold border border-border bg-transparent hover:bg-accent transition-colors text-sm disabled:opacity-50"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={saving}
            className="flex-1 h-12 rounded-xl font-bold text-sm text-primary-foreground disabled:opacity-60 transition-all active:scale-[0.98]"
            style={{
              background: "var(--primary)",
              boxShadow: "0 4px 20px oklch(0.80 0.18 162 / 0.35)",
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              "Finalizar 🏆"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
