"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiDelete, formatVolume, formatDuration, formatDate } from "@/lib/api";
import { Trophy, Dumbbell, Clock, TrendingUp, Flame, Target, BarChart3, Scale, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

type BodyWeightLog = {
  id: string;
  weight: number;
  loggedAt: string;
  notes: string | null;
};

export function StatsView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightLogs, setWeightLogs] = useState<BodyWeightLog[]>([]);
  const [weightLoading, setWeightLoading] = useState(true);
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    apiGet<{ stats: Stats }>("/api/stats")
      .then((d) => setStats(d.stats))
      .finally(() => setLoading(false));
  }, []);

  const loadWeightLogs = () => {
    setWeightLoading(true);
    apiGet<{ logs: BodyWeightLog[] }>("/api/bodyweight")
      .then((d) => setWeightLogs(d.logs))
      .finally(() => setWeightLoading(false));
  };

  useEffect(() => {
    loadWeightLogs();
  }, []);

  const handleAddWeight = async () => {
    const value = parseFloat(newWeight.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um peso válido");
      return;
    }
    setSavingWeight(true);
    try {
      await apiPost("/api/bodyweight", { weight: value });
      toast.success("Peso registrado!");
      setNewWeight("");
      loadWeightLogs();
    } catch (e) {
      toast.error("Erro ao registrar peso");
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      await apiDelete(`/api/bodyweight/${id}`);
      loadWeightLogs();
    } catch {
      toast.error("Erro ao remover registro");
    }
  };

  // Dados do gráfico: ordem cronológica crescente
  const weightChartData = [...weightLogs]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((log) => ({
      date: formatDate(log.loggedAt),
      peso: log.weight,
    }));

  const latestWeight = weightLogs[0]?.weight;
  const firstWeight = weightLogs[weightLogs.length - 1]?.weight;
  const weightDelta = latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null;

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

      {/* Peso corporal */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Peso corporal</h2>
            {latestWeight != null && (
              <Badge variant="secondary" className="text-xs">{latestWeight} kg</Badge>
            )}
            {weightDelta != null && weightDelta !== 0 && (
              <Badge
                className={
                  weightDelta > 0
                    ? "bg-blue-500/15 text-blue-400 hover:bg-blue-500/20"
                    : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                }
              >
                {weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} kg
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="Peso (kg)"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWeight()}
              className="w-28 h-9"
            />
            <Button size="sm" onClick={handleAddWeight} disabled={savingWeight}>
              <Plus className="w-4 h-4 mr-1" />
              Registrar
            </Button>
          </div>
        </div>

        {weightLoading ? (
          <div className="h-48 bg-muted/30 rounded-lg animate-pulse" />
        ) : weightChartData.length < 2 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {weightChartData.length === 0
              ? "Registre seu peso para começar a acompanhar sua evolução."
              : "Registre mais um peso para ver o gráfico de evolução."}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="oklch(0.65 0 0)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="oklch(0.65 0 0)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
                tickFormatter={(v) => `${v}kg`}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.205 0 0)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: "0.5rem",
                  color: "oklch(0.97 0 0)",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [`${v} kg`, "Peso"]}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="oklch(0.78 0.18 162)"
                strokeWidth={2}
                dot={{ r: 3, fill: "oklch(0.78 0.18 162)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {weightLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-1 max-h-40 overflow-y-auto">
            {weightLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-1.5 group">
                <span className="text-muted-foreground">{formatDate(log.loggedAt)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.weight} kg</span>
                  <button
                    onClick={() => handleDeleteWeight(log.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    aria-label="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
    <Card className="p-4 flex flex-col gap-2">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{label}</p>
        <p className="text-xl font-bold mt-0.5 tabular-nums">{value}</p>
      </div>
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
