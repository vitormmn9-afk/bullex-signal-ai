// AI Learning System - Evolves based on results

export interface SignalHistory {
  id: string;
  asset: string;
  direction: 'CALL' | 'PUT';
  probability: number;
  analysisMetrics: {
    rsi: number;
    macd: number;
    bbands: number;
    candlePattern: string;
    quadrantScore: number;
    priceAction: number;
    volumeProfile: number;
    trendStrength: number;
    supportResistance: number;
    overallScore: number;
  };
  result: 'WIN' | 'LOSS' | 'PENDING' | null;
  timestamp: number;
}

export interface AILearningState {
  totalSignals: number;
  winRate: number;
  bestIndicators: string[];
  patternSuccessRates: Record<string, number>;
  weaknessPatterns: string[];
  evolutionPhase: number;
}

const LEARNING_STORAGE_KEY = 'bullex_ai_learning_history';
const MAX_HISTORY_SIZE = 1000;

export class AILearningSystem {
  private history: SignalHistory[] = [];
  private learningState: AILearningState = {
    totalSignals: 0,
    winRate: 0,
    bestIndicators: [],
    patternSuccessRates: {},
    weaknessPatterns: [],
    evolutionPhase: 1,
  };

  constructor() {
    this.loadHistory();
    this.updateLearningState();
  }

  // Save signal to history and learn from it
  recordSignal(signal: SignalHistory): void {
    this.history.push(signal);
    
    // Keep history size manageable
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history = this.history.slice(-MAX_HISTORY_SIZE);
    }
    
    this.saveHistory();
    this.updateLearningState();
  }

  // Update signal result and learn from outcome
  updateSignalResult(signalId: string, result: 'WIN' | 'LOSS'): void {
    const signal = this.history.find(s => s.id === signalId);
    if (signal) {
      signal.result = result;
      this.saveHistory();
      this.updateLearningState();
    }
  }

  // Calculate win rate
  getWinRate(): number {
    if (this.history.length === 0) return 0;
    const completed = this.history.filter(s => s.result === 'WIN' || s.result === 'LOSS');
    if (completed.length === 0) return 0;
    const wins = this.history.filter(s => s.result === 'WIN').length;
    return (wins / completed.length) * 100;
  }

  // Analyze which indicators work best
  analyzeBestIndicators(): string[] {
    const indicators: Record<string, { wins: number; total: number }> = {
      rsi: { wins: 0, total: 0 },
      macd: { wins: 0, total: 0 },
      bbands: { wins: 0, total: 0 },
      candlePattern: { wins: 0, total: 0 },
      trendStrength: { wins: 0, total: 0 },
      priceAction: { wins: 0, total: 0 },
    };

    this.history.forEach(signal => {
      if (signal.result === 'WIN' || signal.result === 'LOSS') {
        const metrics = signal.analysisMetrics;
        
        if (metrics.rsi > 70 || metrics.rsi < 30) {
          indicators.rsi.wins += signal.result === 'WIN' ? 1 : 0;
          indicators.rsi.total += 1;
        }
        if (Math.abs(metrics.macd) > 0.5) {
          indicators.macd.wins += signal.result === 'WIN' ? 1 : 0;
          indicators.macd.total += 1;
        }
        if (metrics.bbands > 80 || metrics.bbands < 20) {
          indicators.bbands.wins += signal.result === 'WIN' ? 1 : 0;
          indicators.bbands.total += 1;
        }
        if (metrics.candlePattern !== 'neutral') {
          indicators.candlePattern.wins += signal.result === 'WIN' ? 1 : 0;
          indicators.candlePattern.total += 1;
        }
        if (metrics.trendStrength > 60) {
          indicators.trendStrength.wins += signal.result === 'WIN' ? 1 : 0;
          indicators.trendStrength.total += 1;
        }
        if (metrics.priceAction > 75 || metrics.priceAction < 25) {
          indicators.priceAction.wins += signal.result === 'WIN' ? 1 : 0;
          indicators.priceAction.total += 1;
        }
      }
    });

    const bestIndicators = Object.entries(indicators)
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))
      .slice(0, 3)
      .map(([name]) => name);

    return bestIndicators;
  }

  // Identify weak patterns to avoid
  analyzeWeakPatterns(): string[] {
    const patterns: Record<string, { wins: number; total: number }> = {
      doji: { wins: 0, total: 0 },
      hammer: { wins: 0, total: 0 },
      shootingStar: { wins: 0, total: 0 },
      strongBullish: { wins: 0, total: 0 },
      strongBearish: { wins: 0, total: 0 },
    };

    this.history.forEach(signal => {
      if (signal.result === 'WIN' || signal.result === 'LOSS') {
        const pattern = signal.analysisMetrics.candlePattern;
        if (pattern in patterns) {
          patterns[pattern].wins += signal.result === 'WIN' ? 1 : 0;
          patterns[pattern].total += 1;
        }
      }
    });

    const weakPatterns = Object.entries(patterns)
      .filter(([_, data]) => data.total >= 3 && (data.wins / data.total) < 0.40)
      .map(([name]) => name);

    return weakPatterns;
  }

  // Calculate pattern success rates
  getPatternSuccessRates(): Record<string, number> {
    const rates: Record<string, number> = {};
    
    const allPatterns = new Set(
      this.history
        .map(s => s.analysisMetrics.candlePattern)
        .filter(p => p !== 'neutral' && p !== 'Unknown')
    );

    allPatterns.forEach(pattern => {
      const patternSignals = this.history.filter(
        s => s.analysisMetrics.candlePattern === pattern && (s.result === 'WIN' || s.result === 'LOSS')
      );
      if (patternSignals.length > 0) {
        const wins = patternSignals.filter(s => s.result === 'WIN').length;
        rates[pattern] = (wins / patternSignals.length) * 100;
      }
    });

    return rates;
  }

  // Evolve AI parameters based on learning
  evolveAI(): number {
    const currentPhase = this.learningState.evolutionPhase;
    const winRate = this.getWinRate();

    // Evolution phases:
    // Phase 1: Learning basic patterns (0-100 signals)
    // Phase 2: Pattern optimization (100-500 signals)
    // Phase 3: Advanced pattern recognition (500+ signals)

    if (this.history.length > 500) {
      if (winRate > 65) {
        this.learningState.evolutionPhase = 3;
      }
    } else if (this.history.length > 100) {
      if (winRate > 55) {
        this.learningState.evolutionPhase = 2;
      }
    }

    return this.learningState.evolutionPhase;
  }

  // Get adaptive probability based on learned patterns
  getAdaptiveProbability(baseScore: number, pattern: string, indicators: string[]): number {
    let score = baseScore;
    
    // Boost if using best indicators
    const bestIndicators = this.analyzeBestIndicators();
    const matchingIndicators = indicators.filter(i => bestIndicators.includes(i)).length;
    score += matchingIndicators * 5;

    // Reduce if weak pattern
    const weakPatterns = this.analyzeWeakPatterns();
    if (weakPatterns.includes(pattern)) {
      score -= 10;
    }

    // Apply evolution multiplier
    const evolutionPhase = this.evolveAI();
    const multiplier = 1 + (evolutionPhase - 1) * 0.05;
    score *= multiplier;

    return Math.min(100, Math.max(50, Math.round(score)));
  }

  // Private methods
  private updateLearningState(): void {
    this.learningState = {
      totalSignals: this.history.length,
      winRate: this.getWinRate(),
      bestIndicators: this.analyzeBestIndicators(),
      patternSuccessRates: this.getPatternSuccessRates(),
      weaknessPatterns: this.analyzeWeakPatterns(),
      evolutionPhase: this.evolveAI(),
    };
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(
        LEARNING_STORAGE_KEY,
        JSON.stringify(this.history)
      );
    } catch (e) {
      console.error('Failed to save AI learning history:', e);
    }
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(LEARNING_STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load AI learning history:', e);
      this.history = [];
    }
  }

  // Get learning state
  getLearningState(): AILearningState {
    return { ...this.learningState };
  }

  // Get signal history for analysis
  getHistory(): SignalHistory[] {
    return [...this.history];
  }
}

// Export singleton instance
export const aiLearningSystem = new AILearningSystem();
