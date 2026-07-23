"use client";

import { useEffect, useState, Suspense } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, formatVolume, formatDuration, relativeTime } from "@/lib/api";
import { Flame, Dumbbell, TrendingUp, Clock, Plus, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function DashboardContent() {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="h-6 w-32 bg-muted rounded animate-pulse-slow" />
            <div className="h-10 w-48 bg-muted rounded mt-3 animate-pulse-slow" />
          </div>
          <div className="h-12 w-36 bg-muted rounded-lg animate-pulse-slow" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-2xl animate-pulse-slow" />
          ))}
        </div>
        <div className="h-64 bg-card rounded-2xl animate-pulse-slow" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-card rounded-2xl animate-pulse-slow" />
          <div className="h-80 bg-card rounded-2xl animate-pulse-slow" />
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground capitalize">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Bora treinar? 💪
          </h1>
        </div>
        <Button
          size="lg"
          onClick={() => setView("workouts")}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo treino
        </Button>
      </div>

      {/* Stats Cards - Mobile friendly */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sequência" value={`${stats?.streak ?? 0} dias`} icon={<Flame className="w-5 h-5" />} color="text-orange-500" />
        <StatCard label="Treinos" value={`${stats?.totalSessions ?? 0}`} icon={<Dumbbell className="w-5 h-5" />} color="text-primary" />
        <StatCard label="Volume" value={`${formatVolume(stats?.totalVolume ?? 0)} kg`} icon={<TrendingUp className="w-5 h-5" />} color="text-blue-500" />
        <StatCard label="Tempo médio" value={formatDuration(stats?.avgDuration ?? 0)} icon={<Clock className="w-5 h-5" />} color="text-purple-500" />
      </div>

      {/* My Workouts Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Meus treinos</h2>
          <Button variant="ghost" size="sm" onClick={() => setView("workouts")} className="text-primary hover:text-primary/80">
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {workouts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Você ainda não criou nenhum treino.</p>
            <Button onClick={() => setView("workouts")} className="bg-primary">Criar primeiro treino</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.slice(0, 6).map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => startWorkout(w.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ background: w.color || "var(--primary)" }}>
                      {w.name.charAt(0)}
                    </div>
                    <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">{w._count.sessions}× realizado</span>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors text-lg">{w.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                    {w.exercises.map((e) => e.exercise.name).join(", ") || "Sem exercícios"}
                  </p>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs text-muted-foreground">{w.exercises.length} exercícios</span>
                    <Button size="sm" className="h-8 px-3 text-xs bg-primary hover:bg-primary/90">Iniciar</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Treinos recentes</h2>
            <Button variant="ghost" size="sm" onClick={() => setView("history")} className="text-primary hover:text-primary/80">
              Ver histórico
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <Card className="divide-y divide-border overflow-hidden">
            {recentSessions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p>Nenhum treino realizado ainda</p>
              </div>
            ) : (
              recentSessions.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{s.workoutName}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(s.startedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatVolume(s.totalVolume)} kg</p>
                    <p className="text-xs text-muted-foreground">{formatDuration(s.durationSec)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </Card>
        </section>

        {/* Top Records */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top recordes
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setView("stats")} className="text-primary hover:text-primary/80">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <Card className="divide-y divide-border overflow-hidden">
            {(!stats?.records || stats.records.length === 0) ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p>Faça seu primeiro treino para registrar recordes</p>
              </div>
            ) : (
              stats.records.slice(0, 5).map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-sm font-bold w-6 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </span>
                    <p className="font-semibold text-sm truncate">{r.exercise}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{r.weight} kg</p>
                    <p className="text-xs text-muted-foreground">{r.reps} reps</p>
                  </div>
                </motion.div>
              ))
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

// Loading fallback
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-6 w-32 bg-muted rounded animate-pulse-slow" />
          <div className="h-10 w-48 bg-muted rounded mt-3 animate-pulse-slow" />
        </div>
        <div className="h-12 w-36 bg-muted rounded-lg animate-pulse-slow" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-card rounded-2xl animate-pulse-slow" />
        ))}
      </div>
      <div className="h-64 bg-card rounded-2xl animate-pulse-slow" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-card rounded-2xl animate-pulse-slow" />
        <div className="h-80 bg-card rounded-2xl animate-pulse-slow" />
      </div>
    </div>
  );
}

export function DashboardView() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="p-4 hover:shadow-md hover:shadow-primary/10 transition-all duration-300 group">
      <div className={`mb-2 ${color} group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
      <p className="text-xs text-muted-foreground mb-0.5 uppercase font-semibold tracking-wide">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  );
}

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
