import { useEffect, useState } from 'react';
import { aiSignalAnalyzer } from '@/lib/aiSignalAnalyzer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Componente de teste para verificar se a marcação WIN/LOSS funciona
 * Cria sinais de teste e força WIN/LOSS rapidamente
 */
export const AutoAnalysisTest = () => {
  const [testLog, setTestLog] = useState<string[]>([]);
  const [activeSignals, setActiveSignals] = useState(0);

  const addLog = (msg: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-10));
  };

  useEffect(() => {
    const updateCount = () => {
      setActiveSignals(aiSignalAnalyzer.getActiveSignals().length);
    };

    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, []);

  // Teste 1: Criar sinal e forçar WIN
  const testForceWin = () => {
    const signalId = `test-win-${Date.now()}`;
    const asset = 'EUR/USD';
    const entryPrice = 100;

    addLog(`Criando sinal CALL em ${asset} @ ${entryPrice}`);

    // Registrar sinal
    aiSignalAnalyzer.registerSignal({
      id: signalId,
      asset,
      direction: 'CALL',
      entryPrice,
      confidence: 90,
      timestamp: Date.now(),
    });

    addLog(`Sinal ${signalId} registrado`);

    // Simular preço subindo 2% (deve dar WIN)
    setTimeout(() => {
      addLog(`Enviando preço +2% para forçar WIN...`);
      aiSignalAnalyzer.updatePrice({
        asset,
        timestamp: Date.now(),
        open: entryPrice,
        high: entryPrice * 1.02, // +2%
        low: entryPrice,
        close: entryPrice * 1.02,
        volume: 1000000,
      });
    }, 2000);
  };

  // Teste 2: Criar sinal e forçar LOSS
  const testForceLoss = () => {
    const signalId = `test-loss-${Date.now()}`;
    const asset = 'GBP/USD';
    const entryPrice = 100;

    addLog(`Criando sinal CALL em ${asset} @ ${entryPrice}`);

    // Registrar sinal
    aiSignalAnalyzer.registerSignal({
      id: signalId,
      asset,
      direction: 'CALL',
      entryPrice,
      confidence: 85,
      timestamp: Date.now(),
    });

    addLog(`Sinal ${signalId} registrado`);

    // Simular preço caindo 1.5% (deve dar LOSS)
    setTimeout(() => {
      addLog(`Enviando preço -1.5% para forçar LOSS...`);
      aiSignalAnalyzer.updatePrice({
        asset,
        timestamp: Date.now(),
        open: entryPrice,
        high: entryPrice,
        low: entryPrice * 0.985, // -1.5%
        close: entryPrice * 0.985,
        volume: 1000000,
      });
    }, 2000);
  };

  // Teste 3: Múltiplos sinais com preços variados
  const testMultiple = () => {
    const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
    
    assets.forEach((asset, index) => {
      const signalId = `test-multi-${Date.now()}-${index}`;
      const entryPrice = 100;
      const direction = index % 2 === 0 ? 'CALL' : 'PUT';

      addLog(`Criando ${direction} em ${asset}`);

      aiSignalAnalyzer.registerSignal({
        id: signalId,
        asset,
        direction,
        entryPrice,
        confidence: 88,
        timestamp: Date.now(),
      });

      // Enviar preços variados após 3 segundos
      setTimeout(() => {
        const change = Math.random() > 0.5 ? 1.02 : 0.98; // +2% ou -2%
        addLog(`Preço ${asset}: ${change > 1 ? '+' : ''}${((change - 1) * 100).toFixed(1)}%`);
        
        aiSignalAnalyzer.updatePrice({
          asset,
          timestamp: Date.now(),
          open: entryPrice,
          high: entryPrice * (change > 1 ? change : 1),
          low: entryPrice * (change < 1 ? change : 1),
          close: entryPrice * change,
          volume: 1000000,
        });
      }, 3000 + (index * 1000));
    });
  };

  // Listener para eventos
  useEffect(() => {
    const handleWin = (e: any) => {
      const detail = e.detail;
      addLog(`✅ WIN detectado! ${detail.asset} - ${detail.profitLoss?.toFixed(2)}%`);
    };

    const handleLoss = (e: any) => {
      const detail = e.detail;
      addLog(`❌ LOSS detectado! ${detail.asset} - ${detail.profitLoss?.toFixed(2)}%`);
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
        <CardTitle className="text-white">🧪 Teste de Auto-Análise WIN/LOSS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testForceWin} variant="outline" className="bg-green-900/20 hover:bg-green-900/40">
            ✅ Testar WIN
          </Button>
          <Button onClick={testForceLoss} variant="outline" className="bg-red-900/20 hover:bg-red-900/40">
            ❌ Testar LOSS
          </Button>
          <Button onClick={testMultiple} variant="outline" className="bg-blue-900/20 hover:bg-blue-900/40">
            🔄 Múltiplos
          </Button>
        </div>

        <div className="bg-slate-800 p-3 rounded">
          <p className="text-sm text-slate-400 mb-2">Sinais ativos: <span className="text-white font-bold">{activeSignals}</span></p>
        </div>

        <div className="bg-slate-950 p-3 rounded max-h-64 overflow-y-auto">
          <p className="text-xs text-slate-400 mb-2 font-semibold">LOG DE TESTES:</p>
          {testLog.length === 0 ? (
            <p className="text-xs text-slate-500">Clique nos botões acima para testar...</p>
          ) : (
            <div className="space-y-1">
              {testLog.map((log, i) => (
                <p key={i} className="text-xs text-slate-300 font-mono">{log}</p>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800 rounded p-3">
          <p className="text-xs text-yellow-300">
            <strong>Como funciona:</strong><br/>
            1. Clique em um botão de teste<br/>
            2. Sinal é criado com preço de entrada<br/>
            3. Após 2-3s, preço simulado é enviado<br/>
            4. Sistema detecta WIN/LOSS automaticamente<br/>
            5. Evento é disparado e aparece no log
          </p>
        </div>

        <div className="bg-cyan-900/20 border border-cyan-800 rounded p-3">
          <p className="text-xs text-cyan-300">
            <strong>Abra o Console do navegador (F12)</strong> para ver logs detalhados da análise
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoAnalysisTest;
