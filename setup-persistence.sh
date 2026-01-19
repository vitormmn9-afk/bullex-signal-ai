#!/bin/bash

# Script para configurar a persistência completa do servidor
# Solução robusta sem dependência de cron ou systemd

set -e

WORKSPACE_DIR="/workspaces/bullex-signal-ai"

echo "🔧 Configurando persistência do servidor..."

# 1. Tornar scripts executáveis
echo "📝 Configurando permissões..."
chmod +x "$WORKSPACE_DIR/persistent-startup.sh"
chmod +x "$WORKSPACE_DIR/health-check.sh"
chmod +x "$WORKSPACE_DIR/keep-alive.sh"

# 2. Parar processos antigos
echo "🧹 Limpando processos antigos..."
pkill -f "monitor-forever.sh" 2>/dev/null || true
pkill -f "keep-alive.sh" 2>/dev/null || true
sleep 1

# 3. Adicionar ao .bashrc para iniciar ao abrir terminal
echo "📄 Configurando .bashrc..."
if ! grep -q "persistent-startup.sh" ~/.bashrc; then
    cat >> ~/.bashrc << 'EOF'

# Auto-start Bullex Signal AI Server
if [ -f "/workspaces/bullex-signal-ai/persistent-startup.sh" ]; then
    /workspaces/bullex-signal-ai/persistent-startup.sh > /dev/null 2>&1 &
fi
EOF
fi

# 4. Criar script de monitoramento contínuo super robusto
cat > "$WORKSPACE_DIR/monitor-forever.sh" << 'EOF'
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
EOF

chmod +x "$WORKSPACE_DIR/monitor-forever.sh"

# 5. Criar wrapper ultra robusto para manter o monitor sempre vivo
cat > "$WORKSPACE_DIR/ultra-monitor.sh" << 'EOF'
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
EOF

chmod +x "$WORKSPACE_DIR/ultra-monitor.sh"

# 6. Configurar hook do VS Code para iniciar o servidor quando o workspace abrir
mkdir -p "$WORKSPACE_DIR/.vscode"
cat > "$WORKSPACE_DIR/.vscode/settings.json" << 'EOF'
{
  "terminal.integrated.profiles.linux": {
    "bash": {
      "path": "bash",
      "args": ["-c", "/workspaces/bullex-signal-ai/persistent-startup.sh > /dev/null 2>&1 & exec bash"]
    }
  }
}
EOF

# 7. Iniciar o servidor agora
echo "🚀 Iniciando servidor..."
"$WORKSPACE_DIR/persistent-startup.sh"

# 8. Iniciar ultra monitor em background completamente desacoplado
echo "🛡️ Iniciando monitor ultra robusto..."
# Usar setsid para criar uma nova sessão, desacoplando completamente do terminal atual
setsid "$WORKSPACE_DIR/ultra-monitor.sh" > /dev/null 2>&1 &
sleep 2

# Verificar se o monitor está rodando
if pgrep -f "ultra-monitor.sh" > /dev/null; then
    echo "✅ Monitor iniciado com sucesso!"
else
    echo "⚠️ Erro ao iniciar monitor, tentando método alternativo..."
    nohup "$WORKSPACE_DIR/ultra-monitor.sh" > /dev/null 2>&1 & disown
    sleep 2
fi

echo ""
echo "✅ Configuração completa!"
echo ""
echo "📊 Arquivos de log:"
echo "   - Ultra Monitor: /tmp/ultra-monitor.log"
echo "   - Monitor: /tmp/monitor-forever.log"
echo "   - Health check: /tmp/health-check.log"
echo "   - Startup: /tmp/persistent-startup.log"
echo "   - Server: /tmp/vite-server.log"
echo ""
echo "🔍 Verificar status:"
echo "   tail -f /tmp/ultra-monitor.log"
echo "   ps aux | grep monitor"
echo ""
echo "🌐 URL do servidor:"
echo "   http://localhost:8080"
echo ""
echo "⚡ O servidor agora vai:"
echo "   ✓ Iniciar automaticamente quando o codespace acordar"
echo "   ✓ Ser monitorado continuamente (a cada 30s)"
echo "   ✓ Reiniciar automaticamente se cair"
echo "   ✓ Monitor se auto-reinicia se falhar"
echo "   ✓ Processos completamente desacoplados do terminal"
echo ""
