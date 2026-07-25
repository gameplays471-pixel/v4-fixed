import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { RestTimerState } from "../types";

/**
 * Encapsula o timer de descanso entre séries: contagem regressiva baseada em
 * Date.now() (sem drift), som opcional, vibração e ajustes de +/-15s.
 */
export function useRestTimer() {
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    active: false,
    remaining: 0,
    total: 0,
    paused: false,
  });
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // restEndRef guarda o timestamp (ms) em que o descanso termina
  const restEndRef = useRef<number | null>(null);
  const restPausedAtRef = useRef<number | null>(null); // ms restantes quando pausou

  useEffect(() => {
    if (!restTimer.active) {
      restEndRef.current = null;
      restPausedAtRef.current = null;
      return;
    }
    if (restTimer.paused) return;

    // Na primeira vez que o timer fica ativo e não pausado, define o endTime
    if (restEndRef.current === null) {
      restEndRef.current = Date.now() + restTimer.remaining * 1000;
    }

    const tick = () => {
      if (!restEndRef.current) return;
      const remaining = Math.max(0, Math.round((restEndRef.current - Date.now()) / 1000));
      setRestTimer((prev) => ({ ...prev, remaining }));
      if (remaining <= 0) {
        restEndRef.current = null;
        if (soundOn) playBeep();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        toast.success("Descanso concluído! 🔥");
        setRestTimer({ active: false, remaining: 0, total: 0, paused: false });
      }
    };

    tick(); // roda imediatamente
    const interval = setInterval(tick, 500); // 500ms para maior precisão
    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.paused, soundOn]); // sem restTimer.remaining nas deps!

  const playBeep = () => {
    try {
      // Web Audio API beep
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const start = (restSeconds: number) => {
    setRestTimer({ active: true, remaining: restSeconds, total: restSeconds, paused: false });
  };

  const togglePause = () => {
    setRestTimer((prev) => ({ ...prev, paused: !prev.paused }));
  };

  const adjust = (deltaSeconds: number) => {
    if (restEndRef.current) {
      restEndRef.current =
        deltaSeconds > 0 ? restEndRef.current + deltaSeconds * 1000 : Math.max(Date.now(), restEndRef.current + deltaSeconds * 1000);
    }
    setRestTimer((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining + deltaSeconds) }));
  };

  const dismiss = () => {
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
