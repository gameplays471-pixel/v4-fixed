"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { apiGet, formatVolume, formatDuration, relativeTime } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Flame, Dumbbell, TrendingUp, Clock, Plus, Trophy, ArrowRight, Play, Zap, Gamepad2, Droplets, Salad } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Stats = {
  totalSessions: number; totalVolume: number; totalWeightLifted: number;
  avgDuration: number; streak: number; topMuscleGroup: string;
  favoriteExercise: string;
  weeklyVolume: Array<{ week: string; volume: number; sessions: number }>;
  records: Array<{ exercise: string; weight: number; reps: number; volume: number }>;
};
type Workout = {
  id: string; name: string; description: string | null; defaultRest: number;
  color: string | null; active: boolean; _count: { sessions: number };
  exercises: Array<{ id: string; exercise: { name: string; muscleGroup: string } }>;
};
type Session = { id: string; workoutName: string; startedAt: string; durationSec: number; totalVolume: number; };

export function DashboardView() {
  const router = useRouter();

  // Cada recurso tem sua própria query (chave própria), então navegar pra
  // outra aba e voltar aqui reaproveita o cache em vez de recarregar tudo
  // do zero — a tela aparece instantânea com o último dado conhecido
  // enquanto atualiza em segundo plano (stale-while-revalidate).
  const statsQuery = useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => apiGet<{ stats: Stats }>("/api/stats").then((d) => d.stats),
  });
  const workoutsQuery = useQuery({
    queryKey: queryKeys.workouts,
    queryFn: () => apiGet<{ workouts: Workout[] }>("/api/workouts").then((d) => d.workouts),
  });
  const sessionsQuery = useQuery({
    queryKey: queryKeys.sessions(5),
    queryFn: () => apiGet<{ sessions: Session[] }>("/api/sessions?limit=5").then((d) => d.sessions),
  });
  const plansQuery = useQuery({
    queryKey: queryKeys.plans,
    queryFn: () =>
      apiGet<{
        plans: Array<{
          id: string;
          name: string;
          daysPerWeek: number;
          progress: { completedThisWeek: number; totalDays: number; percent: number };
          items: Array<{
            id: string;
            label: string;
            suggestedWeekday: number | null;
            workoutId: string;
            workoutName: string;
            doneThisWeek: boolean;
          }>;
        }>;
      }>("/api/plans").then((d) => d.plans),
  });
  const gameSummaryQuery = useQuery({
    queryKey: queryKeys.gameSummary,
    queryFn: () => apiGet<{ enabled: boolean; goals: { waterGoalMl: number; weeklyWorkoutGoal: number }; today: { dietOnTrack: boolean; waterMl: number; workoutDone: boolean }; week: { workouts: number; dietDays: number; waterDays: number; score: number } }>("/api/gamification/summary"),
  });

  const stats = statsQuery.data ?? null;
  // Só treinos ativos aparecem no "início rápido" do dashboard — treinos
  // finalizados ficam disponíveis na aba "Finalizados" em Treinos.
  const workouts = (workoutsQuery.data ?? []).filter((w) => w.active);
  const recentSessions = sessionsQuery.data ?? [];
  const myPlans = plansQuery.data ?? [];
  const loading = statsQuery.isLoading || workoutsQuery.isLoading || sessionsQuery.isLoading;
  const hasError = statsQuery.isError || workoutsQuery.isError || sessionsQuery.isError;

  useEffect(() => {
    // Mesmo comportamento de antes: se qualquer um dos 3 recursos falhar,
    // avisa em vez de deixar a tela renderizar como se a conta estivesse
    // vazia (records/workouts/sessions em [] silenciosamente).
    if (hasError) {
      console.error("Erro ao carregar dashboard:", statsQuery.error || workoutsQuery.error || sessionsQuery.error);
      toast.error("Não foi possível carregar seus dados. Puxe para atualizar ou tente novamente.");
    }
  }, [hasError, statsQuery.error, workoutsQuery.error, sessionsQuery.error]);

  const startWorkout = (id: string) => { router.push(`/treinos/${id}/ativo`); };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <LoadingSkeleton className="h-32 rounded-3xl border border-border/60 animate-shimmer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0,1,2,3].map((i) => <LoadingSkeleton key={i} className="h-24 rounded-2xl border border-border/60 animate-shimmer" style={{ animationDelay: `${i*0.1}s` }} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0,1,2].map((i) => <LoadingSkeleton key={i} className="h-36 rounded-2xl border border-border/60 animate-shimmer" style={{ animationDelay: `${i*0.12}s` }} />)}
      </div>
    </div>
  );

  const statCards = [
    { label: "Sequência",   value: `${stats?.streak ?? 0}d`,                     icon: <Flame className="w-5 h-5" />,      color: "text-orange-400", bg: "bg-orange-500/10", glow: "shadow-orange-500/20" },
    { label: "Treinos",     value: `${stats?.totalSessions ?? 0}`,                icon: <Dumbbell className="w-5 h-5" />,   color: "text-primary",    bg: "bg-primary/10",    glow: "shadow-primary/20" },
    { label: "Volume",      value: `${formatVolume(stats?.totalVolume ?? 0)} kg`, icon: <TrendingUp className="w-5 h-5" />, color: "text-sky-400",    bg: "bg-sky-500/10",    glow: "shadow-sky-500/20" },
    { label: "Tempo médio", value: formatDuration(stats?.avgDuration ?? 0),       icon: <Clock className="w-5 h-5" />,      color: "text-violet-400", bg: "bg-violet-500/10", glow: "shadow-violet-500/20" },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-4">

      {/* ── Hero header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 border border-border/40"
        style={{ background: "linear-gradient(135deg, var(--hero-gradient-from) 0%, var(--hero-gradient-to) 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-40 opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%, oklch(0.80 0.18 162 / 0.35), transparent 65%)" }} aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1 capitalize">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greet()} 💪
            </h1>
            {stats?.streak && stats.streak > 0 ? (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{stats.streak} dia{stats.streak > 1 ? "s" : ""} de sequência — continue assim!</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Pronto para treinar hoje?</p>
            )}
          </div>
          <Button onClick={() => router.push("/treinos")}
            className="self-start sm:self-auto rounded-xl h-11 px-5 gap-2 bg-primary font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity shrink-0">
            <Plus className="w-4 h-4" /> Novo treino
          </Button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className={`p-4 flex flex-col gap-3 hover:border-primary/20 transition-all duration-300 hover:shadow-lg ${s.glow}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.color} shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{s.label}</p>
                <p className="text-2xl font-black mt-0.5 tabular-nums">{s.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Mini-game (só aparece se ativado no perfil) ── */}
      {gameSummaryQuery.data?.enabled && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <Link href="/jogo" className="block group">
            <Card className="p-4 flex items-center gap-4 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1"><Dumbbell className="w-3 h-3" /> Treinos</p>
                  <p className="text-sm font-black tabular-nums">{gameSummaryQuery.data.week.workouts}/{gameSummaryQuery.data.goals.weeklyWorkoutGoal}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1"><Salad className="w-3 h-3" /> Dieta</p>
                  <p className="text-sm font-black tabular-nums">{gameSummaryQuery.data.week.dietDays}/7</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1"><Droplets className="w-3 h-3" /> Água</p>
                  <p className="text-sm font-black tabular-nums">{gameSummaryQuery.data.week.waterDays}/7</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Card>
          </Link>
        </motion.div>
      )}

      {/* ── Meus treinos ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg">Meus treinos</h2>
          <button onClick={() => router.push("/treinos")} className="text-xs text-primary flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {workouts.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Dumbbell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-4">
              {(workoutsQuery.data ?? []).length > 0
                ? "Todos os seus treinos estão finalizados. Reative um ou crie um novo."
                : "Você ainda não criou nenhum treino."}
            </p>
            <Button onClick={() => router.push("/treinos")} size="sm" className="bg-primary shadow-lg shadow-primary/20">
              {(workoutsQuery.data ?? []).length > 0 ? "Ir para Treinos" : "Criar primeiro treino"}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workouts.slice(0, 6).map((w, i) => (
              <motion.button key={w.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                onClick={() => startWorkout(w.id)} className="group text-left">
                <Card className="p-4 h-full flex flex-col gap-3 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:scale-110 transition-transform"
                      style={{ background: w.color || "var(--primary)", boxShadow: `0 4px 14px ${w.color || "var(--primary)"}40` }}>
                      {w.name.charAt(0)}
                    </div>
                    <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{w._count.sessions}× feito</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{w.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {w.exercises.slice(0, 3).map((e) => e.exercise.name).join(" · ") || "Sem exercícios"}
                      {w.exercises.length > 3 && ` +${w.exercises.length - 3}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{w.exercises.length} exercícios</span>
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 fill-current" /> Iniciar
                    </span>
                  </div>
                </Card>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* ── Recentes + Recordes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recentes */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">

      {myPlans.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-base">Seu plano</h2>
          {myPlans.slice(0, 2).map((plan) => (
            <Card key={plan.id} className="p-4 space-y-3 border-primary/15">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{plan.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {plan.daysPerWeek}× / semana · {plan.progress.completedThisWeek}/{plan.progress.totalDays} dias esta semana
                  </p>
                </div>
                <p className="text-lg font-black text-primary tabular-nums shrink-0">{plan.progress.percent}%</p>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${plan.progress.percent}%` }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => startWorkout(item.workoutId)}
                    className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border transition-colors ${
                      item.doneThisWeek
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-muted/40 border-border/60 hover:border-primary/40"
                    }`}
                  >
                    {item.doneThisWeek ? "✓ " : ""}
                    {item.label}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

            <h2 className="font-black text-base">Recentes</h2>
            <button onClick={() => router.push("/historico")} className="text-xs text-primary flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity">
              Ver histórico <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Card className="overflow-hidden divide-y divide-border/40">
            {recentSessions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-2xl bg-muted/40 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum treino ainda</p>
              </div>
            ) : recentSessions.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.05 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{s.workoutName}</p>
                    <p className="text-[11px] text-muted-foreground">{relativeTime(s.startedAt)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold tabular-nums">{formatVolume(s.totalVolume)} kg</p>
                  <p className="text-[11px] text-muted-foreground">{formatDuration(s.durationSec)}</p>
                </div>
              </motion.div>
            ))}
          </Card>
        </motion.section>

        {/* Recordes */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> Recordes
            </h2>
            <button onClick={() => router.push("/stats")} className="text-xs text-primary flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity">
              Ver stats <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Card className="overflow-hidden divide-y divide-border/40">
            {(!stats?.records || stats.records.length === 0) ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-2xl bg-muted/40 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Faça seu primeiro treino</p>
              </div>
            ) : stats.records.slice(0, 5).map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    i === 0 ? "bg-yellow-400/20 text-yellow-400" : i === 1 ? "bg-slate-400/15 text-slate-400" : i === 2 ? "bg-orange-400/15 text-orange-400" : "bg-muted text-muted-foreground"
                  }`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}
                  </div>
                  <p className="text-sm font-semibold truncate">{r.exercise}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold tabular-nums">{r.weight} kg</p>
                  <p className="text-[11px] text-muted-foreground">{r.reps} reps</p>
                </div>
              </motion.div>
            ))}
          </Card>
        </motion.section>
      </div>

      {/* ── CTA insight ── */}
      {stats?.topMuscleGroup && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-4 flex items-center gap-4 border-primary/20 bg-primary/5">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Músculo mais treinado</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.topMuscleGroup} lidera seus treinos. Lembre de manter equilíbrio muscular!</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
