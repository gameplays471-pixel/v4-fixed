import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play, Plus, Minus, Volume2, VolumeX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RestTimerState } from "../types";
import { formatTime } from "../utils";

interface RestTimerCardProps {
  restTimer: RestTimerState;
  soundOn: boolean;
  onTogglePause: () => void;
  onAdjust: (deltaSeconds: number) => void;
  onToggleSound: () => void;
  onDismiss: () => void;
}

export function RestTimerCard({ restTimer, soundOn, onTogglePause, onAdjust, onToggleSound, onDismiss }: RestTimerCardProps) {
  return (
    <AnimatePresence>
      {restTimer.active && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="sticky top-32 md:top-24 z-20"
        >
          <Card
            className="p-4 border-primary/30"
            style={{ background: "linear-gradient(135deg, oklch(0.17 0.012 255), oklch(0.20 0.020 162 / 0.5))" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-widest">⏱ Descanso</p>
                <p className="text-4xl font-black tabular-nums text-primary">{formatTime(restTimer.remaining)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={onTogglePause}>
                  {restTimer.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => onAdjust(15)}>
                  <Plus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => onAdjust(-15)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={onToggleSound}>
                  {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={onDismiss}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Barra de progresso do timer */}
            <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${restTimer.total > 0 ? (restTimer.remaining / restTimer.total) * 100 : 0}%` }}
              />
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
