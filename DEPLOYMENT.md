# Deployment Instructions

## Status: ✅ App Pronto para Deploy

O aplicativo **Bullex AI Signals** está totalmente construído e testado. Siga um dos métodos abaixo para publicar:

### Método 1: Deploy via Vercel Web UI (Recomendado - Mais Rápido)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Cole a URL do repositório: `https://github.com/vitormmn9-afk/bullex-signal-ai`
4. Clique **"Import"**
5. Na próxima tela, configure:
   - **Framework**: `Other` (Vite)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables** (clique "Add"):
     - `VITE_SUPABASE_URL` = `https://bpqsgfdktlacdviumdnh.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXNnZmRrdGxhY2RidXVtZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzMzMzUsImV4cCI6MjA1MjA0OTMzNX0.EVEMuYa30-tBRvNIKvA55MLQJtZMN4eFZjIqHfkk8jI`
6. Clique **"Deploy"** e aguarde (2-3 minutos)
7. Você receberá uma URL pública tipo: `https://bullex-signal-ai.vercel.app`

### Método 2: Deploy via CLI (com autenticação manual)

```bash
cd /workspaces/bullex-signal-ai

# 1. Login (abra o link do device code quando aparecer)
vercel login

# 2. Link projeto
vercel link --yes

# 3. Deploy
vercel deploy --prod --yes
```

### Método 3: Deploy Automático (Push para Main)

Após vincular o repositório na Vercel uma vez (Método 1), qualquer push em `main` dispara deploy automático.

---

## O Que Está Incluído

✅ **App Completo com IA**
- Análise técnica multifatorial (RSI, MACD, Bollinger Bands, padrões de velas)
- Aprendizado contínuo com histórico (localStorage)
- Filtro de confiança mínima ajustável (80–100%)
- Geração automática com retry protegido
- Notificação 1 minuto antes da entrada na vela

✅ **Suporte a Múltiplos Mercados**
- Mercado Aberto (EUR/USD, GBP/USD, etc.)
- OTC (pares OTC)
- Toggle simples entre os dois

✅ **UI/UX Polido**
- Tema escuro com gradientes
- Responsive (mobile-friendly)
- Cards de sinal com tempo real
- Badge "Alta Confiança" para sinais ≥90%

✅ **Pronto para Produção**
- Build otimizado (dist/ gerado)
- Variáveis de ambiente seguras
- Arquivo vercel.json configurado
- README com instruções

---

## Próximos Passos

1. **Escolha um método de deploy acima**
2. **Aguarde a publicação** (2–5 minutos)
3. **Acesse a URL pública** e teste o app
4. **Registre a URL** para referência

---

## Suporte

Se tiver dúvidas durante o deploy:
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o repositório está visível no GitHub (público)
- Tente fazer push de mudanças menores para validar CI/CD

**Seu app está pronto! 🚀**
