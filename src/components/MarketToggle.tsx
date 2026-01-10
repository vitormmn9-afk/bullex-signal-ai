import { cn } from "@/lib/utils";

interface MarketToggleProps {
  value: "OTC" | "OPEN";
  onChange: (value: "OTC" | "OPEN") => void;
}

export function MarketToggle({ value, onChange }: MarketToggleProps) {
  return (
    <div className="flex bg-secondary/50 rounded-lg p-1">
      <button
        onClick={() => onChange("OPEN")}
        className={cn(
          "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          value === "OPEN"
            ? "bg-primary text-primary-foreground glow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Mercado Aberto
      </button>
      <button
        onClick={() => onChange("OTC")}
        className={cn(
          "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
          value === "OTC"
            ? "bg-primary text-primary-foreground glow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        OTC
      </button>
    </div>
  );
}
