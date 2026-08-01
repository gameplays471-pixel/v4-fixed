"use client";

import { forwardRef } from "react";
import { Dumbbell, Clock, Flame, Star, Trophy } from "lucide-react";
import { MuscleSilhouette } from "@/components/muscle-map";
import type { WorkoutSummaryData } from "@/lib/store";

export type ShareFormat = "story" | "square";

/**
 * "silhouette": card original, com o manequim muscular (sem as tags de
 *   nome de músculo — removidas a pedido, ficavam poluídas).
 * "silhouette-list": manequim + lista de exercícios com contagem de séries.
 * "list": só a lista de exercícios com contagem (ex.: "3× Supino Inclinado"),
 *   sem manequim — card mais compacto/direto.
 */
export type ShareVariant = "silhouette" | "silhouette-list" | "list";

// Dimensões-base do nó capturado (em px). html-to-image usa pixelRatio: 2 na
// exportação, então o PNG final sai em 1080×1920 (story) ou 1080×1080 (post)
// — os dois formatos que WhatsApp Status e Instagram (stories/feed) esperam.
export const SHARE_CARD_SIZE: Record<ShareFormat, { width: number; height: number }> = {
  story: { width: 540, height: 960 },
  square: { width: 540, height: 540 },
};

function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m}min`;
}

function fmtVolume(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}

// Lista "3× Supino Inclinado" usada nas variantes silhouette-list e list.
// Em vez de cortar tudo além de `maxItems` num "+N exercícios" (o que escondia
// a maior parte do treino já a partir de 5-6 exercícios), a lista agora:
//  1. muda para 2 colunas automaticamente quando há muitos exercícios, e
//  2. reduz fonte/padding/gap em degraus conforme a quantidade cresce,
// para caber o treino inteiro dentro da altura fixa do card. Só aplicamos o
// "+N" como último recurso, com um teto bem mais alto (`hardCap`) — na
// prática cobre qualquer treino razoável (raramente > 20 exercícios).
function ExerciseList({
  exercises,
  columns,
  hardCap,
}: {
  exercises: WorkoutSummaryData["exercises"];
  columns: 1 | 2;
  hardCap: number;
}) {
  const shown = exercises.slice(0, hardCap);
  const extra = exercises.length - shown.length;
  const count = shown.length;

  // Colunas: força 2 quando há exercícios demais para 1 coluna só, mesmo em
  // variantes que por padrão usariam 1 (silhouette-list).
  const effectiveColumns: 1 | 2 = count > 6 ? 2 : columns;

  // Degraus de tamanho — quanto mais exercícios, mais compacto cada item.
  const tier =
    count <= 6 ? 0 :
    count <= 10 ? 1 :
    count <= 16 ? 2 : 3;
  const fontSize = [12, 11, 10, 9][tier];
  const padding = ["8px 10px", "6px 8px", "5px 7px", "4px 5px"][tier];
  const gap = [7, 5, 4, 3][tier];
  const countFontSize = fontSize + 0.5;

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
          <span style={{ flexShrink: 0, fontWeight: 900, fontSize: countFontSize, color: "#4ade80" }}>
            {ex.sets.length}×
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

interface ShareWorkoutCardProps {
  data: WorkoutSummaryData;
  format: ShareFormat;
  variant: ShareVariant;
}

export const ShareWorkoutCard = forwardRef<HTMLDivElement, ShareWorkoutCardProps>(
  function ShareWorkoutCard({ data, format, variant }, ref) {
    const { width, height } = SHARE_CARD_SIZE[format];
    const isStory = format === "story";

    const primaryMuscles: string[] = [];
    const primarySet = new Set<string>();
    const secondaryMuscles: string[] = [];
    for (const ex of data.exercises) {
      if (ex.category === "Cardio") {
        if (!primarySet.has("Cardio")) { primarySet.add("Cardio"); primaryMuscles.push("Cardio"); }
        continue;
      }
      if (ex.muscleGroup && !primarySet.has(ex.muscleGroup)) {
        primarySet.add(ex.muscleGroup);
        primaryMuscles.push(ex.muscleGroup);
      }
      if (ex.secondaryMuscles) {
        for (const m of ex.secondaryMuscles.split(",")) {
          const trimmed = m.trim();
          if (trimmed && !primarySet.has(trimmed) && !secondaryMuscles.includes(trimmed)) {
            secondaryMuscles.push(trimmed);
          }
        }
      }
    }
    const filteredSecondary = secondaryMuscles.filter((m) => !primarySet.has(m));

    const showSilhouette = variant !== "list";
    const showList = variant !== "silhouette";
    // Quando os dois (manequim + lista) dividem o espaço, o manequim fica
    // bem menor pra sobrar altura de verdade pra lista — e a lista mostra
    // menos itens (o resto vira "+N exercícios"). Na variante só-lista, o
    // espaço todo do manequim é reaproveitado, então cabe muito mais.
    const silhouetteMaxHeight = variant === "silhouette" ? (isStory ? 300 : 170) : isStory ? 168 : 96;
    // Teto alto — a lista mesma decide colunas/tamanho de fonte conforme a
    // quantidade (ver ExerciseList). Isso evita truncar treinos comuns de
    // 5-8 exercícios num "+N exercícios" quase vazio.
    const listHardCap = variant === "list" ? (isStory ? 24 : 18) : isStory ? 20 : 14;
    const listColumns: 1 | 2 = variant === "list" ? 2 : 1;

    const totalSets = data.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const prs = data.exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.isPR).length, 0);

    const stats = [
      { icon: <Clock className="w-full h-full" />, value: fmtDuration(data.durationSec), label: "duração" },
      { icon: <Dumbbell className="w-full h-full" />, value: `${fmtVolume(data.totalVolume)}kg`, label: "volume" },
      { icon: <Flame className="w-full h-full" />, value: String(totalSets), label: "séries" },
      { icon: <Star className="w-full h-full" />, value: prs > 0 ? String(prs) : String(data.exercises.length), label: prs > 0 ? "novos PRs" : "exercícios" },
    ];

    const dateLabel = new Date(data.finishedAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

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
        {/* Glow decorativo */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: isStory ? -140 : -160,
            left: "50%",
            transform: "translateX(-50%)",
            width: 520,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(34,197,94,0.35), transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -180,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(34,197,94,0.12), transparent 70%)",
          }}
        />

        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: isStory ? "36px 32px" : "28px 28px" }}>
          {/* Header / brand */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: "rgba(34,197,94,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Dumbbell style={{ width: 16, height: 16, color: "#22c55e" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>GEMgym</span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(245,245,245,0.5)", fontWeight: 600, textTransform: "capitalize" }}>
              {dateLabel}
            </span>
          </div>

          {/* Hero */}
          <div style={{ textAlign: "center", marginTop: isStory ? 28 : 14 }}>
            <div style={{
              width: isStory ? 64 : 52, height: isStory ? 64 : 52, borderRadius: 20,
              background: "rgba(34,197,94,0.18)", margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 32px rgba(34,197,94,0.28)",
            }}>
              <Trophy style={{ width: isStory ? 32 : 26, height: isStory ? 32 : 26, color: "#22c55e" }} />
            </div>
            <p style={{
              marginTop: 14, fontWeight: 900, fontSize: isStory ? 24 : 20,
              letterSpacing: 0.5, lineHeight: 1.15,
            }}>
              TREINO CONCLUÍDO
            </p>
            <p style={{
              marginTop: 4, fontSize: isStory ? 16 : 14, fontWeight: 600,
              color: "rgba(245,245,245,0.68)",
            }}>
              {data.workoutName}
            </p>

            {prs > 0 && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                marginTop: 10, padding: "5px 12px", borderRadius: 999,
                background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.35)",
                color: "#facc15", fontWeight: 800, fontSize: 12,
              }}>
                <Star style={{ width: 12, height: 12, fill: "currentColor" }} />
                {prs} novo{prs > 1 ? "s" : ""} recorde{prs > 1 ? "s" : ""} pessoal{prs > 1 ? "is" : ""}
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
            marginTop: isStory ? 26 : 18,
          }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "10px 4px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <div style={{ width: 16, height: 16, color: "#22c55e" }}>{s.icon}</div>
                <span style={{ fontWeight: 900, fontSize: isStory ? 16 : 14, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 8.5, color: "rgba(245,245,245,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Manequim muscular e/ou lista de exercícios, conforme a variante */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: variant === "silhouette-list" ? "flex-start" : "center",
              gap: 10,
              marginTop: isStory ? 14 : 8,
              minHeight: 0,
            }}
          >
            {showSilhouette && (
              <div
                style={
                  variant === "silhouette"
                    ? {
                        height: "100%",
                        maxHeight: silhouetteMaxHeight,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: 8,
                      }
                    : {
                        height: silhouetteMaxHeight,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: 8,
                      }
                }
              >
                {([
                  { side: "front" as const, label: "Frente" },
                  { side: "back" as const, label: "Costas" },
                ]).map(({ side, label }) => (
                  <div
                    key={side}
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 4,
                    }}
                  >
                    <p style={{
                      fontSize: 8,
                      color: "rgba(245,245,245,0.55)",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      lineHeight: 1,
                    }}>
                      {label}
                    </p>
                    {/* height: calc(100% - 13px) reserva 9px do label + 4px do gap
                        da coluna flex; o `aspectRatio` (724/1448) define a largura
                        a partir dessa altura. `minHeight: 0` permite que o
                        `calc` encolha abaixo do conteúdo se o card for muito
                        pequeno. */}
                    <div style={{ aspectRatio: "724/1448", height: "calc(100% - 13px)", minHeight: 0 }}>
                      <MuscleSilhouette side={side} primaryMuscles={primaryMuscles} secondaryMuscles={filteredSecondary} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showList && (
              <ExerciseList exercises={data.exercises} columns={listColumns} hardCap={listHardCap} />
            )}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: isStory ? 20 : 12, paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6,
          }}>
            <span style={{ fontSize: 11, color: "rgba(245,245,245,0.45)", fontWeight: 600 }}>
              Feito no <span style={{ color: "#4ade80", fontWeight: 800 }}>GEMgym</span> 💪
            </span>
          </div>
        </div>
      </div>
    );
  }
);
