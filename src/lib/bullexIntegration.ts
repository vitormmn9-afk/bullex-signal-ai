// Sistema de Integração Específica da Bullex
// Conhecimento customizado da plataforma e seus ativos

export interface BullexAsset {
  name: string;
  symbol: string;
  type: 'stock' | 'option' | 'crypto' | 'index' | 'commodity';
  characteristics: string[];
  volatilityProfile: 'low' | 'medium' | 'high';
  tradingHours: {
    open: string;
    close: string;
    timezone: string;
  };
  specialRules: string[];
}

export interface BullexStrategyTemplate {
  id: string;
  name: string;
  description: string;
  requiredIndicators: string[];
  entryConditions: string[];
  exitConditions: string[];
  riskManagement: string;
  successRate: number;
  bestAssets: string[];
  timeframes: string[];
}

export interface BullexMarketKnowledge {
  assets: BullexAsset[];
  strategies: BullexStrategyTemplate[];
  tradingRules: string[];
  platformFeatures: string[];
  optimalTradingTimes: string[];
}

export class BullexIntegration {
  private marketKnowledge: BullexMarketKnowledge;
  private readonly STORAGE_KEY = 'bullex_ai_knowledge';
  private assetPerformance: Map<string, { wins: number; losses: number }> = new Map();

  constructor() {
    this.marketKnowledge = this.loadBullexKnowledge();
    this.initializeAssets();
    this.initializeStrategies();
  }

  private initializeAssets(): void {
    // Ativos principais na Bullex
    const mainAssets: BullexAsset[] = [
      {
        name: 'IBOVESPA',
        symbol: 'IBOV',
        type: 'index',
        characteristics: [
          'Índice de 84 empresas',
          'Bastante volátil em notícias',
          'Correlacionado com dólar',
          'Representativo do mercado brasileiro',
          'Liquid ao longo do dia',
        ],
        volatilityProfile: 'high',
        tradingHours: { open: '10:00', close: '17:00', timezone: 'BRT' },
        specialRules: [
          'Abertura pode ter gap significativo',
          'Volatilidade aumenta próximo ao fechamento',
          'Noticias econômicas impactam fortemente',
          'Mercado global influencia abertura',
        ],
      },
      {
        name: 'Dólar Americano',
        symbol: 'USD',
        type: 'commodity',
        characteristics: [
          'Safe haven durante crises',
          'Afeta importações/exportações',
          'Correlação negativa com ações brasileiras',
          'Influenciado por taxa Fed',
          'Pico volatilidade em data de divulgação de dados',
        ],
        volatilityProfile: 'medium',
        tradingHours: { open: '08:00', close: '17:00', timezone: 'BRT' },
        specialRules: [
          'Impacto direto em brasileiras exportadoras',
          'Afeta commodities em dólar',
          'Boas oportunidades em dados da Fed',
        ],
      },
      {
        name: 'Petróleo Brent',
        symbol: 'PETR',
        type: 'commodity',
        characteristics: [
          'Commodity global',
          'Impacta Petrobras (PETR4)',
          'Mercado 24h',
          'Alta correlação com economia global',
          'Supply/demand criam volatilidade',
        ],
        volatilityProfile: 'high',
        tradingHours: { open: '00:00', close: '23:59', timezone: 'BRT' },
        specialRules: [
          'Maior liquides em horários europeus/americanos',
          'Geopolítica impacta muito',
          'Padrões técnicos funcionam bem',
        ],
      },
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        type: 'crypto',
        characteristics: [
          'Mercado 24/7',
          'Alta volatilidade',
          'Seguidor de sentimento',
          'Impacto das redes sociais forte',
          'Correlação com risco crescente',
        ],
        volatilityProfile: 'high',
        tradingHours: { open: '00:00', close: '23:59', timezone: 'UTC' },
        specialRules: [
          'Abertura de mercado tradicional causa movimentos',
          'Líderes de opinião podem viralizar',
          'Regulação causa volatilidade extrema',
          'Volume extremo em trocas de preço redondo',
        ],
      },
      {
        name: 'Gold (Ouro)',
        symbol: 'GOLD',
        type: 'commodity',
        characteristics: [
          'Safe haven por excelência',
          'Sobe em crises',
          'Segue Fed e taxa de juros',
          'Mercado 24h liquidez alta',
          'Inflação impacta positivamente',
        ],
        volatilityProfile: 'medium',
        tradingHours: { open: '00:00', close: '23:59', timezone: 'UTC' },
        specialRules: [
          'Picos em datas de inflação',
          'Fed hawkish = ouro cai',
          'Crises geopolíticas = subida',
          'Divergências técnicas são sinais forte',
        ],
      },
      {
        name: 'PETR4',
        symbol: 'PETR4',
        type: 'stock',
        characteristics: [
          'Ação blue-chip',
          'Dividendos atrativos',
          'Correlação com petróleo',
          'Correlação com dólar',
          'Bastante líquida',
        ],
        volatilityProfile: 'medium',
        tradingHours: { open: '10:00', close: '17:00', timezone: 'BRT' },
        specialRules: [
          'Acompanha petróleo Brent',
          'Dólar alto = ganhos (exportação)',
          'Dólar baixo = custos',
          'Notícias corporativas causam gaps',
        ],
      },
      {
        name: 'VALE3',
        symbol: 'VALE3',
        type: 'stock',
        characteristics: [
          'Mineradora de ferro/níquel',
          'Exportadora em dólar',
          'Correlação com China',
          'Demanda global de minérios',
          'Volatilidade média-alta',
        ],
        volatilityProfile: 'medium',
        tradingHours: { open: '10:00', close: '17:00', timezone: 'BRT' },
        specialRules: [
          'China abre depois do Brasil',
          'Demanda asiática impacta preço',
          'Dados de crescimento chines são catalistas',
          'Preço do ferro no mercado futuro é antecedente',
        ],
      },
      {
        name: 'MGLU3',
        symbol: 'MGLU3',
        type: 'stock',
        characteristics: [
          'Varejista e e-commerce',
          'Alta sensibilidade econômica',
          'Velocidade de negociação rápida',
          'Impacto de campanhas promocionais',
          'Volatilidade alta',
        ],
        volatilityProfile: 'high',
        tradingHours: { open: '10:00', close: '17:00', timezone: 'BRT' },
        specialRules: [
          'Black Friday causa volatilidade extrema',
          'Sazonalidade clara (datas especiais)',
          'Resultado trimestral movem muito',
          'Sentimento de economia brasileira é fator',
        ],
      },
    ];

    this.marketKnowledge.assets = mainAssets;
  }

  private initializeStrategies(): void {
    // Estratégias otimizadas para Bullex
    const strategies: BullexStrategyTemplate[] = [
      {
        id: 'pullback_breakout',
        name: 'Pullback após Rompimento',
        description: 'Compre ou venda quando o preço rompe resistência/suporte, faz pullback, e retorna',
        requiredIndicators: ['RSI', 'MACD', 'Média Móvel'],
        entryConditions: [
          'Rompimento de resistência com volume crescente',
          'Pullback volta para a resistência (agora suporte)',
          'RSI > 50 confirmando força',
          'Volume começa a crescer novamente',
        ],
        exitConditions: [
          'Duas vezes a distância do risco (2:1 RR)',
          'Quebra do suporte formado no pullback',
          'RSI entra em overbought (> 70)',
          'Tempo máximo: 60 minutos',
        ],
        riskManagement: 'Stop na máxima do pullback. Tamanho de posição: 2% da conta por trade.',
        successRate: 72,
        bestAssets: ['IBOV', 'PETR4', 'USD'],
        timeframes: ['1m', '5m', '15m'],
      },
      {
        id: 'oversold_bounce',
        name: 'Bounce em Sobrevenda',
        description: 'Compre quando RSI cai abaixo de 30 em suporte',
        requiredIndicators: ['RSI', 'Volume', 'Suporte/Resistência'],
        entryConditions: [
          'RSI abaixo de 30',
          'Preço em zona de suporte histórico',
          'Volume aumenta no movimento para baixo',
          'Vela de reversão (martelo ou pin bar)',
        ],
        exitConditions: [
          'RSI acima de 50-60 ou até overbought',
          'Resistência próxima acima',
          'Stop no mínimo da vela de entrada',
          'Tempo máximo: 30 minutos',
        ],
        riskManagement: 'Stop na mínima do candle. Ganho mínimo esperado 1.5x do risco.',
        successRate: 68,
        bestAssets: ['BTC', 'IBOV', 'MGLU3'],
        timeframes: ['1m', '5m'],
      },
      {
        id: 'macd_crossover',
        name: 'MACD Cruzamento com Confirmação',
        description: 'MACD cruzando linha zero com confluência de outros indicadores',
        requiredIndicators: ['MACD', 'RSI', 'Banda de Bollinger'],
        entryConditions: [
          'MACD cruza acima da linha zero (bullish) ou abaixo (bearish)',
          'RSI não em extremo (30-70 apenas)',
          'Preço próximo a média móvel de 20',
          'Volume em crescimento na direção',
        ],
        exitConditions: [
          'MACD cruza de volta pela linha zero',
          'RSI entra em extremo (< 20 ou > 80)',
          'Resistência/suporte quebrada',
          'Tempo máximo: 45 minutos',
        ],
        riskManagement: 'Stop no mínimo/máximo da vela de confirmação. 2% de risco por operação.',
        successRate: 65,
        bestAssets: ['USD', 'GOLD', 'VALE3'],
        timeframes: ['5m', '15m'],
      },
      {
        id: 'divergence_reversal',
        name: 'Divergência para Reversão',
        description: 'RSI diverge enquanto preço faz novo extremo',
        requiredIndicators: ['RSI', 'Padrões de Preço', 'Volume'],
        entryConditions: [
          'Preço faz novo máximo mas RSI não confirma',
          'Zona de resistência histórica próxima',
          'Volume decrescente na alta',
          'Vela de reversão se forma',
        ],
        exitConditions: [
          'Suporte quebrado',
          'RSI volta ao extremo',
          'Tempo máximo: 90 minutos',
          '2x do risco em ganho',
        ],
        riskManagement: 'Stop bem acima da resistência. Divergência = risco controlável.',
        successRate: 70,
        bestAssets: ['PETR4', 'BTC', 'IBOV'],
        timeframes: ['5m', '15m', '1h'],
      },
      {
        id: 'support_resistance_trade',
        name: 'Trade em Suporte/Resistência',
        description: 'Trade perfeito em zonas de suporte e resistência consolidadas',
        requiredIndicators: ['Suporte/Resistência', 'Volume', 'Padrões'],
        entryConditions: [
          'Múltiplos toques em zona (3+ toques)',
          'Zona consolidada por 10+ minutos',
          'RSI entre 40-60 (neutral)',
          'Volume baixo na zona (consolidação)',
        ],
        exitConditions: [
          'Rompimento com volume',
          'Bounce da zona com 1.5-2x de risco',
          'Tempo máximo: 120 minutos',
          'Stop sempre no outro lado da zona',
        ],
        riskManagement: 'Micro-posição para menor risco. Zone é fácil de identificar.',
        successRate: 66,
        bestAssets: ['Qualquer'],
        timeframes: ['5m', '15m', '1h'],
      },
    ];

    this.marketKnowledge.strategies = strategies;
  }

  // Obtém recomendação de estratégia para um ativo
  public getStrategyRecommendation(asset: string, context: any): BullexStrategyTemplate | null {
    const assetInfo = this.marketKnowledge.assets.find(a => a.symbol === asset);
    if (!assetInfo) return null;

    // Seleciona estratégia melhor para ativo e contexto
    const applicable = this.marketKnowledge.strategies.filter(
      s => s.bestAssets.includes(asset) || s.bestAssets.includes('Qualquer')
    );

    // Pontuação por taxa de sucesso
    return applicable.sort((a, b) => b.successRate - a.successRate)[0] || null;
  }

  // Obtém informações do ativo
  public getAssetInfo(symbol: string): BullexAsset | undefined {
    return this.marketKnowledge.assets.find(a => a.symbol === symbol);
  }

  // Valida se hora é boa para tradear um ativo
  public isOptimalTradingTime(symbol: string): boolean {
    const asset = this.getAssetInfo(symbol);
    if (!asset) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [openHour, openMin] = asset.tradingHours.open.split(':').map(Number);
    const [closeHour, closeMin] = asset.tradingHours.close.split(':').map(Number);

    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    // Ótimo: primeira hora após abertura e meia hora antes do fechamento
    const isFirstHour = currentTime >= openTime && currentTime < openTime + 60;
    const isNearClose = currentTime > closeTime - 30 && currentTime <= closeTime;

    return isFirstHour || isNearClose;
  }

  // Registra performance de um trade
  public recordTradePerformance(symbol: string, result: 'WIN' | 'LOSS'): void {
    if (!this.assetPerformance.has(symbol)) {
      this.assetPerformance.set(symbol, { wins: 0, losses: 0 });
    }

    const stats = this.assetPerformance.get(symbol)!;
    if (result === 'WIN') {
      stats.wins++;
    } else {
      stats.losses++;
    }
  }

  // Obtém stats de performance por ativo
  public getAssetPerformance(symbol: string): { wins: number; losses: number; winRate: number } {
    const stats = this.assetPerformance.get(symbol) || { wins: 0, losses: 0 };
    const total = stats.wins + stats.losses;
    return {
      ...stats,
      winRate: total > 0 ? stats.wins / total : 0,
    };
  }

  // Obtém todos os ativos
  public getAllAssets(): BullexAsset[] {
    return this.marketKnowledge.assets;
  }

  // Obtém todas as estratégias
  public getAllStrategies(): BullexStrategyTemplate[] {
    return this.marketKnowledge.strategies;
  }

  // Adiciona nova estratégia customizada
  public addCustomStrategy(strategy: BullexStrategyTemplate): void {
    this.marketKnowledge.strategies.push(strategy);
    this.saveBullexKnowledge();
  }

  // Persistência
  private loadBullexKnowledge(): BullexMarketKnowledge {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao carregar conhecimento Bullex:', e);
      }
    }
    return {
      assets: [],
      strategies: [],
      tradingRules: [],
      platformFeatures: [],
      optimalTradingTimes: [],
    };
  }

  private saveBullexKnowledge(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.marketKnowledge));
    } catch (error) {
      console.error('Erro ao salvar conhecimento Bullex:', error);
    }
  }
}

// Exporta instância global
export const bullexIntegration = new BullexIntegration();
