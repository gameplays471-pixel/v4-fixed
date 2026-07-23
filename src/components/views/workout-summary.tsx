"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MuscleMap } from "@/components/muscle-map";
import { Trophy, Clock, Dumbbell, Flame, ChevronRight, HeartPulse, Star } from "lucide-react";

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}min`;
  if (m > 0) return `${m}min ${sec.toString().padStart(2, "0")}s`;
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
        <Button className="mt-4" onClick={() => setView("dashboard")}>Voltar ao início</Button>
      </Card>
    );
  }

  // Computar músculos treinados
  const primaryMusclesArr: string[] = [];
  const primarySet = new Set<string>();
  const secondaryMusclesArr: string[] = [];

  for (const ex of data.exercises) {
    if (ex.category === "Cardio") {
      if (!primarySet.has("Cardio")) { primarySet.add("Cardio"); primaryMusclesArr.push("Cardio"); }
      continue;
    }
    if (ex.muscleGroup && !primarySet.has(ex.muscleGroup)) {
      primarySet.add(ex.muscleGroup);
      primaryMusclesArr.push(ex.muscleGroup);
    }
    if (ex.secondaryMuscles) {
      for (const m of ex.secondaryMuscles.split(",")) {
        const trimmed = m.trim();
        if (trimmed && !primarySet.has(trimmed) && !secondaryMusclesArr.includes(trimmed)) {
          secondaryMusclesArr.push(trimmed);
        }
      }
    }
  }
  const filteredSecondary = secondaryMusclesArr.filter((m) => !primarySet.has(m));

  const totalSets = data.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const prs = data.exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.isPR).length, 0);

  const handleGoHistory = () => { setWorkoutSummaryData(null); setView("history"); };
  const handleGoDashboard = () => { setWorkoutSummaryData(null); setView("dashboard"); };

  const statCards = [
    { icon: <Clock className="w-5 h-5" />, value: formatTime(data.durationSec), label: "duração", color: "text-sky-400", bg: "bg-sky-500/10" },
    { icon: <Dumbbell className="w-5 h-5" />, value: `${formatVolume(data.totalVolume)} kg`, label: "volume total", color: "text-primary", bg: "bg-primary/10" },
    { icon: <Flame className="w-5 h-5" />, value: totalSets, label: "séries", color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: <Star className="w-5 h-5" />, value: prs > 0 ? prs : data.exercises.length, label: prs > 0 ? "novos PRs 🏆" : "exercícios", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-2xl mx-auto">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/8 to-transparent border border-primary/20 p-8 text-center"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl"
            style={{ background: "oklch(0.80 0.18 162 / 0.22)" }} />
        </div>

        <motion.div
          initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="relative w-24 h-24 mx-auto mb-5 rounded-3xl flex items-center justify-center"
          style={{ background: "oklch(0.80 0.18 162 / 0.18)", boxShadow: "0 0 40px oklch(0.80 0.18 162 / 0.30)" }}
        >
          <Trophy className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-3xl font-black tracking-tight">
          Treino Concluído! 💪
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className="text-muted-foreground mt-2 font-medium">
          {data.workoutName}
        </motion.p>

        {prs > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
            <Star className="w-3.5 h-3.5 fill-current" />
            {prs} novo{prs > 1 ? "s" : ""} recorde{prs > 1 ? "s" : ""} pessoal{prs > 1 ? "is" : ""}!
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.07 }}>
            <Card className="p-4 flex flex-col items-center text-center gap-2 hover:border-primary/30 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xl font-black tabular-nums">{s.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Manequim muscular */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
        <Card className="p-5">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-primary" />
            Músculos trabalhados
          </h2>
          <MuscleMap primaryMuscles={primaryMusclesArr} secondaryMuscles={filteredSecondary} />

          {(primaryMusclesArr.length > 0 || filteredSecondary.length > 0) && (
            <div className="mt-5 pt-4 border-t border-border/50 space-y-3">
              {primaryMusclesArr.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Primários</p>
                  <div className="flex flex-wrap gap-1.5">
                    {primaryMusclesArr.map((m) => (
                      <span key={m} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-primary/10 text-primary border-primary/25">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {filteredSecondary.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Secundários</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredSecondary.map((m) => (
                      <span key={m} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-muted/50 text-muted-foreground border-border/60">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Séries por exercício */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="space-y-3">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          Séries realizadas
        </h2>

        {data.exercises.map((ex, exIdx) => {
          const isCardio = ex.category === "Cardio";
          return (
            <motion.div key={exIdx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.44 + exIdx * 0.05 }}>
              <Card className="overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 border-b border-border/50 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{ex.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {ex.muscleGroup}
                      {ex.secondaryMuscles && <span className="opacity-60"> · {ex.secondaryMuscles}</span>}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[11px] rounded-full">
                    {ex.sets.length} {isCardio ? "sessão" : ex.sets.length === 1 ? "série" : "séries"}
                  </Badge>
                </div>

                <div className="px-4 py-3">
                  {isCardio ? (
                    <div className="space-y-2">
                      {ex.sets.map((set, i) => (
                        <div key={i} className="flex flex-wrap gap-4 text-sm">
                          {set.durationSec != null && <span className="text-muted-foreground"><span className="font-semibold text-foreground">{Math.round(set.durationSec / 60)} min</span></span>}
                          {set.distanceKm != null && set.distanceKm > 0 && <span className="text-muted-foreground"><span className="font-semibold text-foreground">{set.distanceKm} km</span></span>}
                          {set.avgBpm != null && set.avgBpm > 0 && <span className="text-muted-foreground"><span className="font-semibold text-foreground">{set.avgBpm} bpm</span></span>}
                          {set.intensity && <span className="text-muted-foreground">{set.intensity}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        <div className="text-center">Set</div>
                        <div className="text-center">Peso</div>
                        <div className="text-center">Reps</div>
                        <div className="text-center">Volume</div>
                        <div />
                      </div>
                      <div className="space-y-1">
                        {ex.sets.map((set, i) => (
                          <div key={i}
                            className={`grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 items-center py-1.5 px-1 rounded-lg text-sm transition-colors ${set.isPR ? "bg-primary/8 border border-primary/15" : "hover:bg-muted/30"}`}>
                            <div className="text-center text-muted-foreground font-medium">{i + 1}</div>
                            <div className="text-center font-semibold">{set.weight} kg</div>
                            <div className="text-center text-muted-foreground">{set.reps}</div>
                            <div className="text-center text-muted-foreground tabular-nums">{Math.round(set.weight * set.reps)} kg</div>
                            <div className="w-10 flex justify-end">
                              {set.isPR && (
                                <span className="text-[10px] font-black text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">PR</span>
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={handleGoDashboard}>
          Início
        </Button>
        <Button className="flex-1 h-12 rounded-xl font-semibold bg-primary shadow-lg shadow-primary/25" onClick={handleGoHistory}>
          Ver histórico
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>
    </div>
  );
}
