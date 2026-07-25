import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy } from "lucide-react";
import { formatTime } from "../utils";

interface FinishModalProps {
  completedSets: number;
  totalVolume: number;
  elapsed: number;
  saving: boolean;
  onClose: () => void;
  onFinish: () => void;
}

// Componente separado com portal próprio para garantir que os handlers
// funcionem corretamente sem depender do AnimatePresence do pai.
export function FinishModal({ completedSets, totalVolume, elapsed, saving, onClose, onFinish }: FinishModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // bloqueia scroll do body enquanto modal está aberto
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onMouseDown={onClose}
    >
      <div
        className="bg-card border border-border/60 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Ícone */}
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center"
            style={{ boxShadow: "0 0 40px oklch(0.80 0.18 162 / 0.30)" }}
          >
            <Trophy className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-center mb-1">Finalizar treino?</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Confira o resumo antes de salvar:</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-muted/50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black tabular-nums">{completedSets}</p>
            <p className="text-xs text-muted-foreground mt-0.5">sets</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black tabular-nums">{Math.round(totalVolume)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">kg total</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black tabular-nums">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">tempo</p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 h-12 rounded-xl font-semibold border border-border bg-transparent hover:bg-accent transition-colors text-sm disabled:opacity-50"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={saving}
            className="flex-1 h-12 rounded-xl font-bold text-sm text-primary-foreground disabled:opacity-60 transition-all active:scale-[0.98]"
            style={{
              background: "var(--primary)",
              boxShadow: "0 4px 20px oklch(0.80 0.18 162 / 0.35)",
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              "Finalizar 🏆"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
