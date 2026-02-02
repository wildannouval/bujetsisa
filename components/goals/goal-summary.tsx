"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Clock, Wallet } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface GoalSummaryProps {
  stats: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalTarget: number;
    totalSaved: number;
    overallProgress: number;
  };
}

export function GoalSummary({ stats }: GoalSummaryProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">
                  {t.goals.total_saved}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalSaved)}
                </p>
                <p className="text-xs text-amber-200 mt-1">
                  {stats.overallProgress}% {t.goals.of_target}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.goals.total_target}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalTarget)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalGoals} {t.goals.goals}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.goals.active}
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.activeGoals}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.goals.in_progress}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/20">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.goals.completed}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedGoals}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.goals.goals_achieved}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t.goals.overall_progress}</span>
              <span className="text-muted-foreground">
                {formatCurrency(stats.totalSaved)} /{" "}
                {formatCurrency(stats.totalTarget)}
              </span>
            </div>
            <Progress value={stats.overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {stats.overallProgress}% {t.goals.achieved}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
