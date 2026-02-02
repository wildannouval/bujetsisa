"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { transferBudgetToGoal } from "@/lib/actions/goals";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Props {
  goalId: string;
  goalName: string;
  amount: number;
}

export function SaveSuggestionButton({ goalId, goalName, amount }: Props) {
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    const res = await transferBudgetToGoal(goalId, amount, goalName);
    setLoading(false);

    if (res.success) {
      // Efek Confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      toast.success(
        `Mantap! Rp ${amount.toLocaleString("id-ID")} berhasil dialokasikan ke ${goalName}`,
      );
    } else {
      toast.error(res.error || "Gagal memindahkan saldo");
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleSave}
      disabled={loading}
      className="font-bold uppercase tracking-tighter gap-2 px-8 shadow-xl shadow-primary/20"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          Tabungkan Sekarang <ArrowRight size={18} />
        </>
      )}
    </Button>
  );
}
