import { ArrowUp, ArrowDown, Clock, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SignalCardProps {
  asset: string;
  direction: "CALL" | "PUT";
  probability: number;
  expirationTime: number;
  indicators: string[];
  reasoning?: string;
  result?: "WIN" | "LOSS" | "PENDING" | null;
  createdAt: string;
  isLatest?: boolean;
}

export function SignalCard({
  asset,
  direction,
  probability,
  expirationTime,
  indicators,
  reasoning,
  result,
  createdAt,
  isLatest,
}: SignalCardProps) {
  const isCall = direction === "CALL";
  const isWin = result === "WIN";
  const isLoss = result === "LOSS";
  const isPending = result === "PENDING" || !result;

  const time = new Date(createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4 transition-all duration-300",
        "bg-gradient-card border-border/50",
        isLatest && "animate-signal glow",
        isWin && "border-success/50",
        isLoss && "border-destructive/50"
      )}
    >
      {/* Glow effect for latest signal */}
      {isLatest && (
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">{asset}</span>
            {isLatest && (
              <Badge variant="outline" className="text-primary border-primary animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                NOVO
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="w-3 h-3" />
            {time}
          </div>
        </div>

        {/* Direction and Probability */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg",
              isCall 
                ? "bg-success/20 text-success" 
                : "bg-destructive/20 text-destructive"
            )}
          >
            {isCall ? (
              <ArrowUp className="w-5 h-5" />
            ) : (
              <ArrowDown className="w-5 h-5" />
            )}
            {direction}
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gradient">{probability}%</div>
            <div className="text-xs text-muted-foreground">Probabilidade</div>
          </div>
        </div>

        {/* Expiration */}
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Expiração: {expirationTime} minutos</span>
        </div>

        {/* Indicators */}
        <div className="flex flex-wrap gap-1 mb-3">
          {indicators.map((indicator, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs bg-secondary/50"
            >
              {indicator}
            </Badge>
          ))}
        </div>

        {/* Reasoning */}
        {reasoning && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {reasoning}
          </p>
        )}

        {/* Result */}
        {!isPending && (
          <div
            className={cn(
              "flex items-center justify-center gap-2 py-2 rounded-lg font-semibold",
              isWin && "bg-success/20 text-success",
              isLoss && "bg-destructive/20 text-destructive"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            {isWin ? "VITÓRIA" : "PERDA"}
          </div>
        )}
      </div>
    </Card>
  );
}
