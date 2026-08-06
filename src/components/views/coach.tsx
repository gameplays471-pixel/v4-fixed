"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, Sparkles, MessageCircleQuestion, Dumbbell, Loader2, Check, Bot, User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "treinador" | "duvidas";

interface WorkoutProposalExercise {
  slug: string;
  targetSets?: number;
  targetReps?: number;
  restSeconds?: number;
  notes?: string | null;
  targetDurationSec?: number | null;
  targetDistanceKm?: number | null;
  targetIntensity?: string | null;
}
interface WorkoutProposalItem {
  name: string;
  description?: string | null;
  defaultRest?: number;
  color?: string | null;
  exercises: WorkoutProposalExercise[];
}

type ChatItem =
  | { id: string; kind: "message"; role: "user" | "assistant"; content: string; streaming?: boolean }
  | { id: string; kind: "proposal"; workouts: WorkoutProposalItem[]; status: "pending" | "saving" | "saved" | "error" };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const INTRO: Record<Mode, string> = {
  treinador:
    "Oi! Eu sou o PersoGem 💪 Antes de montar seu treino, preciso te conhecer um pouco — vai ser tipo uma entrevista rápida com um personal de verdade. Pra começar: qual é o seu objetivo principal (hipertrofia, emagrecimento, força, saúde, outro)?",
  duvidas:
    "Oi! Eu sou o PersoGem, seu tira-dúvidas de treino. Pode perguntar sobre técnica, séries, descanso, progressão de carga, recuperação... o que precisar 🙂",
};

const SUGGESTIONS: Record<Mode, string[]> = {
  treinador: [
    "Quero montar um treino do zero",
    "Quero ajustar meu treino atual",
    "Foco em emagrecimento",
  ],
  duvidas: [
    "Qual a diferença entre RIR e RPE?",
    "Quanto tempo devo descansar entre séries?",
    "Como saber se devo aumentar a carga?",
  ],
};

const MODE_CONFIG: Record<Mode, { label: string; icon: React.ReactNode; description: string }> = {
  treinador: {
    label: "Treinador",
    icon: <Dumbbell className="w-4 h-4" />,
    description: "Entrevista completa e montagem do seu programa de treino",
  },
  duvidas: {
    label: "Dúvidas",
    icon: <MessageCircleQuestion className="w-4 h-4" />,
    description: "Perguntas rápidas sobre técnica, treino e recuperação",
  },
};

function ProposalCard({ item, onSaved }: { item: Extract<ChatItem, { kind: "proposal" }>; onSaved: () => void }) {
  const [status, setStatus] = useState(item.status);

  const totalExercises = item.workouts.reduce((acc, w) => acc + w.exercises.length, 0);

  const handleSave = async () => {
    setStatus("saving");
    try {
      await apiPost("/api/coach/save-workout", { workouts: item.workouts });
      setStatus("saved");
      toast.success("Treino salvo! Já está disponível na aba Treinos.");
      onSaved();
    } catch (e) {
      setStatus("error");
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar o treino.");
    }
  };

  return (
    <Card className="p-4 border-primary/30 bg-primary/[0.03]">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-bold">Plano de treino pronto</p>
      </div>
      <div className="space-y-2 mb-4">
        {item.workouts.map((w, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: w.color || "#8b5cf6" }}
            />
            <span className="font-semibold">{w.name}</span>
            <span className="text-muted-foreground">· {w.exercises.length} exercício{w.exercises.length !== 1 ? "s" : ""}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {item.workouts.length} treino{item.workouts.length !== 1 ? "s" : ""} · {totalExercises} exercício{totalExercises !== 1 ? "s" : ""} no total
      </p>
      <Button
        size="sm"
        className="w-full"
        disabled={status === "saving" || status === "saved"}
        onClick={handleSave}
      >
        {status === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === "saved" && <Check className="w-4 h-4" />}
        {status === "saved" ? "Salvo no app" : status === "saving" ? "Salvando..." : "Salvar no app"}
      </Button>
    </Card>
  );
}

export function CoachView() {
  const [mode, setMode] = useState<Mode>("treinador");
  const [threads, setThreads] = useState<Record<Mode, ChatItem[]>>({ treinador: [], duvidas: [] });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState<Record<Mode, boolean>>({ treinador: false, duvidas: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = threads[mode];
  const isSending = sending[mode];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [items, mode]);

  const updateThread = useCallback((m: Mode, updater: (prev: ChatItem[]) => ChatItem[]) => {
    setThreads((prev) => ({ ...prev, [m]: updater(prev[m]) }));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending[mode]) return;

      const activeMode = mode;
      const userItem: ChatItem = { id: uid(), kind: "message", role: "user", content: trimmed };
      const assistantId = uid();
      const assistantItem: ChatItem = { id: assistantId, kind: "message", role: "assistant", content: "", streaming: true };

      // Histórico enviado ao servidor: só mensagens de texto, na ordem.
      const historyForServer = [...threads[activeMode], userItem]
        .filter((it): it is Extract<ChatItem, { kind: "message" }> => it.kind === "message")
        .map((it) => ({ role: it.role, content: it.content }));

      updateThread(activeMode, (prev) => [...prev, userItem, assistantItem]);
      setSending((prev) => ({ ...prev, [activeMode]: true }));
      setInput("");

      try {
        const res = await fetch("/api/coach/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ mode: activeMode, messages: historyForServer }),
        });

        if (res.status === 401) {
          throw new Error("Sessão expirada — recarregue a página.");
        }
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Erro ${res.status} ao falar com o PersoGem`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const handleFrame = (frame: string) => {
          const lines = frame.split("\n");
          let event = "message";
          let dataLine = "";
          for (const line of lines) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
          }
          if (!dataLine) return;
          let payload: any;
          try {
            payload = JSON.parse(dataLine);
          } catch {
            return;
          }

          if (event === "text" && typeof payload.delta === "string") {
            updateThread(activeMode, (prev) =>
              prev.map((it) =>
                it.kind === "message" && it.id === assistantId
                  ? { ...it, content: it.content + payload.delta }
                  : it
              )
            );
          } else if (event === "workout_proposal") {
            updateThread(activeMode, (prev) => [
              ...prev,
              { id: uid(), kind: "proposal", workouts: payload.workouts, status: "pending" },
            ]);
          } else if (event === "error") {
            toast.error(payload.message || "Erro ao falar com o PersoGem");
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) if (frame.trim()) handleFrame(frame);
        }
        if (buffer.trim()) handleFrame(buffer);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao falar com o PersoGem");
        updateThread(activeMode, (prev) =>
          prev.map((it) =>
            it.kind === "message" && it.id === assistantId && it.content === ""
              ? { ...it, content: "Não consegui responder agora — tenta de novo em instantes." }
              : it
          )
        );
      } finally {
        updateThread(activeMode, (prev) =>
          prev.map((it) => (it.kind === "message" && it.id === assistantId ? { ...it, streaming: false } : it))
        );
        setSending((prev) => ({ ...prev, [activeMode]: false }));
      }
    },
    [mode, sending, threads, updateThread]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3rem)]">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Bot className="w-7 h-7 text-primary" /> PersoGem
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Seu personal trainer virtual</p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
              mode === m
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-border/60 bg-card text-muted-foreground hover:bg-accent"
            )}
          >
            <span className={cn("shrink-0", mode === m && "text-primary")}>{MODE_CONFIG[m].icon}</span>
            <span className="text-sm font-bold">{MODE_CONFIG[m].label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
        <div className="flex gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <Card className="p-3 text-sm max-w-[85%] bg-card">{INTRO[mode]}</Card>
        </div>

        {items.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-[42px]">
            {SUGGESTIONS[mode].map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-border/60 bg-card hover:bg-accent transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {items.map((item) =>
            item.kind === "message" ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2.5", item.role === "user" && "justify-end")}
              >
                {item.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <Card
                  className={cn(
                    "p-3 text-sm max-w-[85%] whitespace-pre-wrap break-words",
                    item.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                  )}
                >
                  {item.content}
                  {item.streaming && item.content === "" && (
                    <span className="inline-flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                    </span>
                  )}
                </Card>
                {item.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pl-[42px]"
              >
                <ProposalCard item={item} onSaved={() => {}} />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 shrink-0 pt-1">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={mode === "treinador" ? "Responda a entrevista..." : "Digite sua dúvida..."}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending || !input.trim()}>
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
