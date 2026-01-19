#!/bin/bash

echo "🚀 DEPLOY RÁPIDO NA VERCEL"
echo "=========================="
echo ""

# Verifica se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI pronto!"
echo ""
echo "📋 INSTRUÇÕES:"
echo "1. Você precisará fazer login no GitHub"
echo "2. Selecione o projeto 'bullex-signal-ai'"
echo "3. Aceite as configurações padrão"
echo ""
echo "Pressione ENTER para continuar..."
read

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "🚀 Iniciando deploy na Vercel..."
    echo ""
    
    # Deploy
    vercel --prod
    
    echo ""
    echo "✅ DEPLOY CONCLUÍDO!"
    echo ""
    echo "🎯 Seu app está rodando 24/7 agora!"
    echo "📱 Acesse a URL que apareceu acima"
    echo ""
else
    echo "❌ Erro no build. Verifique os erros acima."
    exit 1
fi
