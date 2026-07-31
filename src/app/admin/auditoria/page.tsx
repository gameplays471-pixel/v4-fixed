"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiGet, formatDate, relativeTime } from "@/lib/api";
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
import { Loader2, ScrollText, RefreshCw } from "lucide-react";

type AuditEntry = {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  before: string | null;
  after: string | null;
  ip: string | null;
  createdAt: string;
};

const ALL = "__all__";

function actionBadge(action: string) {
  if (action === "create")
    return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/25">create</Badge>;
  if (action === "delete")
    return <Badge className="bg-destructive/15 text-destructive border-destructive/25">delete</Badge>;
  return <Badge variant="secondary">update</Badge>;
}

function summarize(entry: AuditEntry): string {
  try {
    const after = entry.after ? JSON.parse(entry.after) : null;
    const before = entry.before ? JSON.parse(entry.before) : null;
    if (entry.entityType === "workout_assignment" && after?.assigned) {
      return `Atribuiu treinos a ${after.userName || after.userId}: ${(after.assigned as string[]).join(", ")}`;
    }
    if (entry.entityType === "workout_plan_assignment" && after?.plans) {
      return `Atribuiu planos a ${after.userId}: ${(after.plans as string[]).join(", ")}`;
    }
    if (entry.entityType === "user" && after?.disabled !== undefined) {
      return after.disabled ? "Bloqueou usuário" : "Desbloqueou usuário";
    }
    if (after?.name) return String(after.name);
    if (before?.name) return String(before.name);
    return entry.entityId.slice(0, 12) + "…";
  } catch {
    return entry.entityId.slice(0, 12) + "…";
  }
}

export default function AdminAuditoriaPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityType, setEntityType] = useState(ALL);
  const [action, setAction] = useState(ALL);
  const [actorEmail, setActorEmail] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "40",
      });
      if (entityType !== ALL) params.set("entityType", entityType);
      if (action !== ALL) params.set("action", action);
      if (actorEmail.trim()) params.set("actorEmail", actorEmail.trim());

      const res = await apiGet<{
        entries: AuditEntry[];
        total: number;
        totalPages: number;
      }>(`/api/admin/audit-log?${params.toString()}`);
      setEntries(res.entries);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Erro ao carregar auditoria");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, entityType, action, actorEmail]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-primary" />
            Auditoria
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ações do painel: atribuições, bloqueios, edições de templates
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={entityType}
          onValueChange={(v) => {
            setEntityType(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas entidades</SelectItem>
            <SelectItem value="workout_assignment">Atribuição de treino</SelectItem>
            <SelectItem value="workout_plan_assignment">Atribuição de plano</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="workout_template">Template de treino</SelectItem>
            <SelectItem value="user_workout">Treino do aluno</SelectItem>
            <SelectItem value="exercise">Exercício</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas ações</SelectItem>
            <SelectItem value="create">create</SelectItem>
            <SelectItem value="update">update</SelectItem>
            <SelectItem value="delete">delete</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="w-[220px]"
          placeholder="E-mail do admin"
          value={actorEmail}
          onChange={(e) => {
            setActorEmail(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{total} registro(s)</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum evento encontrado.</p>
      ) : (
        <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden">
          {entries.map((e) => (
            <div key={e.id} className="px-4 py-3 hover:bg-muted/30 transition-colors space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {actionBadge(e.action)}
                <Badge variant="outline" className="text-[10px] font-mono">
                  {e.entityType}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {relativeTime(e.createdAt)} · {formatDate(e.createdAt)}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug">{summarize(e)}</p>
              <p className="text-[11px] text-muted-foreground">
                {e.actorEmail}
                {e.ip ? ` · IP ${e.ip}` : ""}
                {" · "}
                <span className="font-mono">{e.entityId.slice(0, 16)}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
