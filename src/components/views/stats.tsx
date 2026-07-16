"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet, formatVolume, formatDuration } from "@/lib/api";
import { Trophy, Dumbbell, Clock, TrendingUp, Flame, Target, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ stats: Stats }>("/api/stats")
      .then((d) => setStats(d.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe sua evolução ao longo do tempo.</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Dumbbell className="w-5 h-5" />} label="Treinos totais" value={`${stats.totalSessions}`} color="text-primary" />
        <StatCard icon={<Flame className="w-5 h-5" />} label="Sequência" value={`${stats.streak} dias`} color="text-orange-400" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Volume total" value={`${formatVolume(stats.totalVolume)} kg`} color="text-blue-400" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Tempo médio" value={formatDuration(stats.avgDuration)} color="text-purple-400" />
      </div>

      {/* Gráfico de volume semanal */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Volume por semana</h2>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.weeklyVolume}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="oklch(0.65 0 0)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.65 0 0)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatVolume(v)}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.205 0 0)",
                border: "1px solid oklch(1 0 0 / 0.1)",
                borderRadius: "0.5rem",
                color: "oklch(0.97 0 0)",
                fontSize: "12px",
              }}
              cursor={{ fill: "oklch(1 0 0 / 0.05)" }}
              formatter={(v: number) => [`${formatVolume(v)} kg`, "Volume"]}
            />
            <Bar dataKey="volume" fill="oklch(0.78 0.18 162)" radius={[4, 4, 0, 0]} name="Volume (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico de sessões por semana */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Treinos por semana</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.weeklyVolume}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="oklch(0.65 0 0)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.65 0 0)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.205 0 0)",
                border: "1px solid oklch(1 0 0 / 0.1)",
                borderRadius: "0.5rem",
                color: "oklch(0.97 0 0)",
                fontSize: "12px",
              }}
              cursor={{ fill: "oklch(1 0 0 / 0.05)" }}
              formatter={(v: number) => [`${v} treino(s)`, "Sessões"]}
            />
            <Bar dataKey="sessions" fill="oklch(0.7 0.18 200)" radius={[4, 4, 0, 0]} name="Sessões" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recordes */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h2 className="font-semibold">Recordes pessoais</h2>
          </div>

          {stats.records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sem recordes ainda</p>
          ) : (
            <div className="space-y-2">
              {stats.records.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.exercise}</p>
                    <p className="text-xs text-muted-foreground">{r.reps} reps · vol {formatVolume(r.volume)} kg</p>
                  </div>
                  <Badge className="bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/20">
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
            <h2 className="font-semibold">Insights</h2>
          </div>

          <div className="space-y-3">
            <InsightRow label="Músculo mais treinado" value={stats.topMuscleGroup} />
            <InsightRow label="Exercício favorito" value={stats.favoriteExercise} />
            <InsightRow label="Carga total levantada" value={`${formatVolume(stats.totalWeightLifted)} kg`} />
            <InsightRow label="Volume médio por treino" value={`${formatVolume(stats.totalSessions > 0 ? stats.totalVolume / stats.totalSessions : 0)} kg`} />
            <InsightRow label="Tempo total treinado" value={formatDuration(stats.totalSessions * stats.avgDuration)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
