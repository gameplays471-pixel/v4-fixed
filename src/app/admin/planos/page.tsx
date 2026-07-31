"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Check, ClipboardList, User } from "lucide-react";

type PlanTemplate = {
  id: string;
  name: string;
  description: string | null;
  daysPerWeek: number;
  templateGoal: string | null;
  templateSex: string | null;
  templateLevel: string | null;
  items: Array<{
    id: string;
    order: number;
    label: string;
    suggestedWeekday: number | null;
    workout: { id: string; name: string; color: string | null };
  }>;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
};

const WEEKDAY = ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [goal, setGoal] = useState<string>("all");
  const [sex, setSex] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");

  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (goal !== "all") params.set("goal", goal);
      if (sex !== "all") params.set("sex", sex);
      if (level !== "all") params.set("level", level);
      const res = await apiGet<{ plans: PlanTemplate[] }>(
        `/api/admin/plan-templates?${params.toString()}`
      );
      setPlans(res.plans);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  }, [goal, sex, level]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const q = userSearch.trim();
        const res = await apiGet<{ items: UserRow[] }>(
          `/api/admin/users?pageSize=20&search=${encodeURIComponent(q)}`
        );
        setUsers(res.items.map((u) => ({ id: u.id, name: u.name, email: u.email })));
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const seed = async () => {
    setSeeding(true);
    try {
      const res = await apiPost<{ created: unknown[]; skipped: string[] }>(
        "/api/admin/plan-templates/seed",
        {}
      );
      toast.success(
        `Planos: ${res.created?.length ?? 0} criados, ${res.skipped?.length ?? 0} já existiam`
      );
      await loadPlans();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao criar planos pré-setados");
    } finally {
      setSeeding(false);
    }
  };

  const togglePlan = (id: string) => {
    setSelectedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const assign = async () => {
    if (!selectedUserId || selectedPlanIds.size === 0) {
      toast.error("Selecione um aluno e ao menos um plano");
      return;
    }
    setAssigning(true);
    try {
      const res = await apiPost<{ assigned: Array<{ name: string }> }>(
        "/api/admin/assign-plans",
        { userId: selectedUserId, planTemplateIds: Array.from(selectedPlanIds) }
      );
      toast.success(`Atribuído: ${res.assigned.map((a) => a.name).join(", ")}`);
      setSelectedPlanIds(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na atribuição");
    } finally {
      setAssigning(false);
    }
  };

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Planos semanais</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Templates 3×/semana com dias sugeridos e progresso no app do aluno
          </p>
        </div>
        <Button onClick={seed} disabled={seeding} className="gap-2">
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Criar planos pré-setados
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={goal} onValueChange={setGoal}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Objetivo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos objetivos</SelectItem>
            <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
            <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sex} onValueChange={setSex}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Sexo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="M">Masculino</SelectItem>
            <SelectItem value="F">Feminino</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Nível" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos níveis</SelectItem>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="intermediario">Intermediário</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Templates
          </h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum plano ainda. Crie os treinos pré-setados e depois os planos.
            </p>
          ) : (
            plans.map((plan) => {
              const selected = selectedPlanIds.has(plan.id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => togglePlan(plan.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                    selected ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{plan.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {plan.description}
                      </p>
                    </div>
                    {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {plan.templateGoal && <Badge variant="secondary" className="text-[10px]">{plan.templateGoal}</Badge>}
                    {plan.templateLevel && <Badge variant="secondary" className="text-[10px]">{plan.templateLevel}</Badge>}
                    {plan.templateSex && <Badge variant="secondary" className="text-[10px]">{plan.templateSex}</Badge>}
                  </div>
                  <ul className="mt-3 space-y-1">
                    {plan.items.map((item) => (
                      <li key={item.id} className="text-[11px] text-muted-foreground">
                        {item.label}
                        {item.suggestedWeekday
                          ? ` · ${WEEKDAY[item.suggestedWeekday] || item.suggestedWeekday}`
                          : ""}
                        {" · "}
                        {item.workout.name}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <User className="w-4 h-4" /> Atribuir a aluno
          </h2>
          <Input
            placeholder="Buscar aluno por nome ou e-mail"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border/60 rounded-xl p-2">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedUserId === u.id ? "bg-primary/15 text-primary" : "hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">{u.name}</span>
                <span className="text-xs text-muted-foreground block">{u.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedUser
              ? `Aluno: ${selectedUser.name} · ${selectedPlanIds.size} plano(s)`
              : "Selecione um aluno"}
          </p>
          <Button
            className="w-full"
            disabled={!selectedUserId || selectedPlanIds.size === 0 || assigning}
            onClick={assign}
          >
            {assigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Atribuir plano(s)
          </Button>
        </div>
      </div>
    </div>
  );
}
