// Sistema de Comandos para Aplicar Ações no Aplicativo
// Permite que usuário dê comandos em linguagem natural

export interface CommandAction {
  type:
    | 'generate_signal'
    | 'update_config'
    | 'analyze_asset'
    | 'apply_strategy'
    | 'adjust_parameters'
    | 'train_ai'
    | 'validate_signal'
    | 'market_scan';
  payload: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  executedAt?: number;
  result?: string;
}

export interface CommandTemplate {
  pattern: RegExp;
  type: CommandAction['type'];
  description: string;
  examples: string[];
  extractParams: (input: string) => Record<string, any>;
}

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  commandId: string;
  executionTime: number;
}

export class AICommandSystem {
  private commandTemplates: CommandTemplate[] = [];
  private executionHistory: (CommandAction & { result?: CommandExecutionResult })[] = [];
  private readonly STORAGE_KEY = 'ai_commands_history';
  private readonly MAX_HISTORY = 500;
  private commandCallbacks: Map<CommandAction['type'], (payload: any) => Promise<any>> = new Map();

  constructor() {
    this.initializeCommandTemplates();
    this.executionHistory = this.loadExecutionHistory();
  }

  private initializeCommandTemplates(): void {
    this.commandTemplates = [
      {
        pattern: /^gera(?:r|ndo)?\s+sinal(?:is)?\s+(?:para\s+)?(\w+)$/i,
        type: 'generate_signal',
        description: 'Gera sinal para um ativo específico',
        examples: ['Gera sinal para IBOV', 'Gerando sinais USD', 'Gera sinal PETR4'],
        extractParams: (input) => {
          const match = input.match(/(\w+)$/);
          return { asset: match ? match[1].toUpperCase() : 'IBOV' };
        },
      },
      {
        pattern: /^aumenta?\s+(?:a\s+)?confiança\s+(?:mínima\s+)?(?:para\s+)?(\d+)%?$/i,
        type: 'update_config',
        description: 'Aumenta o filtro de confiança mínima',
        examples: ['Aumenta confiança para 90%', 'Aumentar confiança mínima 95', 'Aumenta a confiança 85'],
        extractParams: (input) => {
          const match = input.match(/(\d+)/);
          const value = match ? parseInt(match[1]) : 85;
          return { parameter: 'minConfidence', value: Math.min(100, Math.max(50, value)) };
        },
      },
      {
        pattern: /^diminui?\s+(?:a\s+)?confiança\s+(?:mínima\s+)?(?:para\s+)?(\d+)%?$/i,
        type: 'update_config',
        description: 'Diminui o filtro de confiança mínima',
        examples: ['Diminui confiança para 70%', 'Diminuir confiança 75', 'Diminui a confiança mínima'],
        extractParams: (input) => {
          const match = input.match(/(\d+)/);
          const value = match ? parseInt(match[1]) : 70;
          return { parameter: 'minConfidence', value: Math.max(50, Math.min(100, value)) };
        },
      },
      {
        pattern: /^analisa?\s+(\w+)(?:\s+em\s+(\d+)m)?$/i,
        type: 'analyze_asset',
        description: 'Analisa um ativo em profundidade',
        examples: ['Analisa IBOV', 'Analisando USD em 5m', 'Analisa BTC 1m'],
        extractParams: (input) => {
          const match = input.match(/(\w+)(?:\s+em\s+(\d+)m)?/);
          return {
            asset: match ? match[1].toUpperCase() : 'IBOV',
            timeframe: match && match[2] ? `${match[2]}m` : '5m',
          };
        },
      },
      {
        pattern: /^aplica?\s+estratégia\s+(.+?)\s+(?:em\s+)?(\w+)?$/i,
        type: 'apply_strategy',
        description: 'Aplica uma estratégia específica',
        examples: [
          'Aplica estratégia pullback',
          'Aplicar breakout em IBOV',
          'Aplica oversold bounce',
        ],
        extractParams: (input) => {
          const match = input.match(/estratégia\s+(.+?)(?:\s+em\s+(\w+))?$/i);
          return {
            strategy: match ? match[1].trim() : 'pullback',
            asset: match && match[2] ? match[2].toUpperCase() : undefined,
          };
        },
      },
      {
        pattern: /^ativa?\s+(?:o\s+)?(?:auto\s+)?gera(?:r|dor)?|^liga?\s+(?:auto\s+)?gera(?:r|dor)?$/i,
        type: 'update_config',
        description: 'Ativa a geração automática de sinais',
        examples: ['Ativa o gerador automático', 'Liga auto gerar', 'Ativa gerador'],
        extractParams: () => ({
          parameter: 'autoGenerate',
          value: true,
        }),
      },
      {
        pattern: /^desativa?\s+(?:o\s+)?(?:auto\s+)?gera(?:r|dor)?|^desliga?\s+(?:auto\s+)?gera(?:r|dor)?$/i,
        type: 'update_config',
        description: 'Desativa a geração automática de sinais',
        examples: ['Desativa o gerador', 'Desliga auto gerar', 'Para geração automática'],
        extractParams: () => ({
          parameter: 'autoGenerate',
          value: false,
        }),
      },
      {
        pattern: /^scan\s+(?:de\s+)?mercado|^varre?\s+mercado$/i,
        type: 'market_scan',
        description: 'Faz varredura completa do mercado',
        examples: ['Scan de mercado', 'Varrer mercado', 'Faz scan'],
        extractParams: () => ({
          includedAssets: ['IBOV', 'USD', 'PETR4', 'VALE3', 'MGLU3', 'BTC', 'GOLD'],
        }),
      },
      {
        pattern: /^valida?\s+sinal\s+(.+)$/i,
        type: 'validate_signal',
        description: 'Valida um sinal específico',
        examples: ['Valida sinal IBOV call', 'Validar sinal USD', 'Valida este sinal'],
        extractParams: (input) => {
          const match = input.match(/sinal\s+(.+)$/i);
          return { signalDescription: match ? match[1] : input };
        },
      },
      {
        pattern: /^aprende?\s+(?:com\s+)?(?:este\s+)?sinal|^treina?\s+(?:com\s+)?(?:este\s+)?resultado$/i,
        type: 'train_ai',
        description: 'Treina a IA com o resultado do sinal',
        examples: ['Aprende com este sinal', 'Treina com resultado', 'Aprenda disso'],
        extractParams: () => ({
          mode: 'feedback',
        }),
      },
      {
        pattern: /^(?:muda?|ajusta?|altera?)\s+(.+?)\s+(?:para|em)\s+(.+)$/i,
        type: 'adjust_parameters',
        description: 'Ajusta parâmetros da IA',
        examples: [
          'Muda RSI limite para 30',
          'Ajusta MACD sensibilidade para 0.5',
          'Altera volume mínimo em 5000',
        ],
        extractParams: (input) => {
          const match = input.match(/(?:muda?|ajusta?|altera?)\s+(.+?)\s+(?:para|em)\s+(.+)$/i);
          return {
            parameter: match ? match[1].trim() : '',
            value: match ? match[2].trim() : '',
          };
        },
      },
    ];
  }

  // Parse comando em linguagem natural
  public parseCommand(input: string): CommandAction | null {
    const trimmedInput = input.trim();

    // Tenta encontrar template correspondente
    for (const template of this.commandTemplates) {
      if (template.pattern.test(trimmedInput)) {
        const payload = template.extractParams(trimmedInput);

        return {
          type: template.type,
          payload,
          priority: this.determinePriority(template.type),
        };
      }
    }

    return null;
  }

  // Determina prioridade do comando
  private determinePriority(type: CommandAction['type']): 'low' | 'normal' | 'high' {
    const highPriority: CommandAction['type'][] = ['generate_signal', 'market_scan', 'validate_signal'];
    return highPriority.includes(type) ? 'high' : 'normal';
  }

  // Registra callback para um tipo de comando
  public onCommand(
    type: CommandAction['type'],
    callback: (payload: any) => Promise<any>
  ): void {
    this.commandCallbacks.set(type, callback);
  }

  // Executa comando
  public async executeCommand(command: CommandAction): Promise<CommandExecutionResult> {
    const startTime = Date.now();
    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Valida comando
      if (!this.isValidCommand(command)) {
        return {
          success: false,
          message: 'Comando inválido ou mal formatado',
          commandId,
          executionTime: Date.now() - startTime,
        };
      }

      // Obtém callback
      const callback = this.commandCallbacks.get(command.type);
      if (!callback) {
        return {
          success: false,
          message: `Comando do tipo "${command.type}" não tem handler registrado`,
          commandId,
          executionTime: Date.now() - startTime,
        };
      }

      // Executa
      const data = await callback(command.payload);

      const result: CommandExecutionResult = {
        success: true,
        message: `Comando ${command.type} executado com sucesso`,
        data,
        commandId,
        executionTime: Date.now() - startTime,
      };

      // Salva histórico
      this.recordCommandExecution(command, result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      return {
        success: false,
        message: `Erro ao executar comando: ${errorMessage}`,
        commandId,
        executionTime: Date.now() - startTime,
      };
    }
  }

  // Processa input do usuário (parse + execute)
  public async processUserInput(input: string): Promise<CommandExecutionResult | null> {
    const command = this.parseCommand(input);

    if (!command) {
      return {
        success: false,
        message: 'Comando não reconhecido. Use uma linguagem natural válida.',
        commandId: 'no_match',
        executionTime: 0,
      };
    }

    return this.executeCommand(command);
  }

  // Valida comando
  private isValidCommand(command: CommandAction): boolean {
    // Validações básicas
    if (!command.type || !command.payload) {
      return false;
    }

    // Validações específicas por tipo
    switch (command.type) {
      case 'generate_signal':
        return 'asset' in command.payload;
      case 'analyze_asset':
        return 'asset' in command.payload;
      case 'apply_strategy':
        return 'strategy' in command.payload;
      case 'update_config':
        return 'parameter' in command.payload && 'value' in command.payload;
      case 'adjust_parameters':
        return 'parameter' in command.payload && 'value' in command.payload;
      default:
        return true;
    }
  }

  // Registra execução do comando
  private recordCommandExecution(
    command: CommandAction,
    result: CommandExecutionResult
  ): void {
    const execution = {
      ...command,
      executedAt: Date.now(),
      result,
    };

    this.executionHistory.push(execution);

    // Manter limite de tamanho
    if (this.executionHistory.length > this.MAX_HISTORY) {
      this.executionHistory = this.executionHistory.slice(-this.MAX_HISTORY);
    }

    this.saveExecutionHistory();
  }

  // Obtém histórico de execução
  public getExecutionHistory(limit: number = 50): (CommandAction & { result?: CommandExecutionResult })[] {
    return this.executionHistory.slice(-limit);
  }

  // Obtém templates disponíveis
  public getAvailableCommands(): {
    type: CommandAction['type'];
    description: string;
    examples: string[];
  }[] {
    return this.commandTemplates.map(t => ({
      type: t.type,
      description: t.description,
      examples: t.examples,
    }));
  }

  // Sugestões de comando baseado em input parcial
  public suggestCommands(partialInput: string): string[] {
    const suggestions: string[] = [];

    for (const template of this.commandTemplates) {
      // Verifica se o inicio coincide
      const firstExample = template.examples[0];
      if (firstExample.toLowerCase().startsWith(partialInput.toLowerCase())) {
        suggestions.push(...template.examples);
      }
    }

    return suggestions.slice(0, 5); // Retorna até 5 sugestões
  }

  // Persistência
  private loadExecutionHistory(): (CommandAction & { result?: CommandExecutionResult })[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao carregar histórico de comandos:', e);
      }
    }
    return [];
  }

  private saveExecutionHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.executionHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico de comandos:', error);
    }
  }

  // Estatísticas de uso
  public getCommandStatistics(): {
    totalExecuted: number;
    successRate: number;
    mostUsedCommand: CommandAction['type'] | null;
    executionTimeAvg: number;
  } {
    if (this.executionHistory.length === 0) {
      return {
        totalExecuted: 0,
        successRate: 0,
        mostUsedCommand: null,
        executionTimeAvg: 0,
      };
    }

    const successful = this.executionHistory.filter(c => c.result?.success).length;
    const avgTime =
      this.executionHistory.reduce((sum, c) => sum + (c.result?.executionTime || 0), 0) /
      this.executionHistory.length;

    const typeCount = new Map<CommandAction['type'], number>();
    this.executionHistory.forEach(c => {
      typeCount.set(c.type, (typeCount.get(c.type) || 0) + 1);
    });

    const mostUsed = Array.from(typeCount.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      totalExecuted: this.executionHistory.length,
      successRate: successful / this.executionHistory.length,
      mostUsedCommand: mostUsed ? mostUsed[0] : null,
      executionTimeAvg: avgTime,
    };
  }
}

// Exporta instância global
export const aiCommandSystem = new AICommandSystem();
