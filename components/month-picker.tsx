"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function MonthPicker({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();

  return (
    <Input
      type="month"
      value={currentMonth}
      onChange={(e) => {
        const val = e.target.value;
        // Pastikan mengarah ke /dashboard, bukan /
        if (val) router.push(`/dashboard?month=${val}`);
      }}
      className="w-auto h-9 text-[10px] font-black uppercase tracking-widest border-border bg-background/50 focus:ring-primary rounded-xl"
    />
  );
}
