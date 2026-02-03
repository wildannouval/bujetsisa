"use client";

import { useState, useEffect } from "react";
import { X, Bell, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Bill {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  next_date: string;
}

interface BillReminderBannerProps {
  bills: Bill[];
}

export function BillReminderBanner({ bills }: BillReminderBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Filter for today and tomorrow's bills
  const todayBills = bills.filter((bill) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billDate = new Date(bill.next_date);
    billDate.setHours(0, 0, 0, 0);
    return billDate.getTime() === today.getTime();
  });

  const tomorrowBills = bills.filter((bill) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const billDate = new Date(bill.next_date);
    billDate.setHours(0, 0, 0, 0);
    return billDate.getTime() === tomorrow.getTime();
  });

  const urgentBills = [...todayBills, ...tomorrowBills].filter(
    (bill) => !dismissed.includes(bill.id),
  );

  // Load dismissed bills from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dismissedBillReminders");
    if (stored) {
      try {
        const { ids, date } = JSON.parse(stored);
        // Reset dismissed bills daily
        const storedDate = new Date(date).toDateString();
        const today = new Date().toDateString();
        if (storedDate === today) {
          setDismissed(ids);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const dismissBill = (billId: string) => {
    const newDismissed = [...dismissed, billId];
    setDismissed(newDismissed);
    localStorage.setItem(
      "dismissedBillReminders",
      JSON.stringify({
        ids: newDismissed,
        date: new Date().toISOString(),
      }),
    );
  };

  const dismissAll = () => {
    setIsVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!isVisible || urgentBills.length === 0) {
    return null;
  }

  const isToday = todayBills.some((b) => !dismissed.includes(b.id));

  return (
    <div
      className={`relative rounded-lg p-3 sm:p-4 mb-4 ${
        isToday
          ? "bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800"
          : "bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isToday
              ? "bg-red-100 dark:bg-red-900"
              : "bg-orange-100 dark:bg-orange-900"
          }`}
        >
          {isToday ? (
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-sm sm:text-base ${
              isToday
                ? "text-red-800 dark:text-red-300"
                : "text-orange-800 dark:text-orange-300"
            }`}
          >
            {isToday ? "⚠️ Tagihan Jatuh Tempo Hari Ini!" : "🔔 Tagihan Besok"}
          </h4>

          <div className="mt-2 space-y-1">
            {urgentBills.slice(0, 3).map((bill) => {
              const isBillToday = todayBills.some((b) => b.id === bill.id);
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate flex-1">{bill.description}</span>
                  <span
                    className={`font-medium ml-2 ${
                      bill.type === "expense"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {bill.type === "expense" ? "-" : "+"}
                    {formatCurrency(bill.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2 opacity-50 hover:opacity-100"
                    onClick={() => dismissBill(bill.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          {urgentBills.length > 3 && (
            <p className="text-xs text-muted-foreground mt-1">
              +{urgentBills.length - 3} tagihan lainnya
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/recurring">Lihat</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={dismissAll}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
