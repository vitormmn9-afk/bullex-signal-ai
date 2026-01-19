#!/bin/bash

# Script para iniciar servidor IMORTAL que sobrevive a hibernação
# Usa técnicas de processos daemon para garantir persistência total

set -e

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
PID_FILE="/tmp/bullex-server.pid"
LOG_FILE="/tmp/vite-server.log"
MONITOR_LOG="/tmp/monitor-immortal.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MONITOR_LOG"
}

# Função para parar processos antigos
stop_old_processes() {
    log "🧹 Parando processos antigos..."
    
    # Parar monitores antigos
    pkill -f "ultra-monitor.sh" 2>/dev/null || true
    pkill -f "monitor-forever.sh" 2>/dev/null || true
    pkill -f "keep-alive.sh" 2>/dev/null || true
    pkill -f "immortal-monitor.sh" 2>/dev/null || true
    
    # Parar servidor na porta 8080
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    
    # Remover PID file antigo
    rm -f "$PID_FILE"
    
    sleep 3
}

# Função para iniciar servidor como daemon
start_server_daemon() {
    log "🚀 Iniciando servidor como daemon..."
    
    cd "$WORKSPACE_DIR"
    
    # Iniciar servidor com nohup e disown para total independência
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    
    # Disown para desassociar do terminal
    disown $SERVER_PID 2>/dev/null || true
    
    log "✅ Servidor iniciado com PID: $SERVER_PID"
}

# Função para criar monitor imortal
create_immortal_monitor() {
    log "🛡️ Criando monitor imortal..."
    
    cat > "$WORKSPACE_DIR/immortal-monitor.sh" << 'MONITOR_EOF'
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
MONITOR_EOF
    
    chmod +x "$WORKSPACE_DIR/immortal-monitor.sh"
    log "✅ Monitor imortal criado"
}

# Função para iniciar monitor como daemon
start_monitor_daemon() {
    log "🔥 Iniciando monitor imortal como daemon..."
    
    # Iniciar monitor com nohup e disown
    nohup "$WORKSPACE_DIR/immortal-monitor.sh" > /dev/null 2>&1 &
    
    MONITOR_PID=$!
    disown $MONITOR_PID 2>/dev/null || true
    
    log "✅ Monitor imortal iniciado com PID: $MONITOR_PID"
}

# Função para adicionar ao .bashrc
setup_bashrc() {
    log "📄 Configurando .bashrc para auto-start..."
    
    # Remover entradas antigas
    sed -i '/persistent-startup.sh/d' ~/.bashrc 2>/dev/null || true
    sed -i '/start-immortal-server.sh/d' ~/.bashrc 2>/dev/null || true
    
    # Adicionar nova entrada
    if ! grep -q "BULLEX_IMMORTAL_SERVER" ~/.bashrc; then
        cat >> ~/.bashrc << 'BASHRC_EOF'

# Bullex Signal AI - Servidor Imortal
export BULLEX_IMMORTAL_SERVER=1
if [ "$BULLEX_IMMORTAL_SERVER" = "1" ] && [ -f "/workspaces/bullex-signal-ai/start-immortal-server.sh" ]; then
    # Verificar se o servidor já está rodando
    if ! lsof -i:8080 > /dev/null 2>&1; then
        echo "🚀 Iniciando Bullex Server..."
        /workspaces/bullex-signal-ai/start-immortal-server.sh > /dev/null 2>&1 &
    fi
fi
BASHRC_EOF
    fi
    
    log "✅ .bashrc configurado"
}

# Função para criar script de verificação rápida
create_status_script() {
    cat > "$WORKSPACE_DIR/check-server.sh" << 'STATUS_EOF'
#!/bin/bash

echo "📊 Status do Bullex Signal AI Server"
echo "===================================="
echo ""

# Verificar porta 8080
if lsof -i:8080 > /dev/null 2>&1; then
    echo "✅ Servidor ATIVO na porta 8080"
    echo ""
    echo "Processo:"
    lsof -i:8080 | grep LISTEN
else
    echo "❌ Servidor INATIVO"
fi

echo ""
echo "Monitor:"
if pgrep -f "immortal-monitor.sh" > /dev/null; then
    echo "✅ Monitor imortal ATIVO"
    PID=$(pgrep -f "immortal-monitor.sh")
    echo "PID: $PID"
else
    echo "❌ Monitor imortal INATIVO"
fi

echo ""
echo "📝 Últimas 10 linhas do log do monitor:"
tail -n 10 /tmp/monitor-immortal.log 2>/dev/null || echo "Log não encontrado"

echo ""
echo "📝 Últimas 5 linhas do log do servidor:"
tail -n 5 /tmp/vite-server.log 2>/dev/null || echo "Log não encontrado"
STATUS_EOF
    
    chmod +x "$WORKSPACE_DIR/check-server.sh"
}

# EXECUÇÃO PRINCIPAL
main() {
    log "========================================="
    log "🔥 Iniciando Servidor Imortal Bullex AI"
    log "========================================="
    
    # 1. Parar processos antigos
    stop_old_processes
    
    # 2. Criar monitor imortal
    create_immortal_monitor
    
    # 3. Iniciar servidor como daemon
    start_server_daemon
    
    # 4. Aguardar servidor iniciar
    log "⏳ Aguardando servidor iniciar..."
    sleep 5
    
    # 5. Iniciar monitor imortal
    start_monitor_daemon
    
    # 6. Configurar auto-start no .bashrc
    setup_bashrc
    
    # 7. Criar script de status
    create_status_script
    
    # 8. Verificar se tudo está OK
    sleep 3
    
    log ""
    log "========================================="
    log "✅ SERVIDOR IMORTAL INICIADO COM SUCESSO!"
    log "========================================="
    log ""
    
    if lsof -i:8080 > /dev/null 2>&1; then
        log "✅ Servidor respondendo na porta 8080"
    else
        log "⚠️ Aguarde mais alguns segundos para o servidor ficar pronto..."
    fi
    
    if pgrep -f "immortal-monitor.sh" > /dev/null; then
        log "✅ Monitor imortal ativo"
    fi
    
    log ""
    log "📋 Comandos úteis:"
    log "  Verificar status:  $WORKSPACE_DIR/check-server.sh"
    log "  Ver logs servidor: tail -f /tmp/vite-server.log"
    log "  Ver logs monitor:  tail -f /tmp/monitor-immortal.log"
    log ""
    log "🎯 O servidor agora é IMORTAL e sobreviverá à hibernação!"
}

# Executar
main
