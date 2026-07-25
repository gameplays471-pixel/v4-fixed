import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { INTENSITY_OPTIONS, type CardioState } from "../types";

interface CardioFormProps {
  cardio: CardioState;
  onUpdate: (updates: Partial<CardioState>) => void;
  onToggleComplete: () => void;
}

export function CardioForm({ cardio, onUpdate, onToggleComplete }: CardioFormProps) {
  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground">Duração (min)</label>
          <Input
            type="number"
            value={cardio.durationMin}
            onChange={(e) => onUpdate({ durationMin: e.target.value })}
            className="h-10 text-center font-medium"
            disabled={cardio.completed}
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Distância (km) · opcional</label>
          <Input
            type="number"
            step="0.1"
            placeholder="0"
            value={cardio.distanceKm}
            onChange={(e) => onUpdate({ distanceKm: e.target.value })}
            className="h-10 text-center font-medium"
            disabled={cardio.completed}
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">BPM médio · opcional</label>
          <Input
            type="number"
            placeholder="0"
            value={cardio.avgBpm}
            onChange={(e) => onUpdate({ avgBpm: e.target.value })}
            className="h-10 text-center font-medium"
            disabled={cardio.completed}
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Intensidade</label>
          <select
            value={cardio.intensity}
            onChange={(e) => onUpdate({ intensity: e.target.value })}
            disabled={cardio.completed}
            className="h-10 w-full text-sm text-center font-medium rounded-md border border-input bg-background disabled:opacity-60"
          >
            {INTENSITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button
        variant={cardio.completed ? "default" : "outline"}
        className={`w-full ${cardio.completed ? "bg-primary" : ""}`}
        onClick={onToggleComplete}
      >
        <Check className="w-4 h-4 mr-2" />
        {cardio.completed ? "Concluído" : "Marcar como concluído"}
      </Button>
    </div>
  );
}
