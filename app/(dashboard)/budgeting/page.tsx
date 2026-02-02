import { BudgetDialog } from "@/components/budgeting/budget-dialog";
import { BudgetList } from "@/components/budgeting/budget-list";
import { BudgetSummary } from "@/components/budgeting/budget-summary";
import { getBudgetsWithSpending, getBudgetStats } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/categories";

export default async function BudgetingPage() {
  const [budgets, categories, stats] = await Promise.all([
    getBudgetsWithSpending().catch(() => []),
    getCategories().catch(() => []),
    getBudgetStats().catch(() => ({
      totalBudgets: 0,
      totalBudgeted: 0,
      totalSpent: 0,
      onTrack: 0,
      overBudget: 0,
    })),
  ]);

  // Filter only expense categories for budgets
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Anggaran</h1>
        <BudgetDialog categories={expenseCategories} />
      </div>

      <BudgetSummary stats={stats} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Daftar Anggaran</h2>
        <BudgetList budgets={budgets} categories={expenseCategories} />
      </div>
    </div>
  );
}
