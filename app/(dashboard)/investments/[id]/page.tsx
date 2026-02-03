import { getInvestment } from "@/lib/actions/investments";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { InvestmentTransactionDialog } from "@/components/investments/investment-transaction-dialog";

interface InvestmentDetailPageProps {
  params: Promise<{ id: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  stock: "Saham",
  mutual_fund: "Reksadana",
  crypto: "Kripto",
  bond: "Obligasi",
  property: "Properti",
  gold: "Emas",
  deposit: "Deposito",
  other: "Lainnya",
};

export default async function InvestmentDetailPage({
  params,
}: InvestmentDetailPageProps) {
  const { id } = await params;
  const investment = await getInvestment(id);

  if (!investment) {
    notFound();
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const invested =
    Number(investment.quantity) * Number(investment.avg_buy_price);
  const currentValue =
    Number(investment.quantity) * Number(investment.current_price);
  const gain = currentValue - invested;
  const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;
  const isProfit = gain >= 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/investments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
              {investment.icon}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {investment.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {TYPE_LABELS[investment.type]}{" "}
                {investment.ticker && `• ${investment.ticker}`}
              </p>
            </div>
          </div>
        </div>
        <InvestmentTransactionDialog investment={investment} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
            <p className="text-xl sm:text-2xl font-bold">
              {formatCurrency(currentValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Investasi</p>
            <p className="text-xl sm:text-2xl font-bold">
              {formatCurrency(invested)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Keuntungan/Rugi</p>
            <div className="flex items-center gap-2">
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p
                className={`text-xl sm:text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}
              >
                {isProfit ? "+" : ""}
                {formatCurrency(gain)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Return</p>
            <p
              className={`text-xl sm:text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}
            >
              {isProfit ? "+" : ""}
              {gainPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Detail Investasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Jumlah Unit</span>
              <span className="font-medium">
                {Number(investment.quantity).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Harga Rata-rata Beli
              </span>
              <span className="font-medium">
                {formatCurrency(Number(investment.avg_buy_price))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Harga Saat Ini
              </span>
              <span className="font-medium">
                {formatCurrency(Number(investment.current_price))}
              </span>
            </div>
            {investment.platform && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Platform</span>
                <Badge variant="secondary">{investment.platform}</Badge>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={
                  investment.status === "active" ? "default" : "secondary"
                }
              >
                {investment.status === "active" ? "Aktif" : "Terjual"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Riwayat Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {investment.transactions && investment.transactions.length > 0 ? (
              <div className="space-y-3">
                {investment.transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {tx.type === "buy" && (
                          <span className="text-green-600">🟢 Beli</span>
                        )}
                        {tx.type === "sell" && (
                          <span className="text-red-600">🔴 Jual</span>
                        )}
                        {tx.type === "dividend" && (
                          <span className="text-blue-600">💰 Dividen</span>
                        )}
                        {tx.type === "stock_split" && (
                          <span className="text-purple-600">✂️ Split</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)} •{" "}
                        {Number(tx.quantity).toLocaleString("id-ID")} unit @{" "}
                        {formatCurrency(Number(tx.price))}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(Number(tx.total_amount))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada transaksi
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
