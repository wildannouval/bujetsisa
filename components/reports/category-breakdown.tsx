"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/use-translation";

interface CategoryBreakdownProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    amount: number;
    percentage: number;
  }>;
  totalExpense: number;
}

export function CategoryBreakdown({
  categories,
  totalExpense,
}: CategoryBreakdownProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.reports.expense_by_category}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {t.reports.total}: {formatCurrency(totalExpense)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t.reports.no_expenses}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.slice(0, 10).map((category, index) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {category.percentage}%
                    </span>
                    <span className="font-medium">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all ${colors[index % colors.length]}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
