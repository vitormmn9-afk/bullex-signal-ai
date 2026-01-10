import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function GenerateButton({ onClick, isLoading, disabled }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={cn(
        "w-full h-14 text-lg font-semibold",
        "bg-gradient-primary hover:opacity-90",
        "transition-all duration-300",
        "disabled:opacity-50",
        !isLoading && "animate-pulse-glow"
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Analisando mercado...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          Gerar Sinal com IA
        </>
      )}
    </Button>
  );
}
