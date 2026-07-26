"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { muscleGroups, equipmentTypes, levels, categories } from "@/lib/exercises-data";

export interface ExerciseFormValues {
  name: string;
  muscleGroup: string;
  secondaryMuscles: string;
  equipment: string;
  category: string;
  equipmentType: string;
  level: string;
  description: string;
  executionSteps: string;
  commonMistakes: string;
  tips: string;
  images: string[];
}

const emptyValues: ExerciseFormValues = {
  name: "",
  muscleGroup: "",
  secondaryMuscles: "",
  equipment: "",
  category: "",
  equipmentType: "",
  level: "",
  description: "",
  executionSteps: "",
  commonMistakes: "",
  tips: "",
  images: [],
};

interface ExerciseFormProps {
  initialValues?: Partial<ExerciseFormValues>;
  submitLabel: string;
  onSubmit: (values: ExerciseFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ExerciseForm({ initialValues, submitLabel, onSubmit, onCancel }: ExerciseFormProps) {
  const [values, setValues] = useState<ExerciseFormValues>({ ...emptyValues, ...initialValues });
  const [imagesText, setImagesText] = useState((initialValues?.images ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ExerciseFormValues>(key: K, value: ExerciseFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.name.trim() || !values.muscleGroup || !values.category || !values.level) {
      setError("Preencha nome, grupo muscular, categoria e nível — são obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const images = imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await onSubmit({ ...values, images });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar exercício");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="ex-name">Nome *</Label>
          <Input
            id="ex-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ex.: Supino reto com barra"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Grupo muscular *</Label>
          <Select value={values.muscleGroup} onValueChange={(v) => set("muscleGroup", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ex-secondary">Músculos secundários</Label>
          <Input
            id="ex-secondary"
            value={values.secondaryMuscles}
            onChange={(e) => set("secondaryMuscles", e.target.value)}
            placeholder="Ex.: Tríceps, Ombros (separado por vírgula)"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Categoria *</Label>
          <Select value={values.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Nível *</Label>
          <Select value={values.level} onValueChange={(v) => set("level", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Tipo de equipamento</Label>
          <Select value={values.equipmentType} onValueChange={(v) => set("equipmentType", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map((eq) => (
                <SelectItem key={eq} value={eq}>
                  {eq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ex-equipment">Equipamento (texto livre)</Label>
          <Input
            id="ex-equipment"
            value={values.equipment}
            onChange={(e) => set("equipment", e.target.value)}
            placeholder="Ex.: Barra reta + banco plano"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="ex-description">Descrição</Label>
          <Textarea
            id="ex-description"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="ex-steps">Passo a passo (uma instrução por linha)</Label>
          <Textarea
            id="ex-steps"
            value={values.executionSteps}
            onChange={(e) => set("executionSteps", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ex-mistakes">Erros comuns</Label>
          <Textarea
            id="ex-mistakes"
            value={values.commonMistakes}
            onChange={(e) => set("commonMistakes", e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ex-tips">Dicas</Label>
          <Textarea id="ex-tips" value={values.tips} onChange={(e) => set("tips", e.target.value)} rows={3} />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="ex-images">Imagens (uma URL por linha)</Label>
          <Textarea
            id="ex-images"
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={3}
            placeholder="https://.../posicao-inicial.jpg&#10;https://.../posicao-final.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Faça upload da imagem em algum host (ex.: Vercel Blob) e cole a URL pública aqui.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
