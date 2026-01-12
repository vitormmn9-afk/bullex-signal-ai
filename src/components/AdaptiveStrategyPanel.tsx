import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Settings } from "lucide-react";
import { aiLearningSystem } from "@/lib/aiLearning";

export function AdaptiveStrategyPanel() {
  const [config, setConfig] = useState({
    minTrendStrength: 40,
    minSupportResistance: 50,
    requireConfirmations: 1,
  });
  const [changes, setChanges] = useState<string[]>([]);
  const [winRate, setWinRate] = useState(0);

  useEffect(() => {
    // Atualizar config inicial
    const currentConfig = aiLearningSystem.getOperationalConfig();
    setConfig({
      minTrendStrength: currentConfig.minTrendStrength,
      minSupportResistance: currentConfig.minSupportResistance,
      requireConfirmations: currentConfig.requireConfirmations,
    });

    const history = aiLearningSystem.getHistory();
    const completed = history.filter(h => h.result === 'WIN' || h.result === 'LOSS');
    const wins = completed.filter(h => h.result === 'WIN').length;
    const rate = completed.length > 0 ? (wins / completed.length) * 100 : 0;
    setWinRate(rate);

    // Listener para mudanças
    const handleLearningUpdate = () => {
      const newConfig = aiLearningSystem.getOperationalConfig();
      const oldConfig = config;

      const configChanges: string[] = [];
      
      if (newConfig.minTrendStrength !== oldConfig.minTrendStrength) {
        const diff = newConfig.minTrendStrength - oldConfig.minTrendStrength;
        configChanges.push(
          `${diff > 0 ? '⬆️' : '⬇️'} Trend Strength: ${oldConfig.minTrendStrength} → ${newConfig.minTrendStrength}`
        );
      }
      
      if (newConfig.minSupportResistance !== oldConfig.minSupportResistance) {
        const diff = newConfig.minSupportResistance - oldConfig.minSupportResistance;
        configChanges.push(
          `${diff > 0 ? '⬆️' : '⬇️'} S/R: ${oldConfig.minSupportResistance} → ${newConfig.minSupportResistance}`
        );
      }
      
      if (newConfig.requireConfirmations !== oldConfig.requireConfirmations) {
        const diff = newConfig.requireConfirmations - oldConfig.requireConfirmations;
        configChanges.push(
          `${diff > 0 ? '⬆️' : '⬇️'} Confirmações: ${oldConfig.requireConfirmations} → ${newConfig.requireConfirmations}`
        );
      }

      if (configChanges.length > 0) {
        setChanges(prev => [...configChanges, ...prev].slice(0, 10));
      }

      setConfig({
        minTrendStrength: newConfig.minTrendStrength,
        minSupportResistance: newConfig.minSupportResistance,
        requireConfirmations: newConfig.requireConfirmations,
      });

      const newHistory = aiLearningSystem.getHistory();
      const newCompleted = newHistory.filter(h => h.result === 'WIN' || h.result === 'LOSS');
      const newWins = newCompleted.filter(h => h.result === 'WIN').length;
      const newRate = newCompleted.length > 0 ? (newWins / newCompleted.length) * 100 : 0;
      setWinRate(newRate);
    };

    window.addEventListener('ai-learning-updated', handleLearningUpdate);
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(handleLearningUpdate, 10000);

    return () => {
      window.removeEventListener('ai-learning-updated', handleLearningUpdate);
      clearInterval(interval);
    };
  }, [config]);

  const getStatusColor = () => {
    if (winRate < 40) return 'text-red-400 border-red-500/30 bg-red-950/30';
    if (winRate < 50) return 'text-orange-400 border-orange-500/30 bg-orange-950/30';
    if (winRate < 60) return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/30';
    if (winRate < 70) return 'text-blue-400 border-blue-500/30 bg-blue-950/30';
    return 'text-green-400 border-green-500/30 bg-green-950/30';
  };

  const getStatusIcon = () => {
    if (winRate < 50) return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (winRate < 60) return <TrendingDown className="w-5 h-5 text-orange-400" />;
    return <TrendingUp className="w-5 h-5 text-green-400" />;
  };

  return (
    <Card className={`p-4 border ${getStatusColor()}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
            <h3 className="text-sm font-bold text-white">Estratégia Adaptativa</h3>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {winRate.toFixed(1)}% Acerto
            </Badge>
          </div>
        </div>

        {/* Current Config */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-900/50 rounded p-2 border border-gray-700/30">
            <div className="text-xs text-gray-400">Trend Min</div>
            <div className="text-lg font-bold text-white">{config.minTrendStrength}</div>
          </div>
          <div className="bg-gray-900/50 rounded p-2 border border-gray-700/30">
            <div className="text-xs text-gray-400">S/R Min</div>
            <div className="text-lg font-bold text-white">{config.minSupportResistance}</div>
          </div>
          <div className="bg-gray-900/50 rounded p-2 border border-gray-700/30">
            <div className="text-xs text-gray-400">Confirm</div>
            <div className="text-lg font-bold text-white">{config.requireConfirmations}</div>
          </div>
        </div>

        {/* Recent Changes */}
        {changes.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-300">Mudanças Recentes:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {changes.map((change, index) => (
                <div
                  key={index}
                  className="text-xs bg-gray-900/50 border border-gray-700/30 rounded px-2 py-1 text-gray-300 font-mono"
                >
                  {change}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`border rounded px-3 py-2 ${getStatusColor()}`}>
          <p className="text-xs leading-relaxed">
            {winRate < 40 && (
              <><strong className="text-red-400">🚨 MODO EMERGÊNCIA:</strong> IA aumentando requisitos AGRESSIVAMENTE para melhorar acurácia!</>
            )}
            {winRate >= 40 && winRate < 50 && (
              <><strong className="text-orange-400">⚠️ AJUSTE ATIVO:</strong> IA detectou baixa performance e está ajustando estratégia...</>
            )}
            {winRate >= 50 && winRate < 60 && (
              <><strong className="text-yellow-400">🔄 OTIMIZANDO:</strong> IA balanceando requisitos para melhor performance...</>
            )}
            {winRate >= 60 && winRate < 70 && (
              <><strong className="text-blue-400">✅ BOM RITMO:</strong> IA mantendo estratégia com ajustes finos...</>
            )}
            {winRate >= 70 && (
              <><strong className="text-green-400">🎯 EXCELENTE:</strong> IA com alta acurácia, relaxando requisitos gradualmente...</>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}
