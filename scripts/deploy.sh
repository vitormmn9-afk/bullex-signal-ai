#!/bin/bash

echo "🚀 Iniciando deploy automático no Vercel..."

# Instalar Vercel CLI se não tiver
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Fazer deploy
echo "🔧 Fazendo deploy..."
vercel deploy --prod \
  --token "$VERCEL_TOKEN" \
  --env VITE_SUPABASE_URL=https://bpqsgfdktlacdviumdnh.supabase.co \
  --env VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXNnZmRrdGxhY2RidXVtZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzMzMzUsImV4cCI6MjA1MjA0OTMzNX0.EVEMuYa30-tBRvNIKvA55MLQJtZMN4eFZjIqHfkk8jI

if [ $? -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
else
    echo "❌ Erro no deploy"
    exit 1
fi
