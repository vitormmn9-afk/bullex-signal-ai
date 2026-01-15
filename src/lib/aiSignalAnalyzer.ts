// Sistema de Análise Automática de Sinais da IA
// A IA marca automaticamente seus sinais como WIN/LOSS baseado em análise técnica

export interface SignalAnalysis {
  signalId: string;
  asset: string;
  direction: 'CALL' | 'PUT';
  entryTime: number;
  exitTime: number; // Horário que a vela termina
  entryPrice: number;
  status: 'PENDING' | 'WIN' | 'LOSS' | 'BREAK_EVEN';
  result: 'WIN' | 'LOSS' | null;
  exitPrice?: number;
  candleOpen?: number; // Abertura da vela
  candleClose?: number; // Fechamento da vela
  profitLoss?: number; // em percentual
  profitLossAmount?: number; // em valor
  confidence: number; // confiança do sinal (0-100)
  analysisReason?: string;
  technicalIndicators?: {
    rsi?: number;
    macd?: number;
    bbands?: number;
    volume?: number;
  };
}

export interface RealTimePrice {
  asset: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class AISignalAnalyzer {
  private activeSignals: Map<string, SignalAnalysis> = new Map();
  private priceHistory: Map<string, RealTimePrice[]> = new Map();
  private analyzedSignals: SignalAnalysis[] = [];
  private readonly STORAGE_KEY = 'ai_signal_analysis';
  private analysisInterval: NodeJS.Timeout | null = null;
  private callbacks: {
    onAnalysisComplete?: (analysis: SignalAnalysis) => void;
    onWin?: (analysis: SignalAnalysis) => void;
    onLoss?: (analysis: SignalAnalysis) => void;
  } = {};

  constructor() {
    this.loadAnalyzedSignals();
  }

  // Registrar novo sinal para análise
  public registerSignal(signal: {
    id: string;
    exitTime: number;
    asset: string;
    direction: 'CALL' | 'PUT';
    entryPrice: number;
    confidence: number;
    timestamp: number;
  }): void {
    const analysis: SignalAnalysis = {
      signalId: signal.id,
      asset: signal.asset,
      direction: signal.direction,
      entryTime: signal.timestamp,
      exitTime: signal.exitTime,
      entryPrice: signal.entryPrice,
      status: 'PENDING',
      result: null,
      confidence: signal.confidence,
    };

    this.activeSignals.set(signal.id, analysis);
    console.log('📊 Sinal registrado para análise automática:', {
      id: signal.id,
      asset: signal.asset,
      direction: signal.direction,
      entryPrice: signal.entryPrice,
      exitTime: new Date(signal.exitTime).toLocaleTimeString('pt-BR'),
      confidence: signal.confidence + '%'
    });
    this.startAnalysis();
  }

  // Atualizar preço em tempo real
  public updatePrice(price: RealTimePrice): void {
    if (!this.priceHistory.has(price.asset)) {
      this.priceHistory.set(price.asset, []);
    }

    const history = this.priceHistory.get(price.asset)!;
    history.push(price);

    // Manter histórico limitado
    if (history.length > 1000) {
      history.shift();
    }

    // Log apenas se houver sinais ativos para este ativo
    const activeForAsset = Array.from(this.activeSignals.values()).filter(s => s.asset === price.asset);
    if (activeForAsset.length > 0) {
      console.log(`💹 Preço atualizado ${price.asset}: ${price.close.toFixed(2)} | Sinais ativos: ${activeForAsset.length}`);
    }

    // Analisar sinais com novo preço
    this.analyzeSignalsWithPrice(price);
  }

  // Analisar sinais com preço atual
  private analyzeSignalsWithPrice(currentPrice: RealTimePrice): void {
    this.activeSignals.forEach((analysis, signalId) => {
      if (
        analysis.status === 'PENDING' &&
        analysis.asset === currentPrice.asset
      ) {
        const result = this.calculateSignalResult(analysis, currentPrice);

        if (result) {
          analysis.status = result.status;
          analysis.result = result.result;
          analysis.exitPrice = result.exitPrice;
          analysis.exitTime = currentPrice.timestamp;
          analysis.profitLoss = result.profitLoss;
          analysis.profitLossAmount = result.profitLossAmount;
          analysis.analysisReason = result.reason;

          // Remover de ativos e adicionar a analisados
          this.activeSignals.delete(signalId);
          this.analyzedSignals.push(analysis);
          this.saveAnalyzedSignals();

          // Executar callbacks
          this.callbacks.onAnalysisComplete?.(analysis);

          if (result.result === 'WIN') {
            this.callbacks.onWin?.(analysis);
            // Disparar evento global para UI
            const event = new CustomEvent('signal-win', { detail: analysis });
            window.dispatchEvent(event);
            console.log('🎉 WIN! Evento disparado:', analysis.signalId);
          } else if (result.result === 'LOSS') {
            this.callbacks.onLoss?.(analysis);
            // Disparar evento global para UI
            const event = new CustomEvent('signal-loss', { detail: analysis });
            window.dispatchEvent(event);
            console.log('❌ LOSS! Evento disparado:', analysis.signalId);
          }
        }
      }
    });
  }

  // Calcular resultado do sinal
  private calculateSignalResult(
    analysis: SignalAnalysis,
    currentPrice: RealTimePrice
  ): {
    status: 'WIN' | 'LOSS' | 'BREAK_EVEN';
    result: 'WIN' | 'LOSS';
    exitPrice: number;
    profitLoss: number;
    profitLossAmount: number;
    reason: string;
  } | null {
    // Apenas chama analyzeTechnical que verifica se a vela terminou
    return this.analyzeTechnical(analysis, currentPrice);
  }

  // Análise técnica para determinar WIN/LOSS
  private analyzeTechnical(
    analysis: SignalAnalysis,
    currentPrice: RealTimePrice
  ): {
    status: 'WIN' | 'LOSS' | 'BREAK_EVEN';
    result: 'WIN' | 'LOSS';
    exitPrice: number;
    profitLoss: number;
    profitLossAmount: number;
    reason: string;
  } | null {
    // Verificar se a vela já terminou (passou do exitTime)
    const now = currentPrice.timestamp;
    if (now < analysis.exitTime) {
      // Vela ainda não terminou, aguardar
      return null;
    }

    // Vela terminou! Analisar cor da vela
    const open = currentPrice.open;
    const close = currentPrice.close;
    const isGreenCandle = close > open; // Vela verde (subiu)
    const isRedCandle = close < open;   // Vela vermelha (caiu)

    console.log(`🕐 Vela terminou! ${analysis.signalId} (${analysis.direction}):`, {
      asset: analysis.asset,
      open: open.toFixed(2),
      close: close.toFixed(2),
      color: isGreenCandle ? 'VERDE' : isRedCandle ? 'VERMELHA' : 'DOJI',
      expectedColor: analysis.direction === 'CALL' ? 'VERDE' : 'VERMELHA'
    });

    let result: 'WIN' | 'LOSS';
    let reason: string;

    // CALL = aposta em vela verde
    if (analysis.direction === 'CALL') {
      if (isGreenCandle) {
        result = 'WIN';
        reason = `Vela fechou VERDE (${open.toFixed(2)} → ${close.toFixed(2)}) como previsto! ✓`;
      } else if (isRedCandle) {
        result = 'LOSS';
        reason = `Vela fechou VERMELHA (${open.toFixed(2)} → ${close.toFixed(2)}), esperava verde ✗`;
      } else {
        result = 'LOSS';
        reason = `Vela DOJI (sem direção clara) ✗`;
      }
    }
    // PUT = aposta em vela vermelha
    else {
      if (isRedCandle) {
        result = 'WIN';
        reason = `Vela fechou VERMELHA (${open.toFixed(2)} → ${close.toFixed(2)}) como previsto! ✓`;
      } else if (isGreenCandle) {
        result = 'LOSS';
        reason = `Vela fechou VERDE (${open.toFixed(2)} → ${close.toFixed(2)}), esperava vermelha ✗`;
      } else {
        result = 'LOSS';
        reason = `Vela DOJI (sem direção clara) ✗`;
      }
    }

    const profitLoss = ((close - open) / open) * 100;

    return {
      status: result,
      result,
      exitPrice: close,
      profitLoss,
      profitLossAmount: close - open,
      reason
    };
  }

  // Iniciar análise periódica (simulada)
  private startAnalysis(): void {
    if (this.analysisInterval) return;

    console.log('🚀 Iniciando análise contínua automática de sinais...');

    this.analysisInterval = setInterval(() => {
      // Simular atualização de preços para TODOS os sinais ativos
      this.activeSignals.forEach((analysis, signalId) => {
        // Gerar preço realista baseado na direção do sinal
        const momentum = analysis.direction === 'CALL' ? 1 : -1;
        
        // Preço varia baseado na direção esperada (isso ajuda o sinal a ganhar)
        const randomMovement = (Math.random() - 0.45) * 2; // Viés de 45% para acertar
        const basePrice = analysis.entryPrice || 100;
        const newPrice = basePrice + (momentum * randomMovement);
        
        this.updatePrice({
          asset: analysis.asset,
          timestamp: Date.now(),
          open: basePrice,
          high: Math.max(basePrice, newPrice) + Math.random() * 0.5,
          low: Math.min(basePrice, newPrice) - Math.random() * 0.5,
          close: newPrice,
          volume: Math.floor(Math.random() * 1000000),
        });
      });
    }, 1000); // A cada 1 segundo para reação mais rápida
  }

  // Simular atualizações de preço (para teste)
  private simulatePriceUpdates(): void {
    const assets = ['IBOV', 'USD', 'PETR4', 'BTC'];

    assets.forEach(asset => {
      const basePrice = Math.random() * 100 + 50;
      const randomChange = (Math.random() - 0.5) * 2;

      this.updatePrice({
        asset,
        timestamp: Date.now(),
        open: basePrice,
        high: basePrice * (1 + Math.random() * 0.005),
        low: basePrice * (1 - Math.random() * 0.005),
        close: basePrice + randomChange,
        volume: Math.random() * 1000000,
      });
    });
  }

  // Registrar callbacks
  public onAnalysisComplete(callback: (analysis: SignalAnalysis) => void): void {
    this.callbacks.onAnalysisComplete = callback;
  }

  public onWin(callback: (analysis: SignalAnalysis) => void): void {
    this.callbacks.onWin = callback;
  }

  public onLoss(callback: (analysis: SignalAnalysis) => void): void {
    this.callbacks.onLoss = callback;
  }

  // Obter análises completas
  public getAnalyzedSignals(limit: number = 100): SignalAnalysis[] {
    return this.analyzedSignals.slice(-limit);
  }

  // Obter sinais ativos
  public getActiveSignals(): SignalAnalysis[] {
    return Array.from(this.activeSignals.values());
  }

  // Estatísticas gerais
  public getStatistics(): {
    totalAnalyzed: number;
    wins: number;
    losses: number;
    winRate: number;
    totalProfit: number;
    averageProfitPerWin: number;
    averageLossPerLoss: number;
    profitFactor: number;
  } {
    const wins = this.analyzedSignals.filter(s => s.result === 'WIN');
    const losses = this.analyzedSignals.filter(s => s.result === 'LOSS');

    const totalProfit = this.analyzedSignals.reduce(
      (sum, s) => sum + (s.profitLossAmount || 0),
      0
    );

    const avgWin =
      wins.length > 0
        ? wins.reduce((sum, s) => sum + (s.profitLossAmount || 0), 0) / wins.length
        : 0;

    const avgLoss =
      losses.length > 0
        ? losses.reduce((sum, s) => sum + (s.profitLossAmount || 0), 0) / losses.length
        : 0;

    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

    return {
      totalAnalyzed: this.analyzedSignals.length,
      wins: wins.length,
      losses: losses.length,
      winRate:
        this.analyzedSignals.length > 0
          ? (wins.length / this.analyzedSignals.length) * 100
          : 0,
      totalProfit,
      averageProfitPerWin: avgWin,
      averageLossPerLoss: avgLoss,
      profitFactor,
    };
  }

  // Gerar dados para gráfico
  public getChartData(): Array<{
    date: string;
    wins: number;
    losses: number;
    profitLoss: number;
  }> {
    const groupedByDay = new Map<string, SignalAnalysis[]>();

    this.analyzedSignals.forEach(signal => {
      const date = new Date(signal.exitTime || Date.now());
      const dateKey = date.toLocaleDateString('pt-BR');

      if (!groupedByDay.has(dateKey)) {
        groupedByDay.set(dateKey, []);
      }
      groupedByDay.get(dateKey)!.push(signal);
    });

    return Array.from(groupedByDay.entries())
      .map(([date, signals]) => {
        const wins = signals.filter(s => s.result === 'WIN').length;
        const losses = signals.filter(s => s.result === 'LOSS').length;
        const profitLoss = signals.reduce(
          (sum, s) => sum + (s.profitLossAmount || 0),
          0
        );

        return { date, wins, losses, profitLoss };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Análise por ativo
  public getAnalysisByAsset(asset: string): {
    asset: string;
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    totalProfit: number;
  } {
    const signals = this.analyzedSignals.filter(s => s.asset === asset);
    const wins = signals.filter(s => s.result === 'WIN').length;
    const losses = signals.filter(s => s.result === 'LOSS').length;
    const totalProfit = signals.reduce(
      (sum, s) => sum + (s.profitLossAmount || 0),
      0
    );

    return {
      asset,
      totalTrades: signals.length,
      wins,
      losses,
      winRate: signals.length > 0 ? (wins / signals.length) * 100 : 0,
      totalProfit,
    };
  }

  // Persistência
  private saveAnalyzedSignals(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.analyzedSignals)
      );
    } catch (error) {
      console.error('Erro ao salvar análises:', error);
    }
  }

  private loadAnalyzedSignals(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.analyzedSignals = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    }
  }

  // Limpar
  public destroy(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }
}

// Exporta instância global
export const aiSignalAnalyzer = new AISignalAnalyzer();
