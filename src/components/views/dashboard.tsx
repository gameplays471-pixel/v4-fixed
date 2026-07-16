"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, formatVolume, formatDuration, relativeTime } from "@/lib/api";
import { Flame, Dumbbell, TrendingUp, Clock, Plus, Trophy, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const startWorkout = (workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setView("active-workout");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground capitalize">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Bora treinar? 💪</h1>
        </div>
        <Button
          size="lg"
          onClick={() => setView("workouts")}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo treino
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sequência" value={`${stats?.streak ?? 0} dias`} icon={<Flame className="w-5 h-5" />} color="text-orange-400" />
        <StatCard label="Treinos" value={`${stats?.totalSessions ?? 0}`} icon={<Dumbbell className="w-5 h-5" />} color="text-primary" />
        <StatCard label="Volume total" value={`${formatVolume(stats?.totalVolume ?? 0)} kg`} icon={<TrendingUp className="w-5 h-5" />} color="text-blue-400" />
        <StatCard label="Tempo médio" value={formatDuration(stats?.avgDuration ?? 0)} icon={<Clock className="w-5 h-5" />} color="text-purple-400" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Meus treinos</h2>
          <Button variant="ghost" size="sm" onClick={() => setView("workouts")}>
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {workouts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Você ainda não criou nenhum treino.</p>
            <Button onClick={() => setView("workouts")}>Criar primeiro treino</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workouts.slice(0, 6).map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => startWorkout(w.id)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: w.color || "var(--primary)" }}>
                      {w.name.charAt(0)}
                    </div>
                    <span className="text-xs text-muted-foreground">{w._count.sessions}× realizado</span>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{w.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                    {w.exercises.map((e) => e.exercise.name).join(", ") || "Sem exercícios"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{w.exercises.length} exercícios</span>
                    <Button size="sm" className="h-7 px-3 text-xs">Iniciar</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Treinos recentes</h2>
            <Button variant="ghost" size="sm" onClick={() => setView("history")}>
              Ver histórico
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <Card className="divide-y divide-border">
            {recentSessions.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhum treino realizado ainda
              </div>
            ) : (
              recentSessions.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{s.workoutName}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(s.startedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatVolume(s.totalVolume)} kg</p>
                    <p className="text-xs text-muted-foreground">{formatDuration(s.durationSec)}</p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Top recordes
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setView("stats")}>
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <Card className="divide-y divide-border">
            {(!stats?.records || stats.records.length === 0) ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Faça seu primeiro treino para registrar recordes
              </div>
            ) : (
              stats.records.slice(0, 5).map((r, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <p className="font-medium text-sm truncate">{r.exercise}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{r.weight} kg</p>
                    <p className="text-xs text-muted-foreground">{r.reps} reps</p>
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

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  );
}
