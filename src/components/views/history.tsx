"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, formatVolume, formatDuration, formatDate, relativeTime } from "@/lib/api";
import { motion } from "framer-motion";
import { Dumbbell, Clock, ChevronRight, Calendar } from "lucide-react";

type Session = {
  id: string;
  workoutName: string;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  totalVolume: number;
  notes: string | null;
  workout: { id: string; color: string | null } | null;
  sets: Array<{
    id: string;
    exerciseName: string;
    weight: number;
    reps: number;
    setNumber: number;
    isPR: boolean;
  }>;
};

type Stats = {
  heatmap: Array<{ date: string; sessions: number; volume: number }>;
};

export function HistoryView() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<{ sessions: Session[] }>("/api/sessions?limit=100"),
      apiGet<{ stats: Stats }>("/api/stats"),
    ])
      .then(([s, st]) => {
        setSessions(s.sessions);
        setStats(st.stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Agrupar por dia
  const grouped: Record<string, Session[]> = {};
  for (const s of sessions) {
    const date = new Date(s.startedAt).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(s);
  }

  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-sm text-muted-foreground mt-1">Tudo que você treinou. Cada sessão conta.</p>
      </div>

      {/* Heatmap */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Calendário de treinos
          </h2>
          <span className="text-xs text-muted-foreground">Últimos 90 dias</span>
        </div>

        <Heatmap data={stats?.heatmap || []} />
      </Card>

      {/* Lista por dia */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-2">Sem treinos ainda</p>
            <p className="text-xs text-muted-foreground">Inicie seu primeiro treino para vê-lo aqui</p>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold capitalize">
                  {new Date(date + "T00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <Badge variant="secondary" className="text-xs">{grouped[date].length} treino(s)</Badge>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                {grouped[date].map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ background: session.workout?.color || "var(--primary)" }}
                          >
                            <Dumbbell className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{session.workoutName}</p>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(session.durationSec)}
                              </span>
                              <span>{session.sets.length} sets</span>
                              <span>{new Date(session.startedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm">{formatVolume(session.totalVolume)} kg</p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalhes da sessão */}
      {selectedSession && (
        <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}

function Heatmap({ data }: { data: Array<{ date: string; sessions: number; volume: number }> }) {
  // 13 semanas (91 dias) = 13 colunas x 7 linhas
  const weeks: Array<Array<typeof data[number] | null>> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Ajustar para começar no domingo
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 90 + (7 - dayOfWeek));

  // Preencher grid
  const dataMap = new Map(data.map((d) => [d.date, d]));
  
  for (let w = 0; w < 14; w++) {
    const week: Array<typeof data[number] | null> = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      if (date > today) {
        week.push(null);
      } else {
        const dateStr = date.toISOString().split("T")[0];
        week.push(dataMap.get(dateStr) || { date: dateStr, sessions: 0, volume: 0 });
      }
    }
    weeks.push(week);
  }

  const getColor = (entry: typeof data[number] | null) => {
    if (!entry) return "bg-transparent";
    if (entry.sessions === 0) return "bg-muted";
    if (entry.volume > 10000) return "bg-primary";
    if (entry.volume > 5000) return "bg-primary/70";
    return "bg-primary/40";
  };

  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 min-w-fit">
        {/* Labels */}
        <div className="flex flex-col gap-1 pt-0">
          {dayLabels.map((d, i) => (
            <div key={i} className="h-3 w-3 text-[9px] text-muted-foreground flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((entry, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm ${getColor(entry)} hover:ring-1 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background transition-all`}
                  title={
                    entry
                      ? `${formatDate(entry.date)} · ${entry.sessions} treino(s) · ${formatVolume(entry.volume)} kg`
                      : ""
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="w-3 h-3 rounded-sm bg-muted" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/70" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>Mais</span>
      </div>
    </div>
  );
}

function SessionDetailModal({ session, onClose }: { session: Session; onClose: () => void }) {
  // Agrupar sets por exercício
  const byExercise: Record<string, Array<typeof session.sets[number]>> = {};
  for (const set of session.sets) {
    if (!byExercise[set.exerciseName]) byExercise[set.exerciseName] = [];
    byExercise[set.exerciseName].push(set);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
      >
        <div className="p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-lg">{session.workoutName}</h2>
              <p className="text-xs text-muted-foreground">{formatDate(session.startedAt)} · {formatDuration(session.durationSec)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-xl font-bold">{session.sets.length}</p>
              <p className="text-xs text-muted-foreground">sets</p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-xl font-bold">{formatVolume(session.totalVolume)}</p>
              <p className="text-xs text-muted-foreground">kg total</p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-xl font-bold">{Object.keys(byExercise).length}</p>
              <p className="text-xs text-muted-foreground">exercícios</p>
            </div>
          </div>

          {Object.entries(byExercise).map(([name, sets]) => (
            <div key={name}>
              <h3 className="font-semibold text-sm mb-2">{name}</h3>
              <div className="bg-background rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase border-b border-border">
                  <div>Set</div>
                  <div className="text-center">Peso</div>
                  <div className="text-center">Reps</div>
                  <div className="text-right">Volume</div>
                </div>
                {sets.map((set, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2 text-sm border-b border-border last:border-b-0">
                    <div className="flex items-center gap-1">
                      <span>{i + 1}</span>
                      {set.isPR && <span title="Recorde pessoal">🏆</span>}
                    </div>
                    <div className="text-center">{set.weight} kg</div>
                    <div className="text-center">{set.reps}</div>
                    <div className="text-right text-muted-foreground">{set.weight * set.reps} kg</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
