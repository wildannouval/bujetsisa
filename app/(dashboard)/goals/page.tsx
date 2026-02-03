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
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Target Keuangan
        </h1>
        <GoalDialog />
      </div>

      <GoalSummary stats={stats} />

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">Daftar Target</h2>
        <GoalList goals={goals} />
      </div>
    </div>
  );
}
