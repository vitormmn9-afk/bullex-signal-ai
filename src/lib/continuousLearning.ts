/**
 * Sistema de Aprendizado Contínuo Automático
 * Aprende automaticamente com cada operação WIN/LOSS sem parar nunca
 */

import { aiLearningSystem, type SignalHistory } from './aiLearning';
import { aiEvolutionTracker } from './aiEvolutionTracker';
import { winStreakLearning } from './winStreakLearning';

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
    
    // 🔥 OTIMIZAR PARA WIN STREAKS
    this.optimizeForWinStreaks(completedOps);
    
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
   * Analisa padrões de candles e seus resultados - MUITO MAIS AGRESSIVO
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
    const criticallyWeakPatterns: string[] = [];

    Object.entries(patternResults).forEach(([pattern, stats]) => {
      const winRate = (stats.wins / stats.total) * 100;
      
      // 🔥 MUITO MAIS AGRESSIVO - Identificar com menos dados
      if (winRate >= 65 && stats.total >= 2) {
        // Padrão bom = reforçar
        successfulPatterns.push(pattern);
        console.log(`✅ PADRÃO BOM: ${pattern} (${winRate.toFixed(1)}% em ${stats.total} ops)`);
      } else if (winRate < 30 && stats.total >= 2) {
        // Padrão MUITO FRACO = BLOQUEAR AGRESSIVAMENTE
        criticallyWeakPatterns.push(pattern);
        console.log(`🚫 PADRÃO CRÍTICO: ${pattern} (${winRate.toFixed(1)}% em ${stats.total} ops) - SERÁ BLOQUEADO!`);
      } else if (winRate < 45 && stats.total >= 3) {
        // Padrão fraco = penalizar
        weakPatterns.push(pattern);
        console.log(`⚠️ PADRÃO FRACO: ${pattern} (${winRate.toFixed(1)}% em ${stats.total} ops)`);
      }
    });

    // Aplicar aprendizado ao sistema COM MUITO MAIS FORÇA
    if (successfulPatterns.length > 0 || weakPatterns.length > 0 || criticallyWeakPatterns.length > 0) {
      console.log('🎯 Aplicando ajustes de padrões ao sistema...');
      
      // Reforçar padrões vencedores COM MUITO MAIS FORÇA
      successfulPatterns.forEach(pattern => {
        aiLearningSystem.reinforcePattern(pattern, 1.35); // Aumentado para 35% boost
      });
      
      // Penalizar padrões fracos COM MUITO MAIS FORÇA
      weakPatterns.forEach(pattern => {
        aiLearningSystem.penalizePattern(pattern, 0.60); // Aumentado para 40% penalty
      });
      
      // BLOQUEAR PADRÕES CRÍTICOS IMEDIATAMENTE
      criticallyWeakPatterns.forEach(pattern => {
        aiLearningSystem.penalizePattern(pattern, 0.40); // PENALIZAÇÃO SEVERA
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
    if (allOperations.length < 5) return; // Menos restritivo para aprender mais rápido

    const recent = allOperations.slice(-15); // Últimas 15 operações
    const wins = recent.filter(op => op.result === 'WIN').length;
    const winRate = (wins / recent.length) * 100;

    const config = aiLearningSystem.getOperationalConfig();
    let adjusted = false;

    // 🔥 AJUSTE AGRESSIVO SE ESTÁ PERDENDO MUITO
    if (winRate < 30) {
      // EMERGÊNCIA - Taxa de perda crítica!
      config.minTrendStrength = Math.min(config.minTrendStrength + 15, 90);
      config.minSupportResistance = Math.min(config.minSupportResistance + 15, 90);
      config.requireConfirmations = Math.min(config.requireConfirmations + 2, 4);
      adjusted = true;
      console.log('🚨 CRÍTICO: Win Rate EXTREMAMENTE baixo:', winRate.toFixed(1) + '% - BLOQUEANDO sinais fracos!');
    }
    else if (winRate < 40) {
      // Muito ruim - precisamos parar de perder
      config.minTrendStrength = Math.min(config.minTrendStrength + 12, 85);
      config.minSupportResistance = Math.min(config.minSupportResistance + 12, 85);
      config.requireConfirmations = Math.min(config.requireConfirmations + 1, 4);
      adjusted = true;
      console.log('🔴 ALERTA: Win Rate MUITO baixo:', winRate.toFixed(1) + '% - Aumentando thresholds AGRESSIVAMENTE');
    }
    // Se taxa de acerto está baixa, aumentar requisitos MAIS
    else if (winRate < 50) {
      config.minTrendStrength = Math.min(config.minTrendStrength + 8, 75);
      config.minSupportResistance = Math.min(config.minSupportResistance + 8, 80);
      config.requireConfirmations = Math.min(config.requireConfirmations + 1, 3);
      adjusted = true;
      console.log('⬆️ Aumentando thresholds agressivamente - WinRate baixo:', winRate.toFixed(1) + '%');
    }
    // Se taxa de acerto está RAZOÁVEL (50-65%), manter mais seletivo
    else if (winRate >= 50 && winRate <= 65) {
      // Manter configurações atuais ou aumentar ligeiramente
      if (config.minTrendStrength < 50) {
        config.minTrendStrength = Math.min(config.minTrendStrength + 3, 60);
        adjusted = true;
      }
    }
    // Se taxa de acerto está muito alta, podemos relaxar UM POUCO
    else if (winRate > 70 && config.minTrendStrength > 40) {
      config.minTrendStrength = Math.max(config.minTrendStrength - 2, 40);
      config.minSupportResistance = Math.max(config.minSupportResistance - 2, 45);
      adjusted = true;
      console.log('⬇️ Relaxando thresholds ligeiramente - WinRate excelente:', winRate.toFixed(1) + '%');
    }

    if (adjusted) {
      aiLearningSystem.updateOperationalConfig(config);
      console.log('🔧 Thresholds ajustados:', {
        minTrendStrength: config.minTrendStrength,
        minSupportResistance: config.minSupportResistance,
        requireConfirmations: config.requireConfirmations,
        recentWinRate: winRate.toFixed(1) + '%'
      });
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
   * 🔥 Otimiza configurações para maximizar win streaks
   */
  private optimizeForWinStreaks(allOperations: SignalHistory[]) {
    const streakStats = winStreakLearning.getStats();
    
    console.log(`\n🔥 === OTIMIZAÇÃO PARA WIN STREAKS ===`);
    console.log(`   Current Streak: ${streakStats.currentStreak}`);
    console.log(`   Longest Streak: ${streakStats.longestStreak}`);
    console.log(`   Target: ${streakStats.targetStreak}`);
    console.log(`   Progression Level: ${streakStats.progressionLevel}`);

    // Se temos histórico de streaks bem sucedidas, aprender com elas
    if (streakStats.streakHistory.length > 0) {
      // Pegar as streaks mais longas (top 3)
      const topStreaks = [...streakStats.streakHistory]
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3);

      console.log(`\n📚 Aprendendo com as ${topStreaks.length} melhores streaks:`);

      // Analisar padrões que funcionaram nas melhores streaks
      const successPatterns: Record<string, number> = {};
      const successAssets: Record<string, number> = {};
      let totalAvgProbability = 0;

      topStreaks.forEach((record, idx) => {
        console.log(`   #${idx + 1}: ${record.streak} vitórias (prob média: ${record.averageProbability.toFixed(1)}%)`);
        
        // Contar padrões
        record.patterns.forEach(p => {
          successPatterns[p] = (successPatterns[p] || 0) + 1;
        });
        
        // Contar assets
        record.assets.forEach(a => {
          successAssets[a] = (successAssets[a] || 0) + 1;
        });
        
        totalAvgProbability += record.averageProbability;
      });

      // Calcular probabilidade mínima ideal
      const idealMinProbability = totalAvgProbability / topStreaks.length;
      console.log(`\n🎯 Probabilidade mínima ideal: ${idealMinProbability.toFixed(1)}%`);

      // Reforçar padrões que aparecem em streaks bem sucedidas
      console.log('\n✅ Reforçando padrões de sucesso:');
      Object.entries(successPatterns)
        .sort((a, b) => b[1] - a[1])
        .forEach(([pattern, count]) => {
          if (count >= 2) { // Apareceu em pelo menos 2 das top streaks
            console.log(`   - ${pattern}: ${count} vezes`);
            aiLearningSystem.reinforcePattern(pattern, 1.4); // 40% boost
          }
        });

      // Registrar evolução
      aiEvolutionTracker.recordMetric({
        winRate: 100,
        totalSignals: topStreaks.length,
        phase: `Otimização Streak - Nível ${streakStats.progressionLevel}`,
        topIndicators: Object.keys(successPatterns).slice(0, 3),
        accuracy: idealMinProbability,
      });
    }

    // Se a streak atual foi quebrada recentemente, analisar o porquê
    const recentLosses = allOperations.filter(op => 
      op.result === 'LOSS' && 
      Date.now() - op.timestamp < 300000 // últimos 5 minutos
    );

    if (recentLosses.length > 0) {
      console.log(`\n⚠️ Analisando ${recentLosses.length} perdas recentes:`);
      
      recentLosses.forEach(loss => {
        const pattern = loss.analysisMetrics?.candlePattern;
        if (pattern) {
          console.log(`   - Padrão: ${pattern} (prob: ${loss.probability}%)`);
          // Penalizar padrões que causaram perdas recentes
          aiLearningSystem.penalizePattern(pattern, 0.5); // 50% penalty
        }
      });
    }

    console.log(`=== FIM DA OTIMIZAÇÃO ===\n`);
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
