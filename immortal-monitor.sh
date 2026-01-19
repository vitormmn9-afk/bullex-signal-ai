#!/bin/bash

# Monitor imortal que nunca para e sempre revive o servidor

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
PID_FILE="/tmp/bullex-server.pid"
LOG_FILE="/tmp/monitor-immortal.log"
CHECK_INTERVAL=15

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "🛡️ Monitor Imortal iniciado (PID: $$)"

# Loop infinito com proteção total
while true; do
    # Verificar se o servidor está rodando
    if lsof -i:8080 > /dev/null 2>&1; then
        # Servidor está UP
        if [ $((RANDOM % 20)) -eq 0 ]; then
            log "✅ Servidor ativo na porta 8080"
        fi
    else
        # Servidor está DOWN - REVIVER!
        log "❌ Servidor não está respondendo na porta 8080!"
        log "🔄 Revivendo servidor..."
        
        # Limpar processos zumbis
        pkill -9 -f "vite" 2>/dev/null || true
        sleep 2
        
        # Reiniciar servidor
        cd "$WORKSPACE_DIR"
        nohup npm run dev > /tmp/vite-server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > "$PID_FILE"
        disown $SERVER_PID 2>/dev/null || true
        
        log "✅ Servidor revivido com PID: $SERVER_PID"
    fi
    
    # Verificar se o próprio monitor está saudável
    if [ -f /proc/$$/status ]; then
        # Monitor está vivo
        sleep $CHECK_INTERVAL
    else
        # Algo muito errado - mas continuamos
        log "⚠️ Status do monitor indeterminado, mas continuando..."
        sleep $CHECK_INTERVAL
    fi
done
