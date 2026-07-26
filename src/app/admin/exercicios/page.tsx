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
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { muscleGroups, categories, levels } from "@/lib/exercises-data";
import { ExerciseForm, type ExerciseFormValues } from "./exercise-form";

interface AdminExercise {
  id: string;
  name: string;
  slug: string;
  muscleGroup: string;
  secondaryMuscles: string | null;
  equipment: string | null;
  category: string;
  equipmentType: string | null;
  level: string;
  description: string | null;
  executionSteps: string | null;
  commonMistakes: string | null;
  tips: string | null;
  images: string[];
  updatedAt: string;
}

interface ListResponse {
  items: AdminExercise[];
  total: number;
  page: number;
  totalPages: number;
}

const ALL = "__all__";

// Cor por grupo muscular — reaproveita a paleta de gráficos já definida em
// globals.css (--color-chart-1..5) em vez de inventar uma paleta nova só
// pra essa tabela, então o painel admin continua "da mesma família" que o
// resto do app mesmo com um layout mais denso.
const groupColors: Record<string, string> = {
  Peito: "var(--color-chart-1)",
  Costas: "var(--color-chart-2)",
  Pernas: "var(--color-chart-3)",
  Glúteos: "var(--color-chart-3)",
  Posteriores: "var(--color-chart-3)",
  Ombros: "var(--color-chart-4)",
  Tríceps: "var(--color-chart-4)",
  Bíceps: "var(--color-chart-4)",
  Abdômen: "var(--color-chart-5)",
  Trapézio: "var(--color-chart-2)",
  Antebraço: "var(--color-chart-4)",
  Panturrilhas: "var(--color-chart-3)",
  "Full Body": "var(--color-chart-1)",
};

export default function AdminExercisesPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [levelFilter, setLevelFilter] = useState(ALL);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminExercise | null>(null);
  const [deleting, setDeleting] = useState<AdminExercise | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (muscleGroupFilter !== ALL) params.set("muscleGroup", muscleGroupFilter);
    if (categoryFilter !== ALL) params.set("category", categoryFilter);
    if (levelFilter !== ALL) params.set("level", levelFilter);
    params.set("page", String(page));
    params.set("pageSize", "20");

    try {
      const res = await apiGet<ListResponse>(`/api/admin/exercises?${params.toString()}`);
      setData(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar exercícios");
    } finally {
      setLoading(false);
    }
  }, [search, muscleGroupFilter, categoryFilter, levelFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset de página quando um filtro muda (evita ficar numa página vazia).
  useEffect(() => {
    setPage(1);
  }, [search, muscleGroupFilter, categoryFilter, levelFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (ex: AdminExercise) => {
    setEditing(ex);
    setFormOpen(true);
  };

  const handleSubmit = async (values: ExerciseFormValues) => {
    const payload = {
      ...values,
      secondaryMuscles: values.secondaryMuscles || null,
      equipment: values.equipment || null,
      equipmentType: values.equipmentType || null,
      description: values.description || null,
      executionSteps: values.executionSteps || null,
      commonMistakes: values.commonMistakes || null,
      tips: values.tips || null,
    };

    if (editing) {
      await apiPut(`/api/admin/exercises/${editing.id}`, payload);
      toast.success("Exercício atualizado");
    } else {
      await apiPost("/api/admin/exercises", payload);
      toast.success("Exercício criado");
    }
    setFormOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      await apiDelete(`/api/admin/exercises/${deleting.id}`);
      toast.success("Exercício excluído");
      setDeleting(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Erro ao excluir exercício");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight">Exercícios</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} exercício${data.total === 1 ? "" : "s"} cadastrado${data.total === 1 ? "" : "s"}` : "Carregando..."}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Novo exercício
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou slug..."
            className="pl-9"
          />
        </div>
        <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Grupo muscular" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os grupos</SelectItem>
            {muscleGroups.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Nível" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os níveis</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden md:table-cell">Nível</TableHead>
              <TableHead className="hidden lg:table-cell">Equipamento</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!loading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Nenhum exercício encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data?.items.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="font-medium">
                    <button onClick={() => openEdit(ex)} className="hover:underline text-left">
                      {ex.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: `color-mix(in oklch, ${groupColors[ex.muscleGroup] ?? "var(--color-chart-1)"} 60%, transparent)`,
                        color: groupColors[ex.muscleGroup] ?? "var(--color-chart-1)",
                      }}
                    >
                      {ex.muscleGroup}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{ex.category}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{ex.level}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {ex.equipmentType || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ex)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(ex)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar exercício" : "Novo exercício"}</DialogTitle>
          </DialogHeader>
          <ExerciseForm
            key={editing?.id ?? "new"}
            initialValues={
              editing
                ? {
                    name: editing.name,
                    muscleGroup: editing.muscleGroup,
                    secondaryMuscles: editing.secondaryMuscles ?? "",
                    equipment: editing.equipment ?? "",
                    category: editing.category,
                    equipmentType: editing.equipmentType ?? "",
                    level: editing.level,
                    description: editing.description ?? "",
                    executionSteps: editing.executionSteps ?? "",
                    commonMistakes: editing.commonMistakes ?? "",
                    tips: editing.tips ?? "",
                    images: editing.images,
                  }
                : undefined
            }
            submitLabel={editing ? "Salvar alterações" : "Criar exercício"}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && (setDeleting(null), setDeleteError(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O exercício só pode ser excluído se não estiver em uso em nenhum
              treino ou sessão registrada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
