import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EntryCountdownProps {
  entryTime: string;
  signalTime: string;
  isPending: boolean;
}

export function EntryCountdown({ entryTime, signalTime, isPending }: EntryCountdownProps) {
  const [countdown, setCountdown] = useState<number>(0);
  const [isTimeToEnter, setIsTimeToEnter] = useState(false);

  useEffect(() => {
    if (!isPending) return;

    const interval = setInterval(() => {
      const now = new Date();
      const entry = new Date(entryTime);
      const secondsUntil = Math.floor((entry.getTime() - now.getTime()) / 1000);
      
      setCountdown(Math.max(0, secondsUntil));
      setIsTimeToEnter(secondsUntil <= 60 && secondsUntil >= 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [entryTime, isPending]);

  if (!isPending) return null;

  const entry = new Date(entryTime);
  const signal = new Date(signalTime);
  
  const entryTimeStr = entry.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const signalTimeStr = signal.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-3">
      {/* Info do Sinal */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>🕐 Sinal gerado: {signalTimeStr}</span>
        {countdown > 60 && (
          <Badge variant="outline" className="text-xs">
            Aguarde {Math.floor(countdown / 60)}min {countdown % 60}s
          </Badge>
        )}
      </div>

      {/* Destaque de Entrada */}
      <div
        className={cn(
          "p-4 rounded-xl border-2 transition-all duration-300",
          isTimeToEnter
            ? "bg-gradient-to-r from-warning/30 to-warning/10 border-warning shadow-lg shadow-warning/20 animate-pulse"
            : "bg-primary/5 border-primary/30"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                isTimeToEnter
                  ? "bg-warning animate-bounce"
                  : "bg-primary/20"
              )}
            >
              <Clock
                className={cn(
                  "w-6 h-6",
                  isTimeToEnter ? "text-warning-foreground" : "text-primary"
                )}
              />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {isTimeToEnter ? "⚡ ENTRE AGORA NA VELA:" : "📍 Horário de Entrada:"}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {entryTimeStr}
              </div>
              {!isTimeToEnter && countdown > 60 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Aguarde a vela abrir
                </div>
              )}
            </div>
          </div>

          {/* Countdown quando está próximo */}
          {isTimeToEnter && countdown > 0 && (
            <div className="text-right">
              <div className="text-4xl font-bold text-warning animate-pulse">
                {countdown}s
              </div>
              <div className="text-xs text-warning-foreground font-medium">
                para entrar
              </div>
            </div>
          )}

          {/* Já passou o horário */}
          {countdown === 0 && isTimeToEnter && (
            <Badge className="bg-destructive text-destructive-foreground text-sm px-4 py-2">
              Entrada encerrada
            </Badge>
          )}
        </div>

        {/* Barra de progresso visual */}
        {isTimeToEnter && countdown > 0 && (
          <div className="mt-4 h-2 bg-background/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-warning transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 60) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Dica */}
      {isTimeToEnter && countdown > 10 && (
        <div className="flex items-center gap-2 p-3 bg-accent/20 border border-accent/30 rounded-lg">
          <span className="text-xl">💡</span>
          <p className="text-xs text-accent-foreground">
            <strong>Prepare-se!</strong> A vela está prestes a abrir. Esteja pronto
            para executar a operação no horário exato.
          </p>
        </div>
      )}

      {isTimeToEnter && countdown <= 10 && countdown > 0 && (
        <div className="flex items-center gap-2 p-3 bg-warning/20 border border-warning rounded-lg animate-pulse">
          <span className="text-xl">⚡</span>
          <p className="text-xs font-bold text-warning-foreground">
            EXECUTAR AGORA! A vela está abrindo!
          </p>
        </div>
      )}
    </div>
  );
}
