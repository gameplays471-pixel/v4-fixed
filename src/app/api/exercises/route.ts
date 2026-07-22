import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Remove acentos e caixa (maiúscula/minúscula) para permitir busca e
// filtros "sem acento, minúsculo, etc". Ex: "peito" === "Peito" === "péíto".
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    // Suporta múltiplos grupos musculares separados por vírgula, ex:
    // ?muscleGroup=Peito,Costas,Ombros
    const muscleGroupParam = searchParams.get("muscleGroup") || "";
    const muscleGroupList = muscleGroupParam
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    const equipmentType = searchParams.get("equipmentType") || "";
    const level = searchParams.get("level") || "";
    const category = searchParams.get("category") || "";

    // Filtros exatos (não dependem de acento/caixa) continuam no banco.
    const where: Record<string, unknown> = {};
    if (equipmentType) where.equipmentType = equipmentType;
    if (level) where.level = level;
    if (category) where.category = category;

    const exercises = await db.exercise.findMany({
      where,
      orderBy: { name: "asc" },
    });

    // Busca por texto e grupo muscular feitas em memória, normalizando
    // acentos e caixa em ambos os lados — assim "peito", "Peito" e "pêito"
    // encontram os mesmos resultados.
    const normalizedSearch = normalize(search);
    const normalizedMuscleGroups = muscleGroupList.map(normalize);

    const filtered = exercises.filter((ex) => {
      if (normalizedMuscleGroups.length > 0 && !normalizedMuscleGroups.includes(normalize(ex.muscleGroup))) {
        return false;
      }
      if (normalizedSearch) {
        const haystack = normalize(
          [ex.name, ex.muscleGroup, ex.secondaryMuscles, ex.equipment]
            .filter(Boolean)
            .join(" ")
        );
        if (!haystack.includes(normalizedSearch)) return false;
      }
      return true;
    });

    return NextResponse.json({ exercises: filtered });
  } catch (e) {
    console.error("Get exercises error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
