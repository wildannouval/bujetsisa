"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Category, Wallet } from "@/lib/types";
import { Search, X, Filter } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface TransactionFiltersProps {
  wallets: Wallet[];
  categories: Category[];
  onFiltersChange: (filters: {
    type: string;
    walletId: string;
    categoryId: string;
    search: string;
  }) => void;
}

export function TransactionFilters({
  wallets,
  categories,
  onFiltersChange,
}: TransactionFiltersProps) {
  const { t } = useTranslation();
  const [type, setType] = useState("all");
  const [walletId, setWalletId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    const newFilters = {
      type: updates.type ?? type,
      walletId: updates.walletId ?? walletId,
      categoryId: updates.categoryId ?? categoryId,
      search: updates.search ?? search,
    };
    onFiltersChange(newFilters);
  };

  const filters = { type, walletId, categoryId, search };

  const hasActiveFilters =
    type !== "all" ||
    walletId !== "all" ||
    categoryId !== "all" ||
    search !== "";

  const clearFilters = () => {
    setType("all");
    setWalletId("all");
    setCategoryId("all");
    setSearch("");
    onFiltersChange({
      type: "all",
      walletId: "all",
      categoryId: "all",
      search: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.transactions.search_placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleFilterChange({ search: e.target.value });
          }}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
            handleFilterChange({ type: value });
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t.transactions.type_label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.transactions.filter_all}</SelectItem>
            <SelectItem value="income">
              {t.transactions.types.income}
            </SelectItem>
            <SelectItem value="expense">
              {t.transactions.types.expense}
            </SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">{t.transactions.filters}</h4>

              <div className="space-y-2">
                <Label>{t.transactions.wallet_label}</Label>
                <Select
                  value={walletId}
                  onValueChange={(value) => {
                    setWalletId(value);
                    handleFilterChange({ walletId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t.transactions.all_wallets}
                    </SelectItem>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.icon} {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t.transactions.category_label}</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => {
                    setCategoryId(value);
                    handleFilterChange({ categoryId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t.transactions.all_categories}
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t.transactions.clear_filters}
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
