"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Receipt, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BadDebtReport({ items }: { items: any[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const badDebts = items
    .filter((item) => {
      if (
        item.type !== "receivable" ||
        item.status === "paid" ||
        !item.due_date
      )
        return false;
      return new Date(item.due_date) < today;
    })
    .map((item) => {
      const dueDate = new Date(item.due_date);
      const diffDays = Math.ceil(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return { ...item, diffDays };
    })
    .sort((a, b) => b.diffDays - a.diffDays);

  if (badDebts.length === 0) return null;

  return (
    <div className="rounded-[2rem] border border-destructive/30 bg-destructive/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-destructive/5">
      <div className="p-6 border-b border-destructive/20 bg-destructive/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle
            className="text-destructive"
            size={24}
            strokeWidth={3}
          />
          <h3 className="text-sm font-black uppercase tracking-widest text-destructive">
            Critical Overdue Registry
          </h3>
        </div>
        <Badge className="bg-destructive text-destructive-foreground font-black text-[9px] uppercase tracking-widest px-3 border-none">
          {badDebts.length} Alerts
        </Badge>
      </div>

      <div className="divide-y divide-destructive/10">
        {badDebts.map((debt) => (
          <div
            key={debt.id}
            className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors hover:bg-destructive/5"
          >
            <div className="flex items-center gap-5 flex-1">
              <div className="p-3 bg-destructive/10 rounded-2xl text-destructive shrink-0">
                <Receipt size={24} />
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg uppercase tracking-tight text-foreground">
                    {debt.person_name}
                  </span>
                  <Badge
                    variant="destructive"
                    className="text-[8px] font-black px-2 py-0 h-4 uppercase tracking-widest rounded-full"
                  >
                    {debt.diffDays} Days Overdue
                  </Badge>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                  Residue Outstanding:{" "}
                  <span className="text-destructive">
                    Rp{" "}
                    {(
                      Number(debt.amount) - Number(debt.current_amount)
                    ).toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            </div>

            <Button
              className="w-full md:w-auto h-12 px-6 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-green-500/20 gap-2 transition-all active:scale-95"
              onClick={() => {
                const message = `Halo ${debt.person_name}, sekadar mengingatkan untuk tagihan "${debt.description || "Hutang"}" sebesar Rp ${(Number(debt.amount) - Number(debt.current_amount)).toLocaleString("id-ID")} yang sudah jatuh tempo pada ${new Date(debt.due_date).toLocaleDateString("id-ID")}. Mohon segera dikonfirmasi ya, terima kasih!`;
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(message)}`,
                  "_blank",
                );
              }}
            >
              <Send size={18} strokeWidth={2.5} /> Execute Collection
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
