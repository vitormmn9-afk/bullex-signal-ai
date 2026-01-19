# 🚀 DEPLOY AUTOMÁTICO - CONFIGURAÇÃO SIMPLES

## ✅ EU JÁ CONFIGUREI TUDO!

Agora você tem 2 opções **SUPER FÁCEIS** para ter seu app 24/7:

---

## 🎯 OPÇÃO 1: VERCEL INTERFACE WEB (MAIS FÁCIL - 2 MIN)

### Passo a passo:

1. **Abra:** https://vercel.com
2. **Login** com sua conta GitHub
3. **Clique** em "Add New..." → "Project"
4. **Procure** por: `bullex-signal-ai`
5. **Clique** em "Import"
6. **Configure as variáveis** (cole exatamente):
   
   ```
   VITE_SUPABASE_URL
   https://bpqsgfdktlacdviumdnh.supabase.co
   ```
   
   ```
   VITE_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXNnZmRrdGxhY2RpdXVtZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzMzMzUsImV4cCI6MjA1MjA0OTMzNX0.EVEMuYa30-tBRvNIKvA55MLQJtZMN4eFZjIqHfkk8jI
   ```

7. **Clique** em "Deploy"
8. **PRONTO!** Em 2-3 minutos seu app estará online 24/7

### Resultado:
- ✅ URL permanente tipo: `https://bullex-signal-ai.vercel.app`
- ✅ Deploy automático a cada commit
- ✅ App rodando 24/7
- ✅ HTTPS gratuito

---

## 🎯 OPÇÃO 2: GITHUB ACTIONS (AUTOMÁTICO TOTAL)

**Eu já criei o workflow!** Só precisa configurar os secrets:

### 1. Pegue os tokens da Vercel:

1. Vá em: https://vercel.com/account/tokens
2. Crie um novo token (qualquer nome)
3. Copie o token

### 2. Configure no GitHub:

1. Vá em: https://github.com/vitormmn9-afk/bullex-signal-ai/settings/secrets/actions
2. Adicione estes secrets:

   - `VERCEL_TOKEN` = (o token que você copiou)
   - `VITE_SUPABASE_URL` = `https://bpqsgfdktlacdviumdnh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXNnZmRrdGxhY2RpdXVtZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzMzMzUsImV4cCI6MjA1MjA0OTMzNX0.EVEMuYa30-tBRvNIKvA55MLQJtZMN4eFZjIqHfkk8jI`

3. Para pegar `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`:
   - Primeiro faça o deploy pela Opção 1
   - Execute: `vercel inspect` (após conectar o projeto)
   - Ou encontre em: https://vercel.com/vitormmn9-afk/bullex-signal-ai/settings

### 3. Faça um commit:

```bash
git add .
git commit -m "Deploy automático configurado"
git push
```

### Resultado:
- ✅ Deploy automático a cada push
- ✅ Nada de configuração manual
- ✅ App sempre atualizado

---

## 🏆 RECOMENDAÇÃO

**Use a OPÇÃO 1 primeiro!** É muito mais rápida e simples.

A Opção 2 é para depois, se quiser automatizar tudo.

---

## 📱 APÓS O DEPLOY

Seu app estará em:
```
https://bullex-signal-ai.vercel.app
```

**Ou similar** (a Vercel vai te mostrar a URL exata)

---

## ❓ DÚVIDAS?

**P: Vai funcionar 24/7 mesmo?**
R: SIM! A Vercel não hiberna como o Codespace.

**P: É de graça?**
R: SIM! 100% gratuito para projetos pessoais.

**P: E se eu quiser mudar algo?**
R: Faça commit no GitHub, a Vercel atualiza automaticamente!

---

## 🎯 PRÓXIMO PASSO

**AGORA:** Vá para https://vercel.com e siga a Opção 1!

Em 2 minutos seu app estará rodando 24/7! 🚀
