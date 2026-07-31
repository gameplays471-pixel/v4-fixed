"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { apiGet, formatVolume, formatDuration, formatDate } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Dumbbell, Clock, ChevronRight, Calendar, X, Trophy, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShareWorkoutDialog } from "@/components/share-workout-dialog";
import { ExerciseHistoryChart } from "@/components/exercise-history-chart";
import type { WorkoutSummaryData } from "@/lib/store";

/** Listagem leve — sem sets (GET /api/sessions). */
type SessionListItem = {
  id: string;
  workoutName: string;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  totalVolume: number;
  notes: string | null;
  workout: { id: string; color: string | null; name?: string | null } | null;
};

type SessionSet = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  setNumber: number;
  isPR: boolean;
  durationSec: number | null;
  distanceKm: number | null;
  avgBpm: number | null;
  intensity: string | null;
  exercise: { muscleGroup: string; category: string; secondaryMuscles: string | null };
};

/** Detalhe completo — GET /api/sessions/[id]. */
type Session = SessionListItem & {
  sets: SessionSet[];
};

// Reconstrói o mesmo formato usado pela tela de resumo pós-treino
// (WorkoutSummaryData), agrupando os sets (flat) de volta por exercício —
// assim o mesmo ShareWorkoutDialog/ShareWorkoutCard funciona idêntico pra
// um treino recém-finalizado e pra um treino antigo aberto no histórico.
function sessionToSummaryData(session: Session): WorkoutSummaryData {
  const exerciseMap = new Map<string, WorkoutSummaryData["exercises"][number]>();

  for (const set of session.sets) {
    if (!exerciseMap.has(set.exerciseId)) {
      exerciseMap.set(set.exerciseId, {
        name: set.exerciseName,
        muscleGroup: set.exercise.muscleGroup,
        secondaryMuscles: set.exercise.secondaryMuscles,
        category: set.exercise.category,
        sets: [],
      });
    }
    exerciseMap.get(set.exerciseId)!.sets.push({
      weight: set.weight,
      reps: set.reps,
      isPR: set.isPR,
      durationSec: set.durationSec ?? undefined,
      distanceKm: set.distanceKm ?? undefined,
      avgBpm: set.avgBpm ?? undefined,
      intensity: set.intensity ?? undefined,
    });
  }

  return {
    workoutName: session.workoutName,
    durationSec: session.durationSec,
    totalVolume: session.totalVolume,
    finishedAt: session.endedAt ?? session.startedAt,
    exercises: [...exerciseMap.values()],
  };
}

type Stats = {
  heatmap: Array<{ date: string; sessions: number; volume: number }>;
};

export function HistoryView() {
  const sessionsQuery = useInfiniteQuery({
    queryKey: queryKeys.sessionsInfinite,
    queryFn: ({ pageParam }) =>
      apiGet<{
        sessions: SessionListItem[];
        nextCursor: string | null;
        hasMore: boolean;
      }>(
        `/api/sessions?limit=20${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : null),
  });
  // Mesma queryKey do dashboard/stats: cache compartilhado entre as telas.
  const statsQuery = useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => apiGet<{ stats: Stats }>("/api/stats").then((d) => d.stats),
  });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openSession = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await apiGet<{ session: Session }>(`/api/sessions/${id}`);
      setSelectedSession(res.session);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar o detalhe do treino.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const sessions = (sessionsQuery.data?.pages.flatMap((p) => p.sessions) ?? []) as SessionListItem[];
  const stats = statsQuery.data ?? null;
  const loading = sessionsQuery.isLoading || statsQuery.isLoading;
  const hasError = sessionsQuery.isError || statsQuery.isError;

  useEffect(() => {
    if (hasError) {
      console.error("Erro ao carregar histórico:", sessionsQuery.error || statsQuery.error);
      toast.error("Não foi possível carregar seu histórico. Tente novamente.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasError]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <LoadingSkeleton className="h-8 w-40 rounded-xl animate-shimmer" />
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-20 rounded-2xl border border-border/60 animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  const grouped: Record<string, SessionListItem[]> = {};
  for (const s of sessions) {
    const date = new Date(s.startedAt).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(s);
  }
  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="text-3xl font-black tracking-tight">Histórico</h1>
        <p className="text-sm text-muted-foreground mt-1">{sessions.length > 0 ? `${sessions.length} treino${sessions.length !== 1 ? "s" : ""} registrado${sessions.length !== 1 ? "s" : ""}` : "Cada sessão conta."}</p>
      </div>

      {/* Heatmap */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Calendário — últimos 90 dias
          </h2>
        </div>
        <Heatmap data={stats?.heatmap || []} />
      </Card>

      {/* Lista */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Dumbbell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm font-medium">Nenhum treino ainda.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Seus treinos aparecerão aqui após a primeira sessão.</p>
          </Card>
        ) : (
          sortedDates.map((date, di) => (
            <motion.div key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.04 }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest capitalize">
                  {new Date(date + "T00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
                </span>
                {grouped[date].length > 1 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">{grouped[date].length}</Badge>
                )}
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <div className="space-y-2">
                {grouped[date].map((session) => (
                  <Card
                    key={session.id}
                    className="px-4 py-3.5 hover:border-primary/30 hover:bg-accent/20 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer group"
                    onClick={() => openSession(session.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 text-sm font-black shadow-sm group-hover:scale-105 transition-transform"
                        style={{ background: session.workout?.color || "var(--primary)", boxShadow: `0 3px 10px ${session.workout?.color || "var(--primary)"}35` }}
                      >
                        {session.workoutName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{session.workoutName}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatDuration(session.durationSec)}
                          </span>
                          <span>·</span>
                          <span>{session.sets.length} sets</span>
                          {session.sets.some(s => s.isPR) && (
                            <><span>·</span><span className="text-yellow-400 font-semibold flex items-center gap-0.5"><Trophy className="w-3 h-3" /> PR</span></>
                          )}
                          <span>·</span>
                          <span>{new Date(session.startedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black tabular-nums">{formatVolume(session.totalVolume)} kg</p>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto mt-0.5 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>


      {sessionsQuery.hasNextPage && (
        <div className="flex justify-center pt-2 pb-6">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={sessionsQuery.isFetchingNextPage}
            onClick={() => sessionsQuery.fetchNextPage()}
          >
            {sessionsQuery.isFetchingNextPage ? "Carregando…" : "Carregar mais treinos"}
          </Button>
        </div>
      )}

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
    if (!entry || entry.sessions === 0) return "bg-muted/40";
    if (entry.volume > 10000) return "bg-primary shadow-sm shadow-primary/40";
    if (entry.volume > 5000) return "bg-primary/70";
    if (entry.volume > 2000) return "bg-primary/45";
    return "bg-primary/25";
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
  const [shareOpen, setShareOpen] = useState(false);
  const byExercise: Record<string, typeof session.sets> = {};
  for (const set of session.sets) {
    if (!byExercise[set.exerciseName]) byExercise[set.exerciseName] = [];
    byExercise[set.exerciseName].push(set);
  }
  const prCount = session.sets.filter(s => s.isPR).length;

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="bg-card border border-border/60 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-xl px-5 pt-5 pb-4 border-b border-border/40 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-lg leading-tight">{session.workoutName}</h2>
              {prCount > 0 && (
                <Badge className="bg-yellow-400/15 text-yellow-400 border-yellow-400/25 text-[10px] font-bold rounded-full">
                  🏆 {prCount} PR{prCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(session.startedAt)} · {formatDuration(session.durationSec)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl font-semibold gap-2"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="w-4 h-4" />
            Compartilhar treino
          </Button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Sets", value: session.sets.length, icon: "💪" },
              { label: "Volume", value: `${formatVolume(session.totalVolume)} kg`, icon: "⚖️" },
              { label: "Exercícios", value: Object.keys(byExercise).length, icon: "🏋️" },
            ].map((s) => (
              <div key={s.label} className="bg-muted/40 rounded-2xl p-3 text-center">
                <p className="text-lg mb-0.5">{s.icon}</p>
                <p className="text-lg font-black tabular-nums">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>


          {/* Evolução de carga */}
          {Array.from(new Map(session.sets.map((s) => [s.exerciseId, s])).values())
            .filter((s) => s.durationSec == null)
            .slice(0, 4)
            .map((s) => (
              <div key={s.exerciseId} className="bg-muted/20 rounded-2xl p-3 border border-border/40">
                <p className="text-xs font-bold mb-1">{s.exerciseName}</p>
                <ExerciseHistoryChart exerciseId={s.exerciseId} exerciseName={s.exerciseName} days={90} height={140} />
              </div>
            ))}

          {/* Por exercício */}
          <div className="space-y-4">
            {Object.entries(byExercise).map(([name, sets]) => (
              <div key={name}>
                <p className="text-sm font-bold mb-2">{name}</p>
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40">
                    <div>Set</div>
                    <div className="text-center">Peso</div>
                    <div className="text-center">Reps</div>
                    <div className="text-right">Vol.</div>
                  </div>
                  {sets.map((set, i) => (
                    <div key={i} className={`grid grid-cols-4 px-3 py-2.5 text-sm transition-colors ${set.isPR ? "bg-primary/10 border-l-2 border-primary" : ""} ${i < sets.length - 1 ? "border-b border-border/30" : ""}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{i + 1}</span>
                        {set.isPR && <span className="text-[9px] font-black text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">PR</span>}
                      </div>
                      <div className="text-center font-bold">{set.weight} kg</div>
                      <div className="text-center text-muted-foreground">{set.reps}</div>
                      <div className="text-right text-muted-foreground tabular-nums">{Math.round(set.weight * set.reps)} kg</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
    <ShareWorkoutDialog data={sessionToSummaryData(session)} open={shareOpen} onOpenChange={setShareOpen} />
    </>
  );
}
