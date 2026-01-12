// Sistema Avançado de Aprendizado de Mercado
// Integração com múltiplas fontes de conhecimento

export interface MarketDataSource {
  name: string;
  url: string;
  category: 'news' | 'analysis' | 'economic' | 'sentiment';
  updateFrequency: number; // em ms
}

export interface MarketKnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  asset?: string;
  relevance: number; // 0-100
  timestamp: number;
  tags: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface AIKnowledgeBase {
  entries: MarketKnowledgeEntry[];
  lastUpdated: number;
  totalEntries: number;
}

// Configuração de fontes de dados
const MARKET_DATA_SOURCES: MarketDataSource[] = [
  {
    name: 'Financial Times',
    url: 'https://www.ft.com',
    category: 'news',
    updateFrequency: 3600000, // 1 hora
  },
  {
    name: 'Bloomberg',
    url: 'https://www.bloomberg.com',
    category: 'analysis',
    updateFrequency: 3600000,
  },
  {
    name: 'Reuters',
    url: 'https://www.reuters.com',
    category: 'news',
    updateFrequency: 3600000,
  },
  {
    name: 'Investing.com',
    url: 'https://www.investing.com',
    category: 'economic',
    updateFrequency: 1800000, // 30 minutos
  },
  {
    name: 'TradingView Ideas',
    url: 'https://www.tradingview.com/ideas/',
    category: 'analysis',
    updateFrequency: 3600000,
  },
];

// Palavras-chave para análise de relevância
const RELEVANCE_KEYWORDS = {
  technical: ['RSI', 'MACD', 'média móvel', 'suporte', 'resistência', 'rompimento', 'tendência', 'volatilidade'],
  sentiment: ['sentimento', 'bullish', 'bearish', 'confiança', 'medo', 'ganância'],
  economic: ['inflação', 'taxa de juros', 'PIB', 'desemprego', 'dólar', 'juros'],
  market: ['volume', 'liquidez', 'open interest', 'viés', 'padrão', 'divergência'],
};

export class AdvancedMarketLearning {
  private knowledgeBase: AIKnowledgeBase;
  private learningHistory: Map<string, number> = new Map(); // rastreamento de aprendizado
  private readonly STORAGE_KEY = 'advanced_market_knowledge';
  private readonly MAX_ENTRIES = 5000;

  constructor() {
    this.knowledgeBase = this.loadKnowledgeBase();
    this.initializeLearning();
  }

  // Inicializa o sistema de aprendizado
  private initializeLearning(): void {
    this.scheduleKnowledgeUpdates();
    this.loadHistoricalData();
  }

  // Agenda atualizações periódicas de conhecimento
  private scheduleKnowledgeUpdates(): void {
    MARKET_DATA_SOURCES.forEach(source => {
      setInterval(() => {
        this.fetchAndLearnFromSource(source);
      }, source.updateFrequency);
    });
  }

  // Busca conhecimento de uma fonte
  private async fetchAndLearnFromSource(source: MarketDataSource): Promise<void> {
    try {
      // Em produção, isso faria requisições reais
      const knowledge = await this.parseMarketData(source);
      this.integrateKnowledge(knowledge);
    } catch (error) {
      console.error(`Erro ao buscar conhecimento de ${source.name}:`, error);
    }
  }

  // Simula parsing de dados de mercado (em produção usaria APIs reais)
  private async parseMarketData(source: MarketDataSource): Promise<MarketKnowledgeEntry[]> {
    const entries: MarketKnowledgeEntry[] = [];
    
    // Simulação com conhecimento base expandido
    const baseKnowledge = this.generateBaseMarketKnowledge(source);
    
    return baseKnowledge;
  }

  // Gera conhecimento base sobre mercado
  private generateBaseMarketKnowledge(source: MarketDataSource): MarketKnowledgeEntry[] {
    const knowledge: MarketKnowledgeEntry[] = [];

    const technicalConcepts = [
      {
        title: 'Análise Avançada de Suporte e Resistência',
        content: 'Níveis de suporte e resistência não são apenas preços exatos, mas zonas. Quando múltiplos toques ocorrem em uma zona, a probabilidade de reversão aumenta. Micro-estrutura de mercado e análise de ordem podem identificar níveis mais precisos.',
        category: 'technical',
        tags: ['suporte', 'resistência', 'zonas', 'micro-estrutura'],
      },
      {
        title: 'Confluência de Indicadores',
        content: 'A verdadeira força vem quando múltiplos indicadores convergem. RSI sobrevendido + MACD negativo + preço abaixo de média móvel = sinal muito mais confiável. Sempre busque confirmações de 2-3 indicadores.',
        category: 'technical',
        tags: ['RSI', 'MACD', 'confirmação', 'confluência'],
      },
      {
        title: 'Análise de Volume e Estrutura de Preço',
        content: 'Volume é o combustível dos movimentos. Rompimentos em volume crescente têm 70%+ de taxa de sucesso. Leia a estrutura: acumulação (volume baixo, preço lateral), disparo (volume alto, movimento direto).',
        category: 'technical',
        tags: ['volume', 'acumulação', 'disparo', 'estrutura'],
      },
      {
        title: 'Padrões de Velas Japonesas Avançados',
        content: 'Além dos padrões básicos, procure por sequências: 3 velas do mesmo tipo indicam força, engulfing com volume alto = reversão alta probabilidade, doji em zona extrema = mudança de sentimento.',
        category: 'technical',
        tags: ['velas', 'padrões', 'engulfing', 'doji'],
      },
      {
        title: 'Análise de Divergências',
        content: 'Divergência entre preço e indicadores (RSI, MACD, Estocástico) antecipa reversões com 60-75% de precisão. Preço faz novo máximo mas indicador não = possível topo próximo.',
        category: 'technical',
        tags: ['divergência', 'reversão', 'topo', 'fundo'],
      },
    ];

    const sentimentConcepts = [
      {
        title: 'Sentimento de Mercado e Comportamento de Rebanho',
        content: 'Mercados são psicologia. Quando todos são bullish, é hora de cuidado. Fear & Greed Index extremo = oportunidade. Contrarie a multidão com confirmação técnica.',
        category: 'sentiment',
        tags: ['sentimento', 'psicologia', 'comportamento', 'rebanho'],
      },
      {
        title: 'Análise de Notícias e Impacto de Eventos',
        content: 'Notícias ruins podem criar oportunidade de compra se o técnico for forte. Notícias boas podem ser "venda a notícia". O timing relativo ao candle é crucial.',
        category: 'sentiment',
        tags: ['notícias', 'eventos', 'impacto', 'timing'],
      },
    ];

    const economicConcepts = [
      {
        title: 'Calendário Econômico e Dados Macroeconômicos',
        content: 'Taxa de juros, inflação, desemprego movem mercados. Antes de eventos importantes (FOMC, relatório de empregos), volatilidade explode. Saiba quando eventos-chave ocorrem.',
        category: 'economic',
        tags: ['calendário', 'macro', 'taxa de juros', 'inflação'],
      },
      {
        title: 'Correlação Entre Ativos',
        content: 'Dólar forte geralmente = commodities fracas = ações de exportadores fracas. Ouro sobe quando ações caem. Compreender correlações ajuda em análise de múltiplos ativos.',
        category: 'economic',
        tags: ['correlação', 'dólar', 'ouro', 'commodities'],
      },
    ];

    const allConcepts = [...technicalConcepts, ...sentimentConcepts, ...economicConcepts];

    allConcepts.forEach((concept, index) => {
      knowledge.push({
        id: `${source.name.toLowerCase()}_${index}_${Date.now()}`,
        title: concept.title,
        content: concept.content,
        source: source.name,
        category: concept.category,
        relevance: Math.random() * 40 + 60, // 60-100
        timestamp: Date.now(),
        tags: concept.tags,
        impact: 'high',
      });
    });

    return knowledge;
  }

  // Integra novo conhecimento na base
  private integrateKnowledge(entries: MarketKnowledgeEntry[]): void {
    entries.forEach(entry => {
      // Evita duplicatas baseado em similaridade
      const isDuplicate = this.knowledgeBase.entries.some(
        e => this.calculateSimilarity(e.content, entry.content) > 0.8
      );

      if (!isDuplicate) {
        this.knowledgeBase.entries.push(entry);
      }
    });

    // Manter limite de tamanho
    if (this.knowledgeBase.entries.length > this.MAX_ENTRIES) {
      this.knowledgeBase.entries = this.knowledgeBase.entries
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, this.MAX_ENTRIES);
    }

    this.knowledgeBase.lastUpdated = Date.now();
    this.knowledgeBase.totalEntries = this.knowledgeBase.entries.length;
    this.saveKnowledgeBase();
  }

  // Calcula similaridade entre dois textos (Levenshtein simplificado)
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\W+/);
    const words2 = str2.toLowerCase().split(/\W+/);
    const common = words1.filter(w => words2.includes(w)).length;
    return common / Math.max(words1.length, words2.length);
  }

  // Carrega dados históricos relevantes
  private loadHistoricalData(): void {
    // Em produção, carregaria dados históricos de APIs
    console.log('Carregando dados históricos de mercado...');
  }

  // Busca conhecimento relevante para um contexto
  public searchRelevantKnowledge(query: string, limit: number = 10): MarketKnowledgeEntry[] {
    const queryTokens = query.toLowerCase().split(/\W+/);
    
    const scored = this.knowledgeBase.entries.map(entry => {
      let score = entry.relevance;
      
      // Boost se tags combinam
      const tagMatches = queryTokens.filter(q => entry.tags.some(t => t.toLowerCase().includes(q)));
      score += tagMatches.length * 10;
      
      // Boost se título ou conteúdo contém tokens
      const contentMatches = queryTokens.filter(q => 
        entry.title.toLowerCase().includes(q) || entry.content.toLowerCase().includes(q)
      );
      score += contentMatches.length * 5;
      
      return { entry, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.entry);
  }

  // Recomenda estratégia baseada em contexto de mercado
  public recommendStrategy(context: {
    asset: string;
    currentTrend: 'up' | 'down' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    marketSentiment: 'bullish' | 'bearish' | 'neutral';
  }): string {
    const relevant = this.searchRelevantKnowledge(
      `${context.asset} ${context.currentTrend} ${context.volatility} ${context.marketSentiment}`
    );

    let recommendation = '';

    if (context.currentTrend === 'up' && context.volatility === 'high') {
      recommendation = 'Mercado em alta com volatilidade. Use confluência de indicadores. Procure por pullbacks em suporte para compra.';
    } else if (context.currentTrend === 'down' && context.volatility === 'high') {
      recommendation = 'Mercado em queda com volatilidade. Procure por zonas de sobrevenda (RSI < 30) para possível bounce.';
    } else if (context.currentTrend === 'neutral' && context.volatility === 'low') {
      recommendation = 'Consolidação em baixa volatilidade. Aguarde rompimento confirmado por volume crescente.';
    }

    // Adiciona conhecimento relevante
    if (relevant.length > 0) {
      recommendation += `\n\nContexto relevante: ${relevant[0].content}`;
    }

    return recommendation;
  }

  // Aprende com resultados de sinais
  public learnFromSignalResult(
    signalId: string,
    result: 'WIN' | 'LOSS',
    context: any
  ): void {
    const key = `signal_${signalId}`;
    const currentCount = this.learningHistory.get(key) || 0;
    this.learningHistory.set(key, currentCount + (result === 'WIN' ? 1 : -1));
  }

  // Obtém estatísticas de aprendizado
  public getLearningStats(): {
    totalEntriesLearned: number;
    successRate: number;
    topCategories: string[];
  } {
    const successCount = Array.from(this.learningHistory.values()).filter(v => v > 0).length;
    const totalAttempts = this.learningHistory.size;
    
    const categoryCount = new Map<string, number>();
    this.knowledgeBase.entries.forEach(entry => {
      categoryCount.set(entry.category, (categoryCount.get(entry.category) || 0) + 1);
    });

    return {
      totalEntriesLearned: this.knowledgeBase.totalEntries,
      successRate: totalAttempts > 0 ? successCount / totalAttempts : 0,
      topCategories: Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat),
    };
  }

  // Exporta conhecimento aprendido
  public exportKnowledge(): string {
    return JSON.stringify(this.knowledgeBase, null, 2);
  }

  // Importa conhecimento externo
  public importKnowledge(jsonData: string): void {
    try {
      const imported = JSON.parse(jsonData) as AIKnowledgeBase;
      this.knowledgeBase.entries.push(...imported.entries);
      this.integrateKnowledge([]);
    } catch (error) {
      console.error('Erro ao importar conhecimento:', error);
    }
  }

  // Persistência
  private loadKnowledgeBase(): AIKnowledgeBase {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao carregar base de conhecimento:', e);
      }
    }
    return {
      entries: [],
      lastUpdated: Date.now(),
      totalEntries: 0,
    };
  }

  private saveKnowledgeBase(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.knowledgeBase));
    } catch (error) {
      console.error('Erro ao salvar base de conhecimento:', error);
    }
  }
}

// Exporta instância global
export const advancedMarketLearning = new AdvancedMarketLearning();
