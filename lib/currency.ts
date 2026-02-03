// Currency utilities for BujetSisa

export type Currency =
  | "IDR"
  | "USD"
  | "SGD"
  | "MYR"
  | "EUR"
  | "JPY"
  | "GBP"
  | "AUD";

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: "IDR",
    name: "Rupiah Indonesia",
    symbol: "Rp",
    locale: "id-ID",
    flag: "🇮🇩",
  },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", flag: "🇺🇸" },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    locale: "en-SG",
    flag: "🇸🇬",
  },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    locale: "ms-MY",
    flag: "🇲🇾",
  },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", flag: "🇪🇺" },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    locale: "ja-JP",
    flag: "🇯🇵",
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    locale: "en-GB",
    flag: "🇬🇧",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    locale: "en-AU",
    flag: "🇦🇺",
  },
];

export function formatCurrency(
  amount: number,
  currency: Currency = "IDR",
  options?: {
    showSymbol?: boolean;
    compact?: boolean;
  },
): string {
  const currencyInfo =
    CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const formatter = new Intl.NumberFormat(currencyInfo.locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "IDR" || currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "IDR" || currency === "JPY" ? 0 : 2,
    notation: options?.compact ? "compact" : "standard",
  });

  if (options?.showSymbol === false) {
    return new Intl.NumberFormat(currencyInfo.locale, {
      minimumFractionDigits: currency === "IDR" || currency === "JPY" ? 0 : 2,
      maximumFractionDigits: currency === "IDR" || currency === "JPY" ? 0 : 2,
    }).format(amount);
  }

  return formatter.format(amount);
}

export function getCurrencyInfo(code: Currency): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

// Simple exchange rate approximations (for display purposes only)
// In production, use a real exchange rate API
export const EXCHANGE_RATES: Record<Currency, number> = {
  IDR: 1,
  USD: 15800,
  SGD: 11800,
  MYR: 3500,
  EUR: 17200,
  JPY: 105,
  GBP: 20000,
  AUD: 10500,
};

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
): number {
  // Convert to IDR first, then to target currency
  const amountInIDR = amount * EXCHANGE_RATES[from];
  return amountInIDR / EXCHANGE_RATES[to];
}
