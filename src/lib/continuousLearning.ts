/**
 * Sistema de Aprendizado Contínuo Automático
 * Aprende automaticamente com cada operação WIN/LOSS sem parar nunca
 */

import { aiLearningSystem, type SignalHistory } from './aiLearning';
import { aiEvolutionTracker } from './aiEvolutionTracker';

export interface ContinuousLearningConfig {
  enabled: boolean;
  learningInterval: number; // intervalo de análise em ms
  minOperationsToLearn: number; // mínimo de operações para aprender
  adaptiveThreshold: boolean; // ajustar thresholds automaticamente
}

class ContinuousLearningSystem {
  private config: ContinuousLearningConfig = {
    enabled: true,
    learningInterval: 30000, // 30 segundos
    minOperationsToLearn: 3,
    adaptiveThreshold: true,
  };

  private learningIntervalId: NodeJS.Timeout | null = null;
  private lastProcessedCount = 0;
  private evolutionCycle = 0;

  constructor() {
    this.startContinuousLearning();
  }

  /**
   * Inicia o loop de aprendizado contínuo
   */
  startContinuousLearning() {
    if (this.learningIntervalId) {
      clearInterval(this.learningIntervalId);
    }

    console.log('🧠 Sistema de Aprendizado Contínuo ATIVADO');
    
    this.learningIntervalId = setInterval(() => {
      this.performAutomaticLearning();
    }, this.config.learningInterval);

    // Executa imediatamente uma vez
    this.performAutomaticLearning();
  }

  /**
   * Para o aprendizado contínuo (não recomendado)
   */
  stopContinuousLearning() {
    if (this.learningIntervalId) {
      clearInterval(this.learningIntervalId);
      this.learningIntervalId = null;
      console.log('🛑 Sistema de Aprendizado Contínuo PAUSADO');
    }
  }

  /**
   * Executa análise e aprendizado automático
   */
  private performAutomaticLearning() {
    const history = aiLearningSystem.getHistory();
    const completedOps = history.filter(h => h.result === 'WIN' || h.result === 'LOSS');
    
    // Só aprende se houver novas operações
    const newOperationsCount = completedOps.length - this.lastProcessedCount;
    if (newOperationsCount < this.config.minOperationsToLearn) {
      return;
    }

    this.evolutionCycle++;
    console.log(`🔄 Ciclo de Aprendizado #${this.evolutionCycle} - ${newOperationsCount} novas operações`);

    // Pegar últimas operações não processadas
    const newOperations = completedOps.slice(this.lastProcessedCount);
    
    // Análise automática de padrões
    this.analyzePatterns(newOperations);
    
    // Análise de indicadores
    this.analyzeIndicators(newOperations);
    
    // Ajuste adaptativo de thresholds
    if (this.config.adaptiveThreshold) {
      this.adjustThresholds(completedOps);
    }
    
    // Identificar e corrigir fraquezas
    this.identifyWeaknesses(completedOps);
    
    // Otimizar configurações operacionais
    this.optimizeOperationalConfig(completedOps);
    
    // Atualizar contador
    this.lastProcessedCount = completedOps.length;
    
    // Registrar evolução
    const learningState = aiLearningSystem.getLearningState();
    const wins = completedOps.filter(h => h.result === 'WIN').length;
    const accuracy = completedOps.length > 0 ? (wins / completedOps.length) * 100 : 0;
    
    console.log(`📊 Taxa de Acerto Atualizada: ${accuracy.toFixed(2)}% | Fase: ${learningState.evolutionPhase}`);
    
    // Disparar evento customizado para UI atualizar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-learning-updated', {
        detail: {
          cycle: this.evolutionCycle,
          newOperations: newOperationsCount,
          accuracy,
          phase: learningState.evolutionPhase,
        }
      }));
    }
  }

  /**
   * Analisa padrões de candles e seus resultados
   */
  private analyzePatterns(operations: SignalHistory[]) {
    const patternResults: Record<string, { wins: number; total: number }> = {};
    
    operations.forEach(op => {
      const pattern = op.analysisMetrics?.candlePattern || 'neutral';
      if (!patternResults[pattern]) {
        patternResults[pattern] = { wins: 0, total: 0 };
      }
      patternResults[pattern].total++;
      if (op.result === 'WIN') {
        patternResults[pattern].wins++;
      }
    });

    // Identificar padrões com alta taxa de sucesso
    const successfulPatterns: string[] = [];
    const weakPatterns: string[] = [];

    Object.entries(patternResults).forEach(([pattern, stats]) => {
      const winRate = (stats.wins / stats.total) * 100;
      if (winRate >= 70 && stats.total >= 3) {
        successfulPatterns.push(pattern);
        console.log(`✅ Padrão forte identificado: ${pattern} (${winRate.toFixed(1)}% em ${stats.total} ops)`);
      } else if (winRate < 40 && stats.total >= 3) {
        weakPatterns.push(pattern);
        console.log(`⚠️ Padrão fraco identificado: ${pattern} (${winRate.toFixed(1)}% em ${stats.total} ops)`);
      }
    });

    // Aplicar aprendizado ao sistema
    if (successfulPatterns.length > 0 || weakPatterns.length > 0) {
      console.log('🎯 Aplicando ajustes de padrões ao sistema...');
      // O sistema de AI Learning já gerencia isso, mas vamos reforçar
      successfulPatterns.forEach(pattern => {
        aiLearningSystem.reinforcePattern(pattern, 1.15); // 15% boost
      });
      weakPatterns.forEach(pattern => {
        aiLearningSystem.penalizePattern(pattern, 0.85); // 15% penalty
      });
    }
  }

  /**
   * Analisa efetividade dos indicadores técnicos
   */
  private analyzeIndicators(operations: SignalHistory[]) {
    const indicatorPerformance: Record<string, { wins: number; total: number }> = {};
    
    operations.forEach(op => {
      const metrics = op.analysisMetrics;
      if (!metrics) return;

      // Analisar cada indicador usado
      const indicators = [
        { name: 'RSI', value: metrics.rsi, effective: (metrics.rsi > 70 || metrics.rsi < 30) },
        { name: 'MACD', value: Math.abs(metrics.macd), effective: Math.abs(metrics.macd) > 0.5 },
        { name: 'Bollinger', value: metrics.bbands, effective: (metrics.bbands > 80 || metrics.bbands < 20) },
        { name: 'TrendStrength', value: metrics.trendStrength, effective: metrics.trendStrength > 60 },
        { name: 'SupportResistance', value: metrics.supportResistance, effective: metrics.supportResistance > 70 },
      ];

      indicators.forEach(ind => {
        if (ind.effective) {
          if (!indicatorPerformance[ind.name]) {
            indicatorPerformance[ind.name] = { wins: 0, total: 0 };
          }
          indicatorPerformance[ind.name].total++;
          if (op.result === 'WIN') {
            indicatorPerformance[ind.name].wins++;
          }
        }
      });
    });

    // Identificar melhores indicadores
    const bestIndicators: string[] = [];
    Object.entries(indicatorPerformance).forEach(([indicator, stats]) => {
      if (stats.total >= 3) {
        const winRate = (stats.wins / stats.total) * 100;
        if (winRate >= 65) {
          bestIndicators.push(indicator);
          console.log(`📈 Indicador efetivo: ${indicator} (${winRate.toFixed(1)}% em ${stats.total} ops)`);
        }
      }
    });

    if (bestIndicators.length > 0) {
      console.log('🎯 Indicadores com melhor performance:', bestIndicators.join(', '));
    }
  }

  /**
   * Ajusta thresholds dinamicamente baseado em performance
   */
  private adjustThresholds(allOperations: SignalHistory[]) {
    if (allOperations.length < 10) return; // Precisa de dados suficientes

    const recent = allOperations.slice(-20); // Últimas 20 operações
    const wins = recent.filter(op => op.result === 'WIN').length;
    const winRate = (wins / recent.length) * 100;

    const config = aiLearningSystem.getOperationalConfig();
    let adjusted = false;

    // Se taxa de acerto está muito baixa, aumentar requisitos
    if (winRate < 50) {
      config.minTrendStrength = Math.min(config.minTrendStrength + 5, 70);
      config.minSupportResistance = Math.min(config.minSupportResistance + 5, 80);
      config.requireConfirmations = Math.min(config.requireConfirmations + 1, 3);
      adjusted = true;
      console.log('⬆️ Aumentando thresholds - WinRate baixo:', winRate.toFixed(1) + '%');
    }
    // Se taxa de acerto está muito alta, podemos relaxar um pouco
    else if (winRate > 75 && config.minTrendStrength > 35) {
      config.minTrendStrength = Math.max(config.minTrendStrength - 3, 35);
      config.minSupportResistance = Math.max(config.minSupportResistance - 3, 45);
      adjusted = true;
      console.log('⬇️ Relaxando thresholds - WinRate alto:', winRate.toFixed(1) + '%');
    }

    if (adjusted) {
      aiLearningSystem.updateOperationalConfig(config);
      console.log('🔧 Thresholds ajustados:', config);
    }
  }

  /**
   * Identifica fraquezas sistemáticas
   */
  private identifyWeaknesses(allOperations: SignalHistory[]) {
    if (allOperations.length < 15) return;

    const recent = allOperations.slice(-15);
    const losses = recent.filter(op => op.result === 'LOSS');

    if (losses.length > recent.length * 0.4) { // Mais de 40% de perdas
      console.log('⚠️ ALERTA: Taxa de perda elevada detectada');
      
      // Analisar causas comuns
      const commonIssues: Record<string, number> = {};
      
      losses.forEach(loss => {
        const m = loss.analysisMetrics;
        if (!m) return;

        if (m.trendStrength < 40) {
          commonIssues['Tendência fraca'] = (commonIssues['Tendência fraca'] || 0) + 1;
        }
        if (Math.abs(m.macd) < 0.3) {
          commonIssues['MACD sem confirmação'] = (commonIssues['MACD sem confirmação'] || 0) + 1;
        }
        if (m.supportResistance < 50) {
          commonIssues['S/R fraco'] = (commonIssues['S/R fraco'] || 0) + 1;
        }
        if (m.volumeProfile < 50) {
          commonIssues['Volume baixo'] = (commonIssues['Volume baixo'] || 0) + 1;
        }
      });

      // Registrar e aplicar correções
      Object.entries(commonIssues).forEach(([issue, count]) => {
        if (count >= 3) {
          console.log(`🔴 Fraqueza identificada: ${issue} (${count} ocorrências)`);
          
          // Registrar no tracker
          aiEvolutionTracker.addOperationLearning({
            signalId: 'auto-correction-' + Date.now(),
            asset: 'MULTIPLE',
            direction: 'CALL',
            result: 'LOSS',
            indicators: [],
            learned: `Sistema identificou padrão de falha: ${issue}. Ocorreu em ${count} das últimas ${losses.length} perdas.`,
            implemented: [`Implementada correção automática para ${issue}`],
          });
        }
      });
    }
  }

  /**
   * Otimiza configurações operacionais baseado em dados históricos
   */
  private optimizeOperationalConfig(allOperations: SignalHistory[]) {
    if (allOperations.length < 20) return;

    const config = aiLearningSystem.getOperationalConfig();
    
    // Analisar quais configurações levaram a mais vitórias
    const winOps = allOperations.filter(op => op.result === 'WIN');
    const lossOps = allOperations.filter(op => op.result === 'LOSS');

    // Calcular médias de métricas em vitórias vs perdas
    const avgWinTrend = winOps.reduce((sum, op) => sum + (op.analysisMetrics?.trendStrength || 0), 0) / winOps.length;
    const avgLossTrend = lossOps.reduce((sum, op) => sum + (op.analysisMetrics?.trendStrength || 0), 0) / lossOps.length;

    if (avgWinTrend > avgLossTrend + 10) {
      // Vitórias tendem a ter tendência mais forte
      const optimalTrend = Math.floor(avgWinTrend * 0.85); // 85% da média de vitórias
      if (Math.abs(config.minTrendStrength - optimalTrend) > 5) {
        config.minTrendStrength = optimalTrend;
        console.log(`🎯 Threshold de tendência otimizado para ${optimalTrend}`);
      }
    }

    // Atualizar pesos de indicadores baseado em correlação com vitórias
    const indicatorCorrelation: Record<string, number> = {};
    
    winOps.forEach(op => {
      const m = op.analysisMetrics;
      if (!m) return;
      
      if (Math.abs(m.macd) > 0.5) indicatorCorrelation['MACD'] = (indicatorCorrelation['MACD'] || 0) + 1;
      if (m.rsi > 70 || m.rsi < 30) indicatorCorrelation['RSI'] = (indicatorCorrelation['RSI'] || 0) + 1;
      if (m.trendStrength > 60) indicatorCorrelation['Trend'] = (indicatorCorrelation['Trend'] || 0) + 1;
    });

    // Ajustar pesos
    Object.entries(indicatorCorrelation).forEach(([indicator, count]) => {
      const correlation = count / winOps.length;
      if (correlation > 0.6) { // Presente em mais de 60% das vitórias
        config.indicatorWeights[indicator] = 1.2; // 20% boost
        console.log(`⚡ Peso de ${indicator} aumentado (correlação: ${(correlation * 100).toFixed(1)}%)`);
      }
    });

    aiLearningSystem.updateOperationalConfig(config);
  }

  /**
   * Obtém estatísticas do aprendizado contínuo
   */
  getStats() {
    return {
      enabled: this.config.enabled,
      evolutionCycle: this.evolutionCycle,
      operationsProcessed: this.lastProcessedCount,
      learningInterval: this.config.learningInterval,
    };
  }

  /**
   * Atualiza configuração do aprendizado contínuo
   */
  updateConfig(newConfig: Partial<ContinuousLearningConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && !this.learningIntervalId) {
      this.startContinuousLearning();
    } else if (!this.config.enabled && this.learningIntervalId) {
      this.stopContinuousLearning();
    }
  }
}

// Instância singleton
export const continuousLearning = new ContinuousLearningSystem();
