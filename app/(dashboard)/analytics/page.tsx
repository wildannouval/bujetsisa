import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { YearlyTrendChart } from "@/components/yearly-trend-chart";
import { YearlyExportPDFButton } from "@/components/yearly-export-pdf-button";
import { YearSelector } from "@/components/year-selector";
import { YearlyComparisonCard } from "@/components/yearly-comparison";
import { Badge } from "@/components/ui/badge";
import {
  IconChartBar,
  IconArrowUpRight,
  IconArrowDownRight,
  IconWallet,
  IconTrendingUp,
  IconLayoutDashboard,
  IconCalendarStats,
} from "@tabler/icons-react";

async function AnalyticsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ year?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const selectedYear = Number(searchParams?.year) || new Date().getFullYear();
  const prevYear = selectedYear - 1;

  const supabase = await createClient();

  // Fetch Current Year & Previous Year Data
  const [{ data: currentTxs }, { data: prevTxs }] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, type, date")
      .gte("date", `${selectedYear}-01-01`)
      .lte("date", `${selectedYear}-12-31`),
    supabase
      .from("transactions")
      .select("amount, type, date")
      .gte("date", `${prevYear}-01-01`)
      .lte("date", `${prevYear}-12-31`),
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const yearlyData = months.map((m) => ({ month: m, income: 0, expense: 0 }));

  let curIncome = 0,
    curExpense = 0,
    preIncome = 0,
    preExpense = 0;

  currentTxs?.forEach((tx) => {
    const monthIndex = new Date(tx.date).getMonth();
    const amount = Number(tx.amount);
    if (tx.type === "income") {
      yearlyData[monthIndex].income += amount;
      curIncome += amount;
    } else {
      yearlyData[monthIndex].expense += amount;
      curExpense += amount;
    }
  });

  prevTxs?.forEach((tx) => {
    const amount = Number(tx.amount);
    if (tx.type === "income") preIncome += amount;
    else preExpense += amount;
  });

  const curSaving = curIncome - curExpense;
  const preSaving = preIncome - preExpense;
  const growthRate =
    preSaving > 0
      ? (((curSaving - preSaving) / preSaving) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-4 lg:px-0 text-left">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3">
            Annual Audit
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <IconChartBar className="text-indigo-600 size-8" /> Macro Analytics
          </h2>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border w-fit">
            <IconCalendarStats
              size={16}
              className="text-muted-foreground ml-2"
            />
            <YearSelector currentYear={selectedYear} />
          </div>
        </div>
        <YearlyExportPDFButton
          year={selectedYear}
          data={yearlyData}
          summary={{ income: curIncome, expense: curExpense }}
        />
      </div>

      {/* 2. STRATEGIC MACRO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-8 flex flex-col justify-between shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Yearly Gross Revenue
          </p>
          <div className="space-y-4">
            <p className="text-3xl font-black text-green-500 tracking-tighter italic-none">
              Rp {curIncome.toLocaleString("id-ID")}
            </p>
            <YearlyComparisonCard
              current={curIncome}
              previous={preIncome}
              label="Revenue"
            />
          </div>
        </div>

        {/* Expense Card */}
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-8 flex flex-col justify-between shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Yearly Operating Burn
          </p>
          <div className="space-y-4">
            <p className="text-3xl font-black text-red-500 tracking-tighter italic-none">
              Rp {curExpense.toLocaleString("id-ID")}
            </p>
            <YearlyComparisonCard
              current={curExpense}
              previous={preExpense}
              label="Expense"
            />
          </div>
        </div>

        {/* Net Saving Card */}
        <div className="rounded-[2rem] border-none bg-indigo-600 p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <IconWallet className="absolute right-[-10px] bottom-[-10px] size-24 opacity-10" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-4 text-indigo-100">
            Annual Net Surplus
          </p>
          <div className="space-y-4">
            <p className="text-3xl font-black tracking-tighter">
              Rp {curSaving.toLocaleString("id-ID")}
            </p>
            <YearlyComparisonCard
              current={curSaving}
              previous={preSaving}
              label="Surplus"
            />
          </div>
        </div>
      </div>

      {/* 3. TREND VISUALIZATION */}
      <div className="px-4 lg:px-0">
        <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute right-10 top-10 flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20">
            <IconTrendingUp size={16} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              Growth Index: {growthRate}%
            </span>
          </div>
          <div className="space-y-1 mb-6">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-foreground">
              Capital Flow Velocity
            </h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">
              Year over year performance tracking
            </p>
          </div>
          <YearlyTrendChart data={yearlyData} />
        </div>
      </div>

      {/* Decorative Branding */}
      <div className="pt-10 select-none pointer-events-none opacity-[0.05] text-center">
        <h2 className="text-[12vw] font-black uppercase tracking-tight leading-none text-foreground">
          Analytics
        </h2>
      </div>
    </div>
  );
}

export default function AnalyticsPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-8 py-8 w-full max-w-none">
      {/* Background Backlights */}
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="p-4 space-y-10 animate-pulse">
      <div className="flex justify-between items-end">
        <Skeleton className="h-20 w-64 rounded-2xl" />
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-48 rounded-[2rem]" />
        <Skeleton className="h-48 rounded-[2rem]" />
        <Skeleton className="h-48 rounded-[2rem]" />
      </div>
      <Skeleton className="h-96 rounded-[2.5rem]" />
    </div>
  );
}
