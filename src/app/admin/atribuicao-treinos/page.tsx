"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  User,
  Dumbbell,
  Loader2,
  Check,
  Sparkles,
  Filter,
  ClipboardList,
  ChevronRight,
  Pencil,
} from "lucide-react";

type TemplateExercise = {
  id: string;
  order: number;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  notes: string | null;
  targetDurationSec: number | null;
  targetDistanceKm: number | null;
  targetIntensity: string | null;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    category: string;
  };
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  defaultRest: number;
  color: string | null;
  templateGoal: string | null;
  templateSex: string | null;
  templateLevel: string | null;
  exercises: TemplateExercise[];
  _count?: { exercises: number };
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  disabled: boolean;
  workoutCount: number;
  sex?: string | null;
};

const ALL = "__all__";

function goalLabel(g: string | null) {
  if (g === "emagrecimento") return "Emagrecimento";
  if (g === "hipertrofia") return "Hipertrofia";
  return g || "—";
}

function sexLabel(s: string | null) {
  if (s === "M") return "Homem";
  if (s === "F") return "Mulher";
  return s || "—";
}

function levelLabel(l: string | null) {
  if (l === "iniciante") return "Iniciante";
  if (l === "intermediario") return "Intermediário";
  return l || "—";
}

function goalBadgeClass(g: string | null) {
  if (g === "emagrecimento") return "bg-emerald-500/15 text-emerald-600 border-emerald-500/25";
  if (g === "hipertrofia") return "bg-blue-500/15 text-blue-600 border-blue-500/25";
  return "";
}

export default function AtribuicaoTreinosPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [adjustWorkout, setAdjustWorkout] = useState<{
    id: string;
    name: string;
    userName: string;
    exercises: Array<{
      exerciseId: string;
      exerciseName: string;
      targetSets: number;
      targetReps: number;
      restSeconds: number;
      notes: string | null;
    }>;
  } | null>(null);
  const [adjustSaving, setAdjustSaving] = useState(false);

  const [goalFilter, setGoalFilter] = useState(ALL);
  const [sexFilter, setSexFilter] = useState(ALL);
  const [levelFilter, setLevelFilter] = useState(ALL);

  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailTemplate, setDetailTemplate] = useState<Template | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const params = new URLSearchParams();
      if (goalFilter !== ALL) params.set("goal", goalFilter);
      if (sexFilter !== ALL) params.set("sex", sexFilter);
      if (levelFilter !== ALL) params.set("level", levelFilter);
      const qs = params.toString();
      const res = await apiGet<{ templates: Template[] }>(
        `/api/admin/workout-templates${qs ? `?${qs}` : ""}`
      );
      setTemplates(res.templates);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, [goalFilter, sexFilter, levelFilter]);

  const loadUsers = useCallback(async (search: string) => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ pageSize: "50", status: "active" });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiGet<{ items: UserItem[] }>(`/api/admin/users?${params}`);
      setUsers(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar usuários");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch, loadUsers]);

  const selectedTemplates = useMemo(
    () => templates.filter((t) => selectedTemplateIds.has(t.id)),
    [templates, selectedTemplateIds]
  );

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const toggleTemplate = (id: string) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSeed = async (force = false) => {
    setSeeding(true);
    try {
      const res = await apiPost<{
        ok: boolean;
        skipped?: boolean;
        message?: string;
        created?: Array<{ name: string }>;
      }>("/api/admin/workout-templates/seed", { force });

      if (res.skipped) {
        toast.message(res.message || "Templates já existem", {
          action: {
            label: "Recriar",
            onClick: () => handleSeed(true),
          },
        });
      } else {
        toast.success(`${res.created?.length ?? 0} templates criados`);
        await loadTemplates();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar templates");
    } finally {
      setSeeding(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId || selectedTemplateIds.size === 0) return;
    setAssigning(true);
    try {
      const res = await apiPost<{
        ok: boolean;
        assigned: Array<{ name: string }>;
        user: { name: string };
      }>("/api/admin/assign-workouts", {
        userId: selectedUserId,
        templateIds: Array.from(selectedTemplateIds),
      });
      toast.success(
        `${res.assigned.length} treino(s) atribuído(s) a ${res.user.name}`
      );
      setConfirmOpen(false);
      setSelectedTemplateIds(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atribuir treinos");
    } finally {
      setAssigning(false);
    }
  };

  /** Clona 1 template para o aluno e abre editor inline (ajustar cargas/reps). */
  const handleCloneAndAdjust = async () => {
    if (!selectedUserId || selectedTemplateIds.size !== 1) {
      toast.error("Selecione exatamente 1 treino e 1 aluno para clonar e ajustar");
      return;
    }
    setAssigning(true);
    try {
      const templateId = Array.from(selectedTemplateIds)[0];
      const res = await apiPost<{
        assigned: Array<{ id: string; name: string; exerciseCount: number }>;
        user: { id: string; name: string };
      }>("/api/admin/assign-workouts", {
        userId: selectedUserId,
        templateIds: [templateId],
      });
      const assigned = res.assigned[0];
      if (!assigned) throw new Error("Nenhum treino clonado");

      const detail = await apiGet<{
        workout: {
          id: string;
          name: string;
          exercises: Array<{
            exerciseId: string;
            targetSets: number;
            targetReps: number;
            restSeconds: number;
            notes: string | null;
            exercise: { name: string };
          }>;
        };
      }>(`/api/admin/user-workouts/${assigned.id}`);

      setAdjustWorkout({
        id: detail.workout.id,
        name: detail.workout.name,
        userName: res.user.name,
        exercises: detail.workout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exercise.name,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
        })),
      });
      setSelectedTemplateIds(new Set());
      toast.success(`Cópia criada para ${res.user.name} — ajuste se quiser`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao clonar");
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveAdjust = async () => {
    if (!adjustWorkout) return;
    setAdjustSaving(true);
    try {
      await apiPut(`/api/admin/user-workouts/${adjustWorkout.id}`, {
        name: adjustWorkout.name,
        exercises: adjustWorkout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
        })),
      });
      toast.success("Treino do aluno atualizado");
      setAdjustWorkout(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar ajuste");
    } finally {
      setAdjustSaving(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Atribuição de treinos
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Escolha treinos pré-setados (editáveis) e atribua à conta do aluno. A cópia fica
            independente — o template original permanece no painel.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSeed(false)}
          disabled={seeding}
          className="shrink-0"
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Criar pré-setados
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={goalFilter} onValueChange={setGoalFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Objetivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos objetivos</SelectItem>
            <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
            <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sexFilter} onValueChange={setSexFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Sexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="M">Homem</SelectItem>
            <SelectItem value="F">Mulher</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos níveis</SelectItem>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="intermediario">Intermediário</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Treinos pré-setados
            </h2>
            <span className="text-xs text-muted-foreground">
              {selectedTemplateIds.size > 0
                ? `${selectedTemplateIds.size} selecionado(s)`
                : `${templates.length} disponível(is)`}
            </span>
          </div>

          {loadingTemplates ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Carregando…
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-10 text-center space-y-3">
              <Dumbbell className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhum template cadastrado. Clique em <strong>Criar pré-setados</strong> para
                gerar os 8 treinos (emagrecimento/hipertrofia × homem/mulher × iniciante/intermediário).
              </p>
              <Button size="sm" onClick={() => handleSeed(false)} disabled={seeding}>
                {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Criar agora
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => {
                const selected = selectedTemplateIds.has(t.id);
                const count = t.exercises?.length ?? t._count?.exercises ?? 0;
                return (
                  <div
                    key={t.id}
                    className={`rounded-xl border p-3.5 transition-colors cursor-pointer ${
                      selected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/70 hover:border-border hover:bg-accent/40"
                    }`}
                    onClick={() => toggleTemplate(t.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          selected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm leading-snug truncate">{t.name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <Badge variant="outline" className={`text-[10px] ${goalBadgeClass(t.templateGoal)}`}>
                                {goalLabel(t.templateGoal)}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {sexLabel(t.templateSex)}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {levelLabel(t.templateLevel)}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground self-center">
                                {count} exercícios
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailTemplate(t);
                            }}
                          >
                            Ver
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        </div>
                        {t.description && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Atribuir a
          </h2>

          <div className="rounded-xl border border-border/70 p-4 space-y-4 sticky top-4">
            <div className="space-y-2">
              <Label className="text-xs">Buscar aluno</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Nome ou e-mail…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 -mx-1 px-1">
              {loadingUsers ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Buscando…
                </div>
              ) : users.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum usuário encontrado
                </p>
              ) : (
                users.map((u) => {
                  const active = selectedUserId === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserId(u.id)}
                      className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                        active
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-accent border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {u.workoutCount} treinos
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-border/60 pt-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                {selectedTemplateIds.size === 0
                  ? "Selecione um ou mais treinos à esquerda"
                  : selectedUser
                    ? `${selectedTemplateIds.size} treino(s) → ${selectedUser.name}`
                    : `${selectedTemplateIds.size} treino(s) selecionado(s) — escolha o aluno`}
              </p>
              <Button
                className="w-full"
                disabled={selectedTemplateIds.size === 0 || !selectedUserId || assigning}
                onClick={() => setConfirmOpen(true)}
              >
                Atribuir treinos
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={selectedTemplateIds.size !== 1 || !selectedUserId || assigning}
                onClick={handleCloneAndAdjust}
              >
                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                Clonar e ajustar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar atribuição</DialogTitle>
            <DialogDescription>
              Os treinos abaixo serão copiados para a conta de{" "}
              <strong>{selectedUser?.name}</strong>. O aluno poderá editá-los depois.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto text-sm">
            {selectedTemplates.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{t.name}</span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={assigning}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={assigning}>
              {assigning && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detailTemplate} onOpenChange={(o) => !o && setDetailTemplate(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {detailTemplate && (
            <>
              <SheetHeader>
                <SheetTitle className="pr-6">{detailTemplate.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={goalBadgeClass(detailTemplate.templateGoal)}>
                    {goalLabel(detailTemplate.templateGoal)}
                  </Badge>
                  <Badge variant="outline">{sexLabel(detailTemplate.templateSex)}</Badge>
                  <Badge variant="outline">{levelLabel(detailTemplate.templateLevel)}</Badge>
                </div>
                {detailTemplate.description && (
                  <p className="text-sm text-muted-foreground">{detailTemplate.description}</p>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Exercícios ({detailTemplate.exercises.length})
                  </p>
                  {detailTemplate.exercises.map((ex) => {
                    const isCardio = ex.exercise.category === "Cardio" || !!ex.targetDurationSec;
                    return (
                      <div
                        key={ex.id}
                        className="rounded-lg border border-border/60 px-3 py-2.5 text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium leading-snug">{ex.exercise.name}</p>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {ex.exercise.muscleGroup}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isCardio
                            ? [
                                ex.targetDurationSec
                                  ? `${Math.round(ex.targetDurationSec / 60)} min`
                                  : null,
                                ex.targetDistanceKm ? `${ex.targetDistanceKm} km` : null,
                                ex.targetIntensity,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "Cardio"
                            : `${ex.targetSets}×${ex.targetReps} · descanso ${ex.restSeconds}s`}
                        </p>
                        {ex.notes && (
                          <p className="text-[11px] text-muted-foreground/80 mt-0.5 italic">
                            {ex.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Button
                  className="w-full"
                  variant={selectedTemplateIds.has(detailTemplate.id) ? "secondary" : "default"}
                  onClick={() => {
                    toggleTemplate(detailTemplate.id);
                    setDetailTemplate(null);
                  }}
                >
                  {selectedTemplateIds.has(detailTemplate.id)
                    ? "Remover da seleção"
                    : "Selecionar este treino"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Editor pós-clone */}
      <Sheet open={!!adjustWorkout} onOpenChange={(o) => { if (!o) setAdjustWorkout(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {adjustWorkout && (
            <>
              <SheetHeader>
                <SheetTitle>Ajustar treino do aluno</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Cópia para <span className="font-semibold text-foreground">{adjustWorkout.userName}</span>
                </p>
                <div className="space-y-1.5">
                  <Label>Nome do treino</Label>
                  <Input
                    value={adjustWorkout.name}
                    onChange={(e) =>
                      setAdjustWorkout({ ...adjustWorkout, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-3">
                  {adjustWorkout.exercises.map((ex, i) => (
                    <div key={ex.exerciseId} className="rounded-xl border border-border/60 p-3 space-y-2">
                      <p className="text-sm font-semibold">{ex.exerciseName}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-[10px]">Séries</Label>
                          <Input
                            type="number"
                            min={1}
                            value={ex.targetSets}
                            onChange={(e) => {
                              const exercises = [...adjustWorkout.exercises];
                              exercises[i] = {
                                ...ex,
                                targetSets: parseInt(e.target.value) || 1,
                              };
                              setAdjustWorkout({ ...adjustWorkout, exercises });
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">Reps</Label>
                          <Input
                            type="number"
                            min={1}
                            value={ex.targetReps}
                            onChange={(e) => {
                              const exercises = [...adjustWorkout.exercises];
                              exercises[i] = {
                                ...ex,
                                targetReps: parseInt(e.target.value) || 1,
                              };
                              setAdjustWorkout({ ...adjustWorkout, exercises });
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">Descanso (s)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={ex.restSeconds}
                            onChange={(e) => {
                              const exercises = [...adjustWorkout.exercises];
                              exercises[i] = {
                                ...ex,
                                restSeconds: parseInt(e.target.value) || 0,
                              };
                              setAdjustWorkout({ ...adjustWorkout, exercises });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full" onClick={handleSaveAdjust} disabled={adjustSaving}>
                  {adjustSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar ajustes
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
