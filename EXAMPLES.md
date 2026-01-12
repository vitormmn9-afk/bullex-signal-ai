# Exemplos Práticos - Usando o Sistema de IA

Este arquivo contém exemplos práticos de como usar cada parte do novo sistema.

## 📚 Índice
1. [Chat de Treinamento](#chat-de-treinamento)
2. [Comandos Automáticos](#comandos-automáticos)
3. [Busca de Conhecimento](#busca-de-conhecimento)
4. [Integração Bullex](#integração-bullex)
5. [Integração em Componentes](#integração-em-componentes)

---

## 💬 Chat de Treinamento

### Exemplo 1: Iniciando uma Sessão

```typescript
import { aiTrainingChat } from '@/lib/aiTrainingChat';

// Iniciar uma sessão sobre melhoria de estratégia
const session = aiTrainingChat.startTrainingSession('strategy_improvement');
console.log('Sessão iniciada:', session.id);

// Agora você pode mandar mensagens dentro desta sessão
const { message, response } = aiTrainingChat.sendMessage(
  "Como melhorar minha taxa de acerto em sinais?"
);

console.log('Você:', message.content);
console.log('IA:', response.content);

// Quando terminar
const finalSession = aiTrainingChat.endTrainingSession();
console.log('Sessão finalizada com', finalSession.messages.length, 'mensagens');
```

### Exemplo 2: Treinar com Contexto de Mercado

```typescript
const { response } = aiTrainingChat.sendMessage(
  "O mercado está em alta forte, RSI em 75, MACD positivo. Qual ação tomar?",
  "IBOV em tendência de alta", // contexto
  ["signal_123", "signal_124"]   // sinais relacionados
);

console.log('Recomendação contextualizada:', response.content);
```

### Exemplo 3: Feedback para Melhoria

```typescript
// Enviar mensagem
const { message, response } = aiTrainingChat.sendMessage(
  "Como calcular Risco/Benefício?"
);

// Fornecer feedback
aiTrainingChat.provideFeedback(response.id, 'helpful');
// ou
aiTrainingChat.provideFeedback(response.id, 'not_helpful');

// Obter status atualizado
const status = aiTrainingChat.getAIStatus();
console.log('Taxa média de sucesso:', status.avgSuccessRate);
```

### Exemplo 4: Análise de Progressão

```typescript
const status = aiTrainingChat.getAIStatus();

console.log('=== Status da IA ===');
console.log(`Capacidades: ${status.capabilityList.length}`);
console.log(`Mensagens processadas: ${status.totalMessagesProcessed}`);
console.log(`Sessões de treinamento: ${status.totalTrainingSessions}`);
console.log(`Taxa média de sucesso: ${(status.avgSuccessRate * 100).toFixed(1)}%`);

console.log('\n=== Cada Capacidade ===');
status.capabilityList.forEach(cap => {
  console.log(`${cap.name}: ${(cap.successRate * 100).toFixed(0)}% (${cap.trainingSessions} sessões)`);
});
```

---

## ⚡ Comandos Automáticos

### Exemplo 1: Gerar Sinal via Comando

```typescript
import { aiCommandSystem } from '@/lib/aiCommandSystem';

// Primeiro, registrar um handler para o comando
aiCommandSystem.onCommand('generate_signal', async (payload) => {
  const { asset } = payload;
  console.log(`Gerando sinal para ${asset}...`);
  
  // Aqui você chamaria sua lógica de geração de sinais
  return {
    asset,
    direction: 'CALL',
    probability: 87,
    message: `Sinal gerado com sucesso para ${asset}`
  };
});

// Agora processar input do usuário
const result = await aiCommandSystem.processUserInput("Gera sinal para USD");

if (result.success) {
  console.log('✅', result.message);
  console.log('Dados:', result.data);
} else {
  console.log('❌', result.message);
}
```

### Exemplo 2: Executar Comando Diretamente

```typescript
// Analisar comando
const command = aiCommandSystem.parseCommand("Aumenta confiança para 95%");

if (command) {
  console.log('Tipo:', command.type);
  console.log('Payload:', command.payload);
  console.log('Prioridade:', command.priority);
  
  // Registrar handler
  aiCommandSystem.onCommand(command.type, async (payload) => {
    return { newConfidence: payload.value };
  });
  
  // Executar
  const result = await aiCommandSystem.executeCommand(command);
  console.log(result);
}
```

### Exemplo 3: Sugestões de Comando

```typescript
// Usuário está digitando
let input = "gera";
let suggestions = aiCommandSystem.suggestCommands(input);
console.log('Sugestões para "gera":', suggestions);
// Output: ['Gera sinal para IBOV', 'Gerando sinais USD', 'Gera sinal PETR4']

input = "aumenta";
suggestions = aiCommandSystem.suggestCommands(input);
console.log('Sugestões para "aumenta":', suggestions);
// Output: ['Aumenta confiança para 90%', 'Aumentar confiança 95', ...]
```

### Exemplo 4: Análise de Execução

```typescript
const stats = aiCommandSystem.getCommandStatistics();

console.log('=== Estatísticas de Comandos ===');
console.log(`Total executado: ${stats.totalExecuted}`);
console.log(`Taxa de sucesso: ${(stats.successRate * 100).toFixed(1)}%`);
console.log(`Comando mais usado: ${stats.mostUsedCommand}`);
console.log(`Tempo médio: ${stats.executionTimeAvg.toFixed(0)}ms`);

// Histórico
const history = aiCommandSystem.getExecutionHistory(10);
console.log('\n=== Últimos 10 Comandos ===');
history.forEach((cmd, idx) => {
  const status = cmd.result?.success ? '✅' : '❌';
  console.log(`${idx + 1}. ${status} ${cmd.type} - ${cmd.result?.executionTime}ms`);
});
```

---

## 🔍 Busca de Conhecimento

### Exemplo 1: Buscar Conhecimento Relevante

```typescript
import { advancedMarketLearning } from '@/lib/advancedMarketLearning';

// Buscar sobre análise técnica
const knowledge = advancedMarketLearning.searchRelevantKnowledge(
  'RSI suporte resistência análise técnica',
  5 // Limite de 5 resultados
);

console.log(`Encontradas ${knowledge.length} entradas relevantes:`);
knowledge.forEach((entry, idx) => {
  console.log(`\n${idx + 1}. ${entry.title}`);
  console.log(`   Fonte: ${entry.source}`);
  console.log(`   Categoria: ${entry.category}`);
  console.log(`   Relevância: ${Math.round(entry.relevance)}%`);
  console.log(`   Tags: ${entry.tags.join(', ')}`);
});
```

### Exemplo 2: Recomendação de Estratégia

```typescript
const recommendation = advancedMarketLearning.recommendStrategy({
  asset: 'IBOV',
  currentTrend: 'up',
  volatility: 'high',
  marketSentiment: 'bullish'
});

console.log('Recomendação para mercado atual:');
console.log(recommendation);
/*
Output exemplo:
"Mercado em alta com volatilidade. Use confluência de indicadores. 
Procure por pullbacks em suporte para compra.

Contexto relevante: Estratégia Pullback após Rompimento: quando o preço 
rompe resistência com volume, faz pullback, e retorna com nova força 
deve-se entrar long."
*/
```

### Exemplo 3: Aprender com Resultado

```typescript
// Registrar que um trade ganhou
advancedMarketLearning.learnFromSignalResult(
  'signal_12345',
  'WIN',
  {
    pattern: 'engulfing bullish',
    indicator: 'RSI',
    volume: 'increasing'
  }
);

// Registrar perda para evitar no futuro
advancedMarketLearning.learnFromSignalResult(
  'signal_12346',
  'LOSS',
  {
    pattern: 'false breakout',
    reason: 'volume fraco'
  }
);

// Obter stats
const stats = advancedMarketLearning.getLearningStats();
console.log(`Taxa de sucesso: ${(stats.successRate * 100).toFixed(1)}%`);
console.log(`Total aprendido: ${stats.totalEntriesLearned} conceitos`);
console.log(`Categorias top:`, stats.topCategories);
```

### Exemplo 4: Exportar e Importar Conhecimento

```typescript
// Exportar toda a base de conhecimento
const exported = advancedMarketLearning.exportKnowledge();
console.log('Conhecimento exportado:', exported.substring(0, 100) + '...');

// Salvar em arquivo (em app real)
localStorage.setItem('backup_knowledge', exported);

// Depois, importar de novo
const fromStorage = localStorage.getItem('backup_knowledge');
if (fromStorage) {
  advancedMarketLearning.importKnowledge(fromStorage);
  console.log('✅ Conhecimento importado com sucesso');
}
```

---

## 🎯 Integração Bullex

### Exemplo 1: Obter Informações do Ativo

```typescript
import { bullexIntegration } from '@/lib/bullexIntegration';

const assetInfo = bullexIntegration.getAssetInfo('IBOV');

console.log('=== Informações IBOV ===');
console.log(`Nome: ${assetInfo.name}`);
console.log(`Tipo: ${assetInfo.type}`);
console.log(`Volatilidade: ${assetInfo.volatilityProfile}`);
console.log(`Horário: ${assetInfo.tradingHours.open} - ${assetInfo.tradingHours.close}`);
console.log(`Características:`);
assetInfo.characteristics.forEach(c => console.log(`  - ${c}`));
console.log(`Regras especiais:`);
assetInfo.specialRules.forEach(r => console.log(`  - ${r}`));
```

### Exemplo 2: Validar Hora Ótima

```typescript
// Verificar se é bom momento para tradear cada ativo
const assets = bullexIntegration.getAllAssets();

console.log('=== Horários Ótimos para Negociação ===');
assets.forEach(asset => {
  const isOptimal = bullexIntegration.isOptimalTradingTime(asset.symbol);
  const status = isOptimal ? '✅ ÓTIMO' : '⏱️ NÃO IDEAL';
  console.log(`${asset.symbol}: ${status}`);
});
```

### Exemplo 3: Recomendar Estratégia

```typescript
// Obter estratégia recomendada para cada ativo
const assets = bullexIntegration.getAllAssets();

console.log('=== Estratégias Recomendadas ===\n');
assets.forEach(asset => {
  const strategy = bullexIntegration.getStrategyRecommendation(asset.symbol, {
    currentTrend: 'up',
    volatility: 'high'
  });
  
  if (strategy) {
    console.log(`${asset.symbol}:`);
    console.log(`  Strategy: ${strategy.name}`);
    console.log(`  Sucesso: ${strategy.successRate}%`);
    console.log(`  Indicadores: ${strategy.requiredIndicators.join(', ')}`);
  }
});
```

### Exemplo 4: Rastrear Performance

```typescript
// Registrar trades bem-sucedidos e perdas
bullexIntegration.recordTradePerformance('IBOV', 'WIN');
bullexIntegration.recordTradePerformance('IBOV', 'WIN');
bullexIntegration.recordTradePerformance('IBOV', 'LOSS');

bullexIntegration.recordTradePerformance('PETR4', 'WIN');
bullexIntegration.recordTradePerformance('PETR4', 'WIN');
bullexIntegration.recordTradePerformance('PETR4', 'WIN');

// Obter performance
console.log('=== Performance por Ativo ===');
const assets = ['IBOV', 'PETR4', 'USD', 'MGLU3'];
assets.forEach(symbol => {
  const perf = bullexIntegration.getAssetPerformance(symbol);
  const taxaMenção = (perf.winRate * 100).toFixed(0);
  console.log(`${symbol}: ${perf.wins}W/${perf.losses}L (${taxaMenção}%)`);
});
```

### Exemplo 5: Estratégias Disponíveis

```typescript
const strategies = bullexIntegration.getAllStrategies();

console.log('=== Estratégias Disponíveis ===\n');
strategies.forEach(strategy => {
  console.log(`${strategy.name} (${strategy.id})`);
  console.log(`  Descrição: ${strategy.description}`);
  console.log(`  Taxa de Sucesso: ${strategy.successRate}%`);
  console.log(`  Melhores Ativos: ${strategy.bestAssets.join(', ')}`);
  console.log(`  Timeframes: ${strategy.timeframes.join(', ')}`);
  console.log();
});
```

---

## 🧩 Integração em Componentes

### Exemplo 1: Componente com Chat

```typescript
import React, { useState } from 'react';
import { aiTrainingChat } from '@/lib/aiTrainingChat';

export const MyChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    const { message, response } = aiTrainingChat.sendMessage(input);
    setMessages(prev => [...prev, message, response]);
    setInput('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
};
```

### Exemplo 2: Componente com Comandos

```typescript
import React, { useState } from 'react';
import { aiCommandSystem } from '@/lib/aiCommandSystem';

export const CommandExecutor = () => {
  const [result, setResult] = useState(null);
  const [input, setInput] = useState('');

  const execute = async () => {
    const result = await aiCommandSystem.processUserInput(input);
    setResult(result);
  };

  return (
    <div>
      <input 
        value={input} 
        onChange={e => setInput(e.target.value)}
        placeholder="Digite seu comando..."
      />
      <button onClick={execute}>Executar</button>
      {result && (
        <div className={result.success ? 'success' : 'error'}>
          {result.message}
        </div>
      )}
    </div>
  );
};
```

### Exemplo 3: Dashboard com Stats

```typescript
import React, { useEffect, useState } from 'react';
import { aiTrainingChat } from '@/lib/aiTrainingChat';
import { aiCommandSystem } from '@/lib/aiCommandSystem';

export const AIStats = () => {
  const [chatStats, setChatStats] = useState(null);
  const [cmdStats, setCmdStats] = useState(null);

  useEffect(() => {
    // Atualizar a cada 5 segundos
    const interval = setInterval(() => {
      setChatStats(aiTrainingChat.getAIStatus());
      setCmdStats(aiCommandSystem.getCommandStatistics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stats-grid">
      {chatStats && (
        <div className="stat-card">
          <h3>Taxa de Sucesso da IA</h3>
          <p>{(chatStats.avgSuccessRate * 100).toFixed(1)}%</p>
        </div>
      )}
      {cmdStats && (
        <div className="stat-card">
          <h3>Comandos Executados</h3>
          <p>{cmdStats.totalExecuted}</p>
        </div>
      )}
    </div>
  );
};
```

### Exemplo 4: Integrar com Hook Existente

```typescript
import { useSignals } from '@/hooks/useSignals';
import { aiTrainingChat } from '@/lib/aiTrainingChat';

export const EnhancedSignalComponent = () => {
  const { signals, updateSignalResult } = useSignals('OPEN', true);

  const handleTradeResult = async (signalId, result) => {
    // Atualizar resultado
    updateSignalResult(signalId, result);

    // Ensinar à IA
    const signal = signals.find(s => s.id === signalId);
    if (signal) {
      const message = result === 'WIN' 
        ? `Aprendi com sucesso! Trade de ${signal.asset} ${signal.direction} ganhou.`
        : `Aprendi com esta perda. ${signal.asset} ${signal.direction} não funcionou como esperado.`;
      
      aiTrainingChat.sendMessage(message, `Signal ${signal.asset}`);
    }
  };

  return (
    <div>
      {/* Seu componente aqui */}
    </div>
  );
};
```

---

## 🎓 Rotina Recomendada de Uso

### Dia 1: Exploração
```
1. Abra o AI Control Dashboard
2. Leia a aba de Ajuda para ver todos os comandos
3. Teste 3-4 comandos (ex: "Gera sinal", "Aumenta confiança")
4. Faça uma pergunta no chat (ex: "Como usar RSI?")
```

### Dia 2-7: Treinamento
```
1. Iniciar sessão de treinamento diariamente
2. Fazer 5-10 perguntas por sessão
3. Executar 2-3 comandos
4. Fornecer feedback nas respostas
5. Registrar resultados dos trades
```

### Semana 2+: Otimização
```
1. Analisar as stats no dashboard
2. Ajustar parâmetros via comandos
3. Aprofundar em estratégias específicas
4. Integrar aprendizado nos trades reais
5. Manter feedback contínuo
```

---

**Divirta-se e aproveite ao máximo o novo sistema de IA! 🚀**
