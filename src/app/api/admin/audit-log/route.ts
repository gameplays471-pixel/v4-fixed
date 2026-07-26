import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withErrorHandling } from "@/lib/api-error";

// Histórico de ações do painel admin. Filtrável por entidade específica
// (ex.: ver tudo que já aconteceu com um exercício) ou geral (feed de
// atividade recente do painel).
export const GET = withErrorHandling("Admin: list audit log", async (req: NextRequest) => {
  await requireAdmin(req);

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType") || undefined;
  const entityId = searchParams.get("entityId") || undefined;
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const entries = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ entries });
});
