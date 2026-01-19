#!/bin/bash

# Monitor ultra robusto que nunca para
# Usa um loop infinito com proteções contra falhas

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
LOG_FILE="/tmp/monitor-forever.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "🚀 Monitor iniciado (PID: $$)"

# Trap para garantir que nunca para inesperadamente
trap 'log "⚠️ Sinal recebido, continuando..."; sleep 1' SIGTERM SIGINT SIGHUP

while true; do
    # Health check a cada 30 segundos
    sleep 30
    
    # Executar health check
    if ! "$WORKSPACE_DIR/health-check.sh" >> "$LOG_FILE" 2>&1; then
        log "⚠️ Health check falhou, mas continuando monitoramento..."
    fi
    
    # Verificar se o próprio monitor ainda está saudável
    if [ $((RANDOM % 100)) -eq 0 ]; then
        log "✅ Monitor ativo e operacional"
    fi
done
