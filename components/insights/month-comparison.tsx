"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { getMonthlyComparison } from "@/lib/actions/insights";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

interface MonthlyData {
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
}

interface ComparisonResult {
  currentMonth: MonthlyData;
  compareMonth: MonthlyData;
  incomeChange: number;
  expenseChange: number;
  netChange: number;
}

export function MonthComparison() {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [compareMonthOffset, setCompareMonthOffset] = useState("1"); // 1 = last month

  useEffect(() => {
    loadComparison();
  }, [compareMonthOffset]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyComparison(parseInt(compareMonthOffset));
      setComparison(data);
    } catch (error) {
      console.error("Error loading comparison:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (offset: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() - offset);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  const renderChangeIndicator = (
    change: number,
    isExpense: boolean = false,
  ) => {
    const isPositive = isExpense ? change < 0 : change > 0;
    const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
    const color = isPositive
      ? "text-green-600"
      : change === 0
        ? "text-muted-foreground"
        : "text-red-600";

    return (
      <div className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="h-4 w-4" />
        <span>
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!comparison) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-purple-500" />
            Perbandingan Bulanan
          </CardTitle>
          <Select
            value={compareMonthOffset}
            onValueChange={setCompareMonthOffset}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">vs Bulan Lalu</SelectItem>
              <SelectItem value="2">vs 2 Bulan Lalu</SelectItem>
              <SelectItem value="3">vs 3 Bulan Lalu</SelectItem>
              <SelectItem value="6">vs 6 Bulan Lalu</SelectItem>
              <SelectItem value="12">vs Tahun Lalu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Month vs Compare Month Labels */}
        <div className="grid grid-cols-3 gap-4 text-sm text-center">
          <div className="font-medium">Metrik</div>
          <div className="text-muted-foreground">
            {getMonthName(parseInt(compareMonthOffset))}
          </div>
          <div className="font-medium">Bulan Ini</div>
        </div>

        {/* Income Row */}
        <div className="grid grid-cols-3 gap-4 items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
          <div className="font-medium text-green-700 dark:text-green-400">
            Pemasukan
          </div>
          <div className="text-center text-muted-foreground">
            {formatCurrency(comparison.compareMonth.income)}
          </div>
          <div className="text-center">
            <p className="font-semibold text-green-600">
              {formatCurrency(comparison.currentMonth.income)}
            </p>
            {renderChangeIndicator(comparison.incomeChange)}
          </div>
        </div>

        {/* Expense Row */}
        <div className="grid grid-cols-3 gap-4 items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
          <div className="font-medium text-red-700 dark:text-red-400">
            Pengeluaran
          </div>
          <div className="text-center text-muted-foreground">
            {formatCurrency(comparison.compareMonth.expense)}
          </div>
          <div className="text-center">
            <p className="font-semibold text-red-600">
              {formatCurrency(comparison.currentMonth.expense)}
            </p>
            {renderChangeIndicator(comparison.expenseChange, true)}
          </div>
        </div>

        {/* Net Row */}
        <div className="grid grid-cols-3 gap-4 items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <div className="font-medium text-blue-700 dark:text-blue-400">
            Net
          </div>
          <div className="text-center text-muted-foreground">
            {formatCurrency(comparison.compareMonth.net)}
          </div>
          <div className="text-center">
            <p
              className={`font-semibold ${comparison.currentMonth.net >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(comparison.currentMonth.net)}
            </p>
            {renderChangeIndicator(comparison.netChange)}
          </div>
        </div>

        {/* Transaction Count */}
        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>Jumlah transaksi:</span>
          <span>
            {comparison.compareMonth.transactionCount} →{" "}
            {comparison.currentMonth.transactionCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
