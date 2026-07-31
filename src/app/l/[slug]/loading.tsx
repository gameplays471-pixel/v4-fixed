import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Skeleton da página pública de transmissão ao vivo (/l/[slug]).
// Sem sidebar nem auth — landing enxuta com badge "AO VIVO", stats de
// tempo/séries e lista de exercícios com progresso.

export default function LiveWorkoutLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 animate-fade-in">
      <div className="space-y-2">
        <LoadingSkeleton className="h-5 w-20 rounded-full" />
        <LoadingSkeleton className="h-3 w-40" />
        <LoadingSkeleton className="h-7 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <LoadingSkeleton className="h-16 rounded-2xl" />
        <LoadingSkeleton className="h-16 rounded-2xl" />
      </div>
      <div className="rounded-2xl border border-border/60 p-5 space-y-3">
        <LoadingSkeleton className="h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
              <LoadingSkeleton className="h-4 w-40" />
              <LoadingSkeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
