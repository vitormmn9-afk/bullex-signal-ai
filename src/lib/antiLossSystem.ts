/**
 * 🛡️ Sistema Anti-Loss - Validação Inteligente de Operações
 * 
 * Ao invés de inverter sinais, este sistema:
 * 1. Identifica padrões de perda recorrentes
 * 2. Ajusta confiança baseado em contexto histórico
 * 3. BLOQUEIA operações em condições de alto risco
 * 4. Aprende com erros sem simplesmente inverter
 */

import { aiLearningSystem, type SignalHistory } from './aiLearning';

export interface LossPattern {
  pattern: string;
  direction: 'CALL' | 'PUT';
  contextHash: string; // hash do contexto (horário, volatilidade, tendência)
  consecutiveLosses: number;
  totalAttempts: number;
  lastOccurrence: number;
  avgProbability: number;
  conditions: {
    rsiRange: [number, number];
    trendRange: [number, number];
    volatilityLevel: 'low' | 'medium' | 'high';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

export interface RiskAssessment {
  allowed: boolean;
  reason: string;
  confidenceAdjustment: number; // quanto ajustar a confiança (-50 a +20)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
}

class AntiLossSystem {
  private lossPatterns: Map<string, LossPattern> = new Map();
  private readonly STORAGE_KEY = 'anti_loss_patterns';
  private readonly MIN_CONSECUTIVE_LOSSES = 1; // 🔥 Aprende ULTRA-RÁPIDO (1 perda já alerta)
  private readonly CRITICAL_LOSS_THRESHOLD = 1; // 🔥 1 perda = BLOQUEAR (máximo rigor)
  private readonly PATTERN_EXPIRY_HOURS = 24; // Padrões expiram em 24h

  constructor() {
    this.loadPatterns();
  }

  /**
   * Avalia se uma operação deve ser permitida baseado em histórico de perdas
   */
  evaluateOperation(
    direction: 'CALL' | 'PUT',
    pattern: string,
    metrics: {
      rsi: number;
      trendStrength: number;
      volatility: number;
      probability: number;
    }
  ): RiskAssessment {
    const assessment: RiskAssessment = {
      allowed: true,
      reason: '',
      confidenceAdjustment: 0,
      riskLevel: 'low',
      warnings: [],
    };

    // 1. Verifica padrões de perda similares
    const context = this.buildContextHash(metrics);
    const patternKey = `${pattern}_${direction}_${context}`;
    const lossPattern = this.lossPatterns.get(patternKey);

    if (lossPattern) {
      const timeSinceLastLoss = Date.now() - lossPattern.lastOccurrence;
      const hoursElapsed = timeSinceLastLoss / (1000 * 60 * 60);

      // Padrão ainda válido (não expirou)
      if (hoursElapsed < this.PATTERN_EXPIRY_HOURS) {
        const lossRate = lossPattern.consecutiveLosses / lossPattern.totalAttempts;

        // 🚫 CRÍTICO: 1+ perda = BLOQUEAR IMEDIATAMENTE (MÁXIMO RIGOR)
        if (lossPattern.consecutiveLosses >= this.CRITICAL_LOSS_THRESHOLD) {
          assessment.allowed = false;
          assessment.reason = `BLOQUEADO: ${lossPattern.consecutiveLosses} perda(s) neste padrão (Bloqueio após 1ª perda)`;
          assessment.riskLevel = 'critical';
          assessment.confidenceAdjustment = -100;
          console.log(`🚫 OPERAÇÃO BLOQUEADA: ${pattern} ${direction}`);
          console.log(`   Perdas: ${lossPattern.consecutiveLosses}`);
          console.log(`   Taxa de perda: ${(lossRate * 100).toFixed(1)}%`);
          return assessment;
        }

        // ⚠️ ALTO RISCO: fallback para garantir bloqueio
        if (lossPattern.consecutiveLosses >= this.MIN_CONSECUTIVE_LOSSES) {
          assessment.riskLevel = 'critical';
          assessment.confidenceAdjustment = -100;
          assessment.warnings.push(
            `Padrão com ${lossPattern.consecutiveLosses} perda(s) - BLOQUEADO`
          );
          console.log(`🚨 RISCO CRÍTICO: ${pattern} ${direction} (${lossPattern.consecutiveLosses} perdas)`);
        }

        // Taxa de perda alta (>60%)
        if (lossRate > 0.6) {
          assessment.confidenceAdjustment -= 30;
          assessment.warnings.push(`Taxa de perda: ${(lossRate * 100).toFixed(0)}%`);
        }
      }
    }

    // 2. Verifica condições de mercado problemáticas
    const marketRisk = this.assessMarketConditions(metrics);
    if (marketRisk.warnings.length > 0) {
      assessment.warnings.push(...marketRisk.warnings);
      assessment.confidenceAdjustment += marketRisk.adjustment;
      
      if (marketRisk.critical) {
        assessment.riskLevel = 'critical';
      } else if (assessment.riskLevel === 'low' && marketRisk.adjustment < -20) {
        assessment.riskLevel = 'medium';
      }
    }

    // 3. Verifica histórico geral do padrão (sem contexto específico)
    const generalPattern = this.getGeneralPatternStats(pattern, direction);
    if (generalPattern.lossRate > 0.65 && generalPattern.count >= 5) {
      assessment.confidenceAdjustment -= 25;
      assessment.warnings.push(
        `Padrão ${pattern} tem ${(generalPattern.lossRate * 100).toFixed(0)}% de perda`
      );
    }

    // 4. Decisão final
    if (assessment.confidenceAdjustment <= -50) {
      assessment.allowed = false;
      assessment.reason = 'Confiança insuficiente após ajustes de risco';
    }

    // Log detalhado
    if (assessment.warnings.length > 0) {
      console.log(`🛡️ Anti-Loss Check: ${pattern} ${direction}`);
      console.log(`   Ajuste: ${assessment.confidenceAdjustment}`);
      console.log(`   Avisos: ${assessment.warnings.join(', ')}`);
    }

    return assessment;
  }

  /**
   * Registra resultado de operação para aprendizado
   */
  recordOperationResult(
    signal: SignalHistory,
    result: 'WIN' | 'LOSS'
  ): void {
    const context = this.buildContextHash({
      rsi: signal.analysisMetrics.rsi,
      trendStrength: signal.analysisMetrics.trendStrength,
      volatility: signal.analysisMetrics.volumeProfile,
      probability: signal.probability,
    });

    const patternKey = `${signal.analysisMetrics.candlePattern}_${signal.direction}_${context}`;
    let lossPattern = this.lossPatterns.get(patternKey);

    if (!lossPattern) {
      lossPattern = {
        pattern: signal.analysisMetrics.candlePattern,
        direction: signal.direction,
        contextHash: context,
        consecutiveLosses: 0,
        totalAttempts: 0,
        lastOccurrence: Date.now(),
        avgProbability: signal.probability,
        conditions: this.extractConditions(signal.analysisMetrics),
      };
    }

    lossPattern.totalAttempts++;
    lossPattern.lastOccurrence = Date.now();

    if (result === 'LOSS') {
      lossPattern.consecutiveLosses++;
      console.log(`📉 PERDA REGISTRADA: ${patternKey}`);
      console.log(`   Perdas consecutivas: ${lossPattern.consecutiveLosses}`);
      
      // 🔥 Penaliza o padrão no sistema principal
      if (lossPattern.consecutiveLosses >= 2) {
        const penalty = 0.15 * lossPattern.consecutiveLosses; // 15% por perda
        aiLearningSystem.penalizePattern(signal.analysisMetrics.candlePattern, penalty);
        console.log(`   → Penalidade aplicada: ${(penalty * 100).toFixed(0)}%`);
      }
    } else {
      // WIN reseta contador de perdas consecutivas
      lossPattern.consecutiveLosses = 0;
      console.log(`✅ VITÓRIA: ${patternKey} - Reset de perdas consecutivas`);
    }

    this.lossPatterns.set(patternKey, lossPattern);
    this.savePatterns();

    // Limpa padrões expirados
    this.cleanExpiredPatterns();
  }

  /**
   * Constrói hash de contexto para agrupamento
   */
  private buildContextHash(metrics: {
    rsi: number;
    trendStrength: number;
    volatility: number;
    probability: number;
  }): string {
    // Agrupa RSI em faixas
    const rsiBucket = metrics.rsi < 30 ? 'oversold' : 
                     metrics.rsi > 70 ? 'overbought' : 'neutral';
    
    // Agrupa tendência
    const trendBucket = metrics.trendStrength < 40 ? 'weak' :
                       metrics.trendStrength < 60 ? 'medium' : 'strong';
    
    // Agrupa volatilidade
    const volBucket = metrics.volatility < 40 ? 'low' :
                     metrics.volatility < 70 ? 'medium' : 'high';
    
    // Horário do dia
    const hour = new Date().getHours();
    const timeBucket = hour < 12 ? 'morning' :
                      hour < 18 ? 'afternoon' :
                      hour < 22 ? 'evening' : 'night';

    return `${rsiBucket}_${trendBucket}_${volBucket}_${timeBucket}`;
  }

  /**
   * Avalia condições gerais de mercado
   */
  private assessMarketConditions(metrics: {
    rsi: number;
    trendStrength: number;
    volatility: number;
    probability: number;
  }): { warnings: string[]; adjustment: number; critical: boolean } {
    const warnings: string[] = [];
    let adjustment = 0;
    let critical = false;

    // RSI extremo sem tendência forte
    if ((metrics.rsi < 30 || metrics.rsi > 70) && metrics.trendStrength < 50) {
      warnings.push('RSI extremo sem confirmação de tendência');
      adjustment -= 20;
    }

    // Volatilidade muito baixa
    if (metrics.volatility < 30) {
      warnings.push('Volatilidade muito baixa');
      adjustment -= 15;
    }

    // Tendência fraca + baixa probabilidade
    if (metrics.trendStrength < 40 && metrics.probability < 70) {
      warnings.push('Tendência fraca com baixa probabilidade');
      adjustment -= 25;
      critical = true;
    }

    // Horário de risco (OTC noite/madrugada)
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      warnings.push('Horário de alto risco (OTC noite/madrugada)');
      adjustment -= 10;
    }

    return { warnings, adjustment, critical };
  }

  /**
   * Obtém estatísticas gerais de um padrão
   */
  private getGeneralPatternStats(pattern: string, direction: 'CALL' | 'PUT'): {
    lossRate: number;
    count: number;
  } {
    const history = aiLearningSystem.getHistory();
    const relevant = history.filter(
      s => s.analysisMetrics.candlePattern === pattern &&
           s.direction === direction &&
           (s.result === 'WIN' || s.result === 'LOSS')
    );

    if (relevant.length === 0) return { lossRate: 0, count: 0 };

    const losses = relevant.filter(s => s.result === 'LOSS').length;
    return {
      lossRate: losses / relevant.length,
      count: relevant.length,
    };
  }

  /**
   * Extrai condições do sinal
   */
  private extractConditions(metrics: any): LossPattern['conditions'] {
    const hour = new Date().getHours();
    return {
      rsiRange: [Math.floor(metrics.rsi / 10) * 10, Math.ceil(metrics.rsi / 10) * 10],
      trendRange: [Math.floor(metrics.trendStrength / 20) * 20, Math.ceil(metrics.trendStrength / 20) * 20],
      volatilityLevel: metrics.volumeProfile < 40 ? 'low' :
                       metrics.volumeProfile < 70 ? 'medium' : 'high',
      timeOfDay: hour < 12 ? 'morning' :
                 hour < 18 ? 'afternoon' :
                 hour < 22 ? 'evening' : 'night',
    };
  }

  /**
   * Remove padrões expirados
   */
  private cleanExpiredPatterns(): void {
    const now = Date.now();
    const expiryMs = this.PATTERN_EXPIRY_HOURS * 60 * 60 * 1000;
    
    for (const [key, pattern] of this.lossPatterns.entries()) {
      if (now - pattern.lastOccurrence > expiryMs) {
        this.lossPatterns.delete(key);
      }
    }
  }

  /**
   * Obtém estatísticas do sistema
   */
  getStats(): {
    totalPatterns: number;
    blockedPatterns: number;
    highRiskPatterns: number;
    avgConsecutiveLosses: number;
  } {
    const patterns = Array.from(this.lossPatterns.values());
    return {
      totalPatterns: patterns.length,
      blockedPatterns: patterns.filter(p => p.consecutiveLosses >= this.CRITICAL_LOSS_THRESHOLD).length,
      highRiskPatterns: patterns.filter(p => p.consecutiveLosses >= this.MIN_CONSECUTIVE_LOSSES).length,
      avgConsecutiveLosses: patterns.reduce((sum, p) => sum + p.consecutiveLosses, 0) / (patterns.length || 1),
    };
  }

  /**
   * Obtém padrões bloqueados atualmente
   */
  getBlockedPatterns(): LossPattern[] {
    return Array.from(this.lossPatterns.values())
      .filter(p => p.consecutiveLosses >= this.CRITICAL_LOSS_THRESHOLD)
      .sort((a, b) => b.consecutiveLosses - a.consecutiveLosses);
  }

  // Persistência
  private savePatterns(): void {
    try {
      const data = Array.from(this.lossPatterns.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar anti-loss patterns:', error);
    }
  }

  private loadPatterns(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const entries = JSON.parse(data);
        this.lossPatterns = new Map(entries);
        console.log(`🛡️ Anti-Loss System carregado: ${this.lossPatterns.size} padrões`);
      }
    } catch (error) {
      console.error('Erro ao carregar anti-loss patterns:', error);
    }
  }

  /**
   * Reset manual (para testes)
   */
  reset(): void {
    this.lossPatterns.clear();
    this.savePatterns();
    console.log('🔄 Anti-Loss System resetado');
  }
}

// Singleton
export const antiLossSystem = new AntiLossSystem();
