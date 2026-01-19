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
