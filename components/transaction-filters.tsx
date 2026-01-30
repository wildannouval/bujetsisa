"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  IconSearch,
  IconX,
  IconFilter,
  IconLoader2,
} from "@tabler/icons-react";

export function TransactionFilters({ wallets, categories }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);

    startTransition(() => {
      router.push(`/transactions?${params.toString()}`);
    });
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconFilter size={16} strokeWidth={3} className="text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Audit Configuration
          </span>
        </div>
        {isPending && (
          <IconLoader2 className="animate-spin text-indigo-500 size-4" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-50" />
          <Input
            placeholder="SEARCH REGISTRY..."
            className="pl-11 h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px] placeholder:text-slate-600 focus:border-indigo-500/50"
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <Select
          defaultValue={searchParams.get("wallet") || "all"}
          onValueChange={(val) => updateFilter("wallet", val)}
        >
          <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px] tracking-widest">
            <SelectValue placeholder="SOURCE UNIT" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            <SelectItem value="all" className="font-bold text-[10px]">
              ALL UNITS
            </SelectItem>
            {wallets?.map((w: any) => (
              <SelectItem
                key={w.id}
                value={w.id}
                className="font-bold text-[10px] uppercase"
              >
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("category") || "all"}
          onValueChange={(val) => updateFilter("category", val)}
        >
          <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px] tracking-widest">
            <SelectValue placeholder="SECTOR" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            <SelectItem value="all" className="font-bold text-[10px]">
              ALL SECTORS
            </SelectItem>
            {categories?.map((c: any) => (
              <SelectItem
                key={c.id}
                value={c.id}
                className="font-bold text-[10px] uppercase"
              >
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          onClick={() => router.push("/transactions")}
          className="h-12 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/5 font-black uppercase text-[10px] tracking-widest"
        >
          <IconX size={16} className="mr-2" /> Reset Audit
        </Button>
      </div>
    </div>
  );
}
