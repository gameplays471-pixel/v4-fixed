"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ClipboardList,
  Database,
  HelpCircle,
  Loader2,
  Save,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Mode = "treinador" | "sql" | "duvidas";
type Msg = { role: "user" | "assistant"; content: string };

const MODE_META: Record<
  Mode,
  { label: string; icon: React.ReactNode; placeholder: string; greeting: string }
> = {
  treinador: {
    label: "Treinador",
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    placeholder: "Ex.: quero hipertrofia, 4x na semana…",
    greeting:
      "Oi! Sou o **PersoGem** no modo Treinador. Vou te entrevistar como um personal — uma pergunta de cada vez — e só depois monto a ficha. Qual é o seu **objetivo** principal com o treino?",
  },
  sql: {
    label: "SQL / Salvar",
    icon: <Database className="w-3.5 h-3.5" />,
    placeholder: "Cole a ficha do Treinador ou descreva o treino…",
    greeting:
      "Modo **SQL / Salvar**. Cole a ficha que o Treinador montou (ou descreva a divisão). Depois toque em **Salvar no app** — o GEMgym grava com o ID da sua sessão, sem precisar colar cuid no Supabase.",
  },
  duvidas: {
    label: "Dúvidas",
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    placeholder: "Ex.: como progredir no agachamento?",
    greeting:
      "Oi! Sou o **PersoGem**. Pode perguntar sobre técnica, progressão, descanso ou o app. Para montar um programa completo, use o modo **Treinador**.",
  },
};

function renderLightMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function PersoGemChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("treinador");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setMessages([{ role: "assistant", content: MODE_META[mode].greeting }]);
    setError(null);
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [open, mode]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, saving]);

  async function send() {
    const text = input.trim();
    if (!text || loading || saving) return;

    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    const historyForApi = nextMessages.filter(
      (m, idx) => !(idx === 0 && m.role === "assistant")
    );

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/persogem/chat", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include", // cookie de sessão no navegador web
        body: JSON.stringify({ mode, messages: historyForApi }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      setMessages((prev) => [...prev, { role: "assistant", content: String(data.reply) }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao falar com o PersoGem");
    } finally {
      setLoading(false);
    }
  }

  /** Insert automático: LLM → JSON → Prisma com userId da sessão */
  async function saveToApp() {
    if (saving || loading) return;
    const historyForApi = messages.filter(
      (m, idx) => !(idx === 0 && m.role === "assistant")
    );
    if (historyForApi.length < 1) {
      toast.message("Converse um pouco sobre o treino antes de salvar.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/persogem/apply-workout", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include", // cookie httpOnly em produção web
        body: JSON.stringify({ messages: historyForApi }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const missing = Array.isArray(data.missingSlugs)
          ? ` Slugs faltando: ${data.missingSlugs.join(", ")}`
          : "";
        throw new Error((data.error || `Erro ${res.status}`) + missing);
      }
      const names =
        data.workouts?.map((w: { name: string }) => w.name).join(", ") || "";
      toast.success(`${data.count} treino(s) salvos: ${names}`);
      setOpen(false);
      router.push("/treinos");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao salvar";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const canSave = mode === "treinador" || mode === "sql";

  return (
    <>
      {/* FAB — desktop e mobile (acima da bottom nav) */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className={cn(
              "fixed z-[60] flex items-center gap-2 rounded-full",
              "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
              "hover:shadow-xl hover:shadow-primary/40 transition-shadow",
              // mobile: acima da bottom nav; desktop: canto inferior direito
              "right-4 bottom-[5.5rem] md:bottom-6 md:right-6",
              "px-4 py-3 font-semibold text-sm pointer-events-auto"
            )}
            aria-label="Abrir PersoGem"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">PersoGem</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 md:bg-black/20"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={cn(
                "fixed z-[70] flex flex-col overflow-hidden pointer-events-auto",
                "bg-card border border-border/70 shadow-2xl",
                // full-ish no mobile; card no desktop
                "inset-x-0 bottom-0 top-12 rounded-t-3xl",
                "md:inset-auto md:right-6 md:bottom-6 md:top-auto",
                "md:w-[420px] md:h-[min(680px,82vh)] md:rounded-2xl"
              )}
              role="dialog"
              aria-modal="true"
              aria-label="PersoGem chat"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-gradient-to-r from-primary/15 to-transparent shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm leading-tight">PersoGem</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Treinador · SQL/Salvar · Dúvidas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-xl hover:bg-accent flex items-center justify-center text-muted-foreground"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-1 p-2 border-b border-border/50 shrink-0">
                {(Object.keys(MODE_META) as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-colors",
                      mode === m
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {MODE_META[m].icon}
                    {MODE_META[m].label}
                  </button>
                ))}
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/70 text-foreground rounded-bl-md"
                      )}
                    >
                      {renderLightMarkdown(m.content)}
                    </div>
                  </div>
                ))}
                {(loading || saving) && (
                  <div className="flex justify-start">
                    <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3 text-muted-foreground flex items-center gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {saving ? "Gravando treinos na sua conta…" : "Pensando…"}
                    </div>
                  </div>
                )}
                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                    {error}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border/60 bg-background/80 space-y-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {canSave && (
                  <button
                    type="button"
                    onClick={() => void saveToApp()}
                    disabled={saving || loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold",
                      "border border-primary/30 bg-primary/10 text-primary",
                      "hover:bg-primary/15 active:scale-[0.99] disabled:opacity-40 transition"
                    )}
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Salvar no app (insert automático)
                  </button>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder={MODE_META[mode].placeholder}
                    className={cn(
                      "flex-1 resize-none rounded-xl border border-border/70 bg-muted/30",
                      "px-3 py-2.5 text-sm max-h-28 min-h-[42px]",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40"
                    )}
                    disabled={loading || saving}
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={loading || saving || !input.trim()}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                      "bg-primary text-primary-foreground shadow-md shadow-primary/25",
                      "disabled:opacity-40 disabled:shadow-none active:scale-95 transition"
                    )}
                    aria-label="Enviar"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
