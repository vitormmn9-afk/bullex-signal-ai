import { useAutoSignalAnalysis, type GeneratedSignal } from '@/hooks/useAutoSignalAnalysis';
import { useEffect, useState } from 'react';

/**
 * Exemplo de integração: Como usar o auto-analyzer com seus sinais gerados
 * Este arquivo demonstra como conectar o sistema de análise automática
 * com seu sistema de geração de sinais existente
 */

export const SignalIntegrationExample = () => {
  const { registerSignal, startAutoAnalysis, getAnalyzedSignals, getStatistics } =
    useAutoSignalAnalysis();
  const [stats, setStats] = useState<any>(null);

  // Iniciar análise automática quando componente monta
  useEffect(() => {
    const cleanup = startAutoAnalysis();
    return cleanup;
  }, [startAutoAnalysis]);

  // Exemplo 1: Registrar um novo sinal quando gerado
  const handleNewSignal = (signal: GeneratedSignal) => {
    console.log('📍 Novo sinal gerado:', signal);

    // Registra o sinal para análise automática
    registerSignal(signal);

    // A IA vai monitorar esse sinal automaticamente
    // e marcar como WIN ou LOSS quando os critérios forem atingidos
  };

  // Exemplo 2: Gerar alguns sinais de teste
  const generateTestSignals = () => {
    const testSignals: GeneratedSignal[] = [
      {
        id: `signal-${Date.now()}-1`,
        asset: 'IBOV',
        direction: 'CALL',
        entryPrice: 125000,
        timestamp: Date.now(),
        confidence: 85,
        strategy: 'MACD_CROSSOVER',
      },
      {
        id: `signal-${Date.now()}-2`,
        asset: 'USD',
        direction: 'PUT',
        entryPrice: 5.25,
        timestamp: Date.now(),
        confidence: 72,
        strategy: 'RSI_DIVERGENCE',
      },
      {
        id: `signal-${Date.now()}-3`,
        asset: 'PETR4',
        direction: 'CALL',
        entryPrice: 28.5,
        timestamp: Date.now(),
        confidence: 91,
        strategy: 'BOLINGER_BANDS_BREAKOUT',
      },
    ];

    testSignals.forEach(signal => {
      handleNewSignal(signal);
    });

    console.log(`✅ ${testSignals.length} sinais de teste registrados`);
  };

  // Carregar estatísticas
  const loadStats = () => {
    setStats(getStatistics());
  };

  return (
    <div className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
      <h2 className="text-white font-bold text-lg">Integração: Auto-Analysis de Sinais</h2>

      <p className="text-slate-400 text-sm">
        Este exemplo demonstra como usar o sistema de análise automática. Os sinais são
        registrados e a IA marca automaticamente como WIN/LOSS.
      </p>

      <div className="space-y-2">
        <button
          onClick={generateTestSignals}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          🎯 Gerar 3 Sinais de Teste
        </button>

        <button
          onClick={loadStats}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
        >
          📊 Ver Estatísticas
        </button>
      </div>

      {stats && (
        <div className="bg-slate-800 p-3 rounded border border-slate-600">
          <p className="text-green-300 text-sm">
            ✅ Vitórias: <span className="font-bold">{stats.wins}</span>
          </p>
          <p className="text-red-300 text-sm">
            ❌ Perdas: <span className="font-bold">{stats.losses}</span>
          </p>
          <p className="text-cyan-300 text-sm">
            📈 Taxa: <span className="font-bold">{stats.winRate.toFixed(1)}%</span>
          </p>
          <p className="text-yellow-300 text-sm">
            💰 Lucro Total: <span className="font-bold">{stats.totalProfit.toFixed(2)}</span>
          </p>
        </div>
      )}

      <div className="bg-slate-800/50 p-3 rounded border border-slate-600 text-xs text-slate-400">
        <p className="font-semibold text-slate-300 mb-2">📝 Como usar no seu código:</p>
        <pre className="bg-slate-900 p-2 rounded text-slate-300 overflow-x-auto">
{`// 1. Importar o hook
import { useAutoSignalAnalysis } from '@/hooks/useAutoSignalAnalysis';

// 2. Usar no componente
const { registerSignal, startAutoAnalysis } = useAutoSignalAnalysis();

// 3. Quando criar um novo sinal
const meusSignal = {
  id: 'sinal-123',
  asset: 'IBOV',
  direction: 'CALL',
  entryPrice: 125000,
  timestamp: Date.now(),
  confidence: 85,
  strategy: 'MACD'
};

// 4. Registrar para análise automática
registerSignal(meusSignal);

// 5. A IA vai monitorar e marcar WIN/LOSS!
// Você será notificado via eventos ou callbacks`}
        </pre>
      </div>

      <div className="bg-cyan-900/20 p-3 rounded border border-cyan-800 text-xs text-cyan-300">
        <p className="font-semibold mb-2">🚀 O que acontece automaticamente:</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Sinal é registrado com preço de entrada</li>
          <li>IA monitora preço em tempo real</li>
          <li>Se preço sobe 1.5% (CALL) → <span className="text-green-300">WIN</span></li>
          <li>Se preço cai 1% (CALL) → <span className="text-red-300">LOSS</span></li>
          <li>Se 60 minutos passarem sem atingir meta → <span className="text-yellow-300">TIMEOUT</span></li>
          <li>Estatísticas são atualizadas em tempo real</li>
        </ul>
      </div>
    </div>
  );
};

export default SignalIntegrationExample;
