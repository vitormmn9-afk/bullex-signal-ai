import { useState } from "react";
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  XCircle, 
  Activity,
  CheckCircle,
  X
} from "lucide-react";
import { SignalCard } from "@/components/SignalCard";
import { StatsCard } from "@/components/StatsCard";
import { MarketToggle } from "@/components/MarketToggle";
import { GenerateButton } from "@/components/GenerateButton";
import { AutoGenerateToggle } from "@/components/AutoGenerateToggle";
import { PerformanceChart } from "@/components/PerformanceChart";
import { useSignals } from "@/hooks/useSignals";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [marketType, setMarketType] = useState<"OTC" | "OPEN">("OPEN");
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
    setMinProbability
  } = useSignals(marketType, true);

  // Mock chart data - would come from real performance metrics
  const chartData = [
    { name: "Seg", wins: 8, losses: 2 },
    { name: "Ter", wins: 12, losses: 3 },
    { name: "Qua", wins: 10, losses: 4 },
    { name: "Qui", wins: 15, losses: 2 },
    { name: "Sex", wins: 11, losses: 3 },
  ];

  const displaySignals = signals.filter((s) => Number(s.probability) >= minProbability);

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
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Market Toggle */}
        <MarketToggle value={marketType} onChange={setMarketType} />

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
        <PerformanceChart data={chartData} />

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
