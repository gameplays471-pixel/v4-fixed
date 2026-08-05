import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling("GET /api/auth/me", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  return NextResponse.json({ user: user ?? null });
});
