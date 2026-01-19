#!/bin/bash

# Script de health check que roda periodicamente via cron

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
PORT=8080
LOG_FILE="/tmp/health-check.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Verificar se o servidor está respondendo
if timeout 5 curl -sf http://localhost:$PORT > /dev/null 2>&1; then
    log_message "✅ Servidor operacional"
    exit 0
else
    log_message "❌ Servidor não está respondendo, reiniciando..."
    "$WORKSPACE_DIR/persistent-startup.sh" >> "$LOG_FILE" 2>&1
    exit 1
fi
