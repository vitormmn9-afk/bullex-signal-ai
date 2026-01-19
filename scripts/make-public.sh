#!/bin/bash

echo "🔓 TORNANDO REPOSITÓRIO PÚBLICO..."
echo ""
echo "Isso vai permitir:"
echo "✅ GitHub Pages funcionar"
echo "✅ Deploy 24/7 gratuito"
echo "✅ Compartilhar o projeto"
echo ""
echo "⚠️  Seu código ficará visível publicamente"
echo ""
read -p "Deseja continuar? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]
then
    gh repo edit vitormmn9-afk/bullex-signal-ai --visibility public
    echo ""
    echo "✅ REPOSITÓRIO PÚBLICO!"
    echo ""
    echo "Agora vá em: https://github.com/vitormmn9-afk/bullex-signal-ai/settings/pages"
    echo "E selecione: GitHub Actions"
    echo ""
fi
