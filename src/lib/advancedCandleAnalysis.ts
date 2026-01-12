// Advanced Candlestick Analysis with Color Patterns and Graphics

export interface CandleColorPattern {
  color: 'green' | 'red' | 'neutral' | 'gradient';
  intensity: number; // 0-1, quão forte é a cor
  pattern: string; // Nome do padrão específico
  candleCount: number; // Número de velas no padrão
  strength: number; // 0-1 força do padrão
  signalReliability: number; // 0-1 confiabilidade do sinal
}

export interface QuadrantPattern {
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // Quadrantes de preço
  zone: 'resistance' | 'support' | 'neutral';
  strength: number; // 0-1
  priceDistance: number; // Distância em % da atual
  recommendation: 'BUY' | 'SELL' | 'HOLD';
}

export interface AdvancedCandleAnalysis {
  colorPattern: CandleColorPattern;
  quadrantAnalysis: QuadrantPattern;
  sequencePattern: string;
  reversal_probability: number;
  continuation_probability: number;
  trend_confirmation: number;
  volume_confirmation: number;
}

// Análise de padrões múltiplos de velas (sequência)
export function analyzeMultipleCandlePattern(
  candles: Array<{ open: number; high: number; low: number; close: number }>
): CandleColorPattern {
  if (candles.length === 0) return {
    color: 'neutral',
    intensity: 0,
    pattern: 'Sem dados',
    candleCount: 0,
    strength: 0,
    signalReliability: 0
  };

  const bullishCount = candles.filter(c => c.close > c.open).length;
  const bearishCount = candles.length - bullishCount;
  const avgBodySize = candles.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / candles.length;

  // Três velas brancas consecutivas (muito bullish)
  if (bullishCount === candles.length && candles.length >= 3) {
    const allGrowing = candles.every((c, i) => {
      if (i === 0) return true;
      return c.close > candles[i - 1].close && c.open < candles[i - 1].open;
    });
    
    if (allGrowing) {
      return {
        color: 'green',
        intensity: 0.95,
        pattern: 'Três Velas Brancas Crescentes',
        candleCount: 3,
        strength: 0.95,
        signalReliability: 0.92
      };
    }
  }

  // Três velas pretas consecutivas (muito bearish)
  if (bearishCount === candles.length && candles.length >= 3) {
    const allFalling = candles.every((c, i) => {
      if (i === 0) return true;
      return c.close < candles[i - 1].close && c.open > candles[i - 1].open;
    });

    if (allFalling) {
      return {
        color: 'red',
        intensity: 0.95,
        pattern: 'Três Velas Pretas Decrescentes',
        candleCount: 3,
        strength: 0.95,
        signalReliability: 0.92
      };
    }
  }

  // Envolvente (Engulfing Pattern)
  if (candles.length >= 2) {
    const prev = candles[candles.length - 2];
    const curr = candles[candles.length - 1];
    const prevSize = Math.abs(prev.close - prev.open);
    const currSize = Math.abs(curr.close - curr.open);

    // Bullish Engulfing
    if (prev.close < prev.open && curr.close > curr.open && 
        curr.open < prev.close && curr.close > prev.open && 
        currSize > prevSize) {
      return {
        color: 'green',
        intensity: 0.88,
        pattern: 'Envolvente Bullish',
        candleCount: 2,
        strength: 0.88,
        signalReliability: 0.85
      };
    }

    // Bearish Engulfing
    if (prev.close > prev.open && curr.close < curr.open && 
        curr.open > prev.close && curr.close < prev.open && 
        currSize > prevSize) {
      return {
        color: 'red',
        intensity: 0.88,
        pattern: 'Envolvente Bearish',
        candleCount: 2,
        strength: 0.88,
        signalReliability: 0.85
      };
    }
  }

  // Padrão Harami (vela pequena dentro da anterior)
  if (candles.length >= 2) {
    const prev = candles[candles.length - 2];
    const curr = candles[candles.length - 1];
    const prevSize = Math.abs(prev.close - prev.open);
    const currSize = Math.abs(curr.close - curr.open);

    if (currSize < prevSize * 0.5) {
      // Bullish Harami
      if (prev.close < prev.open && curr.close > curr.open) {
        return {
          color: 'green',
          intensity: 0.72,
          pattern: 'Harami Bullish',
          candleCount: 2,
          strength: 0.72,
          signalReliability: 0.68
        };
      }

      // Bearish Harami
      if (prev.close > prev.open && curr.close < curr.open) {
        return {
          color: 'red',
          intensity: 0.72,
          pattern: 'Harami Bearish',
          candleCount: 2,
          strength: 0.72,
          signalReliability: 0.68
        };
      }
    }
  }

  // Velas sequenciais da mesma cor (força na direção)
  if (bullishCount > bearishCount * 1.5 && bullishCount >= 2) {
    return {
      color: 'green',
      intensity: 0.7 + (bullishCount / candles.length * 0.3),
      pattern: `${bullishCount} Velas Verdes Sequenciais`,
      candleCount: bullishCount,
      strength: Math.min(1, bullishCount / 5),
      signalReliability: 0.75
    };
  }

  if (bearishCount > bullishCount * 1.5 && bearishCount >= 2) {
    return {
      color: 'red',
      intensity: 0.7 + (bearishCount / candles.length * 0.3),
      pattern: `${bearishCount} Velas Vermelhas Sequenciais`,
      candleCount: bearishCount,
      strength: Math.min(1, bearishCount / 5),
      signalReliability: 0.75
    };
  }

  // Padrão misto
  const color = bullishCount > bearishCount ? 'green' : 'red';
  const intensity = Math.abs(bullishCount - bearishCount) / candles.length;

  return {
    color: color,
    intensity: intensity,
    pattern: `Padrão Misto (${bullishCount}V/${bearishCount}R)`,
    candleCount: candles.length,
    strength: intensity,
    signalReliability: 0.6 + (intensity * 0.2)
  };
}

// Análise de quadrantes avançada
export function analyzeAdvancedQuadrants(
  prices: number[],
  currentPrice: number,
  supportLevel: number,
  resistanceLevel: number
): QuadrantPattern {
  const range = resistanceLevel - supportLevel;
  const mid = supportLevel + range / 2;
  
  // Q4: 0-25% do suporte (muito abaixo) - Super Oversold
  if (currentPrice < supportLevel) {
    return {
      quadrant: 'Q4',
      zone: 'support',
      strength: 0.95,
      priceDistance: ((supportLevel - currentPrice) / supportLevel) * 100,
      recommendation: 'BUY'
    };
  }

  // Q3: 25-50% (zona de suporte) - Oversold
  if (currentPrice >= supportLevel && currentPrice < mid) {
    return {
      quadrant: 'Q3',
      zone: 'support',
      strength: 0.7 + ((mid - currentPrice) / (mid - supportLevel) * 0.25),
      priceDistance: ((currentPrice - supportLevel) / range) * 100,
      recommendation: 'BUY'
    };
  }

  // Q2: 50-75% (zona de resistência) - Overbought
  if (currentPrice >= mid && currentPrice < resistanceLevel) {
    return {
      quadrant: 'Q2',
      zone: 'resistance',
      strength: 0.7 + ((currentPrice - mid) / (resistanceLevel - mid) * 0.25),
      priceDistance: ((resistanceLevel - currentPrice) / range) * 100,
      recommendation: 'SELL'
    };
  }

  // Q1: 75-100% do resistência (muito acima) - Super Overbought
  if (currentPrice >= resistanceLevel) {
    return {
      quadrant: 'Q1',
      zone: 'resistance',
      strength: 0.95,
      priceDistance: ((currentPrice - resistanceLevel) / resistanceLevel) * 100,
      recommendation: 'SELL'
    };
  }

  return {
    quadrant: 'Q2',
    zone: 'neutral',
    strength: 0.5,
    priceDistance: 0,
    recommendation: 'HOLD'
  };
}

// Análise completa avançada de padrões gráficos
export function performAdvancedCandleAnalysis(
  candleHistory: Array<{ open: number; high: number; low: number; close: number }>,
  currentPrice: number,
  supportLevel: number,
  resistanceLevel: number,
  volumeData?: number[]
): AdvancedCandleAnalysis {
  
  // Análise de cores e padrões
  const colorPattern = analyzeMultipleCandlePattern(candleHistory.slice(-5));
  
  // Análise de quadrantes
  const quadrantAnalysis = analyzeAdvancedQuadrants(
    candleHistory.map(c => c.close),
    currentPrice,
    supportLevel,
    resistanceLevel
  );

  // Sequência de padrões
  let sequencePattern = '';
  for (let i = Math.max(0, candleHistory.length - 5); i < candleHistory.length; i++) {
    const c = candleHistory[i];
    const bodySize = Math.abs(c.close - c.open);
    const totalSize = c.high - c.low;
    const ratio = totalSize > 0 ? bodySize / totalSize : 0;
    
    if (ratio < 0.1) sequencePattern += 'D'; // Doji
    else if (c.close > c.open) sequencePattern += 'U'; // Up
    else sequencePattern += 'D'; // Down
  }

  // Probabilidades baseadas em padrão
  let reversalProb = 0;
  let continuationProb = 0;

  if (sequencePattern.includes('DDD') || sequencePattern.includes('UUU')) {
    continuationProb = 0.75;
    reversalProb = 0.25;
  } else if (colorPattern.pattern.includes('Engulfing')) {
    reversalProb = 0.80;
    continuationProb = 0.20;
  } else if (colorPattern.pattern.includes('Harami')) {
    reversalProb = 0.65;
    continuationProb = 0.35;
  } else {
    reversalProb = 0.5;
    continuationProb = 0.5;
  }

  // Confirmação de tendência
  const trendConfirmation = colorPattern.intensity;
  
  // Confirmação de volume (se disponível)
  let volumeConfirmation = 0.5;
  if (volumeData && volumeData.length > 0) {
    const avgVolume = volumeData.reduce((a, b) => a + b) / volumeData.length;
    const lastVolume = volumeData[volumeData.length - 1];
    volumeConfirmation = Math.min(1, lastVolume / avgVolume);
  }

  return {
    colorPattern,
    quadrantAnalysis,
    sequencePattern,
    reversal_probability: reversalProb,
    continuation_probability: continuationProb,
    trend_confirmation: trendConfirmation,
    volume_confirmation: volumeConfirmation
  };
}
