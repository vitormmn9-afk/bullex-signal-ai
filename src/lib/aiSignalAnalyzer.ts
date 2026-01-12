// Sistema de Análise Automática de Sinais da IA
// A IA marca automaticamente seus sinais como WIN/LOSS baseado em análise técnica

export interface SignalAnalysis {
  signalId: string;
  asset: string;
  direction: 'CALL' | 'PUT';
  entryTime: number;
  entryPrice: number;
  status: 'PENDING' | 'WIN' | 'LOSS' | 'BREAK_EVEN';
  result: 'WIN' | 'LOSS' | null;
  exitPrice?: number;
  exitTime?: number;
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
  private readonly MAX_ANALYSIS_TIME = 3600000; // 60 minutos
  private readonly PROFIT_TARGET = 0.015; // 1.5% para ganho
  private readonly STOP_LOSS = 0.01; // 1% para perda
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
      entryPrice: signal.entryPrice,
      status: 'PENDING',
      result: null,
      confidence: signal.confidence,
    };

    this.activeSignals.set(signal.id, analysis);
    console.log('📊 Sinal registrado para análise:', {
      id: signal.id,
      asset: signal.asset,
      direction: signal.direction,
      entryPrice: signal.entryPrice,
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
    const timeElapsed = currentPrice.timestamp - analysis.entryTime;

    // Se passou o tempo máximo, fecha a posição
    if (timeElapsed > this.MAX_ANALYSIS_TIME) {
      const exitPrice = currentPrice.close;
      const profitLoss = this.calculateProfitLoss(
        analysis.entryPrice,
        exitPrice,
        analysis.direction
      );

      return {
        status: profitLoss > 0 ? 'WIN' : profitLoss < 0 ? 'LOSS' : 'BREAK_EVEN',
        result: profitLoss > 0 ? 'WIN' : 'LOSS',
        exitPrice,
        profitLoss,
        profitLossAmount: this.calculateProfitLossAmount(
          analysis.entryPrice,
          exitPrice,
          analysis.direction
        ),
        reason: `Tempo máximo atingido. Lucro/Perda: ${profitLoss.toFixed(2)}%`,
      };
    }

    // Análise técnica para determinar resultado
    const technicalResult = this.analyzeTechnical(analysis, currentPrice);

    if (technicalResult) {
      return technicalResult;
    }

    // Se ainda não há decisão, continuar analisando
    return null;
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
    const highestHigh = currentPrice.high;
    const lowestLow = currentPrice.low;
    const close = currentPrice.close;

    // Log para debug
    const profitLossPercent = this.calculateProfitLoss(analysis.entryPrice, close, analysis.direction);
    console.log(`🔍 Analisando ${analysis.signalId} (${analysis.direction}):`, {
      entryPrice: analysis.entryPrice.toFixed(2),
      currentClose: close.toFixed(2),
      profitLoss: profitLossPercent.toFixed(2) + '%',
      targetWin: (this.PROFIT_TARGET * 100).toFixed(1) + '%',
      targetLoss: (this.STOP_LOSS * 100).toFixed(1) + '%'
    });

    // Para CALL (aposta em alta)
    if (analysis.direction === 'CALL') {
      // WIN: preço sobe mais que 1.5%
      if (highestHigh >= analysis.entryPrice * (1 + this.PROFIT_TARGET)) {
        const profitLoss = this.calculateProfitLoss(
          analysis.entryPrice,
          analysis.entryPrice * (1 + this.PROFIT_TARGET),
          'CALL'
        );
        return {
          status: 'WIN',
          result: 'WIN',
          exitPrice: analysis.entryPrice * (1 + this.PROFIT_TARGET),
          profitLoss,
          profitLossAmount: profitLoss,
          reason: `Preço subiu ${(this.PROFIT_TARGET * 100).toFixed(1)}% - META ATINGIDA ✓`,
        };
      }

      // LOSS: preço cai 1% ou mantém
      if (lowestLow <= analysis.entryPrice * (1 - this.STOP_LOSS)) {
        const profitLoss = this.calculateProfitLoss(
          analysis.entryPrice,
          analysis.entryPrice * (1 - this.STOP_LOSS),
          'CALL'
        );
        return {
          status: 'LOSS',
          result: 'LOSS',
          exitPrice: analysis.entryPrice * (1 - this.STOP_LOSS),
          profitLoss,
          profitLossAmount: profitLoss,
          reason: `Stop loss acionado - Preço caiu ${(this.STOP_LOSS * 100).toFixed(1)}% ✗`,
        };
      }

      // Análise de velas - se fechar em queda forte em CALL = LOSS
      const priceHistory = this.priceHistory.get(analysis.asset) || [];
      if (priceHistory.length > 5) {
        const recentCandles = priceHistory.slice(-5);
        const closeLower = recentCandles.filter(c => c.close < c.open).length;

        if (closeLower >= 4) {
          // 4 ou mais velas vermelhas = sinal de queda
          const profitLoss = this.calculateProfitLoss(
            analysis.entryPrice,
            close,
            'CALL'
          );
          if (profitLoss < -0.005) {
            return {
              status: 'LOSS',
              result: 'LOSS',
              exitPrice: close,
              profitLoss,
              profitLossAmount: profitLoss,
              reason: `Padrão de 4 velas vermelhas detectado - tendência de queda ✗`,
            };
          }
        }
      }
    }

    // Para PUT (aposta em queda)
    if (analysis.direction === 'PUT') {
      // WIN: preço cai mais que 1.5%
      if (lowestLow <= analysis.entryPrice * (1 - this.PROFIT_TARGET)) {
        const profitLoss = this.calculateProfitLoss(
          analysis.entryPrice,
          analysis.entryPrice * (1 - this.PROFIT_TARGET),
          'PUT'
        );
        return {
          status: 'WIN',
          result: 'WIN',
          exitPrice: analysis.entryPrice * (1 - this.PROFIT_TARGET),
          profitLoss,
          profitLossAmount: profitLoss,
          reason: `Preço caiu ${(this.PROFIT_TARGET * 100).toFixed(1)}% - META ATINGIDA ✓`,
        };
      }

      // LOSS: preço sobe 1% ou mantém
      if (highestHigh >= analysis.entryPrice * (1 + this.STOP_LOSS)) {
        const profitLoss = this.calculateProfitLoss(
          analysis.entryPrice,
          analysis.entryPrice * (1 + this.STOP_LOSS),
          'PUT'
        );
        return {
          status: 'LOSS',
          result: 'LOSS',
          exitPrice: analysis.entryPrice * (1 + this.STOP_LOSS),
          profitLoss,
          profitLossAmount: profitLoss,
          reason: `Stop loss acionado - Preço subiu ${(this.STOP_LOSS * 100).toFixed(1)}% ✗`,
        };
      }

      // Análise de velas - se fechar em alta forte em PUT = LOSS
      const priceHistory = this.priceHistory.get(analysis.asset) || [];
      if (priceHistory.length > 5) {
        const recentCandles = priceHistory.slice(-5);
        const closeHigher = recentCandles.filter(c => c.close > c.open).length;

        if (closeHigher >= 4) {
          // 4 ou mais velas verdes = sinal de alta
          const profitLoss = this.calculateProfitLoss(
            analysis.entryPrice,
            close,
            'PUT'
          );
          if (profitLoss < -0.005) {
            return {
              status: 'LOSS',
              result: 'LOSS',
              exitPrice: close,
              profitLoss,
              profitLossAmount: profitLoss,
              reason: `Padrão de 4 velas verdes detectado - tendência de alta ✗`,
            };
          }
        }
      }
    }

    return null;
  }

  // Calcular lucro/perda em percentual
  private calculateProfitLoss(
    entryPrice: number,
    exitPrice: number,
    direction: 'CALL' | 'PUT'
  ): number {
    if (direction === 'CALL') {
      return ((exitPrice - entryPrice) / entryPrice) * 100;
    } else {
      return ((entryPrice - exitPrice) / entryPrice) * 100;
    }
  }

  // Calcular lucro/perda em valor
  private calculateProfitLossAmount(
    entryPrice: number,
    exitPrice: number,
    direction: 'CALL' | 'PUT'
  ): number {
    if (direction === 'CALL') {
      return exitPrice - entryPrice;
    } else {
      return entryPrice - exitPrice;
    }
  }

  // Iniciar análise periódica (simulada)
  private startAnalysis(): void {
    if (this.analysisInterval) return;

    this.analysisInterval = setInterval(() => {
      // Simular atualização de preços (em produção seria dados reais)
      this.simulatePriceUpdates();
    }, 5000); // A cada 5 segundos
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
