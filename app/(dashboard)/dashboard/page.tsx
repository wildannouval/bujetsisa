import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseChart } from "@/components/expense-chart";
import { WeeklyBarChart } from "@/components/weekly-bar-chart";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Progress } from "@/components/ui/progress";
import { ExportPDFButton } from "@/components/export-pdf-button";
import { Badge } from "@/components/ui/badge";
import {
  IconWallet,
  IconArrowUpRight,
  IconArrowDownRight,
  IconMoneybagEdit,
  IconLayoutDashboard,
  IconHistory,
  IconFlame,
  IconTrophy,
  IconChartBar,
  IconCalendarStats,
  IconCreditCard,
  IconReceipt2,
  IconInbox,
} from "@tabler/icons-react";
import { MonthPicker } from "@/components/month-picker";
import { SaveSuggestionButton } from "@/components/save-suggestion-button";

interface DashboardContentProps {
  month?: string;
}

async function DashboardContent({ month }: DashboardContentProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const selectedMonthStr = month || now.toISOString().slice(0, 7);
  const selectedMonth = new Date(selectedMonthStr + "-01");
  const firstDay = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1,
  ).toISOString();
  const lastDay = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
  ).toISOString();

  const [
    { data: wallets },
    { data: budgetData },
    { data: goals },
    { data: debtsLoans },
    { data: monthTxs },
  ] = await Promise.all([
    supabase.from("wallets").select("balance"),
    supabase
      .from("budgets")
      .select("monthly_amount")
      .eq("user_id", user?.id)
      .single(),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: true }),
    supabase.from("debts_loans").select("*").eq("status", "pending"),
    supabase
      .from("transactions")
      .select(
        `id, amount, type, category_id, categories (name, color), date, description`,
      )
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date", { ascending: false }),
  ]);

  const totalBalance =
    wallets?.reduce((acc, curr) => acc + Number(curr.balance || 0), 0) || 0;
  const MONTHLY_BUDGET = budgetData?.monthly_amount || 0;
  const totalIncome =
    monthTxs
      ?.filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
  const totalExpense =
    monthTxs
      ?.filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
  const totalReceivable =
    debtsLoans
      ?.filter((d) => d.type === "receivable")
      .reduce(
        (acc, curr) =>
          acc + (Number(curr.amount) - Number(curr.current_amount || 0)),
        0,
      ) || 0;
  const totalDebt =
    debtsLoans
      ?.filter((d) => d.type === "debt")
      .reduce(
        (acc, curr) =>
          acc + (Number(curr.amount) - Number(curr.current_amount || 0)),
        0,
      ) || 0;

  const budgetUsagePercent =
    MONTHLY_BUDGET > 0
      ? Math.min((totalExpense / MONTHLY_BUDGET) * 100, 100)
      : 0;
  const remainingBudget = Math.max(MONTHLY_BUDGET - totalExpense, 0);
  const priorityGoal = goals?.find(
    (g) => Number(g.current_amount) < Number(g.target_amount),
  );

  const weeklyData = [
    { week: "W1", amount: 0 },
    { week: "W2", amount: 0 },
    { week: "W3", amount: 0 },
    { week: "W4", amount: 0 },
  ];
  monthTxs
    ?.filter((t) => t.type === "expense")
    .forEach((t) => {
      const day = new Date(t.date).getDate();
      if (day <= 7) weeklyData[0].amount += Number(t.amount);
      else if (day <= 14) weeklyData[1].amount += Number(t.amount);
      else if (day <= 21) weeklyData[2].amount += Number(t.amount);
      else weeklyData[3].amount += Number(t.amount);
    });

  const expenseChartData = (() => {
    const map: Record<string, { value: number; color: string }> = {};
    monthTxs
      ?.filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = Array.isArray(t.categories)
          ? t.categories[0]
          : t.categories;
        const name = cat?.name || "Other";
        if (!map[name])
          map[name] = { value: 0, color: cat?.color || "#818cf8" };
        map[name].value += Number(t.amount);
      });
    return Object.keys(map)
      .map((name) => ({ name, ...map[name] }))
      .sort((a, b) => b.value - a.value);
  })();

  const topExpense = expenseChartData[0];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20 px-4 lg:px-0">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Badge className="bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-0.5">
            Control Panel
          </Badge>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase flex items-center gap-2">
            <IconLayoutDashboard className="text-indigo-600 size-6 md:size-8" />{" "}
            Overview
          </h2>
          <div className="bg-muted/50 p-1 rounded-lg border border-border w-fit">
            <MonthPicker currentMonth={selectedMonthStr} />
          </div>
        </div>
        <ExportPDFButton
          data={monthTxs || []}
          summary={{
            income: totalIncome,
            expense: totalExpense,
            balance: totalBalance,
          }}
        />
      </div>

      {/* 2. PRIMARY BENTO GRID (Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Main Wallet */}
        <div className="sm:col-span-2 relative group rounded-[2rem] border border-indigo-500/20 bg-indigo-600 p-6 md:p-8 text-white overflow-hidden shadow-xl shadow-indigo-500/20">
          <IconWallet className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">
            Current Liquidity
          </p>
          <div className="text-3xl md:text-5xl font-black tracking-tighter flex items-baseline gap-1">
            <span className="text-xl opacity-60">Rp</span>
            <NumberTicker value={totalBalance} />
          </div>
        </div>

        {/* Inflow (Uang Masuk) */}
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 flex flex-col justify-between shadow-sm border-l-4 border-l-green-500/50">
          <div className="p-2.5 bg-green-500/10 rounded-xl w-fit text-green-500 mb-4">
            <IconArrowUpRight size={20} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Inflow
            </p>
            <p className="text-xl font-black text-green-500 tracking-tight">
              Rp <NumberTicker value={totalIncome} />
            </p>
          </div>
        </div>

        {/* Outflow (Uang Keluar) */}
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 flex flex-col justify-between shadow-sm border-l-4 border-l-red-500/50">
          <div className="p-2.5 bg-red-500/10 rounded-xl w-fit text-red-500 mb-4">
            <IconArrowDownRight size={20} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Outflow
            </p>
            <p className="text-xl font-black text-red-500 tracking-tight">
              Rp <NumberTicker value={totalExpense} />
            </p>
          </div>
        </div>
      </div>

      {/* 3. SECONDARY BENTO GRID (Budget & Liabilities) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget Progress Card */}
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 md:p-8 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Budget Usage
            </p>
            <Badge
              variant={budgetUsagePercent > 90 ? "destructive" : "secondary"}
              className="text-[9px] font-black"
            >
              {Math.round(budgetUsagePercent)}%
            </Badge>
          </div>
          <Progress value={budgetUsagePercent} className="h-1.5 bg-muted" />
          <div className="flex justify-between items-end">
            <p className="text-xs font-bold">
              Rp {totalExpense.toLocaleString("id-ID")}
            </p>
            <p className="text-[9px] font-black uppercase opacity-40">
              Limit: {MONTHLY_BUDGET.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Liabilities - Receivables */}
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <IconMoneybagEdit size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Receivables
              </p>
              <p className="text-lg font-black text-blue-500 tracking-tight">
                Rp {totalReceivable.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Liabilities - Debts */}
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 flex items-center justify-between group hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
              <IconCreditCard size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Active Debts
              </p>
              <p className="text-lg font-black text-red-500 tracking-tight">
                Rp {totalDebt.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ANALYTICS & HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-4 rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 md:p-8">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <IconChartBar className="text-indigo-600 size-5" /> Spending
            Velocity
          </h3>
          {monthTxs && monthTxs.length > 0 ? (
            <WeeklyBarChart data={weeklyData} />
          ) : (
            <EmptyStateMessage message="Insufficient data for visualization" />
          )}
        </div>

        {/* Major Burn & Suggestion */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-[2rem] border-none bg-orange-600 p-8 text-white relative overflow-hidden group shadow-lg">
            <IconFlame className="absolute right-[-20px] top-[-20px] size-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-4">
              Highest Burner
            </p>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-1 truncate">
              {topExpense?.name || "No Data"}
            </h3>
            <p className="text-xl font-bold opacity-90 tracking-tight">
              Rp {topExpense?.value.toLocaleString("id-ID") || "0"}
            </p>
          </div>

          {remainingBudget > 0 && priorityGoal ? (
            <div className="rounded-[2rem] border border-indigo-500/30 bg-indigo-500/[0.04] backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <IconTrophy className="text-indigo-600" size={20} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">
                  Residue Strategy
                </h4>
              </div>
              <p className="text-xs font-medium text-slate-400">
                Push{" "}
                <span className="font-bold text-indigo-500">
                  Rp {remainingBudget.toLocaleString("id-ID")}
                </span>{" "}
                to goal{" "}
                <span className="font-black text-foreground uppercase tracking-tighter underline underline-offset-4">
                  &quot;{priorityGoal.name}&quot;
                </span>
                ?
              </p>
              <SaveSuggestionButton
                goalId={priorityGoal.id}
                goalName={priorityGoal.name}
                amount={remainingBudget}
              />
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border p-8 flex flex-col items-center justify-center text-center space-y-2 opacity-40 h-[150px]">
              <IconTrophy size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">
                No strategy available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. HISTORY & GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Progress */}
        <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl p-8 space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            Wealth Targets
          </h3>
          {goals && goals.length > 0 ? (
            <div className="space-y-6">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[140px]">
                      {g.name}
                    </span>
                    <span className="text-[10px] font-black text-indigo-500">
                      {Math.round((g.current_amount / g.target_amount) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(g.current_amount / g.target_amount) * 100}
                    className="h-1 bg-muted rounded-full overflow-hidden"
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyStateMessage message="No active goals found" small />
          )}
        </div>

        {/* Transaction Ledger */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <IconHistory className="text-indigo-600 size-5" /> Recent Ledger
            </h3>
          </div>
          {monthTxs && monthTxs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {monthTxs.slice(0, 6).map((tx) => {
                const cat = Array.isArray(tx.categories)
                  ? tx.categories[0]
                  : tx.categories;
                return (
                  <div
                    key={tx.id}
                    className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2.5 rounded-xl ${tx.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                      >
                        <IconReceipt2 size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[120px] md:max-w-[200px]">
                          {tx.description || "Registry"}
                        </p>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">
                          {cat?.name || "General"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-black tabular-nums ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}
                      >
                        {tx.type === "income" ? "+" : "-"} Rp{" "}
                        {tx.amount.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[9px] font-bold uppercase text-muted-foreground opacity-30">
                        {new Date(tx.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyStateMessage message="Zero ledger entries for this period" />
          )}
        </div>
      </div>
    </div>
  );
}

// --- SHARED HELPER COMPONENTS ---

function EmptyStateMessage({
  message,
  small = false,
}: {
  message: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center space-y-3 opacity-20 ${small ? "py-10" : "py-28"}`}
    >
      <IconInbox size={small ? 32 : 48} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">
        {message}
      </p>
    </div>
  );
}

export default async function Page(props: {
  searchParams: Promise<{ month?: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-8 py-8">
      {/* Sync Layout Nebula */}
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardContent month={searchParams.month} />
      </Suspense>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="p-4 space-y-10 w-full animate-pulse">
      <div className="flex justify-between items-end mb-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        <Skeleton className="lg:col-span-2 h-48 rounded-[2rem]" />
        <Skeleton className="h-48 rounded-[2rem]" />
        <Skeleton className="h-48 rounded-[2rem]" />
      </div>
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-80 rounded-[2rem]" />
        <Skeleton className="lg:col-span-3 h-80 rounded-[2rem]" />
      </div>
    </div>
  );
}
