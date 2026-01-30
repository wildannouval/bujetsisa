import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DailySpendingChart } from "@/components/daily-spending-chart";
import { ExportPDFButton } from "@/components/export-pdf-button";
import {
  IconFileAnalytics,
  IconTrendingUp,
  IconArrowDownRight,
  IconArrowUpRight,
  IconChartBar,
  IconTargetArrow,
  IconCalendarStats,
  IconInbox,
} from "@tabler/icons-react";
import { MonthPicker } from "@/components/month-picker";

async function ReportsContent({ month }: { month?: string }) {
  const supabase = await createClient();
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

  const [{ data: categories }, { data: transactions }, { data: wallets }] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("transactions")
        .select(`*, categories(name, color)`)
        .gte("date", firstDay)
        .lte("date", lastDay),
      supabase.from("wallets").select("balance"),
    ]);

  const totalBalance =
    wallets?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;
  const totalIncome =
    transactions
      ?.filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalExpense =
    transactions
      ?.filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const savingRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;

  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
  ).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    date: i + 1,
    amount:
      transactions
        ?.filter(
          (t) => t.type === "expense" && new Date(t.date).getDate() === i + 1,
        )
        .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-4 lg:px-0 text-left">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3">
            Audit Intelligence
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <IconFileAnalytics className="text-indigo-600 size-8" /> Analytics
          </h2>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border w-fit">
            <IconCalendarStats
              size={16}
              className="text-muted-foreground ml-2"
            />
            <MonthPicker currentMonth={selectedMonthStr} />
          </div>
        </div>
        <ExportPDFButton
          data={transactions || []}
          summary={{
            income: totalIncome,
            expense: totalExpense,
            balance: totalBalance,
          }}
        />
      </div>

      {/* 2. TOP STRATEGIC CARDS (Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-8 flex flex-col justify-between shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Total Revenue
          </p>
          <p className="text-3xl font-black text-green-500 tracking-tighter">
            Rp {totalIncome.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-8 flex flex-col justify-between shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Total Burn
          </p>
          <p className="text-3xl font-black text-red-500 tracking-tighter">
            Rp {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-[2rem] border-none bg-indigo-600 p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <IconTrendingUp className="absolute right-[-10px] bottom-[-10px] size-24 opacity-10" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-4 text-indigo-100">
            Saving Efficiency
          </p>
          <p className="text-5xl font-black tracking-tighter">{savingRate}%</p>
        </div>
      </div>

      {/* 3. CORE ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Daily Trend */}
        <div className="lg:col-span-4 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl p-6 md:p-10 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <IconChartBar className="text-indigo-600" /> Daily Volatility
          </h3>
          {transactions && transactions.length > 0 ? (
            <DailySpendingChart data={dailyData} />
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center opacity-20">
              <IconInbox size={48} />
              <p className="text-[10px] font-black uppercase mt-2">Zero Data</p>
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="lg:col-span-3 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl p-8 md:p-10">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <IconTargetArrow className="text-indigo-600" /> Sector Health
          </h3>
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {categories?.map((cat) => {
              const spent =
                transactions
                  ?.filter(
                    (t) => t.category_id === cat.id && t.type === "expense",
                  )
                  .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
              const limit = Number(cat.monthly_limit) || 0;
              const percent =
                limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const isOver = limit > 0 && spent > limit;

              return (
                <div key={cat.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[10px] font-black uppercase text-foreground">
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black tabular-nums ${isOver ? "text-red-500" : "text-muted-foreground opacity-60"}`}
                    >
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    className={`h-1 bg-muted ${isOver ? "[&>div]:bg-red-500" : "[&>div]:bg-indigo-500"}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. CASHFLOW EVALUATION (Deep Audit) */}
      <div className="px-4 lg:px-0">
        <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border bg-white/[0.01]">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <IconFileAnalytics className="text-indigo-600" /> Capital Flow
              Evaluation
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <AuditTile
              label="Monthly Inflow"
              value={totalIncome}
              color="text-green-500"
            />
            <AuditTile
              label="Monthly Outflow"
              value={totalExpense}
              color="text-red-500"
            />
            <AuditTile
              label="Net Residue"
              value={totalIncome - totalExpense}
              color={
                totalIncome - totalExpense >= 0
                  ? "text-indigo-500"
                  : "text-red-500"
              }
            />
            <AuditTile
              label="System Balance"
              value={totalBalance}
              color="text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-8 space-y-2 text-center md:text-left transition-colors hover:bg-white/[0.02]">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className={`text-xl md:text-2xl font-black tracking-tighter ${color}`}>
        Rp {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-8 py-8 w-full max-w-none font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Backlights */}
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent month={params.month} />
      </Suspense>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="p-4 space-y-10 animate-pulse">
      <div className="flex justify-between items-end">
        <Skeleton className="h-20 w-64 rounded-2xl" />
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-[2rem]" />
        <Skeleton className="h-32 rounded-[2rem]" />
        <Skeleton className="h-32 rounded-[2rem]" />
      </div>
      <div className="grid grid-cols-7 gap-6">
        <Skeleton className="col-span-4 h-80 rounded-[2.5rem]" />
        <Skeleton className="col-span-3 h-80 rounded-[2.5rem]" />
      </div>
    </div>
  );
}
