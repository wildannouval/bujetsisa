"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, Currency } from "@/lib/currency";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (value: Currency) => void;
  className?: string;
}

export function CurrencySelector({
  value,
  onChange,
  className,
}: CurrencySelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Currency)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Pilih mata uang" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <span className="flex items-center gap-2">
              <span>{currency.flag}</span>
              <span>{currency.code}</span>
              <span className="text-muted-foreground">- {currency.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface CurrencyDisplayProps {
  currency: Currency;
  showName?: boolean;
}

export function CurrencyDisplay({ currency, showName }: CurrencyDisplayProps) {
  const currencyInfo =
    CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <span className="inline-flex items-center gap-1">
      <span>{currencyInfo.flag}</span>
      <span>{currency}</span>
      {showName && (
        <span className="text-muted-foreground">({currencyInfo.name})</span>
      )}
    </span>
  );
}
