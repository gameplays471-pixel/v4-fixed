"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, formatVolume, formatDuration, formatDate } from "@/lib/api";
import { Dumbbell, Clock, ChevronRight, Calendar, X } from "lucide-react";

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
      <div className="space-y-4 animate-fade-in">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-card rounded-2xl border border-border/60 animate-pulse-slow" />
        ))}
      </div>
    );
  }

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
        <p className="text-sm text-muted-foreground mt-1">Cada sessão conta.</p>
      </div>

      {/* Heatmap */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Calendário — últimos 90 dias
          </h2>
        </div>
        <Heatmap data={stats?.heatmap || []} />
      </Card>

      {/* Lista */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-sm">Nenhum treino ainda.</p>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest capitalize">
                  {new Date(date + "T00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
                </span>
                {grouped[date].length > 1 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{grouped[date].length}</Badge>
                )}
                <div className="flex-1 h-px bg-border/60" />
              </div>

              <div className="space-y-2">
                {grouped[date].map((session) => (
                  <Card
                    key={session.id}
                    className="px-4 py-3 hover:border-primary/30 hover:bg-accent/20 transition-all cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 text-sm font-bold"
                        style={{ background: session.workout?.color || "var(--primary)" }}
                      >
                        {session.workoutName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{session.workoutName}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatDuration(session.durationSec)}
                          </span>
                          <span>·</span>
                          <span>{session.sets.length} sets</span>
                          <span>·</span>
                          <span>{new Date(session.startedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold tabular-nums">{formatVolume(session.totalVolume)} kg</p>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto mt-0.5" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}

function Heatmap({ data }: { data: Array<{ date: string; sessions: number; volume: number }> }) {
  const weeks: Array<Array<{ date: string; sessions: number; volume: number } | null>> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 90 + (7 - dayOfWeek));

  const dataMap = new Map(data.map((d) => [d.date, d]));

  for (let w = 0; w < 14; w++) {
    const week: Array<{ date: string; sessions: number; volume: number } | null> = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      if (date > today) { week.push(null); continue; }
      const dateStr = date.toISOString().split("T")[0];
      week.push(dataMap.get(dateStr) || { date: dateStr, sessions: 0, volume: 0 });
    }
    weeks.push(week);
  }

  const getColor = (entry: { sessions: number; volume: number } | null) => {
    if (!entry || entry.sessions === 0) return "bg-muted/50";
    if (entry.volume > 10000) return "bg-primary";
    if (entry.volume > 5000) return "bg-primary/70";
    return "bg-primary/40";
  };

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-1 min-w-fit">
        <div className="flex flex-col gap-1 mr-1">
          {["D","S","T","Q","Q","S","S"].map((d, i) => (
            <div key={i} className="w-3 h-3 text-[9px] text-muted-foreground/60 flex items-center justify-center">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((entry, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm transition-all hover:ring-1 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background ${getColor(entry)}`}
                title={entry?.sessions ? `${entry.date} · ${entry.sessions} treino(s)` : ""}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="w-3 h-3 rounded-sm bg-muted/50" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/70" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>Mais</span>
      </div>
    </div>
  );
}

function SessionModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const byExercise: Record<string, typeof session.sets> = {};
  for (const set of session.sets) {
    if (!byExercise[set.exerciseName]) byExercise[set.exerciseName] = [];
    byExercise[set.exerciseName].push(set);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/60 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm px-5 pt-5 pb-3 border-b border-border/40 flex items-start justify-between z-10">
          <div>
            <h2 className="font-bold text-lg leading-tight">{session.workoutName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(session.startedAt)} · {formatDuration(session.durationSec)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Sets", value: session.sets.length },
              { label: "Volume", value: `${formatVolume(session.totalVolume)} kg` },
              { label: "Exercícios", value: Object.keys(byExercise).length },
            ].map((s) => (
              <div key={s.label} className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-lg font-bold tabular-nums">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Por exercício */}
          <div className="space-y-4">
            {Object.entries(byExercise).map(([name, sets]) => (
              <div key={name}>
                <p className="text-sm font-semibold mb-2">{name}</p>
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                    <div>Set</div>
                    <div className="text-center">Peso</div>
                    <div className="text-center">Reps</div>
                    <div className="text-right">Vol.</div>
                  </div>
                  {sets.map((set, i) => (
                    <div key={i} className={`grid grid-cols-4 px-3 py-2.5 text-sm ${set.isPR ? "bg-primary/8" : ""} ${i < sets.length - 1 ? "border-b border-border/30" : ""}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{i + 1}</span>
                        {set.isPR && <span className="text-[10px] font-bold text-primary bg-primary/15 px-1 py-0.5 rounded">PR</span>}
                      </div>
                      <div className="text-center font-medium">{set.weight} kg</div>
                      <div className="text-center text-muted-foreground">{set.reps}</div>
                      <div className="text-right text-muted-foreground">{Math.round(set.weight * set.reps)} kg</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
