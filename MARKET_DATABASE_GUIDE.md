# 💾 Base de Dados de Mercado - Documentação Completa

## 📁 Localização
`src/data/marketKnowledge.json`

## 🎯 Propósito

Fornece à IA uma base estruturada de conhecimento sobre:
- Características de cada par de moedas
- Padrões gráficos e sua confiabilidade
- Configurações ótimas de indicadores
- Estratégias de gerenciamento de risco
- Melhor hora para negociar cada ativo
- Eventos econômicos que impactam

## 📊 Estrutura Principal

```json
{
  "marketKnowledge": {
    "currencyPairs": {...},
    "patternLibrary": {...},
    "indicatorSettings": {...},
    "riskManagement": {...},
    "sessionStrengths": {...},
    "economicEvents": {...},
    "commonMistakes": [...],
    "successMetrics": {...}
  }
}
```

---

## 🪙 Pares de Moedas (currencyPairs)

### EUR/USD
```json
{
  "name": "Euro / Dólar Americano",
  "characteristics": "Par mais líquido do mundo, volatilidade moderada",
  "bestTradingHours": "08:00-17:00 UTC",
  "seasonalPatterns": [
    "Verão europeu = maior volatilidade",
    "Anúncios do BCE impactam"
  ],
  "supportLevels": [1.0500, 1.0400, 1.0300],
  "resistanceLevels": [1.1000, 1.1100, 1.1200],
  "averageSpread": "1-2 pips"
}
```

**Uso na IA:**
- Identifica suporte/resistência historicamente testados
- Ajusta análise baseado em horário do dia
- Evita hora com baixa volatilidade

### GBP/USD
```json
{
  "characteristics": "Alta volatilidade, spreads mais amplos",
  "bestTradingHours": "08:00-17:00 UTC",
  "supportLevels": [1.2500, 1.2400, 1.2300],
  "resistanceLevels": [1.3000, 1.3100, 1.3200],
  "averageSpread": "2-3 pips"
}
```

**Particularidades:**
- Volatilidade maior requer stop loss maior
- Spreads mais amplos = custos maiores
- Dados de emprego UK são importantes

### USD/JPY
```json
{
  "characteristics": "Correlação inversa com risco, carry trade",
  "bestTradingHours": "17:00-08:00 UTC",
  "supportLevels": [138.00, 137.00, 136.00],
  "resistanceLevels": [150.00, 151.00, 152.00],
  "averageSpread": "1-2 pips"
}
```

**Oportunidades:**
- Melhor hora: Noite (sessão de Tóquio)
- Bônus anuais em julho/dezembro impactam
- Carry trade forte = correlações especiais

## 🎨 Biblioteca de Padrões (patternLibrary)

### Duplo Topo (doubleTop)
```json
{
  "description": "Dois picos no mesmo nível, reversão de alta para baixa",
  "reliability": 0.78,
  "timeframe": "4h-1d",
  "targetDistance": "100% da altura do padrão",
  "riskReward": "1:1 a 1:3"
}
```

### Ombro-Cabeça-Ombro (headAndShoulders)
```json
{
  "description": "Ombro esquerdo-cabeça-ombro direito, reversão de alta",
  "reliability": 0.82,
  "timeframe": "1h-1d",
  "targetDistance": "altura da cabeça",
  "riskReward": "1:2 a 1:4"
}
```

**Uso na IA:**
- Combina com análise de velas para confirmação
- Ajusta confiança baseado em reliability
- Define target automaticamente

### Triângulo Ascendente (triangleAscending)
```json
{
  "reliability": 0.75,
  "timeframe": "4h-1d",
  "targetDistance": "altura do triângulo",
  "riskReward": "1:1 a 1:2"
}
```

## 📈 Configurações de Indicadores (indicatorSettings)

### RSI (Índice de Força Relativa)
```json
{
  "period": 14,
  "overbought": 70,
  "oversold": 30,
  "divergence": "Quando preço faz novo máximo mas RSI não = reversão",
  "bestCombination": ["MACD", "Bollinger Bands"]
}
```

**Aplicação na IA:**
- RSI > 70 = sinal de venda
- RSI < 30 = sinal de compra
- Divergência = alerta de reversão
- Combinações aumentam confiança

### MACD (Moving Average Convergence Divergence)
```json
{
  "fastLine": 12,
  "slowLine": 26,
  "signal": 9,
  "bullish": "Linha rápida cruza acima da lenta",
  "bearish": "Linha rápida cruza abaixo da lenta",
  "divergence": "Preço novo máximo mas MACD menor = fraqueza"
}
```

### Bandas de Bollinger
```json
{
  "period": 20,
  "standardDeviations": 2,
  "overbought": "Preço toca banda superior",
  "oversold": "Preço toca banda inferior",
  "squeeze": "Bandas muito próximas = volatilidade baixa = rompimento próximo"
}
```

## 💰 Gestão de Risco (riskManagement)

### Posicionamento
```json
{
  "maxRiskPerTrade": "2% do capital",
  "riskRewardMinimum": "1:2",
  "lotSize": "Baseado em (Capital × Risco%) / distância do stop"
}
```

**Cálculo Exemplo:**
- Capital: $1000
- Risco aceito: 2% = $20
- Distância do stop: 20 pips
- Lote: $20 / 20 pips = 1 mini-lote

### Stop Loss
```json
{
  "placement": "2-3% além do ponto de entrada ou nível técnico",
  "trailing": "Use quando lucrativo para proteger ganhos",
  "timeBasedStop": "Feche se > X velas sem movimento"
}
```

### Targets de Lucro
```json
{
  "firstTarget": "50% do movimento esperado",
  "secondTarget": "75% do movimento esperado",
  "finalTarget": "100% do movimento esperado ou mais"
}
```

## 🕐 Força das Sessões (sessionStrengths)

### Sessão de Londres
```json
{
  "time": "08:00-17:00 UTC",
  "characteristics": "Volatilidade média-alta, maior volume",
  "bestPairs": ["EUR/USD", "GBP/USD", "EUR/GBP"]
}
```

### Sessão de Nova York
```json
{
  "time": "13:00-22:00 UTC",
  "characteristics": "Volatilidade alta, muitos noticiários",
  "bestPairs": ["EUR/USD", "USD/JPY", "GBP/USD"]
}
```

### Sobreposição Londres-NY
```json
{
  "time": "13:00-17:00 UTC",
  "characteristics": "Máxima volatilidade, melhores oportunidades",
  "bestPairs": "Todos os pares principais"
}
```

**Uso na IA:**
- Aumenta confiança durante melhor horário do par
- Reduz sinais durante hora morta
- Prioriza pares em sua melhor sessão

## 📰 Eventos Econômicos (economicEvents)

### Impacto Alto
```json
[
  "Anúncio de taxa de juros",
  "Decisão de política monetária",
  "PIB",
  "Dados de emprego",
  "Inflação CPI/PPI"
]
```

### Recomendação
```
"Evite traduzir 30 minutos antes/depois de eventos 
de alto impacto se iniciante"
```

## ⚠️ Erros Comuns (commonMistakes)

```json
[
  "Trocar muito frequentemente - reduz taxa de ganho",
  "Não usar stop loss - risco ilimitado",
  "Adicionar à posição perdedora - piora o problema",
  "Ignorar gerenciamento de risco - ruína garantida",
  "Emocionar-se com ganhos/perdas - decisões ruins",
  "Não acompanhar as operações - aprende menos",
  "Trocar contra a tendência principal - perda de energia",
  "Pegar números redondos sem confirmação técnica - falsa saída comum"
]
```

**A IA aprende a evitar esses erros!**

## 📊 Métricas de Sucesso (successMetrics)

### Taxa de Acerto Esperada
```json
{
  "beginners": "45-50%",
  "intermediate": "55-65%",
  "advanced": "65-75%",
  "professional": "70-80%"
}
```

### Razão Risco/Retorno
```json
{
  "minimum": "1:1",
  "recommended": "1:2",
  "optimal": "1:3 ou melhor"
}
```

### Rentabilidade
```json
{
  "monthlyTarget": "2-5% do capital",
  "yearlyTarget": "30-100% do capital",
  "note": "Consistência > lucro rápido"
}
```

---

## 🔄 Como a IA Usa Esses Dados

### 1. Quando Gera um Sinal

```
1. IA identifica o ativo (ex: EUR/USD)
2. Busca dados de EUR/USD na base
3. Obtém suporte/resistência
4. Obtém melhor hora para negociar
5. Ajusta análise baseado em sessão
6. Calcula confiança
7. Cria sinal mais preciso
```

### 2. Ao Analisar um Padrão

```
1. IA detecta padrão gráfico (ex: Engulfing)
2. Busca reliability do padrão (ex: 0.85)
3. Busca timeframe ideal (ex: 4h-1d)
4. Busca target distance (ex: 100% da altura)
5. Busca riskReward ideal (ex: 1:2)
6. Ajusta confiança multiplicando pela reliability
7. Define target automaticamente
```

### 3. Ao Calcular Posicionamento

```
1. Identifica capital do usuário
2. Aplica max 2% de risco
3. Define stop loss baseado em dados
4. Calcula lote = risco / distância do stop
5. Retorna valor apropriado
```

### 4. Ao Evitar Eventos Econômicos

```
1. Verifica hora atual
2. Verifica se é antes de evento de alto impacto
3. Se sim: reduz confiança em 20%
4. Se sim e noturno: pula sinal
```

---

## 🎯 Extensões Futuras

### Para Adicionar Mais Dados:

1. **Mais Pares de Moedas**
   ```json
   "AUD/USD": {
     "characteristics": "...",
     "supportLevels": [...],
     "resistanceLevels": [...]
   }
   ```

2. **Mais Padrões**
   ```json
   "flagPattern": {
     "reliability": 0.80,
     "description": "..."
   }
   ```

3. **Mais Indicadores**
   ```json
   "Stochastic": {
     "period": 14,
     "overbought": 80,
     "oversold": 20
   }
   ```

4. **Histórico de Performance**
   ```json
   "patternPerformance": {
     "2024-01": { "wins": 15, "losses": 5 },
     "2024-02": { "wins": 18, "losses": 4 }
   }
   ```

5. **Correlações Entre Pares**
   ```json
   "correlations": {
     "EUR/USD": {
       "GBP/USD": 0.95,
       "USD/CHF": -0.92
     }
   }
   ```

---

## 📝 Manutenção

### Quando Atualizar:
- [ ] Novos suportes/resistências confirmados
- [ ] Padrões mostrando taxa de sucesso diferente
- [ ] Mudanças em horários de sessão
- [ ] Novos eventos econômicos importantes
- [ ] Correlações mudando significativamente

### Como Atualizar:
1. Editar `src/data/marketKnowledge.json`
2. Manter estrutura JSON válida
3. Testar reloading da app
4. Verificar se IA aplica novos dados

---

## 🚀 Integração com Banco de Dados Real

Quando escalar para produção:

```typescript
// Substituir localStorage com API real
async function fetchMarketKnowledge(pair: string) {
  const response = await fetch(`/api/market-knowledge/${pair}`);
  return response.json();
}

// Atualizar em tempo real conforme novos dados chegam
webSocket.on('market-update', (data) => {
  updateMarketKnowledge(data);
});
```

---

**Base de Dados Pronta para Uso! 🎯**

A IA agora tem todo o conhecimento estruturado para gerar sinais de alta qualidade!

