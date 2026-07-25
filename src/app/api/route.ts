import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling("GET /api", async () => {
  return NextResponse.json({ message: "Hello, world!" });
});
