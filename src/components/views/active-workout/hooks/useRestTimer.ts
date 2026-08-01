import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { RestTimerState } from "../types";
import {
  notifyRestDone,
  requestNotificationPermission,
  getNotificationPermission,
} from "@/lib/notifications";

/**
 * Timer de descanso entre séries.
 *
 * Estratégia anti-throttling (abas em segundo plano):
 * 1. Fim absoluto via Date.now() (sem drift de setInterval).
 * 2. setTimeout único agendado pro instante exato do fim — mais confiável
 *    que depender só do intervalo de 500ms (que o browser throttle/pausa).
 * 3. visibilitychange + focus + pageshow: ao voltar pra aba, se o tempo
 *    já passou, dispara o aviso imediatamente (som + notificação + toast).
 * 4. Guard `firedRef` garante que o fim só dispara uma vez.
 *
 * Limitação honesta: browsers (principalmente Safari iOS com tela bloqueada)
 * podem suspender timers por completo. A notificação de sistema + o check
 * ao voltar cobrem o caso "troquei de app e voltei".
 *
 * Sobre abaixar Spotify/YouTube: páginas web NÃO podem controlar o volume
 * de outros apps (restrição de privacidade do SO). Em mobile, a notificação
 * do sistema e o som do app costumam fazer o SO fazer ducking automático.
 */

/** Chime agradável em 3 notas (C5 → E5 → G5), mais longo e audível. */
function playRestChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    // Resume se o browser suspendeu o contexto (comum ao voltar de background).
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const master = ctx.createGain();
    // Volume alto o suficiente pra cortar o ambiente da academia, sem distorcer.
    master.gain.setValueAtTime(0.85, ctx.currentTime);
    master.connect(ctx.destination);

    // Três notas ascendentes, tom senoidal suave (menos "apito de micro-ondas").
    const notes = [
      { freq: 523.25, start: 0.0, dur: 0.28 }, // C5
      { freq: 659.25, start: 0.22, dur: 0.28 }, // E5
      { freq: 783.99, start: 0.44, dur: 0.45 }, // G5
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = note.freq;
      osc.connect(gain);
      gain.connect(master);

      const t0 = ctx.currentTime + note.start;
      // Envelope ADSR leve — ataque rápido, sustain curto, decay suave.
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.7, t0 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.dur);

      osc.start(t0);
      osc.stop(t0 + note.dur + 0.02);
    }

    // Segunda passagem harmônica mais baixa (oitava abaixo) pra dar corpo.
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = "triangle";
    bass.frequency.value = 261.63; // C4
    bass.connect(bassGain);
    bassGain.connect(master);
    const bt = ctx.currentTime;
    bassGain.gain.setValueAtTime(0.0001, bt);
    bassGain.gain.exponentialRampToValueAtTime(0.25, bt + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, bt + 0.9);
    bass.start(bt);
    bass.stop(bt + 0.95);

    // Fecha o contexto depois do chime (libera recursos).
    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 1200);
  } catch {
    // Ambiente sem Web Audio — silencioso.
  }
}

export function useRestTimer() {
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    active: false,
    remaining: 0,
    total: 0,
    paused: false,
  });
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timestamp absoluto (ms) em que o descanso termina.
  const restEndRef = useRef<number | null>(null);
  // Ms restantes no momento da pausa (pra recalcular o end ao despausar).
  const restPausedAtRef = useRef<number | null>(null);
  const exerciseNameRef = useRef<string | undefined>(undefined);
  // Evita disparar som/toast/notificação mais de uma vez.
  const firedRef = useRef(false);
  // Refs espelhando estado pra callbacks estáveis (visibility/timeout).
  const soundOnRef = useRef(soundOn);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const clearTimers = useCallback(() => {
    if (endTimeoutRef.current !== null) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fireComplete = useCallback(() => {
    if (firedRef.current) return;
    if (!activeRef.current) return;
    firedRef.current = true;
    activeRef.current = false;
    restEndRef.current = null;
    restPausedAtRef.current = null;
    clearTimers();

    if (soundOnRef.current) playRestChime();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      // Padrão mais perceptível: três pulsos.
      navigator.vibrate([220, 80, 220, 80, 320]);
    }
    toast.success("Descanso concluído! 🔥");
    void notifyRestDone(exerciseNameRef.current);
    setRestTimer({ active: false, remaining: 0, total: 0, paused: false });
  }, [clearTimers]);

  /** Agenda o setTimeout pro instante exato do fim + intervalo de UI. */
  const scheduleFromEnd = useCallback(() => {
    clearTimers();
    const end = restEndRef.current;
    if (end === null) return;

    const delay = Math.max(0, end - Date.now());
    endTimeoutRef.current = setTimeout(() => {
      fireComplete();
    }, delay);

    const tick = () => {
      if (!restEndRef.current) return;
      const remaining = Math.max(
        0,
        Math.round((restEndRef.current - Date.now()) / 1000)
      );
      setRestTimer((prev) => {
        if (!prev.active || prev.paused) return prev;
        if (prev.remaining === remaining) return prev;
        return { ...prev, remaining };
      });
      if (remaining <= 0) {
        fireComplete();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 500);
  }, [clearTimers, fireComplete]);

  // Efeito principal: ativa/pausa o agendamento.
  useEffect(() => {
    if (!restTimer.active) {
      activeRef.current = false;
      pausedRef.current = false;
      restEndRef.current = null;
      restPausedAtRef.current = null;
      firedRef.current = false;
      clearTimers();
      return;
    }

    activeRef.current = true;
    pausedRef.current = restTimer.paused;

    if (restTimer.paused) {
      // Guarda quanto faltava e cancela o end absoluto (não conta tempo pausado).
      if (restEndRef.current !== null) {
        restPausedAtRef.current = Math.max(0, restEndRef.current - Date.now());
        restEndRef.current = null;
      }
      clearTimers();
      return;
    }

    // Ativo e não pausado: (re)define end e agenda.
    if (restEndRef.current === null) {
      const remainingMs =
        restPausedAtRef.current ?? restTimer.remaining * 1000;
      restEndRef.current = Date.now() + remainingMs;
      restPausedAtRef.current = null;
      firedRef.current = false;
    }

    scheduleFromEnd();

    return () => {
      clearTimers();
    };
    // restTimer.remaining de propósito fora das deps — o end é absoluto.
  }, [restTimer.active, restTimer.paused, scheduleFromEnd, clearTimers]);

  // Quando a aba volta ao foco / fica visível, se o tempo já passou → dispara.
  // Cobre o caso em que o browser suspendeu o setTimeout em background.
  useEffect(() => {
    if (!restTimer.active || restTimer.paused) return;

    const checkOverdue = () => {
      if (!activeRef.current || firedRef.current) return;
      if (restEndRef.current !== null && Date.now() >= restEndRef.current) {
        fireComplete();
      } else if (restEndRef.current !== null) {
        // Ainda falta tempo: atualiza UI e re-agenda (timeout pode ter sido pausado).
        const remaining = Math.max(
          0,
          Math.round((restEndRef.current - Date.now()) / 1000)
        );
        setRestTimer((prev) =>
          prev.active && !prev.paused ? { ...prev, remaining } : prev
        );
        scheduleFromEnd();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") checkOverdue();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", checkOverdue);
    window.addEventListener("pageshow", checkOverdue);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", checkOverdue);
      window.removeEventListener("pageshow", checkOverdue);
    };
  }, [restTimer.active, restTimer.paused, fireComplete, scheduleFromEnd]);

  const start = (restSeconds: number, exerciseName?: string) => {
    exerciseNameRef.current = exerciseName;
    firedRef.current = false;
    restEndRef.current = null;
    restPausedAtRef.current = null;
    activeRef.current = true;

    if (getNotificationPermission() === "default") {
      void requestNotificationPermission();
    }

    // Define end já aqui pra o timeout não depender só do efeito.
    restEndRef.current = Date.now() + restSeconds * 1000;
    setRestTimer({
      active: true,
      remaining: restSeconds,
      total: restSeconds,
      paused: false,
    });
  };

  const togglePause = () => {
    setRestTimer((prev) => ({ ...prev, paused: !prev.paused }));
  };

  const adjust = (deltaSeconds: number) => {
    if (restEndRef.current) {
      restEndRef.current =
        deltaSeconds > 0
          ? restEndRef.current + deltaSeconds * 1000
          : Math.max(Date.now(), restEndRef.current + deltaSeconds * 1000);
      // Reagenda o timeout pro novo fim.
      if (activeRef.current && !pausedRef.current) {
        scheduleFromEnd();
      }
    } else if (restPausedAtRef.current !== null) {
      restPausedAtRef.current = Math.max(
        0,
        restPausedAtRef.current + deltaSeconds * 1000
      );
    }
    setRestTimer((prev) => ({
      ...prev,
      remaining: Math.max(0, prev.remaining + deltaSeconds),
    }));
  };

  const dismiss = () => {
    firedRef.current = true; // impede fire residual
    activeRef.current = false;
    restEndRef.current = null;
    restPausedAtRef.current = null;
    clearTimers();
    setRestTimer({ active: false, remaining: 0, total: 0, paused: false });
  };

  return {
    restTimer,
    soundOn,
    setSoundOn,
    audioRef,
    start,
    togglePause,
    adjust,
    dismiss,
  };
}
