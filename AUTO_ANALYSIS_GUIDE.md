# 🤖 Guia: Sistema de Auto-Análise de Sinais

## 📋 Visão Geral

O **Auto-Analysis System** permite que a IA marque automaticamente seus sinais como **WIN** ou **LOSS** analisando a ação de preço em tempo real. Sem necessidade de marcação manual!

## 🎯 Como Funciona

### 1️⃣ Registrar um Sinal
Quando seu sistema gera um novo sinal, você registra-o para análise:

```typescript
import { useAutoSignalAnalysis } from '@/hooks/useAutoSignalAnalysis';

const { registerSignal } = useAutoSignalAnalysis();

// Quando criar um novo sinal
registerSignal({
  id: 'sinal-123',
  asset: 'IBOV',
  direction: 'CALL', // ou 'PUT'
  entryPrice: 125000,
  timestamp: Date.now(),
  confidence: 85, // 0-100
  strategy: 'MACD_CROSSOVER'
});
```

### 2️⃣ IA Monitora em Tempo Real
A IA monitora o preço continuamente:
- Atualiza preço a cada 2 segundos (simulado em modo teste)
- Analisa padrões de velas
- Verifica volume
- Calcula movimento percentual

### 3️⃣ Determina WIN ou LOSS

#### Para **CALL** (esperando alta):
- ✅ **WIN**: Preço sobe **≥1.5%**
- ❌ **LOSS**: Preço cai **≥1%** OU forma 4 velas vermelhas consecutivas
- ⏱️ **TIMEOUT**: 60 minutos sem atingir meta

#### Para **PUT** (esperando queda):
- ✅ **WIN**: Preço cai **≥1.5%**
- ❌ **LOSS**: Preço sobe **≥1%** OU forma 4 velas verdes consecutivas
- ⏱️ **TIMEOUT**: 60 minutos sem atingir meta

### 4️⃣ Recebe Notificação de Resultado

```typescript
// Seu componente é notificado automaticamente via eventos
window.addEventListener('signal-win', (event: any) => {
  const signal = event.detail;
  console.log(`🎉 VITÓRIA em ${signal.asset}!`);
  console.log(`Lucro: ${signal.profitLoss}%`);
  // Aqui você pode trigger notificações, atualizar UI, etc.
});

window.addEventListener('signal-loss', (event: any) => {
  const signal = event.detail;
  console.log(`❌ Sinal perdido em ${signal.asset}`);
  // Mesmo para perdas
});
```

## 📊 Painéis Disponíveis

### 1. **AIAutoAnalysisPanel**
Painel completo com:
- 📈 Gráficos de performance (Win/Loss, Lucro/Perda diário)
- 📋 Histórico detalhado de todos os sinais analisados
- 💹 Estatísticas por ativo (IBOV, USD, PETR4, etc.)
- ⏳ Sinais ativos sendo monitorados agora

```tsx
import AIAutoAnalysisPanel from '@/components/AIAutoAnalysisPanel';

<AIAutoAnalysisPanel />
```

### 2. **Integração no Dashboard**
Já adicionado ao `AIControlDashboard` com a aba "Auto-Analysis":

```tsx
// Em AIControlDashboard.tsx (já configurado)
<TabsContent value="auto-analysis" className="space-y-4">
  <AIAutoAnalysisPanel />
</TabsContent>
```

## 🔧 API do useAutoSignalAnalysis

### Métodos Disponíveis

```typescript
const {
  // Registra um novo sinal para análise
  registerSignal: (signal: GeneratedSignal) => void,
  
  // Simula atualização de preço (teste)
  updatePriceSimulated: () => void,
  
  // Inicia análise automática contínua
  startAutoAnalysis: () => () => void,
  
  // Obtém sinais já analisados (últimos N)
  getAnalyzedSignals: (limit?: number) => SignalAnalysis[],
  
  // Obtém sinais ainda sendo monitorados
  getActiveSignals: () => SignalAnalysis[],
  
  // Obtém estatísticas gerais
  getStatistics: () => Statistics
} = useAutoSignalAnalysis();
```

## 📱 Exemplo de Uso Completo

Veja `SignalIntegrationExample.tsx` para exemplo prático com:
- Geração de sinais de teste
- Registro automático
- Visualização de estatísticas
- Explicação passo-a-passo

## 🎨 Dados Mostrados no Painel

### Cards de Estatísticas
```
📊 Vitórias: 12 (Média: +1.8%)
❌ Perdas: 3 (Média: -1.0%)
💰 Lucro Total: 18.45%
📈 Profit Factor: 2.45x (Ganho/Perda)
```

### Gráficos
1. **Distribuição Win/Loss** - Pizza colorida
2. **Desempenho Diário** - Barras de wins/losses por dia
3. **Lucro/Perda Diário** - Linha tendencial de P&L
4. **Performance por Ativo** - Métricas separadas por asset

### Histórico de Sinais
Cada entrada mostra:
- Ativo e Direção (IBOV CALL, USD PUT, etc.)
- Status (WIN/LOSS/ANALISANDO)
- Preço de entrada → saída
- P&L em percentual
- Razão da análise (ex: "Preço subiu 1.5%")
- Horário exato
- Confiança do sinal

## 🔌 Integração com Seus Sinais

### Opção 1: Hook Direto
```tsx
import { useAutoSignalAnalysis } from '@/hooks/useAutoSignalAnalysis';

function MeuComponenteDeSignais() {
  const { registerSignal } = useAutoSignalAnalysis();
  
  const handleNovoSinal = (signal) => {
    // Seu código que gera sinal
    const novoSinal = gerarSinal();
    
    // Registra para análise automática
    registerSignal(novoSinal);
  };
}
```

### Opção 2: Sistema de Eventos
```tsx
// Qualquer componente pode escutar
window.addEventListener('signal-win', (e) => {
  const sinal = e.detail;
  // Fazer algo com vitória
});

window.addEventListener('signal-loss', (e) => {
  const sinal = e.detail;
  // Fazer algo com perda
});
```

## 💾 Persistência de Dados

Todos os dados são salvos em `localStorage` sob a chave:
```
'ai_signal_analysis'
```

Estrutura:
```json
{
  "signals": [
    {
      "signalId": "signal-123",
      "asset": "IBOV",
      "direction": "CALL",
      "entryPrice": 125000,
      "exitPrice": 126875,
      "profitLoss": 1.5,
      "result": "WIN",
      "status": "COMPLETED",
      "analysisReason": "Preço subiu 1.5%",
      "confidence": 85
    }
  ],
  "stats": {
    "totalTrades": 15,
    "wins": 12,
    "losses": 3,
    "totalProfit": 18.45
  }
}
```

## ⚙️ Configuração de Parâmetros

Para ajustar thresholds, edite `src/lib/aiSignalAnalyzer.ts`:

```typescript
// Linhas com configuração de parâmetros:
const PROFIT_TARGET = 1.5;      // 1.5% para WIN
const STOP_LOSS = 1.0;          // 1.0% para LOSS
const MAX_ANALYSIS_TIME = 3600000; // 60 minutos em ms
const BEARISH_CANDLE_THRESHOLD = 4; // 4 velas vermelhas = reversal
```

## 🎓 Fluxo de Aprendizagem da IA

Conforme os sinais são analisados:
1. IA registra o resultado (WIN/LOSS)
2. Armazena razão técnica (preço subiu X%, padrão de velas, etc.)
3. Rastreia por ativo e estratégia
4. Calcula estatísticas (win rate, profit factor, etc.)
5. **Próximo**: Sistema de feedback para melhorar modelos

## 📊 Métricas Importantes

- **Win Rate**: Porcentagem de vitórias
- **Profit Factor**: Ganho total / Perda total
- **Average Win**: Média de lucro por vitória
- **Average Loss**: Média de prejuízo por perda
- **Total Profit**: Lucro acumulado em %

## 🚨 Troubleshooting

### Sinais não aparecem no painel
1. Certifique-se de chamar `startAutoAnalysis()`
2. Verifique se localStorage está habilitado
3. Abra DevTools → Console para ver logs

### Sinais não são marcados como WIN/LOSS
1. Verifique se `updatePrice()` está sendo chamado
2. Confira thresholds (1.5% WIN, 1.0% LOSS)
3. Verifique se tempo máximo (60 min) não foi excedido

### localStorage cheio
1. Limpe histórico: `localStorage.removeItem('ai_signal_analysis')`
2. Ou implemente rotação de dados (guardar apenas últimos 30 dias)

## 🎯 Próximas Melhorias

- [ ] Integração com API real de preços
- [ ] Machine Learning para ajustar thresholds automaticamente
- [ ] Análise de drawdown máximo
- [ ] Correlação com indicadores técnicos
- [ ] Exportar dados em CSV/PDF
- [ ] Sistema de notificações (email/SMS)
- [ ] Backtesting de estratégias
- [ ] Regressão de sinais com feedback

## 📝 Resumo da Integração

| Etapa | Componente | Descrição |
|-------|-----------|-----------|
| 1 | `useAutoSignalAnalysis` | Hook para usar o analyzer |
| 2 | `registerSignal()` | Registra novo sinal |
| 3 | `updatePrice()` | Atualiza preço real-time |
| 4 | `analyzeSignals()` | Verifica critérios de WIN/LOSS |
| 5 | `AIAutoAnalysisPanel` | Mostra resultados visuais |
| 6 | `AIControlDashboard` | Dashboard com aba Auto-Analysis |

---

**Sua IA agora marca automaticamente seus sinais! 🚀**
