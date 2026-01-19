#!/bin/bash

# Script para corrigir o problema de hibernação do Codespace
# Usa systemd user service para garantir persistência TOTAL

set -e

WORKSPACE_DIR="/workspaces/bullex-signal-ai"
SERVICE_NAME="bullex-server"

echo "🔧 Corrigindo problema de hibernação..."

# 1. Criar diretório para serviços do usuário
mkdir -p ~/.config/systemd/user

# 2. Criar service file do systemd
cat > ~/.config/systemd/user/${SERVICE_NAME}.service << EOF
[Unit]
Description=Bullex Signal AI Server
After=network.target

[Service]
Type=simple
WorkingDirectory=${WORKSPACE_DIR}
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
StandardOutput=append:/tmp/vite-server.log
StandardError=append:/tmp/vite-error.log
Environment="NODE_ENV=development"
Environment="FORCE_COLOR=1"

# Configurações de persistência
# Reinicia automaticamente se o processo morrer
RestartForceExitStatus=143
SuccessExitStatus=143

# Tempo limite para matar o processo
TimeoutStopSec=10

[Install]
WantedBy=default.target
EOF

# 3. Criar serviço de monitoramento adicional
cat > ~/.config/systemd/user/${SERVICE_NAME}-monitor.service << EOF
[Unit]
Description=Bullex Server Monitor
After=${SERVICE_NAME}.service

[Service]
Type=simple
WorkingDirectory=${WORKSPACE_DIR}
ExecStart=${WORKSPACE_DIR}/health-check.sh
Restart=always
RestartSec=30
StandardOutput=append:/tmp/monitor.log
StandardError=append:/tmp/monitor-error.log

[Install]
WantedBy=default.target
EOF

# 4. Criar timer para health checks
cat > ~/.config/systemd/user/${SERVICE_NAME}-healthcheck.timer << EOF
[Unit]
Description=Bullex Server Health Check Timer
Requires=${SERVICE_NAME}.service

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
Persistent=true

[Install]
WantedBy=timers.target
EOF

cat > ~/.config/systemd/user/${SERVICE_NAME}-healthcheck.service << EOF
[Unit]
Description=Bullex Server Health Check
Requires=${SERVICE_NAME}.service

[Service]
Type=oneshot
WorkingDirectory=${WORKSPACE_DIR}
ExecStart=${WORKSPACE_DIR}/health-check.sh
StandardOutput=append:/tmp/healthcheck.log
StandardError=append:/tmp/healthcheck-error.log
EOF

# 5. Recarregar systemd
echo "📝 Recarregando systemd..."
systemctl --user daemon-reload

# 6. Habilitar lingering (mantém processos do usuário mesmo sem login)
echo "🔐 Habilitando lingering para o usuário..."
loginctl enable-linger $USER || true

# 7. Parar processos antigos
echo "🧹 Parando processos antigos..."
pkill -f "ultra-monitor.sh" 2>/dev/null || true
pkill -f "monitor-forever.sh" 2>/dev/null || true
pkill -f "keep-alive.sh" 2>/dev/null || true
sleep 2

# Parar processos vite antigos
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
sleep 2

# 8. Habilitar e iniciar serviços
echo "🚀 Iniciando serviços..."
systemctl --user enable ${SERVICE_NAME}.service
systemctl --user enable ${SERVICE_NAME}-monitor.service
systemctl --user enable ${SERVICE_NAME}-healthcheck.timer

systemctl --user restart ${SERVICE_NAME}.service
systemctl --user restart ${SERVICE_NAME}-monitor.service
systemctl --user start ${SERVICE_NAME}-healthcheck.timer

# 9. Aguardar inicialização
echo "⏳ Aguardando servidor iniciar..."
sleep 5

# 10. Verificar status
echo ""
echo "📊 Status dos serviços:"
systemctl --user status ${SERVICE_NAME}.service --no-pager || true
echo ""
echo "📊 Status do monitor:"
systemctl --user status ${SERVICE_NAME}-monitor.service --no-pager || true
echo ""
echo "📊 Status do timer:"
systemctl --user status ${SERVICE_NAME}-healthcheck.timer --no-pager || true

echo ""
echo "✅ Persistência configurada com systemd!"
echo ""
echo "📋 Comandos úteis:"
echo "  Ver logs do servidor:     journalctl --user -u ${SERVICE_NAME}.service -f"
echo "  Ver logs do monitor:      journalctl --user -u ${SERVICE_NAME}-monitor.service -f"
echo "  Status do servidor:       systemctl --user status ${SERVICE_NAME}.service"
echo "  Reiniciar servidor:       systemctl --user restart ${SERVICE_NAME}.service"
echo "  Parar servidor:           systemctl --user stop ${SERVICE_NAME}.service"
echo ""
echo "🎯 O servidor agora vai continuar rodando mesmo após hibernação do Codespace!"
