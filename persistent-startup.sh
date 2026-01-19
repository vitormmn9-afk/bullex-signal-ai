#!/bin/bash

# Script que garante que o servidor inicia sempre que o codespace acorda
# Este script deve ser executado como um serviço de sistema

set -e

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
PORT=8080
LOG_FILE="/tmp/persistent-startup.log"
SERVER_LOG="/tmp/vite-server.log"
PID_FILE="/tmp/bullex-server.pid"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Função para verificar se o servidor está rodando
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            # Verificar se realmente está escutando na porta
            if lsof -i:$PORT -sTCP:LISTEN > /dev/null 2>&1; then
                return 0
            fi
        fi
    fi
    return 1
}

# Função para iniciar o servidor
start_server() {
    cd "$WORKSPACE_DIR"
    
    log_message "🚀 Iniciando servidor na porta $PORT..."
    
    # Limpar processos antigos
    pkill -f "bun run dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Iniciar servidor
    if command -v bun &> /dev/null; then
        nohup bun run dev > "$SERVER_LOG" 2>&1 &
    else
        nohup npm run dev > "$SERVER_LOG" 2>&1 &
    fi
    
    local server_pid=$!
    echo $server_pid > "$PID_FILE"
    
    log_message "✅ Servidor iniciado com PID: $server_pid"
    
    # Aguardar até estar pronto (max 30s)
    local wait_count=0
    while [ $wait_count -lt 30 ]; do
        if lsof -i:$PORT -sTCP:LISTEN > /dev/null 2>&1; then
            log_message "✅ Servidor pronto e escutando na porta $PORT"
            return 0
        fi
        sleep 1
        wait_count=$((wait_count + 1))
    done
    
    log_message "⚠️ Servidor iniciado mas ainda não respondendo na porta"
    return 0
}

# Main
log_message "🔄 Verificando status do servidor..."

if is_server_running; then
    log_message "✅ Servidor já está rodando"
else
    log_message "⚠️ Servidor não está rodando, iniciando..."
    start_server
fi

log_message "📊 Status completo:"
log_message "   - PID File: $PID_FILE"
log_message "   - Server Log: $SERVER_LOG"
log_message "   - Startup Log: $LOG_FILE"

# Verificar status final
if is_server_running; then
    log_message "✅ Sistema operacional!"
    exit 0
else
    log_message "❌ Falha ao iniciar sistema"
    exit 1
fi
