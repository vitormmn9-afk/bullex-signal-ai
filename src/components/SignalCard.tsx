import { useState, useEffect, memo } from "react";
import { ArrowUp, ArrowDown, Clock, TrendingUp, Zap, AlertCircle } from "lucide-react";
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
  entryTime?: string;
  exitTime?: string;
  isLatest?: boolean;
}

export const SignalCard = memo(function SignalCard({
  asset,
  direction,
  probability,
  expirationTime,
  indicators,
  reasoning,
  result,
  createdAt,
  entryTime,
  exitTime,
  isLatest,
}: SignalCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(expirationTime);
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    const createdTime = new Date(createdAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - createdTime;
      const remaining = Math.max(0, expirationTime - Math.floor(elapsed / 1000));

      setTimeRemaining(remaining);

      // Alert when 1 minute or less remains
      if (remaining <= 60 && remaining > 0) {
        setIsExpiring(true);
      } else {
        setIsExpiring(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, expirationTime]);

  const isCall = direction === "CALL";
  const isWin = result === "WIN";
  const isLoss = result === "LOSS";
  const isPending = result === "PENDING" || !result;

  const time = new Date(createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const entryWindow = (() => {
    if (!entryTime || !exitTime) return null;
    const entryLabel = new Date(entryTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const exitLabel = new Date(exitTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return { entryLabel, exitLabel };
  })();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4 transition-all duration-300",
        "bg-gradient-card border-border/50",
        isLatest && "animate-signal glow",
        isWin && "border-success/50",
        isLoss && "border-destructive/50",
        isExpiring && !result && "border-warning/50 animate-pulse shadow-lg shadow-warning/50"
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
            {probability >= 90 && (
              <Badge variant="outline" className="text-success border-success">
                ≥90% Alta Confiança
              </Badge>
            )}
            {isLatest && (
              <Badge variant="outline" className="text-primary border-primary animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                NOVO
              </Badge>
            )}
            {isExpiring && !result && (
              <Badge variant="outline" className="text-warning border-warning animate-pulse">
                <AlertCircle className="w-3 h-3 mr-1" />
                ENTRANDO
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

        {/* Time Remaining */}
        <div className={cn(
          "flex items-center justify-between mb-3 p-2 rounded-lg text-sm font-semibold",
          isExpiring && !result
            ? "bg-warning/20 text-warning"
            : "bg-secondary/50 text-muted-foreground"
        )}>
          <span>Tempo restante:</span>
          <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
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

        {/* Entry window */}
        {entryWindow && (
          <div className="mb-3 text-xs text-muted-foreground font-semibold bg-primary/5 border border-primary/30 rounded-lg px-3 py-2">
            Entre na vela que inicia às {entryWindow.entryLabel} e encerra às {entryWindow.exitLabel}
          </div>
        )}

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
});
