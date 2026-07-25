import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Minus } from "lucide-react";
import type { SetState } from "../types";

interface SetRowProps {
  set: SetState;
  setIdx: number;
  canRemove: boolean;
  weightPlaceholder: string;
  repsPlaceholder: string;
  onUpdate: (field: "weight" | "reps", value: string) => void;
  onRemove: () => void;
  onComplete: () => void;
}

export function SetRow({ set, setIdx, canRemove, weightPlaceholder, repsPlaceholder, onUpdate, onRemove, onComplete }: SetRowProps) {
  return (
    <div
      className={`grid grid-cols-[1.75rem_1fr_1fr_auto] gap-2 items-center px-1.5 py-1.5 rounded-xl transition-all ${
        set.completed ? "bg-primary/10 border border-primary/15" : "hover:bg-muted/30"
      }`}
    >
      <div className="text-center text-sm font-bold text-muted-foreground">{setIdx + 1}</div>
      <Input
        type="number"
        inputMode="decimal"
        step="0.5"
        placeholder={weightPlaceholder}
        value={set.weight}
        onChange={(e) => onUpdate("weight", e.target.value)}
        className={`h-11 text-center font-bold text-base placeholder:text-muted-foreground/40 ${set.completed ? "bg-background" : ""}`}
        disabled={set.completed}
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder={repsPlaceholder}
        value={set.reps}
        onChange={(e) => onUpdate("reps", e.target.value)}
        className={`h-11 text-center font-bold text-base placeholder:text-muted-foreground/40 ${set.completed ? "bg-background" : ""}`}
        disabled={set.completed}
      />
      <div className="flex items-center gap-1 shrink-0">
        {canRemove && (
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
            onClick={onRemove}
          >
            <Minus className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant={set.completed ? "default" : "outline"}
          className={`h-11 w-11 shrink-0 rounded-xl transition-all ${
            set.completed ? "bg-primary shadow-md shadow-primary/20" : "hover:border-primary/40"
          }`}
          onClick={onComplete}
        >
          <Check className={`w-4 h-4 ${set.completed ? "stroke-[3]" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
