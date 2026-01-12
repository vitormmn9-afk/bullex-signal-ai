import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface LearningLog {
  id: string;
  timestamp: number;
  result: 'WIN' | 'LOSS';
  asset: string;
  direction: 'CALL' | 'PUT';
  accuracy: number;
}

export function RealTimeLearningMonitor() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [stats, setStats] = useState({
    totalLearned: 0,
    lastLearning: new Date(),
    learningRate: 0,
  });

  useEffect(() => {
    const handleOperationLearned = (event: any) => {
      const { result, asset, direction, accuracy, timestamp } = event.detail;
      
      const newLog: LearningLog = {
        id: `${timestamp}-${Math.random()}`,
        timestamp,
        result,
        asset,
        direction,
        accuracy,
      };

      setLogs(prev => [newLog, ...prev].slice(0, 20)); // Manter últimos 20
      setStats(prev => ({
        totalLearned: prev.totalLearned + 1,
        lastLearning: new Date(),
        learningRate: 0,
      }));
    };

    window.addEventListener('operation-learned', handleOperationLearned);
    return () => window.removeEventListener('operation-learned', handleOperationLearned);
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border-blue-500/30">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
            Monitor de Aprendizado em Tempo Real
          </h3>
          <Badge variant="outline" className="text-xs">
            📊 {logs.length} aprendizados
          </Badge>
        </div>

        {/* Activity Log */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-xs text-gray-400 py-4 text-center">
              Aguardando operações para aprender...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2 border border-gray-700/30 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  {log.result === 'WIN' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <div className="text-xs">
                    <span className="text-gray-300">{log.asset}</span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className={log.direction === 'CALL' ? 'text-green-400' : 'text-red-400'}>
                      {log.direction}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatTime(log.timestamp)}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1.5 ${
                      log.accuracy >= 70 ? 'border-green-500/30 text-green-400' :
                      log.accuracy >= 50 ? 'border-yellow-500/30 text-yellow-400' :
                      'border-red-500/30 text-red-400'
                    }`}
                  >
                    {log.accuracy.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-950/30 border border-blue-500/20 rounded px-3 py-2">
          <p className="text-xs text-blue-300 leading-relaxed">
            <strong>🔄 Fluxo:</strong> Cada WIN/LOSS dispara aprendizado automático → Registra no AI Learning System → 
            Evolução Contínua em tempo real
          </p>
        </div>
      </div>
    </Card>
  );
}
