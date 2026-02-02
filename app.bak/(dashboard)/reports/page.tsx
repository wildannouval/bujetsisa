import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { DailySpendingChart } from "@/components/daily-spending-chart";
import { ExportPDFButton } from "@/components/export-pdf-button";
import { MonthPicker } from "@/components/month-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Detailed monthly breakdown and spending habits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthPicker currentMonth={selectedMonthStr} />
          <ExportPDFButton
            data={transactions || []}
            summary={{
              income: totalIncome,
              expense: totalExpense,
              balance: totalBalance,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              Rp {totalIncome.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              Rp {totalExpense.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingRate}%</div>
            <Progress value={savingRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Daily Spending</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DailySpendingChart data={dailyData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories?.map((cat) => {
                const spent =
                  transactions
                    ?.filter(
                      (t) => t.category_id === cat.id && t.type === "expense",
                    )
                    .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
                if (spent === 0) return null;
                const limit = Number(cat.monthly_limit) || 0;
                const percent =
                  limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">
                        Rp {spent.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className="h-2"
                      color={cat.color}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
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
    <div className="h-full flex-1 flex-col space-y-8 flex md:flex">
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent month={params.month} />
      </Suspense>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-80 rounded-xl" />
        <Skeleton className="col-span-3 h-80 rounded-xl" />
      </div>
    </div>
  );
}
