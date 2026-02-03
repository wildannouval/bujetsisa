"use client";

import { Investment } from "@/lib/types";
import { InvestmentCard } from "./investment-card";

interface InvestmentListProps {
  investments: Investment[];
}

export function InvestmentList({ investments }: InvestmentListProps) {
  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold">Belum ada investasi</h3>
        <p className="text-muted-foreground mt-1">
          Tambahkan investasi pertama Anda untuk mulai melacak portofolio
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {investments.map((investment) => (
        <InvestmentCard key={investment.id} investment={investment} />
      ))}
    </div>
  );
}
