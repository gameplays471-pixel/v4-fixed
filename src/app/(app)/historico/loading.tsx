import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function HistoricoLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <LoadingSkeleton className="h-8 w-40 rounded-xl animate-shimmer" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            className="h-20 rounded-2xl border border-border/60 animate-shimmer"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
