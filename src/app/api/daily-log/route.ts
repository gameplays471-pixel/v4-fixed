import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, dailyLogSchema } from "@/lib/validation";
import { startOfDay } from "@/lib/gamification";

// GET /api/daily-log?days=14 — histórico recente (usado pelas metas
// semanais do mini-game e, futuramente, por outras telas).
export const GET = withErrorHandling("Get daily logs", async (req: NextRequest) => {
  const user = await requireUser(req);
  const { searchParams } = new URL(req.url);
  const days = Math.min(Math.max(Number(searchParams.get("days")) || 14, 1), 90);

  const since = startOfDay();
  since.setDate(since.getDate() - (days - 1));

  const logs = await db.dailyLog.findMany({
    where: { userId: user.id, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  const todayStr = startOfDay().toISOString();
  const today = logs.find((l) => l.date.toISOString() === todayStr) ?? null;

  return NextResponse.json({ logs, today });
});

// PATCH /api/daily-log — upsert do registro de HOJE. Aceita `dietOnTrack`
// (substitui), `addWaterMl` (soma ao total do dia) e/ou `waterMl`
// (substitui o total do dia) — qualquer combinação num só request.
export const PATCH = withErrorHandling("Update daily log", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, dailyLogSchema, "PATCH /api/daily-log");
  if (!parsed.success) return parsed.response;
  const { dietOnTrack, addWaterMl, waterMl } = parsed.data;

  const today = startOfDay();
  const existing = await db.dailyLog.findUnique({ where: { userId_date: { userId: user.id, date: today } } });

  const nextWaterMl =
    waterMl !== undefined ? waterMl : addWaterMl !== undefined ? (existing?.waterMl ?? 0) + addWaterMl : undefined;

  const log = await db.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    create: {
      userId: user.id,
      date: today,
      dietOnTrack: dietOnTrack ?? false,
      waterMl: nextWaterMl ?? 0,
    },
    update: {
      ...(dietOnTrack !== undefined ? { dietOnTrack } : {}),
      ...(nextWaterMl !== undefined ? { waterMl: nextWaterMl } : {}),
    },
  });

  return NextResponse.json({ log });
});
