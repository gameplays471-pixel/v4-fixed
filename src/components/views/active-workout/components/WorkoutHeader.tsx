import { Button } from "@/components/ui/button";
import { Clock, Flame, Dumbbell, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import { formatTime } from "../utils";
import { SyncBadge } from "./SyncIndicator";

interface WorkoutHeaderProps {
  workoutName: string;
  elapsed: number;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  totalCardioMin: number;
  onCancel: () => void;
  onFinishClick: () => void;
}

export function WorkoutHeader({
  workoutName,
  elapsed,
  completedSets,
  totalSets,
  totalVolume,
  totalCardioMin,
  onCancel,
  onFinishClick,
}: WorkoutHeaderProps) {
  return (
    <div className="sticky top-14 md:top-0 z-30 -mx-4 px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-lg truncate">{workoutName}</h1>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs font-semibold text-primary tabular-nums">
              <Clock className="w-3 h-3" />
              {formatTime(elapsed)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="w-3 h-3 text-orange-400" />
              {completedSets}/{totalSets} sets
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Dumbbell className="w-3 h-3" />
              {Math.round(totalVolume)} kg
            </span>
            {totalCardioMin > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <HeartPulse className="w-3 h-3 text-rose-400" />
                {totalCardioMin}min
              </span>
            )}
            <SyncBadge />
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-9 rounded-xl text-muted-foreground">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onFinishClick}
            className="h-9 rounded-xl bg-primary font-semibold shadow-md shadow-primary/20 px-4"
          >
            Finalizar
          </Button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mt-2.5 h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
