import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, conflict, requireAdmin, withErrorHandling } from "@/lib/api-error";
import { parseBody, exerciseSchema } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import { recordAudit } from "@/lib/audit-log";
import { normalizeSearchText } from "@/lib/search-utils";

// Listagem paginada para a tabela do painel admin. Diferente de
// /api/exercises (biblioteca pública, sem paginação — só 180 itens, cabe
// tudo em memória no cliente), aqui pensamos em escalar bem além disso
// e em oferecer busca/filtro server-side junto com metadados de página.
export const GET = withErrorHandling("Admin: list exercises", async (req: NextRequest) => {
  await requireAdmin(req);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const muscleGroup = searchParams.get("muscleGroup") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const equipmentType = searchParams.get("equipmentType") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));

  const where: Record<string, unknown> = {};
  if (muscleGroup) where.muscleGroup = muscleGroup;
  if (category) where.category = category;
  if (level) where.level = level;
  if (equipmentType) where.equipmentType = equipmentType;

  // Igual ao endpoint público: busca por nome/slug feita em memória depois
  // do filtro exato do banco, pra permitir "sem acento, minúsculo".
  const all = await db.exercise.findMany({ where, orderBy: { name: "asc" } });
  const normalizedSearch = normalizeSearchText(search);
  const filtered = normalizedSearch
    ? all.filter(
        (e) =>
          normalizeSearchText(e.name).includes(normalizedSearch) ||
          normalizeSearchText(e.slug).includes(normalizedSearch)
      )
    : all;

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const POST = withErrorHandling("Admin: create exercise", async (req: NextRequest) => {
  const admin = await requireAdmin(req);

  const parsed = await parseBody(req, exerciseSchema);
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  const slug = data.slug || slugify(data.name);
  if (!slug) throw badRequest("Não foi possível gerar um slug a partir do nome informado");

  const existing = await db.exercise.findUnique({ where: { slug } });
  if (existing) throw conflict(`Já existe um exercício com o slug "${slug}"`);

  const created = await db.exercise.create({
    data: { ...data, slug },
  });

  await recordAudit({
    req,
    actorId: admin.id,
    actorEmail: admin.email,
    action: "create",
    entityType: "exercise",
    entityId: created.id,
    after: created,
  });

  return NextResponse.json({ exercise: created }, { status: 201 });
});
