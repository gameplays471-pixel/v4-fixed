import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function StatsLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      {Array.from({ length: 3 }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          className="h-48 rounded-2xl border border-border/60 animate-shimmer"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
