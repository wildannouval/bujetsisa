"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  name?: string;
  defaultValue?: number | string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function CurrencyInput({
  name,
  defaultValue,
  required,
  className,
  placeholder,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");

  const formatNumber = (value: string) => {
    // Remove non-digits
    const number = value.replace(/\D/g, "");
    // Add thousands separator (dots for IDR style)
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, "");
    setDisplayValue(formatNumber(rawValue));
  };

  // Initialize display value from defaultValue prop only once
  React.useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      const numValue =
        typeof defaultValue === "string"
          ? defaultValue.replace(/\./g, "")
          : defaultValue.toString();
      setDisplayValue(formatNumber(numValue));
    }
  }, []); // Only run once on mount

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        Rp
      </span>
      <Input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={cn("pl-9", className)}
      />
      {/* Hidden input to submit the actual number value in forms */}
      <input
        type="hidden"
        name={name}
        value={displayValue.replace(/\./g, "")}
      />
    </div>
  );
}
