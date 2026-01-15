#!/bin/bash

echo "🚀 Iniciando servidor persistente..."
echo "🔄 Garantindo que o servidor fica online 24/7..."

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
KEEP_ALIVE_SCRIPT="$WORKSPACE_DIR/keep-alive.sh"

# Matar qualquer instância anterior
echo "🧹 Limpando processos anteriores..."
pkill -f "keep-alive.sh" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "bun run dev" 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
sleep 2

# Tornar o script executável
chmod +x "$KEEP_ALIVE_SCRIPT"

# Iniciar o keep-alive em background com nohup
echo "⏳ Inicializando monitoramento persistente..."
nohup "$KEEP_ALIVE_SCRIPT" >> /tmp/keep-alive.log 2>&1 &
KEEP_ALIVE_PID=$!

# Verificar se o processo foi iniciado corretamente
sleep 2
if ps -p $KEEP_ALIVE_PID > /dev/null 2>&1; then
    echo "✅ Sistema persistente iniciado com sucesso!"
    echo "   PID do keep-alive: $KEEP_ALIVE_PID"
    echo ""
    echo "📊 Informações de logs:"
    echo "   - Keep-alive: /tmp/keep-alive.log"
    echo "   - Servidor: /tmp/vite-server.log"
    echo ""
    echo "🔍 Verificar status em tempo real:"
    echo "   tail -f /tmp/keep-alive.log"
    echo ""
    echo "🛑 Para parar o servidor:"
    echo "   pkill -f keep-alive.sh"
    echo ""
    echo "🌐 URL do servidor:"
    echo "   http://localhost:8080"
else
    echo "❌ Erro ao iniciar o sistema persistente"
    exit 1
fi
