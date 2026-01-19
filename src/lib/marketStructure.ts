/**
 * 🏗️ SISTEMA DE ESTRUTURA DE MERCADO
 * 
 * Identifica:
 * - Rompimentos reais vs falsos (fakeouts)
 * - Topos e fundos
 * - Consolidações
 * - Impulsos vs correções
 */

export interface MarketStructure {
  type: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'BREAKOUT' | 'FAKEOUT' | 'CONSOLIDATION';
  confidence: number; // 0-100
  swingHigh: number | null;
  swingLow: number | null;
  isImpulse: boolean; // true = impulso, false = correção
  supportLevel: number | null;
  resistanceLevel: number | null;
  consolidationRange: number; // tamanho da consolidação em %
  breakoutConfirmed: boolean;
  fakeoutRisk: number; // 0-100 (quanto maior, maior risco de fakeout)
  details: string;
}

export interface PriceSwing {
  high: number;
  low: number;
  timestamp: number;
  type: 'swing_high' | 'swing_low';
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp: number;
}

export class MarketStructureAnalyzer {
  private swings: PriceSwing[] = [];
  private supportLevels: number[] = [];
  private resistanceLevels: number[] = [];

  /**
   * Analisa a estrutura completa do mercado
   */
  analyzeMarketStructure(candles: CandleData[]): MarketStructure {
    if (candles.length < 20) {
      return this.getDefaultStructure('Dados insuficientes para análise');
    }

    // Identificar swings (topos e fundos)
    this.identifySwings(candles);

    // Calcular suporte e resistência
    const { support, resistance } = this.calculateSupportResistance(candles);

    // Detectar tipo de mercado
    const marketType = this.detectMarketType(candles);

    // Analisar rompimentos
    const breakoutAnalysis = this.analyzeBreakout(candles, support, resistance);

    // Determinar se é impulso ou correção
    const isImpulse = this.isImpulsiveMove(candles);

    // Calcular range de consolidação
    const consolidationRange = this.calculateConsolidationRange(candles);

    // Calcular confiança geral
    const confidence = this.calculateConfidence(
      marketType,
      breakoutAnalysis,
      consolidationRange,
      candles
    );

    return {
      type: marketType,
      confidence,
      swingHigh: this.getLastSwingHigh(),
      swingLow: this.getLastSwingLow(),
      isImpulse,
      supportLevel: support,
      resistanceLevel: resistance,
      consolidationRange,
      breakoutConfirmed: breakoutAnalysis.confirmed,
      fakeoutRisk: breakoutAnalysis.fakeoutRisk,
      details: this.generateDetails(marketType, breakoutAnalysis, isImpulse, consolidationRange)
    };
  }

  /**
   * Identifica topos e fundos (swing highs/lows)
   */
  private identifySwings(candles: CandleData[]): void {
    this.swings = [];
    const lookback = 5; // períodos para cada lado

    for (let i = lookback; i < candles.length - lookback; i++) {
      const current = candles[i];
      
      // Verificar swing high
      let isSwingHigh = true;
      for (let j = i - lookback; j < i + lookback; j++) {
        if (j !== i && candles[j].high >= current.high) {
          isSwingHigh = false;
          break;
        }
      }
      
      if (isSwingHigh) {
        this.swings.push({
          high: current.high,
          low: current.low,
          timestamp: current.timestamp,
          type: 'swing_high'
        });
      }

      // Verificar swing low
      let isSwingLow = true;
      for (let j = i - lookback; j < i + lookback; j++) {
        if (j !== i && candles[j].low <= current.low) {
          isSwingLow = false;
          break;
        }
      }
      
      if (isSwingLow) {
        this.swings.push({
          high: current.high,
          low: current.low,
          timestamp: current.timestamp,
          type: 'swing_low'
        });
      }
    }
  }

  /**
   * Calcula níveis de suporte e resistência
   */
  private calculateSupportResistance(candles: CandleData[]): { support: number; resistance: number } {
    if (candles.length === 0) return { support: 0, resistance: 0 };

    const recentCandles = candles.slice(-20);
    const lows = recentCandles.map(c => c.low);
    const highs = recentCandles.map(c => c.high);

    // Suporte = média dos 3 menores lows
    const sortedLows = [...lows].sort((a, b) => a - b);
    const support = sortedLows.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

    // Resistência = média dos 3 maiores highs
    const sortedHighs = [...highs].sort((a, b) => b - a);
    const resistance = sortedHighs.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

    return { support, resistance };
  }

  /**
   * Detecta o tipo de mercado
   */
  private detectMarketType(candles: CandleData[]): MarketStructure['type'] {
    const recentCandles = candles.slice(-20);
    
    // Analisar tendência geral
    const firstPrice = recentCandles[0].close;
    const lastPrice = recentCandles[recentCandles.length - 1].close;
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Calcular ATR (Average True Range) para medir volatilidade
    const atr = this.calculateATR(recentCandles);
    const avgPrice = recentCandles.reduce((sum, c) => sum + c.close, 0) / recentCandles.length;
    const atrPercent = (atr / avgPrice) * 100;

    // Detectar consolidação (baixa volatilidade)
    if (atrPercent < 0.3 && Math.abs(priceChange) < 1) {
      return 'CONSOLIDATION';
    }

    // Detectar lateral (ranging)
    if (Math.abs(priceChange) < 0.5) {
      return 'RANGING';
    }

    // Detectar rompimento
    const { support, resistance } = this.calculateSupportResistance(candles);
    const currentPrice = lastPrice;
    const range = resistance - support;
    
    if (currentPrice > resistance + (range * 0.02)) {
      // Verificar se é fakeout
      const fakeoutRisk = this.detectFakeout(candles, 'up');
      return fakeoutRisk > 60 ? 'FAKEOUT' : 'BREAKOUT';
    }
    
    if (currentPrice < support - (range * 0.02)) {
      const fakeoutRisk = this.detectFakeout(candles, 'down');
      return fakeoutRisk > 60 ? 'FAKEOUT' : 'BREAKOUT';
    }

    // Detectar tendência
    if (priceChange > 1) return 'TRENDING_UP';
    if (priceChange < -1) return 'TRENDING_DOWN';

    return 'RANGING';
  }

  /**
   * Analisa rompimentos
   */
  private analyzeBreakout(
    candles: CandleData[],
    support: number,
    resistance: number
  ): { confirmed: boolean; fakeoutRisk: number } {
    if (candles.length < 5) {
      return { confirmed: false, fakeoutRisk: 100 };
    }

    const recentCandles = candles.slice(-5);
    const lastCandle = recentCandles[recentCandles.length - 1];
    const range = resistance - support;

    // Verificar rompimento de resistência
    if (lastCandle.close > resistance) {
      const penetration = ((lastCandle.close - resistance) / range) * 100;
      const volumeConfirmation = this.hasVolumeConfirmation(recentCandles);
      const closeAboveHigh = lastCandle.close > lastCandle.high * 0.98; // fechou próximo do topo
      
      const fakeoutRisk = this.detectFakeout(candles, 'up');
      const confirmed = penetration > 2 && volumeConfirmation && closeAboveHigh && fakeoutRisk < 40;
      
      return { confirmed, fakeoutRisk };
    }

    // Verificar rompimento de suporte
    if (lastCandle.close < support) {
      const penetration = ((support - lastCandle.close) / range) * 100;
      const volumeConfirmation = this.hasVolumeConfirmation(recentCandles);
      const closeBelowLow = lastCandle.close < lastCandle.low * 1.02;
      
      const fakeoutRisk = this.detectFakeout(candles, 'down');
      const confirmed = penetration > 2 && volumeConfirmation && closeBelowLow && fakeoutRisk < 40;
      
      return { confirmed, fakeoutRisk };
    }

    return { confirmed: false, fakeoutRisk: 50 };
  }

  /**
   * Detecta risco de falso rompimento (fakeout)
   */
  private detectFakeout(candles: CandleData[], direction: 'up' | 'down'): number {
    let fakeoutRisk = 0;
    const recentCandles = candles.slice(-10);
    
    // 1. Velas com pavio grande = potencial rejeição
    const lastCandle = recentCandles[recentCandles.length - 1];
    const bodySize = Math.abs(lastCandle.close - lastCandle.open);
    const totalSize = lastCandle.high - lastCandle.low;
    const wickRatio = bodySize / totalSize;
    
    if (wickRatio < 0.4) fakeoutRisk += 25; // corpo pequeno vs pavio = indecisão

    // 2. Volume fraco no rompimento
    if (!this.hasVolumeConfirmation(recentCandles)) {
      fakeoutRisk += 30;
    }

    // 3. Rompimento tarde demais (já muito estendido)
    const { support, resistance } = this.calculateSupportResistance(candles);
    const range = resistance - support;
    const distance = direction === 'up' 
      ? ((lastCandle.close - resistance) / range) * 100
      : ((support - lastCandle.close) / range) * 100;
    
    if (distance > 5) fakeoutRisk += 25; // muito distante = sobrecomprado/vendido

    // 4. Falha em manter o rompimento nas últimas velas
    const lastFew = recentCandles.slice(-3);
    const holdingBreakout = direction === 'up'
      ? lastFew.every(c => c.close > resistance)
      : lastFew.every(c => c.close < support);
    
    if (!holdingBreakout) fakeoutRisk += 20;

    return Math.min(fakeoutRisk, 100);
  }

  /**
   * Verifica se há confirmação de volume
   */
  private hasVolumeConfirmation(candles: CandleData[]): boolean {
    if (!candles[0].volume) return true; // sem dados de volume, assumir OK
    
    const volumes = candles.map(c => c.volume || 0);
    const avgVolume = volumes.slice(0, -1).reduce((a, b) => a + b, 0) / (volumes.length - 1);
    const lastVolume = volumes[volumes.length - 1];
    
    return lastVolume > avgVolume * 1.2; // volume 20% acima da média
  }

  /**
   * Determina se é movimento impulsivo ou correção
   */
  private isImpulsiveMove(candles: CandleData[]): boolean {
    if (candles.length < 10) return false;
    
    const recentCandles = candles.slice(-10);
    
    // Calcular velocidade do movimento
    const priceMove = Math.abs(
      recentCandles[recentCandles.length - 1].close - recentCandles[0].close
    );
    const avgPrice = recentCandles.reduce((sum, c) => sum + c.close, 0) / recentCandles.length;
    const velocity = (priceMove / avgPrice) * 100;
    
    // Contar velas consecutivas na mesma direção
    let consecutiveBullish = 0;
    let consecutiveBearish = 0;
    
    for (const candle of recentCandles.slice(-5)) {
      if (candle.close > candle.open) {
        consecutiveBullish++;
        consecutiveBearish = 0;
      } else {
        consecutiveBearish++;
        consecutiveBullish = 0;
      }
    }
    
    const maxConsecutive = Math.max(consecutiveBullish, consecutiveBearish);
    
    // Impulso = alta velocidade + velas consecutivas
    return velocity > 1.5 && maxConsecutive >= 3;
  }

  /**
   * Calcula tamanho da consolidação
   */
  private calculateConsolidationRange(candles: CandleData[]): number {
    if (candles.length === 0) return 0;
    
    const recentCandles = candles.slice(-20);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const avgPrice = (maxHigh + minLow) / 2;
    
    return ((maxHigh - minLow) / avgPrice) * 100;
  }

  /**
   * Calcula ATR (Average True Range)
   */
  private calculateATR(candles: CandleData[], period: number = 14): number {
    if (candles.length < period + 1) return 0;
    
    const trueRanges: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];
      
      const tr = Math.max(
        current.high - current.low,
        Math.abs(current.high - previous.close),
        Math.abs(current.low - previous.close)
      );
      
      trueRanges.push(tr);
    }
    
    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((a, b) => a + b, 0) / recentTR.length;
  }

  /**
   * Calcula confiança geral da análise
   */
  private calculateConfidence(
    type: MarketStructure['type'],
    breakout: { confirmed: boolean; fakeoutRisk: number },
    consolidationRange: number,
    candles: CandleData[]
  ): number {
    let confidence = 50;

    // Ajustar baseado no tipo de mercado
    switch (type) {
      case 'TRENDING_UP':
      case 'TRENDING_DOWN':
        confidence += 20;
        break;
      case 'BREAKOUT':
        confidence += breakout.confirmed ? 25 : 10;
        confidence -= breakout.fakeoutRisk * 0.3;
        break;
      case 'FAKEOUT':
        confidence -= 30;
        break;
      case 'CONSOLIDATION':
        confidence += 10;
        break;
      case 'RANGING':
        confidence += 5;
        break;
    }

    // Penalizar consolidações muito apertadas (difíceis de operar)
    if (consolidationRange < 0.5) {
      confidence -= 20;
    }

    // Bônus para dados abundantes
    if (candles.length > 50) {
      confidence += 10;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private getLastSwingHigh(): number | null {
    const swingHighs = this.swings.filter(s => s.type === 'swing_high');
    return swingHighs.length > 0 ? swingHighs[swingHighs.length - 1].high : null;
  }

  private getLastSwingLow(): number | null {
    const swingLows = this.swings.filter(s => s.type === 'swing_low');
    return swingLows.length > 0 ? swingLows[swingLows.length - 1].low : null;
  }

  private generateDetails(
    type: MarketStructure['type'],
    breakout: { confirmed: boolean; fakeoutRisk: number },
    isImpulse: boolean,
    consolidationRange: number
  ): string {
    const details: string[] = [];

    switch (type) {
      case 'TRENDING_UP':
        details.push('Tendência de alta confirmada');
        break;
      case 'TRENDING_DOWN':
        details.push('Tendência de baixa confirmada');
        break;
      case 'BREAKOUT':
        details.push(breakout.confirmed ? 'Rompimento confirmado' : 'Rompimento não confirmado');
        if (breakout.fakeoutRisk > 30) {
          details.push(`Risco de fakeout: ${breakout.fakeoutRisk.toFixed(0)}%`);
        }
        break;
      case 'FAKEOUT':
        details.push('Alto risco de falso rompimento');
        break;
      case 'CONSOLIDATION':
        details.push(`Consolidação (range: ${consolidationRange.toFixed(2)}%)`);
        break;
      case 'RANGING':
        details.push('Mercado lateral');
        break;
    }

    details.push(isImpulse ? 'Movimento impulsivo' : 'Movimento corretivo');

    return details.join(' | ');
  }

  private getDefaultStructure(reason: string): MarketStructure {
    return {
      type: 'RANGING',
      confidence: 0,
      swingHigh: null,
      swingLow: null,
      isImpulse: false,
      supportLevel: null,
      resistanceLevel: null,
      consolidationRange: 0,
      breakoutConfirmed: false,
      fakeoutRisk: 100,
      details: reason
    };
  }
}

// Instância singleton
export const marketStructureAnalyzer = new MarketStructureAnalyzer();
