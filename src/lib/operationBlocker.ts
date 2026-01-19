/**
 * 🚫 SISTEMA DE BLOQUEIO DE OPERAÇÕES
 * 
 * Bloqueia operações quando:
 * - Mercado lateral
 * - Vela muito pequena
 * - Vela muito grande  
 * - Notícia econômica próxima
 * - Baixa volatilidade
 */

export interface OperationBlock {
  isBlocked: boolean;
  reasons: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp: number;
}

interface EconomicEvent {
  time: Date;
  currency: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  event: string;
}

export class OperationBlocker {
  private economicCalendar: EconomicEvent[] = [];
  private minCandleSize = 0.015; // 1.5% mínimo (vela muito pequena)
  private maxCandleSize = 3.0; // 3% máximo (vela muito grande)
  private minVolatility = 0.3; // 0.3% ATR mínimo
  private lateralRangeMax = 0.8; // 0.8% range máximo para considerar lateral

  /**
   * Verifica se operação deve ser bloqueada
   */
  checkOperationBlock(
    candles: CandleData[],
    marketStructureType: string
  ): OperationBlock {
    const reasons: string[] = [];
    let severity: OperationBlock['severity'] = 'LOW';

    // 1. Verificar mercado lateral
    if (this.isLateralMarket(candles, marketStructureType)) {
      reasons.push('❌ Mercado lateral - sem direção clara');
      severity = this.upgradeSeverity(severity, 'HIGH');
    }

    // 2. Verificar tamanho de vela
    const candleSizeCheck = this.checkCandleSize(candles);
    if (candleSizeCheck) {
      reasons.push(candleSizeCheck.reason);
      severity = this.upgradeSeverity(severity, candleSizeCheck.severity);
    }

    // 3. Verificar volatilidade
    if (this.hasLowVolatility(candles)) {
      reasons.push('❌ Baixa volatilidade - mercado sem movimento');
      severity = this.upgradeSeverity(severity, 'HIGH');
    }

    // 4. Verificar notícias econômicas
    const newsCheck = this.checkEconomicNews();
    if (newsCheck) {
      reasons.push(newsCheck.reason);
      severity = this.upgradeSeverity(severity, newsCheck.severity);
    }

    // 5. Verificar horário de mercado
    const timeCheck = this.checkMarketTime();
    if (timeCheck) {
      reasons.push(timeCheck.reason);
      severity = this.upgradeSeverity(severity, timeCheck.severity);
    }

    // 6. Verificar consolidação extrema
    if (this.isExtremeConsolidation(candles)) {
      reasons.push('❌ Consolidação extrema - aguardar rompimento');
      severity = this.upgradeSeverity(severity, 'MEDIUM');
    }

    const isBlocked = reasons.length > 0;
    const recommendation = this.generateRecommendation(reasons, severity);

    return {
      isBlocked,
      reasons,
      severity,
      recommendation
    };
  }

  /**
   * Verifica se mercado está lateral
   */
  private isLateralMarket(candles: CandleData[], marketStructureType: string): boolean {
    // Se estrutura de mercado já identificou como lateral
    if (marketStructureType === 'RANGING' || marketStructureType === 'CONSOLIDATION') {
      return true;
    }

    if (candles.length < 15) return false;

    const recentCandles = candles.slice(-15);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const avgPrice = (maxHigh + minLow) / 2;
    
    const rangePercent = ((maxHigh - minLow) / avgPrice) * 100;
    
    // Lateral se range < 0.8%
    return rangePercent < this.lateralRangeMax;
  }

  /**
   * Verifica tamanho das velas
   */
  private checkCandleSize(candles: CandleData[]): { reason: string; severity: OperationBlock['severity'] } | null {
    if (candles.length === 0) return null;

    const lastCandle = candles[candles.length - 1];
    const candleSize = Math.abs(lastCandle.close - lastCandle.open);
    const candleSizePercent = (candleSize / lastCandle.open) * 100;

    // Vela muito pequena
    if (candleSizePercent < this.minCandleSize) {
      return {
        reason: `❌ Vela muito pequena (${candleSizePercent.toFixed(3)}%) - indecisão`,
        severity: 'MEDIUM'
      };
    }

    // Vela muito grande
    if (candleSizePercent > this.maxCandleSize) {
      return {
        reason: `❌ Vela muito grande (${candleSizePercent.toFixed(2)}%) - movimento exagerado`,
        severity: 'HIGH'
      };
    }

    return null;
  }

  /**
   * Verifica baixa volatilidade
   */
  private hasLowVolatility(candles: CandleData[]): boolean {
    if (candles.length < 14) return false;

    const atr = this.calculateATR(candles.slice(-14));
    const avgPrice = candles.slice(-14).reduce((sum, c) => sum + c.close, 0) / 14;
    const atrPercent = (atr / avgPrice) * 100;

    return atrPercent < this.minVolatility;
  }

  /**
   * Verifica notícias econômicas próximas
   */
  private checkEconomicNews(): { reason: string; severity: OperationBlock['severity'] } | null {
    const now = new Date();
    const warningWindow = 30 * 60 * 1000; // 30 minutos antes e depois

    for (const event of this.economicCalendar) {
      const timeDiff = Math.abs(event.time.getTime() - now.getTime());
      
      if (timeDiff <= warningWindow) {
        const minutesUntil = Math.floor(timeDiff / 60000);
        const severity = event.impact === 'HIGH' ? 'CRITICAL' : event.impact === 'MEDIUM' ? 'HIGH' : 'MEDIUM';
        
        return {
          reason: `⚠️ Notícia econômica ${event.impact} em ${minutesUntil}min (${event.event})`,
          severity
        };
      }
    }

    return null;
  }

  /**
   * Verifica horário de mercado
   */
  private checkMarketTime(): { reason: string; severity: OperationBlock['severity'] } | null {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const totalMinutes = hour * 60 + minute;

    // Horários de baixa liquidez (madrugada no fuso GMT)
    // 00:00 - 06:00 UTC (baixa liquidez)
    if (totalMinutes >= 0 && totalMinutes < 360) {
      return {
        reason: '⚠️ Horário de baixa liquidez (madrugada)',
        severity: 'MEDIUM'
      };
    }

    // Abertura de mercado (primeiros 15 minutos)
    // Londres: 08:00 UTC, NY: 13:00 UTC
    const londonOpen = 8 * 60; // 480 minutos
    const nyOpen = 13 * 60; // 780 minutos
    
    if ((totalMinutes >= londonOpen && totalMinutes < londonOpen + 15) ||
        (totalMinutes >= nyOpen && totalMinutes < nyOpen + 15)) {
      return {
        reason: '⚠️ Abertura de mercado - aguardar estabilização',
        severity: 'MEDIUM'
      };
    }

    // Fechamento de mercado (últimos 15 minutos)
    const londonClose = 16 * 60; // 960 minutos
    const nyClose = 21 * 60; // 1260 minutos
    
    if ((totalMinutes >= londonClose - 15 && totalMinutes < londonClose) ||
        (totalMinutes >= nyClose - 15 && totalMinutes < nyClose)) {
      return {
        reason: '⚠️ Fechamento de mercado - baixa liquidez',
        severity: 'MEDIUM'
      };
    }

    return null;
  }

  /**
   * Verifica consolidação extrema
   */
  private isExtremeConsolidation(candles: CandleData[]): boolean {
    if (candles.length < 20) return false;

    const recentCandles = candles.slice(-20);
    
    // Contar quantas velas têm corpo muito pequeno
    let smallBodyCount = 0;
    
    for (const candle of recentCandles) {
      const bodySize = Math.abs(candle.close - candle.open);
      const totalSize = candle.high - candle.low;
      const bodyRatio = bodySize / totalSize;
      
      if (bodyRatio < 0.3) {
        smallBodyCount++;
      }
    }
    
    // Se mais de 60% das velas têm corpo pequeno = consolidação extrema
    return (smallBodyCount / recentCandles.length) > 0.6;
  }

  /**
   * Calcula ATR
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
   * Aumenta severidade se necessário
   */
  private upgradeSeverity(
    current: OperationBlock['severity'],
    newSev: OperationBlock['severity']
  ): OperationBlock['severity'] {
    const levels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    return levels[newSev] > levels[current] ? newSev : current;
  }

  /**
   * Gera recomendação baseada nos bloqueios
   */
  private generateRecommendation(reasons: string[], severity: OperationBlock['severity']): string {
    if (reasons.length === 0) {
      return '✅ Condições favoráveis para operação';
    }

    switch (severity) {
      case 'CRITICAL':
        return '🛑 NÃO OPERE - Condições extremamente desfavoráveis';
      case 'HIGH':
        return '⛔ EVITE OPERAR - Alto risco de perda';
      case 'MEDIUM':
        return '⚠️ CAUTELA - Aguarde condições melhores';
      case 'LOW':
        return '💡 Atenção - Possível operar com cautela redobrada';
      default:
        return 'Aguarde melhores condições';
    }
  }

  /**
   * Adiciona evento econômico ao calendário
   */
  addEconomicEvent(event: EconomicEvent): void {
    this.economicCalendar.push(event);
    
    // Limpar eventos antigos (mais de 2 horas no passado)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    this.economicCalendar = this.economicCalendar.filter(e => e.time > twoHoursAgo);
  }

  /**
   * Limpa calendário econômico
   */
  clearEconomicCalendar(): void {
    this.economicCalendar = [];
  }

  /**
   * Configura limites personalizados
   */
  configure(config: {
    minCandleSize?: number;
    maxCandleSize?: number;
    minVolatility?: number;
    lateralRangeMax?: number;
  }): void {
    if (config.minCandleSize !== undefined) this.minCandleSize = config.minCandleSize;
    if (config.maxCandleSize !== undefined) this.maxCandleSize = config.maxCandleSize;
    if (config.minVolatility !== undefined) this.minVolatility = config.minVolatility;
    if (config.lateralRangeMax !== undefined) this.lateralRangeMax = config.lateralRangeMax;
  }
}

// Instância singleton
export const operationBlocker = new OperationBlocker();
