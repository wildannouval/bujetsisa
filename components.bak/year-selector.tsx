"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export function YearSelector({ currentYear }: { currentYear: number }) {
  const router = useRouter();

  // Daftar tahun yang tersedia (misal 5 tahun ke belakang)
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  return (
    <Select
      value={currentYear.toString()}
      onValueChange={(val) => router.push(`/analytics?year=${val}`)}
    >
      <SelectTrigger className="w-[140px] h-9 font-medium">
        <Calendar className="mr-2 h-4 w-4 opacity-50" />
        <SelectValue placeholder="Pilih Tahun" />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={y.toString()}>
            Tahun {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
