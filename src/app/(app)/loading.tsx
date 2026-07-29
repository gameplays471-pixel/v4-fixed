import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Skeleton de navegação para "/" — mesmo formato usado internamente por
// DashboardView enquanto busca dados, para não haver um "pulo" visual
// entre o loading da rota e o loading dos dados.
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <LoadingSkeleton className="h-32 rounded-3xl border border-border/60 animate-shimmer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <LoadingSkeleton
            key={i}
            className="h-24 rounded-2xl border border-border/60 animate-shimmer"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <LoadingSkeleton
            key={i}
            className="h-36 rounded-2xl border border-border/60 animate-shimmer"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}
