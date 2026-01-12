#!/bin/bash

echo "🚀 Iniciando servidor persistente..."

# Matar processos existentes
pkill -f "keep-alive.sh" 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Tornar o script executável
chmod +x /workspaces/bullex-signal-ai/keep-alive.sh

# Iniciar o keep-alive em background
nohup /workspaces/bullex-signal-ai/keep-alive.sh > /tmp/keep-alive.log 2>&1 &

echo "✅ Sistema persistente iniciado!"
echo "📊 Logs disponíveis em:"
echo "   - Keep-alive: /tmp/keep-alive.log"
echo "   - Servidor: /tmp/vite-server.log"
echo ""
echo "🔍 Para verificar status: tail -f /tmp/keep-alive.log"
echo "🛑 Para parar: pkill -f keep-alive.sh"
