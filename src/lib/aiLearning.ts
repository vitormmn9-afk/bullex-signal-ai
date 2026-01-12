// AI Learning System - Evolves based on results with Web Integration

import { webLearningSystem, type MarketInsight } from './webIntegration';
import { performAdvancedCandleAnalysis, type AdvancedCandleAnalysis } from './advancedCandleAnalysis';

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
  webInsights?: MarketInsight[];
  advancedCandleAnalysis?: AdvancedCandleAnalysis;
}

export interface AILearningState {
  totalSignals: number;
  winRate: number;
  bestIndicators: string[];
  patternSuccessRates: Record<string, number>;
  weaknessPatterns: string[];
  evolutionPhase: number;
}

export interface OperationalConfig {
  minTrendStrength: number;
  minSupportResistance: number;
  requireConfirmations: number; // quantidade de confirmações entre RSI/MACD/Price Action
  disallowedPatterns: Set<string>;
  indicatorWeights: Record<string, number>; // pesos extras por indicador
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
  private operationalConfig: OperationalConfig = {
    minTrendStrength: 40,
    minSupportResistance: 50,
    requireConfirmations: 1,
    disallowedPatterns: new Set<string>(),
    indicatorWeights: {},
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

    // Operational rules adjustments
    // Penaliza padrões desautorizados
    if (this.operationalConfig.disallowedPatterns.has(pattern)) {
      score -= 15;
    }
    // Pesos por indicador preferido
    indicators.forEach(ind => {
      const w = this.operationalConfig.indicatorWeights[ind];
      if (w) score += w;
    });
    // Confirmações exigidas: se menos que o necessário, reduzir score
    const confirmations = this.countConfirmationsFromMetrics(baseScore);
    if (confirmations < this.operationalConfig.requireConfirmations) {
      score -= 20;
    }
    // Ajuste de mínimos (proxy pelos scores do baseScore)
    // Como não temos métricas diretas aqui, aplicamos pequenos ajustes no final em evolveAI()

    // Apply evolution multiplier
    const evolutionPhase = this.evolveAI();
    const multiplier = 1 + (evolutionPhase - 1) * 0.05;
    score *= multiplier;

    return Math.min(100, Math.max(50, Math.round(score)));
  }

  private countConfirmationsFromMetrics(baseScore: number): number {
    // Heurística simples: usar baseScore como proxy de confirmações
    // baseScore > 75 => 3 confirmações; > 60 => 2; senão 1
    if (baseScore > 75) return 3;
    if (baseScore > 60) return 2;
    return 1;
  }

  getOperationalConfig(): OperationalConfig {
    return {
      ...this.operationalConfig,
      disallowedPatterns: new Set(this.operationalConfig.disallowedPatterns),
      indicatorWeights: { ...this.operationalConfig.indicatorWeights },
    };
  }

  updateOperationalConfig(partial: Partial<OperationalConfig>) {
    if (partial.minTrendStrength !== undefined) this.operationalConfig.minTrendStrength = partial.minTrendStrength;
    if (partial.minSupportResistance !== undefined) this.operationalConfig.minSupportResistance = partial.minSupportResistance;
    if (partial.requireConfirmations !== undefined) this.operationalConfig.requireConfirmations = partial.requireConfirmations;
    if (partial.disallowedPatterns) {
      partial.disallowedPatterns.forEach(p => this.operationalConfig.disallowedPatterns.add(p));
    }
    if (partial.indicatorWeights) {
      Object.entries(partial.indicatorWeights).forEach(([k, v]) => {
        this.operationalConfig.indicatorWeights[k] = v;
      });
    }
  }

  applyOperationalSuggestion(text: string): { applied: boolean; response: string; changes: string[] } {
    const changes: string[] = [];
    const lower = text.toLowerCase();

    // Regras básicas
    const setConfirmations = (n: number) => {
      this.updateOperationalConfig({ requireConfirmations: n });
      changes.push(`Exigir ${n} confirmações`);
    };

    // Detectar confirmações
    if (lower.includes('2 confirma') || lower.includes('duas confirma')) setConfirmations(2);
    else if (lower.includes('3 confirma') || lower.includes('três confirma') || lower.includes('tres confirma')) setConfirmations(3);

    // Detectar padrões a evitar
    const patternKeywords = ['doji', 'hammer', 'shootingstar', 'shooting star', 'strongbullish', 'strongbearish'];
    patternKeywords.forEach(p => {
      if (lower.includes(p)) {
        const norm = p.replace(' ', '');
        this.updateOperationalConfig({ disallowedPatterns: new Set([norm]) });
        changes.push(`Reduzir pontuação do padrão ${norm}`);
      }
    });

    // Detectar pesos de indicadores
    const indicators = ['rsi', 'macd', 'bollinger', 'bbands', 'price action', 'priceaction'];
    indicators.forEach(ind => {
      if (lower.includes('aumentar peso') && lower.includes(ind)) {
        const key = ind === 'bollinger' ? 'bbands' : ind.replace(' ', '');
        this.updateOperationalConfig({ indicatorWeights: { [key]: 5 } });
        changes.push(`Aumentar peso de ${key}`);
      }
      if (lower.includes('reduzir peso') && lower.includes(ind)) {
        const key = ind === 'bollinger' ? 'bbands' : ind.replace(' ', '');
        this.updateOperationalConfig({ indicatorWeights: { [key]: -3 } });
        changes.push(`Reduzir peso de ${key}`);
      }
    });

    // Detectar limites mínimos
    const trend40 = lower.includes('tendência < 40') || lower.includes('tendencia < 40') || lower.includes('tendência menor que 40');
    const sr50 = lower.includes('s/r < 50') || lower.includes('suporte') && lower.includes('50') || lower.includes('resistência') && lower.includes('50');
    if (trend40) { this.updateOperationalConfig({ minTrendStrength: 40 }); changes.push('Evitar entradas com tendência < 40'); }
    if (sr50) { this.updateOperationalConfig({ minSupportResistance: 50 }); changes.push('Evitar entradas com S/R < 50'); }

    const applied = changes.length > 0;
    const response = applied
      ? '✅ Sugestões aplicadas ao operacional.'
      : 'ℹ️ Sugestão recebida, mas não identifiquei regras claras para aplicar automaticamente. Pode detalhar?';
    return { applied, response, changes };
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

  // Continuous learning from web - melhora a IA com conhecimento
  async learnFromWeb(): Promise<void> {
    try {
      // Pesquisa conhecimento relevante
      const context = this.identifyLearningContext();
      
      // Busca insights para cada categoria
      const insights = await webLearningSystem.searchMarketKnowledge(
        context.topic,
        context.keywords
      );

      // Aplica insights aos sinais recentes
      if (this.history.length > 0) {
        const recentSignals = this.history.slice(-10);
        recentSignals.forEach(signal => {
          signal.webInsights = insights;
        });
        this.saveHistory();
      }

      // Faz aprendizado contínuo
      await webLearningSystem.continuousLearning();
    } catch (e) {
      console.error('Erro ao aprender da web:', e);
    }
  }

  // Identifica contexto para aprendizado
  private identifyLearningContext(): { topic: string; keywords: string[] } {
    const winRate = this.getWinRate();
    const patterns = this.learningState.patternSuccessRates;
    
    let topic = 'análise técnica';
    let keywords = [];

    if (winRate < 50) {
      topic = 'padrões de reversão';
      keywords = ['reversão', 'suporte', 'resistência'];
    } else if (this.learningState.bestIndicators.length > 0) {
      topic = `indicadores ${this.learningState.bestIndicators[0]}`;
      keywords = this.learningState.bestIndicators;
    } else {
      topic = 'gerenciamento de risco';
      keywords = ['risco', 'stop', 'money management'];
    }

    return { topic, keywords };
  }

  // Obtém insights aplicáveis para um contexto específico
  getApplicableWebInsights(context: any): MarketInsight[] {
    return webLearningSystem.getApplicableInsights(context);
  }

  // Retorna estatísticas completas com aprendizado web
  getCompleteLearningStats() {
    const webStats = webLearningSystem.getLearningStats();
    return {
      aiLearning: this.learningState,
      webLearning: webStats,
      totalInsightSources: webStats.totalInsightsLearned,
      winRate: this.getWinRate(),
      evolutionPhase: this.learningState.evolutionPhase
    };
  }
}

// Export singleton instance
export const aiLearningSystem = new AILearningSystem();
