"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Radio, Clock, Dumbbell, CheckCircle2, Circle, WifiOff } from "lucide-react";

const POLL_INTERVAL_MS = 5000;
// Se não chegar snapshot novo por esse tempo, tratamos como "sinal fraco" —
// não necessariamente encerrado (o servidor só apaga o registro quando o
// treino é finalizado/cancelado/desligado explicitamente).
const STALE_AFTER_MS = 45_000;

interface LiveExercise {
  name: string;
  isCardio: boolean;
  totalSets: number;
  completedSets: number;
  current: boolean;
}

interface LiveSnapshot {
  elapsed: number;
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  totalCardioMin: number;
  exercises: LiveExercise[];
}

interface LivePayload {
  workoutName: string;
  ownerName: string;
  startedAt: string;
  updatedAt: string;
  snapshot: LiveSnapshot;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LiveWorkoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<LivePayload | null>(null);
  const [ended, setEnded] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(Date.now());
  const [tick, setTick] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

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
        const json = await res.json();
        setData(json);
        setEnded(false);
        setLastFetchedAt(Date.now());
      } catch {
        // rede instável — só marca "fim" se a gente já sabia que tinha dados antes,
        // não achamos que a transmissão acabou por causa de um blip de conexão.
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

  // Só pra re-renderizar o relógio local a cada segundo (elapsed sobe entre polls).
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const isStale = data ? Date.now() - lastFetchedAt > STALE_AFTER_MS : false;
  const secondsSincePoll = data ? Math.floor((Date.now() - lastFetchedAt) / 1000) : 0;
  const liveElapsed = data ? data.snapshot.elapsed + secondsSincePoll : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 backdrop-blur-xl px-4 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="GEMgym" width={28} height={28} className="w-7 h-7 rounded-xl object-cover ring-1 ring-primary/25" />
          <span className="font-black text-sm tracking-tight">GEMgym</span>
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {ended || (!data && hasLoadedOnce) ? (
          <Card className="p-8 text-center space-y-2">
            <p className="font-bold">Essa transmissão terminou</p>
            <p className="text-sm text-muted-foreground">
              O treino foi finalizado, cancelado, ou a pessoa parou de compartilhar. O link não é mais válido.
            </p>
            <Link href="/" className="inline-block text-sm text-primary font-semibold underline underline-offset-2 mt-2">
              Ir para o GEMgym
            </Link>
          </Card>
        ) : !data ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Carregando transmissão...</p>
          </Card>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 rounded-full px-2.5 py-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  AO VIVO
                </span>
                {isStale && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <WifiOff className="w-3 h-3" /> sem atualização recente
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-2">
                {data.ownerName} está treinando
              </p>
              <h1 className="text-2xl font-black tracking-tight mt-1">{data.workoutName}</h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-lg font-black tabular-nums leading-none">{formatTime(liveElapsed)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">tempo decorrido</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-lg font-black tabular-nums leading-none">
                    {data.snapshot.completedSets}/{data.snapshot.totalSets}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">séries concluídas</p>
                </div>
              </Card>
            </div>

            <Card className="p-5 space-y-0.5">
              <h2 className="font-bold text-sm mb-2">Exercícios</h2>
              {data.snapshot.exercises.map((ex, i) => {
                const done = ex.completedSets >= ex.totalSets && ex.totalSets > 0;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 rounded-lg ${
                      ex.current ? "bg-primary/5 -mx-2 px-2" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Circle className={`w-4 h-4 shrink-0 ${ex.current ? "text-primary" : "text-muted-foreground/40"}`} />
                      )}
                      <p className={`text-sm truncate ${ex.current ? "font-bold" : done ? "text-muted-foreground line-through" : "font-medium"}`}>
                        {ex.name}
                      </p>
                    </div>
                    {!ex.isCardio && (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                        {ex.completedSets}/{ex.totalSets}
                      </span>
                    )}
                  </div>
                );
              })}
            </Card>

            <p className="text-[11px] text-center text-muted-foreground">
              Atualiza automaticamente a cada poucos segundos.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
