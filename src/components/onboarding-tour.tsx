"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dumbbell,
  Plus,
  Play,
  Check,
  Trophy,
  TrendingUp,
  Flame,
  Share2,
  Star,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

interface OnboardingTourProps {
  open: boolean;
  /** Fechar sem concluir (botão "Pular" ou X) — some por agora, mas volta a
   *  aparecer no próximo login. */
  onSkip: () => void;
  /** Concluir o tour normalmente, pelo último botão — mesmo assim volta a
   *  aparecer no próximo login. */
  onFinish: () => void;
  /** Opt-out permanente: só essa ação impede o tour de aparecer nos
   *  próximos logins. */
  onNeverShowAgain: () => void;
}

// ── Mockups ilustrativos de cada etapa ────────────────────────────────
// Não são componentes reais conectados à API — são só uma prévia estática
// pra dar contexto visual de como cada tela funciona, com dados de
// exemplo (não são dados do usuário).

function CreateWorkoutMock() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card p-4 text-left shadow-xl">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Novo treino
      </p>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
          style={{ background: "oklch(0.72 0.18 25)" }}
        >
          A
        </div>
        <div className="h-9 flex-1 rounded-xl border border-border bg-muted/40 flex items-center px-3 text-sm font-semibold truncate">
          Treino A — Peito e Tríceps
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { name: "Supino reto", sets: "4×10" },
          { name: "Crucifixo", sets: "3×12" },
          { name: "Tríceps corda", sets: "3×15" },
        ].map((ex) => (
          <div
            key={ex.name}
            className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
          >
            <span className="font-medium truncate">{ex.name}</span>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">{ex.sets}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <Plus className="w-3.5 h-3.5" /> Adicionar exercício
        </div>
      </div>
    </div>
  );
}

function LogSetsMock() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card p-4 text-left shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold">Supino reto</p>
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          02:14 restantes
        </span>
      </div>
      <div className="grid grid-cols-[1.5rem_1fr_1fr_auto] gap-2 items-center mb-1.5 px-0.5">
        <span className="text-[10px] text-muted-foreground text-center">#</span>
        <span className="text-[10px] text-muted-foreground text-center">kg</span>
        <span className="text-[10px] text-muted-foreground text-center">reps</span>
        <span className="w-8" />
      </div>
      <div className="space-y-1.5">
        <div className="grid grid-cols-[1.5rem_1fr_1fr_auto] gap-2 items-center rounded-xl bg-primary/10 border border-primary/15 px-1.5 py-1.5">
          <span className="text-center text-sm font-bold text-muted-foreground">1</span>
          <span className="h-9 rounded-lg bg-background flex items-center justify-center text-sm font-bold">60</span>
          <span className="h-9 rounded-lg bg-background flex items-center justify-center text-sm font-bold">10</span>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 -mt-0.5 ml-8">
          <Trophy className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-semibold text-amber-400">Novo recorde pessoal!</span>
        </div>
        <div className="grid grid-cols-[1.5rem_1fr_1fr_auto] gap-2 items-center rounded-xl px-1.5 py-1.5 hover:bg-muted/30">
          <span className="text-center text-sm font-bold text-muted-foreground">2</span>
          <span className="h-9 rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground/50">60</span>
          <span className="h-9 rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground/50">10</span>
          <div className="w-8 h-8 rounded-lg border border-border shrink-0" />
        </div>
      </div>
    </div>
  );
}

function HistoryStatsMock() {
  return (
    <div className="w-full space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Flame className="w-4 h-4 text-orange-400" />, value: "5d", label: "Sequência" },
          { icon: <Dumbbell className="w-4 h-4 text-primary" />, value: "12", label: "Treinos" },
          { icon: <TrendingUp className="w-4 h-4 text-sky-400" />, value: "3.2t", label: "Volume" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card p-2.5 text-center shadow-sm">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className="text-sm font-black tabular-nums">{s.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/60 bg-card shadow-xl divide-y divide-border/40 overflow-hidden">
        {[
          { name: "Treino A — Peito e Tríceps", when: "Hoje", vol: "2.180 kg", pr: true },
          { name: "Treino B — Costas e Bíceps", when: "Ontem", vol: "1.960 kg", pr: false },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between px-3 py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold truncate">{s.name}</p>
                {s.pr && <Trophy className="w-3 h-3 text-amber-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-muted-foreground">{s.when}</p>
            </div>
            <p className="text-xs font-bold tabular-nums shrink-0 ml-2">{s.vol}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mock estático do cartão de compartilhamento. Espelha o visual do
 * `share-workout-card.tsx` em miniatura, com dados de exemplo — não está
 * conectado à API, é só pra dar contexto visual de como o card gerado
 * fica antes da pessoa decidir usar o recurso.
 */
function ShareCardMock() {
  return (
    <div
      className="w-full max-w-[230px] mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      style={{
        background: "linear-gradient(160deg, #0a0c10 0%, #10131a 45%, #0b0f0d 100%)",
        fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)",
      }}
    >
      <div className="px-3.5 pt-3.5 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-green-500/20 flex items-center justify-center">
            <Dumbbell className="w-2.5 h-2.5 text-green-400" />
          </div>
          <span className="text-[9px] font-extrabold tracking-wide text-white/90">GEMgym</span>
        </div>
        <span className="text-[8px] font-semibold text-white/50">Hoje</span>
      </div>

      <div className="text-center px-3.5">
        <div className="w-8 h-8 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center shadow-[0_0_18px_rgba(34,197,94,0.4)]">
          <Trophy className="w-4 h-4 text-green-400" />
        </div>
        <p className="mt-1.5 text-[11px] font-black text-white tracking-wide">TREINO CONCLUÍDO</p>
        <p className="text-[10px] font-semibold text-white/65">Peito &amp; Tríceps</p>

        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/35 text-yellow-300 text-[8px] font-extrabold">
          <Star className="w-2 h-2 fill-current" /> 2 novos recordes
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 px-3.5 mt-2.5">
        {[
          { label: "duração", value: "52min" },
          { label: "volume", value: "2.1k" },
          { label: "séries", value: "16" },
          { label: "PRs", value: "2" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-white/5 border border-white/10 py-1.5 text-center">
            <p className="text-[10px] font-black text-white tabular-nums leading-none">{s.value}</p>
            <p className="text-[7px] font-bold text-white/50 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-3.5 py-2.5 grid grid-cols-2 gap-1">
        {[
          { count: "4×", name: "Supino Reto" },
          { count: "3×", name: "Crucifixo" },
          { count: "3×", name: "Paralelas" },
          { count: "3×", name: "Tríceps Corda" },
        ].map((ex) => (
          <div key={ex.name} className="flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-1.5 py-1 min-w-0">
            <span className="text-[8px] font-black text-green-400 shrink-0">{ex.count}</span>
            <span className="text-[8px] font-bold text-white/90 truncate">{ex.name}</span>
          </div>
        ))}
      </div>

      <div className="px-3.5 pb-2.5 pt-1 border-t border-white/10 text-center">
        <span className="text-[8px] font-semibold text-white/45">Feito no <span className="text-green-400 font-extrabold">GEMgym</span> 💪</span>
      </div>
    </div>
  );
}

const slides = [
  {
    key: "criar",
    badge: "1. Crie",
    icon: <Dumbbell className="w-6 h-6" />,
    title: "Monte seus treinos do seu jeito",
    description:
      "Dê um nome, escolha uma cor e adicione exercícios da nossa biblioteca com séries, repetições e tempo de descanso alvo.",
    mock: <CreateWorkoutMock />,
  },
  {
    key: "executar",
    badge: "2. Execute",
    icon: <Play className="w-6 h-6" />,
    title: "Registre cada série em tempo real",
    description:
      "Aperte iniciar e vá marcando peso, reps e RIR de cada série. O descanso conta sozinho e recordes pessoais são detectados automaticamente.",
    mock: <LogSetsMock />,
  },
  {
    key: "historico",
    badge: "3. Evolua",
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Acompanhe histórico, PRs e estatísticas",
    description:
      "Todo treino finalizado fica no seu histórico, com volume, duração e recordes — e vira gráfico automaticamente na aba Stats.",
    mock: <HistoryStatsMock />,
  },
  {
    key: "compartilhar",
    badge: "4. Compartilhe",
    icon: <Share2 className="w-6 h-6" />,
    title: "Mostre seu treino (e motive a galera)",
    description:
      "Ao finalizar, toque em “Compartilhar treino” pra gerar um cartão com seus PRs, volume e manequim muscular — pronto pra postar no Stories ou mandar no WhatsApp.",
    mock: <ShareCardMock />,
  },
];

export function OnboardingTour({ open, onSkip, onFinish, onNeverShowAgain }: OnboardingTourProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onSkip}
          aria-label="Pular tour"
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo / boas-vindas só na primeira tela */}
        {step === 0 && (
          <div className="text-center mb-1">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-widest">
              Bem-vindo ao GEMgym
            </p>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="pt-4"
          >
            <div className="flex flex-col items-center text-center mb-5">
              <div
                className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary mb-3"
                style={{ boxShadow: "0 0 32px oklch(0.80 0.18 162 / 0.25)" }}
              >
                {slide.icon}
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                {slide.badge}
              </span>
              <h2 className="text-lg font-black tracking-tight leading-snug">{slide.title}</h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[280px]">
                {slide.description}
              </p>
            </div>

            <div className="mb-6">{slide.mock}</div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Ir para etapa ${i + 1}`}
              onClick={() => setStep(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 20 : 6,
                backgroundColor: i === step ? "var(--primary)" : "var(--border)",
              }}
            />
          ))}
        </div>

        {/* Navegação */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-11 px-4 rounded-xl font-semibold text-sm border border-border hover:bg-accent transition-colors flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
            className="flex-1 h-11 rounded-xl font-bold text-sm text-primary-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            style={{ background: "var(--primary)", boxShadow: "0 4px 20px oklch(0.80 0.18 162 / 0.35)" }}
          >
            {isLast ? "Vamos começar!" : "Próximo"}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {step === 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-4 text-xs">
            <button
              type="button"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular tour
            </button>
            <span className="text-muted-foreground/40">·</span>
            <button
              type="button"
              onClick={onNeverShowAgain}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Não mostrar novamente
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
