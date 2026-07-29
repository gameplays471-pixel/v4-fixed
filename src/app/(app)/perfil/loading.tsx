import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function PerfilLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      {[0, 1, 2].map((i) => (
        <LoadingSkeleton
          key={i}
          className="h-32 rounded-2xl border border-border/60 animate-shimmer"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
