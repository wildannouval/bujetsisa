import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { YearlyTrendChart } from "@/components/yearly-trend-chart";
import { YearlyExportPDFButton } from "@/components/yearly-export-pdf-button";
import { YearSelector } from "@/components/year-selector";
import { YearlyComparisonCard } from "@/components/yearly-comparison";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function AnalyticsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ year?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const selectedYear = Number(searchParams?.year) || new Date().getFullYear();
  const prevYear = selectedYear - 1;

  const supabase = await createClient();

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

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Yearly performance overview and trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <YearSelector currentYear={selectedYear} />
          <YearlyExportPDFButton
            year={selectedYear}
            data={yearlyData}
            summary={{ income: curIncome, expense: curExpense }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              Rp {curIncome.toLocaleString("id-ID")}
            </div>
            <YearlyComparisonCard
              current={curIncome}
              previous={preIncome}
              label="vs last year"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              Rp {curExpense.toLocaleString("id-ID")}
            </div>
            <YearlyComparisonCard
              current={curExpense}
              previous={preExpense}
              label="vs last year"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {curSaving.toLocaleString("id-ID")}
            </div>
            <YearlyComparisonCard
              current={curSaving}
              previous={preSaving}
              label="vs last year"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Trends</CardTitle>
          <CardDescription>Income vs Expense over the year</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <YearlyTrendChart data={yearlyData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  return (
    <div className="h-full flex-1 flex-col space-y-8 flex md:flex">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
