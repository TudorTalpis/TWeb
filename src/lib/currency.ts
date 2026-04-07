export type Currency = "MDL" | "USD" | "EUR";

export interface ExchangeRates {
  MDL: number; // base currency
  USD: number;
  EUR: number;
}

// Approximate exchange rates relative to MDL (1 MDL = X foreign currency)
// Update these rates as needed
export const DEFAULT_RATES: ExchangeRates = {
  MDL: 1,
  USD: 0.056,
  EUR: 0.051,
};

// Convert amount from MDL to target currency
export function convertFromMDL(amountMDL: number, target: Currency, rates: ExchangeRates = DEFAULT_RATES): number {
  if (target === "MDL") return amountMDL;
  return Math.round(amountMDL * rates[target] * 100) / 100;
}

// Convert amount from any currency to MDL
export function convertToMDL(amount: number, from: Currency, rates: ExchangeRates = DEFAULT_RATES): number {
  if (from === "MDL") return amount;
  return Math.round((amount / rates[from]) * 100) / 100;
}

// Format a price with currency symbol and proper decimal places
export function formatPrice(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = { MDL: "MDL", USD: "$", EUR: "€" };
  const decimals: Record<Currency, number> = { MDL: 2, USD: 2, EUR: 2 };

  const symbol = symbols[currency];
  const formatted = amount.toFixed(decimals[currency]);

  if (currency === "MDL") {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
}

// Convert and format in one step
export function convertAndFormat(amountMDL: number, target: Currency, rates: ExchangeRates = DEFAULT_RATES): string {
  const converted = convertFromMDL(amountMDL, target, rates);
  return formatPrice(converted, target);
}
