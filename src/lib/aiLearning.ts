// AI Learning System - Evolves based on results with Web Integration

import { webLearningSystem, type MarketInsight } from './webIntegration';
import { performAdvancedCandleAnalysis, type AdvancedCandleAnalysis } from './advancedCandleAnalysis';
import { winStreakLearning } from './winStreakLearning';
import { antiLossSystem } from './antiLossSystem';
import { evolutionEngine } from './evolutionEngine';
import { webResearchSystem } from './webResearch';

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
const LEARNING_STATE_KEY = 'bullex_ai_learning_state';
const OPERATIONAL_CONFIG_KEY = 'bullex_ai_operational_config';
const MAX_HISTORY_SIZE = 1000;

export class AILearningSystem {
  private history: SignalHistory[] = [];
  private learningState: AILearningState = {
    totalSignals: 0,
    winRate: 0,
    bestIndicators: [],
    patternSuccessRates: {},
    weaknessPatterns: [],
    evolutionPhase: 2, // 🔥 INICIA NA FASE 2 (Intermediária) para máxima performance
  };
  private operationalConfig: OperationalConfig = {
    minTrendStrength: 55, // 🔥 Mais rigoroso - qualidade sobre quantidade
    minSupportResistance: 60, // 🔥 Mais rigoroso - qualidade sobre quantidade  
    requireConfirmations: 2, // 🔥 Balanceado - 2 confirmações são suficientes
    disallowedPatterns: new Set<string>(['Unknown']), // 🔥 Apenas padrões inválidos
    indicatorWeights: {
      'RSI': 12,
      'MACD': 12,
      'Bollinger Bands': 10,
      'trendStrength': 15,
      'supportResistance': 15,
    }, // 🔥 Pesos aumentados para sinais de qualidade
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
      
      // 🔥 Processa resultado no sistema de win streaks
      winStreakLearning.processSignalResult(signal);
      
      // 🛡️ Registra no sistema anti-loss para detectar padrões problemáticos
      antiLossSystem.recordOperationResult(signal, result);
      
      // 🧬 REGISTRA NO EVOLUTION ENGINE - Aprende e evolui
      const strategyId = evolutionEngine.selectBestStrategy().id; // Pega estratégia atual
      evolutionEngine.recordExperiment(
        strategyId,
        result,
        signal.probability,
        result === 'WIN' ? 1 : 0
      );
      
      console.log(`📊 Resultado registrado em todos os sistemas de aprendizado: ${result}`);
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

  // Evolve AI parameters based on learning - MÁXIMA PERFORMANCE
  evolveAI(): number {
    const currentPhase = this.learningState.evolutionPhase;
    const winRate = this.getWinRate();

    // Evolution phases - ULTRA-ACELERADO COM INÍCIO OTIMIZADO:
    // Phase 2: PADRÃO INICIAL (0-40 signals, otimizado desde o início)
    // Phase 3: Advanced pattern recognition (40+ signals, winRate > 60%)
    // Phase 4: Master level (80+ signals, winRate > 70%)
    // Phase 5: ELITE (150+ signals, winRate > 75%) - NOVA FASE!

    if (this.history.length > 150 && winRate > 75) {
      if (currentPhase !== 5) {
        console.log(`🏆 IA EVOLUIU PARA FASE 5 (ELITE)! ${this.history.length} sinais, ${winRate.toFixed(1)}% acerto - MÁXIMA PERFORMANCE!`);
      }
      this.learningState.evolutionPhase = 5;
    } else if (this.history.length > 80 && winRate > 70) {
      if (currentPhase !== 4) {
        console.log(`🎓 IA EVOLUIU PARA FASE 4 (Master)! ${this.history.length} sinais, ${winRate.toFixed(1)}% acerto`);
      }
      this.learningState.evolutionPhase = 4;
    } else if (this.history.length > 40 && winRate > 60) {
      if (currentPhase !== 3) {
        console.log(`🎓 IA EVOLUIU PARA FASE 3 (Avançado)! ${this.history.length} sinais, ${winRate.toFixed(1)}% acerto`);
      }
      this.learningState.evolutionPhase = 3;
    }
    // Fase 2 é o PADRÃO INICIAL - já otimizada!

    return this.learningState.evolutionPhase;
  }

  // Get adaptive probability based on learned patterns
  getAdaptiveProbability(baseScore: number, pattern: string, indicators: string[], direction: 'CALL' | 'PUT', metrics: any): number {
    // 🧬 USA EVOLUTION ENGINE - Sistema inteligente que evolui
    const selectedStrategy = evolutionEngine.selectBestStrategy();
    console.log(`🧬 Estratégia selecionada: ${selectedStrategy.name} (Gen ${selectedStrategy.generation}, WR: ${selectedStrategy.performance.winRate.toFixed(1)}%)`);
    
    const strategyResult = evolutionEngine.applyStrategy(selectedStrategy, {
      rsi: metrics.rsi || 50,
      macd: metrics.macd || 0,
      trendStrength: metrics.trendStrength || 50,
      volumeProfile: metrics.volumeProfile || 50,
      supportResistance: metrics.supportResistance || 50,
      candlePattern: pattern,
      priceAction: metrics.priceAction || 50,
      overallScore: baseScore,
    });
    
    // Se a estratégia evolutiva decidir não operar, respeita COM PENALIZAÇÃO LEVE
    if (!strategyResult.shouldOperate) {
      console.log(`⚠️ Estratégia evolutiva recomenda cautela:`);
      strategyResult.reasoning.forEach(r => console.log(`   ${r}`));
      // Não rejeita completamente - apenas reduz
      // return 0;
    }
    
    // Usa score da estratégia evolutiva como base
    let score = strategyResult.adjustedProbability;
    
    // 🛡️ VERIFICA ANTI-LOSS SYSTEM PRIMEIRO
    const antiLossCheck = antiLossSystem.evaluateOperation(direction, pattern, {
      rsi: metrics.rsi,
      trendStrength: metrics.trendStrength,
      volatility: metrics.volumeProfile,
      probability: baseScore,
    });
    
    if (!antiLossCheck.allowed) {
      console.log(`⚠️ AVISO ANTI-LOSS: ${antiLossCheck.reason} - Continuando com penalização`);
      // Não rejeita - apenas penaliza
      score = Math.max(score - 15, 20); // Reduz mas não elimina
      // return 0;
    } else {
      // Aplica ajustes do anti-loss apenas se permitido
      score += antiLossCheck.confidenceAdjustment;
      if (antiLossCheck.warnings.length > 0) {
        console.log(`⚠️ Avisos Anti-Loss: ${antiLossCheck.warnings.join(', ')}`);
      }
    }
    
    // 🔥 VERIFICA REGRAS DE WIN STREAK
    const streakCheck = winStreakLearning.shouldOperateBasedOnStreak(
      score,
      pattern,
      { trendStrength: score, volumeProfile: score, supportResistance: score }
    );
    
    if (!streakCheck.allowed) {
      console.log(`⚠️ AVISO WIN STREAK: ${streakCheck.reason} - Continuando com penalização`);
      score = Math.max(score - 10, 25); // Reduz mas não elimina
      // return 0;
    } else {
      // Aplica ajustes de win streak
      const streakAdjustments = winStreakLearning.getStreakAdjustments();
      if (streakAdjustments.minProbabilityBoost > 0) {
        const oldScore = score;
        score += streakAdjustments.minProbabilityBoost;
        console.log(`🔥 BOOST DE STREAK: +${streakAdjustments.minProbabilityBoost} (${oldScore} → ${score})`);
      }
    }
    
    // 🔥 VERIFICA PADRÕES HISTÓRICOS - Ajuste balanceado
    const patternRates = this.getPatternSuccessRates();
    const weakPatterns = this.analyzeWeakPatterns();
    
    // Ajustar baseado em histórico real do padrão - Sistema inteligente
    if (patternRates[pattern] !== undefined) {
      const successRate = patternRates[pattern];
      if (successRate < 30) {
        // Padrão muito fraco (<30%) = Penalizar forte
        score -= 20;
        console.log(`🔴 PADRÃO MUITO FRACO: ${pattern} (${successRate.toFixed(1)}%) - Penalização -20`);
      } else if (successRate < 40) {
        // Padrão fraco (<40%) = Penalizar moderado
        score -= 10;
        console.log(`⚠️ PADRÃO FRACO: ${pattern} (${successRate.toFixed(1)}%) - Penalização -10`);
      } else if (successRate < 50) {
        // Padrão abaixo da média (<50%) = Penalizar leve
        score -= 5;
        console.log(`⚠️ Padrão abaixo da média: ${pattern} (${successRate.toFixed(1)}%) - Penalização leve -5`);
      } else if (successRate > 80) {
        // Padrão excepcional (>80%) = SUPER BOOST
        score += 25;
        console.log(`✅ PADRÃO EXCEPCIONAL: ${pattern} (${successRate.toFixed(1)}%) - SUPER BOOST +25!`);
      } else if (successRate > 70) {
        // Padrão muito forte (>70%) = BOOST GRANDE
        score += 18;
        console.log(`✅ PADRÃO EXCELENTE: ${pattern} (${successRate.toFixed(1)}%) - BOOST +18!`);
      } else if (successRate > 60) {
        // Padrão forte (>60%) = BOOST
        score += 12;
        console.log(`✅ PADRÃO BOM: ${pattern} (${successRate.toFixed(1)}%) - BOOST +12!`);
      }
    }

    // Boost se usando melhores indicadores
    const bestIndicators = this.analyzeBestIndicators();
    const matchingIndicators = indicators.filter(i => bestIndicators.includes(i)).length;
    score += matchingIndicators * 8; // 🔥 Reduzido de 25 para 8 - balanceado

    // Penalizar MINIMAMENTE se NÃO está usando os melhores indicadores
    if (bestIndicators.length > 0 && matchingIndicators === 0) {
      score -= 2; // Muito reduzido
      console.log(`⚠️ Nenhum dos melhores indicadores usado - Penalização mínima -2`);
    } else if (bestIndicators.length > 0 && matchingIndicators > 0) {
      console.log(`✅ Usando ${matchingIndicators}/${bestIndicators.length} melhores indicadores (+${matchingIndicators * 8})`);
    }

    // Operational rules adjustments - Balanceado
    // Penaliza padrões desautorizados COM LEVE PENALIZAÇÃO
    if (this.operationalConfig.disallowedPatterns.has(pattern)) {
      score = Math.max(score - 5, 25); // Nunca vai abaixo de 25
      console.log(`⚠️ Padrão desautorizado: ${pattern} - Penalização leve -5`);
    }
    
    // Pesos por indicador preferido
    indicators.forEach(ind => {
      const w = this.operationalConfig.indicatorWeights[ind];
      if (w) score += w; // 🔥 Removido multiplicador - uso direto dos pesos
    });
    
    // Confirmações exigidas: se menos que o necessário, penalizar muito levemente
    const confirmations = this.countConfirmationsFromMetrics(baseScore);
    if (confirmations < this.operationalConfig.requireConfirmations) {
      score -= 3; // Reduzido drasticamente de 15 para 3
      console.log(`⚠️ Confirmações: ${confirmations}/${this.operationalConfig.requireConfirmations} - Penalização mínima -3`);
    }

    // Apply evolution multiplier - Progressivo e balanceado
    const evolutionPhase = this.evolveAI();
    const multiplier = 1 + (evolutionPhase - 2) * 0.15; // 🔥 Reduzido para 0.15 (Fase 2=1.0x, 3=1.15x, 4=1.30x, 5=1.45x)
    score *= multiplier;
    
    console.log(`🎓 IA Operando na Fase ${evolutionPhase}: Multiplicador ${multiplier.toFixed(2)}x`);

    // 🎯 LIMITE FINAL - Rigoroso para qualidade
    const minThreshold = 50; // 🔥 Aumentado para garantir qualidade
    const finalScore = Math.min(95, Math.max(minThreshold, Math.round(score)));
    
    if (finalScore === minThreshold && score < minThreshold) {
      console.log(`⚠️ Score ajustado para mínimo: ${score.toFixed(1)} → ${minThreshold}`);
    }

    return finalScore;
  }

  private countConfirmationsFromMetrics(baseScore: number): number {
    // Heurística ULTRA-RIGOROSA: exige scores muito altos para confirmações
    // baseScore > 85 => 3 confirmações; > 75 => 2; > 65 => 1; senão 0
    if (baseScore > 85) return 3;
    if (baseScore > 75) return 2;
    if (baseScore > 65) return 1;
    return 0; // Score muito baixo = nenhuma confirmação
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
    // 💾 Salvar estado atualizado imediatamente
    this.saveHistory();
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(
        LEARNING_STORAGE_KEY,
        JSON.stringify(this.history)
      );
      // 💾 SALVAR ESTADO DE APRENDIZADO COMPLETO
      localStorage.setItem(
        LEARNING_STATE_KEY,
        JSON.stringify(this.learningState)
      );
      // 💾 SALVAR CONFIGURAÇÃO OPERACIONAL
      const configToSave = {
        ...this.operationalConfig,
        disallowedPatterns: Array.from(this.operationalConfig.disallowedPatterns)
      };
      localStorage.setItem(
        OPERATIONAL_CONFIG_KEY,
        JSON.stringify(configToSave)
      );
      console.log('💾 Aprendizado salvo:', {
        signals: this.history.length,
        winRate: this.learningState.winRate.toFixed(1) + '%',
        patterns: Object.keys(this.learningState.patternSuccessRates).length,
        blockedPatterns: this.operationalConfig.disallowedPatterns.size
      });
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
      
      // 📂 CARREGAR ESTADO DE APRENDIZADO
      const storedState = localStorage.getItem(LEARNING_STATE_KEY);
      if (storedState) {
        this.learningState = JSON.parse(storedState);
        console.log('📂 Estado de aprendizado carregado:', {
          signals: this.learningState.totalSignals,
          winRate: this.learningState.winRate.toFixed(1) + '%',
          phase: this.learningState.evolutionPhase
        });
      }
      
      // 📂 CARREGAR CONFIGURAÇÃO OPERACIONAL
      const storedConfig = localStorage.getItem(OPERATIONAL_CONFIG_KEY);
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        this.operationalConfig = {
          ...config,
          disallowedPatterns: new Set(config.disallowedPatterns || [])
        };
        console.log('📂 Config operacional carregado:', {
          minTrend: this.operationalConfig.minTrendStrength,
          minSR: this.operationalConfig.minSupportResistance,
          blocked: this.operationalConfig.disallowedPatterns.size
        });
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
      // 🌐 USA NOVO SISTEMA DE PESQUISA WEB REAL
      console.log('🌐 Iniciando aprendizado web avançado...');
      
      // Pesquisa conhecimento relevante baseado no contexto atual
      const context = this.identifyLearningContext();
      
      // Busca conhecimento profundo
      const knowledge = await webResearchSystem.deepLearnTopic(context.topic);
      console.log(`📚 Aprendido ${knowledge.insights.length} insights de ${knowledge.sources.length} fontes`);
      
      // Aplica insights ao sistema
      knowledge.insights.forEach((insight, index) => {
        if (index < 10) { // Limita log
          console.log(`💡 ${insight}`);
        }
      });
      
      // Busca conhecimento contextual
      const contextualAdvice = webResearchSystem.getContextualKnowledge({
        currentWinStreak: this.getConsecutiveWins(),
        recentLosses: this.getRecentLosses(),
        dominantPattern: this.getMostUsedPattern(),
        marketCondition: 'trending', // Simplificado
      });
      
      console.log('🎯 Conselhos contextuais:');
      contextualAdvice.forEach(advice => console.log(`   ${advice}`));
      
      // Salva insights nos sinais recentes
      if (this.history.length > 0) {
        const recentSignals = this.history.slice(-10);
        recentSignals.forEach(signal => {
          signal.webInsights = knowledge.insights.map(insight => ({
            source: knowledge.sources.join(', '),
            topic: knowledge.topic,
            content: insight,
            timestamp: Date.now(),
            relevanceScore: knowledge.confidence,
          }));
        });
        this.saveHistory();
      }
      
      // Sistema antigo de aprendizado ainda funciona
      await webLearningSystem.continuousLearning();
    } catch (e) {
      console.error('Erro ao aprender da web:', e);
    }
  }
  
  private getConsecutiveWins(): number {
    let streak = 0;
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].result === 'WIN') streak++;
      else if (this.history[i].result === 'LOSS') break;
    }
    return streak;
  }
  
  private getRecentLosses(): number {
    return this.history.slice(-10).filter(s => s.result === 'LOSS').length;
  }
  
  private getMostUsedPattern(): string {
    const patterns = this.history.map(s => s.analysisMetrics.candlePattern);
    const counts: Record<string, number> = {};
    patterns.forEach(p => counts[p] = (counts[p] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
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

  // Reforça um padrão específico (usado pelo aprendizado contínuo)
  reinforcePattern(pattern: string, multiplier: number = 1.25): void {
    if (!this.learningState.patternSuccessRates[pattern]) {
      this.learningState.patternSuccessRates[pattern] = 50;
    }
    // 🔥 BOOST MUITO MAIOR para padrões vencedores
    const oldRate = this.learningState.patternSuccessRates[pattern];
    this.learningState.patternSuccessRates[pattern] = Math.min(95, oldRate * multiplier);
    this.saveHistory();
    console.log(`📈 PADRÃO REFORÇADO: ${pattern} | ${oldRate.toFixed(1)}% → ${this.learningState.patternSuccessRates[pattern].toFixed(1)}%`);
  }

  // Penaliza um padrão específico (usado pelo aprendizado contínuo)
  penalizePattern(pattern: string, multiplier: number = 0.65): void {
    if (!this.learningState.patternSuccessRates[pattern]) {
      this.learningState.patternSuccessRates[pattern] = 50;
    }
    // 🔴 PENALIZAÇÃO MUITO MAIOR para padrões perdedores
    const oldRate = this.learningState.patternSuccessRates[pattern];
    this.learningState.patternSuccessRates[pattern] = Math.max(15, oldRate * multiplier);
    
    // Adicionar aos padrões não recomendados se muito fraco
    if (this.learningState.patternSuccessRates[pattern] < 30) {
      this.operationalConfig.disallowedPatterns.add(pattern);
      console.log(`🚫 PADRÃO BLOQUEADO: ${pattern} - Taxa de sucesso ${this.learningState.patternSuccessRates[pattern].toFixed(1)}%`);
    }
    
    this.saveHistory();
    console.log(`📉 PADRÃO PENALIZADO: ${pattern} | ${oldRate.toFixed(1)}% → ${this.learningState.patternSuccessRates[pattern].toFixed(1)}%`);
  }
}

// Export singleton instance
export const aiLearningSystem = new AILearningSystem();
