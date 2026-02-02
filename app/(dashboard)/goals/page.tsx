import { GoalDialog } from "@/components/goals/goal-dialog";
import { GoalList } from "@/components/goals/goal-list";
import { GoalSummary } from "@/components/goals/goal-summary";
import { getGoals, getGoalStats } from "@/lib/actions/goals";

export default async function GoalsPage() {
  const [goals, stats] = await Promise.all([
    getGoals(),
    getGoalStats().catch(() => ({
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      totalTarget: 0,
      totalSaved: 0,
      overallProgress: 0,
    })),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Target Keuangan</h1>
        <GoalDialog />
      </div>

      <GoalSummary stats={stats} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Daftar Target</h2>
        <GoalList goals={goals} />
      </div>
    </div>
  );
}
