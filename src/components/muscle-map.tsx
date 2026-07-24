"use client";

import { motion } from "framer-motion";

export const MUSCLE_TO_REGION: Record<string, { front?: string[]; back?: string[] }> = {
  Peitoral:      { front: ["chest-l", "chest-r"] },
  Costas:        { back: ["lats-l", "lats-r", "traps"] },
  Ombros:        { front: ["delt-front-l", "delt-front-r"], back: ["delt-back-l", "delt-back-r"] },
  Bíceps:        { front: ["bicep-l", "bicep-r"] },
  Tríceps:       { back: ["tricep-l", "tricep-r"] },
  Abdômen:       { front: ["abs"] },
  "Quadríceps":  { front: ["quad-l", "quad-r"] },
  Pernas:        { front: ["quad-l", "quad-r"], back: ["hamstring-l", "hamstring-r", "calf-l", "calf-r"] },
  Glúteos:       { back: ["glute-l", "glute-r"] },
  Isquiotibiais: { back: ["hamstring-l", "hamstring-r"] },
  Panturrilha:   { back: ["calf-l", "calf-r"] },
  Trapézio:      { back: ["traps"] },
  Antebraço:     { front: ["forearm-l", "forearm-r"], back: ["forearm-back-l", "forearm-back-r"] },
  Cardio:        { front: ["chest-l", "chest-r", "abs"], back: ["lats-l", "lats-r"] },
};

type MuscleStatus = "primary" | "secondary" | "none";

function buildStatusMap(primary: string[], secondary: string[]): Record<string, MuscleStatus> {
  const map: Record<string, MuscleStatus> = {};
  for (const m of secondary) {
    const r = MUSCLE_TO_REGION[m];
    if (!r) continue;
    for (const id of [...(r.front ?? []), ...(r.back ?? [])]) {
      if (!map[id]) map[id] = "secondary";
    }
  }
  for (const m of primary) {
    const r = MUSCLE_TO_REGION[m];
    if (!r) continue;
    for (const id of [...(r.front ?? []), ...(r.back ?? [])]) {
      map[id] = "primary";
    }
  }
  return map;
}

const PRIMARY_COLOR = "#22c55e";
const PRIMARY_STROKE = "#4ade80";
const SECONDARY_COLOR = "rgba(134,239,172,0.5)";
const NEUTRAL_COLOR = "rgba(100,116,139,0.25)";
const BODY_COLOR = "rgba(51,65,85,0.55)";
const OUTLINE = "rgba(148,163,184,0.16)";

function color(s: MuscleStatus) {
  if (s === "primary") return PRIMARY_COLOR;
  if (s === "secondary") return SECONDARY_COLOR;
  return NEUTRAL_COLOR;
}

interface RegionProps {
  id: string;
  statusMap: Record<string, MuscleStatus>;
  d: string;
}

// Região muscular individual, com leve brilho quando é o alvo primário do treino.
function R({ id, statusMap, d }: RegionProps) {
  const s = statusMap[id] ?? "none";
  return (
    <motion.path
      d={d}
      fill={color(s)}
      stroke={s === "primary" ? PRIMARY_STROKE : "transparent"}
      strokeWidth={s === "primary" ? 0.5 : 0}
      strokeLinejoin="round"
      initial={false}
      animate={{
        fill: color(s),
        stroke: s === "primary" ? PRIMARY_STROKE : "rgba(74,222,128,0)",
        filter: s === "primary" ? "drop-shadow(0 0 2.5px rgba(34,197,94,0.65))" : "drop-shadow(0 0 0px rgba(34,197,94,0))",
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    />
  );
}

// ─── SILHUETA BASE (compartilhada entre frente e costas) ─────────────────────
function BaseBody() {
  return (
    <g fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.6">
      {/* Cabeça */}
      <path d="M60 6 C67 6 72 12 72 20 C72 26 70 31 66 34 C66 34 66 37 68 39 C64 41 56 41 52 39 C54 37 54 34 54 34 C50 31 48 26 48 20 C48 12 53 6 60 6 Z" />
      {/* Pescoço */}
      <path d="M52 38 C54 40 57 41.5 60 41.5 C63 41.5 66 40 68 38 L69 45 C65 47.5 55 47.5 51 45 Z" />
      {/* Tronco */}
      <path
        d="M60 44 C71 44 80 46.5 86 50 C88.5 58 89.5 68 89 78 C88.6 86 86.5 93 83 99 C83.6 106 83.8 112.5 83 118 C77.5 122.5 69 125 60 125 C51 125 42.5 122.5 37 118 C36.2 112.5 36.4 106 37 99 C33.5 93 31.4 86 31 78 C30.5 68 31.5 58 34 50 C40 46.5 49 44 60 44 Z"
      />
      {/* Braço esquerdo (completo, com mão) */}
      <path
        d="M37 50 C29 53.5 23.5 60 20.5 68.5 C18 75.5 17.5 83 18.5 90 C15.5 98 14 108 14.5 118 C14.7 123.5 15.7 128.5 17.5 132.5 C19.5 134.5 22.5 135 24.5 133 C23 128.5 22.3 123.5 22.3 118.5 C22.3 109.5 24 100.5 27 92.5 C26.3 85.5 26.8 78.5 29 71.5 C31 65 34.5 59.5 39.5 55.5 Z"
      />
      <ellipse cx="21" cy="139" rx="5.2" ry="7" />
      {/* Braço direito */}
      <path
        d="M83 50 C91 53.5 96.5 60 99.5 68.5 C102 75.5 102.5 83 101.5 90 C104.5 98 106 108 105.5 118 C105.3 123.5 104.3 128.5 102.5 132.5 C100.5 134.5 97.5 135 95.5 133 C97 128.5 97.7 123.5 97.7 118.5 C97.7 109.5 96 100.5 93 92.5 C93.7 85.5 93.2 78.5 91 71.5 C89 65 85.5 59.5 80.5 55.5 Z"
      />
      <ellipse cx="99" cy="139" rx="5.2" ry="7" />
      {/* Quadril */}
      <path d="M37 118 C42.5 122.5 51 125 60 125 C69 125 77.5 122.5 83 118 L84.5 130 C77 135.5 68.5 138 60 138 C51.5 138 43 135.5 35.5 130 Z" />
      {/* Perna esquerda (coxa + canela + pé) */}
      <path
        d="M35.5 130 C43 135.5 51.5 138 60 138 L58.5 196 C58.2 202 55.5 207 51 208 C46.5 209 42.7 206 41 201 C39.8 193 39 185 38.5 176 C38 163 37 148 35.5 130 Z"
      />
      <ellipse cx="49.5" cy="204" rx="8" ry="6" />
      <path d="M42.5 205 C41.2 214 40.7 224 41 234 C41.2 240 43.5 244.5 47.5 245.5 C51.5 246.5 55 243.5 56 238.5 C57 229 57.5 218 57 208 Z" />
      <path d="M42 238 C43 243 46 246 49.5 246.5 C53.5 247 56.5 244.5 57 240 L57.5 246 C57 250 53.5 253 49 253 C44.5 253 41.5 250.5 41 247 Z" />
      {/* Perna direita */}
      <path
        d="M84.5 130 C77 135.5 68.5 138 60 138 L61.5 196 C61.8 202 64.5 207 69 208 C73.5 209 77.3 206 79 201 C80.2 193 81 185 81.5 176 C82 163 83 148 84.5 130 Z"
      />
      <ellipse cx="70.5" cy="204" rx="8" ry="6" />
      <path d="M77.5 205 C78.8 214 79.3 224 79 234 C78.8 240 76.5 244.5 72.5 245.5 C68.5 246.5 65 243.5 64 238.5 C63 229 62.5 218 63 208 Z" />
      <path d="M78 238 C77 243 74 246 70.5 246.5 C66.5 247 63.5 244.5 63 240 L62.5 246 C63 250 66.5 253 71 253 C75.5 253 78.5 250.5 79 247 Z" />
    </g>
  );
}

// ─── FRENTE ───────────────────────────────────────────────────────────────────
function BodyFront({ statusMap }: { statusMap: Record<string, MuscleStatus> }) {
  return (
    <svg viewBox="0 0 120 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
      <BaseBody />

      {/* --- REGIÕES MUSCULARES --- */}
      <R id="delt-front-l" statusMap={statusMap} d="M39.5 55.5 C35 58.5 31.5 63 29.5 68 C31.5 70 34 71 36.5 70.5 C37 65 38.5 60 41 56.5 Z" />
      <R id="delt-front-r" statusMap={statusMap} d="M80.5 55.5 C85 58.5 88.5 63 90.5 68 C88.5 70 86 71 83.5 70.5 C83 65 81.5 60 79 56.5 Z" />
      <R id="chest-l" statusMap={statusMap} d="M42 52 C47.5 49 53.5 48 59 48.5 L59 71 C53 72.5 47 71.5 42.5 68 C41 63 41 57 42 52 Z" />
      <R id="chest-r" statusMap={statusMap} d="M78 52 C72.5 49 66.5 48 61 48.5 L61 71 C67 72.5 73 71.5 77.5 68 C79 63 79 57 78 52 Z" />
      <R id="bicep-l" statusMap={statusMap} d="M29 71.5 C26 76.5 24.3 82.5 24 89 C23.8 93.5 24.3 97.5 25.5 100.5 L29.5 99 C28.5 95.5 28 91.5 28.2 87 C28.4 81.5 29.7 76.5 32 72.5 Z" />
      <R id="bicep-r" statusMap={statusMap} d="M91 71.5 C94 76.5 95.7 82.5 96 89 C96.2 93.5 95.7 97.5 94.5 100.5 L90.5 99 C91.5 95.5 92 91.5 91.8 87 C91.6 81.5 90.3 76.5 88 72.5 Z" />
      <R id="forearm-l" statusMap={statusMap} d="M22.5 102 C20.3 108 19.3 114.5 19.6 121 C19.8 125 20.5 128.5 21.7 131 L25.5 129.5 C24.6 126.5 24.1 123 24 119.5 C23.8 114 24.6 108.5 26.3 103.5 Z" />
      <R id="forearm-r" statusMap={statusMap} d="M97.5 102 C99.7 108 100.7 114.5 100.4 121 C100.2 125 99.5 128.5 98.3 131 L94.5 129.5 C95.4 126.5 95.9 123 96 119.5 C96.2 114 95.4 108.5 93.7 103.5 Z" />
      <R id="abs" statusMap={statusMap} d="M45 75 C50 73 55 72.3 60 72.3 C65 72.3 70 73 75 75 L74 113 C68 117 60 118.5 60 118.5 C60 118.5 52 117 46 113 Z" />
      <R id="quad-l" statusMap={statusMap} d="M38.5 141 C43.5 144 49 146 55 146.5 L54 187 C51.5 193 46.5 194.5 43 191.5 C40.5 187 39.3 180 38.5 172 C37.7 162 38 151.5 38.5 141 Z" />
      <R id="quad-r" statusMap={statusMap} d="M81.5 141 C76.5 144 71 146 65 146.5 L66 187 C68.5 193 73.5 194.5 77 191.5 C79.5 187 80.7 180 81.5 172 C82.3 162 82 151.5 81.5 141 Z" />

      {/* Detalhes do abdômen */}
      <g stroke="rgba(0,0,0,0.22)" strokeWidth="0.6" strokeLinecap="round">
        <line x1="60" y1="73" x2="60" y2="117" />
        <line x1="48" y1="85" x2="72" y2="85" />
        <line x1="47" y1="97" x2="73" y2="97" />
        <line x1="47.5" y1="108" x2="72.5" y2="108" />
      </g>
    </svg>
  );
}

// ─── COSTAS ───────────────────────────────────────────────────────────────────
function BodyBack({ statusMap }: { statusMap: Record<string, MuscleStatus> }) {
  return (
    <svg viewBox="0 0 120 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
      <BaseBody />

      {/* --- REGIÕES MUSCULARES --- */}
      <R id="traps" statusMap={statusMap} d="M50 44.5 C53.5 43.5 57 43 60 43 C63 43 66.5 43.5 70 44.5 L74 55 C69.5 52.5 65 51.5 60 51.5 C55 51.5 50.5 52.5 46 55 Z" />
      <R id="delt-back-l" statusMap={statusMap} d="M39.5 55.5 C35 58.5 31.5 63 29.5 68 C31.5 70 34 71 36.5 70.5 C37 65 38.5 60 41 56.5 Z" />
      <R id="delt-back-r" statusMap={statusMap} d="M80.5 55.5 C85 58.5 88.5 63 90.5 68 C88.5 70 86 71 83.5 70.5 C83 65 81.5 60 79 56.5 Z" />
      <R id="lats-l" statusMap={statusMap} d="M35.5 58 C33.5 65 32.3 73 32 81 C31.7 88 32.4 94 34 99 L39.5 96.5 C38.2 91 37.7 85 38 79 C38.3 71.5 39.5 64.5 41.5 58.5 Z" />
      <R id="lats-r" statusMap={statusMap} d="M84.5 58 C86.5 65 87.7 73 88 81 C88.3 88 87.6 94 86 99 L80.5 96.5 C81.8 91 82.3 85 82 79 C81.7 71.5 80.5 64.5 78.5 58.5 Z" />
      <R id="tricep-l" statusMap={statusMap} d="M29 71.5 C26 76.5 24.3 82.5 24 89 C23.8 93.5 24.3 97.5 25.5 100.5 L29.5 99 C28.5 95.5 28 91.5 28.2 87 C28.4 81.5 29.7 76.5 32 72.5 Z" />
      <R id="tricep-r" statusMap={statusMap} d="M91 71.5 C94 76.5 95.7 82.5 96 89 C96.2 93.5 95.7 97.5 94.5 100.5 L90.5 99 C91.5 95.5 92 91.5 91.8 87 C91.6 81.5 90.3 76.5 88 72.5 Z" />
      <R id="forearm-back-l" statusMap={statusMap} d="M22.5 102 C20.3 108 19.3 114.5 19.6 121 C19.8 125 20.5 128.5 21.7 131 L25.5 129.5 C24.6 126.5 24.1 123 24 119.5 C23.8 114 24.6 108.5 26.3 103.5 Z" />
      <R id="forearm-back-r" statusMap={statusMap} d="M97.5 102 C99.7 108 100.7 114.5 100.4 121 C100.2 125 99.5 128.5 98.3 131 L94.5 129.5 C95.4 126.5 95.9 123 96 119.5 C96.2 114 95.4 108.5 93.7 103.5 Z" />
      <R id="glute-l" statusMap={statusMap} d="M38.5 120.5 C44 123.7 51.5 126 59.5 126.3 L59 140 C54 142.5 47.5 141.5 43 137 C40 133.5 38.5 127.5 38.5 120.5 Z" />
      <R id="glute-r" statusMap={statusMap} d="M81.5 120.5 C76 123.7 68.5 126 60.5 126.3 L61 140 C66 142.5 72.5 141.5 77 137 C80 133.5 81.5 127.5 81.5 120.5 Z" />
      <R id="hamstring-l" statusMap={statusMap} d="M38.7 143 C43.7 145.7 49.2 147.3 55 147.7 L54 187 C51.5 193 46.5 194.5 43 191.5 C40.5 187 39.3 180 38.5 172 C38.2 162.3 38.3 152.5 38.7 143 Z" />
      <R id="hamstring-r" statusMap={statusMap} d="M81.3 143 C76.3 145.7 70.8 147.3 65 147.7 L66 187 C68.5 193 73.5 194.5 77 191.5 C79.5 187 80.7 180 81.5 172 C81.8 162.3 81.7 152.5 81.3 143 Z" />
      <R id="calf-l" statusMap={statusMap} d="M42.7 209 C41.6 216 41 224 41.2 232 C41.4 238 43.5 243 47.3 244.3 C51.2 245.5 54.8 242.6 55.8 237.5 C56.8 229 57.3 219 56.8 209.5 Z" />
      <R id="calf-r" statusMap={statusMap} d="M77.3 209 C78.4 216 79 224 78.8 232 C78.6 238 76.5 243 72.7 244.3 C68.8 245.5 65.2 242.6 64.2 237.5 C63.2 229 62.7 219 63.2 209.5 Z" />

      {/* Coluna vertebral */}
      <line x1="60" y1="43" x2="60" y2="126" stroke="rgba(0,0,0,0.28)" strokeWidth="0.8" strokeDasharray="1.5 2.5" strokeLinecap="round" />
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
          <div className="w-3 h-3 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.6)]" style={{ background: PRIMARY_COLOR }} />
          <span className="text-muted-foreground">Primário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: SECONDARY_COLOR }} />
          <span className="text-muted-foreground">Secundário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: NEUTRAL_COLOR }} />
          <span className="text-muted-foreground">Não trabalhado</span>
        </div>
      </div>

      {/* Manequins */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-[280px] mx-auto">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Frente</p>
          <div className="w-full" style={{ aspectRatio: "120/260" }}>
            <BodyFront statusMap={statusMap} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Costas</p>
          <div className="w-full" style={{ aspectRatio: "120/260" }}>
            <BodyBack statusMap={statusMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
