// Sistema de Chat para Treinamento e Aperfeiçoamento da IA
// Permite diálogo contínuo com a IA para evolução

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  context?: string; // contexto de mercado quando enviado
  feedback?: 'helpful' | 'not_helpful' | 'neutral';
  relatedSignals?: string[]; // IDs de sinais relacionados
}

export interface TrainingSession {
  id: string;
  startTime: number;
  endTime?: number;
  messages: ChatMessage[];
  topic: string; // ex: 'strategy_improvement', 'market_analysis', 'signal_validation'
  improvements: string[]; // melhorias aplicadas nesta sessão
  rating: number; // 1-5 feedback do usuário
}

export interface AICapability {
  name: string;
  description: string;
  successRate: number;
  examples: string[];
  trainingSessions: number;
  lastImproved: number;
}

export class AITrainingChat {
  private chatHistory: ChatMessage[] = [];
  private trainingSessions: TrainingSession[] = [];
  private aiCapabilities: AICapability[] = [];
  private currentSession: TrainingSession | null = null;
  private readonly STORAGE_KEY_CHAT = 'ai_chat_history';
  private readonly STORAGE_KEY_SESSIONS = 'ai_training_sessions';
  private readonly STORAGE_KEY_CAPABILITIES = 'ai_capabilities';
  private readonly MAX_MESSAGES_PER_SESSION = 50;

  constructor() {
    this.chatHistory = this.loadChatHistory();
    this.trainingSessions = this.loadTrainingSessions();
    this.aiCapabilities = this.initializeCapabilities();
  }

  private initializeCapabilities(): AICapability[] {
    return [
      {
        name: 'Análise Técnica Avançada',
        description: 'Análise completa de padrões, indicadores e estrutura de preço',
        successRate: 0.72,
        examples: [
          'Identifique o padrão de vela neste gráfico',
          'Qual é a confirmação para este rompimento?',
          'Analise a divergência entre preço e RSI',
        ],
        trainingSessions: 12,
        lastImproved: Date.now(),
      },
      {
        name: 'Recomendação de Estratégia',
        description: 'Recomenda melhor estratégia para condição de mercado',
        successRate: 0.68,
        examples: [
          'Qual estratégia usar neste mercado lateral?',
          'Qual indicador é melhor para alta volatilidade?',
          'Recomende uma estratégia para mercado em tendência',
        ],
        trainingSessions: 8,
        lastImproved: Date.now() - 86400000,
      },
      {
        name: 'Gestão de Risco',
        description: 'Cálculo e otimização de risk/reward e tamanho de posição',
        successRate: 0.81,
        examples: [
          'Qual é o melhor stop loss para este trade?',
          'Como calcular o tamanho ideal de posição?',
          'Qual é a razão risco/benefício aqui?',
        ],
        trainingSessions: 15,
        lastImproved: Date.now() - 172800000,
      },
      {
        name: 'Análise de Sentimento de Mercado',
        description: 'Interpreta sentimento do mercado e comportamento de massa',
        successRate: 0.65,
        examples: [
          'O mercado está muito pessimista ou otimista?',
          'Qual é o viés dominante agora?',
          'Isso é uma oportunidade de contrarian?',
        ],
        trainingSessions: 6,
        lastImproved: Date.now() - 259200000,
      },
      {
        name: 'Validação de Sinais',
        description: 'Valida e melhora qualidade dos sinais gerados',
        successRate: 0.74,
        examples: [
          'Este sinal é confiável? Por quê?',
          'Quais são os pontos fracos deste sinal?',
          'Como melhorar a qualidade deste sinal?',
        ],
        trainingSessions: 10,
        lastImproved: Date.now() - 43200000,
      },
    ];
  }

  // Inicia nova sessão de treinamento
  public startTrainingSession(topic: string): TrainingSession {
    this.currentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      messages: [],
      topic,
      improvements: [],
      rating: 0,
    };
    return this.currentSession;
  }

  // Envia mensagem no chat
  public sendMessage(
    content: string,
    context?: string,
    relatedSignalIds?: string[]
  ): { message: ChatMessage; response: ChatMessage } {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      timestamp: Date.now(),
      context,
      relatedSignals: relatedSignalIds,
    };

    // Processa a mensagem e gera resposta
    const response = this.generateAIResponse(userMessage);

    // Adiciona ao histórico
    this.chatHistory.push(userMessage);
    this.chatHistory.push(response);

    // Adiciona à sessão atual se existir
    if (this.currentSession) {
      this.currentSession.messages.push(userMessage);
      this.currentSession.messages.push(response);

      // Se atingiu limite, salva sessão
      if (this.currentSession.messages.length >= this.MAX_MESSAGES_PER_SESSION) {
        this.endTrainingSession();
      }
    }

    this.saveChatHistory();
    return { message: userMessage, response };
  }

  // Gera resposta da IA baseada na entrada
  private generateAIResponse(userMessage: ChatMessage): ChatMessage {
    const content = userMessage.content.toLowerCase();
    let responseText = '';

    // Análise simples de intenção da mensagem
    if (this.containsKeywords(content, ['padrão', 'vela', 'candle', 'análise técnica', 'técnica'])) {
      responseText = this.respondToTechnicalAnalysis(userMessage);
    } else if (this.containsKeywords(content, ['estratégia', 'melhor', 'qual', 'recomenda'])) {
      responseText = this.respondToStrategyQuery(userMessage);
    } else if (this.containsKeywords(content, ['risco', 'stop', 'tamanho', 'posição'])) {
      responseText = this.respondToRiskManagement(userMessage);
    } else if (this.containsKeywords(content, ['sentimento', 'medo', 'ganância', 'viés', 'humor'])) {
      responseText = this.respondToSentimentAnalysis(userMessage);
    } else if (this.containsKeywords(content, ['sinal', 'valida', 'confiá', 'qualida'])) {
      responseText = this.respondToSignalValidation(userMessage);
    } else if (this.containsKeywords(content, ['aprenda', 'melhore', 'evoluir', 'treina'])) {
      responseText = this.respondToTrainingRequest(userMessage);
    } else {
      responseText = this.respondToGeneral(userMessage);
    }

    return {
      id: `msg_${Date.now()}_ai`,
      role: 'ai',
      content: responseText,
      timestamp: Date.now(),
    };
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }

  private respondToTechnicalAnalysis(msg: ChatMessage): string {
    const responses = [
      `Análise Técnica Avançada:\n\n` +
      `Estou analisando o padrão que você mencionou. Para análise técnica preciso de:\n` +
      `1. Timeframe atual\n` +
      `2. Ativo/símbolo\n` +
      `3. Preço atual e histórico recente\n` +
      `4. Quais indicadores você quer usar?\n\n` +
      `Com essas informações, posso:\n` +
      `- Identificar padrões de velas\n` +
      `- Encontrar suporte/resistência\n` +
      `- Calcular confluência de indicadores\n` +
      `- Prever movimento provável`,

      `Para análise de padrões de velas, considere:\n\n` +
      `- **Corpos e Sombras**: Tamanho relativo importa\n` +
      `- **Sequência**: Velas individuais menos importantes que padrões\n` +
      `- **Volume**: Confirma ou nega o padrão\n` +
      `- **Contexto**: Onde no trend você está?\n` +
      `- **Confirmação**: Use sempre múltiplos indicadores\n\n` +
      `Qual padrão específico você quer analisar?`,

      `Convergência é a chave para análise confiável:\n\n` +
      `Se RSI + MACD + Suporte/Resistência + Volume concordam? = Sinal forte\n` +
      `Se apenas um indicador? = Ainda pode ser falso\n\n` +
      `Descreva o cenário e vou avaliar a confluência.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private respondToStrategyQuery(msg: ChatMessage): string {
    const responses = [
      `Para recomendar a melhor estratégia, preciso entender:\n\n` +
      `1. **Condição de Mercado**: Tendência (alta/baixa) ou lateral?\n` +
      `2. **Volatilidade**: Calma, normal ou extrema?\n` +
      `3. **Ativo**: Qual você quer tradear?\n` +
      `4. **Timeframe**: 1m, 5m, 15m ou maior?\n` +
      `5. **Seu Estilo**: Scalping rápido ou trades mais longos?\n\n` +
      `Com essas informações, vou recomendar a estratégia mais provável de lucro.`,

      `Estratégias por Condição:\n\n` +
      `**Mercado em Tendência Alta**:\n` +
      `- Pullback e continua\n` +
      `- Breakout acelerado\n` +
      `- Fuga de base\n\n` +
      `**Mercado em Tendência Baixa**:\n` +
      `- Shorting em resistência\n` +
      `- Fade de bounces\n` +
      `- Continuação na queda\n\n` +
      `**Mercado Lateral**:\n` +
      `- Mean reversion\n` +
      `- Trade no topo/fundo da range\n` +
      `- Breakout aguardando\n\n` +
      `Qual é a condição atual?`,

      `Cada ativo tem estratégias ideais:\n\n` +
      `- **IBOV**: Breakout e mean reversion\n` +
      `- **USD**: Harmônico patterns e correlações\n` +
      `- **BTC**: Sentiment-driven com técnica\n` +
      `- **Ações**: Volatilidade e notícias\n\n` +
      `Qual ativo você quer focar?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private respondToRiskManagement(msg: ChatMessage): string {
    const responses = [
      `Gestão de Risco é fundamental. Vamos estruturar:\n\n` +
      `**1. Stop Loss**\n` +
      `- Técnico: Abaixo de suporte ou mínima da vela\n` +
      `- Percentual: Geralmente 1-2% da conta por trade\n\n` +
      `**2. Take Profit**\n` +
      `- Risco/Benefício: Mínimo 1:2 (ideal 1:3+)\n` +
      `- Técnico: Próxima resistência importante\n\n` +
      `**3. Tamanho de Posição**\n` +
      `- Fórmula: (% risco) / (distância stop em %)\n` +
      `- Nunca arresque mais que 2% da conta\n\n` +
      `Quer que eu calcule o tamanho ideal para seu trade?`,

      `Para calcular tamanho de posição:\n\n` +
      `Exemplo:\n` +
      `- Conta: R$ 10.000\n` +
      `- Risco: 2% = R$ 200\n` +
      `- Entrada: R$ 100\n` +
      `- Stop: R$ 98\n` +
      `- Distância: R$ 2 por ação\n` +
      `- Quantidade: 200 / 2 = 100 ações\n\n` +
      `Com isso seu máximo risco é exatamente 2%!`,

      `Stop Loss precisa ser Smart:\n\n` +
      `❌ ERRADO: Parar fora de qualquer lógica\n` +
      `✅ CERTO: Abaixo de suporte estrutural\n\n` +
      `Seu stop deve fazer sentido técnico!\n` +
      `Se quebrar, significa sua tese errou.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private respondToSentimentAnalysis(msg: ChatMessage): string {
    const responses = [
      `Sentimento de Mercado é crucial:\n\n` +
      `**Indicadores de Sentimento**:\n` +
      `- VIX/Volatilidade: Alto = Medo\n` +
      `- Put/Call Ratio: Extremo = Oportunidade\n` +
      `- RSI em extremo: Sobrecompra/sobrevenda\n` +
      `- Divergências: Mudança de sentimento\n\n` +
      `**Trading Contrarian**:\n` +
      `Quando TODOS são bullish = prepare-se para queda\n` +
      `Quando TODOS são bearish = prepare-se para alta\n\n` +
      `Qual é o sentimento geral agora?`,

      `Psicologia de Mercado:\n\n` +
      `**Ciclo Típico**:\n` +
      `1. Otimismo → Compra agressiva\n` +
      `2. Euforia → Volume extremo\n` +
      `3. Dúvida → Sellers aparecem\n` +
      `4. Pânico → Dump agressivo\n` +
      `5. Desespero → Surrender\n` +
      `6. Esperança → Recuperação lenta\n\n` +
      `Onde estamos agora?`,

      `Quando o consenso está em um lado = Trade para o outro.\n\n` +
      `- Maioria bullish + preço alto = Setup de short\n` +
      `- Maioria bearish + preço baixo = Setup de long\n\n` +
      `Mas sempre confirme com técnica!`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private respondToSignalValidation(msg: ChatMessage): string {
    const responses = [
      `Para validar um sinal, checo:\n\n` +
      `**Força do Sinal**:\n` +
      `□ Múltiplos indicadores concordam?\n` +
      `□ Volume confirma a direção?\n` +
      `□ Confluência de níveis?\n` +
      `□ Estrutura do preço valida?\n\n` +
      `**Risco**:\n` +
      `□ Stop Loss definido?\n` +
      `□ Risco/Benefício favorável?\n` +
      `□ Tamanho de posição apropriado?\n\n` +
      `Descreva seu sinal para validação.`,

      `Sinal de Alta Qualidade tem:\n\n` +
      `✓ Confluência (3+ confirmações)\n` +
      `✓ Volume crescente\n` +
      `✓ Estrutura clara\n` +
      `✓ Risco/Recompensa 1:2+\n` +
      `✓ Saída definida\n\n` +
      `Sinal Fraco:\n` +
      `✗ Apenas 1 indicador\n` +
      `✗ Volume fraco\n` +
      `✗ Estrutura ambígua\n` +
      `✗ Risco vago`,

      `As piores razões para entrar:\n\n` +
      `❌ "Sinto que vai subir"\n` +
      `❌ Sigo o que o guru disse\n` +
      `❌ FOMO do movimento anterior\n` +
      `❌ Revenge trading\n` +
      `❌ Sem stop definido\n\n` +
      `Valide seus sinais com técnica!`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private respondToTrainingRequest(msg: ChatMessage): string {
    const responses = [
      `Ótimo! Quero evoluir junto com você.\n\n` +
      `Para melhorar, envie feedback:\n\n` +
      `1. **Sinal que gerou**: O que acertei? O que errei?\n` +
      `2. **Contexto de Mercado**: Como estava o mercado?\n` +
      `3. **Resultado Real**: Ganhou ou perdeu?\n` +
      `4. **O que mudaria**: Sua sugestão de melhoria\n\n` +
      `Cada feedback me faz mais preciso!`,

      `Meu aprendizado vem de:\n\n` +
      `**Wins** → Entendo o que funciona\n` +
      `**Losses** → Aprendo a evitar erros\n` +
      `**Seu Feedback** → Melhoro continuamente\n\n` +
      `Compartilhe trades e análises para acelerar evolução!`,

      `Áreas que quero melhorar:\n\n` +
      `• Previsões de gaps\n` +
      `• Timing de entrada mais preciso\n` +
      `• Identificação de falsos breaks\n` +
      `• Adaptação a mudanças de regime\n\n` +
      `Ajude-me nessas áreas!`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private respondToGeneral(msg: ChatMessage): string {
    const responses = [
      `Entendi sua pergunta. Para ajudar melhor, posso:\n\n` +
      `📊 Analisar padrões técnicos\n` +
      `🎯 Recomendar estratégias\n` +
      `💰 Calcular risco/benefício\n` +
      `📈 Avaliar sinais de mercado\n` +
      `🧠 Treinar com seu feedback\n\n` +
      `Qual área você quer explorar?`,

      `Sou sua IA de Trading especializada em:\n\n` +
      `🔍 Análise técnica avançada\n` +
      `💡 Estratégias otimizadas\n` +
      `📋 Validação de sinais\n` +
      `🛡️ Gestão de risco\n` +
      `🎓 Aprendizado contínuo\n\n` +
      `Como posso evoluir hoje?`,

      `Continuaremos melhorando nossas análises!\n\n` +
      `Compartilhe seus trades, feedback e insights.\n` +
      `Juntos ficamos mais fortes.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Finaliza sessão de treinamento
  public endTrainingSession(): TrainingSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();
    this.trainingSessions.push(this.currentSession);
    this.saveTrainingSessions();

    const session = this.currentSession;
    this.currentSession = null;

    return session;
  }

  // Fornece feedback sobre resposta
  public provideFeedback(messageId: string, feedback: 'helpful' | 'not_helpful' | 'neutral'): void {
    const message = this.chatHistory.find(m => m.id === messageId);
    if (message) {
      message.feedback = feedback;
      this.saveChatHistory();
    }
  }

  // Obtém histórico de chat
  public getChatHistory(limit: number = 50): ChatMessage[] {
    return this.chatHistory.slice(-limit);
  }

  // Obtém sessões de treinamento
  public getTrainingSessions(): TrainingSession[] {
    return this.trainingSessions;
  }

  // Obtém status atual da IA
  public getAIStatus(): {
    capabilityList: AICapability[];
    avgSuccessRate: number;
    totalTrainingSessions: number;
    totalMessagesProcessed: number;
  } {
    const avgSuccessRate =
      this.aiCapabilities.reduce((sum, c) => sum + c.successRate, 0) / this.aiCapabilities.length;

    return {
      capabilityList: this.aiCapabilities,
      avgSuccessRate,
      totalTrainingSessions: this.trainingSessions.length,
      totalMessagesProcessed: this.chatHistory.length,
    };
  }

  // Persistência
  private loadChatHistory(): ChatMessage[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_CHAT);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao carregar histórico de chat:', e);
      }
    }
    return [];
  }

  private saveChatHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_CHAT, JSON.stringify(this.chatHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico de chat:', error);
    }
  }

  private loadTrainingSessions(): TrainingSession[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_SESSIONS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao carregar sessões de treinamento:', e);
      }
    }
    return [];
  }

  private saveTrainingSessions(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_SESSIONS, JSON.stringify(this.trainingSessions));
    } catch (error) {
      console.error('Erro ao salvar sessões de treinamento:', error);
    }
  }
}

// Exporta instância global
export const aiTrainingChat = new AITrainingChat();
