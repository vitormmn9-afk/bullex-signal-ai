import { Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AutoGenerateToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function AutoGenerateToggle({ enabled, onToggle, disabled }: AutoGenerateToggleProps) {
  const handleToggle = () => {
    console.log(`🔄 Auto-geração ${!enabled ? 'ATIVADA' : 'DESATIVADA'}`);
    onToggle(!enabled);
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        "w-full h-12 text-base font-semibold",
        "transition-all duration-300",
        enabled
          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          : "bg-slate-600 hover:bg-slate-700 text-white"
      )}
      variant={enabled ? "default" : "secondary"}
    >
      {enabled ? (
        <>
          <Zap className="w-5 h-5 mr-2" />
          Geração Automática Ativada
        </>
      ) : (
        <>
          <ZapOff className="w-5 h-5 mr-2" />
          Geração Automática Desativada
        </>
      )}
    </Button>
  );
}
