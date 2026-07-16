"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, Filter } from "lucide-react";
import { ExerciseDetail } from "@/components/exercise-detail";
import { apiGet, apiPost } from "@/lib/api";
import { muscleGroups, equipmentTypes, levels } from "@/lib/exercises-data";
import { motion } from "framer-motion";

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
  imageUrl: string | null;
  gifUrl: string | null;
};

type Favorite = {
  id: string;
  exerciseId: string;
};

export function LibraryView() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Carregar exercícios
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterMuscle) params.set("muscleGroup", filterMuscle);
    if (filterEquipment) params.set("equipmentType", filterEquipment);
    if (filterLevel) params.set("level", filterLevel);
    
    apiGet<{ exercises: Exercise[] }>(`/api/exercises?${params.toString()}`)
      .then((data) => setExercises(data.exercises))
      .finally(() => setLoading(false));
  }, [search, filterMuscle, filterEquipment, filterLevel]);

  // Carregar favoritos
  useEffect(() => {
    apiGet<{ favorites: Favorite[] }>("/api/exercises/favorites").then((data) => {
      setFavorites(new Set(data.favorites.map((f) => f.exerciseId)));
    });
  }, []);

  // Agrupar por grupo muscular
  const grouped = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const ex of exercises) {
      if (!map.has(ex.muscleGroup)) map.set(ex.muscleGroup, []);
      map.get(ex.muscleGroup)!.push(ex);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [exercises]);

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

  const activeFiltersCount = [filterMuscle, filterEquipment, filterLevel].filter(Boolean).length;

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
                setFilterMuscle("");
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
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <FilterSelect
              label="Grupo muscular"
              value={filterMuscle}
              onChange={setFilterMuscle}
              options={muscleGroups as readonly string[]}
            />
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
          </motion.div>
        )}
      </div>

      {/* Lista agrupada */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />
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
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shrink-0 relative">
                            {ex.imageUrl || ex.gifUrl ? (
                              <>
                                <img
                                  src={ex.gifUrl || ex.imageUrl || ""}
                                  alt={ex.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    // fallback para inicial do nome
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                <span className="relative z-0">{ex.name.charAt(0)}</span>
                              </>
                            ) : (
                              <span>{ex.name.charAt(0)}</span>
                            )}
                          </div>
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
