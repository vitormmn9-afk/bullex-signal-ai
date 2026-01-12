// Web Integration System - IA pesquisa e aprende da internet

export interface MarketInsight {
  source: string;
  topic: string;
  content: string;
  timestamp: number;
  relevanceScore: number;
}

export interface LearningResource {
  keyword: string;
  insights: MarketInsight[];
  lastUpdated: number;
}

const LEARNING_STORAGE_KEY = 'bullex_web_learning_data';
const MARKET_KNOWLEDGE_STORAGE_KEY = 'bullex_market_knowledge';

// Simulação de fontes de conhecimento (em produção, seria integração com APIs reais)
const MARKET_KNOWLEDGE_BASE: Record<string, string[]> = {
  'price_patterns': [
    'Um padrão de duplo topo indica possível reversão de tendência',
    'Padrões de triângulo convergente geralmente resultam em rompimento',
    'Ombro-cabeça-ombro é um dos padrões mais confiáveis para reversão',
    'Bandeiras e flâmulas são padrões de continuação de forte poder preditivo',
    'Cunhas são padrões de reversão com alta taxa de sucesso em mercados em tendência'
  ],
  'candlestick_analysis': [
    'Velas Doji indicam indecisão e frequentemente precedem reversões',
    'Martelo (Hammer) em suporte é um forte sinal de alta',
    'Estrela cadente (Shooting Star) em resistência sugere possível queda',
    'Envolvente (Engulfing) bullish/bearish tem altíssima confiabilidade',
    'Velas sequenciais (3 do mesmo tipo) indicam força na direção',
    'Corpo branco/preto forte com baixa sombra mostra força direcional',
    'Velas pequenas indicam consolidação antes de movimento grande'
  ],
  'indicator_signals': [
    'RSI acima de 70 indica condição de sobrecompra, sinal de venda',
    'RSI abaixo de 30 indica condição de sobrevenda, sinal de compra',
    'MACD cruzando para cima indica início de tendência bullish',
    'MACD cruzando para baixo indica início de tendência bearish',
    'Bandas de Bollinger tocando 2 desvios padrão indica extremo',
    'Quando preço se afasta do MACD pode indicar fim de movimento',
    'Convergência de múltiplos indicadores aumenta confiabilidade'
  ],
  'volume_analysis': [
    'Volume crescente confirma rompimento de resistência/suporte',
    'Volume decrescente em rompimento sugere falsa saída',
    'Volume extremo pode indicar ponto de reversão',
    'Volume deve expandir na direção da tendência para confirmação',
    'Perfil de volume revela áreas de maior interesse de mercado'
  ],
  'risk_management': [
    'O stop loss deve ser colocado 2-3% abaixo do ponto de entrada',
    'A razão risco/retorno ideal é 1:2 ou superior',
    'Nunca arrisque mais de 2% do capital em um único trade',
    'Use trailing stops para proteger lucros em tendências fortes',
    'Consolidações oferecem melhores pontos de entrada com menor risco'
  ],
  'market_conditions': [
    'Mercados em range lateral são bons para vendas em resistência e compras em suporte',
    'Tendências fortes funcionam melhor com breakouts',
    'Maior volume de negócios ocorre nas primeiras 2 horas e na reta final',
    'Volatilidade aumenta próximo a anúncios econômicos',
    'Correlações entre ativos ajudam a confirmar sinais'
  ],
  'trading_psychology': [
    'Siga o plano de trading e não altere-o durante a operação',
    'Emocões são o inimigo do trader - use regras sistemáticas',
    'Perda consecutiva diminui confiança, fazer break é saudável',
    'Ganhos consecutivos podem levar ao excesso de confiança',
    'Registre cada operação para análise posterior e aprendizado'
  ],
  'technical_confluence': [
    'Quando múltiplos indicadores concordam, a confiabilidade aumenta muito',
    'Suporte/resistência confirmado por múltiplos toques tem mais poder',
    'Padrão gráfico + indicador extremo = altíssima confiabilidade',
    'Preço no nível de Fibonacci + RSI extremo = setup poderoso',
    'Divergência de indicador + padrão gráfico sugere reversão próxima'
  ]
};

// Sistema de aprendizado web
export class WebLearningSystem {
  private knowledgeBase: Map<string, LearningResource> = new Map();
  private cachedInsights: MarketInsight[] = [];

  constructor() {
    this.loadKnowledgeBase();
  }

  // Simula pesquisa na internet sobre um tópico
  async searchMarketKnowledge(topic: string, keywords: string[] = []): Promise<MarketInsight[]> {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
    const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    let fetched: MarketInsight[] = [];

    // Tenta buscar via Edge Function (Wikipedia)
    if (supabaseUrl && anonKey) {
      try {
        const fnUrl = supabaseUrl.replace('.supabase.co', '.functions.supabase.co') + '/fetch-knowledge';
        const res = await fetch(fnUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ topic, keywords }),
        });
        if (res.ok) {
          const data = await res.json();
          const insights = (data?.insights || []) as Array<{ source: string; title: string; url: string; summary: string }>;
          fetched = insights.map((i) => ({
            source: i.source || 'wikipedia',
            topic: topic,
            content: `${i.title}: ${i.summary}`.trim(),
            timestamp: Date.now(),
            relevanceScore: 0.8,
          }));
        }
      } catch (e) {
        console.warn('Falha ao consultar Edge Function:', e);
      }
    }

    // Fallback para base local se não houver dados externos
    if (fetched.length === 0) {
      const lowerTopic = topic.toLowerCase();
      let relevantKnowledge: string[] = [];
      if (lowerTopic.includes('vela') || lowerTopic.includes('candle')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['candlestick_analysis'] || [];
      } else if (lowerTopic.includes('padrão') || lowerTopic.includes('pattern')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['price_patterns'] || [];
      } else if (lowerTopic.includes('indicador') || lowerTopic.includes('rsi') || lowerTopic.includes('macd')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['indicator_signals'] || [];
      } else if (lowerTopic.includes('volume')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['volume_analysis'] || [];
      } else if (lowerTopic.includes('risco') || lowerTopic.includes('stop') || lowerTopic.includes('money')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['risk_management'] || [];
      } else if (lowerTopic.includes('mercado') || lowerTopic.includes('market')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['market_conditions'] || [];
      } else if (lowerTopic.includes('psicologia') || lowerTopic.includes('psychology')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['trading_psychology'] || [];
      } else if (lowerTopic.includes('confluência') || lowerTopic.includes('confluence')) {
        relevantKnowledge = MARKET_KNOWLEDGE_BASE['technical_confluence'] || [];
      }
      fetched = relevantKnowledge.map((content) => ({
        source: 'Market Knowledge Base',
        topic: topic,
        content: content,
        timestamp: Date.now(),
        relevanceScore: 0.7 + (Math.random() * 0.3),
      }));
    }

    this.cachedInsights = [...this.cachedInsights, ...fetched].slice(-300);
    this.saveKnowledgeBase();
    // Persistir insights no Supabase (best-effort)
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const rows = fetched.map(f => ({ source: f.source, title: f.content.split(':')[0], url: null, summary: f.content, topic }));
      if (rows.length > 0) {
        const supa: any = supabase as any;
        void supa.from('ai_insights').insert(rows);
      }
    } catch {}
    return fetched;
  }

  // Consulta conhecimento aprendido para aplicar na análise
  getApplicableInsights(analysisContext: {
    candlePattern?: string;
    indicators?: string[];
    marketCondition?: string;
  }): MarketInsight[] {
    let contextKeywords: string[] = [];
    
    if (analysisContext.candlePattern) {
      contextKeywords.push('vela', 'candle', analysisContext.candlePattern.toLowerCase());
    }
    
    if (analysisContext.indicators) {
      contextKeywords.push(...analysisContext.indicators.map(i => i.toLowerCase()));
    }
    
    if (analysisContext.marketCondition) {
      contextKeywords.push(analysisContext.marketCondition.toLowerCase());
    }

    // Filtra insights relevantes baseado no contexto
    return this.cachedInsights.filter(insight => {
      const insightLower = insight.content.toLowerCase();
      return contextKeywords.some(keyword => insightLower.includes(keyword));
    }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  }

  // Simula aprendizado contínuo da IA
  async continuousLearning(): Promise<void> {
    const topics = [
      'padrões de velas',
      'análise de volume',
      'gerenciamento de risco',
      'confluência técnica',
      'psicologia do trading'
    ];

    for (const topic of topics) {
      await this.searchMarketKnowledge(topic);
    }
  }

  // Salva base de conhecimento no localStorage
  private saveKnowledgeBase(): void {
    const data = {
      insights: this.cachedInsights,
      timestamp: Date.now()
    };
    localStorage.setItem(MARKET_KNOWLEDGE_STORAGE_KEY, JSON.stringify(data));
  }

  // Carrega base de conhecimento do localStorage
  private loadKnowledgeBase(): void {
    const stored = localStorage.getItem(MARKET_KNOWLEDGE_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.cachedInsights = data.insights || [];
      } catch (e) {
        console.error('Erro ao carregar base de conhecimento:', e);
      }
    }
  }

  // Retorna insights agregados para debug
  getAllInsights(): MarketInsight[] {
    return this.cachedInsights;
  }

  // Obtém estatísticas de aprendizado
  getLearningStats() {
    return {
      totalInsightsLearned: this.cachedInsights.length,
      lastUpdated: this.cachedInsights.length > 0 ? this.cachedInsights[0].timestamp : null,
      averageRelevance: this.cachedInsights.length > 0 
        ? this.cachedInsights.reduce((a, b) => a + b.relevanceScore, 0) / this.cachedInsights.length 
        : 0
    };
  }
}

// Instância global do sistema de aprendizado
export const webLearningSystem = new WebLearningSystem();
