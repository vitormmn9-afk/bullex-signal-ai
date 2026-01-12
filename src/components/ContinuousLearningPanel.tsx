import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Activity, Zap } from "lucide-react";
import { continuousLearning } from "@/lib/continuousLearning";

export function ContinuousLearningPanel() {
  const [stats, setStats] = useState({
    enabled: true,
    evolutionCycle: 0,
    operationsProcessed: 0,
    learningInterval: 30000,
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [recentLearning, setRecentLearning] = useState<string[]>([]);

  useEffect(() => {
    // Atualizar stats iniciais
    setStats(continuousLearning.getStats());

    // Listener para atualizações do aprendizado
    const handleLearningUpdate = (event: any) => {
      const { cycle, newOperations, accuracy, phase } = event.detail;
      
      setStats(continuousLearning.getStats());
      setLastUpdate(new Date());
      
      // Adicionar mensagem de aprendizado recente
      const message = `Ciclo #${cycle}: ${newOperations} ops | Precisão: ${accuracy.toFixed(1)}% | Fase ${phase}`;
      setRecentLearning(prev => [message, ...prev].slice(0, 5)); // Mantém últimas 5
    };

    window.addEventListener('ai-learning-updated', handleLearningUpdate);

    // Atualizar stats periodicamente
    const interval = setInterval(() => {
      setStats(continuousLearning.getStats());
    }, 5000);

    return () => {
      window.removeEventListener('ai-learning-updated', handleLearningUpdate);
      clearInterval(interval);
    };
  }, []);

  const formatInterval = (ms: number) => {
    return `${ms / 1000}s`;
  };

  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 border-purple-500/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
            <h3 className="text-xl font-bold text-white">Aprendizado Contínuo</h3>
          </div>
          <Badge 
            variant={stats.enabled ? "default" : "secondary"}
            className={stats.enabled ? "bg-green-600 text-white" : ""}
          >
            {stats.enabled ? "🟢 ATIVO" : "⚫ PAUSADO"}
          </Badge>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-400">
          A IA nunca para de aprender. Cada operação é analisada automaticamente para melhorar a precisão.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Ciclos</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.evolutionCycle}
            </div>
          </div>

          <div className="bg-blue-950/50 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Ops Processadas</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.operationsProcessed}
            </div>
          </div>

          <div className="bg-indigo-950/50 rounded-lg p-3 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-400">Intervalo</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatInterval(stats.learningInterval)}
            </div>
          </div>

          <div className="bg-green-950/50 rounded-lg p-3 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Última Atualização</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {timeSinceUpdate}s
            </div>
          </div>
        </div>

        {/* Recent Learning Activity */}
        {recentLearning.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Atividade Recente
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recentLearning.map((learning, index) => (
                <div
                  key={index}
                  className="text-xs bg-gray-900/50 border border-gray-700/30 rounded px-3 py-2 text-gray-300"
                >
                  {learning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
            🔄 Auto-Análise de Padrões
          </Badge>
          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
            📊 Otimização de Indicadores
          </Badge>
          <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-300">
            🎯 Ajuste Adaptativo
          </Badge>
          <Badge variant="outline" className="text-xs border-green-500/30 text-green-300">
            🛡️ Detecção de Fraquezas
          </Badge>
        </div>

        {/* Info Box */}
        <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-gray-300 leading-relaxed">
            <strong className="text-blue-400">💡 Como funciona:</strong> O sistema analisa automaticamente cada resultado (WIN/LOSS), 
            identifica padrões de sucesso e falha, ajusta thresholds dinamicamente, e otimiza pesos de indicadores. 
            Tudo isso acontece em background a cada {formatInterval(stats.learningInterval)}, garantindo que a IA esteja sempre evoluindo.
          </p>
        </div>
      </div>
    </Card>
  );
}
