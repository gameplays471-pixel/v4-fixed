"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  WifiOff,
  Clock,
  Dumbbell,
  Check,
  Trophy,
} from "lucide-react";
import { formatVolume } from "@/lib/api";
import type { LiveSnapshot } from "@/components/views/active-workout/hooks/useLiveShare";

const POLL_INTERVAL_MS = 1_500;
const STALE_AFTER_MS = 20_000;

type LivePayload = {
  workoutName: string;
  ownerName: string;
  startedAt: string;
  updatedAt: string;
  snapshot: LiveSnapshot;
};

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function LivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = use(params);
  const slug = resolved.slug;

  const [data, setData] = useState<LivePayload | null>(null);
  const [ended, setEnded] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/public/live/${slug}`, { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setEnded(true);
          return;
        }
        const json = (await res.json()) as LivePayload;
        // Garante shape mínimo se snapshot antigo
        if (!json.snapshot) {
          json.snapshot = {
            elapsed: 0,
            totalSets: 0,
            completedSets: 0,
            totalVolume: 0,
            totalCardioMin: 0,
            exercises: [],
          };
        }
        if (!Array.isArray(json.snapshot.exercises)) {
          json.snapshot.exercises = [];
        }
        setData(json);
        setEnded(false);
        setLastFetchedAt(Date.now());
      } catch {
        /* rede instável */
      } finally {
        setHasLoadedOnce(true);
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [slug]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const isStale = data ? Date.now() - lastFetchedAt > STALE_AFTER_MS : false;
  const secondsSincePoll = data ? Math.floor((Date.now() - lastFetchedAt) / 1000) : 0;
  const liveElapsed = data ? (data.snapshot.elapsed || 0) + secondsSincePoll : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 backdrop-blur-xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="GEMgym"
            width={28}
            height={28}
            className="w-7 h-7 rounded-xl object-cover ring-1 ring-primary/25"
          />
          <span className="font-black text-sm tracking-tight">GEMgym</span>
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 rounded-full px-2.5 py-1">
          <Radio className="w-3 h-3 animate-pulse" />
          AO VIVO
        </span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-16">
        {ended || (!data && hasLoadedOnce) ? (
          <Card className="p-8 text-center space-y-2">
            <p className="font-bold">Essa transmissão terminou</p>
            <p className="text-sm text-muted-foreground">
              O treino foi finalizado, cancelado, ou a pessoa parou de compartilhar.
            </p>
            <Link
              href="/"
              className="inline-block text-sm text-primary font-semibold underline underline-offset-2 mt-2"
            >
              Ir para o GEMgym
            </Link>
          </Card>
        ) : !data ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Carregando transmissão…</p>
          </Card>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isStale && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <WifiOff className="w-3 h-3" /> sem atualização recente
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">
                {data.ownerName} está treinando
              </p>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">{data.workoutName}</h1>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-black tabular-nums leading-none">
                  {formatTime(liveElapsed)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">tempo</p>
              </Card>
              <Card className="p-3 text-center">
                <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-black tabular-nums leading-none">
                  {data.snapshot.completedSets}/{data.snapshot.totalSets}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">séries</p>
              </Card>
              <Card className="p-3 text-center">
                <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-black tabular-nums leading-none">
                  {formatVolume(data.snapshot.totalVolume || 0)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">kg vol.</p>
              </Card>
            </div>

            {/* Progresso geral */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${
                    data.snapshot.totalSets > 0
                      ? Math.min(
                          100,
                          (data.snapshot.completedSets / data.snapshot.totalSets) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="space-y-4">
              {data.snapshot.exercises.map((ex, i) => {
                const done = ex.completedSets >= ex.totalSets && ex.totalSets > 0;
                return (
                  <Card
                    key={i}
                    className={`overflow-hidden transition-all ${
                      ex.current
                        ? "ring-2 ring-primary/60 border-primary/40"
                        : done
                          ? "opacity-70"
                          : ""
                    }`}
                  >
                    <div className="flex gap-3 p-3">
                      {/* Imagem do exercício */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        {ex.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ex.imageUrl}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                        {done && (
                          <div className="absolute inset-0 bg-emerald-500/70 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-sm leading-snug truncate">{ex.name}</p>
                            {ex.muscleGroup && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {ex.muscleGroup}
                              </p>
                            )}
                          </div>
                          {ex.current && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] shrink-0">
                              Agora
                            </Badge>
                          )}
                          {done && !ex.current && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-emerald-500 border-emerald-500/30 shrink-0"
                            >
                              OK
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {ex.isCardio
                            ? "Cardio"
                            : `${ex.completedSets}/${ex.totalSets} séries`}
                        </p>
                      </div>
                    </div>

                    {/* Séries — como no treino ativo */}
                    {!ex.isCardio && ex.sets && ex.sets.length > 0 && (
                      <div className="border-t border-border/50">
                        <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-1 px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold bg-muted/30">
                          <span>Set</span>
                          <span>Peso</span>
                          <span>Reps</span>
                          <span></span>
                        </div>
                        {ex.sets.map((s) => (
                          <div
                            key={s.setNumber}
                            className={`grid grid-cols-[40px_1fr_1fr_40px] gap-1 px-3 py-2.5 text-sm border-t border-border/30 items-center ${
                              s.completed ? "bg-primary/5" : ""
                            }`}
                          >
                            <span className="font-bold tabular-nums text-muted-foreground">
                              {s.setNumber}
                            </span>
                            <span className="font-semibold tabular-nums">
                              {s.completed || s.weight > 0 ? `${s.weight} kg` : "—"}
                            </span>
                            <span className="font-semibold tabular-nums">
                              {s.completed || s.reps > 0 ? s.reps : "—"}
                            </span>
                            <span className="flex justify-end">
                              {s.completed ? (
                                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                                </span>
                              ) : (
                                <span className="w-6 h-6 rounded-full border border-border/80" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {ex.isCardio && ex.cardio && (
                      <div className="border-t border-border/50 px-3 py-3 text-sm space-y-1">
                        {ex.cardio.durationSec != null && (
                          <p>
                            Duração:{" "}
                            <span className="font-semibold">
                              {Math.round(ex.cardio.durationSec / 60)} min
                            </span>
                          </p>
                        )}
                        {ex.cardio.distanceKm != null && (
                          <p>
                            Distância:{" "}
                            <span className="font-semibold">{ex.cardio.distanceKm} km</span>
                          </p>
                        )}
                        {ex.cardio.intensity && (
                          <p>
                            Intensidade:{" "}
                            <span className="font-semibold">{ex.cardio.intensity}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
