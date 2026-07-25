import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-error";

export const POST = withErrorHandling("Logout", async () => {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
});
