"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, formatVolume, formatDuration, relativeTime } from "@/lib/api";
import { Flame, Dumbbell, TrendingUp, Clock, Plus, Trophy, ArrowRight } from "lucide-react";

type Stats = {
  totalSessions: number;
  totalVolume: number;
  totalWeightLifted: number;
  avgDuration: number;
  streak: number;
  topMuscleGroup: string;
  favoriteExercise: string;
  weeklyVolume: Array<{ week: string; volume: number; sessions: number }>;
  records: Array<{ exercise: string; weight: number; reps: number; volume: number }>;
};

type Workout = {
  id: string;
  name: string;
  description: string | null;
  defaultRest: number;
  color: string | null;
  _count: { sessions: number };
  exercises: Array<{ id: string; exercise: { name: string; muscleGroup: string } }>;
};

type Session = {
  id: string;
  workoutName: string;
  startedAt: string;
  durationSec: number;
  totalVolume: number;
};

export function DashboardView() {
  const setView = useAppStore((s) => s.setView);
  const setActiveWorkoutId = useAppStore((s) => s.setActiveWorkoutId);
  const [stats, setStats] = useState<Stats | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<{ stats: Stats }>("/api/stats"),
      apiGet<{ workouts: Workout[] }>("/api/workouts"),
      apiGet<{ sessions: Session[] }>("/api/sessions?limit=5"),
    ])
      .then(([s, w, sess]) => {
        setStats(s.stats);
        setWorkouts(w.workouts);
        setRecentSessions(sess.sessions);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-12 w-48 bg-muted/30 rounded-xl animate-pulse-slow" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[88px] bg-card rounded-2xl border border-border/60 animate-pulse-slow" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-card rounded-2xl border border-border/60 animate-pulse-slow" />
          ))}
        </div>
      </div>
    );
  }

  const startWorkout = (workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setView("active-workout");
  };

  return (
    <div className="space-y-8 animate-fade-in pb-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 capitalize">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Bora treinar 💪</h1>
        </div>
        <Button
          onClick={() => setView("workouts")}
          className="self-start sm:self-auto rounded-xl h-10 px-4 gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo treino
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sequência",   value: `${stats?.streak ?? 0}d`,                    icon: <Flame className="w-4 h-4" />,      accent: "text-orange-400" },
          { label: "Treinos",     value: `${stats?.totalSessions ?? 0}`,               icon: <Dumbbell className="w-4 h-4" />,   accent: "text-primary" },
          { label: "Volume",      value: `${formatVolume(stats?.totalVolume ?? 0)} kg`, icon: <TrendingUp className="w-4 h-4" />, accent: "text-sky-400" },
          { label: "Tempo médio", value: formatDuration(stats?.avgDuration ?? 0),      icon: <Clock className="w-4 h-4" />,      accent: "text-violet-400" },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex flex-col gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.accent} bg-current/10`}
              style={{ background: "color-mix(in oklch, currentColor 12%, transparent)" }}>
              <span className={s.accent}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{s.label}</p>
              <p className="text-xl font-bold mt-0.5 tabular-nums">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Meus treinos ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Meus treinos</h2>
          <button onClick={() => setView("workouts")} className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {workouts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">Você ainda não criou nenhum treino.</p>
            <Button onClick={() => setView("workouts")} size="sm" className="bg-primary">
              Criar primeiro treino
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workouts.slice(0, 6).map((w) => (
              <button
                key={w.id}
                onClick={() => startWorkout(w.id)}
                className="group text-left"
              >
                <Card className="p-4 h-full flex flex-col gap-3 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm"
                      style={{ background: w.color || "var(--primary)" }}
                    >
                      {w.name.charAt(0)}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {w._count.sessions}× feito
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{w.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {w.exercises.slice(0, 3).map((e) => e.exercise.name).join(" · ") || "Sem exercícios"}
                      {w.exercises.length > 3 && ` +${w.exercises.length - 3}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{w.exercises.length} exercícios</span>
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                      Iniciar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Recentes + Recordes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recentes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base">Recentes</h2>
            <button onClick={() => setView("history")} className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
              Ver histórico <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <Card className="overflow-hidden divide-y divide-border/50">
            {recentSessions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-muted/40 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum treino ainda</p>
              </div>
            ) : (
              recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.workoutName}</p>
                      <p className="text-[11px] text-muted-foreground">{relativeTime(s.startedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold tabular-nums">{formatVolume(s.totalVolume)} kg</p>
                    <p className="text-[11px] text-muted-foreground">{formatDuration(s.durationSec)}</p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </section>

        {/* Recordes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Recordes
            </h2>
            <button onClick={() => setView("stats")} className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
              Ver stats <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <Card className="overflow-hidden divide-y divide-border/50">
            {(!stats?.records || stats.records.length === 0) ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-muted/40 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Faça seu primeiro treino</p>
              </div>
            ) : (
              stats.records.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-bold w-5 tabular-nums ${
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"
                    }`}>
                      #{i + 1}
                    </span>
                    <p className="text-sm font-medium truncate">{r.exercise}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold tabular-nums">{r.weight} kg</p>
                    <p className="text-[11px] text-muted-foreground">{r.reps} reps</p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
