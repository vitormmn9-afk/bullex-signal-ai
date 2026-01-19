/**
 * ✅ SISTEMA DE VALIDAÇÃO DE MÚLTIPLOS SINAIS
 * 
 * Nunca entra com apenas 1 sinal.
 * 
 * Mínimo aceitável (5 sinais):
 * ✅ Tendência M5
 * ✅ Rompimento ou pullback
 * ✅ Volume acima da média
 * ✅ Rejeição de preço
 * ✅ Candle favorável
 */

export interface MultiSignalValidation {
  isValid: boolean;
  score: number; // 0-100
  signals: SignalCheck[];
  missingSignals: string[];
  recommendation: string;
}

export interface SignalCheck {
  name: string;
  present: boolean;
  strength: number; // 0-100
  description: string;
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp: number;
}

interface MarketAnalysis {
  rsi: number;
  macd: number;
  bbands: number;
  trendStrength: number;
  candlePattern: {
    name: string;
    strength: number;
    direction: 'CALL' | 'PUT' | 'NEUTRAL';
  };
}

export class MultiSignalValidator {
  private readonly MIN_SIGNALS_REQUIRED = 5;
  private readonly MIN_SCORE_REQUIRED = 70; // 70% de confiança mínima

  /**
   * Valida se há sinais suficientes para operar
   */
  validateSignals(
    candles: CandleData[],
    analysis: MarketAnalysis,
    marketStructure: any,
    direction: 'CALL' | 'PUT'
  ): MultiSignalValidation {
    const signals: SignalCheck[] = [];

    // 1. ✅ Tendência M5
    const trendSignal = this.checkTrend(candles, analysis, direction);
    signals.push(trendSignal);

    // 2. ✅ Rompimento ou Pullback
    const breakoutSignal = this.checkBreakoutOrPullback(candles, marketStructure, direction);
    signals.push(breakoutSignal);

    // 3. ✅ Volume acima da média
    const volumeSignal = this.checkVolume(candles);
    signals.push(volumeSignal);

    // 4. ✅ Rejeição de preço
    const rejectionSignal = this.checkPriceRejection(candles, direction);
    signals.push(rejectionSignal);

    // 5. ✅ Candle favorável
    const candleSignal = this.checkFavorableCandle(candles, analysis, direction);
    signals.push(candleSignal);

    // SINAIS EXTRAS (bônus)
    // 6. RSI confirmação
    const rsiSignal = this.checkRSI(analysis.rsi, direction);
    signals.push(rsiSignal);

    // 7. MACD confirmação
    const macdSignal = this.checkMACD(analysis.macd, direction);
    signals.push(macdSignal);

    // 8. Bollinger Bands
    const bbandsSignal = this.checkBollingerBands(analysis.bbands, direction);
    signals.push(bbandsSignal);

    // Calcular score
    const presentSignals = signals.filter(s => s.present);
    const score = this.calculateScore(signals);

    // Verificar se atende aos requisitos mínimos
    const requiredSignalsPresent = presentSignals.length >= this.MIN_SIGNALS_REQUIRED;
    const scoreAcceptable = score >= this.MIN_SCORE_REQUIRED;
    const isValid = requiredSignalsPresent && scoreAcceptable;

    // Identificar sinais faltando
    const missingSignals = signals
      .filter(s => !s.present)
      .map(s => s.name);

    const recommendation = this.generateRecommendation(
      isValid,
      presentSignals.length,
      score,
      missingSignals
    );

    return {
      isValid,
      score,
      signals,
      missingSignals,
      recommendation
    };
  }

  /**
   * 1. Verifica tendência M5
   */
  private checkTrend(
    candles: CandleData[],
    analysis: MarketAnalysis,
    direction: 'CALL' | 'PUT'
  ): SignalCheck {
    if (candles.length < 10) {
      return {
        name: 'Tendência M5',
        present: false,
        strength: 0,
        description: 'Dados insuficientes'
      };
    }

    const trendStrength = analysis.trendStrength;
    const recentCandles = candles.slice(-10);
    
    // Contar velas a favor da tendência
    let bullishCandles = 0;
    let bearishCandles = 0;
    
    for (const candle of recentCandles) {
      if (candle.close > candle.open) bullishCandles++;
      else if (candle.close < candle.open) bearishCandles++;
    }
    
    const isTrendingUp = bullishCandles >= 6 && trendStrength > 50;
    const isTrendingDown = bearishCandles >= 6 && trendStrength > 50;
    
    const present = direction === 'CALL' ? isTrendingUp : isTrendingDown;
    const strength = present ? trendStrength : 0;

    return {
      name: 'Tendência M5',
      present,
      strength,
      description: present 
        ? `Tendência ${direction === 'CALL' ? 'alta' : 'baixa'} confirmada (${strength.toFixed(0)}%)`
        : 'Sem tendência clara'
    };
  }

  /**
   * 2. Verifica rompimento ou pullback
   */
  private checkBreakoutOrPullback(
    candles: CandleData[],
    marketStructure: any,
    direction: 'CALL' | 'PUT'
  ): SignalCheck {
    if (!marketStructure) {
      return {
        name: 'Rompimento/Pullback',
        present: false,
        strength: 0,
        description: 'Estrutura de mercado não disponível'
      };
    }

    // Verificar rompimento
    const hasBreakout = marketStructure.type === 'BREAKOUT' && 
                       marketStructure.breakoutConfirmed &&
                       marketStructure.fakeoutRisk < 40;

    // Verificar pullback
    const hasPullback = this.detectPullback(candles, marketStructure, direction);

    const present = hasBreakout || hasPullback;
    const strength = hasBreakout ? 85 : (hasPullback ? 70 : 0);

    return {
      name: 'Rompimento/Pullback',
      present,
      strength,
      description: hasBreakout 
        ? 'Rompimento confirmado' 
        : hasPullback 
          ? 'Pullback identificado' 
          : 'Sem setup de entrada'
    };
  }

  /**
   * Detecta pullback
   */
  private detectPullback(
    candles: CandleData[],
    marketStructure: any,
    direction: 'CALL' | 'PUT'
  ): boolean {
    if (candles.length < 10) return false;

    const recentCandles = candles.slice(-10);
    const lastCandle = recentCandles[recentCandles.length - 1];
    
    // Para CALL: preço puxou de volta ao suporte
    if (direction === 'CALL' && marketStructure.supportLevel) {
      const distance = Math.abs(lastCandle.close - marketStructure.supportLevel);
      const range = marketStructure.resistanceLevel - marketStructure.supportLevel;
      return distance / range < 0.15; // dentro de 15% do suporte
    }
    
    // Para PUT: preço puxou de volta à resistência
    if (direction === 'PUT' && marketStructure.resistanceLevel) {
      const distance = Math.abs(lastCandle.close - marketStructure.resistanceLevel);
      const range = marketStructure.resistanceLevel - marketStructure.supportLevel;
      return distance / range < 0.15; // dentro de 15% da resistência
    }

    return false;
  }

  /**
   * 3. Verifica volume acima da média
   */
  private checkVolume(candles: CandleData[]): SignalCheck {
    if (candles.length < 20 || !candles[0].volume) {
      return {
        name: 'Volume Elevado',
        present: true, // assumir OK se não tiver dados
        strength: 50,
        description: 'Volume não disponível (assumido OK)'
      };
    }

    const recentCandles = candles.slice(-20);
    const volumes = recentCandles.map(c => c.volume || 0);
    const avgVolume = volumes.slice(0, -1).reduce((a, b) => a + b, 0) / (volumes.length - 1);
    const lastVolume = volumes[volumes.length - 1];
    
    const volumeRatio = lastVolume / avgVolume;
    const present = volumeRatio > 1.2; // 20% acima da média
    const strength = Math.min(100, volumeRatio * 50);

    return {
      name: 'Volume Elevado',
      present,
      strength,
      description: present
        ? `Volume ${((volumeRatio - 1) * 100).toFixed(0)}% acima da média`
        : 'Volume abaixo da média'
    };
  }

  /**
   * 4. Verifica rejeição de preço
   */
  private checkPriceRejection(candles: CandleData[], direction: 'CALL' | 'PUT'): SignalCheck {
    if (candles.length < 3) {
      return {
        name: 'Rejeição de Preço',
        present: false,
        strength: 0,
        description: 'Dados insuficientes'
      };
    }

    const recentCandles = candles.slice(-3);
    const lastCandle = recentCandles[recentCandles.length - 1];
    
    const bodySize = Math.abs(lastCandle.close - lastCandle.open);
    const totalSize = lastCandle.high - lastCandle.low;
    const upperWick = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
    const lowerWick = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;
    
    // Para CALL: rejeição de baixa (pavio inferior grande)
    if (direction === 'CALL') {
      const rejectionStrength = (lowerWick / totalSize) * 100;
      const present = lowerWick > bodySize * 1.5 && rejectionStrength > 50;
      
      return {
        name: 'Rejeição de Preço',
        present,
        strength: present ? rejectionStrength : 0,
        description: present ? 'Rejeição de baixa confirmada' : 'Sem rejeição clara'
      };
    }
    
    // Para PUT: rejeição de alta (pavio superior grande)
    if (direction === 'PUT') {
      const rejectionStrength = (upperWick / totalSize) * 100;
      const present = upperWick > bodySize * 1.5 && rejectionStrength > 50;
      
      return {
        name: 'Rejeição de Preço',
        present,
        strength: present ? rejectionStrength : 0,
        description: present ? 'Rejeição de alta confirmada' : 'Sem rejeição clara'
      };
    }

    return {
      name: 'Rejeição de Preço',
      present: false,
      strength: 0,
      description: 'Direção inválida'
    };
  }

  /**
   * 5. Verifica candle favorável
   */
  private checkFavorableCandle(
    candles: CandleData[],
    analysis: MarketAnalysis,
    direction: 'CALL' | 'PUT'
  ): SignalCheck {
    if (candles.length === 0) {
      return {
        name: 'Candle Favorável',
        present: false,
        strength: 0,
        description: 'Sem dados de candle'
      };
    }

    const lastCandle = candles[candles.length - 1];
    const patternStrength = analysis.candlePattern.strength * 100;
    const patternDirection = analysis.candlePattern.direction;
    
    // Verificar se padrão de candle confirma a direção
    const directionMatch = patternDirection === direction;
    
    // Verificar força do corpo
    const bodySize = Math.abs(lastCandle.close - lastCandle.open);
    const totalSize = lastCandle.high - lastCandle.low;
    const bodyRatio = bodySize / totalSize;
    
    // Candle favorável = padrão forte + direção correta + corpo definido
    const present = directionMatch && patternStrength > 60 && bodyRatio > 0.5;
    const strength = present ? (patternStrength + bodyRatio * 50) / 2 : 0;

    return {
      name: 'Candle Favorável',
      present,
      strength,
      description: present
        ? `Padrão ${analysis.candlePattern.name} (${patternStrength.toFixed(0)}%)`
        : 'Candle não favorável'
    };
  }

  /**
   * 6. Verifica RSI
   */
  private checkRSI(rsi: number, direction: 'CALL' | 'PUT'): SignalCheck {
    let present = false;
    let strength = 0;
    let description = '';

    if (direction === 'CALL') {
      // Para CALL: RSI < 40 (oversold) ou em zona de recuperação (40-50)
      if (rsi < 30) {
        present = true;
        strength = 90;
        description = `RSI oversold (${rsi.toFixed(1)}) - forte sinal de compra`;
      } else if (rsi < 45) {
        present = true;
        strength = 70;
        description = `RSI em recuperação (${rsi.toFixed(1)})`;
      } else {
        description = `RSI neutro/alto (${rsi.toFixed(1)})`;
      }
    } else {
      // Para PUT: RSI > 60 (overbought) ou em zona de queda (50-60)
      if (rsi > 70) {
        present = true;
        strength = 90;
        description = `RSI overbought (${rsi.toFixed(1)}) - forte sinal de venda`;
      } else if (rsi > 55) {
        present = true;
        strength = 70;
        description = `RSI em zona de venda (${rsi.toFixed(1)})`;
      } else {
        description = `RSI neutro/baixo (${rsi.toFixed(1)})`;
      }
    }

    return {
      name: 'RSI Confirmação',
      present,
      strength,
      description
    };
  }

  /**
   * 7. Verifica MACD
   */
  private checkMACD(macd: number, direction: 'CALL' | 'PUT'): SignalCheck {
    const macdStrength = Math.abs(macd) * 50;
    
    if (direction === 'CALL') {
      const present = macd > 0.3;
      return {
        name: 'MACD Confirmação',
        present,
        strength: present ? Math.min(100, macdStrength) : 0,
        description: present ? `MACD positivo (${macd.toFixed(2)})` : 'MACD não confirma'
      };
    } else {
      const present = macd < -0.3;
      return {
        name: 'MACD Confirmação',
        present,
        strength: present ? Math.min(100, macdStrength) : 0,
        description: present ? `MACD negativo (${macd.toFixed(2)})` : 'MACD não confirma'
      };
    }
  }

  /**
   * 8. Verifica Bollinger Bands
   */
  private checkBollingerBands(bbands: number, direction: 'CALL' | 'PUT'): SignalCheck {
    if (direction === 'CALL') {
      const present = bbands < 20;
      const strength = present ? (20 - bbands) * 5 : 0;
      return {
        name: 'Bollinger Bands',
        present,
        strength,
        description: present ? `Preço na banda inferior (${bbands.toFixed(1)})` : 'Não na banda'
      };
    } else {
      const present = bbands > 80;
      const strength = present ? (bbands - 80) * 5 : 0;
      return {
        name: 'Bollinger Bands',
        present,
        strength,
        description: present ? `Preço na banda superior (${bbands.toFixed(1)})` : 'Não na banda'
      };
    }
  }

  /**
   * Calcula score final
   */
  private calculateScore(signals: SignalCheck[]): number {
    const presentSignals = signals.filter(s => s.present);
    
    if (presentSignals.length === 0) return 0;
    
    // Score = média ponderada das forças dos sinais presentes
    const totalStrength = presentSignals.reduce((sum, s) => sum + s.strength, 0);
    const avgStrength = totalStrength / presentSignals.length;
    
    // Bônus por quantidade de sinais
    const quantityBonus = Math.min(20, presentSignals.length * 2);
    
    return Math.min(100, avgStrength + quantityBonus);
  }

  /**
   * Gera recomendação
   */
  private generateRecommendation(
    isValid: boolean,
    signalCount: number,
    score: number,
    missingSignals: string[]
  ): string {
    if (!isValid) {
      if (signalCount < this.MIN_SIGNALS_REQUIRED) {
        return `❌ BLOQUEADO - Apenas ${signalCount}/${this.MIN_SIGNALS_REQUIRED} sinais presentes. Faltam: ${missingSignals.slice(0, 3).join(', ')}`;
      }
      if (score < this.MIN_SCORE_REQUIRED) {
        return `❌ BLOQUEADO - Score muito baixo (${score.toFixed(0)}/${this.MIN_SCORE_REQUIRED}). Sinais fracos.`;
      }
    }

    if (score >= 85) {
      return `✅ EXCELENTE - ${signalCount} sinais confirmados (${score.toFixed(0)}%)`;
    }
    if (score >= 75) {
      return `✅ BOM - ${signalCount} sinais presentes (${score.toFixed(0)}%)`;
    }
    return `⚠️ ACEITÁVEL - ${signalCount} sinais, mas força moderada (${score.toFixed(0)}%)`;
  }
}

// Instância singleton
export const multiSignalValidator = new MultiSignalValidator();
