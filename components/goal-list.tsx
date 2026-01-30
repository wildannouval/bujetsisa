"use client";
import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconCoin,
  IconTrash,
  IconCheck,
  IconTrophy,
  IconLoader2,
} from "@tabler/icons-react";
import { addSavingsToGoal, deleteGoal } from "@/lib/actions/budget-goals";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";

export function GoalList({ goals }: { goals: any[] }) {
  const [displayAmounts, setDisplayAmounts] = React.useState<
    Record<string, string>
  >({});
  const [isPending, setIsPending] = React.useState<string | null>(null);

  const handleAmountChange = (id: string, value: string) => {
    const raw = value.replace(/\D/g, "");
    const formatted = raw
      ? new Intl.NumberFormat("id-ID").format(parseInt(raw))
      : "";
    setDisplayAmounts((prev) => ({ ...prev, [id]: formatted }));
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 font-sans">
      {goals.map((goal) => {
        const percent = Math.min(
          Math.round((goal.current_amount / goal.target_amount) * 100),
          100,
        );
        const isDone = percent >= 100;

        return (
          <div
            key={goal.id}
            className={`group relative rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl overflow-hidden flex flex-col justify-between p-8 bg-card/40 backdrop-blur-xl ${
              isDone
                ? "border-indigo-500/50 shadow-indigo-500/10"
                : "border-border hover:border-indigo-500/40"
            }`}
          >
            {/* Success Decoration */}
            {isDone && (
              <div className="absolute right-[-20px] top-[-20px] size-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="space-y-1 text-left">
                <h4 className="text-xl font-black uppercase tracking-tight text-foreground truncate max-w-[160px]">
                  {goal.name}
                </h4>
                <Badge
                  variant="outline"
                  className={`text-[8px] font-black uppercase tracking-widest ${isDone ? "bg-indigo-600 text-white border-none" : "border-border"}`}
                >
                  {isDone ? "Objective Complete" : "Strategic Phase"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-8 w-8 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                onClick={async () => {
                  if (confirm("Decommission this objective?")) {
                    await deleteGoal(goal.id);
                    toast.success("Objective removed from registry");
                  }
                }}
              >
                <IconTrash size={16} />
              </Button>
            </div>

            <div className="space-y-6 relative z-10 text-left">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Capital Growth
                  </p>
                  <span
                    className={`text-xs font-black tabular-nums ${isDone ? "text-indigo-500" : "text-foreground"}`}
                  >
                    {percent}%
                  </span>
                </div>
                <Progress
                  value={percent}
                  className={`h-1.5 bg-muted ${isDone ? "[&>div]:bg-indigo-600" : "[&>div]:bg-indigo-500/60"}`}
                />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                  <span>
                    Stored: {goal.current_amount.toLocaleString("id-ID")}
                  </span>
                  <span>
                    Goal: {goal.target_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {!isDone && (
                <form
                  action={async () => {
                    const amtStr = displayAmounts[goal.id]?.replace(/\./g, "");
                    const amt = Number(amtStr);
                    if (!amt) return;

                    setIsPending(goal.id);
                    const res = await addSavingsToGoal(goal.id, amt);
                    setIsPending(null);

                    if (res.success) {
                      toast.success(
                        `Injected Rp ${displayAmounts[goal.id]} to objective!`,
                      );
                      setDisplayAmounts((prev) => ({ ...prev, [goal.id]: "" }));
                    }
                  }}
                  className="flex gap-2 pt-4 border-t border-border/50"
                >
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-500 opacity-60">
                      Rp
                    </span>
                    <Input
                      value={displayAmounts[goal.id] || ""}
                      onChange={(e) =>
                        handleAmountChange(goal.id, e.target.value)
                      }
                      placeholder="0"
                      className="h-10 pl-8 text-xs font-black bg-white/5 border-border rounded-xl focus:border-indigo-500/50"
                      required
                    />
                  </div>
                  <Button
                    disabled={isPending === goal.id}
                    size="sm"
                    className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl border-none shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {isPending === goal.id ? (
                      <IconLoader2 className="animate-spin" size={14} />
                    ) : (
                      "Inject"
                    )}
                  </Button>
                </form>
              )}

              {isDone && (
                <div className="flex items-center justify-center py-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-500 font-black text-[10px] gap-2 uppercase tracking-widest mt-4">
                  <IconTrophy size={16} strokeWidth={2.5} /> Objective
                  Successfully Secured
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
