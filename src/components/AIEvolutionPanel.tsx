import { useState, useEffect, memo } from "react";
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  Send,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { aiEvolutionTracker, type EvolutionMetric } from "@/lib/aiEvolutionTracker";
import { aiLearningSystem } from "@/lib/aiLearning";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const AIEvolutionPanel = memo(function AIEvolutionPanel() {
  const [metrics, setMetrics] = useState<EvolutionMetric[]>([]);
  const [feedback, setFeedback] = useState(aiEvolutionTracker.getFeedback());
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<"improvement" | "suggestion" | "bug">("suggestion");
  const [showFeedback, setShowFeedback] = useState(false);

  // Atualizar métricas quando a IA aprende
  useEffect(() => {
    const learningState = aiLearningSystem.getLearningState();
    const stats = aiEvolutionTracker.getEvolutionStats();

    // Registrar métrica de evolução a cada minuto
    const interval = setInterval(() => {
      const currentState = aiLearningSystem.getLearningState();
      const hist = aiLearningSystem.getHistory();
      const wins = hist.filter(h => h.result === 'WIN').length;
      const completed = hist.filter(h => h.result === 'WIN' || h.result === 'LOSS').length;
      const accuracy = completed > 0 ? (wins / completed) * 100 : 0;
      aiEvolutionTracker.recordMetric({
        winRate: currentState.winRate,
        totalSignals: currentState.totalSignals,
        phase: String(currentState.evolutionPhase),
        topIndicators: currentState.bestIndicators,
        accuracy,
      });

      setMetrics(aiEvolutionTracker.getMetrics(4));
    }, 60000); // A cada minuto

    // Registrar primeira métrica
    {
      const hist = aiLearningSystem.getHistory();
      const wins = hist.filter(h => h.result === 'WIN').length;
      const completed = hist.filter(h => h.result === 'WIN' || h.result === 'LOSS').length;
      const accuracy = completed > 0 ? (wins / completed) * 100 : 0;
      aiEvolutionTracker.recordMetric({
        winRate: learningState.winRate,
        totalSignals: learningState.totalSignals,
        phase: String(learningState.evolutionPhase),
        topIndicators: learningState.bestIndicators,
        accuracy,
      });
    }

    setMetrics(aiEvolutionTracker.getMetrics(4));

    return () => clearInterval(interval);
  }, []);

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;

    aiEvolutionTracker.addFeedback(feedbackType, feedbackText);
    setFeedback(aiEvolutionTracker.getFeedback());
    setFeedbackText("");

    // Toast visual
    const messages = {
      improvement: "💡 Sugestão de melhoria registrada!",
      suggestion: "📝 Sugestão anotada!",
      bug: "🐛 Bug relatado!",
    };

    console.log(messages[feedbackType]);
  };

  const handleClearHistory = () => {
    if (confirm("Limpar todo histórico de evolução da IA?")) {
      aiEvolutionTracker.clear();
      setMetrics([]);
      setFeedback([]);
    }
  };

  const learningState = aiLearningSystem.getLearningState();
  const stats = aiEvolutionTracker.getEvolutionStats();
  const chartData = aiEvolutionTracker.getMetricsForChart();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Evolução da IA</h2>
          <p className="text-sm text-muted-foreground">Acompanhe o aprendizado e progresso</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Win Rate */}
        <Card className="bg-gradient-card border-border/50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Taxa de Acerto Atual</p>
              <p className="text-3xl font-bold text-success">{learningState.winRate.toFixed(1)}%</p>
              {stats && stats.winRateDelta !== 0 && (
                <p className={cn(
                  "text-xs mt-2",
                  stats.winRateDelta > 0 ? "text-success" : "text-destructive"
                )}>
                  {stats.winRateDelta > 0 ? "+" : ""}{stats.winRateDelta.toFixed(1)}% na última hora
                </p>
              )}
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
        </Card>

        {/* Phase */}
        <Card className="bg-gradient-card border-border/50 p-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Fase de Evolução</p>
            <Badge className="mb-3" variant="outline">
              {learningState.evolutionPhase}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Sinais processados: {learningState.totalSignals}
            </p>
          </div>
        </Card>

        {/* Top Indicator */}
        <Card className="bg-gradient-card border-border/50 p-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Indicador Dominante</p>
            <p className="text-xl font-bold text-gradient">
              {learningState.bestIndicators[0] || "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {learningState.bestIndicators.length} indicadores aprendidos
            </p>
          </div>
        </Card>
      </div>

      {/* Evolution Chart */}
      {chartData.length > 1 && (
        <Card className="bg-gradient-card border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-4">Gráfico de Evolução (4h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 15, 30, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#22c55e"
                name="Win Rate %"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#06b6d4"
                name="Accuracy %"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Best Indicators */}
      <Card className="bg-gradient-card border-border/50 p-4">
        <h3 className="text-sm font-semibold mb-3">Indicadores Mais Eficazes</h3>
        <div className="flex flex-wrap gap-2">
          {learningState.bestIndicators.length > 0 ? (
            learningState.bestIndicators.map((indicator, idx) => (
              <Badge key={idx} className="bg-primary/20 text-primary">
                {indicator}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Ainda coletando dados...</p>
          )}
        </div>
      </Card>

      {/* Feedback Section */}
      <Card className="bg-gradient-card border-border/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Feedback & Sugestões</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFeedback(!showFeedback)}
          >
            {showFeedback ? "Fechar" : "Novo Feedback"}
          </Button>
        </div>

        {showFeedback && (
          <div className="space-y-3 mb-4 p-3 bg-secondary/50 rounded-lg">
            <div className="flex gap-2">
              {(["improvement", "suggestion", "bug"] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={feedbackType === type ? "default" : "outline"}
                  onClick={() => setFeedbackType(type)}
                  className="flex-1"
                >
                  {type === "improvement" && <Lightbulb className="w-3 h-3 mr-1" />}
                  {type === "suggestion" && <MessageSquare className="w-3 h-3 mr-1" />}
                  {type === "bug" && <AlertCircle className="w-3 h-3 mr-1" />}
                  {type === "improvement" && "Melhoria"}
                  {type === "suggestion" && "Sugestão"}
                  {type === "bug" && "Bug"}
                </Button>
              ))}
            </div>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Descreva sua sugestão ou melhoria para a IA..."
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded text-sm text-foreground placeholder-muted-foreground resize-none h-20"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className="flex-1"
              >
                <Send className="w-3 h-3 mr-1" />
                Enviar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFeedback(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="space-y-2">
          {feedback.length > 0 ? (
            feedback
              .slice()
              .reverse()
              .slice(0, 5)
              .map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-2 rounded-lg text-xs",
                    item.type === "improvement" && "bg-blue/10 border border-blue/30",
                    item.type === "suggestion" && "bg-cyan/10 border border-cyan/30",
                    item.type === "bug" && "bg-red/10 border border-red/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{item.content}</p>
                      <p className="text-muted-foreground mt-1">
                        {new Date(item.timestamp).toLocaleTimeString("pt-BR")}
                      </p>
                      {item.aiResponse && (
                        <p className="mt-2">
                          <span className="font-medium">Resposta da IA:</span> {item.aiResponse}
                        </p>
                      )}
                      {item.appliedChanges && item.appliedChanges.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium">Implantado:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.appliedChanges.map((c, idx) => (
                              <Badge key={idx} variant="secondary">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.type === "improvement" && "💡"}
                      {item.type === "suggestion" && "📝"}
                      {item.type === "bug" && "🐛"}
                    </Badge>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum feedback ainda. Suas sugestões ajudam a IA a evoluir!
            </p>
          )}
        </div>

        {feedback.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="w-full mt-3 text-destructive"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Limpar Histórico
          </Button>
        )}
      </Card>

      {/* Info */}
      <Card className="bg-gradient-card border-border/50 p-4 text-xs text-muted-foreground">
        <p>💡 <strong>Dica:</strong> Quanto mais feedback você fornece, melhor a IA aprende. Relate padrões que funcionam bem ou oportunidades de melhoria.</p>
      </Card>
    </div>
  );
});
