"use client";

import { motion } from "framer-motion";
import { bodyFront } from "@/lib/body-highlighter/body-front-data";
import { bodyBack } from "@/lib/body-highlighter/body-back-data";
import { OUTLINE_FRONT, OUTLINE_BACK } from "@/lib/body-highlighter/outline-data";
import { MUSCLE_PT_TO_SLUGS, TRACKABLE_SLUGS } from "@/lib/body-highlighter/muscle-mapping";
import type { BodyPart, Slug } from "@/lib/body-highlighter/types";

type MuscleStatus = "primary" | "secondary" | "none";

const TRACKABLE_SET = new Set<Slug>(TRACKABLE_SLUGS);

function buildStatusMap(primary: string[], secondary: string[]): Partial<Record<Slug, MuscleStatus>> {
  const map: Partial<Record<Slug, MuscleStatus>> = {};

  for (const m of secondary) {
    const slugs = MUSCLE_PT_TO_SLUGS[m];
    if (!slugs) continue;
    for (const slug of slugs) {
      if (!map[slug]) map[slug] = "secondary";
    }
  }
  for (const m of primary) {
    const slugs = MUSCLE_PT_TO_SLUGS[m];
    if (!slugs) continue;
    for (const slug of slugs) {
      map[slug] = "primary";
    }
  }
  return map;
}

const PRIMARY_COLOR = "#22c55e";
const SECONDARY_COLOR = "rgba(134,239,172,0.55)";
const NEUTRAL_COLOR = "rgba(100,116,139,0.28)";
const BODY_COLOR = "rgba(51,65,85,0.55)";
const OUTLINE = "rgba(148,163,184,0.35)";

function colorFor(status: MuscleStatus) {
  if (status === "primary") return PRIMARY_COLOR;
  if (status === "secondary") return SECONDARY_COLOR;
  return NEUTRAL_COLOR;
}

/** Converte a lista de partes (formato do react-native-body-highlighter) num mapa por slug. */
function toPartMap(parts: readonly BodyPart[]): Partial<Record<Slug, BodyPart["path"]>> {
  const map: Partial<Record<Slug, BodyPart["path"]>> = {};
  for (const part of parts) {
    if (part.slug) map[part.slug] = part.path;
  }
  return map;
}

const FRONT_PARTS = toPartMap(bodyFront);
const BACK_PARTS = toPartMap(bodyBack);

interface BodySvgProps {
  parts: Partial<Record<Slug, BodyPart["path"]>>;
  outline: string;
  viewBox: string;
  statusMap: Partial<Record<Slug, MuscleStatus>>;
}

function BodySvg({ parts, outline, viewBox, statusMap }: BodySvgProps) {
  return (
    <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Silhueta base */}
      <path d={outline} fill="none" stroke={OUTLINE} strokeWidth={3} vectorEffect="non-scaling-stroke" />

      {Object.entries(parts).map(([slug, path]) => {
        const s = slug as Slug;
        const status = statusMap[s] ?? "none";
        const fill = TRACKABLE_SET.has(s) ? colorFor(status) : BODY_COLOR;
        const allPaths = [...(path?.common ?? []), ...(path?.left ?? []), ...(path?.right ?? [])];

        return allPaths.map((d, i) => (
          <motion.path
            key={`${slug}-${i}`}
            d={d}
            fill={fill}
            animate={{ fill }}
            transition={{ duration: 0.5 }}
          />
        ));
      })}
    </svg>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
interface MuscleMapProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export function MuscleMap({ primaryMuscles, secondaryMuscles }: MuscleMapProps) {
  const statusMap = buildStatusMap(primaryMuscles, secondaryMuscles);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Legenda */}
      <div className="flex items-center justify-center gap-5 text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm shadow-sm" style={{ background: PRIMARY_COLOR }} />
          <span className="text-muted-foreground">Primário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: SECONDARY_COLOR }} />
          <span className="text-muted-foreground">Secundário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: NEUTRAL_COLOR }} />
          <span className="text-muted-foreground">Não trabalhado</span>
        </div>
      </div>

      {/* Manequins */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-[280px] mx-auto">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Frente</p>
          <div className="w-full" style={{ aspectRatio: "724/1448" }}>
            <BodySvg parts={FRONT_PARTS} outline={OUTLINE_FRONT} viewBox="0 0 724 1448" statusMap={statusMap} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Costas</p>
          <div className="w-full" style={{ aspectRatio: "724/1448" }}>
            <BodySvg parts={BACK_PARTS} outline={OUTLINE_BACK} viewBox="724 0 724 1448" statusMap={statusMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
