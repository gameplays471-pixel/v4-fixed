"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Calendar, Target, Scale, Ruler, Save, LogOut, Shield, Bell, BellOff, BellRing, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { setToken } from "@/lib/api";
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
  type NotificationPermissionState,
} from "@/lib/notifications";
import { ThemeToggle } from "@/components/theme-toggle";

type UserProfile = {
  id: string; email: string; name: string; bio: string | null;
  weight: number | null; height: number | null; sex: string | null;
  birthDate: string | null; goal: string | null; avatarUrl: string | null;
};

export function ProfileView() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", weight: "", height: "", sex: "", birthDate: "", goal: "" });
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionState>("default");

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    apiGet<{ user: UserProfile }>("/api/profile").then((d) => {
      setUser(d.user);
      if (d.user) setForm({
        name: d.user.name || "", bio: d.user.bio || "",
        weight: d.user.weight?.toString() || "", height: d.user.height?.toString() || "",
        sex: d.user.sex || "",
        birthDate: d.user.birthDate ? new Date(d.user.birthDate).toISOString().split("T")[0] : "",
        goal: d.user.goal || "",
      });
    }).catch((e) => {
      // Sem isso, uma falha aqui deixava `loading=false` e `user=null` —
      // e o componente faz `if (!user) return null`, ou seja, tela
      // completamente em branco, sem nenhuma mensagem de erro nem forma
      // de tentar de novo além de recarregar a página manualmente.
      console.error("Erro ao carregar perfil:", e);
      toast.error("Não foi possível carregar seu perfil. Recarregue a página.");
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiPut<{ user: UserProfile }>("/api/profile", form);
      setUser(res.user);
      toast.success("Perfil atualizado!");
    } catch { toast.error("Erro ao atualizar perfil"); } finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setToken(null);
    window.location.reload();
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === "granted") {
      toast.success("Notificações ativadas! Você será avisado quando o descanso acabar.");
    } else if (result === "denied") {
      toast.error("Notificações bloqueadas. Ative nas configurações do navegador/celular.");
    }
  };

  if (loading) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {[0,1,2].map((i) => <LoadingSkeleton key={i} className="h-32 rounded-2xl border border-border/60 animate-shimmer" style={{ animationDelay: `${i*0.1}s` }} />)}
    </div>
  );

  if (!user) return null;

  const goalEmoji: Record<string, string> = {
    Hipertrofia: "💪", Força: "⚡", Emagrecimento: "🔥",
    Condicionamento: "🏃", Saúde: "❤️", Performance: "🏆",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie suas informações pessoais.</p>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 relative overflow-hidden border-primary/20"
          style={{ background: "linear-gradient(135deg, var(--hero-gradient-from) 0%, var(--hero-gradient-to) 100%)" }}>
          <div className="absolute top-0 right-0 w-48 h-32 pointer-events-none" style={{ background: "radial-gradient(circle, oklch(0.80 0.18 162 / 0.20), transparent 70%)" }} aria-hidden />
          <div className="flex items-center gap-5 relative">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-primary-foreground text-3xl font-black shadow-2xl shrink-0"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.70 0.20 200))", boxShadow: "0 8px 32px oklch(0.80 0.18 162 / 0.35)" }}>
              {user.name.charAt(0).toUpperCase()}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black">{user.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />{user.email}
              </p>
              {user.goal && (
                <p className="text-sm text-primary font-semibold mt-1.5 flex items-center gap-1">
                  {goalEmoji[user.goal] || "🎯"} {user.goal}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            {user.weight && (
              <div className="bg-background/20 rounded-xl p-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <div><p className="text-xs text-muted-foreground">Peso</p><p className="font-bold">{user.weight} kg</p></div>
              </div>
            )}
            {user.height && (
              <div className="bg-background/20 rounded-xl p-3 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                <div><p className="text-xs text-muted-foreground">Altura</p><p className="font-bold">{user.height} cm</p></div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 space-y-5">
          <h3 className="font-bold flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" /> Informações pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sexo</Label>
              <select id="sex" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}
                className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm">
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Nascimento</Label>
              <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal" className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Objetivo</Label>
              <select id="goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm">
                <option value="">Selecione</option>
                <option value="Hipertrofia">💪 Hipertrofia</option>
                <option value="Força">⚡ Força</option>
                <option value="Emagrecimento">🔥 Emagrecimento</option>
                <option value="Condicionamento">🏃 Condicionamento</option>
                <option value="Saúde">❤️ Saúde e bem-estar</option>
                <option value="Performance">🏆 Performance esportiva</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Peso (kg)</Label>
              <Input id="weight" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> Altura (cm)</Label>
              <Input id="height" type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..." rows={3} className="resize-none" />
          </div>
          <div className="flex justify-end pt-1">
            <Button onClick={handleSave} disabled={saving}
              className="h-11 px-6 rounded-xl bg-primary font-semibold shadow-lg shadow-primary/20 gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Aparncia */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm">Tema</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Alterne entre os modos claro e escuro.
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </Card>
      </motion.div>

      {/* Notificações */}
      {isNotificationSupported() && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  {notifPermission === "granted" ? (
                    <BellRing className="w-5 h-5 text-primary" />
                  ) : notifPermission === "denied" ? (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm">Notificações do timer</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notifPermission === "granted"
                      ? "Ativadas — você será avisado quando o descanso acabar."
                      : notifPermission === "denied"
                      ? "Bloqueadas no navegador. Ative nas configurações do site."
                      : "Avisa quando o descanso acabar, mesmo trocando de aba."}
                  </p>
                </div>
              </div>
              {notifPermission !== "granted" && notifPermission !== "denied" && (
                <Button variant="outline" onClick={handleEnableNotifications}
                  className="h-10 px-4 rounded-xl font-semibold gap-2 shrink-0">
                  <Bell className="w-4 h-4" /> Ativar
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Sair da conta</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Você precisará fazer login novamente.</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}
              className="h-10 px-4 rounded-xl hover:text-destructive hover:border-destructive hover:bg-destructive/5 font-semibold gap-2 shrink-0 transition-all">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
