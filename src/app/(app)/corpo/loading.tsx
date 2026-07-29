import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Card } from "@/components/ui/card";

export default function CorpoLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="p-5">
        <LoadingSkeleton className="h-6 w-40 rounded-lg mb-4" />
        <LoadingSkeleton className="h-48 rounded-xl animate-shimmer" />
      </Card>
      <Card className="p-5">
        <LoadingSkeleton className="h-6 w-48 rounded-lg mb-4" />
        <LoadingSkeleton className="h-32 rounded-xl animate-shimmer" />
      </Card>
    </div>
  );
}
