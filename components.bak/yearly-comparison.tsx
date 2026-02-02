"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface ComparisonProps {
  current: number;
  previous: number;
  label: string;
  isCurrency?: boolean;
}

export function YearlyComparisonCard({
  current,
  previous,
  label,
  isCurrency = true,
}: ComparisonProps) {
  const diff = current - previous;
  const percentChange = previous > 0 ? (diff / previous) * 100 : 0;
  const isPositive = diff > 0;

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        {label} vs Tahun Lalu
      </p>
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center text-xs font-bold ${isPositive ? "text-green-500" : "text-destructive"}`}
        >
          {isPositive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {Math.abs(percentChange).toFixed(1)}%
        </div>
        <span className="text-[10px] text-muted-foreground italic">
          ({isPositive ? "+" : "-"} Rp {Math.abs(diff).toLocaleString("id-ID")})
        </span>
      </div>
    </div>
  );
}
