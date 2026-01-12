import { useState, lazy, Suspense, useEffect } from "react";
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  XCircle, 
  Activity,
  CheckCircle,
  X,
  Filter
} from "lucide-react";
import { SignalCard } from "@/components/SignalCard";
import { StatsCard } from "@/components/StatsCard";
import { MarketToggle } from "@/components/MarketToggle";
import { GenerateButton } from "@/components/GenerateButton";
import { AutoGenerateToggle } from "@/components/AutoGenerateToggle";
const PerformanceChart = lazy(() => import("@/components/PerformanceChart").then(m => ({ default: m.PerformanceChart })));
import { useSignals } from "@/hooks/useSignals";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { SoundToggle } from "@/components/SoundToggle";
import { AIEvolutionPanel } from "@/components/AIEvolutionPanel";
import { Brain, NotebookPen, Database, Cpu, FlaskConical } from "lucide-react";
import { AILearningLogPanel } from "@/components/AILearningLogPanel";
import { KnowledgePanel } from "@/components/KnowledgePanel";
import AIControlDashboard from "@/components/AIControlDashboard";
import { aiSignalAnalyzer } from "@/lib/aiSignalAnalyzer";
import AutoAnalysisTestNew from "@/components/AutoAnalysisTestNew";
import { ContinuousLearningPanel } from "@/components/ContinuousLearningPanel";

const Index = () => {
  const [marketType, setMarketType] = useState<"OTC" | "OPEN">("OPEN");
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "CALL" | "PUT">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"signals" | "evolution" | "learning" | "knowledge" | "ai-control" | "test">("signals");
  const { 
    signals, 
    stats, 
    isLoading, 
    isGenerating, 
    generateSignal,
    updateSignalResult,
    autoGenerateEnabled,
    setAutoGenerateEnabled,
    minProbability,
    setMinProbability,
    autoRefreshInterval,
    setAutoRefreshInterval
  } = useSignals(marketType, true);

  // Mock chart data - would come from real performance metrics
  const chartData = [
    { name: "Seg", wins: 8, losses: 2 },
    { name: "Ter", wins: 12, losses: 3 },
    { name: "Qua", wins: 10, losses: 4 },
    { name: "Qui", wins: 15, losses: 2 },
    { name: "Sex", wins: 11, losses: 3 },
  ];

  const displaySignals = signals
    .filter((s) => Number(s.probability) >= minProbability)
    .filter((s) => directionFilter === "ALL" || s.direction === directionFilter);

  // ✅ SIMULAÇÃO DE PREÇOS PARA AUTO-ANÁLISE
  useEffect(() => {
    const assets = [
      "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD",
      "EUR/GBP", "EUR/JPY", "GBP/JPY", "NZD/USD", "USD/CHF",
      "EUR/USD OTC", "GBP/USD OTC", "USD/JPY OTC", "AUD/USD OTC"
    ];

    const priceInterval = setInterval(() => {
      assets.forEach(asset => {
        const basePrice = 100 + Math.random() * 50;
        const volatility = 2; // 2% de volatilidade
        
        const priceData = {
          asset,
          timestamp: Date.now(),
          open: basePrice,
          high: basePrice + (Math.random() * volatility),
          low: basePrice - (Math.random() * volatility),
          close: basePrice + ((Math.random() - 0.5) * volatility),
          volume: Math.floor(Math.random() * 1000000),
        };

        aiSignalAnalyzer.updatePrice(priceData);
      });
    }, 3000); // Atualizar preços a cada 3 segundos

    console.log('📊 Simulação de preços iniciada para auto-análise');

    return () => clearInterval(priceInterval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Bullex AI Signals</h1>
                <p className="text-xs text-muted-foreground">Sinais inteligentes com IA</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SoundToggle />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Market Toggle */}
        <MarketToggle value={marketType} onChange={setMarketType} />

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-card/50 p-2 rounded-lg border border-border/50 overflow-x-auto">
          <Button
            variant={activeTab === "signals" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("signals")}
            className="flex-1 min-w-max"
          >
            <Activity className="w-4 h-4 mr-2" />
            Sinais
          </Button>
          <Button
            variant={activeTab === "test" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("test")}
            className="flex-1 min-w-max bg-yellow-900/20"
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            Teste WIN/LOSS
          </Button>
          <Button
            variant={activeTab === "evolution" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("evolution")}
            className="flex-1 min-w-max"
          >
            <Brain className="w-4 h-4 mr-2" />
            Evolução da IA
          </Button>
          <Button
            variant={activeTab === "learning" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("learning")}
            className="flex-1 min-w-max"
          >
            <NotebookPen className="w-4 h-4 mr-2" />
            Aprendizados da IA
          </Button>
          <Button
            variant={activeTab === "knowledge" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("knowledge")}
            className="flex-1 min-w-max"
          >
            <Database className="w-4 h-4 mr-2" />
            Base de Conhecimento
          </Button>
          <Button
            variant={activeTab === "ai-control" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("ai-control")}
            className="flex-1 min-w-max"
          >
            <Cpu className="w-4 h-4 mr-2" />
            AI Control
          </Button>
        </div>

        {/* Content Based on Tab */}
        {activeTab === "signals" ? (
          <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard
            title="Taxa de Acerto"
            value={`${stats.accuracy}%`}
            subtitle="Últimos sinais"
            icon={Target}
            variant="accent"
          />
          <StatsCard
            title="Vitórias"
            value={stats.wins}
            subtitle="Sinais vencedores"
            icon={Trophy}
            variant="success"
          />
          <StatsCard
            title="Perdas"
            value={stats.losses}
            subtitle="Sinais perdidos"
            icon={XCircle}
            variant="danger"
          />
          <StatsCard
            title="Total"
            value={stats.total}
            subtitle="Sinais gerados"
            icon={TrendingUp}
            variant="default"
          />
        </div>

        {/* Performance Chart */}
        <Suspense fallback={<div className="h-64 bg-card/50 rounded-lg animate-pulse" />}>
          <PerformanceChart data={chartData} />
        </Suspense>

        {/* Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Ocultar" : "Mostrar"} Filtros Avançados
        </Button>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-3 bg-card/50 p-4 rounded-lg border border-border/50">
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Filtrar por direção</span>
              <div className="flex gap-2">
                <Button
                  variant={directionFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirectionFilter("ALL")}
                  className="flex-1"
                >
                  Todos
                </Button>
                <Button
                  variant={directionFilter === "CALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirectionFilter("CALL")}
                  className="flex-1"
                >
                  CALL ↑
                </Button>
                <Button
                  variant={directionFilter === "PUT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirectionFilter("PUT")}
                  className="flex-1"
                >
                  PUT ↓
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Continuous Learning Panel */}
        <ContinuousLearningPanel />

                  </>
        ) : activeTab === "evolution" ? (
          <AIEvolutionPanel />
        ) : activeTab === "learning" ? (
          <AILearningLogPanel />
        ) : (
          <KnowledgePanel />
        )}

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confiança mínima</span>
            <span className="text-sm font-medium">{minProbability}%</span>
          </div>
          <Slider value={[minProbability]} min={80} max={100} step={1} onValueChange={(v) => setMinProbability(v[0])} />
        </div>

        {/* Auto Generate Toggle */}
        <AutoGenerateToggle 
          enabled={autoGenerateEnabled} 
          onToggle={setAutoGenerateEnabled}
          disabled={isGenerating}
        />

        {/* Auto Refresh Interval */}
        {autoGenerateEnabled && (
          <div className="space-y-2 bg-card/50 p-4 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">⏱️ Intervalo de geração</span>
              <span className="text-sm font-medium">{autoRefreshInterval}s</span>
            </div>
            <Slider 
              value={[autoRefreshInterval]} 
              min={30} 
              max={300} 
              step={10} 
              onValueChange={(v) => setAutoRefreshInterval(v[0])} 
            />
            <p className="text-xs text-muted-foreground">A IA gerará novos sinais automaticamente a cada {autoRefreshInterval} segundos</p>
          </div>
        )}

        {/* Generate Button */}
        <GenerateButton onClick={generateSignal} isLoading={isGenerating} disabled={autoGenerateEnabled} />

        {/* Signals List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Sinais Recentes (≥ {minProbability}%) - {marketType === "OTC" ? "OTC" : "Mercado Aberto"}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : displaySignals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum sinal ≥ {minProbability}% encontrado</p>
              <p className="text-sm">Ative a geração automática ou tente novamente em alguns segundos</p>
            </div>
          ) : activeTab === "test" ? (
          <AutoAnalysisTestNew />
        ) : activeTab === "knowledge" ? (
          <KnowledgePanel />
        ) : activeTab === "ai-control" ? (
          <AIControlDashboard />
        ) : (
            <div className="space-y-3">
              {displaySignals.map((signal, idx) => (
                <div key={signal.id} className="animate-fade-in">
                  <SignalCard
                    asset={signal.asset}
                    direction={signal.direction}
                    probability={Number(signal.probability)}
                    expirationTime={signal.expiration_time}
                    indicators={signal.indicators_used || []}
                    reasoning={signal.ai_reasoning || undefined}
                    result={signal.result}
                    createdAt={signal.created_at}
                    entryTime={signal.entry_time}
                    exitTime={signal.exit_time}
                    isLatest={idx === 0 && signal.result === "PENDING"}
                  />
                  
                  {/* Result buttons for pending signals */}
                  {(signal.result === "PENDING" || !signal.result) && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-success/50 text-success hover:bg-success/20"
                        onClick={() => updateSignalResult(signal.id, "WIN")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Vitória
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/20"
                        onClick={() => updateSignalResult(signal.id, "LOSS")}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Perda
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            ⚠️ Trading envolve riscos. Use com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
