import { Activity, Zap, Brain, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AutoSignalStatusProps {
  isAutoMode: boolean;
  lastSignalTime: Date | null;
  aiLearningData: any;
  onToggleAuto: () => void;
}

export function AutoSignalStatus({
  isAutoMode,
  lastSignalTime,
  aiLearningData,
  onToggleAuto,
}: AutoSignalStatusProps) {
  const formatTimeSince = (date: Date | null) => {
    if (!date) return "Aguardando primeiro sinal...";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
              isAutoMode
                ? "bg-gradient-primary animate-pulse"
                : "bg-muted"
            )}
          >
            {isAutoMode ? (
              <Zap className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Activity className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              Sistema Automático
              {isAutoMode && (
                <Badge variant="default" className="bg-success animate-pulse">
                  Ativo
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAutoMode
                ? "Gerando sinais inteligentes automaticamente"
                : "Modo automático pausado"}
            </p>
          </div>
        </div>
        <Button
          onClick={onToggleAuto}
          variant={isAutoMode ? "destructive" : "default"}
          size="sm"
          className="min-w-[100px]"
        >
          {isAutoMode ? "Pausar" : "Iniciar"}
        </Button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Último Sinal</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {formatTimeSince(lastSignalTime)}
          </p>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Taxa IA</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {aiLearningData?.winRate || "N/A"}%
          </p>
        </div>
      </div>

      {/* AI Learning Insights */}
      {isAutoMode && aiLearningData && (
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">
              Aprendizado da IA
            </span>
          </div>

          <div className="space-y-2">
            {aiLearningData.bestAssets && aiLearningData.bestAssets.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Melhores ativos: </span>
                <span className="font-medium text-foreground">
                  {aiLearningData.bestAssets.slice(0, 3).join(", ")}
                </span>
              </div>
            )}

            {aiLearningData.bestDirection && (
              <div className="text-xs">
                <span className="text-muted-foreground">Direção favorável: </span>
                <span className="font-medium text-foreground">
                  {aiLearningData.bestDirection.CALL > aiLearningData.bestDirection.PUT
                    ? "CALL"
                    : "PUT"}{" "}
                  ({Math.max(
                    aiLearningData.bestDirection.CALL,
                    aiLearningData.bestDirection.PUT
                  )}{" "}
                  vitórias)
                </span>
              </div>
            )}

            {aiLearningData.bestIndicators && aiLearningData.bestIndicators.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Indicadores eficazes: </span>
                <span className="font-medium text-foreground">
                  {aiLearningData.bestIndicators.slice(0, 3).join(", ")}
                </span>
              </div>
            )}

            {aiLearningData.avgWinProbability && (
              <div className="text-xs">
                <span className="text-muted-foreground">
                  Probabilidade média (vitórias):{" "}
                </span>
                <span className="font-medium text-success">
                  {aiLearningData.avgWinProbability}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info automático */}
      {isAutoMode && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            🤖 A IA analisa o mercado continuamente e gera sinais apenas quando
            identifica oportunidades de alta probabilidade (≥75%)
          </p>
        </div>
      )}
    </Card>
  );
}
