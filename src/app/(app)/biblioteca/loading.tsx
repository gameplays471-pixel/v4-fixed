import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function BibliotecaLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <LoadingSkeleton className="h-11 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            className="h-24 rounded-xl"
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  );
}
