"use client";

import { useEffect, useState } from "react";
import {
  getRecurringTransactions,
  getUpcomingRecurring,
  processRecurringTransaction,
  RecurringTransaction,
} from "@/lib/actions/recurring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { RecurringDialog } from "@/components/recurring/recurring-dialog";
import {
  RefreshCw,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Pause,
  Play,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RecurringPage() {
  const router = useRouter();
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [upcoming, setUpcoming] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [recurringData, upcomingData] = await Promise.all([
      getRecurringTransactions(),
      getUpcomingRecurring(14),
    ]);
    setRecurring(recurringData);
    setUpcoming(upcomingData);
    setLoading(false);
  };

  const handleProcess = async (id: string) => {
    setProcessing(id);
    try {
      const result = await processRecurringTransaction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi berhasil diproses");
        loadData(); // Reload data to update lists
        router.refresh();
      }
    } catch (error) {
      toast.error("Gagal memproses transaksi");
    } finally {
      setProcessing(null);
    }
  };

  const activeRecurring = recurring.filter((r) => r.is_active);
  const inactiveRecurring = recurring.filter((r) => !r.is_active);

  const monthlyTotal = activeRecurring
    .filter((r) => r.frequency === "monthly")
    .reduce((sum, r) => sum + (r.type === "expense" ? -r.amount : r.amount), 0);

  const frequencyLabels: Record<string, string> = {
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
    yearly: "Tahunan",
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Transaksi Berulang
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kelola langganan dan tagihan rutin Anda
          </p>
        </div>
        <RecurringDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaksi Aktif</p>
                <p className="text-2xl font-bold">{activeRecurring.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Segera Jatuh Tempo
                </p>
                <p className="text-2xl font-bold">{upcoming.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${monthlyTotal >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
              >
                {monthlyTotal >= 0 ? (
                  <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Bulanan</p>
                <p
                  className={`text-2xl font-bold ${monthlyTotal >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(monthlyTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-500" />
              Akan Datang (14 Hari ke Depan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming.map((item) => {
                const wallet = Array.isArray(item.wallet)
                  ? item.wallet[0]
                  : item.wallet;
                const category = Array.isArray(item.category)
                  ? item.category[0]
                  : item.category;
                const daysUntil = Math.ceil(
                  (new Date(item.next_date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                const isProcessing = processing === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category?.icon || "📋"}</span>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {wallet?.icon} {wallet?.name} •{" "}
                          {frequencyLabels[item.frequency]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={`font-semibold ${item.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {item.type === "income" ? "+" : "-"}
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {daysUntil === 0
                            ? "Hari ini"
                            : daysUntil === 1
                              ? "Besok"
                              : `${daysUntil} hari lagi`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-8 opacity-0 group-hover:opacity-100 transition-opacity ${isProcessing ? "opacity-100" : ""}`}
                        onClick={() => handleProcess(item.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Proses"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Recurring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Play className="h-5 w-5 text-green-500" />
            Transaksi Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRecurring.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada transaksi berulang aktif</p>
              <p className="text-sm">
                Tambahkan langganan atau tagihan rutin untuk memudahkan
                pengelolaan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRecurring.map((item) => {
                const wallet = Array.isArray(item.wallet)
                  ? item.wallet[0]
                  : item.wallet;
                const category = Array.isArray(item.category)
                  ? item.category[0]
                  : item.category;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category?.icon || "📋"}</span>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {wallet?.icon} {wallet?.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {frequencyLabels[item.frequency]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${item.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.next_date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Recurring */}
      {inactiveRecurring.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
              <Pause className="h-5 w-5" />
              Tidak Aktif ({inactiveRecurring.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 opacity-60">
              {inactiveRecurring.map((item) => {
                const wallet = Array.isArray(item.wallet)
                  ? item.wallet[0]
                  : item.wallet;
                const category = Array.isArray(item.category)
                  ? item.category[0]
                  : item.category;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category?.icon || "📋"}</span>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {wallet?.icon} {wallet?.name} •{" "}
                          {frequencyLabels[item.frequency]}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${item.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
