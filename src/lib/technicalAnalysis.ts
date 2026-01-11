// Advanced Technical Analysis with Pattern Recognition

export interface CandlePattern {
  type: 'bullish' | 'bearish' | 'neutral';
  name: string;
  strength: number; // 0-1
  confidence: number; // 0-1
}

export interface AnalysisMetrics {
  rsi: number;
  macd: number;
  bbands: number;
  candlePattern: CandlePattern;
  quadrantScore: number;
  priceAction: number;
  volumeProfile: number;
  trendStrength: number;
  supportResistance: number;
  overallScore: number;
}

// Simulate RSI calculation
export function calculateRSI(prices: number[]): number {
  if (prices.length < 14) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i < 14; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

// Simulate MACD calculation
export function calculateMACD(prices: number[]): number {
  if (prices.length < 26) return 0;
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  return macd;
}

function calculateEMA(prices: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }
  
  return ema;
}

// Simulate Bollinger Bands
export function calculateBollingerBands(prices: number[]): number {
  if (prices.length < 20) return 50;
  
  const sma = prices.slice(-20).reduce((a, b) => a + b) / 20;
  const variance = prices.slice(-20).reduce((a, p) => a + Math.pow(p - sma, 2), 0) / 20;
  const stdDev = Math.sqrt(variance);
  
  const upperBand = sma + 2 * stdDev;
  const lowerBand = sma - 2 * stdDev;
  const currentPrice = prices[prices.length - 1];
  
  // 0 = at lower band, 100 = at upper band
  const position = ((currentPrice - lowerBand) / (upperBand - lowerBand)) * 100;
  return Math.max(0, Math.min(100, position));
}

// Analyze candlestick patterns
export function analyzeCandlePattern(open: number, high: number, low: number, close: number, previousClose: number = close): CandlePattern {
  const bodySize = Math.abs(close - open);
  const totalSize = high - low;
  const shadowRatio = totalSize > 0 ? bodySize / totalSize : 0;
  
  let pattern: CandlePattern = {
    type: close > open ? 'bullish' : 'bearish',
    name: 'neutral',
    strength: 0.5,
    confidence: 0.5,
  };
  
  // Doji - small body, long wicks
  if (bodySize / totalSize < 0.1 && totalSize > 0) {
    pattern = {
      type: 'neutral',
      name: 'Doji',
      strength: 0.5,
      confidence: 0.7,
    };
  }
  // Hammer - small body at top, long lower wick
  else if (close > open && (open - low) > bodySize * 2 && (high - close) < bodySize) {
    pattern = {
      type: 'bullish',
      name: 'Hammer',
      strength: 0.8,
      confidence: 0.8,
    };
  }
  // Shooting Star - small body at bottom, long upper wick
  else if (close < open && (high - open) > bodySize * 2 && (low - close) < bodySize) {
    pattern = {
      type: 'bearish',
      name: 'Shooting Star',
      strength: 0.8,
      confidence: 0.8,
    };
  }
  // Strong bullish candle
  else if (close > open && bodySize / totalSize > 0.7) {
    pattern = {
      type: 'bullish',
      name: 'Strong Bullish',
      strength: 0.85,
      confidence: 0.75,
    };
  }
  // Strong bearish candle
  else if (close < open && bodySize / totalSize > 0.7) {
    pattern = {
      type: 'bearish',
      name: 'Strong Bearish',
      strength: 0.85,
      confidence: 0.75,
    };
  }
  
  return pattern;
}

// Quadrant analysis - support/resistance zones
export function analyzeQuadrants(prices: number[]): number {
  if (prices.length < 4) return 50;
  
  const recentPrices = prices.slice(-4);
  const high = Math.max(...recentPrices);
  const low = Math.min(...recentPrices);
  const range = high - low;
  const currentPrice = recentPrices[recentPrices.length - 1];
  
  // 0 = near resistance (sell), 100 = near support (buy)
  const positionInRange = ((high - currentPrice) / range) * 100;
  return Math.max(0, Math.min(100, positionInRange));
}

// Price action analysis
export function analyzePriceAction(prices: number[]): number {
  if (prices.length < 3) return 50;
  
  const recent = prices.slice(-3);
  const trend = recent[2] > recent[1] && recent[1] > recent[0] ? 100 : recent[2] < recent[1] && recent[1] < recent[0] ? 0 : 50;
  
  return trend;
}

// Volume profile simulation
export function analyzeVolumeProfile(prices: number[]): number {
  if (prices.length < 5) return 50;
  
  const recentPrices = prices.slice(-5);
  const avgPrice = recentPrices.reduce((a, b) => a + b) / recentPrices.length;
  const volatility = Math.sqrt(recentPrices.reduce((a, p) => a + Math.pow(p - avgPrice, 2), 0) / recentPrices.length);
  
  // Higher volatility = higher volume
  return Math.min(100, volatility * 100);
}

// Trend strength analysis
export function analyzeTrendStrength(prices: number[]): number {
  if (prices.length < 10) return 50;
  
  const recentPrices = prices.slice(-10);
  const highs = recentPrices.filter((p, i, arr) => i === 0 || i === arr.length - 1 || (p > arr[i - 1] && p > arr[i + 1]));
  const lows = recentPrices.filter((p, i, arr) => i === 0 || i === arr.length - 1 || (p < arr[i - 1] && p < arr[i + 1]));
  
  const strength = Math.abs(highs.length - lows.length) / recentPrices.length * 100;
  return Math.min(100, strength);
}

// Support and Resistance analysis
export function analyzeSupportResistance(prices: number[]): number {
  if (prices.length < 5) return 50;
  
  const recentPrices = prices.slice(-10);
  const highestPrice = Math.max(...recentPrices);
  const lowestPrice = Math.min(...recentPrices);
  const currentPrice = recentPrices[recentPrices.length - 1];
  
  // Distance from support (lower resistance = stronger signal)
  const distanceFromSupport = currentPrice - lowestPrice;
  const totalRange = highestPrice - lowestPrice;
  
  return (distanceFromSupport / totalRange) * 100;
}

// Comprehensive analysis combining all metrics
export function performComprehensiveAnalysis(prices: number[], ohlc?: { open: number; high: number; low: number; close: number }): AnalysisMetrics {
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bbands = calculateBollingerBands(prices);
  const quadrant = analyzeQuadrants(prices);
  const priceAction = analyzePriceAction(prices);
  const volumeProfile = analyzeVolumeProfile(prices);
  const trendStrength = analyzeTrendStrength(prices);
  const supportResistance = analyzeSupportResistance(prices);
  
  const candlePattern = ohlc 
    ? analyzeCandlePattern(ohlc.open, ohlc.high, ohlc.low, ohlc.close)
    : { type: 'neutral' as const, name: 'Unknown', strength: 0.5, confidence: 0.5 };
  
  // Calculate overall score (0-100)
  const overallScore = (
    (rsi > 70 || rsi < 30 ? 20 : 0) + // Overbought/oversold
    (Math.abs(macd) > 0.5 ? 15 : 0) + // Strong momentum
    (bbands > 80 || bbands < 20 ? 15 : 0) + // Edge of bands
    (priceAction > 75 || priceAction < 25 ? 15 : 0) + // Strong trend
    (candlePattern.strength > 0.7 ? 10 : 0) + // Pattern confidence
    (trendStrength > 60 ? 10 : 0) + // Trend alignment
    (Math.abs(quadrant - 50) > 30 ? 5 : 0) + // Support/Resistance proximity
    (volumeProfile > 60 ? 5 : 0) // Volume confirmation
  );
  
  return {
    rsi,
    macd,
    bbands,
    candlePattern,
    quadrantScore: quadrant,
    priceAction,
    volumeProfile,
    trendStrength,
    supportResistance,
    overallScore,
  };
}
