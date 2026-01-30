"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <SelectTrigger className="w-[120px] h-9 font-bold">
        <SelectValue placeholder="Pilih Tahun" />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={y.toString()} className="font-medium">
            Tahun {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
