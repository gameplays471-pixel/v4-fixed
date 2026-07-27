import { WorkoutSummaryView } from "@/components/views/workout-summary";

export default async function WorkoutSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkoutSummaryView workoutId={id} />;
}
