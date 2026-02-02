"use client";

import { Goal } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { deleteGoal, addToGoal, withdrawFromGoal } from "@/lib/actions/goals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GoalDialog } from "./goal-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Edit,
  MoreVertical,
  Plus,
  Trash,
  Minus,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalWithCalculations extends Goal {
  remaining?: number;
  percentage?: number;
  daysRemaining?: number | null;
  monthlySavingNeeded?: number | null;
}

interface GoalListProps {
  goals: GoalWithCalculations[];
}

export function GoalList({ goals }: GoalListProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [addingTo, setAddingTo] = useState<GoalWithCalculations | null>(null);
  const [withdrawingFrom, setWithdrawingFrom] =
    useState<GoalWithCalculations | null>(null);

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const handleDelete = async (id: string) => {
    if (confirm(t.common.confirm_delete)) {
      const result = await deleteGoal(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t.goals.delete_success);
        router.refresh();
      }
    }
  };

  const handleAddAmount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingTo) return;

    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get("amount") as string;
    const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    const result = await addToGoal(addingTo.id, amount);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(t.goals.add_amount_success);
      setAddingTo(null);
      router.refresh();
    }
  };

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!withdrawingFrom) return;

    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get("amount") as string;
    const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    const result = await withdrawFromGoal(withdrawingFrom.id, amount);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(t.goals.withdraw_success);
      setWithdrawingFrom(null);
      router.refresh();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500">{t.goals.status_completed}</Badge>
        );
      case "cancelled":
        return <Badge variant="secondary">{t.goals.status_cancelled}</Badge>;
      default:
        return <Badge variant="outline">{t.goals.status_active}</Badge>;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  const renderGoalCard = (goal: GoalWithCalculations) => (
    <Card
      key={goal.id}
      className={cn(
        "hover:shadow-md transition-all",
        goal.status === "completed" &&
          "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            {goal.icon || "🎯"}
          </div>
          <div>
            <h3 className="font-semibold">{goal.name}</h3>
            {getStatusBadge(goal.status)}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {goal.status === "active" && (
              <>
                <DropdownMenuItem onClick={() => setAddingTo(goal)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t.goals.add_amount}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWithdrawingFrom(goal)}>
                  <Minus className="mr-2 h-4 w-4" />
                  {t.goals.withdraw}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => setEditingGoal(goal)}>
              <Edit className="mr-2 h-4 w-4" />
              {t.common.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(goal.id)}
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
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.goals.progress}</span>
            <span className="font-semibold">{goal.percentage || 0}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full transition-all duration-500",
                getProgressColor(goal.percentage || 0),
              )}
              style={{ width: `${Math.min(goal.percentage || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(Number(goal.current_amount))}</span>
            <span>{formatCurrency(Number(goal.target_amount))}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{t.goals.remaining}</p>
            <p className="font-semibold text-sm">
              {formatCurrency(goal.remaining || 0)}
            </p>
          </div>
          {goal.target_date && (
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                {t.goals.target_date_label}
              </p>
              <p className="font-semibold text-sm">
                {format(new Date(goal.target_date), "dd MMM yyyy")}
              </p>
            </div>
          )}
        </div>

        {goal.status === "active" && (
          <div className="space-y-2">
            {goal.daysRemaining !== null &&
              goal.daysRemaining !== undefined && (
                <div className="flex items-center gap-2 text-xs">
                  <CalendarClock className="h-3 w-3 text-muted-foreground" />
                  <span
                    className={cn(
                      goal.daysRemaining < 0
                        ? "text-red-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {goal.daysRemaining > 0
                      ? `${goal.daysRemaining} ${t.goals.days_left}`
                      : goal.daysRemaining === 0
                        ? t.goals.due_today
                        : `${Math.abs(goal.daysRemaining)} ${t.goals.days_overdue}`}
                  </span>
                </div>
              )}
            {goal.monthlySavingNeeded && goal.monthlySavingNeeded > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t.goals.save_monthly}:{" "}
                  <span className="font-medium">
                    {formatCurrency(goal.monthlySavingNeeded)}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="all">
            {t.goals.filter_all} ({goals.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            {t.goals.active} ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t.goals.completed} ({completedGoals.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                {t.goals.no_goals}
              </div>
            ) : (
              goals.map(renderGoalCard)
            )}
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                {t.goals.no_active_goals}
              </div>
            ) : (
              activeGoals.map(renderGoalCard)
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                {t.goals.no_completed_goals}
              </div>
            ) : (
              completedGoals.map(renderGoalCard)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {editingGoal && (
        <GoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}

      {/* Add Amount Dialog */}
      <Dialog
        open={!!addingTo}
        onOpenChange={(open) => !open && setAddingTo(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{addingTo?.icon}</span>
              {t.goals.add_amount} - {addingTo?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAmount} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.goals.current}:
                </span>
                <span>{formatCurrency(Number(addingTo?.current_amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.goals.remaining}:
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(addingTo?.remaining || 0)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.goals.amount_label}</Label>
              <CurrencyInput name="amount" placeholder="0" required />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t.goals.add_amount}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={!!withdrawingFrom}
        onOpenChange={(open) => !open && setWithdrawingFrom(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{withdrawingFrom?.icon}</span>
              {t.goals.withdraw} - {withdrawingFrom?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.goals.available}:
                </span>
                <span className="font-medium">
                  {formatCurrency(Number(withdrawingFrom?.current_amount))}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.goals.amount_label}</Label>
              <CurrencyInput name="amount" placeholder="0" required />
            </div>
            <Button type="submit" variant="outline" className="w-full">
              <Minus className="mr-2 h-4 w-4" />
              {t.goals.withdraw}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
