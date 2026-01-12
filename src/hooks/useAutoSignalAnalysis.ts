import { useEffect, useCallback } from 'react';
import { aiSignalAnalyzer } from '@/lib/aiSignalAnalyzer';

export interface GeneratedSignal {
  id: string;
  asset: string;
  direction: 'CALL' | 'PUT';
  entryPrice: number;
  timestamp: number;
  confidence: number;
  strategy: string;
}

export const useAutoSignalAnalysis = () => {
  /**
   * Registra um novo sinal para análise automática
   */
  const registerSignal = useCallback((signal: GeneratedSignal) => {
    aiSignalAnalyzer.registerSignal({
      id: signal.id,
      asset: signal.asset,
      direction: signal.direction,
      entryPrice: signal.entryPrice,
      confidence: signal.confidence,
      timestamp: signal.timestamp,
    });

    console.log(`✅ Sinal registrado para análise: ${signal.id}`);
  }, []);

  /**
   * Simula atualização de preço em tempo real
   * Em produção, isso vem de um WebSocket ou API
   */
  const updatePriceSimulated = useCallback(() => {
    // Simular movimento de preço aleatório
    const assets = ['IBOV', 'USD', 'PETR4', 'VALE3', 'BTC', 'MGLU3'];

    assets.forEach(asset => {
      const basePrice = 100 + Math.random() * 50;
      const priceData = {
        asset,
        high: basePrice + Math.random() * 5,
        low: basePrice - Math.random() * 5,
        close: basePrice + (Math.random() - 0.5) * 3,
        open: basePrice,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: Date.now(),
      };

      aiSignalAnalyzer.updatePrice(priceData);
    });
  }, []);

  /**
   * Inicia análise contínua de sinais
   */
  const startAutoAnalysis = useCallback(() => {
    // Atualizar preços a cada 2 segundos (simulado)
    const priceInterval = setInterval(updatePriceSimulated, 2000);

    return () => {
      clearInterval(priceInterval);
      aiSignalAnalyzer.destroy();
    };
  }, [updatePriceSimulated]);

  /**
   * Handlers para eventos de WIN/LOSS
   */
  useEffect(() => {
    const handleWin = (signal: any) => {
      console.log(`🎉 VITÓRIA: ${signal.asset} ${signal.direction} - Lucro: ${signal.profitLoss}%`);

      // Aqui você pode trigger notificações, atualizar UI, etc.
      const event = new CustomEvent('signal-win', { detail: signal });
      window.dispatchEvent(event);
    };

    const handleLoss = (signal: any) => {
      console.log(`❌ PERDA: ${signal.asset} ${signal.direction} - Prejuízo: ${signal.profitLoss}%`);

      // Aqui você pode trigger notificações, atualizar UI, etc.
      const event = new CustomEvent('signal-loss', { detail: signal });
      window.dispatchEvent(event);
    };

    // Registrar callbacks de forma que retornem unsubscribe
    const analyzer = aiSignalAnalyzer as any;
    analyzer.callbacks = {
      onWin: handleWin,
      onLoss: handleLoss,
    };

    return () => {
      analyzer.callbacks = {};
    };
  }, []);

  return {
    registerSignal,
    updatePriceSimulated,
    startAutoAnalysis,
    getAnalyzedSignals: aiSignalAnalyzer.getAnalyzedSignals.bind(aiSignalAnalyzer),
    getActiveSignals: aiSignalAnalyzer.getActiveSignals.bind(aiSignalAnalyzer),
    getStatistics: aiSignalAnalyzer.getStatistics.bind(aiSignalAnalyzer),
  };
};

export default useAutoSignalAnalysis;
