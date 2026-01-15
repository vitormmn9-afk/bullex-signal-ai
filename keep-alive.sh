#!/bin/bash

# Script robustamente para manter o servidor sempre ativo
# Com verificações múltiplas e reinicialização automática

set -e

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
PORT=8080
LOG_FILE="/tmp/keep-alive.log"
SERVER_LOG="/tmp/vite-server.log"
CHECK_INTERVAL=5
MAX_RETRIES=3

# Criar arquivo de log
touch "$LOG_FILE" "$SERVER_LOG"

log_message() {
    local msg="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $msg" | tee -a "$LOG_FILE"
}

# Função para verificar se o servidor está respondendo
check_server() {
    local retry=0
    while [ $retry -lt 3 ]; do
        if timeout 2 curl -sf http://localhost:$PORT > /dev/null 2>&1; then
            return 0
        fi
        retry=$((retry + 1))
        sleep 1
    done
    return 1
}

# Função para limpar porta e processos
cleanup_port() {
    log_message "🧹 Limpando porta $PORT e processos antigos..."
    # Matar por porta (mais seguro)
    lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    # Matar apenas processos npm/bun específicos na porta
    pkill -f "bun run dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    sleep 2
}

# Função para iniciar o servidor
start_server() {
    local attempt=0
    while [ $attempt -lt $MAX_RETRIES ]; do
        attempt=$((attempt + 1))
        log_message "🚀 [Tentativa $attempt/$MAX_RETRIES] Iniciando servidor Vite..."
        
        cd "$WORKSPACE_DIR"
        # Usar bun se disponível, senão npm
        if command -v bun &> /dev/null; then
            nohup bun run dev >> "$SERVER_LOG" 2>&1 &
        else
            nohup npm run dev >> "$SERVER_LOG" 2>&1 &
        fi
        
        local server_pid=$!
        log_message "✅ Servidor iniciado com PID: $server_pid"
        
        # Aguardar servidor ficar pronto
        local wait_time=0
        while [ $wait_time -lt 30 ]; do
            if check_server; then
                log_message "✅ Servidor respondendo corretamente na porta $PORT"
                return 0
            fi
            wait_time=$((wait_time + 1))
            sleep 1
        done
        
        log_message "⚠️  Servidor não respondeu após 30s, tentando novamente..."
        cleanup_port
    done
    
    log_message "❌ Falha ao iniciar servidor após $MAX_RETRIES tentativas"
    return 1
}

log_message "🔄 Iniciando sistema de monitoramento do servidor..."
log_message "📊 Processando na porta $PORT"

# Limpeza inicial
cleanup_port

# Iniciar servidor pela primeira vez
if ! start_server; then
    log_message "❌ Erro crítico ao iniciar servidor"
    exit 1
fi

# Loop infinito de monitoramento robusto
local_check_count=0
while true; do
    sleep $CHECK_INTERVAL
    local_check_count=$((local_check_count + 1))
    
    if ! check_server; then
        log_message "⚠️  [Check #$local_check_count] Servidor não está respondendo!"
        
        # Fazer verificações adicionais
        if ! pgrep -f "npm run dev" > /dev/null && ! pgrep -f "bun run dev" > /dev/null; then
            log_message "❌ Processo do servidor não encontrado em execução"
        fi
        
        log_message "🔄 Limpando e reiniciando servidor..."
        cleanup_port
        
        if ! start_server; then
            log_message "❌ Falha na reinicialização, tentando novamente em 10s..."
            sleep 10
            continue
        fi
        
        log_message "✅ Servidor restaurado com sucesso"
        local_check_count=0
    else
        # Log de status a cada 60 verificações (5 minutos)
        if [ $((local_check_count % 60)) -eq 0 ]; then
            log_message "✅ [Check #$local_check_count] Servidor operacional"
        fi
    fi
done
