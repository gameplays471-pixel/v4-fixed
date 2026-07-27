import { ActiveWorkoutView } from "@/components/views/active-workout";

export default async function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ActiveWorkoutView workoutId={id} />;
}
