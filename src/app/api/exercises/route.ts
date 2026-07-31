import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-error";
import { parseIntParam } from "@/lib/validation";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export const GET = withErrorHandling("Get exercises", async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").trim();
  const muscleGroupParam = searchParams.get("muscleGroup") || "";
  const muscleGroupList = muscleGroupParam
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const equipmentType = searchParams.get("equipmentType") || "";
  const level = searchParams.get("level") || "";
  const category = searchParams.get("category") || "";

  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const paginate = pageParam != null || pageSizeParam != null;
  const page = paginate ? parseIntParam(pageParam, { default: 1, min: 1, max: 10_000 }) : 1;
  const pageSize = paginate
    ? parseIntParam(pageSizeParam, { default: 50, min: 1, max: 500 })
    : undefined;

  const where: Prisma.ExerciseWhereInput = {};
  if (equipmentType) where.equipmentType = equipmentType;
  if (level) where.level = level;
  if (category) where.category = category;
  if (muscleGroupList.length === 1) where.muscleGroup = muscleGroupList[0];
  else if (muscleGroupList.length > 1) where.muscleGroup = { in: muscleGroupList };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { muscleGroup: { contains: search, mode: "insensitive" } },
      { equipment: { contains: search, mode: "insensitive" } },
      { secondaryMuscles: { contains: search, mode: "insensitive" } },
    ];
  }

  const listSelect = {
    id: true,
    name: true,
    slug: true,
    muscleGroup: true,
    secondaryMuscles: true,
    equipment: true,
    category: true,
    equipmentType: true,
    level: true,
    description: true,
    images: true,
  } as const;

  const [total, exercises] = await Promise.all([
    paginate ? db.exercise.count({ where }) : Promise.resolve(0),
    db.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      select: listSelect,
      ...(pageSize != null ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
    }),
  ]);

  let result = exercises;
  if (search) {
    const normalizedSearch = normalize(search);
    result = exercises.filter((ex) => {
      const haystack = normalize(
        [ex.name, ex.muscleGroup, ex.secondaryMuscles, ex.equipment].filter(Boolean).join(" ")
      );
      return haystack.includes(normalizedSearch);
    });
  }

  return NextResponse.json({
    exercises: result,
    ...(paginate
      ? {
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / (pageSize || 1))),
        }
      : {}),
  });
});
