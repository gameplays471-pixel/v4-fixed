"use client";

import { useSyncExternalStore, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPendingCount, subscribeToSync, processSyncQueue } from "@/lib/sync-queue";
import { Loader2, WifiOff, Check } from "lucide-react";

/**
 * Indicador discreto de sincronização offline.
 * Mostra "X pendente(s)" quando há itens na fila e
 * "Sincronizando..." durante o processamento.
 *
 * Usa useSyncExternalStore para reagir a mudanças na fila
 * sem polling explícito no componente.
 */
export function SyncIndicator() {
  const pending = useSyncExternalStore(subscribeToSync, getPendingCount);

  // processSyncQueue seta `processing = true` e dispara evento,
  // então o indicador muda para "Sincronizando..." automaticamente.
  const handleRetry = useCallback(() => {
    processSyncQueue();
  }, []);

  return (
    <AnimatePresence>
      {pending > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={handleRetry}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
            bg-amber-500/15 text-amber-600 dark:text-amber-400
            border border-amber-500/25 hover:bg-amber-500/25
            transition-colors cursor-pointer select-none"
          aria-label={`${pending} alterações pendentes de sincronização. Clique para tentar agora.`}
        >
          {!navigator.onLine ? (
            <>
              <WifiOff className="w-3 h-3" />
              <span>{pending} pendente{pending > 1 ? "s" : ""}</span>
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Sincronizando{pending > 1 ? ` ${pending}` : ""}...</span>
            </>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Badge mínimo para usar no header (sem animação de entrada/saída,
 * apenas fade) — mais leve se usado em lugar que re-renderiza muito.
 */
export function SyncBadge() {
  const pending = useSyncExternalStore(subscribeToSync, getPendingCount);

  if (pending === 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
        bg-amber-500/15 text-amber-600 dark:text-amber-400
        border border-amber-500/25"
      title={`${pending} alteração(ões) aguardando sincronização`}
    >
      {!navigator.onLine ? (
        <WifiOff className="w-2.5 h-2.5" />
      ) : (
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
      )}
      {pending}
    </span>
  );
}
