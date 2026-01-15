/**
 * Sistema Avançado de Análise de Padrões de Velas
 * Analisa quadrantes, cores, sequências temporais e prevê próxima vela
 */

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface QuadrantAnalysis {
  openQuadrant: number; // 1-4 (bottom to top)
  closeQuadrant: number;
  highQuadrant: number;
  lowQuadrant: number;
  bodyPosition: 'upper' | 'middle' | 'lower'; // posição do corpo
  wickRatio: {
    upper: number; // % do pavio superior
    lower: number; // % do pavio inferior
  };
}

export interface ColorPattern {
  color: 'green' | 'red' | 'doji'; // alta, baixa, neutro
  intensity: number; // 0-100: quão forte é a vela (tamanho do corpo)
  sequence: string; // últimas 5 cores: "GGRGR"
  consecutiveCount: number; // quantas velas da mesma cor seguidas
}

export interface CandleSequencePattern {
  pattern: string;
  frequency: number; // quantas vezes apareceu
  successRate: number; // % de vezes que levou a vitória
  avgProbability: number; // probabilidade média quando usou
  lastSeen: number; // timestamp
}

export interface NextCandlePrediction {
  predictedDirection: 'UP' | 'DOWN';
  confidence: number; // 0-100
  reasoning: string[];
  basedOnPatterns: string[];
  quadrantProbability: {
    up: number;
    down: number;
  };
  colorProbability: {
    green: number;
    red: number;
  };
  historicalAccuracy: number; // precisão histórica deste tipo de previsão
}

export interface AdvancedCandleAnalysisResult {
  quadrantAnalysis: QuadrantAnalysis;
  colorPattern: ColorPattern;
  sequencePattern: string;
  prediction: NextCandlePrediction;
  timeframeAnalysis: {
    period: string;
    volatility: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
  };
  score: number; // score final 0-100
}

class AdvancedCandlePatternAnalyzer {
  private candleHistory: Map<string, CandleData[]> = new Map(); // por asset
  private sequencePatterns: Map<string, CandleSequencePattern> = new Map();
  private predictionHistory: Map<string, { predicted: string; actual: string; correct: boolean }[]> = new Map();
  private readonly MAX_HISTORY_PER_ASSET = 200;
  private readonly STORAGE_KEY = 'advanced_candle_patterns';

  constructor() {
    this.loadPatterns();
  }

  /**
   * Adiciona uma vela ao histórico
   */
  addCandle(asset: string, candle: CandleData): void {
    if (!this.candleHistory.has(asset)) {
      this.candleHistory.set(asset, []);
    }

    const history = this.candleHistory.get(asset)!;
    history.push(candle);

    // Limita histórico
    if (history.length > this.MAX_HISTORY_PER_ASSET) {
      this.candleHistory.set(asset, history.slice(-this.MAX_HISTORY_PER_ASSET));
    }

    // Atualiza padrões de sequência
    this.updateSequencePatterns(asset);
  }

  /**
   * Analisa quadrantes de uma vela
   */
  analyzeQuadrants(candle: CandleData, previousCandles: CandleData[]): QuadrantAnalysis {
    // Calcula range total baseado nas últimas velas
    const recentCandles = previousCandles.slice(-20);
    const allPrices = recentCandles.flatMap(c => [c.open, c.high, c.low, c.close]);
    const minPrice = Math.min(...allPrices, candle.low);
    const maxPrice = Math.max(...allPrices, candle.high);
    const range = maxPrice - minPrice;
    const quadrantSize = range / 4;

    // Função para determinar quadrante (1=bottom, 4=top)
    const getQuadrant = (price: number): number => {
      const position = (price - minPrice) / range;
      if (position <= 0.25) return 1;
      if (position <= 0.5) return 2;
      if (position <= 0.75) return 3;
      return 4;
    };

    const openQ = getQuadrant(candle.open);
    const closeQ = getQuadrant(candle.close);
    const highQ = getQuadrant(candle.high);
    const lowQ = getQuadrant(candle.low);

    // Posição do corpo
    const bodyTop = Math.max(candle.open, candle.close);
    const bodyBottom = Math.min(candle.open, candle.close);
    const bodyCenter = (bodyTop + bodyBottom) / 2;
    const bodyCenterQuadrant = getQuadrant(bodyCenter);

    let bodyPosition: 'upper' | 'middle' | 'lower' = 'middle';
    if (bodyCenterQuadrant >= 3) bodyPosition = 'upper';
    else if (bodyCenterQuadrant <= 2) bodyPosition = 'lower';

    // Razão dos pavios
    const totalRange = candle.high - candle.low;
    const upperWick = candle.high - bodyTop;
    const lowerWick = bodyBottom - candle.low;

    return {
      openQuadrant: openQ,
      closeQuadrant: closeQ,
      highQuadrant: highQ,
      lowQuadrant: lowQ,
      bodyPosition,
      wickRatio: {
        upper: totalRange > 0 ? (upperWick / totalRange) * 100 : 0,
        lower: totalRange > 0 ? (lowerWick / totalRange) * 100 : 0,
      },
    };
  }

  /**
   * Analisa padrão de cores
   */
  analyzeColorPattern(candle: CandleData, previousCandles: CandleData[]): ColorPattern {
    // Determina cor da vela atual
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    const bodyRatio = totalRange > 0 ? bodySize / totalRange : 0;

    let color: 'green' | 'red' | 'doji' = 'doji';
    if (bodyRatio > 0.1) {
      color = candle.close > candle.open ? 'green' : 'red';
    }

    // Intensidade (tamanho do corpo em relação ao range)
    const intensity = Math.min(100, bodyRatio * 100);

    // Sequência das últimas 5 velas
    const recent5 = previousCandles.slice(-5);
    const sequence = recent5
      .map(c => {
        if (c.close > c.open) return 'G';
        if (c.close < c.open) return 'R';
        return 'D';
      })
      .join('') + (color === 'green' ? 'G' : color === 'red' ? 'R' : 'D');

    // Conta velas consecutivas da mesma cor
    let consecutiveCount = 1;
    for (let i = recent5.length - 1; i >= 0; i--) {
      const c = recent5[i];
      const cColor = c.close > c.open ? 'green' : c.close < c.open ? 'red' : 'doji';
      if (cColor === color) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    return {
      color,
      intensity,
      sequence: sequence.slice(-5), // últimas 5
      consecutiveCount,
    };
  }

  /**
   * Atualiza padrões de sequência
   */
  private updateSequencePatterns(asset: string): void {
    const history = this.candleHistory.get(asset);
    if (!history || history.length < 6) return;

    // Pega últimas 6 velas (5 para padrão + 1 resultado)
    const recent = history.slice(-6);
    const patternCandles = recent.slice(0, 5);
    const resultCandle = recent[5];

    // Cria string do padrão
    const pattern = patternCandles
      .map(c => {
        if (c.close > c.open) return 'G';
        if (c.close < c.open) return 'R';
        return 'D';
      })
      .join('');

    // Determina resultado
    const wasUp = resultCandle.close > resultCandle.open;
    
    // Atualiza ou cria padrão
    const key = `${pattern}`;
    if (!this.sequencePatterns.has(key)) {
      this.sequencePatterns.set(key, {
        pattern,
        frequency: 0,
        successRate: 0,
        avgProbability: 0,
        lastSeen: Date.now(),
      });
    }

    const patternData = this.sequencePatterns.get(key)!;
    patternData.frequency++;
    patternData.lastSeen = Date.now();
  }

  /**
   * 🎯 PREVISÃO DA PRÓXIMA VELA -核心功能
   */
  predictNextCandle(
    asset: string,
    currentCandle: CandleData,
    result?: 'WIN' | 'LOSS'
  ): NextCandlePrediction {
    const history = this.candleHistory.get(asset) || [];
    if (history.length < 5) {
      return {
        predictedDirection: 'UP',
        confidence: 50,
        reasoning: ['Histórico insuficiente'],
        basedOnPatterns: [],
        quadrantProbability: { up: 50, down: 50 },
        colorProbability: { green: 50, red: 50 },
        historicalAccuracy: 50,
      };
    }

    const reasoning: string[] = [];
    const patterns: string[] = [];
    let upVotes = 0;
    let downVotes = 0;
    let totalWeight = 0;

    // 1. ANÁLISE DE QUADRANTES
    const quadrantAnalysis = this.analyzeQuadrants(currentCandle, history);
    const quadrantScore = this.getQuadrantPrediction(quadrantAnalysis);
    
    if (quadrantScore.direction === 'UP') {
      upVotes += quadrantScore.weight;
      reasoning.push(`Quadrantes sugerem alta (${quadrantScore.confidence.toFixed(0)}%)`);
      patterns.push('quadrant-bullish');
    } else {
      downVotes += quadrantScore.weight;
      reasoning.push(`Quadrantes sugerem baixa (${quadrantScore.confidence.toFixed(0)}%)`);
      patterns.push('quadrant-bearish');
    }
    totalWeight += quadrantScore.weight;

    // 2. ANÁLISE DE CORES
    const colorPattern = this.analyzeColorPattern(currentCandle, history);
    const colorScore = this.getColorPrediction(colorPattern);
    
    if (colorScore.direction === 'UP') {
      upVotes += colorScore.weight;
      reasoning.push(`Padrão de cores: ${colorPattern.sequence} → Alta (${colorScore.confidence.toFixed(0)}%)`);
      patterns.push(`color-${colorPattern.sequence}`);
    } else {
      downVotes += colorScore.weight;
      reasoning.push(`Padrão de cores: ${colorPattern.sequence} → Baixa (${colorScore.confidence.toFixed(0)}%)`);
      patterns.push(`color-${colorPattern.sequence}`);
    }
    totalWeight += colorScore.weight;

    // 3. ANÁLISE DE SEQUÊNCIA HISTÓRICA
    const sequenceScore = this.getSequencePrediction(history);
    if (sequenceScore.direction === 'UP') {
      upVotes += sequenceScore.weight;
      reasoning.push(`Sequência histórica favorece alta (${sequenceScore.confidence.toFixed(0)}%)`);
    } else {
      downVotes += sequenceScore.weight;
      reasoning.push(`Sequência histórica favorece baixa (${sequenceScore.confidence.toFixed(0)}%)`);
    }
    totalWeight += sequenceScore.weight;

    // 4. ANÁLISE DE VELAS CONSECUTIVAS
    if (colorPattern.consecutiveCount >= 3) {
      const reversal = colorPattern.color === 'green' ? 'DOWN' : 'UP';
      if (reversal === 'UP') upVotes += 1;
      else downVotes += 1;
      reasoning.push(`${colorPattern.consecutiveCount} velas ${colorPattern.color} consecutivas → Provável reversão`);
      patterns.push('reversal-pattern');
      totalWeight += 1;
    }

    // 5. ANÁLISE DE PAVIOS (Rejeição)
    if (quadrantAnalysis.wickRatio.upper > 60) {
      downVotes += 1.5;
      reasoning.push('Pavio superior longo indica rejeição → Baixa');
      patterns.push('rejection-top');
      totalWeight += 1.5;
    } else if (quadrantAnalysis.wickRatio.lower > 60) {
      upVotes += 1.5;
      reasoning.push('Pavio inferior longo indica suporte → Alta');
      patterns.push('rejection-bottom');
      totalWeight += 1.5;
    }

    // Calcula confiança final
    const upProbability = totalWeight > 0 ? (upVotes / totalWeight) * 100 : 50;
    const downProbability = 100 - upProbability;
    
    const predictedDirection = upProbability > downProbability ? 'UP' : 'DOWN';
    const confidence = Math.max(upProbability, downProbability);

    // Calcula precisão histórica
    const historicalAccuracy = this.calculateHistoricalAccuracy(asset, patterns);

    // Registra previsão se houver resultado
    if (result) {
      this.recordPrediction(asset, predictedDirection, result === 'WIN');
    }

    return {
      predictedDirection,
      confidence: Math.min(95, confidence),
      reasoning,
      basedOnPatterns: patterns,
      quadrantProbability: {
        up: upProbability,
        down: downProbability,
      },
      colorProbability: {
        green: colorPattern.color === 'green' ? 60 : 40,
        red: colorPattern.color === 'red' ? 60 : 40,
      },
      historicalAccuracy,
    };
  }

  /**
   * Previsão baseada em quadrantes
   */
  private getQuadrantPrediction(analysis: QuadrantAnalysis): { direction: 'UP' | 'DOWN'; confidence: number; weight: number } {
    let score = 0;
    let confidence = 50;

    // Se fechou em quadrante superior e abriu em inferior → força bullish
    if (analysis.closeQuadrant > analysis.openQuadrant) {
      score += (analysis.closeQuadrant - analysis.openQuadrant) * 10;
    } else {
      score -= (analysis.openQuadrant - analysis.closeQuadrant) * 10;
    }

    // Posição do corpo
    if (analysis.bodyPosition === 'upper') score += 15;
    else if (analysis.bodyPosition === 'lower') score -= 15;

    // Pavios
    if (analysis.wickRatio.lower > 50) score += 10; // suporte
    if (analysis.wickRatio.upper > 50) score -= 10; // resistência

    confidence = 50 + Math.abs(score);
    
    return {
      direction: score > 0 ? 'UP' : 'DOWN',
      confidence: Math.min(90, confidence),
      weight: 2, // peso alto para quadrantes
    };
  }

  /**
   * Previsão baseada em cores
   */
  private getColorPrediction(pattern: ColorPattern): { direction: 'UP' | 'DOWN'; confidence: number; weight: number } {
    const seq = pattern.sequence;
    let score = 0;

    // Analisa últimas 3 velas da sequência
    const last3 = seq.slice(-3);
    const greenCount = (last3.match(/G/g) || []).length;
    const redCount = (last3.match(/R/g) || []).length;

    if (greenCount > redCount) {
      score = 10 + (greenCount - redCount) * 5;
    } else if (redCount > greenCount) {
      score = -(10 + (redCount - greenCount) * 5);
    }

    // Velas consecutivas indicam possível reversão
    if (pattern.consecutiveCount >= 4) {
      score *= -0.5; // inverte metade do score (reversão)
    }

    // Intensidade da vela atual
    if (pattern.intensity > 70) {
      if (pattern.color === 'green') score += 15;
      else if (pattern.color === 'red') score -= 15;
    }

    const confidence = 50 + Math.abs(score);

    return {
      direction: score > 0 ? 'UP' : 'DOWN',
      confidence: Math.min(85, confidence),
      weight: 1.5,
    };
  }

  /**
   * Previsão baseada em sequência histórica
   */
  private getSequencePrediction(history: CandleData[]): { direction: 'UP' | 'DOWN'; confidence: number; weight: number } {
    const recent = history.slice(-5);
    const pattern = recent.map(c => c.close > c.open ? 'G' : 'R').join('');

    const patternData = this.sequencePatterns.get(pattern);
    if (patternData && patternData.frequency >= 3) {
      // Tem histórico deste padrão
      const nextWasUp = patternData.successRate > 50;
      return {
        direction: nextWasUp ? 'UP' : 'DOWN',
        confidence: patternData.successRate,
        weight: 1,
      };
    }

    // Sem histórico específico, usa tendência geral
    const greenCount = (pattern.match(/G/g) || []).length;
    const redCount = (pattern.match(/R/g) || []).length;

    return {
      direction: greenCount > redCount ? 'UP' : 'DOWN',
      confidence: 50 + Math.abs(greenCount - redCount) * 5,
      weight: 0.5,
    };
  }

  /**
   * Registra uma previsão e seu resultado
   */
  private recordPrediction(asset: string, predicted: string, wasCorrect: boolean): void {
    if (!this.predictionHistory.has(asset)) {
      this.predictionHistory.set(asset, []);
    }

    const history = this.predictionHistory.get(asset)!;
    history.push({
      predicted,
      actual: wasCorrect ? predicted : (predicted === 'UP' ? 'DOWN' : 'UP'),
      correct: wasCorrect,
    });

    // Limita histórico
    if (history.length > 100) {
      this.predictionHistory.set(asset, history.slice(-100));
    }
  }

  /**
   * Calcula precisão histórica
   */
  private calculateHistoricalAccuracy(asset: string, patterns: string[]): number {
    const history = this.predictionHistory.get(asset);
    if (!history || history.length < 10) return 50;

    const correct = history.filter(h => h.correct).length;
    return (correct / history.length) * 100;
  }

  /**
   * Análise completa de uma vela
   */
  analyzeCandle(
    asset: string,
    candle: CandleData,
    result?: 'WIN' | 'LOSS'
  ): AdvancedCandleAnalysisResult {
    // Adiciona ao histórico
    this.addCandle(asset, candle);

    const history = this.candleHistory.get(asset) || [];
    const previousCandles = history.slice(0, -1);

    // Análises
    const quadrantAnalysis = this.analyzeQuadrants(candle, previousCandles);
    const colorPattern = this.analyzeColorPattern(candle, previousCandles);
    const prediction = this.predictNextCandle(asset, candle, result);

    // Análise de timeframe
    const recentCandles = previousCandles.slice(-20);
    const volatility = this.calculateVolatility(recentCandles);
    const trend = this.determineTrend(recentCandles);

    // Score final
    const score = this.calculateFinalScore(
      quadrantAnalysis,
      colorPattern,
      prediction,
      volatility,
      trend
    );

    return {
      quadrantAnalysis,
      colorPattern,
      sequencePattern: colorPattern.sequence,
      prediction,
      timeframeAnalysis: {
        period: '5min',
        volatility,
        trend: trend.direction,
        strength: trend.strength,
      },
      score,
    };
  }

  private calculateVolatility(candles: CandleData[]): number {
    if (candles.length === 0) return 0;
    
    const ranges = candles.map(c => c.high - c.low);
    const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
    const avgPrice = candles.reduce((a, c) => a + c.close, 0) / candles.length;
    
    return (avgRange / avgPrice) * 100;
  }

  private determineTrend(candles: CandleData[]): { direction: 'bullish' | 'bearish' | 'neutral'; strength: number } {
    if (candles.length < 5) return { direction: 'neutral', strength: 0 };

    const closes = candles.map(c => c.close);
    const first5 = closes.slice(0, 5).reduce((a, b) => a + b) / 5;
    const last5 = closes.slice(-5).reduce((a, b) => a + b) / 5;

    const change = ((last5 - first5) / first5) * 100;

    if (Math.abs(change) < 0.5) return { direction: 'neutral', strength: 0 };
    
    return {
      direction: change > 0 ? 'bullish' : 'bearish',
      strength: Math.min(100, Math.abs(change) * 20),
    };
  }

  private calculateFinalScore(
    quadrant: QuadrantAnalysis,
    color: ColorPattern,
    prediction: NextCandlePrediction,
    volatility: number,
    trend: { direction: string; strength: number }
  ): number {
    let score = 50;

    // Confiança da previsão
    score += (prediction.confidence - 50) * 0.4;

    // Precisão histórica
    score += (prediction.historicalAccuracy - 50) * 0.3;

    // Intensidade da cor
    score += color.intensity * 0.2;

    // Força da tendência
    score += trend.strength * 0.2;

    // Penaliza alta volatilidade
    if (volatility > 3) score -= 10;

    // Bonus por múltiplos padrões concordando
    if (prediction.basedOnPatterns.length >= 3) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  // Persistência
  private savePatterns(): void {
    try {
      const data = {
        sequences: Array.from(this.sequencePatterns.entries()),
        predictions: Array.from(this.predictionHistory.entries()),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar padrões:', error);
    }
  }

  private loadPatterns(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.sequencePatterns = new Map(data.sequences || []);
        this.predictionHistory = new Map(data.predictions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar padrões:', error);
    }
  }

  getStats() {
    return {
      totalPatterns: this.sequencePatterns.size,
      totalAssets: this.candleHistory.size,
      totalPredictions: Array.from(this.predictionHistory.values())
        .reduce((sum, arr) => sum + arr.length, 0),
    };
  }
}

// Instância singleton
export const advancedCandleAnalyzer = new AdvancedCandlePatternAnalyzer();
