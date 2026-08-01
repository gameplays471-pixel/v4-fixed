"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import {
  Gamepad2, Droplets, Salad, Dumbbell, Plus, Users, Copy, Check,
  LogOut, Crown, Trophy, ArrowRight, Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type GameSummary = {
  enabled: boolean;
  goals: { waterGoalMl: number; weeklyWorkoutGoal: number };
  today: { dietOnTrack: boolean; waterMl: number; workoutDone: boolean };
  week: { start: string; end: string; workouts: number; dietDays: number; waterDays: number; score: number };
};

type GroupSummary = { id: string; name: string; inviteCode: string; isOwner: boolean; memberCount: number };

type RankingEntry = {
  userId: string; name: string; avatarUrl: string | null; isYou: boolean;
  workouts: number; dietDays: number; waterDays: number; score: number; rank: number;
};

const WATER_QUICK_ADD = [
  { label: "+250ml", ml: 250 },
  { label: "+500ml", ml: 500 },
  { label: "+1L", ml: 1000 },
];

function ProfileGate() {
  return (
    <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 flex items-center justify-center">
        <Gamepad2 className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-black">Mini-game desativado</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Ative o mini-game no seu perfil pra acompanhar metas diárias e semanais de água, dieta e treino — e competir em grupo.
      </p>
      <Button asChild className="mt-6 rounded-xl h-11 px-6 gap-2 bg-primary font-semibold shadow-lg shadow-primary/20">
        <Link href="/perfil"><Settings className="w-4 h-4" /> Ativar no perfil</Link>
      </Button>
    </div>
  );
}

export function GameView() {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Feedback visual: badge flutuante "+ml" que sobe sobre o botão clicado,
  // e chave numérica usada pra re-disparar a animação de pulse no contador
  // de ml. O badge é por-clique (id muda a cada clique pra AnimatePresence
  // tratar como elemento novo); o pulseKey é estável por valor de água.
  const [floatingMl, setFloatingMl] = useState<{ id: number; ml: number } | null>(null);
  const [waterPulseKey, setWaterPulseKey] = useState(0);
  const [dietPulseKey, setDietPulseKey] = useState(0);
  const prevWaterRef = useRef<number | null>(null);
  const prevDietRef = useRef<boolean | null>(null);

  const summaryQuery = useQuery({
    queryKey: queryKeys.gameSummary,
    queryFn: () => apiGet<GameSummary>("/api/gamification/summary"),
  });
  const groupsQuery = useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => apiGet<{ groups: GroupSummary[] }>("/api/groups").then((d) => d.groups),
    enabled: !!summaryQuery.data?.enabled,
  });

  const groups = groupsQuery.data ?? [];
  const activeGroupId = selectedGroupId ?? groups[0]?.id ?? null;
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const rankingQuery = useQuery({
    queryKey: activeGroupId ? queryKeys.groupRanking(activeGroupId) : ["groups", "none", "ranking"],
    queryFn: () => apiGet<{ ranking: RankingEntry[]; week: { start: string; end: string } }>(`/api/groups/${activeGroupId}/ranking`),
    enabled: !!activeGroupId,
  });

  // Dispara o pulse dos contadores quando o valor muda (pós-otimização ou
  // pós-refetch do servidor). Compara via ref pra não animar no primeiro
  // mount — só quando o número realmente muda em re-renders seguintes.
  useEffect(() => {
    const currentWater = summaryQuery.data?.today.waterMl;
    if (currentWater == null) return;
    if (prevWaterRef.current == null) {
      prevWaterRef.current = currentWater;
      return;
    }
    if (prevWaterRef.current !== currentWater) {
      prevWaterRef.current = currentWater;
      setWaterPulseKey((k) => k + 1);
    }
  }, [summaryQuery.data?.today.waterMl]);

  useEffect(() => {
    const currentDiet = summaryQuery.data?.today.dietOnTrack;
    if (currentDiet == null) return;
    if (prevDietRef.current == null) {
      prevDietRef.current = currentDiet;
      return;
    }
    if (prevDietRef.current !== currentDiet) {
      prevDietRef.current = currentDiet;
      setDietPulseKey((k) => k + 1);
    }
  }, [summaryQuery.data?.today.dietOnTrack]);

  const invalidateSummary = () => queryClient.invalidateQueries({ queryKey: queryKeys.gameSummary });
  const invalidateRanking = () => {
    if (activeGroupId) queryClient.invalidateQueries({ queryKey: queryKeys.groupRanking(activeGroupId) });
  };

  /**
   * Adiciona `ml` ml de água HOJE com optimistic update:
   * 1. Cancela refetches em voo (pra não sobrescrever nossa otimização).
   * 2. Tira snapshot do cache pra rollback em caso de erro.
   * 3. Atualiza o cache local de `gameSummary` E do ranking do grupo (só a
   *    linha do próprio usuário) ANTES do servidor responder — a UI muda
   *    na hora.
   * 4. Mostra toast e badge flutuante imediatamente.
   * 5. Dispara o PATCH em paralelo. Se der erro, restaura os snapshots e
   *    mostra toast de erro. Se der certo, só refaz a invalidação pra
   *    sincronizar com a verdade do servidor (sem bloquear a UI).
   */
  const addWater = async (ml: number) => {
    // Feedback instantâneo (toast + badge) — não espera nada.
    setFloatingMl({ id: Date.now(), ml });
    setTimeout(() => setFloatingMl((f) => (f && f.ml === ml ? null : f)), 900);
    toast.success(
      `💧 +${ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`} registrado!`,
      { duration: 1400 }
    );

    const previousSummary = queryClient.getQueryData<GameSummary>(queryKeys.gameSummary);
    const rankingKey = activeGroupId ? queryKeys.groupRanking(activeGroupId) : null;
    const previousRanking = rankingKey
      ? queryClient.getQueryData<{ ranking: RankingEntry[]; week: { start: string; end: string } }>(rankingKey)
      : undefined;

    if (previousSummary) {
      // Cancela refetches pra eles não sobrescreverem nosso update otimista.
      await queryClient.cancelQueries({ queryKey: queryKeys.gameSummary });
      if (rankingKey) await queryClient.cancelQueries({ queryKey: rankingKey });

      const newWaterMl = previousSummary.today.waterMl + ml;
      const wasWaterDay = previousSummary.today.waterMl >= previousSummary.goals.waterGoalMl;
      const isWaterDay = newWaterMl >= previousSummary.goals.waterGoalMl;
      // Cruzar a meta no meio do update conta +1 (e se passar pra "abaixo"
      // — improvável já que só somamos — contaria -1).
      const waterDaysDelta = (isWaterDay ? 1 : 0) - (wasWaterDay ? 1 : 0);
      const newWaterDays = previousSummary.week.waterDays + waterDaysDelta;
      const newScore = previousSummary.week.score + waterDaysDelta * 5; // GAME_POINTS.WATER_DAY

      queryClient.setQueryData<GameSummary>(queryKeys.gameSummary, {
        ...previousSummary,
        today: { ...previousSummary.today, waterMl: newWaterMl },
        week: { ...previousSummary.week, waterDays: newWaterDays, score: newScore },
      });

      // Ranking: a linha do próprio usuário espelha o que mexemos no summary.
      if (previousRanking) {
        queryClient.setQueryData(rankingKey!, {
          ...previousRanking,
          ranking: previousRanking.ranking.map((entry) =>
            entry.isYou
              ? { ...entry, waterDays: newWaterDays, score: newScore }
              : entry
          ),
        });
      }
    }

    // PATCH em paralelo. A UI já está atualizada; aqui só confirmamos com o
    // servidor e re-sincronizamos em background. Se falhar, desfazemos.
    try {
      await apiPatch("/api/daily-log", { addWaterMl: ml });
      // `refetchType: 'none'` apenas marca os dados como stale; o próximo
      // foco/montagem/interação dispara o refetch real. Isso evita o custo
      // de 2 GETs a cada clique de água — a UI já reflete o valor correto
      // e o servidor confirma silenciosamente depois.
      queryClient.invalidateQueries({ queryKey: queryKeys.gameSummary, refetchType: "none" });
      if (rankingKey) queryClient.invalidateQueries({ queryKey: rankingKey, refetchType: "none" });
    } catch {
      // Rollback: volta o cache pro estado pré-clique.
      if (previousSummary) queryClient.setQueryData(queryKeys.gameSummary, previousSummary);
      if (previousRanking && rankingKey) queryClient.setQueryData(rankingKey, previousRanking);
      toast.error("Não foi possível registrar a água.");
    }
  };

  const toggleDiet = async () => {
    if (!summaryQuery.data) return;
    const next = !summaryQuery.data.today.dietOnTrack;

    // Feedback instantâneo — toast e pulse já disparam agora, não depois.
    toast.success(next ? "Dia marcado como \"na dieta\"! 🥗" : "Marcação removida.", { duration: 1400 });

    const previousSummary = queryClient.getQueryData<GameSummary>(queryKeys.gameSummary);
    const rankingKey = activeGroupId ? queryKeys.groupRanking(activeGroupId) : null;
    const previousRanking = rankingKey
      ? queryClient.getQueryData<{ ranking: RankingEntry[]; week: { start: string; end: string } }>(rankingKey)
      : undefined;

    if (previousSummary) {
      await queryClient.cancelQueries({ queryKey: queryKeys.gameSummary });
      if (rankingKey) await queryClient.cancelQueries({ queryKey: rankingKey });

      const wasDietDay = previousSummary.today.dietOnTrack;
      const dietDaysDelta = (next ? 1 : 0) - (wasDietDay ? 1 : 0);
      const newDietDays = previousSummary.week.dietDays + dietDaysDelta;
      const newScore = previousSummary.week.score + dietDaysDelta * 5; // GAME_POINTS.DIET_DAY

      queryClient.setQueryData<GameSummary>(queryKeys.gameSummary, {
        ...previousSummary,
        today: { ...previousSummary.today, dietOnTrack: next },
        week: { ...previousSummary.week, dietDays: newDietDays, score: newScore },
      });

      if (previousRanking) {
        queryClient.setQueryData(rankingKey!, {
          ...previousRanking,
          ranking: previousRanking.ranking.map((entry) =>
            entry.isYou
              ? { ...entry, dietDays: newDietDays, score: newScore }
              : entry
          ),
        });
      }
    }

    try {
      await apiPatch("/api/daily-log", { dietOnTrack: next });
      queryClient.invalidateQueries({ queryKey: queryKeys.gameSummary, refetchType: "none" });
      if (rankingKey) queryClient.invalidateQueries({ queryKey: rankingKey, refetchType: "none" });
    } catch {
      if (previousSummary) queryClient.setQueryData(queryKeys.gameSummary, previousSummary);
      if (previousRanking && rankingKey) queryClient.setQueryData(rankingKey, previousRanking);
      toast.error("Não foi possível atualizar a dieta de hoje.");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setBusy(true);
    try {
      const { group } = await apiPost<{ group: GroupSummary }>("/api/groups", { name: groupName.trim() });

      // Atualização otimista: adiciona o grupo novo direto no cache em vez de
      // só invalidar. Razão: depois de `invalidateQueries`, o React Query só
      // marca a query como stale — o refetch real é assíncrono e o componente
      // continua renderizando com a lista antiga nesse meio-tempo. Resultado
      // prático: o `activeGroup` ficava `null` (porque o grupo novo ainda não
      // estava em `groups`), o card do grupo sumia e o usuário pensava que a
      // tela tinha "travado" — só voltava ao normal depois de um F5.
      // Escrever direto no cache + invalidar depois garante que (a) a UI já
      // mostra o grupo novo no mesmo tick, e (b) o refetch seguinte
      // re-sincroniza memberCount/inviteCode/etc com a verdade do servidor.
      queryClient.setQueryData<GroupSummary[]>(queryKeys.groups, (old) => {
        const existing = old ?? [];
        // Se por algum motivo o grupo já estiver na lista (race com outro
        // refetch), substitui em vez de duplicar.
        const withoutDup = existing.filter((g) => g.id !== group.id);
        return [...withoutDup, group];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });

      setSelectedGroupId(group.id);
      setCreateOpen(false);
      setGroupName("");
      toast.success(`Grupo "${group.name}" criado!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível criar o grupo.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return;
    setBusy(true);
    try {
      const { group } = await apiPost<{ group: GroupSummary }>("/api/groups/join", { inviteCode: inviteCode.trim() });

      // Mesma atualização otimista do `handleCreateGroup` — ver comentário
      // lá. Sem isso, o grupo novo demora um tick pra aparecer e o card do
      // grupo ativo fica em branco até o refetch do /api/groups terminar.
      queryClient.setQueryData<GroupSummary[]>(queryKeys.groups, (old) => {
        const existing = old ?? [];
        const withoutDup = existing.filter((g) => g.id !== group.id);
        return [...withoutDup, group];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });

      setSelectedGroupId(group.id);
      setJoinOpen(false);
      setInviteCode("");
      toast.success(`Você entrou no grupo "${group.name}"!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Código inválido.");
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveGroup = async (group: GroupSummary) => {
    if (!confirm(group.isOwner ? `Apagar o grupo "${group.name}" para todo mundo?` : `Sair do grupo "${group.name}"?`)) return;
    try {
      await apiDelete(`/api/groups/${group.id}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      if (activeGroupId === group.id) setSelectedGroupId(null);
      toast.success(group.isOwner ? "Grupo apagado." : "Você saiu do grupo.");
    } catch {
      toast.error("Não foi possível concluir a ação.");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[0, 1, 2].map((i) => (
          <LoadingSkeleton key={i} className="h-32 rounded-2xl border border-border/60 animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  if (!summaryQuery.data?.enabled) return <ProfileGate />;

  const { goals, today, week } = summaryQuery.data;
  const waterPct = Math.min(100, Math.round((today.waterMl / goals.waterGoalMl) * 100));
  const workoutsPct = Math.min(100, Math.round((week.workouts / goals.weeklyWorkoutGoal) * 100));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2"><Gamepad2 className="w-7 h-7 text-primary" /> Mini-game</h1>
        <p className="text-sm text-muted-foreground mt-1">Metas de hoje e da semana — bata todas e suba no ranking do seu grupo.</p>
      </div>

      {/* Metas de hoje */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5 space-y-5">
          <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Metas de hoje</h2>

          {/* Água */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-1.5"><Droplets className="w-4 h-4 text-sky-400" /> Água</span>
              {/* `key={waterPulseKey}` re-monta o span a cada mudança real
                  do contador, re-disparando a animação de pulse. */}
              <motion.span
                key={`water-${waterPulseKey}`}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold tabular-nums inline-flex items-center gap-1.5"
              >
                <motion.span
                  key={`water-inner-${waterPulseKey}`}
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="inline-block origin-right"
                >
                  {today.waterMl}
                </motion.span>
                <span className="text-muted-foreground font-semibold"> / {goals.waterGoalMl} ml</span>
              </motion.span>
            </div>
            <Progress value={waterPct} className="h-2.5 [&>div]:bg-sky-400" />
            <div className="relative flex gap-2 pt-1">
              {WATER_QUICK_ADD.map((q) => (
                <Button key={q.ml} size="sm" variant="outline" onClick={() => addWater(q.ml)} className="rounded-xl font-semibold flex-1">
                  {q.label}
                </Button>
              ))}
              {/* Badge flutuante "+ml" — sobe e desaparece, dando feedback
                  visual instantâneo no exato momento do clique. */}
              <AnimatePresence>
                {floatingMl && (
                  <motion.span
                    key={floatingMl.id}
                    initial={{ opacity: 0, y: 4, scale: 0.85 }}
                    animate={{ opacity: 1, y: -18, scale: 1.05 }}
                    exit={{ opacity: 0, y: -36, scale: 0.9 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 text-sm font-black text-sky-500 drop-shadow-sm whitespace-nowrap"
                  >
                    +{floatingMl.ml >= 1000 ? `${floatingMl.ml / 1000}L` : `${floatingMl.ml}ml`}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Dieta */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-sm font-bold flex items-center gap-1.5"><Salad className="w-4 h-4 text-lime-500" /> Segui a dieta hoje</span>
            <motion.div
              key={`diet-${dietPulseKey}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 0.32, times: [0, 0.4, 1], ease: "easeOut" }}
            >
              <Button
                size="sm"
                onClick={toggleDiet}
                variant={today.dietOnTrack ? "default" : "outline"}
                className={`rounded-xl font-semibold gap-1.5 ${today.dietOnTrack ? "bg-lime-500 hover:bg-lime-500/90 text-white shadow-lg shadow-lime-500/20" : ""}`}
              >
                {today.dietOnTrack ? <><Check className="w-3.5 h-3.5" /> Sim</> : "Marcar"}
              </Button>
            </motion.div>
          </div>

          {/* Treino */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold flex items-center gap-1.5"><Dumbbell className="w-4 h-4 text-primary" /> Treino hoje</span>
            {today.workoutDone ? (
              <Badge className="bg-primary/15 text-primary border-primary/20"><Check className="w-3 h-3 mr-1" /> Feito</Badge>
            ) : (
              <Button asChild size="sm" variant="outline" className="rounded-xl font-semibold">
                <Link href="/treinos">Treinar agora</Link>
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Metas da semana */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Metas da semana</h2>
            <Badge variant="outline" className="font-bold gap-1"><Trophy className="w-3 h-3 text-yellow-400" /> {week.score} pts</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5 text-primary" /> Treinos</span>
              <span className="font-bold tabular-nums">{week.workouts} / {goals.weeklyWorkoutGoal}</span>
            </div>
            <Progress value={workoutsPct} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold flex items-center gap-1.5"><Salad className="w-3.5 h-3.5 text-lime-500" /> Dias na dieta</span>
              <span className="font-bold tabular-nums">{week.dietDays} / 7</span>
            </div>
            <Progress value={(week.dietDays / 7) * 100} className="h-2 [&>div]:bg-lime-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-sky-400" /> Meta de água batida</span>
              <span className="font-bold tabular-nums">{week.waterDays} / 7</span>
            </div>
            <Progress value={(week.waterDays / 7) * 100} className="h-2 [&>div]:bg-sky-400" />
          </div>
        </Card>
      </motion.div>

      {/* Grupos / ranking */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Ranking semanal
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-xl font-semibold gap-1.5 h-8" onClick={() => setJoinOpen(true)}>
                Entrar
              </Button>
              <Button size="sm" className="rounded-xl font-semibold gap-1.5 h-8 bg-primary" onClick={() => setCreateOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Criar grupo
              </Button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Crie um grupo ou entre com um código de convite para competir com seus amigos.</p>
            </div>
          ) : (
            <>
              {groups.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        activeGroupId === g.id
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              )}

              {activeGroup && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate flex items-center gap-1.5">
                      {activeGroup.isOwner && <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                      {activeGroup.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {activeGroup.memberCount} membro{activeGroup.memberCount !== 1 ? "s" : ""} · código{" "}
                      <button onClick={() => handleCopyCode(activeGroup.inviteCode)} className="font-mono font-bold text-foreground hover:text-primary inline-flex items-center gap-1">
                        {activeGroup.inviteCode} {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive shrink-0" title={activeGroup.isOwner ? "Apagar grupo" : "Sair do grupo"} onClick={() => handleLeaveGroup(activeGroup)}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="divide-y divide-border/40 -mx-1">
                {rankingQuery.isLoading ? (
                  <div className="space-y-2 py-2">
                    {[0, 1, 2].map((i) => <LoadingSkeleton key={i} className="h-12 rounded-xl mx-1" style={{ animationDelay: `${i * 0.06}s` }} />)}
                  </div>
                ) : (
                  rankingQuery.data?.ranking.map((entry) => (
                    <div key={entry.userId} className={`flex items-center gap-3 px-1 py-2.5 ${entry.isYou ? "bg-primary/5 rounded-xl" : ""}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        entry.rank === 1 ? "bg-yellow-400/20 text-yellow-400" : entry.rank === 2 ? "bg-slate-400/15 text-slate-400" : entry.rank === 3 ? "bg-orange-400/15 text-orange-400" : "bg-muted text-muted-foreground"
                      }`}>
                        {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
                      </div>
                      <p className="flex-1 min-w-0 text-sm font-semibold truncate">{entry.name}{entry.isYou && <span className="text-muted-foreground font-normal"> (você)</span>}</p>
                      <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                        <span title="Treinos">🏋️ {entry.workouts}</span>
                        <span title="Dias na dieta">🥗 {entry.dietDays}</span>
                        <span title="Dias com água batida">💧 {entry.waterDays}</span>
                      </div>
                      <span className="text-sm font-black tabular-nums shrink-0">{entry.score} pts</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {/* Dialog: criar grupo */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-black">Criar grupo</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="groupName">Nome do grupo</Label>
            <Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ex: Galera da academia" className="h-11" autoFocus />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateGroup} disabled={busy || !groupName.trim()} className="w-full h-11 rounded-xl bg-primary font-semibold">
              {busy ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: entrar em grupo */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-black">Entrar em um grupo</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Código de convite</Label>
            <Input id="inviteCode" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="Ex: AB3F9K" className="h-11 font-mono tracking-widest" autoFocus />
          </div>
          <DialogFooter>
            <Button onClick={handleJoinGroup} disabled={busy || !inviteCode.trim()} className="w-full h-11 rounded-xl bg-primary font-semibold">
              {busy ? "Entrando..." : "Entrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
