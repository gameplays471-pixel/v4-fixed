"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { apiGet, formatVolume, formatDuration } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Trophy, Dumbbell, Clock, TrendingUp, Flame, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

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

export function StatsView() {
  // Mesma queryKey usada no dashboard: quem já visitou o dashboard chega
  // aqui com os stats já em cache (instantâneo), atualizando por trás.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.stats,
    staleTime: 2 * 60_000,
    queryFn: () => apiGet<{ stats: Stats }>("/api/stats").then((d) => d.stats),
  });
  const stats = data ?? null;

  useEffect(() => {
    if (isError) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Não foi possível carregar suas estatísticas.");
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-48 rounded-2xl border border-border/60 animate-shimmer" style={{ animationDelay: `${i*0.1}s` }} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Estatísticas</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe sua evolução ao longo do tempo.</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Dumbbell className="w-5 h-5" />, label: "Treinos totais", value: `${stats.totalSessions}`, color: "text-primary", bg: "bg-primary/10" },
          { icon: <Flame className="w-5 h-5" />, label: "Sequência", value: `${stats.streak}d`, color: "text-orange-400", bg: "bg-orange-500/10" },
          { icon: <TrendingUp className="w-5 h-5" />, label: "Volume total", value: `${formatVolume(stats.totalVolume)} kg`, color: "text-blue-400", bg: "bg-blue-500/10" },
          { icon: <Clock className="w-5 h-5" />, label: "Tempo médio", value: formatDuration(stats.avgDuration), color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="p-4 flex flex-col gap-3 hover:border-primary/20 transition-all">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{s.label}</p>
                <p className="text-2xl font-black tabular-nums mt-0.5">{s.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráfico de volume semanal */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="font-bold">Volume por semana</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.weeklyVolume} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-fg)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatVolume(v)} />
              <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "0.75rem", color: "var(--fg)", fontSize: "12px" }}
                cursor={{ fill: "var(--muted)", radius: 6 }}
                formatter={(v: number) => [`${formatVolume(v)} kg`, "Volume"]} />
              <Bar dataKey="volume" fill="oklch(0.80 0.18 162)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Gráfico de sessões por semana */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }}>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-primary" />
            <h2 className="font-bold">Treinos por semana</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.weeklyVolume} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-fg)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "0.75rem", color: "var(--fg)", fontSize: "12px" }}
                cursor={{ fill: "var(--muted)", radius: 6 }}
                formatter={(v: number) => [`${v} treino(s)`, "Sessoes"]} />
              <Bar dataKey="sessions" fill="oklch(0.72 0.18 200)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recordes */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h2 className="font-bold">Recordes pessoais</h2>
          </div>
          {stats.records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sem recordes ainda</p>
          ) : (
            <div className="space-y-1.5">
              {stats.records.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/40 transition-colors group">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                    i === 0 ? "bg-yellow-400/20" : i === 1 ? "bg-slate-400/15" : i === 2 ? "bg-orange-400/15" : "bg-muted"
                  }`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-xs text-muted-foreground font-bold">#{i+1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.exercise}</p>
                    <p className="text-[11px] text-muted-foreground">{r.reps} reps · {formatVolume(r.volume)} kg vol.</p>
                  </div>
                  <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 rounded-full font-bold shrink-0">
                    {r.weight} kg
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Insights */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="font-bold">Insights</h2>
          </div>
          <div className="space-y-0">
            {[
              { label: "Músculo mais treinado", value: stats.topMuscleGroup, icon: "💪" },
              { label: "Exercício favorito", value: stats.favoriteExercise, icon: "⭐" },
              { label: "Carga total levantada", value: `${formatVolume(stats.totalWeightLifted)} kg`, icon: "⚖️" },
              { label: "Volume médio/treino", value: `${formatVolume(stats.totalSessions > 0 ? stats.totalVolume / stats.totalSessions : 0)} kg`, icon: "📊" },
              { label: "Tempo total treinado", value: formatDuration(stats.totalSessions * stats.avgDuration), icon: "⏱️" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{item.icon}</span>{item.label}
                </span>
                <span className="text-sm font-bold text-right ml-3">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
