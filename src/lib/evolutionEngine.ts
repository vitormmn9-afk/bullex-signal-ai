// 🧠 MOTOR DE EVOLUÇÃO AGRESSIVA - Sistema que REALMENTE aprende e evolui
// Este sistema experimenta diferentes estratégias, aprende com cada resultado e evolui continuamente

export interface Strategy {
  id: string;
  name: string;
  description: string;
  config: StrategyConfig;
  performance: {
    wins: number;
    losses: number;
    winRate: number;
    consecutiveWins: number;
    maxConsecutiveWins: number;
    lastUsed: number;
  };
  generation: number; // Geração evolutiva
  mutations: string[]; // Histórico de mutações
}

export interface StrategyConfig {
  // Configurações técnicas
  minRSI: number;
  maxRSI: number;
  minMACD: number;
  trendWeight: number;
  volumeWeight: number;
  candleWeight: number;
  supportResistanceWeight: number;
  
  // Configurações de risco
  minProbability: number;
  maxRisk: number;
  
  // Padrões preferidos
  preferredPatterns: string[];
  avoidPatterns: string[];
  
  // Indicadores principais
  primaryIndicators: string[];
  
  // Condições especiais
  requireVolumeConfirmation: boolean;
  requireTrendAlignment: boolean;
  useAdvancedCandleAnalysis: boolean;
}

export interface ExperimentResult {
  strategyId: string;
  timestamp: number;
  result: 'WIN' | 'LOSS';
  probability: number;
  actualResult: number;
  learnings: string[];
}

const EVOLUTION_STORAGE_KEY = 'bullex_evolution_strategies';
const EXPERIMENTS_STORAGE_KEY = 'bullex_experiments';
const TARGET_CONSECUTIVE_WINS = 15;

export class EvolutionEngine {
  private strategies: Map<string, Strategy> = new Map();
  private experiments: ExperimentResult[] = [];
  private currentStrategyId: string | null = null;
  private consecutiveWins = 0;
  private evolutionGeneration = 0;

  constructor() {
    this.loadStrategies();
    this.initializeBaseStrategies();
  }

  // Inicializa estratégias base diversificadas
  private initializeBaseStrategies(): void {
    if (this.strategies.size > 0) return;

    const baseStrategies: Omit<Strategy, 'id'>[] = [
      {
        name: 'Agressivo RSI',
        description: 'Foca em extremos de RSI com confirmação rápida',
        config: {
          minRSI: 25,
          maxRSI: 75,
          minMACD: 0.3,
          trendWeight: 1.5,
          volumeWeight: 1.2,
          candleWeight: 1.0,
          supportResistanceWeight: 1.3,
          minProbability: 65,
          maxRisk: 3,
          preferredPatterns: ['hammer', 'shootingStar', 'engulfing'],
          avoidPatterns: ['doji'],
          primaryIndicators: ['RSI', 'Volume'],
          requireVolumeConfirmation: true,
          requireTrendAlignment: false,
          useAdvancedCandleAnalysis: true,
        },
        performance: {
          wins: 0,
          losses: 0,
          winRate: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
          lastUsed: 0,
        },
        generation: 0,
        mutations: [],
      },
      {
        name: 'Conservador Tendência',
        description: 'Segue tendências fortes com múltiplas confirmações',
        config: {
          minRSI: 30,
          maxRSI: 70,
          minMACD: 0.5,
          trendWeight: 2.0,
          volumeWeight: 1.0,
          candleWeight: 0.8,
          supportResistanceWeight: 1.5,
          minProbability: 75,
          maxRisk: 2,
          preferredPatterns: ['strongBullish', 'strongBearish'],
          avoidPatterns: ['doji', 'neutral'],
          primaryIndicators: ['Trend', 'MACD', 'Support/Resistance'],
          requireVolumeConfirmation: false,
          requireTrendAlignment: true,
          useAdvancedCandleAnalysis: true,
        },
        performance: {
          wins: 0,
          losses: 0,
          winRate: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
          lastUsed: 0,
        },
        generation: 0,
        mutations: [],
      },
      {
        name: 'Padrões Avançados',
        description: 'Utiliza análise avançada de velas e confluências',
        config: {
          minRSI: 20,
          maxRSI: 80,
          minMACD: 0.2,
          trendWeight: 1.2,
          volumeWeight: 1.5,
          candleWeight: 2.0,
          supportResistanceWeight: 1.2,
          minProbability: 70,
          maxRisk: 2.5,
          preferredPatterns: ['engulfing', 'harami', 'hammer', 'shootingStar'],
          avoidPatterns: [],
          primaryIndicators: ['Candlestick', 'Volume', 'Price Action'],
          requireVolumeConfirmation: true,
          requireTrendAlignment: false,
          useAdvancedCandleAnalysis: true,
        },
        performance: {
          wins: 0,
          losses: 0,
          winRate: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
          lastUsed: 0,
        },
        generation: 0,
        mutations: [],
      },
      {
        name: 'Scalper Rápido',
        description: 'Movimentos rápidos com probabilidade moderada',
        config: {
          minRSI: 20,
          maxRSI: 80,
          minMACD: 0.1,
          trendWeight: 1.0,
          volumeWeight: 1.8,
          candleWeight: 1.2,
          supportResistanceWeight: 0.8,
          minProbability: 60,
          maxRisk: 3.5,
          preferredPatterns: ['strongBullish', 'strongBearish', 'engulfing'],
          avoidPatterns: ['doji', 'harami'],
          primaryIndicators: ['Volume', 'Price Action', 'RSI'],
          requireVolumeConfirmation: true,
          requireTrendAlignment: false,
          useAdvancedCandleAnalysis: false,
        },
        performance: {
          wins: 0,
          losses: 0,
          winRate: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
          lastUsed: 0,
        },
        generation: 0,
        mutations: [],
      },
      {
        name: 'Suporte/Resistência Elite',
        description: 'Foca em zonas críticas de S/R com alta confiança',
        config: {
          minRSI: 25,
          maxRSI: 75,
          minMACD: 0.4,
          trendWeight: 1.3,
          volumeWeight: 1.1,
          candleWeight: 1.0,
          supportResistanceWeight: 2.5,
          minProbability: 72,
          maxRisk: 2,
          preferredPatterns: ['hammer', 'shootingStar', 'engulfing'],
          avoidPatterns: ['doji'],
          primaryIndicators: ['Support/Resistance', 'Trend', 'Candlestick'],
          requireVolumeConfirmation: false,
          requireTrendAlignment: true,
          useAdvancedCandleAnalysis: true,
        },
        performance: {
          wins: 0,
          losses: 0,
          winRate: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
          lastUsed: 0,
        },
        generation: 0,
        mutations: [],
      },
    ];

    baseStrategies.forEach((strategy, index) => {
      const id = `strategy_${index}_gen0`;
      this.strategies.set(id, { ...strategy, id });
    });

    this.saveStrategies();
    console.log(`🧬 ${this.strategies.size} estratégias base inicializadas`);
  }

  // Seleciona melhor estratégia baseado em performance
  selectBestStrategy(): Strategy {
    // Se estamos em busca de 15 vitórias consecutivas, usar a que está em streak
    if (this.consecutiveWins > 0 && this.currentStrategyId) {
      const current = this.strategies.get(this.currentStrategyId);
      if (current && current.performance.consecutiveWins === this.consecutiveWins) {
        console.log(`🔥 Mantendo estratégia em streak: ${current.name} (${this.consecutiveWins} vitórias)`);
        return current;
      }
    }

    // Ordena estratégias por performance
    const ranked = Array.from(this.strategies.values()).sort((a, b) => {
      // Prioriza win rate, depois consecutive wins, depois total de wins
      const scoreA = a.performance.winRate * 100 + a.performance.maxConsecutiveWins * 50 + a.performance.wins * 10;
      const scoreB = b.performance.winRate * 100 + b.performance.maxConsecutiveWins * 50 + b.performance.wins * 10;
      return scoreB - scoreA;
    });

    // 80% usa as top 3, 20% experimenta outras (exploration vs exploitation)
    const useTop = Math.random() < 0.8;
    if (useTop && ranked[0].performance.wins > 0) {
      const topThree = ranked.slice(0, 3).filter(s => s.performance.wins > 0);
      if (topThree.length > 0) {
        const selected = topThree[Math.floor(Math.random() * topThree.length)];
        console.log(`✨ Usando estratégia top: ${selected.name} (WR: ${selected.performance.winRate.toFixed(1)}%)`);
        return selected;
      }
    }

    // Experimenta estratégia diferente
    const experimental = ranked[Math.floor(Math.random() * ranked.length)];
    console.log(`🔬 Experimentando: ${experimental.name}`);
    return experimental;
  }

  // Aplica estratégia para calcular probabilidade ajustada
  applyStrategy(
    strategy: Strategy,
    baseMetrics: {
      rsi: number;
      macd: number;
      trendStrength: number;
      volumeProfile: number;
      supportResistance: number;
      candlePattern: string;
      priceAction: number;
      overallScore: number;
    }
  ): { adjustedProbability: number; shouldOperate: boolean; reasoning: string[] } {
    const reasoning: string[] = [];
    let score = baseMetrics.overallScore;

    // Verifica RSI
    if (baseMetrics.rsi < strategy.config.minRSI) {
      reasoning.push(`RSI muito baixo: ${baseMetrics.rsi} < ${strategy.config.minRSI}`);
      score *= 0.8;
    } else if (baseMetrics.rsi > strategy.config.maxRSI) {
      reasoning.push(`RSI muito alto: ${baseMetrics.rsi} > ${strategy.config.maxRSI}`);
      score *= 0.8;
    } else {
      reasoning.push(`✓ RSI dentro da faixa ideal`);
    }

    // Verifica MACD
    if (Math.abs(baseMetrics.macd) < strategy.config.minMACD) {
      reasoning.push(`MACD fraco: ${Math.abs(baseMetrics.macd)} < ${strategy.config.minMACD}`);
      score *= 0.9;
    } else {
      reasoning.push(`✓ MACD forte o suficiente`);
    }

    // Aplica pesos
    score = score * 0.5 + // Base score com peso reduzido
           baseMetrics.trendStrength * strategy.config.trendWeight * 0.15 +
           baseMetrics.volumeProfile * strategy.config.volumeWeight * 0.12 +
           baseMetrics.supportResistance * strategy.config.supportResistanceWeight * 0.13 +
           baseMetrics.priceAction * strategy.config.candleWeight * 0.10;

    reasoning.push(`Score ajustado por pesos: ${score.toFixed(1)}`);

    // Verifica padrões
    if (strategy.config.avoidPatterns.includes(baseMetrics.candlePattern)) {
      reasoning.push(`❌ Padrão evitado: ${baseMetrics.candlePattern}`);
      return { adjustedProbability: 0, shouldOperate: false, reasoning };
    }

    if (strategy.config.preferredPatterns.includes(baseMetrics.candlePattern)) {
      score += 10;
      reasoning.push(`✓ Padrão preferido: ${baseMetrics.candlePattern} (+10)`);
    }

    // Verifica confirmações necessárias
    if (strategy.config.requireVolumeConfirmation && baseMetrics.volumeProfile < 60) {
      reasoning.push(`Volume insuficiente: ${baseMetrics.volumeProfile} < 60`);
      score *= 0.85;
    }

    if (strategy.config.requireTrendAlignment && baseMetrics.trendStrength < 55) {
      reasoning.push(`Tendência fraca: ${baseMetrics.trendStrength} < 55`);
      score *= 0.85;
    }

    // Decisão final
    const shouldOperate = score >= strategy.config.minProbability;
    const adjustedProbability = Math.min(98, Math.max(0, Math.round(score)));

    reasoning.push(`Probabilidade final: ${adjustedProbability}% | Min: ${strategy.config.minProbability}%`);
    reasoning.push(shouldOperate ? '✅ OPERAR' : '⛔ NÃO OPERAR');

    return { adjustedProbability, shouldOperate, reasoning };
  }

  // Registra resultado de experimento
  recordExperiment(
    strategyId: string,
    result: 'WIN' | 'LOSS',
    probability: number,
    actualResult: number
  ): void {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    // Atualiza performance da estratégia
    strategy.performance.lastUsed = Date.now();
    
    if (result === 'WIN') {
      strategy.performance.wins++;
      strategy.performance.consecutiveWins++;
      this.consecutiveWins++;
      
      if (strategy.performance.consecutiveWins > strategy.performance.maxConsecutiveWins) {
        strategy.performance.maxConsecutiveWins = strategy.performance.consecutiveWins;
      }

      console.log(`🎉 VITÓRIA com ${strategy.name}! Streak: ${this.consecutiveWins}/${TARGET_CONSECUTIVE_WINS}`);
    } else {
      strategy.performance.losses++;
      strategy.performance.consecutiveWins = 0;
      this.consecutiveWins = 0;
      console.log(`❌ Derrota com ${strategy.name}. Streak resetado.`);
    }

    const total = strategy.performance.wins + strategy.performance.losses;
    strategy.performance.winRate = total > 0 ? (strategy.performance.wins / total) * 100 : 0;

    // Registra experimento
    const experiment: ExperimentResult = {
      strategyId,
      timestamp: Date.now(),
      result,
      probability,
      actualResult,
      learnings: [],
    };

    // Aprende com o resultado
    if (result === 'LOSS') {
      if (probability > 80) {
        experiment.learnings.push('Alta probabilidade não garantiu vitória - revisar critérios');
      }
      if (strategy.performance.winRate < 50 && strategy.performance.wins + strategy.performance.losses > 5) {
        experiment.learnings.push('Estratégia com baixa performance - candidata a mutação');
      }
    } else {
      if (probability < 70 && actualResult > 0) {
        experiment.learnings.push('Vitória com probabilidade moderada - estratégia pode ser mais agressiva');
      }
    }

    this.experiments.push(experiment);
    if (this.experiments.length > 500) {
      this.experiments = this.experiments.slice(-500);
    }

    this.currentStrategyId = strategyId;
    this.saveStrategies();
    this.saveExperiments();

    // Evolui estratégias periodicamente
    if (total % 10 === 0 && total > 0) {
      this.evolveStrategies();
    }
  }

  // Evolui e muta estratégias baseado em performance
  private evolveStrategies(): void {
    console.log('🧬 INICIANDO EVOLUÇÃO DE ESTRATÉGIAS...');
    
    const strategies = Array.from(this.strategies.values());
    const bestPerformers = strategies
      .filter(s => s.performance.wins + s.performance.losses >= 5)
      .sort((a, b) => b.performance.winRate - a.performance.winRate)
      .slice(0, 2);

    const worstPerformers = strategies
      .filter(s => s.performance.wins + s.performance.losses >= 5)
      .sort((a, b) => a.performance.winRate - b.performance.winRate)
      .slice(0, 2);

    // Muta piores estratégias baseado nas melhores
    worstPerformers.forEach((worst, index) => {
      if (bestPerformers.length > 0) {
        const best = bestPerformers[index % bestPerformers.length];
        const mutated = this.mutateStrategy(worst, best);
        this.strategies.set(mutated.id, mutated);
        console.log(`🧬 ${worst.name} evoluiu para Geração ${mutated.generation}`);
      }
    });

    // Cria novas estratégias híbridas
    if (bestPerformers.length >= 2) {
      const hybrid = this.createHybridStrategy(bestPerformers[0], bestPerformers[1]);
      this.strategies.set(hybrid.id, hybrid);
      console.log(`🧬 Nova estratégia híbrida criada: ${hybrid.name}`);
    }

    this.evolutionGeneration++;
    this.saveStrategies();
  }

  // Muta estratégia baseada em outra melhor
  private mutateStrategy(original: Strategy, template: Strategy): Strategy {
    const newGeneration = original.generation + 1;
    const mutations: string[] = [...original.mutations];

    // Copia parte da configuração do template
    const config: StrategyConfig = {
      ...original.config,
      // Muta valores em direção ao template com variação
      minRSI: this.mutateValue(original.config.minRSI, template.config.minRSI, 5),
      maxRSI: this.mutateValue(original.config.maxRSI, template.config.maxRSI, 5),
      minMACD: this.mutateValue(original.config.minMACD, template.config.minMACD, 0.1),
      trendWeight: this.mutateValue(original.config.trendWeight, template.config.trendWeight, 0.2),
      volumeWeight: this.mutateValue(original.config.volumeWeight, template.config.volumeWeight, 0.2),
      candleWeight: this.mutateValue(original.config.candleWeight, template.config.candleWeight, 0.2),
      supportResistanceWeight: this.mutateValue(original.config.supportResistanceWeight, template.config.supportResistanceWeight, 0.2),
      minProbability: this.mutateValue(original.config.minProbability, template.config.minProbability, 5),
      
      // Ocasionalmente adota padrões do template
      preferredPatterns: Math.random() > 0.5 ? [...template.config.preferredPatterns] : original.config.preferredPatterns,
      avoidPatterns: Math.random() > 0.5 ? [...template.config.avoidPatterns] : original.config.avoidPatterns,
    };

    mutations.push(`Gen${newGeneration}: Mutado a partir de ${template.name}`);

    return {
      ...original,
      id: `${original.id.split('_')[0]}_${original.id.split('_')[1]}_gen${newGeneration}`,
      name: `${original.name} Gen${newGeneration}`,
      config,
      generation: newGeneration,
      mutations,
      performance: {
        wins: 0,
        losses: 0,
        winRate: 0,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
        lastUsed: 0,
      },
    };
  }

  // Cria estratégia híbrida de duas estratégias
  private createHybridStrategy(parent1: Strategy, parent2: Strategy): Strategy {
    const hybridId = `hybrid_${Date.now()}_gen${this.evolutionGeneration}`;
    
    // Combina melhores aspectos de ambas
    const config: StrategyConfig = {
      minRSI: Math.min(parent1.config.minRSI, parent2.config.minRSI),
      maxRSI: Math.max(parent1.config.maxRSI, parent2.config.maxRSI),
      minMACD: (parent1.config.minMACD + parent2.config.minMACD) / 2,
      trendWeight: Math.max(parent1.config.trendWeight, parent2.config.trendWeight),
      volumeWeight: Math.max(parent1.config.volumeWeight, parent2.config.volumeWeight),
      candleWeight: Math.max(parent1.config.candleWeight, parent2.config.candleWeight),
      supportResistanceWeight: Math.max(parent1.config.supportResistanceWeight, parent2.config.supportResistanceWeight),
      minProbability: (parent1.config.minProbability + parent2.config.minProbability) / 2,
      maxRisk: Math.min(parent1.config.maxRisk, parent2.config.maxRisk),
      preferredPatterns: [...new Set([...parent1.config.preferredPatterns, ...parent2.config.preferredPatterns])],
      avoidPatterns: [...new Set([...parent1.config.avoidPatterns, ...parent2.config.avoidPatterns])],
      primaryIndicators: [...new Set([...parent1.config.primaryIndicators, ...parent2.config.primaryIndicators])],
      requireVolumeConfirmation: parent1.config.requireVolumeConfirmation || parent2.config.requireVolumeConfirmation,
      requireTrendAlignment: parent1.config.requireTrendAlignment || parent2.config.requireTrendAlignment,
      useAdvancedCandleAnalysis: parent1.config.useAdvancedCandleAnalysis || parent2.config.useAdvancedCandleAnalysis,
    };

    return {
      id: hybridId,
      name: `Híbrido ${parent1.name.split(' ')[0]}-${parent2.name.split(' ')[0]}`,
      description: `Combinação dos melhores aspectos de ${parent1.name} e ${parent2.name}`,
      config,
      performance: {
        wins: 0,
        losses: 0,
        winRate: 0,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
        lastUsed: 0,
      },
      generation: this.evolutionGeneration,
      mutations: [`Híbrido de ${parent1.name} (${parent1.performance.winRate.toFixed(1)}% WR) e ${parent2.name} (${parent2.performance.winRate.toFixed(1)}% WR)`],
    };
  }

  // Muta um valor em direção a um alvo com variação
  private mutateValue(current: number, target: number, variation: number): number {
    const direction = target - current;
    const step = direction * 0.5; // Move 50% em direção ao alvo
    const noise = (Math.random() - 0.5) * variation * 2; // Adiciona variação
    return Math.max(0, current + step + noise);
  }

  // Estatísticas do sistema
  getEvolutionStats() {
    const strategies = Array.from(this.strategies.values());
    const bestStrategy = strategies.reduce((best, current) => 
      current.performance.winRate > best.performance.winRate ? current : best
    , strategies[0]);

    return {
      totalStrategies: strategies.length,
      generation: this.evolutionGeneration,
      consecutiveWins: this.consecutiveWins,
      targetWins: TARGET_CONSECUTIVE_WINS,
      progress: (this.consecutiveWins / TARGET_CONSECUTIVE_WINS) * 100,
      bestStrategy: {
        name: bestStrategy.name,
        winRate: bestStrategy.performance.winRate,
        wins: bestStrategy.performance.wins,
        losses: bestStrategy.performance.losses,
        maxStreak: bestStrategy.performance.maxConsecutiveWins,
      },
      topStrategies: strategies
        .sort((a, b) => b.performance.winRate - a.performance.winRate)
        .slice(0, 5)
        .map(s => ({
          name: s.name,
          winRate: s.performance.winRate.toFixed(1),
          wins: s.performance.wins,
          losses: s.performance.losses,
          generation: s.generation,
        })),
    };
  }

  // Persistência
  private saveStrategies(): void {
    try {
      const data = {
        strategies: Array.from(this.strategies.entries()),
        consecutiveWins: this.consecutiveWins,
        currentStrategyId: this.currentStrategyId,
        evolutionGeneration: this.evolutionGeneration,
      };
      localStorage.setItem(EVOLUTION_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar estratégias:', e);
    }
  }

  private loadStrategies(): void {
    try {
      const stored = localStorage.getItem(EVOLUTION_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.strategies = new Map(data.strategies);
        this.consecutiveWins = data.consecutiveWins || 0;
        this.currentStrategyId = data.currentStrategyId || null;
        this.evolutionGeneration = data.evolutionGeneration || 0;
        console.log(`📂 ${this.strategies.size} estratégias carregadas (Geração ${this.evolutionGeneration})`);
      }
    } catch (e) {
      console.error('Erro ao carregar estratégias:', e);
    }
  }

  private saveExperiments(): void {
    try {
      localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(this.experiments));
    } catch (e) {
      console.error('Erro ao salvar experimentos:', e);
    }
  }

  getAllStrategies(): Strategy[] {
    return Array.from(this.strategies.values());
  }

  getRecentExperiments(limit: number = 20): ExperimentResult[] {
    return this.experiments.slice(-limit);
  }
}

// Singleton
export const evolutionEngine = new EvolutionEngine();
