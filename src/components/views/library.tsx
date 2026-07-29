"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Search, Heart, Filter } from "lucide-react";
import { ExerciseDetail } from "@/components/exercise-detail";
import { ExerciseThumb } from "@/components/exercise-media";
import { apiGet, apiPost } from "@/lib/api";
import { muscleGroups, equipmentTypes, levels } from "@/lib/exercises-data";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Exercise = {
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
  images: string[];
};

type Favorite = {
  id: string;
  exerciseId: string;
};

// Remove acentos e caixa (maiúscula/minúscula) para permitir busca
// "sem acento, minúsculo, etc" — mesmo comportamento que a API tinha.
// Ex: "peito" === "Peito" === "péíto".
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function LibraryView() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMuscles, setFilterMuscles] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleMuscle = (m: string) => {
    setFilterMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  // Carregar exercícios uma única vez (a lista inteira cabe em memória —
  // ~180 exercícios). Busca e filtros são aplicados no cliente, então
  // digitar/filtrar não dispara nenhuma requisição nova.
  useEffect(() => {
    setLoading(true);
    apiGet<{ exercises: Exercise[] }>("/api/exercises")
      .then((data) => setExercises(data.exercises))
      .catch((e) => {
        console.error("Erro ao carregar exercícios:", e);
        toast.error("Não foi possível carregar a biblioteca de exercícios.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Carregar favoritos
  useEffect(() => {
    apiGet<{ favorites: Favorite[] }>("/api/exercises/favorites").then((data) => {
      setFavorites(new Set(data.favorites.map((f) => f.exerciseId)));
    }).catch((e) => {
      // Não bloqueia a tela (favoritos são um "extra" sobre a lista já
      // carregada acima) — só evita a rejeição de promise não tratada e
      // deixa registrado o motivo caso o usuário reclame de favoritos
      // sumindo/não marcando.
      console.error("Erro ao carregar favoritos:", e);
    });
  }, []);

  // Filtrar (busca + filtros) e agrupar por grupo muscular — tudo no
  // cliente, instantâneo e sem rede.
  const grouped = useMemo(() => {
    const term = normalize(search);

    const filtered = exercises.filter((ex) => {
      if (filterMuscles.length > 0 && !filterMuscles.includes(ex.muscleGroup)) return false;
      if (filterEquipment && ex.equipmentType !== filterEquipment) return false;
      if (filterLevel && ex.level !== filterLevel) return false;

      if (term) {
        const haystack = normalize(
          [ex.name, ex.muscleGroup, ex.secondaryMuscles, ex.equipment, ex.equipmentType]
            .filter(Boolean)
            .join(" ")
        );
        if (!haystack.includes(term)) return false;
      }

      return true;
    });

    const map = new Map<string, Exercise[]>();
    for (const ex of filtered) {
      if (!map.has(ex.muscleGroup)) map.set(ex.muscleGroup, []);
      map.get(ex.muscleGroup)!.push(ex);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [exercises, search, filterMuscles, filterEquipment, filterLevel]);

  const toggleFavorite = async (exerciseId: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(exerciseId)) {
      newFavs.delete(exerciseId);
    } else {
      newFavs.add(exerciseId);
    }
    setFavorites(newFavs);
    
    try {
      await apiPost("/api/exercises/favorites", { exerciseId });
    } catch {
      // Reverter em caso de erro
      setFavorites(favorites);
    }
  };

  const activeFiltersCount = filterMuscles.length + [filterEquipment, filterLevel].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Exercícios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {exercises.length} exercícios disponíveis · base de academias brasileiras
        </p>
      </div>

      {/* Busca */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar exercício, músculo, equipamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card h-12"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-9"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{activeFiltersCount}</Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterMuscles([]);
                setFilterEquipment("");
                setFilterLevel("");
              }}
              className="h-9 text-xs"
            >
              Limpar filtros
            </Button>
          )}
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                Grupo muscular {filterMuscles.length > 0 && `(${filterMuscles.length} selecionado${filterMuscles.length > 1 ? "s" : ""})`}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {muscleGroups.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMuscle(m)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      filterMuscles.includes(m)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FilterSelect
                label="Equipamento"
                value={filterEquipment}
                onChange={setFilterEquipment}
                options={equipmentTypes as readonly string[]}
              />
              <FilterSelect
                label="Nível"
                value={filterLevel}
                onChange={setFilterLevel}
                options={levels as readonly string[]}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Lista agrupada */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24 rounded-xl" style={{ animationDelay: `${i*0.05}s` }} />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nenhum exercício encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map(([group, exs]) => (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold">{group}</h2>
                <Badge variant="secondary" className="text-xs">{exs.length}</Badge>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exs.map((ex, i) => (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  >
                    <Card
                      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedId(ex.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 min-w-0 flex-1">
                          <ExerciseThumb images={ex.images} name={ex.name} className="w-14 h-14 rounded-lg" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{ex.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {ex.equipment} · {ex.equipmentType}
                            </p>
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5">
                                {ex.level}
                              </Badge>
                              {ex.secondaryMuscles && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5">
                                  +{ex.secondaryMuscles.split(",")[0]}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(ex.id);
                          }}
                          className={`p-2 rounded-lg transition-colors shrink-0 ${
                            favorites.has(ex.id)
                              ? "text-red-500 hover:bg-red-500/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                          aria-label="Favoritar"
                        >
                          <Heart className={`w-4 h-4 ${favorites.has(ex.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {selectedId && (
        <ExerciseDetail
          exerciseId={selectedId}
          isFavorite={favorites.has(selectedId)}
          onToggleFavorite={() => toggleFavorite(selectedId)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
