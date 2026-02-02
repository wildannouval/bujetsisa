"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface BudgetSummaryProps {
  stats: {
    totalBudgets: number;
    totalBudgeted: number;
    totalSpent: number;
    onTrack: number;
    overBudget: number;
  };
}

export function BudgetSummary({ stats }: BudgetSummaryProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const usagePercent =
    stats.totalBudgeted > 0
      ? Math.round((stats.totalSpent / stats.totalBudgeted) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-100">
                {t.budgeting.total_budgeted}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalBudgeted)}
              </p>
              <p className="text-xs text-indigo-200 mt-1">
                {stats.totalBudgets} {t.budgeting.active_budgets}
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Target className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.budgeting.total_spent}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalSpent)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {usagePercent}% {t.budgeting.of_budget}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.budgeting.on_track}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.onTrack}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.budgeting.budgets_on_track}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.budgeting.over_budget}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.overBudget}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.budgeting.budgets_exceeded}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
