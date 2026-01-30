import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetForm } from "@/components/budget-form";
import { GoalForm } from "@/components/goal-form";
import { GoalList } from "@/components/goal-list";
import {
  IconTarget,
  IconLayoutDashboard,
  IconChartPie,
  IconFlag,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* --- SECTION 1: CONFIGURATION GRID --- */}
      <div className="grid gap-6 md:grid-cols-2 px-4 lg:px-0">
        {/* Monthly Allocation Card */}
        <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-500">
                <IconChartPie size={18} strokeWidth={2.5} />
              </div>
              <Badge
                variant="secondary"
                className="text-[9px] font-black uppercase tracking-widest px-2"
              >
                Allocation
              </Badge>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">
              Monthly Limit
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Establish your total spending threshold
            </p>
          </div>
          <BudgetForm initialAmount={budget?.monthly_amount || 0} />
        </div>

        {/* New Objective Card */}
        <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-500">
                <IconFlag size={18} strokeWidth={2.5} />
              </div>
              <Badge
                variant="secondary"
                className="text-[9px] font-black uppercase tracking-widest px-2"
              >
                Objectives
              </Badge>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">
              Initial Goal
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Initialize new financial target
            </p>
          </div>
          <GoalForm />
        </div>
      </div>

      {/* --- SECTION 2: MONITORING --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4 lg:px-1">
          <IconTarget className="text-indigo-600 size-7" strokeWidth={2.5} />
          <div className="text-left">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">
              Wealth Monitoring
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mt-1">
              Real-time objective performance tracking
            </p>
          </div>
        </div>
        <div className="px-4 lg:px-0 pb-20">
          <GoalList goals={goals || []} />
        </div>
      </div>
    </div>
  );
}

export default function BudgetingPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-8 py-8 w-full max-w-none text-left">
      {/* Sync Layout Nebula */}
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="px-4 lg:px-0 space-y-2">
        <Badge className="bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3">
          Registry Alpha
        </Badge>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
          <IconLayoutDashboard className="text-indigo-600 size-8" /> Budgeting
        </h2>
        <p className="text-sm text-muted-foreground font-medium italic-none">
          Manage monthly allocations and track long-term capital objectives.
        </p>
      </div>

      <Suspense fallback={<BudgetingSkeleton />}>
        <BudgetingContent />
      </Suspense>
    </div>
  );
}

function BudgetingSkeleton() {
  return (
    <div className="p-4 space-y-10 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-[2.5rem]" />
        <Skeleton className="h-64 rounded-[2.5rem]" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
