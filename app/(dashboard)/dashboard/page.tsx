import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Target,
  PiggyBank,
  Receipt,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

async function getData() {
  try {
    return await getDashboardData();
  } catch (error) {
    return {
      totalBalance: 0,
      income: 0,
      expense: 0,
      recentTransactions: [],
      activeWalletsCount: 0,
      goalsProgress: { active: 0, total: 0, saved: 0, target: 0 },
      budgetStatus: {
        onTrack: 0,
        overBudget: 0,
        totalBudgeted: 0,
        totalSpent: 0,
      },
      debtSummary: { payable: 0, receivable: 0, overdue: 0 },
      topCategories: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getData();

  const netAmount = data.income - data.expense;
  const goalsPercentage =
    data.goalsProgress.target > 0
      ? Math.round((data.goalsProgress.saved / data.goalsProgress.target) * 100)
      : 0;
  const budgetPercentage =
    data.budgetStatus.totalBudgeted > 0
      ? Math.round(
          (data.budgetStatus.totalSpent / data.budgetStatus.totalBudgeted) *
            100,
        )
      : 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan keuangan Anda bulan ini
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Saldo</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(data.totalBalance, "IDR")}
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  {data.activeWalletsCount} dompet aktif
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pemasukan Bulan Ini
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  +{formatCurrency(data.income, "IDR")}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pengeluaran Bulan Ini
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  -{formatCurrency(data.expense, "IDR")}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Amount */}
        <Card
          className={
            netAmount >= 0
              ? "border-green-200 dark:border-green-800"
              : "border-red-200 dark:border-red-800"
          }
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Selisih
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {netAmount >= 0 ? "+" : ""}
                  {formatCurrency(netAmount, "IDR")}
                </p>
              </div>
              <div
                className={`rounded-full p-3 ${netAmount >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}
              >
                <ArrowUpDown
                  className={`h-6 w-6 ${netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Goals Progress */}
        <Link href="/goals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  Target Tabungan
                </CardTitle>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {data.goalsProgress.active} target aktif
                  </span>
                  <span className="font-medium">{goalsPercentage}%</span>
                </div>
                <Progress value={goalsPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(data.goalsProgress.saved, "IDR")} /{" "}
                  {formatCurrency(data.goalsProgress.target, "IDR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Budget Status */}
        <Link href="/budgeting">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-purple-500" />
                  Status Anggaran
                </CardTitle>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-600"
                  >
                    {data.budgetStatus.onTrack} sesuai
                  </Badge>
                  {data.budgetStatus.overBudget > 0 && (
                    <Badge variant="destructive">
                      {data.budgetStatus.overBudget} melebihi
                    </Badge>
                  )}
                </div>
                <Progress
                  value={Math.min(budgetPercentage, 100)}
                  className={`h-2 ${budgetPercentage > 100 ? "[&>div]:bg-red-500" : ""}`}
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(data.budgetStatus.totalSpent, "IDR")} /{" "}
                  {formatCurrency(data.budgetStatus.totalBudgeted, "IDR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Debt Summary */}
        <Link href="/debts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-500" />
                  Hutang & Piutang
                </CardTitle>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">
                    Hutang: {formatCurrency(data.debtSummary.payable, "IDR")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Piutang:{" "}
                    {formatCurrency(data.debtSummary.receivable, "IDR")}
                  </span>
                </div>
                {data.debtSummary.overdue > 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    {data.debtSummary.overdue} jatuh tempo
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pengeluaran</CardTitle>
            <CardDescription>
              Kategori dengan pengeluaran terbesar bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada pengeluaran bulan ini
              </div>
            ) : (
              <div className="space-y-4">
                {data.topCategories.map((category: any, index: number) => {
                  const percentage =
                    data.expense > 0
                      ? Math.round((category.amount / data.expense) * 100)
                      : 0;
                  const colors = [
                    "bg-red-500",
                    "bg-orange-500",
                    "bg-yellow-500",
                    "bg-blue-500",
                    "bg-purple-500",
                  ];

                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-28 text-right">
                          {formatCurrency(category.amount, "IDR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaksi Terakhir</CardTitle>
              <CardDescription>5 transaksi terbaru</CardDescription>
            </div>
            <Link
              href="/transactions"
              className="text-sm text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada transaksi
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentTransactions.map((t: any) => {
                  const category = t.category as {
                    name: string;
                    icon: string;
                  } | null;
                  const wallet = t.wallet as { name: string } | null;

                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
                          t.type === "income" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {category?.icon || (t.type === "income" ? "💰" : "💸")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {category?.name ||
                            (t.type === "income" ? "Pemasukan" : "Pengeluaran")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {wallet?.name} •{" "}
                          {new Date(t.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          t.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount, "IDR")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
