import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetForm } from "@/components/budget-form";
import { GoalForm } from "@/components/goal-form";
import { GoalList } from "@/components/goal-list";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

async function BudgetingContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: budget } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user?.id)
    .single();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Budget & Goals</h2>
          <p className="text-muted-foreground">
            Set your monthly limits and track your financial goals.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
            <CardDescription>
              Set a limit for your monthly spending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm initialAmount={budget?.monthly_amount || 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Goal</CardTitle>
            <CardDescription>Create a savings target.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>
            Track your progress towards your savings targets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalList goals={goals || []} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function BudgetingPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 flex md:flex">
      <Suspense fallback={<BudgetingSkeleton />}>
        <BudgetingContent />
      </Suspense>
    </div>
  );
}

function BudgetingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
