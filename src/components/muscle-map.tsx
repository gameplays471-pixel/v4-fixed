"use client";

import { motion } from "framer-motion";

// Mapeamento de grupos musculares para regiões do SVG
// Cada grupo muscular do banco de dados é mapeado para IDs de paths no SVG
export const MUSCLE_TO_REGION: Record<string, { front?: string[]; back?: string[] }> = {
  Peitoral:     { front: ["chest-l", "chest-r"] },
  Costas:       { back: ["lats-l", "lats-r", "traps-upper", "traps-lower"] },
  Ombros:       { front: ["shoulder-l", "shoulder-r"], back: ["rear-delt-l", "rear-delt-r"] },
  Bíceps:       { front: ["bicep-l", "bicep-r"] },
  Tríceps:      { front: ["tricep-l", "tricep-r"], back: ["tricep-back-l", "tricep-back-r"] },
  Abdômen:      { front: ["abs-upper", "abs-lower", "oblique-l", "oblique-r"] },
  "Quadríceps": { front: ["quad-l", "quad-r"] },
  Pernas:       { front: ["quad-l", "quad-r"], back: ["hamstring-l", "hamstring-r", "calf-l", "calf-r"] },
  Glúteos:      { back: ["glute-l", "glute-r"] },
  Isquiotibiais:{ back: ["hamstring-l", "hamstring-r"] },
  Panturrilha:  { back: ["calf-l", "calf-r"] },
  Trapézio:     { back: ["traps-upper", "traps-lower"] },
  Antebraço:    { front: ["forearm-l", "forearm-r"], back: ["forearm-back-l", "forearm-back-r"] },
  Cardio:       { front: ["chest-l", "chest-r"], back: ["lats-l", "lats-r"] },
};

type MuscleStatus = "primary" | "secondary" | "none";

function getRegionColor(status: MuscleStatus): string {
  switch (status) {
    case "primary":   return "oklch(0.72 0.22 145)";   // verde vivo
    case "secondary": return "oklch(0.80 0.14 145 / 0.55)"; // verde claro semi-transparente
    default:          return "oklch(0.30 0.01 255)";    // cinza escuro
  }
}

function getRegionOpacity(status: MuscleStatus): number {
  return status === "none" ? 0.5 : 1;
}

interface MuscleMapProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

// Computa o mapa de status por ID de região
function buildStatusMap(primary: string[], secondary: string[]): Record<string, MuscleStatus> {
  const map: Record<string, MuscleStatus> = {};

  for (const muscle of secondary) {
    const regions = MUSCLE_TO_REGION[muscle];
    if (!regions) continue;
    const allIds = [...(regions.front ?? []), ...(regions.back ?? [])];
    for (const id of allIds) {
      if (!map[id]) map[id] = "secondary";
    }
  }

  for (const muscle of primary) {
    const regions = MUSCLE_TO_REGION[muscle];
    if (!regions) continue;
    const allIds = [...(regions.front ?? []), ...(regions.back ?? [])];
    for (const id of allIds) {
      map[id] = "primary";
    }
  }

  return map;
}

// ─── SVG FRENTE ──────────────────────────────────────────────────────────────
function BodyFront({ statusMap }: { statusMap: Record<string, MuscleStatus> }) {
  const s = (id: string): MuscleStatus => statusMap[id] ?? "none";
  const c = (id: string) => getRegionColor(s(id));
  const o = (id: string) => getRegionOpacity(s(id));

  return (
    <svg viewBox="0 0 120 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* ── Cabeça ── */}
      <ellipse cx="60" cy="18" rx="14" ry="16" fill="oklch(0.35 0.01 255)" stroke="oklch(0.50 0.01 255)" strokeWidth="0.8"/>
      {/* Pescoço */}
      <rect x="54" y="32" width="12" height="10" rx="3" fill="oklch(0.32 0.01 255)"/>

      {/* ── Ombros ── */}
      <motion.ellipse id="shoulder-l" cx="30" cy="55" rx="11" ry="9"
        fill={c("shoulder-l")} opacity={o("shoulder-l")}
        animate={{ fill: c("shoulder-l") }} transition={{ duration: 0.5 }}/>
      <motion.ellipse id="shoulder-r" cx="90" cy="55" rx="11" ry="9"
        fill={c("shoulder-r")} opacity={o("shoulder-r")}
        animate={{ fill: c("shoulder-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Peito ── */}
      <motion.path id="chest-l" d="M42 50 Q55 48 58 62 L42 66 Q36 60 42 50Z"
        fill={c("chest-l")} opacity={o("chest-l")}
        animate={{ fill: c("chest-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="chest-r" d="M78 50 Q65 48 62 62 L78 66 Q84 60 78 50Z"
        fill={c("chest-r")} opacity={o("chest-r")}
        animate={{ fill: c("chest-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Bíceps ── */}
      <motion.path id="bicep-l" d="M22 60 Q14 70 16 84 L26 84 Q28 70 30 62Z"
        fill={c("bicep-l")} opacity={o("bicep-l")}
        animate={{ fill: c("bicep-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="bicep-r" d="M98 60 Q106 70 104 84 L94 84 Q92 70 90 62Z"
        fill={c("bicep-r")} opacity={o("bicep-r")}
        animate={{ fill: c("bicep-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Tríceps (visível de frente, lateral) ── */}
      <motion.path id="tricep-l" d="M18 64 Q10 74 12 86 L20 84 Q18 74 22 64Z"
        fill={c("tricep-l")} opacity={o("tricep-l")}
        animate={{ fill: c("tricep-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="tricep-r" d="M102 64 Q110 74 108 86 L100 84 Q102 74 98 64Z"
        fill={c("tricep-r")} opacity={o("tricep-r")}
        animate={{ fill: c("tricep-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Antebraço ── */}
      <motion.path id="forearm-l" d="M14 86 Q10 100 12 114 L22 112 Q20 100 22 86Z"
        fill={c("forearm-l")} opacity={o("forearm-l")}
        animate={{ fill: c("forearm-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="forearm-r" d="M106 86 Q110 100 108 114 L98 112 Q100 100 98 86Z"
        fill={c("forearm-r")} opacity={o("forearm-r")}
        animate={{ fill: c("forearm-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Abdômen ── */}
      <motion.path id="abs-upper" d="M44 67 Q60 65 76 67 L76 90 Q60 92 44 90Z"
        fill={c("abs-upper")} opacity={o("abs-upper")}
        animate={{ fill: c("abs-upper") }} transition={{ duration: 0.5 }}/>
      <motion.path id="abs-lower" d="M46 91 Q60 89 74 91 L72 112 Q60 114 48 112Z"
        fill={c("abs-lower")} opacity={o("abs-lower")}
        animate={{ fill: c("abs-lower") }} transition={{ duration: 0.5 }}/>

      {/* Oblíquos */}
      <motion.path id="oblique-l" d="M40 68 Q44 80 44 112 L36 108 Q34 82 38 68Z"
        fill={c("oblique-l")} opacity={o("oblique-l")}
        animate={{ fill: c("oblique-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="oblique-r" d="M80 68 Q76 80 76 112 L84 108 Q86 82 82 68Z"
        fill={c("oblique-r")} opacity={o("oblique-r")}
        animate={{ fill: c("oblique-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Quadríceps ── */}
      <motion.path id="quad-l" d="M46 116 Q38 130 38 160 L54 160 Q56 130 56 118Z"
        fill={c("quad-l")} opacity={o("quad-l")}
        animate={{ fill: c("quad-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="quad-r" d="M74 116 Q82 130 82 160 L66 160 Q64 130 64 118Z"
        fill={c("quad-r")} opacity={o("quad-r")}
        animate={{ fill: c("quad-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Panturrilha (frente, visível) ── */}
      <motion.path id="calf-l" d="M38 164 Q35 178 37 196 L50 196 Q50 178 50 164Z"
        fill={c("calf-l")} opacity={o("calf-l")}
        animate={{ fill: c("calf-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="calf-r" d="M82 164 Q85 178 83 196 L70 196 Q70 178 70 164Z"
        fill={c("calf-r")} opacity={o("calf-r")}
        animate={{ fill: c("calf-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Joelhos / Pés (neutros) ── */}
      <ellipse cx="44" cy="162" rx="8" ry="5" fill="oklch(0.30 0.01 255)" opacity="0.6"/>
      <ellipse cx="76" cy="162" rx="8" ry="5" fill="oklch(0.30 0.01 255)" opacity="0.6"/>
      <rect x="36" y="198" width="16" height="10" rx="4" fill="oklch(0.28 0.01 255)"/>
      <rect x="68" y="198" width="16" height="10" rx="4" fill="oklch(0.28 0.01 255)"/>

      {/* ── Torso/Cintura (fundo) ── */}
      <path d="M40 48 Q60 44 80 48 L84 116 Q60 120 36 116Z" fill="oklch(0.25 0.01 255)" className="-z-10"/>

      {/* Linhas de separação abdômen */}
      <line x1="60" y1="65" x2="60" y2="112" stroke="oklch(0.20 0.01 255)" strokeWidth="0.6" opacity="0.5"/>
      <line x1="44" y1="80" x2="76" y2="80" stroke="oklch(0.20 0.01 255)" strokeWidth="0.6" opacity="0.5"/>
      <line x1="44" y1="96" x2="76" y2="96" stroke="oklch(0.20 0.01 255)" strokeWidth="0.6" opacity="0.5"/>
    </svg>
  );
}

// ─── SVG COSTAS ───────────────────────────────────────────────────────────────
function BodyBack({ statusMap }: { statusMap: Record<string, MuscleStatus> }) {
  const s = (id: string): MuscleStatus => statusMap[id] ?? "none";
  const c = (id: string) => getRegionColor(s(id));
  const o = (id: string) => getRegionOpacity(s(id));

  return (
    <svg viewBox="0 0 120 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Cabeça */}
      <ellipse cx="60" cy="18" rx="14" ry="16" fill="oklch(0.35 0.01 255)" stroke="oklch(0.50 0.01 255)" strokeWidth="0.8"/>
      {/* Pescoço */}
      <rect x="54" y="32" width="12" height="10" rx="3" fill="oklch(0.32 0.01 255)"/>

      {/* ── Trapézio ── */}
      <motion.path id="traps-upper" d="M42 38 Q60 34 78 38 L80 52 Q60 50 40 52Z"
        fill={c("traps-upper")} opacity={o("traps-upper")}
        animate={{ fill: c("traps-upper") }} transition={{ duration: 0.5 }}/>
      <motion.path id="traps-lower" d="M40 52 Q60 50 80 52 L78 70 Q60 68 42 70Z"
        fill={c("traps-lower")} opacity={o("traps-lower")}
        animate={{ fill: c("traps-lower") }} transition={{ duration: 0.5 }}/>

      {/* ── Deltóide posterior ── */}
      <motion.ellipse id="rear-delt-l" cx="30" cy="55" rx="11" ry="9"
        fill={c("rear-delt-l")} opacity={o("rear-delt-l")}
        animate={{ fill: c("rear-delt-l") }} transition={{ duration: 0.5 }}/>
      <motion.ellipse id="rear-delt-r" cx="90" cy="55" rx="11" ry="9"
        fill={c("rear-delt-r")} opacity={o("rear-delt-r")}
        animate={{ fill: c("rear-delt-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Latíssimo ── */}
      <motion.path id="lats-l" d="M40 68 Q30 80 34 106 L46 108 Q44 82 44 68Z"
        fill={c("lats-l")} opacity={o("lats-l")}
        animate={{ fill: c("lats-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="lats-r" d="M80 68 Q90 80 86 106 L74 108 Q76 82 76 68Z"
        fill={c("lats-r")} opacity={o("lats-r")}
        animate={{ fill: c("lats-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Coluna / Rombóides (centro costas) ── */}
      <rect x="52" y="52" width="16" height="58" rx="4" fill="oklch(0.28 0.01 255)"/>
      {/* linhas de vértebra */}
      {[58,66,74,82,96,102].map((y,i) => (
        <line key={i} x1="56" y1={y} x2="64" y2={y} stroke="oklch(0.20 0.01 255)" strokeWidth="0.5" opacity="0.6"/>
      ))}

      {/* ── Tríceps (costas) ── */}
      <motion.path id="tricep-back-l" d="M22 60 Q14 74 16 88 L26 86 Q24 72 28 62Z"
        fill={c("tricep-back-l")} opacity={o("tricep-back-l")}
        animate={{ fill: c("tricep-back-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="tricep-back-r" d="M98 60 Q106 74 104 88 L94 86 Q96 72 92 62Z"
        fill={c("tricep-back-r")} opacity={o("tricep-back-r")}
        animate={{ fill: c("tricep-back-r") }} transition={{ duration: 0.5 }}/>

      {/* Antebraço costas */}
      <motion.path id="forearm-back-l" d="M14 88 Q10 102 12 116 L22 114 Q20 100 20 88Z"
        fill={c("forearm-back-l")} opacity={o("forearm-back-l")}
        animate={{ fill: c("forearm-back-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="forearm-back-r" d="M106 88 Q110 102 108 116 L98 114 Q100 100 100 88Z"
        fill={c("forearm-back-r")} opacity={o("forearm-back-r")}
        animate={{ fill: c("forearm-back-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Glúteos ── */}
      <motion.path id="glute-l" d="M46 112 Q38 118 38 134 L58 134 Q60 118 56 112Z"
        fill={c("glute-l")} opacity={o("glute-l")}
        animate={{ fill: c("glute-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="glute-r" d="M74 112 Q82 118 82 134 L62 134 Q60 118 64 112Z"
        fill={c("glute-r")} opacity={o("glute-r")}
        animate={{ fill: c("glute-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Isquiotibiais ── */}
      <motion.path id="hamstring-l" d="M38 136 Q36 152 38 164 L54 162 Q54 150 50 136Z"
        fill={c("hamstring-l")} opacity={o("hamstring-l")}
        animate={{ fill: c("hamstring-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="hamstring-r" d="M82 136 Q84 152 82 164 L66 162 Q66 150 70 136Z"
        fill={c("hamstring-r")} opacity={o("hamstring-r")}
        animate={{ fill: c("hamstring-r") }} transition={{ duration: 0.5 }}/>

      {/* ── Panturrilha ── */}
      <motion.path id="calf-l" d="M38 166 Q34 180 36 198 L52 198 Q52 182 52 166Z"
        fill={c("calf-l")} opacity={o("calf-l")}
        animate={{ fill: c("calf-l") }} transition={{ duration: 0.5 }}/>
      <motion.path id="calf-r" d="M82 166 Q86 180 84 198 L68 198 Q68 182 68 166Z"
        fill={c("calf-r")} opacity={o("calf-r")}
        animate={{ fill: c("calf-r") }} transition={{ duration: 0.5 }}/>

      {/* Joelhos / Pés */}
      <ellipse cx="44" cy="165" rx="8" ry="4" fill="oklch(0.30 0.01 255)" opacity="0.6"/>
      <ellipse cx="76" cy="165" rx="8" ry="4" fill="oklch(0.30 0.01 255)" opacity="0.6"/>
      <rect x="36" y="200" width="16" height="10" rx="4" fill="oklch(0.28 0.01 255)"/>
      <rect x="68" y="200" width="16" height="10" rx="4" fill="oklch(0.28 0.01 255)"/>

      {/* Torso fundo */}
      <path d="M40 48 Q60 44 80 48 L84 116 Q60 120 36 116Z" fill="oklch(0.25 0.01 255)" className="-z-10"/>
    </svg>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function MuscleMap({ primaryMuscles, secondaryMuscles }: MuscleMapProps) {
  const statusMap = buildStatusMap(primaryMuscles, secondaryMuscles);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Legenda */}
      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.72 0.22 145)" }} />
          <span className="text-muted-foreground">Primário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.80 0.14 145 / 0.55)" }} />
          <span className="text-muted-foreground">Secundário</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "oklch(0.30 0.01 255)" }} />
          <span className="text-muted-foreground">Não trabalhado</span>
        </div>
      </div>

      {/* Manequins */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-xs mx-auto">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Frente</p>
          <div className="h-48">
            <BodyFront statusMap={statusMap} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Costas</p>
          <div className="h-48">
            <BodyBack statusMap={statusMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
