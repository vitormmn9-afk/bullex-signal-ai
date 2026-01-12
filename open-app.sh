#!/bin/bash

echo "🌐 Abrindo aplicação no navegador..."

# Obter a URL pública do Codespaces
CODESPACE_URL=$(echo $CODESPACE_NAME | sed 's/^/https:\/\//' | sed 's/$/-8080.app.github.dev/')

# Abrir no navegador do host
"$BROWSER" "http://localhost:8080" 2>/dev/null || \
echo "✅ Aplicação disponível em:"
echo ""
echo "   📱 Local: http://localhost:8080"
echo "   🌍 Público: $CODESPACE_URL"
echo ""
echo "⚠️  Se o link público pedir login, você precisa:"
echo "   1. Ir até a aba 'PORTS' no VS Code (painel inferior)"
echo "   2. Clicar com botão direito na porta 8080"
echo "   3. Selecionar 'Port Visibility' → 'Public'"
