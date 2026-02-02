"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function MonthPicker({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();

  return (
    <div className="relative">
      <Input
        type="month"
        value={currentMonth}
        onChange={(e) => {
          const val = e.target.value;
          if (val) router.push(`/dashboard?month=${val}`);
        }}
        className="w-auto h-9 font-medium border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      />
    </div>
  );
}
