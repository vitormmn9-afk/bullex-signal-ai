#!/bin/bash

# Wrapper que garante que o monitor nunca morre
# Se o monitor cair, este wrapper o reinicia imediatamente

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
LOG_FILE="/tmp/ultra-monitor.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "🛡️ Ultra Monitor iniciado (PID: $$)"

# Loop infinito que mantém o monitor vivo
while true; do
    log "🚀 Iniciando monitor..."
    
    # Executar monitor (isso vai bloquear até o monitor terminar)
    "$WORKSPACE_DIR/monitor-forever.sh"
    
    # Se chegou aqui, o monitor terminou (não deveria acontecer)
    log "❌ Monitor terminou inesperadamente! Reiniciando em 5s..."
    sleep 5
done
