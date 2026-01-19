/**
 * Sistema de Aprendizado Focado em Sequências de Vitórias (Win Streaks)
 * Objetivo: Treinar a IA para conseguir 15+ vitórias consecutivas e progredir
 */

import { aiLearningSystem, type SignalHistory } from './aiLearning';
import { aiEvolutionTracker } from './aiEvolutionTracker';

export interface WinStreakStats {
  currentStreak: number;
  longestStreak: number;
  targetStreak: number;
  streakHistory: StreakRecord[];
  streaksAchieved: Record<number, number>; // quantas vezes atingiu cada nível
  progressionLevel: number; // nível de progressão
  currentLossStreak: number; // derrotas consecutivas atuais
  totalResets: number; // quantas vezes resetou após 5 derrotas
}

export interface StreakRecord {
  streak: number;
  startTimestamp: number;
  endTimestamp: number;
  signals: string[]; // IDs dos sinais
  averageProbability: number;
  patterns: string[];
  assets: string[];
}

export interface StreakLearningConfig {
  initialTarget: number;
  progressionIncrement: number; // quanto aumentar o target após sucesso
  minConfidence: number; // confiança mínima durante streak
  conservativeMode: boolean; // modo conservador durante streaks
  adaptiveWeights: boolean; // ajustar pesos baseado em streaks
  maxLossesBeforeReset: number; // máximo de derrotas antes de resetar (padrão: 5)
}

class WinStreakLearningSystem {
  private stats: WinStreakStats = {
    currentStreak: 0,
    longestStreak: 0,
    targetStreak: 15, // Objetivo inicial: 15 vitórias seguidas
    streakHistory: [],
    streaksAchieved: {},
    progressionLevel: 1,
    currentLossStreak: 0, // Derrotas consecutivas
    totalResets: 0, // Quantidade de resets por 5 derrotas
  };

  private config: StreakLearningConfig = {
    initialTarget: 15,
    progressionIncrement: 5, // Aumenta 5 após cada meta atingida
    minConfidence: 65, // 🔥 Ajustado para 65% - BALANÇO entre quantidade e qualidade
    conservativeMode: false, // 🔥 DESATIVADO - modo ULTRA-AGRESSIVO
    adaptiveWeights: true, // 🔥 SEMPRE ATIVO
    maxLossesBeforeReset: 2, // 🔥 2 DERROTAS = RESET (aprendizado super rápido!)
  };

  private currentStreakSignals: string[] = [];
  private readonly STORAGE_KEY = 'win_streak_learning';

  constructor() {
    this.loadStats();
  }

  /**
   * Processa resultado de um sinal e atualiza streak
   */
  processSignalResult(signal: SignalHistory): void {
    if (signal.result === 'WIN') {
      this.handleWin(signal);
    } else if (signal.result === 'LOSS') {
      this.handleLoss(signal);
    }
  }

  /**
   * Lida com uma vitória - aumenta streak
   */
  private handleWin(signal: SignalHistory): void {
    this.stats.currentStreak++;
    this.stats.currentLossStreak = 0; // Reseta contador de derrotas
    this.currentStreakSignals.push(signal.id);

    // Atualiza longest streak
    if (this.stats.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.currentStreak;
      console.log(`🏆 NOVO RECORDE DE STREAK: ${this.stats.longestStreak} vitórias!`);
    }

    // Verifica se atingiu o target
    if (this.stats.currentStreak === this.stats.targetStreak) {
      this.achieveTarget();
    }

    // Log de progresso
    const progress = (this.stats.currentStreak / this.stats.targetStreak) * 100;
    console.log(`🔥 STREAK ATUAL: ${this.stats.currentStreak}/${this.stats.targetStreak} (${progress.toFixed(1)}%)`);

    this.saveStats();
  }

  /**
   * Lida com uma perda - reseta streak ou aumenta contador de derrotas
   */
  private handleLoss(signal: SignalHistory): void {
    // Incrementa contador de derrotas consecutivas
    this.stats.currentLossStreak++;

    if (this.stats.currentStreak > 0) {
      // Registra a streak que terminou
      this.recordStreak();
      
      // Analisa o que deu errado
      this.analyzeStreakBreak(signal);
      
      console.log(`❌ STREAK QUEBRADA em ${this.stats.currentStreak}. Reiniciando...`);
    }

    this.stats.currentStreak = 0;
    this.currentStreakSignals = [];

    // 🔥 NOVA FUNCIONALIDADE: Reset após 5 derrotas consecutivas
    if (this.stats.currentLossStreak >= this.config.maxLossesBeforeReset) {
      this.resetAfterLosses();
    }

    this.saveStats();
  }

  /**
   * 🔥 RESET APÓS 5 DERROTAS - Nova chance de aprendizado
   */
  private resetAfterLosses(): void {
    console.log(`\n🔄 === RESET APÓS ${this.stats.currentLossStreak} DERROTAS ===`);
    console.log(`   A IA vai recalibrar e começar uma nova fase de aprendizado!`);
    
    this.stats.totalResets++;
    
    // Analisa o que causou as 5 derrotas
    const history = aiLearningSystem.getHistory();
    const recentLosses = history
      .filter(s => s.result === 'LOSS')
      .slice(-this.config.maxLossesBeforeReset);

    console.log(`\n📊 Analisando ${recentLosses.length} derrotas consecutivas:`);

    // Identifica padrões problemáticos
    const problematicPatterns = new Map<string, number>();
    const weakMetrics = {
      lowTrend: 0,
      lowVolume: 0,
      weakSupport: 0,
      poorRSI: 0,
    };

    recentLosses.forEach((loss, idx) => {
      const pattern = loss.analysisMetrics?.candlePattern || 'unknown';
      problematicPatterns.set(pattern, (problematicPatterns.get(pattern) || 0) + 1);

      const m = loss.analysisMetrics;
      if (m) {
        if (m.trendStrength < 50) weakMetrics.lowTrend++;
        if (m.volumeProfile < 50) weakMetrics.lowVolume++;
        if (m.supportResistance < 50) weakMetrics.weakSupport++;
        if (m.rsi < 30 || m.rsi > 70) weakMetrics.poorRSI++;
      }

      console.log(`   ${idx + 1}. ${loss.asset} ${loss.direction} - Padrão: ${pattern} (${loss.probability}%)`);
    });

    // Identifica padrão mais problemático
    const mostProblematic = Array.from(problematicPatterns.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostProblematic && mostProblematic[1] >= 2) {
      console.log(`\n🚫 PADRÃO CRÍTICO IDENTIFICADO: ${mostProblematic[0]}`);
      console.log(`   Apareceu em ${mostProblematic[1]} das ${recentLosses.length} derrotas`);
      console.log(`   → BLOQUEANDO temporariamente este padrão`);
      
      // Penaliza MUITO este padrão
      aiLearningSystem.penalizePattern(mostProblematic[0], 0.3); // 70% penalty
    }

    // Identifica problemas de métricas
    console.log(`\n📉 Problemas identificados:`);
    if (weakMetrics.lowTrend >= 3) console.log(`   ⚠️ Tendência fraca (${weakMetrics.lowTrend}x)`);
    if (weakMetrics.lowVolume >= 3) console.log(`   ⚠️ Volume baixo (${weakMetrics.lowVolume}x)`);
    if (weakMetrics.weakSupport >= 3) console.log(`   ⚠️ Suporte/Resistência fraco (${weakMetrics.weakSupport}x)`);
    if (weakMetrics.poorRSI >= 3) console.log(`   ⚠️ RSI extremo sem confirmação (${weakMetrics.poorRSI}x)`);

    // Ajusta thresholds baseado nos problemas
    const config = aiLearningSystem.getOperationalConfig();
    if (weakMetrics.lowTrend >= 3) {
      config.minTrendStrength = Math.min(70, config.minTrendStrength + 10);
      console.log(`   ✅ Aumentando threshold de tendência para ${config.minTrendStrength}`);
    }
    if (weakMetrics.weakSupport >= 3) {
      config.minSupportResistance = Math.min(70, config.minSupportResistance + 10);
      console.log(`   ✅ Aumentando threshold de S/R para ${config.minSupportResistance}`);
    }
    if (weakMetrics.lowVolume >= 3 || weakMetrics.poorRSI >= 3) {
      config.requireConfirmations = Math.min(3, config.requireConfirmations + 1);
      console.log(`   ✅ Exigindo ${config.requireConfirmations} confirmações`);
    }

    aiLearningSystem.updateOperationalConfig(config);

    // Reseta contador de derrotas para nova chance
    this.stats.currentLossStreak = 0;
    
    console.log(`\n🎯 NOVA FASE INICIADA!`);
    console.log(`   Target: ${this.stats.targetStreak} vitórias consecutivas`);
    console.log(`   Reset #${this.stats.totalResets}`);
    console.log(`   A IA agora está mais criteriosa e focada!\n`);

    this.saveStats();
  }

  /**
   * Registra uma streak concluída no histórico
   */
  private recordStreak(): void {
    const history = aiLearningSystem.getHistory();
    const streakSignals = history.filter(s => this.currentStreakSignals.includes(s.id));
    
    const record: StreakRecord = {
      streak: this.stats.currentStreak,
      startTimestamp: streakSignals[0]?.timestamp || Date.now(),
      endTimestamp: Date.now(),
      signals: this.currentStreakSignals,
      averageProbability: this.calculateAverageProbability(streakSignals),
      patterns: this.extractPatterns(streakSignals),
      assets: [...new Set(streakSignals.map(s => s.asset))],
    };

    this.stats.streakHistory.push(record);
    
    // Mantém apenas últimas 100 streaks
    if (this.stats.streakHistory.length > 100) {
      this.stats.streakHistory = this.stats.streakHistory.slice(-100);
    }
  }

  /**
   * Chamado quando o target é atingido
   */
  private achieveTarget(): void {
    console.log(`🎯 TARGET ATINGIDO! ${this.stats.targetStreak} vitórias consecutivas!`);
    
    // 🔥 DISPARA EVENTO GLOBAL PARA NOTIFICAR O USUÁRIO
    if (this.stats.targetStreak >= 15) {
      this.notifyUserReadyToUse();
    }
    
    // Registra achievement
    const target = this.stats.targetStreak;
    this.stats.streaksAchieved[target] = (this.stats.streaksAchieved[target] || 0) + 1;
    
    // Aumenta o nível de progressão
    this.stats.progressionLevel++;
    
    // Aumenta o target para o próximo objetivo
    const oldTarget = this.stats.targetStreak;
    this.stats.targetStreak += this.config.progressionIncrement;
    
    console.log(`📈 PROGRESSÃO! Nível ${this.stats.progressionLevel}`);
    console.log(`🎯 NOVO TARGET: ${this.stats.targetStreak} vitórias consecutivas`);
    
    // Registra evolução
    aiEvolutionTracker.recordMetric({
      winRate: 100, // Acabou de atingir o target
      totalSignals: this.stats.streakHistory.length,
      phase: `Nível ${this.stats.progressionLevel}: ${oldTarget} → ${this.stats.targetStreak} vitórias`,
      topIndicators: [],
      accuracy: 100,
    });

    // Aprende com as estratégias que funcionaram
    this.learnFromSuccessfulStreak();
    
    this.saveStats();
  }

  /**
   * 🔥 NOTIFICA O USUÁRIO QUE O SISTEMA ESTÁ PRONTO PARA USO
   */
  private notifyUserReadyToUse(): void {
    // Dispara evento customizado
    const event = new CustomEvent('aiReadyToUse', {
      detail: {
        streak: this.stats.currentStreak,
        longestStreak: this.stats.longestStreak,
        level: this.stats.progressionLevel,
        message: `🎉 IA PRONTA! ${this.stats.currentStreak} vitórias consecutivas alcançadas!`
      }
    });
    window.dispatchEvent(event);
    
    console.log(`\n🚨🚨🚨 === SISTEMA PRONTO PARA USO! === 🚨🚨🚨`);
    console.log(`✅ A IA atingiu ${this.stats.currentStreak} vitórias consecutivas!`);
    console.log(`✅ Nível de confiança: ALTO`);
    console.log(`✅ Você pode começar a usar os sinais agora!`);
    console.log(`🚨🚨🚨 ============================= 🚨🚨🚨\n`);
  }

  /**
   * Analisa por que a streak quebrou
   */
  private analyzeStreakBreak(lossSignal: SignalHistory): void {
    console.log('🔍 Analisando causa da quebra de streak...');
    
    const history = aiLearningSystem.getHistory();
    const recentWins = history.filter(s => 
      this.currentStreakSignals.includes(s.id) && s.result === 'WIN'
    );

    // Compara o sinal de perda com os de vitória
    const avgWinProbability = this.calculateAverageProbability(recentWins);
    const lossProbability = lossSignal.probability;

    if (lossProbability < avgWinProbability - 10) {
      console.log(`⚠️ LIÇÃO: Sinal tinha probabilidade menor (${lossProbability}% vs ${avgWinProbability.toFixed(1)}% média)`);
      console.log('   → Aumentar threshold mínimo de probabilidade');
    }

    // Analisa padrão
    const winPatterns = recentWins.map(s => s.analysisMetrics.candlePattern);
    const lossPattern = lossSignal.analysisMetrics.candlePattern;
    
    if (!winPatterns.includes(lossPattern)) {
      console.log(`⚠️ LIÇÃO: Padrão diferente dos que estavam funcionando (${lossPattern})`);
      console.log('   → Evitar padrões não testados durante streaks');
    }

    // Analisa métricas
    const avgMetrics = this.calculateAverageMetrics(recentWins);
    const lossMetrics = lossSignal.analysisMetrics;

    if (lossMetrics.trendStrength < avgMetrics.trendStrength - 15) {
      console.log(`⚠️ LIÇÃO: Tendência mais fraca (${lossMetrics.trendStrength} vs ${avgMetrics.trendStrength.toFixed(1)} média)`);
    }

    if (lossMetrics.volumeProfile < avgMetrics.volumeProfile - 15) {
      console.log(`⚠️ LIÇÃO: Volume menor (${lossMetrics.volumeProfile} vs ${avgMetrics.volumeProfile.toFixed(1)} média)`);
    }
  }

  /**
   * Aprende com streak bem sucedida
   */
  private learnFromSuccessfulStreak(): void {
    console.log('📚 Aprendendo com streak bem sucedida...');
    
    const history = aiLearningSystem.getHistory();
    const streakSignals = history.filter(s => this.currentStreakSignals.includes(s.id));
    
    // Identifica padrões de sucesso
    const successPatterns = this.extractPatterns(streakSignals);
    const patternFrequency = successPatterns.reduce((acc, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('✅ Padrões de sucesso:', patternFrequency);

    // Identifica assets que funcionaram
    const successAssets = [...new Set(streakSignals.map(s => s.asset))];
    console.log('✅ Assets bem sucedidos:', successAssets);

    // Calcula métricas médias dos sinais de sucesso
    const avgMetrics = this.calculateAverageMetrics(streakSignals);
    console.log('✅ Métricas médias de sucesso:', {
      trendStrength: avgMetrics.trendStrength.toFixed(1),
      volumeProfile: avgMetrics.volumeProfile.toFixed(1),
      supportResistance: avgMetrics.supportResistance.toFixed(1),
      overallScore: avgMetrics.overallScore.toFixed(1),
    });

    // Atualiza configurações operacionais baseado no aprendizado
    this.updateOperationalConfigFromLearning(avgMetrics, successPatterns);
  }

  /**
   * Atualiza configurações baseado no aprendizado
   */
  private updateOperationalConfigFromLearning(
    avgMetrics: any,
    successPatterns: string[]
  ): void {
    const config = aiLearningSystem.getOperationalConfig();

    // Aumenta thresholds baseado no sucesso
    config.minTrendStrength = Math.max(config.minTrendStrength, avgMetrics.trendStrength - 5);
    config.minSupportResistance = Math.max(config.minSupportResistance, avgMetrics.supportResistance - 5);

    console.log('🔧 Configurações atualizadas:', {
      minTrendStrength: config.minTrendStrength,
      minSupportResistance: config.minSupportResistance,
    });
  }

  /**
   * Obtém ajustes necessários durante uma streak ativa
   */
  getStreakAdjustments(): {
    minProbabilityBoost: number;
    conservativeMode: boolean;
    requireExtraConfirmation: boolean;
    avoidNewPatterns: boolean;
  } {
    const isInStreak = this.stats.currentStreak > 5;
    const isCloseToTarget = this.stats.currentStreak >= this.stats.targetStreak * 0.7;

    return {
      // Durante streaks longas, exige probabilidade maior
      minProbabilityBoost: isInStreak ? this.stats.currentStreak : 0,
      
      // Modo conservador quando próximo do target
      conservativeMode: isCloseToTarget,
      
      // Exige confirmação extra durante streaks
      requireExtraConfirmation: this.stats.currentStreak > 10,
      
      // Evita padrões não testados durante streaks importantes
      avoidNewPatterns: isCloseToTarget,
    };
  }

  /**
   * Verifica se deve operar baseado na streak atual
   */
  shouldOperateBasedOnStreak(
    probability: number,
    pattern: string,
    metrics: any
  ): { allowed: boolean; reason?: string } {
    const adjustments = this.getStreakAdjustments();
    const history = aiLearningSystem.getHistory();

    // Durante streak ativa, aplicar regras mais rígidas
    if (this.stats.currentStreak > 0) {
      // Exige probabilidade mínima mais alta
      const minProbability = this.config.minConfidence + adjustments.minProbabilityBoost;
      if (probability < minProbability) {
        return {
          allowed: false,
          reason: `Probabilidade ${probability}% abaixo do mínimo ${minProbability}% durante streak`
        };
      }

      // Evita padrões não testados quando próximo do target
      if (adjustments.avoidNewPatterns) {
        const streakSignals = history.filter(s => this.currentStreakSignals.includes(s.id));
        const testedPatterns = this.extractPatterns(streakSignals);
        
        if (!testedPatterns.includes(pattern)) {
          return {
            allowed: false,
            reason: `Padrão ${pattern} não testado durante esta streak (modo conservador)`
          };
        }
      }

      // Exige métricas mais fortes quando próximo do target
      if (adjustments.conservativeMode) {
        if (metrics.trendStrength < 60) {
          return {
            allowed: false,
            reason: 'Tendência fraca - modo conservador durante streak'
          };
        }
        if (metrics.volumeProfile < 50) {
          return {
            allowed: false,
            reason: 'Volume baixo - modo conservador durante streak'
          };
        }
      }
    }

    return { allowed: true };
  }

  // Métodos auxiliares
  private calculateAverageProbability(signals: SignalHistory[]): number {
    if (signals.length === 0) return 0;
    const sum = signals.reduce((acc, s) => acc + s.probability, 0);
    return sum / signals.length;
  }

  private extractPatterns(signals: SignalHistory[]): string[] {
    return signals.map(s => s.analysisMetrics.candlePattern);
  }

  private calculateAverageMetrics(signals: SignalHistory[]): any {
    if (signals.length === 0) {
      return {
        trendStrength: 0,
        volumeProfile: 0,
        supportResistance: 0,
        overallScore: 0,
      };
    }

    const sum = signals.reduce((acc, s) => ({
      trendStrength: acc.trendStrength + s.analysisMetrics.trendStrength,
      volumeProfile: acc.volumeProfile + s.analysisMetrics.volumeProfile,
      supportResistance: acc.supportResistance + s.analysisMetrics.supportResistance,
      overallScore: acc.overallScore + s.analysisMetrics.overallScore,
    }), {
      trendStrength: 0,
      volumeProfile: 0,
      supportResistance: 0,
      overallScore: 0,
    });

    return {
      trendStrength: sum.trendStrength / signals.length,
      volumeProfile: sum.volumeProfile / signals.length,
      supportResistance: sum.supportResistance / signals.length,
      overallScore: sum.overallScore / signals.length,
    };
  }

  // Getters públicos
  getStats(): WinStreakStats {
    return { ...this.stats };
  }

  getConfig(): StreakLearningConfig {
    return { ...this.config };
  }

  getHistory(): SignalHistory[] {
    return aiLearningSystem.getHistory();
  }

  // Persistência
  private saveStats(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.error('Erro ao salvar stats de streak:', error);
    }
  }

  private loadStats(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.stats = JSON.parse(saved);
        console.log('📊 Stats de streak carregadas:', {
          currentStreak: this.stats.currentStreak,
          longestStreak: this.stats.longestStreak,
          targetStreak: this.stats.targetStreak,
          progressionLevel: this.stats.progressionLevel,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar stats de streak:', error);
    }
  }

  // Reset (útil para testes)
  reset(): void {
    this.stats = {
      currentStreak: 0,
      longestStreak: 0,
      targetStreak: this.config.initialTarget,
      streakHistory: [],
      streaksAchieved: {},
      progressionLevel: 1,
      currentLossStreak: 0,
      totalResets: 0,
    };
    this.currentStreakSignals = [];
    this.saveStats();
    console.log('🔄 Sistema de Win Streak resetado');
  }
}

// Instância singleton
export const winStreakLearning = new WinStreakLearningSystem();
