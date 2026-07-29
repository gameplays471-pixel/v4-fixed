import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Skeleton da página pública de treino compartilhado (/w/[slug]).
// Sem sidebar nem auth: é uma landing enxuta que reflete o conteúdo
// típico — header com nome do autor + título do treino, card de
// exercícios e botão de clonar.

export default function SharedWorkoutLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-fade-in">
      <div className="space-y-2">
        <LoadingSkeleton className="h-3 w-28" />
        <LoadingSkeleton className="h-7 w-64" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </div>
      <div className="rounded-2xl border border-border/60 p-5 space-y-3">
        <LoadingSkeleton className="h-4 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <LoadingSkeleton className="h-4 w-40" />
                <LoadingSkeleton className="h-3 w-24" />
              </div>
              <LoadingSkeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
      <LoadingSkeleton className="h-12 w-full rounded-xl" />
      <LoadingSkeleton className="h-3 w-3/4 mx-auto" />
    </div>
  );
}
