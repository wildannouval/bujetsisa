import { getNetWorthData } from "@/lib/actions/net-worth";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  CreditCard,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";

export default async function NetWorthPage() {
  const data = await getNetWorthData();

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Silakan login terlebih dahulu</p>
      </div>
    );
  }

  const assetPercentage =
    data.totalAssets > 0
      ? Math.round(
          (data.totalAssets / (data.totalAssets + data.totalLiabilities)) * 100,
        )
      : 100;

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Net Worth
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kekayaan bersih Anda secara keseluruhan
        </p>
      </div>

      {/* Net Worth Hero Card */}
      <Card
        className={`bg-gradient-to-br ${
          data.netWorth >= 0
            ? "from-emerald-500 to-teal-600"
            : "from-red-500 to-rose-600"
        } text-white`}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="text-center">
            <p className="text-sm sm:text-base font-medium text-white/80">
              Total Kekayaan Bersih
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
              {formatCurrency(data.netWorth, "IDR")}
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm">
                  Aset: {formatCurrency(data.totalAssets, "IDR")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                <span className="text-sm">
                  Kewajiban: {formatCurrency(data.totalLiabilities, "IDR")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset vs Liability Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rasio Aset vs Kewajiban</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 font-medium">
                Aset ({assetPercentage}%)
              </span>
              <span className="text-red-600 font-medium">
                Kewajiban ({100 - assetPercentage}%)
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-red-200 dark:bg-red-900/30">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${assetPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {/* Wallets */}
        <Link href="/wallets">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Saldo Dompet
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">
                    {formatCurrency(data.totalWalletBalance, "IDR")}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Investments */}
        <Link href="/investments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Nilai Investasi
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-600 mt-1">
                    {formatCurrency(data.totalInvestmentValue, "IDR")}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Debts */}
        <Link href="/debts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Hutang
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-red-600 mt-1">
                    -{formatCurrency(data.totalPayable, "IDR")}
                  </p>
                </div>
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                  <CreditCard className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Detail Lists */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Top Wallets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Dompet Terbesar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topWallets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada dompet
              </p>
            ) : (
              <div className="space-y-3">
                {data.topWallets.map((wallet, index) => {
                  const pct =
                    data.totalWalletBalance > 0
                      ? Math.round(
                          (wallet.value / data.totalWalletBalance) * 100,
                        )
                      : 0;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{wallet.icon}</span>
                          <span className="font-medium">{wallet.name}</span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(wallet.value, "IDR")}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Investments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Investasi Terbesar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topInvestments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada investasi
              </p>
            ) : (
              <div className="space-y-3">
                {data.topInvestments.map((inv, index) => {
                  const pct =
                    data.totalInvestmentValue > 0
                      ? Math.round(
                          (inv.value / data.totalInvestmentValue) * 100,
                        )
                      : 0;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{inv.icon}</span>
                          <span className="font-medium">{inv.name}</span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(inv.value, "IDR")}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
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
