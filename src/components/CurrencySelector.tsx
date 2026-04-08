import { useAppStore } from "@/store/AppContext";
import type { Currency } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CURRENCIES: Currency[] = ["MDL", "USD", "EUR"];

export function CurrencySelector() {
  const { currency, setCurrency } = useAppStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground text-xs font-semibold tracking-wide">
          {currency}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px] bg-card border-border/60">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c}
            onClick={() => setCurrency(c)}
            className={`${currency === c ? "bg-primary/10 text-primary" : ""}`}
          >
            <span className="text-sm font-medium">{c}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
