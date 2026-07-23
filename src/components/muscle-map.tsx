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
const SECONDARY_COLOR = "rgba(134,239,172,0.55)";
const NEUTRAL_COLOR = "rgba(100,116,139,0.28)";
const BODY_COLOR = "rgba(51,65,85,0.55)";
const OUTLINE = "rgba(148,163,184,0.18)";

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

function R({ id, statusMap, d }: RegionProps) {
  const s = statusMap[id] ?? "none";
  return (
    <motion.path
      d={d}
      fill={color(s)}
      animate={{ fill: color(s) }}
      transition={{ duration: 0.5 }}
    />
  );
}

// ─── FRENTE ───────────────────────────────────────────────────────────────────
function BodyFront({ statusMap }: { statusMap: Record<string, MuscleStatus> }) {
  return (
    <svg viewBox="0 0 120 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* --- SILHUETA BASE (corpo inteiro) --- */}
      {/* Cabeça */}
      <ellipse cx="60" cy="17" rx="12" ry="14" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.8"/>
      {/* Pescoço */}
      <path d="M55 29 Q57 32 60 33 Q63 32 65 29 L66 36 Q63 38 60 38.5 Q57 38 54 36Z" fill={BODY_COLOR}/>
      {/* Tronco */}
      <path d="M38 40 Q48 37 60 37 Q72 37 82 40 L86 82 Q83 90 80 95 L78 118 Q69 122 60 122 Q51 122 42 118 L40 95 Q37 90 34 82Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Braço esquerdo */}
      <path d="M38 42 Q28 46 24 56 Q20 68 22 82 L28 80 Q27 68 30 58 Q33 50 40 47Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Antebraço esquerdo */}
      <path d="M22 82 Q19 94 20 108 L26 108 Q25 96 28 84Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Mão esquerda */}
      <ellipse cx="23" cy="111" rx="4" ry="5.5" fill={BODY_COLOR}/>
      {/* Braço direito */}
      <path d="M82 42 Q92 46 96 56 Q100 68 98 82 L92 80 Q93 68 90 58 Q87 50 80 47Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Antebraço direito */}
      <path d="M98 82 Q101 94 100 108 L94 108 Q95 96 92 84Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Mão direita */}
      <ellipse cx="97" cy="111" rx="4" ry="5.5" fill={BODY_COLOR}/>
      {/* Quadril/cintura */}
      <path d="M42 118 Q51 122 60 122 Q69 122 78 118 L80 128 Q70 133 60 133 Q50 133 40 128Z" fill={BODY_COLOR}/>
      {/* Perna esquerda */}
      <path d="M40 128 Q50 133 60 133 L58 185 Q55 192 52 192 L46 192 Q42 192 40 185Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Joelho esquerdo */}
      <ellipse cx="49" cy="188" rx="7" ry="5" fill={BODY_COLOR}/>
      {/* Canela esquerda */}
      <path d="M42 192 Q43 210 44 224 Q47 228 50 228 Q53 228 55 224 Q56 210 57 192Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Pé esquerdo */}
      <path d="M43 224 Q46 230 50 231 Q54 230 57 226 L56 232 Q52 236 48 234 Q44 232 43 228Z" fill={BODY_COLOR}/>
      {/* Perna direita */}
      <path d="M80 128 Q70 133 60 133 L62 185 Q65 192 68 192 L74 192 Q78 192 80 185Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Joelho direito */}
      <ellipse cx="71" cy="188" rx="7" ry="5" fill={BODY_COLOR}/>
      {/* Canela direita */}
      <path d="M63 192 Q64 210 65 224 Q67 228 70 228 Q73 228 76 224 Q77 210 77 192Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      {/* Pé direito */}
      <path d="M63 224 Q66 230 70 231 Q74 230 77 226 L76 232 Q72 236 68 234 Q64 232 63 228Z" fill={BODY_COLOR}/>

      {/* --- REGIÕES MUSCULARES --- */}
      {/* Deltóide frente esquerdo */}
      <R id="delt-front-l" statusMap={statusMap} d="M38 42 Q31 46 28 52 Q27 58 30 62 Q34 56 38 52 Q40 48 40 44Z"/>
      {/* Deltóide frente direito */}
      <R id="delt-front-r" statusMap={statusMap} d="M82 42 Q89 46 92 52 Q93 58 90 62 Q86 56 82 52 Q80 48 80 44Z"/>
      {/* Peitoral esquerdo */}
      <R id="chest-l" statusMap={statusMap} d="M40 47 Q48 44 58 45 L58 64 Q50 66 42 63 Q39 58 40 52Z"/>
      {/* Peitoral direito */}
      <R id="chest-r" statusMap={statusMap} d="M80 47 Q72 44 62 45 L62 64 Q70 66 78 63 Q81 58 80 52Z"/>
      {/* Bícep esquerdo */}
      <R id="bicep-l" statusMap={statusMap} d="M28 52 Q22 60 23 72 Q23 77 26 80 L30 78 Q28 72 28 64 Q28 58 31 54Z"/>
      {/* Bícep direito */}
      <R id="bicep-r" statusMap={statusMap} d="M92 52 Q98 60 97 72 Q97 77 94 80 L90 78 Q92 72 92 64 Q92 58 89 54Z"/>
      {/* Antebraço esquerdo */}
      <R id="forearm-l" statusMap={statusMap} d="M23 82 Q20 92 21 104 L25 104 Q25 93 27 83Z"/>
      {/* Antebraço direito */}
      <R id="forearm-r" statusMap={statusMap} d="M97 82 Q100 92 99 104 L95 104 Q95 93 93 83Z"/>
      {/* Abdômen */}
      <R id="abs" statusMap={statusMap} d="M44 67 Q52 65 60 65 Q68 65 76 67 L75 114 Q68 118 60 118 Q52 118 45 114Z"/>
      {/* Quadríceps esquerdo */}
      <R id="quad-l" statusMap={statusMap} d="M42 130 Q51 133 59 133 L57 182 Q54 187 49 185 Q44 182 42 176Z"/>
      {/* Quadríceps direito */}
      <R id="quad-r" statusMap={statusMap} d="M78 130 Q69 133 61 133 L63 182 Q66 187 71 185 Q76 182 78 176Z"/>

      {/* Linha central e detalhes do abdômen */}
      <line x1="60" y1="65" x2="60" y2="115" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8"/>
      <line x1="45" y1="80" x2="75" y2="80" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6"/>
      <line x1="45" y1="94" x2="75" y2="94" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6"/>
      <line x1="45" y1="107" x2="75" y2="107" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6"/>
    </svg>
  );
}

// ─── COSTAS ───────────────────────────────────────────────────────────────────
function BodyBack({ statusMap }: { statusMap: Record<string, MuscleStatus> }) {
  return (
    <svg viewBox="0 0 120 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* --- SILHUETA BASE --- */}
      <ellipse cx="60" cy="17" rx="12" ry="14" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.8"/>
      <path d="M55 29 Q57 32 60 33 Q63 32 65 29 L66 36 Q63 38 60 38.5 Q57 38 54 36Z" fill={BODY_COLOR}/>
      <path d="M38 40 Q48 37 60 37 Q72 37 82 40 L86 82 Q83 90 80 95 L78 118 Q69 122 60 122 Q51 122 42 118 L40 95 Q37 90 34 82Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <path d="M38 42 Q28 46 24 56 Q20 68 22 82 L28 80 Q27 68 30 58 Q33 50 40 47Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <path d="M22 82 Q19 94 20 108 L26 108 Q25 96 28 84Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <ellipse cx="23" cy="111" rx="4" ry="5.5" fill={BODY_COLOR}/>
      <path d="M82 42 Q92 46 96 56 Q100 68 98 82 L92 80 Q93 68 90 58 Q87 50 80 47Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <path d="M98 82 Q101 94 100 108 L94 108 Q95 96 92 84Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <ellipse cx="97" cy="111" rx="4" ry="5.5" fill={BODY_COLOR}/>
      <path d="M42 118 Q51 122 60 122 Q69 122 78 118 L80 128 Q70 133 60 133 Q50 133 40 128Z" fill={BODY_COLOR}/>
      <path d="M40 128 Q50 133 60 133 L58 185 Q55 192 52 192 L46 192 Q42 192 40 185Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <ellipse cx="49" cy="188" rx="7" ry="5" fill={BODY_COLOR}/>
      <path d="M42 192 Q43 210 44 224 Q47 228 50 228 Q53 228 55 224 Q56 210 57 192Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <path d="M43 224 Q46 230 50 231 Q54 230 57 226 L56 232 Q52 236 48 234 Q44 232 43 228Z" fill={BODY_COLOR}/>
      <path d="M80 128 Q70 133 60 133 L62 185 Q65 192 68 192 L74 192 Q78 192 80 185Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <ellipse cx="71" cy="188" rx="7" ry="5" fill={BODY_COLOR}/>
      <path d="M63 192 Q64 210 65 224 Q67 228 70 228 Q73 228 76 224 Q77 210 77 192Z" fill={BODY_COLOR} stroke={OUTLINE} strokeWidth="0.5"/>
      <path d="M63 224 Q66 230 70 231 Q74 230 77 226 L76 232 Q72 236 68 234 Q64 232 63 228Z" fill={BODY_COLOR}/>

      {/* --- REGIÕES MUSCULARES --- */}
      {/* Trapézio */}
      <R id="traps" statusMap={statusMap} d="M44 38 Q52 36 60 36 Q68 36 76 38 L80 52 Q72 50 60 50 Q48 50 40 52Z"/>
      {/* Deltóide costas esquerdo */}
      <R id="delt-back-l" statusMap={statusMap} d="M38 42 Q30 46 27 53 Q26 60 29 64 Q33 58 38 54 Q40 50 40 45Z"/>
      {/* Deltóide costas direito */}
      <R id="delt-back-r" statusMap={statusMap} d="M82 42 Q90 46 93 53 Q94 60 91 64 Q87 58 82 54 Q80 50 80 45Z"/>
      {/* Latíssimo esquerdo */}
      <R id="lats-l" statusMap={statusMap} d="M40 52 Q36 62 35 74 Q34 86 37 94 L42 92 Q40 80 41 68 Q42 58 44 53Z"/>
      {/* Latíssimo direito */}
      <R id="lats-r" statusMap={statusMap} d="M80 52 Q84 62 85 74 Q86 86 83 94 L78 92 Q80 80 79 68 Q78 58 76 53Z"/>
      {/* Trícep esquerdo */}
      <R id="tricep-l" statusMap={statusMap} d="M28 52 Q23 60 22 72 Q22 78 25 82 L29 80 Q27 74 27 66 Q27 58 31 54Z"/>
      {/* Trícep direito */}
      <R id="tricep-r" statusMap={statusMap} d="M92 52 Q97 60 98 72 Q98 78 95 82 L91 80 Q93 74 93 66 Q93 58 89 54Z"/>
      {/* Antebraço costas esq */}
      <R id="forearm-back-l" statusMap={statusMap} d="M22 82 Q19 93 20 105 L24 105 Q24 94 26 83Z"/>
      {/* Antebraço costas dir */}
      <R id="forearm-back-r" statusMap={statusMap} d="M98 82 Q101 93 100 105 L96 105 Q96 94 94 83Z"/>
      {/* Glúteo esquerdo */}
      <R id="glute-l" statusMap={statusMap} d="M42 120 Q51 123 60 123 L59 142 Q53 144 48 140 Q42 135 41 128Z"/>
      {/* Glúteo direito */}
      <R id="glute-r" statusMap={statusMap} d="M78 120 Q69 123 60 123 L61 142 Q67 144 72 140 Q78 135 79 128Z"/>
      {/* Isquiotibial esquerdo */}
      <R id="hamstring-l" statusMap={statusMap} d="M41 142 Q49 146 59 145 L57 182 Q53 186 48 183 Q42 179 41 170Z"/>
      {/* Isquiotibial direito */}
      <R id="hamstring-r" statusMap={statusMap} d="M79 142 Q71 146 61 145 L63 182 Q67 186 72 183 Q78 179 79 170Z"/>
      {/* Panturrilha esquerda */}
      <R id="calf-l" statusMap={statusMap} d="M42 193 Q44 208 45 220 Q48 226 51 225 Q53 224 55 220 Q56 208 57 193Z"/>
      {/* Panturrilha direita */}
      <R id="calf-r" statusMap={statusMap} d="M63 193 Q64 208 65 220 Q68 226 70 225 Q73 224 75 220 Q76 208 77 193Z"/>

      {/* Coluna vertebral */}
      <line x1="60" y1="38" x2="60" y2="120" stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeDasharray="2 3"/>
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
