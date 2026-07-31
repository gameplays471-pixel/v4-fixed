import { NextResponse } from "next/server";
import { featureFlags } from "@/lib/feature-flags";
import { withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling("Get feature flags", async () => {
  return NextResponse.json({ flags: featureFlags });
});
