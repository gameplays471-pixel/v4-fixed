"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  Dumbbell,
  Flame,
  ChevronRight,
  HeartPulse,
  Zap,
} from "lucide-react";

// Cores por grupo muscular para os chips visuais
const MUSCLE_COLORS: Record<string, string> = {
  Peitoral: "bg-red-500/15 text-red-500 border-red-500/30",
  Costas: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  Ombros: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  Bíceps: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  Tríceps: "bg-pink-500/15 text-pink-500 border-pink-500/30",
  Pernas: "bg-green-500/15 text-green-500 border-green-500/30",
  Quadríceps: "bg-green-500/15 text-green-500 border-green-500/30",
  Glúteos: "bg-teal-500/15 text-teal-500 border-teal-500/30",
  Abdômen: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  Panturrilha: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
  Cardio: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  default: "bg-primary/15 text-primary border-primary/30",
};

function muscleColor(muscle: string): string {
  for (const key of Object.keys(MUSCLE_COLORS)) {
    if (muscle.toLowerCase().includes(key.toLowerCase())) return MUSCLE_COLORS[key];
  }
  return MUSCLE_COLORS.default;
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${h}h ${m.toString().padStart(2, "0")}min`;
  if (m > 0)
    return `${m}min ${sec.toString().padStart(2, "0")}s`;
  return `${sec}s`;
}

function formatVolume(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}

export function WorkoutSummaryView() {
  const setView = useAppStore((s) => s.setView);
  const data = useAppStore((s) => s.workoutSummaryData);
  const setWorkoutSummaryData = useAppStore((s) => s.setWorkoutSummaryData);

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Sem dados de treino.</p>
        <Button className="mt-4" onClick={() => setView("dashboard")}>
          Voltar ao início
        </Button>
      </Card>
    );
  }

  // --- Computar músculos treinados ---
  const primaryMuscles = new Set<string>();
  const secondaryMuscles = new Set<string>();

  for (const ex of data.exercises) {
    if (ex.category === "Cardio") {
      primaryMuscles.add("Cardio");
      continue;
    }
    if (ex.muscleGroup) primaryMuscles.add(ex.muscleGroup);
    if (ex.secondaryMuscles) {
      for (const m of ex.secondaryMuscles.split(",")) {
        const trimmed = m.trim();
        if (trimmed && !primaryMuscles.has(trimmed)) {
          secondaryMuscles.add(trimmed);
        }
      }
    }
  }

  // Remove do secundário qualquer músculo que já é primário
  for (const m of primaryMuscles) secondaryMuscles.delete(m);

  const totalSets = data.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const prs = data.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isPR).length,
    0
  );

  const handleGoHistory = () => {
    setWorkoutSummaryData(null);
    setView("history");
  };

  const handleGoDashboard = () => {
    setWorkoutSummaryData(null);
    setView("dashboard");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Hero comemorativo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center mb-4"
        >
          <Trophy className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">Treino concluído!</h1>
        <p className="text-sm text-muted-foreground mt-1">{data.workoutName}</p>
      </motion.div>

      {/* Stats rápidos */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Card className="p-4 text-center">
          <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{formatTime(data.durationSec)}</p>
          <p className="text-xs text-muted-foreground">duração</p>
        </Card>
        <Card className="p-4 text-center">
          <Dumbbell className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{formatVolume(data.totalVolume)} kg</p>
          <p className="text-xs text-muted-foreground">volume total</p>
        </Card>
        <Card className="p-4 text-center">
          <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{totalSets}</p>
          <p className="text-xs text-muted-foreground">séries</p>
        </Card>
        <Card className="p-4 text-center">
          <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{prs > 0 ? prs : data.exercises.length}</p>
          <p className="text-xs text-muted-foreground">{prs > 0 ? "recordes (PR)" : "exercícios"}</p>
        </Card>
      </motion.div>

      {/* Músculos treinados */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <Card className="p-5">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-primary" />
            Músculos treinados
          </h2>

          {primaryMuscles.size > 0 && (
            <div className="mb-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Primários</p>
              <div className="flex flex-wrap gap-2">
                {[...primaryMuscles].map((m) => (
                  <span
                    key={m}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${muscleColor(m)}`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {secondaryMuscles.size > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Secundários</p>
              <div className="flex flex-wrap gap-2">
                {[...secondaryMuscles].map((m) => (
                  <span
                    key={m}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border opacity-70 ${muscleColor(m)}`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Exercícios e séries */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="space-y-3"
      >
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          Séries realizadas
        </h2>

        {data.exercises.map((ex, exIdx) => {
          const isCardio = ex.category === "Cardio";
          return (
            <motion.div
              key={exIdx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 + exIdx * 0.05 }}
            >
              <Card className="overflow-hidden">
                {/* Header do exercício */}
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{ex.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {ex.muscleGroup}
                      {ex.secondaryMuscles && (
                        <span className="opacity-60"> · {ex.secondaryMuscles}</span>
                      )}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[11px]">
                    {ex.sets.length} {isCardio ? "sessão" : ex.sets.length === 1 ? "série" : "séries"}
                  </Badge>
                </div>

                {/* Séries */}
                <div className="px-4 py-3">
                  {isCardio ? (
                    // Cardio: mostra duração, distância, bpm, intensidade
                    <div className="space-y-2">
                      {ex.sets.map((set, i) => (
                        <div key={i} className="flex flex-wrap gap-3 text-sm">
                          {set.durationSec != null && (
                            <span className="text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {Math.round(set.durationSec / 60)} min
                              </span>
                            </span>
                          )}
                          {set.distanceKm != null && set.distanceKm > 0 && (
                            <span className="text-muted-foreground">
                              <span className="font-medium text-foreground">{set.distanceKm} km</span>
                            </span>
                          )}
                          {set.avgBpm != null && set.avgBpm > 0 && (
                            <span className="text-muted-foreground">
                              <span className="font-medium text-foreground">{set.avgBpm} bpm</span>
                            </span>
                          )}
                          {set.intensity && (
                            <span className="text-muted-foreground">{set.intensity}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Força: tabela compacta SET / KG / REPS / VOLUME
                    <div>
                      <div className="grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        <div className="text-center">SET</div>
                        <div className="text-center">Peso</div>
                        <div className="text-center">Reps</div>
                        <div className="text-center">Volume</div>
                        <div />
                      </div>
                      <div className="space-y-1">
                        {ex.sets.map((set, i) => (
                          <div
                            key={i}
                            className={`grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 items-center py-1.5 px-1 rounded-lg text-sm ${
                              set.isPR ? "bg-primary/8" : ""
                            }`}
                          >
                            <div className="text-center text-muted-foreground font-medium">
                              {i + 1}
                            </div>
                            <div className="text-center font-medium">{set.weight} kg</div>
                            <div className="text-center text-muted-foreground">{set.reps}</div>
                            <div className="text-center text-muted-foreground">
                              {Math.round(set.weight * set.reps)} kg
                            </div>
                            <div className="w-10 flex justify-end">
                              {set.isPR && (
                                <span
                                  title="Recorde pessoal"
                                  className="text-xs font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded"
                                >
                                  PR
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Ações */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 pt-2"
      >
        <Button variant="outline" className="flex-1" onClick={handleGoDashboard}>
          Início
        </Button>
        <Button className="flex-1 bg-primary" onClick={handleGoHistory}>
          Ver histórico
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>
    </div>
  );
}
