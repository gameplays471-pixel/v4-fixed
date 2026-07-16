"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Calendar, Target, Scale, Ruler, Save, LogOut } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  weight: number | null;
  height: number | null;
  sex: string | null;
  birthDate: string | null;
  goal: string | null;
  avatarUrl: string | null;
};

export function ProfileView() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    weight: "",
    height: "",
    sex: "",
    birthDate: "",
    goal: "",
  });

  useEffect(() => {
    apiGet<{ user: User }>("/api/profile")
      .then((d) => {
        setUser(d.user);
        if (d.user) {
          setForm({
            name: d.user.name || "",
            bio: d.user.bio || "",
            weight: d.user.weight?.toString() || "",
            height: d.user.height?.toString() || "",
            sex: d.user.sex || "",
            birthDate: d.user.birthDate ? new Date(d.user.birthDate).toISOString().split("T")[0] : "",
            goal: d.user.goal || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiPut<{ user: User }>("/api/profile", form);
      setUser(res.user);
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie suas informações pessoais.</p>
      </div>

      {/* Header do perfil */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
            {user.goal && (
              <p className="text-xs text-primary mt-1">Objetivo: {user.goal}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Formulário */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Informações pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Sexo</Label>
            <select
              id="sex"
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm"
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Data de nascimento
            </Label>
            <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Objetivo
            </Label>
            <select
              id="goal"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm"
            >
              <option value="">Selecione</option>
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Força">Força</option>
              <option value="Emagrecimento">Emagrecimento</option>
              <option value="Condicionamento">Condicionamento</option>
              <option value="Saúde">Saúde e bem-estar</option>
              <option value="Performance">Performance esportiva</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-1">
              <Scale className="w-3 h-3" />
              Peso (kg)
            </Label>
            <Input id="weight" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              Altura (cm)
            </Label>
            <Input id="height" type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Conte um pouco sobre você..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-primary">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Sair da conta</h3>
            <p className="text-sm text-muted-foreground mt-1">Você precisará fazer login novamente.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="hover:text-destructive hover:border-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </Card>
    </div>
  );
}
