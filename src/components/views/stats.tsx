"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { apiGet, formatVolume, formatDuration } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  Trophy,
  Dumbbell,
  Clock,
  TrendingUp,
  Flame,
  Target,
  BarChart3,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  ComposedChart,
  Legend,
} from "recharts";

type WeeklyPoint = {
  week: string;
  weekLabel?: string;
  volume: number;
  sessions: number;
};

type Stats = {
  totalSessions: number;
  totalVolume: number;
  totalWeightLifted: number;
  avgDuration: number;
  streak: number;
  topMuscleGroup: string;
  favoriteExercise: string;
  weeklyVolume: WeeklyPoint[] | number;
  weeklyVolumeCurrent?: number;
  weeklySessionsCurrent?: number;
  records: Array<{ exercise: string; weight: number; reps: number; volume: number }>;
  heatmap?: Array<{ date: string; sessions: number; volume: number }>;
};

function normalizeWeekly(raw: Stats["weeklyVolume"]): WeeklyPoint[] {
  if (Array.isArray(raw)) {
    return raw.map((w) => ({
      week: w.week,
      weekLabel: w.weekLabel || w.week.slice(5), // MM-DD
      volume: Number(w.volume) || 0,
      sessions: Number(w.sessions) || 0,
    }));
  }
  return [];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur px-3 py-2 shadow-lg text-xs space-y-1">
      <p className="font-bold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold tabular-nums text-foreground">
            {p.name === "Volume" ? `${formatVolume(Number(p.value))} kg` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function StatsView() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.stats,
    staleTime: 2 * 60_000,
    queryFn: () => apiGet<{ stats: Stats }>("/api/stats").then((d) => d.stats),
  });
  const stats = data ?? null;

  const weekly = useMemo(
    () => normalizeWeekly(stats?.weeklyVolume ?? []),
    [stats?.weeklyVolume]
  );

  const maxVolume = useMemo(
    () => Math.max(1, ...weekly.map((w) => w.volume)),
    [weekly]
  );

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
          <LoadingSkeleton
            key={i}
            className="h-48 rounded-2xl border border-border/60 animate-shimmer"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const thisWeekVolume =
    stats.weeklyVolumeCurrent ??
    (weekly.length ? weekly[weekly.length - 1].volume : 0);
  const thisWeekSessions =
    stats.weeklySessionsCurrent ??
    (weekly.length ? weekly[weekly.length - 1].sessions : 0);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Estatísticas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe sua evolução ao longo do tempo.
        </p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <Dumbbell className="w-5 h-5" />,
            label: "Treinos",
            value: String(stats.totalSessions),
            color: "text-blue-400",
            bg: "bg-blue-500/15",
          },
          {
            icon: <TrendingUp className="w-5 h-5" />,
            label: "Volume total",
            value: `${formatVolume(stats.totalVolume)} kg`,
            color: "text-emerald-400",
            bg: "bg-emerald-500/15",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            label: "Duração média",
            value: formatDuration(stats.avgDuration),
            color: "text-violet-400",
            bg: "bg-violet-500/15",
          },
          {
            icon: <Flame className="w-5 h-5" />,
            label: "Sequência",
            value: `${stats.streak}d`,
            color: "text-orange-400",
            bg: "bg-orange-500/15",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 flex items-center gap-3 h-full">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}
              >
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  {s.label}
                </p>
                <p className="text-xl font-black tabular-nums mt-0.5 truncate">{s.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Destaque da semana atual */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-primary/25 bg-primary/5">
          <p className="text-xs text-muted-foreground font-medium">Volume esta semana</p>
          <p className="text-2xl font-black tabular-nums text-primary mt-1">
            {formatVolume(thisWeekVolume)} kg
          </p>
        </Card>
        <Card className="p-4 border-primary/25 bg-primary/5">
          <p className="text-xs text-muted-foreground font-medium">Treinos esta semana</p>
          <p className="text-2xl font-black tabular-nums text-primary mt-1">
            {thisWeekSessions}
          </p>
        </Card>
      </div>

      {/* Volume por semana — gráfico alto e legível */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Volume por semana</h2>
            </div>
            <Badge variant="outline" className="text-[10px] font-medium">
              8 semanas
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Carga total (peso × reps) de cada semana
          </p>
          {weekly.every((w) => w.volume === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              Ainda sem volume registrado. Finalize um treino para ver o gráfico.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={weekly}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                barCategoryGap="18%"
              >
                <defs>
                  <linearGradient id="volBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                  opacity={0.6}
                />
                <XAxis
                  dataKey="weekLabel"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) => formatVolume(v)}
                  domain={[0, Math.ceil(maxVolume * 1.15)]}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }} />
                <Bar
                  dataKey="volume"
                  name="Volume"
                  fill="url(#volBar)"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>

      {/* Treinos por semana */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Treinos por semana</h2>
            </div>
            <Badge variant="outline" className="text-[10px] font-medium">
              8 semanas
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Quantidade de sessões concluídas
          </p>
          {weekly.every((w) => w.sessions === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              Sem sessões neste período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart
                data={weekly}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                  opacity={0.6}
                />
                <XAxis
                  dataKey="weekLabel"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }} />
                <Bar
                  dataKey="sessions"
                  name="Treinos"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.85}
                  radius={[8, 8, 4, 4]}
                  maxBarSize={36}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="Tendência"
                  stroke="hsl(var(--chart-2, 142 70% 45%))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(var(--chart-2, 142 70% 45%))", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>

      {/* Records + Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h2 className="font-bold">Recordes</h2>
          </div>
          {(!stats.records || stats.records.length === 0) ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Sem recordes ainda.
            </p>
          ) : (
            <div className="space-y-1.5">
              {stats.records.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/40 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                      i === 0
                        ? "bg-yellow-400/20"
                        : i === 1
                          ? "bg-slate-400/15"
                          : i === 2
                            ? "bg-orange-400/15"
                            : "bg-muted"
                    }`}
                  >
                    {i === 0 ? (
                      "🥇"
                    ) : i === 1 ? (
                      "🥈"
                    ) : i === 2 ? (
                      "🥉"
                    ) : (
                      <span className="text-xs text-muted-foreground font-bold">#{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.exercise}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.reps} reps · {formatVolume(r.volume)} kg vol.
                    </p>
                  </div>
                  <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 rounded-full font-bold shrink-0">
                    {r.weight} kg
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="font-bold">Insights</h2>
          </div>
          <div className="space-y-0">
            {[
              { label: "Músculo mais treinado", value: stats.topMuscleGroup, icon: "💪" },
              { label: "Exercício favorito", value: stats.favoriteExercise, icon: "⭐" },
              {
                label: "Carga total levantada",
                value: `${formatVolume(stats.totalWeightLifted)} kg`,
                icon: "⚖️",
              },
              {
                label: "Volume médio/treino",
                value: `${formatVolume(
                  stats.totalSessions > 0 ? stats.totalVolume / stats.totalSessions : 0
                )} kg`,
                icon: "📊",
              },
              {
                label: "Tempo total treinado",
                value: formatDuration(stats.totalSessions * stats.avgDuration),
                icon: "⏱️",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                <span className="text-sm font-bold text-right ml-3">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
