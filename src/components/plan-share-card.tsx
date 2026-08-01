"use client";

import { forwardRef } from "react";
import { Dumbbell, ListChecks } from "lucide-react";

export const PLAN_CARD_SIZE = { width: 540, height: 540 };

interface PlanCardExercise {
  name: string;
  muscleGroup: string;
  isCardio: boolean;
  targetSets: number;
  targetReps: number;
  targetDurationSec: number | null;
  targetIntensity: string | null;
}

interface PlanShareCardProps {
  workoutName: string;
  description: string | null;
  exercises: PlanCardExercise[];
}

/**
 * Lista de exercícios com auto-scaling, mesma estratégia aplicada em
 * `share-workout-card.tsx` (`ExerciseList`).
 *
 * A versão antiga cortava tudo além de `maxItems = 9` num "+N exercícios" —
 * bom o bastante pra um treino curto, mas fichas planejadas com 12-15
 * exercícios (divisão por grupo muscular) ficavam truncadas sem chance de
 * mostrar o treino inteiro. A nova versão:
 *  1. muda pra 2 colunas automaticamente quando a quantidade passa de 6, e
 *  2. reduz fonte/padding/gap em degraus conforme a quantidade cresce,
 * para caber o treino inteiro dentro da altura fixa do card. Só aplicamos
 * o "+N" como último recurso, com um teto bem mais alto (`hardCap`) — na
 * prática cobre qualquer treino razoável (raramente > 20 exercícios).
 */
function ExerciseList({
  exercises,
  hardCap,
}: {
  exercises: PlanCardExercise[];
  hardCap: number;
}) {
  const shown = exercises.slice(0, hardCap);
  const extra = exercises.length - shown.length;
  const count = shown.length;

  // 2 colunas quando passa de 6 exercícios. Para a ficha planejada, como
  // não tem manequim competindo por espaço, podemos ser menos agressivos
  // do que no card de treino concluído e manter 1 coluna em fichas curtas,
  // que ficam mais legíveis.
  const effectiveColumns: 1 | 2 = count > 6 ? 2 : 1;

  // Degraus de tamanho — quanto mais exercícios, mais compacto cada item.
  const tier =
    count <= 6 ? 0 :
    count <= 10 ? 1 :
    count <= 16 ? 2 : 3;
  const fontSize = [12, 11, 10, 9][tier];
  const padding = ["8px 10px", "6px 8px", "5px 7px", "4px 5px"][tier];
  const gap = [7, 5, 4, 3][tier];
  const targetFontSize = fontSize + 0.5;

  return (
    <div style={{ width: "100%", display: "grid", gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`, gap }}>
      {shown.map((ex, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding,
            minWidth: 0,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontWeight: 900,
              fontSize: targetFontSize,
              color: "#4ade80",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {ex.isCardio
              ? `${Math.round((ex.targetDurationSec ?? 1800) / 60)}min`
              : `${ex.targetSets}×${ex.targetReps}`}
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize,
              color: "rgba(245,245,245,0.9)",
              lineHeight: 1.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ex.name}
          </span>
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            gridColumn: `span ${effectiveColumns}`,
            textAlign: "center",
            fontSize: 11,
            color: "rgba(245,245,245,0.45)",
            fontWeight: 700,
            marginTop: 2,
          }}
        >
          +{extra} exercício{extra > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

/** Ficha estática do treino planejado — visual similar ao card de treino concluído, mas sem duração/volume/PR (o treino ainda não aconteceu). */
export const PlanShareCard = forwardRef<HTMLDivElement, PlanShareCardProps>(
  function PlanShareCard({ workoutName, description, exercises }, ref) {
    const { width, height } = PLAN_CARD_SIZE;
    const totalSets = exercises.reduce((acc, ex) => acc + (ex.isCardio ? 1 : ex.targetSets), 0);
    // Teto alto — a lista mesma decide colunas/tamanho de fonte conforme a
    // quantidade (ver ExerciseList). Isso evita truncar fichas planejadas
    // comuns de 10-15 exercícios num "+N exercícios" quase vazio.
    const listHardCap = 20;

    return (
      <div
        ref={ref}
        style={{
          width,
          height,
          position: "relative",
          overflow: "hidden",
          fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)",
          background: "linear-gradient(160deg, #0a0c10 0%, #10131a 45%, #0b0f0d 100%)",
          color: "#f5f5f5",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)",
            width: 520, height: 320, borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(34,197,94,0.35), transparent 70%)",
            filter: "blur(2px)",
          }}
        />

        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "28px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(34,197,94,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell style={{ width: 16, height: 16, color: "#22c55e" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>GEMgym</span>
          </div>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 18, background: "rgba(34,197,94,0.18)", margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 32px rgba(34,197,94,0.28)",
            }}>
              <ListChecks style={{ width: 26, height: 26, color: "#22c55e" }} />
            </div>
            <p style={{ marginTop: 14, fontWeight: 900, fontSize: 20, letterSpacing: 0.5 }}>FICHA DE TREINO</p>
            <p style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: "rgba(245,245,245,0.85)" }}>{workoutName}</p>
            {description && (
              <p style={{ marginTop: 4, fontSize: 12, fontWeight: 500, color: "rgba(245,245,245,0.55)", padding: "0 20px" }}>
                {description}
              </p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 18 }}>
            {[
              { value: String(exercises.length), label: "exercícios" },
              { value: String(totalSets), label: "séries totais" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <span style={{ fontWeight: 900, fontSize: 16, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 9, color: "rgba(245,245,245,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 0, marginTop: 14, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <ExerciseList exercises={exercises} hardCap={listHardCap} />
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(245,245,245,0.45)", fontWeight: 600 }}>
              Feito no <span style={{ color: "#4ade80", fontWeight: 800 }}>GEMgym</span> 💪
            </span>
          </div>
        </div>
      </div>
    );
  }
);
