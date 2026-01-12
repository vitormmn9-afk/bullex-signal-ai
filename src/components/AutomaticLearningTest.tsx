import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCw, Zap } from "lucide-react";
import { aiLearningSystem } from "@/lib/aiLearning";
import { aiEvolutionTracker } from "@/lib/aiEvolutionTracker";

export function AutomaticLearningTest() {
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalOps: 0,
    wins: 0,
    losses: 0,
    accuracy: 0,
  });

  const generateSimulatedOperations = async () => {
    setTestRunning(true);
    setTestResults([]);
    
    const operations = 10;
    const assets = ["EUR/USD", "GBP/USD", "USD/JPY"];
    
    for (let i = 0; i < operations; i++) {
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const direction: 'CALL' | 'PUT' = Math.random() > 0.5 ? 'CALL' : 'PUT';
      const isWin = Math.random() > 0.4; // 60% de taxa de ganho
      const result = isWin ? 'WIN' : 'LOSS';
      
      // Criar sinal simulado para o histórico
      const signalId = `test-${Date.now()}-${i}`;
      const signalHistory = {
        id: signalId,
        asset,
        direction,
        probability: 85 + Math.random() * 10,
        analysisMetrics: {
          rsi: 30 + Math.random() * 40,
          macd: (Math.random() - 0.5) * 2,
          bbands: 40 + Math.random() * 20,
          candlePattern: ['bullish_engulfing', 'bearish_harami', 'doji', 'hammer'][Math.floor(Math.random() * 4)],
          quadrantScore: 50 + Math.random() * 50,
          priceAction: 50 + Math.random() * 50,
          volumeProfile: 50 + Math.random() * 50,
          trendStrength: isWin ? 50 + Math.random() * 50 : 30 + Math.random() * 40,
          supportResistance: isWin ? 60 + Math.random() * 40 : 40 + Math.random() * 40,
          overallScore: 60 + Math.random() * 40,
        },
        result: result as 'WIN' | 'LOSS',
        timestamp: Date.now() + (i * 1000), // Espaçar um pouco
      };
      
      // Registrar no sistema de aprendizado
      aiLearningSystem.recordSignal(signalHistory);
      
      // Registrar no evolution tracker
      aiEvolutionTracker.addOperationLearning({
        signalId,
        asset,
        direction,
        result: result as 'WIN' | 'LOSS',
        indicators: ['RSI', 'MACD'],
        candlePattern: signalHistory.analysisMetrics.candlePattern,
        learned: `Teste automático: ${result} em ${asset}`,
        implemented: ['Test operation recorded'],
      });
      
      const message = `[${i + 1}/${operations}] ${asset} ${direction} → ${result}`;
      setTestResults(prev => [...prev, message]);
      
      // Atualizar stats em tempo real
      const history = aiLearningSystem.getHistory();
      const wins = history.filter(h => h.result === 'WIN').length;
      const losses = history.filter(h => h.result === 'LOSS').length;
      const accuracy = (wins / (wins + losses)) * 100;
      
      setStats({
        totalOps: wins + losses,
        wins,
        losses,
        accuracy: isNaN(accuracy) ? 0 : accuracy,
      });
      
      // Aguardar um pouco para ver o progresso
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTestRunning(false);
    
    // Log final
    const finalLearning = aiLearningSystem.getLearningState();
    console.log('📊 Teste Completo - Learning State:', finalLearning);
  };

  const resetTest = () => {
    setTestResults([]);
    setStats({ totalOps: 0, wins: 0, losses: 0, accuracy: 0 });
    localStorage.removeItem('bullex_ai_learning_history');
    aiLearningSystem.getHistory().splice(0);
    console.log('🔄 Histórico de aprendizado resetado');
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-green-900/20 via-emerald-900/20 to-teal-900/20 border-green-500/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Teste de Aprendizado Automático
          </h3>
          <Badge variant="outline" className="text-xs">
            {testRunning ? '🔴 Em Execução' : '🟢 Pronto'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-green-950/50 rounded p-2 border border-green-500/20 text-center">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-xl font-bold text-green-400">{stats.totalOps}</div>
          </div>
          <div className="bg-blue-950/50 rounded p-2 border border-blue-500/20 text-center">
            <div className="text-xs text-gray-400">Vitórias</div>
            <div className="text-xl font-bold text-blue-400">{stats.wins}</div>
          </div>
          <div className="bg-red-950/50 rounded p-2 border border-red-500/20 text-center">
            <div className="text-xs text-gray-400">Perdas</div>
            <div className="text-xl font-bold text-red-400">{stats.losses}</div>
          </div>
          <div className="bg-purple-950/50 rounded p-2 border border-purple-500/20 text-center">
            <div className="text-xs text-gray-400">Taxa</div>
            <div className="text-xl font-bold text-purple-400">{stats.accuracy.toFixed(1)}%</div>
          </div>
        </div>

        {/* Log */}
        {testResults.length > 0 && (
          <div className="bg-gray-900/50 rounded border border-gray-700/30 p-3 max-h-32 overflow-y-auto">
            <div className="space-y-1 text-xs font-mono">
              {testResults.map((result, i) => (
                <div key={i} className="text-gray-400">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-2">
          <Button
            onClick={generateSimulatedOperations}
            disabled={testRunning}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {testRunning ? 'Executando...' : 'Iniciar Teste'}
          </Button>
          <Button
            onClick={resetTest}
            disabled={testRunning}
            variant="outline"
            className="flex-1"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>

        {/* Info */}
        <div className="bg-green-950/30 border border-green-500/30 rounded p-3 text-xs text-gray-300">
          <p className="leading-relaxed">
            <strong className="text-green-400">✨ O Que Testa:</strong> Gera 10 operações simuladas e verifica se o sistema está aprendendo. 
            Observe no console e na aba "Aprendizados da IA" se os resultados aparecem.
          </p>
        </div>
      </div>
    </Card>
  );
}
