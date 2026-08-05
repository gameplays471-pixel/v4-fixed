import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const muscleGroup = searchParams.get("muscleGroup") || "";
    const equipmentType = searchParams.get("equipmentType") || "";
    const level = searchParams.get("level") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { muscleGroup: { contains: search } },
        { secondaryMuscles: { contains: search } },
      ];
    }
    if (muscleGroup) where.muscleGroup = muscleGroup;
    if (equipmentType) where.equipmentType = equipmentType;
    if (level) where.level = level;
    if (category) where.category = category;

    const exercises = await db.exercise.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ exercises });
  } catch (e) {
    console.error("Get exercises error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
