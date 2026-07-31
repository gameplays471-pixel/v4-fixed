import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling("Admin: list plan templates", async (req: NextRequest) => {
  await requireAdmin(req);

  const { searchParams } = new URL(req.url);
  const goal = searchParams.get("goal") || undefined;
  const sex = searchParams.get("sex") || undefined;
  const level = searchParams.get("level") || undefined;

  const plans = await db.workoutPlan.findMany({
    where: {
      isTemplate: true,
      ...(goal ? { templateGoal: goal } : {}),
      ...(sex ? { templateSex: sex } : {}),
      ...(level ? { templateLevel: level } : {}),
    },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          workout: {
            select: { id: true, name: true, color: true },
          },
        },
      },
    },
    orderBy: [{ templateGoal: "asc" }, { templateLevel: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ plans });
});
