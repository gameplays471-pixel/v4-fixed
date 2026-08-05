"use client";

import { ActiveWorkoutView } from "@/components/views/active-workout";
import { use } from "react";

export default function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ActiveWorkoutView workoutId={id} />;
}
