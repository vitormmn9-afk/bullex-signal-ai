#!/bin/bash

# Script para manter o servidor sempre ativo
# Reinicia automaticamente se o processo cair

echo "🔄 Iniciando sistema de monitoramento do servidor..."
echo "⏰ $(date) - Keep-alive iniciado"

# Função para verificar se o servidor está rodando
check_server() {
    curl -s http://localhost:8080 > /dev/null 2>&1
    return $?
}

# Função para iniciar o servidor
start_server() {
    echo "🚀 $(date) - Iniciando servidor..."
    cd /workspaces/bullex-signal-ai
    npm run dev > /tmp/vite-server.log 2>&1 &
    SERVER_PID=$!
    echo "✅ Servidor iniciado com PID: $SERVER_PID"
    sleep 5
}

# Matar qualquer processo existente na porta 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Iniciar servidor pela primeira vez
start_server

# Loop infinito de monitoramento
while true; do
    sleep 10
    
    if ! check_server; then
        echo "⚠️  $(date) - Servidor não está respondendo!"
        echo "🔄 $(date) - Reiniciando servidor..."
        
        # Matar processo antigo se existir
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        sleep 2
        
        # Reiniciar servidor
        start_server
        
        echo "✅ $(date) - Servidor reiniciado com sucesso"
    fi
done
