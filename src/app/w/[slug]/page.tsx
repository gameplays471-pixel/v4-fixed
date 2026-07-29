import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Dumbbell, Clock, Flame } from "lucide-react";
import { CloneWorkoutButton } from "./clone-workout-button";

export const metadata = {
  title: "Treino compartilhado — GEMgym",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharedWorkoutPage({ params }: PageProps) {
  const { slug } = await params;

  const workout = await db.workout.findUnique({
    where: { shareSlug: slug },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
      user: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 backdrop-blur-xl px-4 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="GEMgym" width={28} height={28} className="w-7 h-7 rounded-xl object-cover ring-1 ring-primary/25" />
          <span className="font-black text-sm tracking-tight">GEMgym</span>
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {!workout ? (
          <Card className="p-8 text-center space-y-2">
            <p className="font-bold">Link inválido ou expirado</p>
            <p className="text-sm text-muted-foreground">
              Esse link de treino não existe mais, ou foi digitado errado.
            </p>
            <Link href="/" className="inline-block text-sm text-primary font-semibold underline underline-offset-2 mt-2">
              Ir para o GEMgym
            </Link>
          </Card>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Treino de {workout.user.name}
              </p>
              <h1 className="text-2xl font-black tracking-tight mt-1">{workout.name}</h1>
              {workout.description && (
                <p className="text-sm text-muted-foreground mt-1.5">{workout.description}</p>
              )}
            </div>

            <Card className="p-5 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-sm">{workout.exercises.length} exercício{workout.exercises.length !== 1 ? "s" : ""}</h2>
              </div>
              {workout.exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Este treino ainda não tem exercícios.</p>
              ) : (
                workout.exercises.map((ex) => {
                  const isCardio = ex.exercise.category === "Cardio";
                  return (
                    <div key={ex.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-semibold truncate">{ex.exercise.name}</p>
                        <p className="text-[11px] text-muted-foreground">{ex.exercise.muscleGroup}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground flex items-center gap-1 tabular-nums">
                        {isCardio ? (
                          <>
                            <Clock className="w-3 h-3" />
                            {Math.round((ex.targetDurationSec ?? 1800) / 60)}min
                            {ex.targetIntensity && (
                              <span className="flex items-center gap-0.5 ml-1"><Flame className="w-3 h-3" />{ex.targetIntensity}</span>
                            )}
                          </>
                        ) : (
                          `${ex.targetSets}×${ex.targetReps}`
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </Card>

            <CloneWorkoutButton slug={slug} workoutName={workout.name} />

            <p className="text-[11px] text-center text-muted-foreground">
              Ao clonar, uma cópia deste treino é adicionada à sua conta — você pode editá-la à vontade sem afetar o original.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
