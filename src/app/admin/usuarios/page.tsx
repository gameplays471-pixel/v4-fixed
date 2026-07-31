"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Search,
  Users,
  ShieldOff,
  ShieldCheck,
  KeyRound,
  Mail,
  Eye,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Dumbbell,
  Clock,
  Calendar,
  Target,
} from "lucide-react";
import { apiGet, apiPut, apiPost, formatDate, relativeTime, formatVolume, formatDuration } from "@/lib/api";

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  disabled: boolean;
  disabledAt: string | null;
  createdAt: string;
  avatarUrl: string | null;
  workoutCount: number;
  sessionCount: number;
  totalVolume: number;
  totalDurationSec: number;
  lastActiveAt: string | null;
  prCount: number;
}

interface UserDetail {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    disabled: boolean;
    disabledAt: string | null;
    createdAt: string;
    bio: string | null;
    weight: number | null;
    height: number | null;
    sex: string | null;
    birthDate: string | null;
    goal: string | null;
  };
  workouts: Array<{ id: string; name: string; createdAt: string }>;
  sessions: {
    items: Array<{
      id: string;
      workoutName: string;
      startedAt: string;
      durationSec: number;
      totalVolume: number;
    }>;
    total: number;
    page: number;
    totalPages: number;
  };
  bodyWeightLogCount: number;
  progressPhotoCount: number;
  stats: {
    streakDays: number;
    avgDuration: number;
    avgVolume: number;
    favoriteMuscleGroup: string | null;
  };
  report?: {
    assignedWorkouts: number;
    doneAssignedThisWeek: number;
    adherencePercent: number;
    sessionsThisWeek: number;
    volumeThisWeek: number;
    prsThisMonth: number;
    plans: Array<{ id: string; name: string; totalDays: number; doneThisWeek: number; percent: number }>;
  };
}

interface ListResponse {
  items: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

const ALL = "__all__";

// ─── Helpers ───────────────────────────────────────────────────────────────

function accountAge(createdAt: string): string {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const days = Math.floor((now - created) / 86400000);
  if (days < 1) return "Hoje";
  if (days === 1) return "1 dia";
  if (days < 30) return `${days} dias`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 mês";
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}a ${rem}m` : `${years}a`;
}

function roleBadge(role: string) {
  if (role === "admin") return <Badge className="bg-primary/15 text-primary border-primary/25">Admin</Badge>;
  if (role === "support") return <Badge variant="outline" className="border-amber-500/40 text-amber-600">Support</Badge>;
  return null;
}

// ─── Componente principal ──────────────────────────────────────────────────

export default function AdminUsuariosPage() {
  // Estado da tabela
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [sort, setSort] = useState("newest");

  // Drawer de detalhes
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSessionPage, setDetailSessionPage] = useState(1);

  // Modal: trocar e-mail
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<UserListItem | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  // Modal: reset de senha
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<UserListItem | null>(null);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Alert: bloquear/desbloquear
  const [toggleTarget, setToggleTarget] = useState<UserListItem | null>(null);
  const [toggleSaving, setToggleSaving] = useState(false);

  // Alert: trocar role
  const [roleTarget, setRoleTarget] = useState<UserListItem | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);

  // ─── Load listagem ─────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter !== ALL) params.set("role", roleFilter);
    if (statusFilter !== ALL) params.set("status", statusFilter);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", "20");

    try {
      const res = await apiGet<ListResponse>(`/api/admin/users?${params.toString()}`);
      setData(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, sort, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter, sort]);

  // ─── Load detalhe ──────────────────────────────────────────────────────

  const openDetail = async (user: UserListItem) => {
    setDetailUser(null);
    setDetailSessionPage(1);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiGet<UserDetail>(`/api/admin/users/${user.id}`);
      setDetailUser(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar detalhes");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadDetailSessions = useCallback(async (userId: string, p: number) => {
    try {
      const res = await apiGet<UserDetail>(`/api/admin/users/${userId}?sessionPage=${p}&sessionPageSize=5`);
      setDetailUser((prev) => prev ? { ...prev, sessions: res.sessions } : prev);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (detailUser && detailOpen) {
      loadDetailSessions(detailUser.user.id, detailSessionPage);
    }
  }, [detailSessionPage, detailUser?.user.id, detailOpen, loadDetailSessions]);

  // ─── Ações ─────────────────────────────────────────────────────────────

  const openEmailModal = (user: UserListItem) => {
    setEmailTarget(user);
    setEmailValue(user.email);
    setEmailOpen(true);
  };

  const handleSaveEmail = async () => {
    if (!emailTarget) return;
    setEmailSaving(true);
    try {
      await apiPut(`/api/admin/users/${emailTarget.id}`, { email: emailValue });
      toast.success(`E-mail alterado para ${emailValue}`);
      setEmailOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar e-mail");
    } finally {
      setEmailSaving(false);
    }
  };

  const openPasswordModal = (user: UserListItem) => {
    setPasswordTarget(user);
    setPasswordValue("");
    setGeneratedPassword(null);
    setPasswordOpen(true);
  };

  const handleResetPassword = async () => {
    if (!passwordTarget) return;
    setPasswordSaving(true);
    try {
      const res = await apiPost<{ success: boolean; generatedPassword?: string }>(
        `/api/admin/users/${passwordTarget.id}/reset-password`,
        passwordValue ? { password: passwordValue } : {}
      );
      if (res.generatedPassword) {
        setGeneratedPassword(res.generatedPassword);
      } else {
        toast.success("Senha alterada com sucesso");
        setPasswordOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao resetar senha");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleToggleDisable = async () => {
    if (!toggleTarget) return;
    setToggleSaving(true);
    try {
      await apiPut(`/api/admin/users/${toggleTarget.id}`, { disabled: !toggleTarget.disabled });
      toast.success(toggleTarget.disabled ? `${toggleTarget.name} desbloqueado` : `${toggleTarget.name} bloqueado`);
      setToggleTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar status");
    } finally {
      setToggleSaving(false);
    }
  };

  const handleToggleRole = async () => {
    if (!roleTarget) return;
    const newRole = roleTarget.role === "admin" ? "user" : "admin";
    setRoleSaving(true);
    try {
      await apiPut(`/api/admin/users/${roleTarget.id}`, { role: newRole });
      toast.success(`Role alterado para ${newRole}`);
      setRoleTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar role");
    } finally {
      setRoleSaving(false);
    }
  };

  const copyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copia o ID do usuário — usado pra criar treinos direto no banco (ex.:
  // scripts/sql/*.sql) sem precisar consultar a tabela User manualmente.
  const copyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado!");
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${data.total} usuário${data.total === 1 ? "" : "s"} cadastrado${data.total === 1 ? "" : "s"}`
              : "Carregando..."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Gerencie clientes e acesso</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="disabled">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
            <SelectItem value="mostActive">Mais ativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="hidden md:table-cell">Treinos</TableHead>
              <TableHead className="hidden md:table-cell">Sessões</TableHead>
              <TableHead className="hidden lg:table-cell">Volume</TableHead>
              <TableHead className="hidden lg:table-cell">Última atividade</TableHead>
              <TableHead className="hidden sm:table-cell">Conta</TableHead>
              <TableHead className="w-10 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!loading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data?.items.map((u) => (
                <TableRow
                  key={u.id}
                  className={u.disabled ? "opacity-60" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground font-black text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{u.name}</p>
                          {roleBadge(u.role)}
                          {u.disabled && (
                            <Badge variant="outline" className="border-destructive/40 text-destructive text-[10px] px-1.5">
                              Bloqueado
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <button
                          type="button"
                          onClick={() => copyUserId(u.id)}
                          title="Copiar ID completo do usuário"
                          className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70 hover:text-foreground transition-colors mt-0.5"
                        >
                          <Copy className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[9rem]">{u.id}</span>
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm tabular-nums">
                    {u.workoutCount}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm tabular-nums">
                    {u.sessionCount}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm tabular-nums">
                    {formatVolume(u.totalVolume)} kg
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {u.lastActiveAt ? relativeTime(u.lastActiveAt) : "Nunca"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {accountAge(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDetail(u)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-muted-foreground">
            Página {data.page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* ═══════════ Sheet de detalhes ═══════════ */}
      <Sheet open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setDetailUser(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
          {detailLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {detailUser && !detailLoading && (
            <div className="space-y-0">
              {/* Header do drawer */}
              <SheetHeader className="p-6 pb-4 border-b border-border/60">
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-black text-base">
                    {detailUser.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg leading-tight">{detailUser.user.name}</p>
                    <p className="text-sm text-muted-foreground">{detailUser.user.email}</p>
                    <button
                      type="button"
                      onClick={() => copyUserId(detailUser.user.id)}
                      title="Copiar ID do usuário"
                      className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/70 hover:text-foreground transition-colors mt-1"
                    >
                      <Copy className="w-3 h-3 shrink-0" />
                      {detailUser.user.id}
                    </button>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="p-6 space-y-6">
                {/* Ações rápidas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => { setDetailOpen(false); openEmailModal({ id: detailUser.user.id, email: detailUser.user.email, name: detailUser.user.name, role: detailUser.user.role, disabled: detailUser.user.disabled, disabledAt: null, createdAt: detailUser.user.createdAt, avatarUrl: null, workoutCount: 0, sessionCount: 0, totalVolume: 0, totalDurationSec: 0, lastActiveAt: null, prCount: 0 }); }}
                  >
                    <Mail className="w-3.5 h-3.5" /> E-mail
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => { setDetailOpen(false); openPasswordModal({ id: detailUser.user.id, email: detailUser.user.email, name: detailUser.user.name, role: detailUser.user.role, disabled: detailUser.user.disabled, disabledAt: null, createdAt: detailUser.user.createdAt, avatarUrl: null, workoutCount: 0, sessionCount: 0, totalVolume: 0, totalDurationSec: 0, lastActiveAt: null, prCount: 0 }); }}
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Senha
                  </Button>
                  <Button
                    variant={detailUser.user.disabled ? "default" : "outline"}
                    size="sm"
                    className={`gap-1.5 text-xs ${detailUser.user.disabled ? "" : "text-destructive hover:text-destructive"}`}
                    onClick={() => { setDetailOpen(false); setToggleTarget({ id: detailUser.user.id, email: detailUser.user.email, name: detailUser.user.name, role: detailUser.user.role, disabled: detailUser.user.disabled, disabledAt: null, createdAt: detailUser.user.createdAt, avatarUrl: null, workoutCount: 0, sessionCount: 0, totalVolume: 0, totalDurationSec: 0, lastActiveAt: null, prCount: 0 }); }}
                  >
                    {detailUser.user.disabled ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                    {detailUser.user.disabled ? "Desbloquear" : "Bloquear"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => { setDetailOpen(false); setRoleTarget({ id: detailUser.user.id, email: detailUser.user.email, name: detailUser.user.name, role: detailUser.user.role, disabled: detailUser.user.disabled, disabledAt: null, createdAt: detailUser.user.createdAt, avatarUrl: null, workoutCount: 0, sessionCount: 0, totalVolume: 0, totalDurationSec: 0, lastActiveAt: null, prCount: 0 }); }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {detailUser.user.role === "admin" ? "Remover admin" : "Tornar admin"}
                  </Button>
                </div>

                {/* Info do perfil */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border/60 p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Conta criada</p>
                    <p className="font-semibold">{formatDate(detailUser.user.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{accountAge(detailUser.user.createdAt)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Target className="w-3 h-3" /> Role</p>
                    <p className="font-semibold capitalize">{detailUser.user.role}</p>
                    {detailUser.user.disabled && detailUser.user.disabledAt && (
                      <p className="text-xs text-destructive">Bloqueado em {formatDate(detailUser.user.disabledAt)}</p>
                    )}
                  </div>
                  {detailUser.user.goal && (
                    <div className="col-span-2 rounded-lg border border-border/60 p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Objetivo</p>
                      <p className="font-medium">{detailUser.user.goal}</p>
                    </div>
                  )}
                </div>

                {/* Estatísticas gerais */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Estatísticas
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard icon={<Dumbbell className="w-4 h-4" />} label="Treinos criados" value={String(detailUser.workouts.length)} />
                    <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Sessões" value={String(detailUser.sessions.total)} />
                    <StatCard icon={<Target className="w-4 h-4" />} label="PRs" value={String(data?.items.find(i => i.id === detailUser.user.id)?.prCount ?? 0)} />
                    <StatCard icon={<Clock className="w-4 h-4" />} label="Tempo total" value={formatDuration(detailUser.stats.avgDuration * detailUser.sessions.total)} />
                    <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Vol. médio/sessão" value={`${formatVolume(detailUser.stats.avgVolume)} kg`} />
                    <StatCard icon={<Calendar className="w-4 h-4" />} label="Maior streak" value={`${detailUser.stats.streakDays} dia${detailUser.stats.streakDays !== 1 ? "s" : ""}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Peso corporal" value={detailUser.user.weight ? `${detailUser.user.weight} kg` : "—"} />
                    <StatCard icon={<Calendar className="w-4 h-4" />} label="Fotos de progresso" value={String(detailUser.progressPhotoCount)} />
                  </div>
                </div>

                {/* Relatório de aderência */}
                {detailUser.report && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Relatório (semana / mês)
                    </h3>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Aderência esta semana</p>
                          <p className="text-sm font-medium">
                            {detailUser.report.doneAssignedThisWeek}/{detailUser.report.assignedWorkouts} treinos com sessão
                          </p>
                        </div>
                        <p className="text-2xl font-black text-primary tabular-nums">
                          {detailUser.report.adherencePercent}%
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${detailUser.report.adherencePercent}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-background/60 p-2">
                          <p className="text-lg font-black tabular-nums">{detailUser.report.sessionsThisWeek}</p>
                          <p className="text-[10px] text-muted-foreground">Sessões/sem</p>
                        </div>
                        <div className="rounded-lg bg-background/60 p-2">
                          <p className="text-lg font-black tabular-nums">{formatVolume(detailUser.report.volumeThisWeek)}</p>
                          <p className="text-[10px] text-muted-foreground">kg / sem</p>
                        </div>
                        <div className="rounded-lg bg-background/60 p-2">
                          <p className="text-lg font-black tabular-nums">{detailUser.report.prsThisMonth}</p>
                          <p className="text-[10px] text-muted-foreground">PRs / mês</p>
                        </div>
                      </div>
                      {detailUser.report.plans.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-xs font-semibold text-muted-foreground">Planos</p>
                          {detailUser.report.plans.map((pl) => (
                            <div key={pl.id} className="flex items-center justify-between text-xs">
                              <span className="truncate font-medium">{pl.name}</span>
                              <span className="tabular-nums text-muted-foreground shrink-0 ml-2">
                                {pl.doneThisWeek}/{pl.totalDays} · {pl.percent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Treinos do usuário */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-primary" /> Treinos ({detailUser.workouts.length})
                  </h3>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
                    {detailUser.workouts.length === 0 && (
                      <p className="text-sm text-muted-foreground p-3">Nenhum treino criado.</p>
                    )}
                    {detailUser.workouts.map((w) => (
                      <div key={w.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="font-medium truncate">{w.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatDate(w.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sessões recentes */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Sessões recentes
                  </h3>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
                    {detailUser.sessions.items.length === 0 && (
                      <p className="text-sm text-muted-foreground p-3">Nenhuma sessão registrada.</p>
                    )}
                    {detailUser.sessions.items.map((s) => (
                      <div key={s.id} className="px-3 py-2.5 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{s.workoutName}</span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">{relativeTime(s.startedAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatDuration(s.durationSec)}</span>
                          <span>·</span>
                          <span>{formatVolume(s.totalVolume)} kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {detailUser.sessions.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={detailSessionPage <= 1}
                        onClick={() => setDetailSessionPage((p) => p - 1)}
                        className="h-7 text-xs"
                      >
                        Anterior
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {detailSessionPage}/{detailUser.sessions.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={detailSessionPage >= detailUser.sessions.totalPages}
                        onClick={() => setDetailSessionPage((p) => p + 1)}
                        className="h-7 text-xs"
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ═══════════ Dialog: Trocar e-mail ═══════════ */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar e-mail</DialogTitle>
            <DialogDescription>
              Altere o e-mail de <strong>{emailTarget?.name}</strong> ({emailTarget?.email}).
              O usuário precisará usar o novo e-mail no próximo login.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="new-email">Novo e-mail</Label>
            <Input
              id="new-email"
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="novo@email.com"
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEmail} disabled={emailSaving || !emailValue.trim() || emailValue === emailTarget?.email}>
              {emailSaving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Dialog: Reset de senha ═══════════ */}
      <Dialog open={passwordOpen} onOpenChange={(open) => { setPasswordOpen(open); setGeneratedPassword(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resetar senha</DialogTitle>
            <DialogDescription>
              {generatedPassword
                ? "Senha gerada com sucesso. Copie e envie ao usuário."
                : `Defina uma nova senha para ${passwordTarget?.name} ou deixe vazio para gerar uma automática.`}
            </DialogDescription>
          </DialogHeader>
          {generatedPassword ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <code className="flex-1 font-mono text-lg font-bold tracking-wider select-all">
                  {generatedPassword}
                </code>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={copyPassword}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Envie esta senha ao usuário por WhatsApp, e-mail ou outro canal. Ele deverá alterá-la no primeiro acesso.
              </p>
            </div>
          ) : (
            <div className="py-2">
              <Label htmlFor="new-password">Nova senha (opcional)</Label>
              <Input
                id="new-password"
                type="text"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="Deixe vazio para gerar automaticamente"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Se não preencher, uma senha aleatória de 12 caracteres será gerada e exibida para você copiar.
              </p>
            </div>
          )}
          <DialogFooter>
            {!generatedPassword && <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancelar</Button>}
            {generatedPassword ? (
              <Button onClick={() => setPasswordOpen(false)}>Fechar</Button>
            ) : (
              <Button onClick={handleResetPassword} disabled={passwordSaving}>
                {passwordSaving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                {passwordValue ? "Definir senha" : "Gerar senha"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Alert: Bloquear/Desbloquear ═══════════ */}
      <AlertDialog open={!!toggleTarget} onOpenChange={(open) => { if (!open) setToggleTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.disabled ? "Desbloquear" : "Bloquear"} {toggleTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.disabled
                ? "O usuário voltará a ter acesso ao app normalmente."
                : "O usuário será imediatamente deslogado e não conseguirá acessar o app até ser desbloqueado. Todos os seus dados são mantidos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleDisable}
              disabled={toggleSaving}
              className={toggleTarget?.disabled ? "" : "bg-destructive hover:bg-destructive/90"}
            >
              {toggleSaving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {toggleTarget?.disabled ? "Desbloquear" : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══════════ Alert: Trocar role ═══════════ */}
      <AlertDialog open={!!roleTarget} onOpenChange={(open) => { if (!open) setRoleTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {roleTarget?.role === "admin" ? "Remover" : "Concedir"} acesso de admin
            </AlertDialogTitle>
            <AlertDialogDescription>
{roleTarget?.role === "admin" ? (
  <span>{roleTarget?.name} perderá acesso ao painel administrativo.</span>
) : (
  <span>{roleTarget?.name} terá acesso completo ao painel administrativo.</span>
)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={roleSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleRole} disabled={roleSaving}>
              {roleSaving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3 space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">{icon} {label}</p>
      <p className="font-bold text-base tabular-nums">{value}</p>
    </div>
  );
}
