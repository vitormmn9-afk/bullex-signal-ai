# Como Adicionar Environment Variables no Vercel - Guia Passo a Passo

## Cenário: Você está na tela de Import do Vercel

Quando você clica em "Import Git Repository" e seleciona o repositório, você verá uma tela assim:

```
Project Name: bullex-signal-ai
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: (deixe vazio ou npm install)
```

## Passo a Passo para Adicionar as Variáveis

### PASSO 1: Procure pela seção "Environment Variables"

Na mesma tela de import, **role para baixo** até encontrar uma seção que diz:
- **"Environment Variables"** ou **"Envs"** ou algo similar

Se não encontrar, procure por um botão/link que diz:
- **"Add Environment Variables"** ou **"+ Add"**

### PASSO 2: Adicione a Primeira Variável

Clique no botão **"+ Add"** ou similar.

Você verá dois campos:
```
[KEY________________]  [VALUE____________________________________]
```

Na primeira linha, preencha:
- **KEY**: `VITE_SUPABASE_URL`
- **VALUE**: `https://bpqsgfdktlacdviumdnh.supabase.co`

Depois clique **"Add"** novamente (se houver um botão) ou deixe espaço para a próxima.

### PASSO 3: Adicione a Segunda Variável

Clique novamente em **"+ Add"** (ou ele já aparecerá uma segunda linha vazia).

Na segunda linha, preencha:
- **KEY**: `VITE_SUPABASE_ANON_KEY`
- **VALUE**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXNnZmRrdGxhY2RidXVtZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzMzMzUsImV4cCI6MjA1MjA0OTMzNX0.EVEMuYa30-tBRvNIKvA55MLQJtZMN4eFZjIqHfkk8jI`

### PASSO 4: Confirme e Deploy

Após preencher as duas variáveis, você verá:
```
Environment Variables:
✓ VITE_SUPABASE_URL = https://bpqsgfdktlacdviumdnh.supabase.co
✓ VITE_SUPABASE_ANON_KEY = eyJhbGci...jI
```

Clique em **"Deploy"** e aguarde 2-5 minutos.

---

## Se Ainda Não Encontrar a Seção

Se você já criou o projeto no Vercel e não conseguiu adicionar as vars durante o import:

1. Abra o dashboard do Vercel
2. Clique no projeto **"bullex-signal-ai"**
3. Clique em **"Settings"** (engrenagem no topo)
4. Procure por **"Environment Variables"** no menu esquerdo
5. Clique **"Add New"**
6. Preencha como descrito acima
7. Clique **"Save"**
8. Na aba **"Deployments"**, clique em **"Redeploy"** na build mais recente

---

## Copia Rápida (Cole Direto)

Se preferir, tenho as chaves prontas:

```
VITE_SUPABASE_URL
https://bpqsgfdktlacdviumdnh.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXNnZmRrdGxhY2RidXVtZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzMzMzUsImV4cCI6MjA1MjA0OTMzNX0.EVEMuYa30-tBRvNIKvA55MLQJtZMN4eFZjIqHfkk8jI
```

---

## Se Ainda Tiver Dúvida

Envie uma captura de tela da tela do Vercel e eu te indico exatamente onde clicar! 📸
