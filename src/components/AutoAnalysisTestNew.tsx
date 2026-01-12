import { useEffect, useState } from 'react';
import { aiSignalAnalyzer } from '@/lib/aiSignalAnalyzer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AutoAnalysisTestNew = () => {
  const [testLog, setTestLog] = useState<string[]>([]);
  const [activeSignals, setActiveSignals] = useState(0);

  const addLog = (msg: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-15));
  };

  useEffect(() => {
    const updateCount = () => {
      setActiveSignals(aiSignalAnalyzer.getActiveSignals().length);
    };
    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, []);

  // Teste WIN: CALL com vela verde
  const testWin = () => {
    const signalId = `test-win-${Date.now()}`;
    const asset = 'EUR/USD';
    const entryPrice = 100;
    const now = Date.now();
    const exitTime = now + 6000; // Vela termina em 6 segundos

    addLog(`🟢 CALL criado - vela verde esperada em 6s`);

    aiSignalAnalyzer.registerSignal({
      id: signalId,
      asset,
      direction: 'CALL',
      entryPrice,
      exitTime,
      confidence: 90,
      timestamp: now,
    });

    // Após 6s, enviar vela VERDE (close > open = WIN)
    setTimeout(() => {
      addLog(`📊 Vela terminou: 100 → 102 (VERDE)`);
      aiSignalAnalyzer.updatePrice({
        asset,
        timestamp: exitTime + 100,
        open: entryPrice,
        high: 102,
        low: 100,
        close: 102, // Fechou acima = verde = WIN
        volume: 1000000,
      });
    }, 6100);
  };

  // Teste LOSS: CALL com vela vermelha
  const testLoss = () => {
    const signalId = `test-loss-${Date.now()}`;
    const asset = 'GBP/USD';
    const entryPrice = 100;
    const now = Date.now();
    const exitTime = now + 6000;

    addLog(`🔴 CALL criado - vela vermelha = LOSS em 6s`);

    aiSignalAnalyzer.registerSignal({
      id: signalId,
      asset,
      direction: 'CALL',
      entryPrice,
      exitTime,
      confidence: 85,
      timestamp: now,
    });

    // Após 6s, enviar vela VERMELHA (close < open = LOSS)
    setTimeout(() => {
      addLog(`📊 Vela terminou: 100 → 98 (VERMELHA)`);
      aiSignalAnalyzer.updatePrice({
        asset,
        timestamp: exitTime + 100,
        open: entryPrice,
        high: 100,
        low: 98,
        close: 98, // Fechou abaixo = vermelha = LOSS
        volume: 1000000,
      });
    }, 6100);
  };

  // Teste PUT WIN: PUT com vela vermelha
  const testPutWin = () => {
    const signalId = `test-put-win-${Date.now()}`;
    const asset = 'USD/JPY';
    const entryPrice = 100;
    const now = Date.now();
    const exitTime = now + 6000;

    addLog(`🟣 PUT criado - vela vermelha esperada em 6s`);

    aiSignalAnalyzer.registerSignal({
      id: signalId,
      asset,
      direction: 'PUT',
      entryPrice,
      exitTime,
      confidence: 92,
      timestamp: now,
    });

    // Após 6s, enviar vela VERMELHA (close < open = WIN para PUT)
    setTimeout(() => {
      addLog(`📊 Vela terminou: 100 → 97 (VERMELHA)`);
      aiSignalAnalyzer.updatePrice({
        asset,
        timestamp: exitTime + 100,
        open: entryPrice,
        high: 100,
        low: 97,
        close: 97, // Fechou abaixo = vermelha = WIN para PUT
        volume: 1000000,
      });
    }, 6100);
  };

  // Listener para eventos
  useEffect(() => {
    const handleWin = (e: any) => {
      const detail = e.detail;
      addLog(`✅ WIN! ${detail.asset} - ${detail.analysisReason}`);
    };

    const handleLoss = (e: any) => {
      const detail = e.detail;
      addLog(`❌ LOSS! ${detail.asset} - ${detail.analysisReason}`);
    };

    window.addEventListener('signal-win', handleWin);
    window.addEventListener('signal-loss', handleLoss);

    return () => {
      window.removeEventListener('signal-win', handleWin);
      window.removeEventListener('signal-loss', handleLoss);
    };
  }, []);

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">🧪 Teste: Análise por COR da Vela</CardTitle>
        <p className="text-sm text-slate-400">
          Sistema espera vela terminar e verifica a cor (verde/vermelha)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={testWin} 
            className="bg-green-900/30 hover:bg-green-900/50 border border-green-700"
          >
            ✅ CALL + Verde = WIN
          </Button>
          <Button 
            onClick={testLoss}
            className="bg-red-900/30 hover:bg-red-900/50 border border-red-700"
          >
            ❌ CALL + Vermelho = LOSS
          </Button>
          <Button 
            onClick={testPutWin}
            className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700"
          >
            ✅ PUT + Vermelho = WIN
          </Button>
        </div>

        <div className="bg-slate-800 p-3 rounded border border-slate-700">
          <p className="text-sm text-slate-300 mb-1">
            <strong>Sinais ativos aguardando:</strong> 
            <span className="text-yellow-400 font-bold ml-2">{activeSignals}</span>
          </p>
          <p className="text-xs text-slate-400">
            (Espera 6 segundos para vela terminar)
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded max-h-80 overflow-y-auto border border-slate-700">
          <p className="text-xs text-slate-400 mb-2 font-semibold">📋 LOG DE EVENTOS:</p>
          {testLog.length === 0 ? (
            <p className="text-xs text-slate-500">Aguardando testes...</p>
          ) : (
            <div className="space-y-1">
              {testLog.map((log, i) => (
                <p key={i} className="text-xs text-slate-300 font-mono">{log}</p>
              ))}
            </div>
          )}
        </div>

        <div className="bg-cyan-900/20 border border-cyan-800 rounded p-3">
          <p className="text-xs text-cyan-300">
            <strong>✅ Regras corretas:</strong><br/>
            • CALL + Vela Verde (close &gt; open) = WIN<br/>
            • CALL + Vela Vermelha (close &lt; open) = LOSS<br/>
            • PUT + Vela Vermelha (close &lt; open) = WIN<br/>
            • PUT + Vela Verde (close &gt; open) = LOSS<br/>
            • Aguarda vela terminar (exitTime) antes de analisar
          </p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800 rounded p-3">
          <p className="text-xs text-yellow-300">
            <strong>🔍 Abra o Console (F12)</strong> para ver logs detalhados:<br/>
            • "🕐 Vela terminou!" mostra quando análise começa<br/>
            • "🎉 WIN!" ou "❌ LOSS!" mostra o resultado
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoAnalysisTestNew;
