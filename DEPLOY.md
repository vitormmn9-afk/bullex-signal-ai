# 🚀 Guia de Deploy - Sistema Automatizado

## ✅ Pré-requisitos

1. **Node.js** instalado (v18+)
2. **Conta no Supabase** configurada
3. **Supabase CLI** instalado
4. **Git** para versionamento

---

## 📦 1. Deploy da Edge Function (Backend)

### Atualizar Edge Function no Supabase

```bash
# 1. Fazer login no Supabase CLI
supabase login

# 2. Linkar o projeto
supabase link --project-ref SEU_PROJECT_REF

# 3. Deploy da função atualizada
supabase functions deploy generate-signal
```

### Configurar Secrets

```bash
# Configurar API Key do Lovable
supabase secrets set LOVABLE_API_KEY=sua_api_key_aqui
```

---

## 🌐 2. Deploy do Frontend

### Opção A: Vercel (Recomendado)

1. **Conectar ao GitHub**
   ```bash
   git add .
   git commit -m "feat: Sistema automatizado com ML implementado"
   git push origin main
   ```

2. **Deploy no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Importe o repositório
   - Configure as variáveis de ambiente:
     - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
     - `VITE_SUPABASE_ANON_KEY`: Chave anon do Supabase

3. **Deploy automático**
   - Vercel detecta automaticamente Vite
   - Build e deploy automáticos

### Opção B: Netlify

1. **Build local**
   ```bash
   npm run build
   ```

2. **Deploy no Netlify**
   ```bash
   # Instalar Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Deploy
   netlify deploy --prod
   ```

### Opção C: Manual (Servidor próprio)

```bash
# 1. Build
npm run build

# 2. Copiar pasta dist/ para seu servidor
scp -r dist/* usuario@servidor:/var/www/html/

# 3. Configurar nginx/apache para servir os arquivos
```

---

## 🗄️ 3. Configuração do Banco de Dados

### Verificar Tabela signals

A tabela `signals` já deve existir. Verifique no Supabase Dashboard:

```sql
-- Verificar estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'signals';
```

### Habilitar Real-time

1. Vá em **Database** > **Replication**
2. Habilite replication para a tabela `signals`
3. Selecione todos os eventos: INSERT, UPDATE, DELETE

---

## ⚙️ 4. Configurações de Produção

### Ajustar Intervalos (Opcional)

Se quiser ajustar o intervalo de geração automática:

Arquivo: `src/hooks/useAutoSignals.ts`
```typescript
// Para produção, pode aumentar para 60 segundos
const AUTO_GENERATION_INTERVAL = 60000; // 60 segundos
```

### Ajustar Limites de Rate

Edge Function: `supabase/functions/generate-signal/index.ts`

A função já trata erros de rate limit (429) automaticamente.

---

## 🔐 5. Segurança

### Row Level Security (RLS)

Aplicar políticas no Supabase:

```sql
-- Permitir leitura de sinais
CREATE POLICY "Allow read signals" ON signals
  FOR SELECT USING (true);

-- Permitir inserção (apenas pela Edge Function)
CREATE POLICY "Allow insert signals" ON signals
  FOR INSERT WITH CHECK (true);

-- Permitir update de resultado
CREATE POLICY "Allow update result" ON signals
  FOR UPDATE USING (true)
  WITH CHECK (true);
```

---

## 📊 6. Monitoramento

### Logs da Edge Function

```bash
# Ver logs em tempo real
supabase functions logs generate-signal --follow
```

### Métricas do Supabase

No Dashboard do Supabase:
- **Database** > **Table Editor** > signals
- **Logs** > **API Logs**
- **Logs** > **Function Logs**

---

## 🧪 7. Testes Pós-Deploy

### Checklist de Testes

- [ ] Sistema automático inicia corretamente
- [ ] Sinais são gerados automaticamente
- [ ] Dashboard de ML carrega dados
- [ ] Real-time funciona (sinais aparecem imediatamente)
- [ ] Registro de WIN/LOSS funciona
- [ ] IA aprende com os resultados
- [ ] Modo automático pode ser pausado/retomado
- [ ] Estatísticas são atualizadas corretamente

### Testar Localmente Antes do Deploy

```bash
# 1. Configurar .env.local
cp .env.example .env.local

# Adicionar suas credenciais
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_key

# 2. Rodar localmente
npm run dev

# 3. Testar todas as funcionalidades
```

---

## 🐛 8. Troubleshooting

### Sinais não são gerados

1. **Verificar logs da Edge Function**
   ```bash
   supabase functions logs generate-signal
   ```

2. **Verificar API Key do Lovable**
   ```bash
   supabase secrets list
   ```

3. **Verificar console do navegador**
   - Abra DevTools (F12)
   - Veja a aba Console

### Real-time não funciona

1. **Verificar replication**
   - Supabase Dashboard > Database > Replication
   - Certifique-se que `signals` está habilitada

2. **Verificar subscription**
   - Veja console do navegador
   - Deve aparecer "SUBSCRIBED" no log

### Rate Limit Excedido

Se você receber erro 429:
- A Edge Function já trata isso automaticamente
- O sistema aguarda antes de tentar novamente
- Considere aumentar o intervalo de geração

### Build Falha

```bash
# Limpar cache e reinstalar
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

## 📈 9. Performance

### Otimizações Implementadas

1. ✅ **Debouncing**: Sistema evita chamadas duplicadas
2. ✅ **Caching**: Real-time reduz chamadas ao banco
3. ✅ **Lazy Loading**: Componentes carregam sob demanda
4. ✅ **Minificação**: Build otimizado para produção

### Métricas Esperadas

- **Tempo de resposta**: < 3s por sinal
- **Bundle size**: ~250KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

---

## 🔄 10. Atualizações Futuras

### Como Fazer Updates

```bash
# 1. Desenvolver localmente
git checkout -b feature/nova-funcionalidade

# 2. Testar
npm run dev

# 3. Fazer commit
git add .
git commit -m "feat: nova funcionalidade"

# 4. Push
git push origin feature/nova-funcionalidade

# 5. Merge para main
# (fazer PR no GitHub)

# 6. Deploy automático
# Vercel/Netlify faz deploy automaticamente do main
```

### Atualizar Edge Function

```bash
# Após mudanças na função
supabase functions deploy generate-signal
```

---

## 📞 11. Suporte

### Logs Importantes

```bash
# Frontend (Browser Console)
- Network tab: Ver requisições
- Console tab: Ver erros
- Application tab: Ver storage

# Backend (Supabase)
- Function Logs: Ver execuções da Edge Function
- API Logs: Ver requisições ao banco
- Database Logs: Ver queries
```

### Contatos

- **Issues**: Abra uma issue no GitHub
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Documentação**: Ver arquivos SISTEMA_AUTOMATIZADO.md e IMPLEMENTACAO.md

---

## ✅ Checklist Final de Deploy

- [ ] Edge Function deployada
- [ ] Secrets configurados
- [ ] Frontend deployado
- [ ] Real-time habilitado
- [ ] RLS configurado
- [ ] Testes realizados
- [ ] Monitoramento configurado
- [ ] Documentação atualizada
- [ ] Backup do banco configurado
- [ ] DNS configurado (se aplicável)

---

## 🎉 Pronto!

Seu sistema automatizado com Machine Learning está no ar! 🚀

**Próximos passos:**
1. Deixe o sistema rodar por alguns dias
2. Registre pelo menos 30 resultados
3. Acompanhe o dashboard de ML
4. Ajuste parâmetros conforme necessário

---

**Desenvolvido com ❤️ - Sistema de Trading com IA**
