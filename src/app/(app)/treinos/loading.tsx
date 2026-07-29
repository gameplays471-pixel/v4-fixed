import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function TreinosLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <LoadingSkeleton className="h-11 rounded-xl" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <LoadingSkeleton
            key={i}
            className="h-48 rounded-2xl border border-border/60"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
