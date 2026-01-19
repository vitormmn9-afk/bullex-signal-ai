#!/bin/bash

# Script para testar a resiliência do servidor contra hibernação
# Simula a hibernação matando o servidor e verifica se ele revive

echo "🧪 Teste de Resiliência contra Hibernação"
echo "=========================================="
echo ""

# 1. Verificar estado inicial
echo "1️⃣ Estado inicial:"
/workspaces/bullex-signal-ai/check-server.sh
echo ""

# 2. Simular hibernação matando o servidor
echo "2️⃣ Simulando hibernação (matando servidor)..."
echo "⚠️ Matando processo na porta 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ Servidor morto"
echo ""

# 3. Verificar se o servidor revive automaticamente
echo "3️⃣ Aguardando monitor reviver o servidor..."
for i in {1..30}; do
    echo -n "."
    if lsof -i:8080 > /dev/null 2>&1; then
        echo ""
        echo "✅ Servidor REVIVEU automaticamente em ${i} segundos!"
        break
    fi
    sleep 1
done
echo ""

# 4. Verificar estado final
echo "4️⃣ Estado final:"
/workspaces/bullex-signal-ai/check-server.sh
echo ""

# 5. Resultado
if lsof -i:8080 > /dev/null 2>&1; then
    echo "🎉 TESTE PASSOU! Servidor sobreviveu à hibernação simulada!"
    exit 0
else
    echo "❌ TESTE FALHOU! Servidor não reviveu após hibernação simulada!"
    exit 1
fi
