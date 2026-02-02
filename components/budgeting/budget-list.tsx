"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical, Trash, AlertTriangle } from "lucide-react";
import { Budget, Category } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { deleteBudget } from "@/lib/actions/budgets";
import { toast } from "sonner";
import { BudgetDialog } from "./budget-dialog";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BudgetWithSpending extends Budget {
  category?: { id: string; name: string; icon: string; type?: string };
  spent?: number;
  percentage?: number;
  remaining?: number;
  isOverBudget?: boolean;
}

interface BudgetListProps {
  budgets: BudgetWithSpending[];
  categories: Category[];
}

export function BudgetList({ budgets, categories }: BudgetListProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm(t.common.confirm_delete)) {
      const result = await deleteBudget(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t.budgeting.delete_success);
        router.refresh();
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "weekly":
        return t.budgeting.periods.weekly;
      case "yearly":
        return t.budgeting.periods.yearly;
      default:
        return t.budgeting.periods.monthly;
    }
  };

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
            {t.budgeting.no_budgets}
          </div>
        ) : (
          budgets.map((budget) => (
            <Card
              key={budget.id}
              className={cn(
                "hover:shadow-md transition-all",
                budget.isOverBudget && "border-red-300 dark:border-red-800",
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-lg",
                      budget.isOverBudget
                        ? "bg-red-100 dark:bg-red-900/20"
                        : "bg-primary/10",
                    )}
                  >
                    {budget.category?.icon || "📦"}
                  </div>
                  <div>
                    <h3 className="font-semibold">{budget.category?.name}</h3>
                    <Badge variant="outline" className="text-xs font-normal">
                      {getPeriodLabel(budget.period)}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingBudget(budget)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(budget.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t.common.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t.budgeting.spent}
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        budget.isOverBudget ? "text-red-600" : "",
                      )}
                    >
                      {formatCurrency(budget.spent || 0)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={budget.percentage || 0} className="h-3" />
                    <div
                      className={cn(
                        "absolute inset-0 h-3 rounded-full transition-all",
                        getProgressColor(
                          budget.percentage || 0,
                          budget.isOverBudget || false,
                        ),
                      )}
                      style={{
                        width: `${Math.min(budget.percentage || 0, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "font-medium",
                        budget.isOverBudget
                          ? "text-red-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {budget.percentage || 0}% {t.budgeting.used}
                    </span>
                    <span className="text-muted-foreground">
                      {t.budgeting.of} {formatCurrency(budget.amount)}
                    </span>
                  </div>
                </div>

                {budget.isOverBudget && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{t.budgeting.exceeded_warning}</span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t.budgeting.remaining}
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(budget.remaining || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {editingBudget && (
        <BudgetDialog
          budget={editingBudget}
          categories={categories}
          open={!!editingBudget}
          onOpenChange={(open) => !open && setEditingBudget(null)}
        />
      )}
    </>
  );
}
