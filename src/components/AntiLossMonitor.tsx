import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingDown } from 'lucide-react';
import { antiLossSystem } from '@/lib/antiLossSystem';

export const AntiLossMonitor: React.FC = () => {
  const [stats, setStats] = useState(antiLossSystem.getStats());
  const [blockedPatterns, setBlockedPatterns] = useState(antiLossSystem.getBlockedPatterns());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(antiLossSystem.getStats());
      setBlockedPatterns(antiLossSystem.getBlockedPatterns());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level: number) => {
    if (level >= 3) return 'text-red-500';
    if (level >= 2) return 'text-orange-500';
    return 'text-yellow-500';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">🛡️ Sistema Anti-Loss</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Padrões Rastreados</div>
          <div className="text-2xl font-bold text-white">{stats.totalPatterns}</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-red-900/30">
          <div className="text-xs text-slate-400 mb-1">Bloqueados</div>
          <div className="text-2xl font-bold text-red-400">{stats.blockedPatterns}</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-orange-900/30">
          <div className="text-xs text-slate-400 mb-1">Alto Risco</div>
          <div className="text-2xl font-bold text-orange-400">{stats.highRiskPatterns}</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-yellow-900/30">
          <div className="text-xs text-slate-400 mb-1">Perdas Médias</div>
          <div className="text-2xl font-bold text-yellow-400">
            {stats.avgConsecutiveLosses.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Blocked Patterns */}
      {blockedPatterns.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <XCircle className="w-4 h-4" />
            <span>Padrões Bloqueados (3+ perdas consecutivas)</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {blockedPatterns.slice(0, 5).map((pattern, idx) => (
              <div
                key={idx}
                className="bg-red-950/30 border border-red-900/50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="font-mono text-sm text-white">
                      {pattern.pattern}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      pattern.direction === 'CALL' 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {pattern.direction}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${getRiskColor(pattern.consecutiveLosses)}`}>
                    {pattern.consecutiveLosses} perdas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-400">
                    Tentativas: <span className="text-white">{pattern.totalAttempts}</span>
                  </div>
                  <div className="text-slate-400">
                    Taxa: <span className="text-red-400">
                      {((pattern.consecutiveLosses / pattern.totalAttempts) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Horário: <span className="text-white">{pattern.conditions.timeOfDay}</span>
                  </div>
                  <div className="text-slate-400">
                    Volatilidade: <span className="text-white">{pattern.conditions.volatilityLevel}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Última ocorrência: {new Date(pattern.lastOccurrence).toLocaleTimeString('pt-BR')}
                </div>
              </div>
            ))}
          </div>

          {blockedPatterns.length > 5 && (
            <div className="text-xs text-slate-500 text-center mt-2">
              +{blockedPatterns.length - 5} padrões adicionais bloqueados
            </div>
          )}
        </div>
      )}

      {blockedPatterns.length === 0 && (
        <div className="flex items-center gap-2 text-green-400 bg-green-950/20 border border-green-900/30 rounded-lg p-3">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Nenhum padrão bloqueado no momento</span>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg">
        <div className="flex items-start gap-2 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
          <div>
            <div className="text-blue-300 font-semibold mb-1">Como funciona:</div>
            <ul className="space-y-1 text-slate-400">
              <li>• 2 perdas consecutivas = Alto risco (-40% confiança)</li>
              <li>• 3+ perdas consecutivas = Bloqueio automático</li>
              <li>• Padrões expiram após 24h sem ocorrência</li>
              <li>• 1 vitória reseta contador de perdas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
