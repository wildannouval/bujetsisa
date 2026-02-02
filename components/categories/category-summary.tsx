"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tags, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface CategorySummaryProps {
  stats: {
    totalCategories: number;
    incomeCategories: number;
    expenseCategories: number;
  };
}

export function CategorySummary({ stats }: CategorySummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.categories.total_categories}
              </p>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Tags className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.categories.income_categories}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.incomeCategories}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.categories.expense_categories}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.expenseCategories}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
