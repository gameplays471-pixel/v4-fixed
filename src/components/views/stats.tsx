"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiDelete, formatVolume, formatDuration, formatDate } from "@/lib/api";
import { Trophy, Dumbbell, Clock, TrendingUp, Flame, Target, BarChart3, Scale, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
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
          <div key={i} className="h-48 bg-card rounded-2xl border border-border/60 animate-shimmer" style={{ animationDelay: `${i*0.1}s` }} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis dataKey="week" stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatVolume(v)} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.012 255)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: "0.75rem", color: "oklch(0.97 0 0)", fontSize: "12px" }}
                cursor={{ fill: "oklch(1 0 0 / 0.04)", radius: 6 }}
                formatter={(v: number) => [`${formatVolume(v)} kg`, "Volume"]} />
              <Bar dataKey="volume" fill="oklch(0.80 0.18 162)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Peso corporal */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Peso corporal</h2>
              {latestWeight != null && (
                <Badge variant="secondary" className="text-xs rounded-full">{latestWeight} kg</Badge>
              )}
              {weightDelta != null && weightDelta !== 0 && (
                <Badge className={weightDelta > 0
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/20 rounded-full text-xs"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 rounded-full text-xs"}>
                  {weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} kg
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" inputMode="decimal" step="0.1" placeholder="Ex: 80.5"
                value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWeight()}
                className="w-28 h-10 rounded-xl" />
              <Button size="sm" onClick={handleAddWeight} disabled={savingWeight}
                className="h-10 rounded-xl bg-primary font-semibold gap-1 shadow-sm shadow-primary/20">
                <Plus className="w-4 h-4" /> Registrar
              </Button>
            </div>
          </div>

        {weightLoading ? (
          <div className="h-48 bg-muted/30 rounded-xl animate-shimmer" />
        ) : weightChartData.length < 2 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {weightChartData.length === 0
              ? "Registre seu peso para acompanhar sua evolução."
              : "Registre mais um peso para ver o gráfico."}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => `${v}kg`} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.012 255)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: "0.75rem", color: "oklch(0.97 0 0)", fontSize: "12px" }}
                formatter={(v: number) => [`${v} kg`, "Peso"]} />
              <Line type="monotone" dataKey="peso" stroke="oklch(0.80 0.18 162)" strokeWidth={2.5}
                dot={{ r: 4, fill: "oklch(0.80 0.18 162)", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {weightLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-1 max-h-40 overflow-y-auto">
            {weightLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-1.5 group hover:bg-accent/30 rounded-lg px-2 transition-colors">
                <span className="text-muted-foreground">{formatDate(log.loggedAt)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{log.weight} kg</span>
                  <button onClick={() => handleDeleteWeight(log.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg"
                    aria-label="Remover">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis dataKey="week" stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.012 255)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: "0.75rem", color: "oklch(0.97 0 0)", fontSize: "12px" }}
                cursor={{ fill: "oklch(1 0 0 / 0.04)", radius: 6 }}
                formatter={(v: number) => [`${v} treino(s)`, "Sessões"]} />
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
