import { Brain, TrendingUp, Target, Activity, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AILearningDashboardProps {
  learningData: any;
}

export function AILearningDashboard({ learningData }: AILearningDashboardProps) {
  if (!learningData) {
    return (
      <Card className="p-6 bg-card/50">
        <div className="text-center text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">A IA ainda está coletando dados...</p>
          <p className="text-xs mt-1">Aguarde alguns sinais para ver o aprendizado</p>
        </div>
      </Card>
    );
  }

  const { 
    bestAssets, 
    bestDirection, 
    bestIndicators, 
    timePatterns, 
    winRate,
    avgWinProbability,
    avgLossProbability 
  } = learningData;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-card border-primary/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary-foreground animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Machine Learning Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            Análise contínua de padrões e performance
          </p>
        </div>
      </div>

      {/* Performance Global */}
      <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              Taxa de Acerto Global
            </span>
          </div>
          <Badge variant="default" className="bg-gradient-primary">
            {winRate}%
          </Badge>
        </div>
        <Progress value={parseFloat(winRate)} className="h-3" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Prob. Média (Vitórias):</span>
            <p className="text-success font-semibold">{avgWinProbability}%</p>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Prob. Média (Perdas):</span>
            <p className="text-destructive font-semibold">{avgLossProbability}%</p>
          </div>
        </div>
      </div>

      {/* Grid de Análises */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Melhores Ativos */}
        {bestAssets && bestAssets.length > 0 && (
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-success" />
              <h3 className="font-semibold text-sm text-foreground">
                Top 5 Ativos
              </h3>
            </div>
            <div className="space-y-2">
              {bestAssets.slice(0, 5).map((asset: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-foreground font-medium">{asset}</span>
                  <Badge variant="outline" className="text-xs">
                    #{idx + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direção Favorável */}
        {bestDirection && (
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Análise de Direção
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">CALL</span>
                  <span className="text-xs font-semibold text-success">
                    {bestDirection.CALL} vitórias
                  </span>
                </div>
                <Progress
                  value={
                    (bestDirection.CALL /
                      (bestDirection.CALL + bestDirection.PUT)) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">PUT</span>
                  <span className="text-xs font-semibold text-destructive">
                    {bestDirection.PUT} vitórias
                  </span>
                </div>
                <Progress
                  value={
                    (bestDirection.PUT /
                      (bestDirection.CALL + bestDirection.PUT)) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Indicadores Mais Eficazes */}
        {bestIndicators && bestIndicators.length > 0 && (
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-sm text-foreground">
                Indicadores Eficazes
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {bestIndicators.slice(0, 6).map((indicator: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {indicator}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Padrões Temporais */}
        {timePatterns && timePatterns.length > 0 && (
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-sm text-foreground">
                Melhores Horários
              </h3>
            </div>
            <div className="space-y-2">
              {timePatterns.map((pattern: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-foreground">
                    {pattern.hour}:00 - {pattern.hour + 1}:00
                  </span>
                  <Badge variant="outline" className="text-xs bg-success/10">
                    {pattern.count} sinais
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights da IA */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Insights do Machine Learning
        </h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              A IA prioriza ativos com maior histórico de sucesso e evita padrões
              que resultaram em perdas
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Apenas sinais com confluência de múltiplos indicadores são gerados no
              modo automático
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              O sistema aprende continuamente: quanto mais resultados você
              registrar, mais precisa ela fica
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Sinais automáticos possuem probabilidade mínima de 75% para garantir
              qualidade
            </span>
          </li>
        </ul>
      </div>
    </Card>
  );
}
