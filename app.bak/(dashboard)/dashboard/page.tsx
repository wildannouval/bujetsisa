import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyBarChart } from "@/components/weekly-bar-chart";
import { ExportPDFButton } from "@/components/export-pdf-button";
import { MonthPicker } from "@/components/month-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CreditCard,
  DollarSign,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { DailySpendingChart } from "@/components/daily-spending-chart";
import { YearlyTrendChart } from "@/components/yearly-trend-chart";
import { ExpenseChart } from "@/components/expense-chart";

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

  const [{ data: wallets }, { data: monthTxs }] = await Promise.all([
    supabase.from("wallets").select("balance"),
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
  const totalIncome =
    monthTxs
      ?.filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
  const totalExpense =
    monthTxs
      ?.filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

  // Prepare chart data
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

  const dailyData: { date: number; amount: number }[] = [];
  // Simple aggregation for daily spending
  monthTxs
    ?.filter((t) => t.type === "expense")
    .forEach((t) => {
      const day = new Date(t.date).getDate();
      const existing = dailyData.find((d) => d.date === day);
      if (existing) existing.amount += Number(t.amount);
      else dailyData.push({ date: day, amount: Number(t.amount) });
    });
  dailyData.sort((a, b) => a.date - b.date);

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

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <MonthPicker currentMonth={selectedMonthStr} />
          <ExportPDFButton
            data={monthTxs || []}
            summary={{
              income: totalIncome,
              expense: totalExpense,
              balance: totalBalance,
            }}
          />
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rp {totalBalance.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  +Rp {totalIncome.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Inflow this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  -Rp {totalExpense.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Outflow this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Wallets
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wallets?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Connected accounts
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Spending Overview</CardTitle>
                <CardDescription>
                  Your weekly spending activities for {selectedMonthStr}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <WeeklyBarChart data={weeklyData} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  You made {monthTxs?.length || 0} transactions this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {monthTxs?.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-md font-medium leading-none">
                          {tx.description || "Transaction"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(tx.categories)
                            ? tx.categories[0]?.name
                            : tx.categories?.name}
                        </p>
                      </div>
                      <div
                        className={`ml-auto font-medium ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}
                      >
                        {tx.type === "income" ? "+" : "-"}Rp{" "}
                        {Number(tx.amount).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                  {(!monthTxs || monthTxs.length === 0) && (
                    <div className="text-center text-muted-foreground py-4">
                      No transactions found
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-between group"
                  >
                    <Link href="/transactions">
                      View All Transactions{" "}
                      <ArrowUpRight className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <ExpenseChart data={expenseChartData} />
            <DailySpendingChart data={dailyData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default async function Page(props: {
  searchParams: Promise<{ month?: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="h-full flex-1 flex-col space-y-8 flex">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent month={searchParams.month} />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[350px] rounded-xl" />
        <Skeleton className="col-span-3 h-[350px] rounded-xl" />
      </div>
    </div>
  );
}
