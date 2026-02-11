"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { processRecurringTransaction } from "@/lib/actions/recurring";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UpcomingBill {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  next_date: string;
  frequency: string;
  wallet?: { id: string; name: string; icon: string };
  category?: { id: string; name: string; icon: string };
}

interface UpcomingBillsProps {
  bills: UpcomingBill[];
  maxItems?: number;
}

export function UpcomingBills({ bills, maxItems = 5 }: UpcomingBillsProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Besok";
    }

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleProcess = async (id: string) => {
    setProcessing(id);
    try {
      const result = await processRecurringTransaction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Tagihan berhasil dibayar/diproses");
        router.refresh();
      }
    } catch (error) {
      toast.error("Gagal memproses tagihan");
    } finally {
      setProcessing(null);
    }
  };

  const getUrgencyBadge = (daysUntil: number) => {
    if (daysUntil === 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Hari ini
        </Badge>
      );
    } else if (daysUntil === 1) {
      return <Badge className="bg-orange-500 text-xs">Besok</Badge>;
    } else if (daysUntil <= 3) {
      return (
        <Badge className="bg-yellow-500 text-xs">{daysUntil} hari lagi</Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        {daysUntil} hari lagi
      </Badge>
    );
  };

  const displayBills = bills.slice(0, maxItems);

  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            Tagihan Mendatang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm text-muted-foreground">
              Tidak ada tagihan dalam 7 hari ke depan
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          Tagihan Mendatang
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/recurring">Lihat Semua</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayBills.map((bill) => {
            const daysUntil = getDaysUntil(bill.next_date);
            const isProcessing = processing === bill.id;

            return (
              <div
                key={bill.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background text-lg">
                    {bill.category?.icon ||
                      (bill.type === "expense" ? "💸" : "💰")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {bill.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(bill.next_date)}</span>
                      {bill.wallet && (
                        <>
                          <span>•</span>
                          <span>
                            {bill.wallet.icon} {bill.wallet.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-sm sm:text-base ${
                        bill.type === "expense"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {bill.type === "expense" ? "-" : "+"}
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getUrgencyBadge(daysUntil)}
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-6 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity ${isProcessing ? "opacity-100" : ""}`}
                      onClick={() => handleProcess(bill.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Bayar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {bills.length > maxItems && (
          <div className="mt-3 text-center">
            <Button variant="link" size="sm" asChild>
              <Link href="/recurring">
                +{bills.length - maxItems} tagihan lainnya
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
