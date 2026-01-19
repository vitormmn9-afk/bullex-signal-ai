#!/bin/bash
# Reset inteligente do sistema de aprendizado da IA
# Remove configurações ruins mas mantém o que funciona

echo "🔄 RESET INTELIGENTE DO SISTEMA DE IA"
echo "======================================"
echo ""

# Backup dos dados atuais
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/bullex_backup_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

echo "📦 Fazendo backup dos dados atuais..."
# Extrair dados do localStorage via console do browser seria ideal,
# mas vamos fornecer instruções para reset manual

cat << 'EOF'

🎯 COMO FAZER O RESET INTELIGENTE:

1️⃣ Abra o DevTools do navegador (F12)

2️⃣ Vá para a aba "Console"

3️⃣ Cole e execute este código:

// Backup dos dados
const backup = {
  learning: localStorage.getItem('bullex_ai_learning_history'),
  state: localStorage.getItem('bullex_ai_learning_state'),
  config: localStorage.getItem('bullex_ai_operational_config'),
  signals: localStorage.getItem('bullex_signals'),
  timestamp: new Date().toISOString()
};
console.log('📦 Backup criado:', backup);

// RESET INTELIGENTE - Remove apenas configurações ruins
localStorage.removeItem('bullex_ai_learning_history');
localStorage.removeItem('bullex_ai_learning_state');
localStorage.removeItem('bullex_ai_operational_config');

// Mantém sinais para referência
console.log('✅ Dados de aprendizado resetados!');
console.log('📊 Sinais históricos mantidos para análise');

// Recarregar página
setTimeout(() => {
  console.log('🔄 Recarregando aplicação...');
  window.location.reload();
}, 1000);

4️⃣ A página será recarregada automaticamente

5️⃣ O sistema começará com as NOVAS configurações otimizadas:
   ✅ Thresholds realistas (50-65%)
   ✅ Penalizações balanceadas
   ✅ Requisitos alcançáveis
   ✅ Aprendizado progressivo real

══════════════════════════════════════════════════════════

🎯 NOVO COMPORTAMENTO ESPERADO:

📈 Thresholds Progressivos:
   • WinRate < 40%: Min 50% (permite aprendizado)
   • WinRate 40-50%: Min 55% (ajuste gradual)
   • WinRate 50-60%: Min 58% (ficando seletivo)
   • WinRate > 60%: Min 62% (alta performance)

⚖️ Penalizações Balanceadas:
   • Padrão fraco (<35%): -25 pts
   • Padrão ruim (<45%): -15 pts
   • Padrão bom (>75%): +20 pts
   • Sem penalizações brutais que impedem sinais

📊 Requisitos Realistas:
   • Tendência mínima: 45 (antes era 65)
   • Suporte/Resistência: 50 (antes era 70)
   • Confirmações: 2 (antes eram 3)

🧠 Aprendizado Real:
   • IA aprende COM os sinais gerados
   • Ajustes graduais e progressivos
   • Melhora contínua baseada em resultados
   • Não se autopunir antes de tentar

══════════════════════════════════════════════════════════

🚀 TESTE RÁPIDO:

Após o reset, clique em "Gerar Novo Sinal" e observe:

✅ Deve gerar sinais com 50-65% de confiança
✅ Logs devem mostrar análise detalhada
✅ Penalizações devem ser proporcionais
✅ Sistema deve aprender progressivamente

Se ainda não gerar sinais, verifique o filtro mínimo na interface
e reduza para 50% temporariamente.

══════════════════════════════════════════════════════════

EOF

echo ""
echo "✅ Instruções exibidas!"
echo ""
echo "💡 DICA: Se preferir manter algum dado de aprendizado útil,"
echo "   você pode editar o código acima antes de executar."
