# Bullex AI Signals

Aplicação de sinais com IA para velas de 1 minuto, com filtro de confiança mínima, aprendizado contínuo e suporte a Mercado Aberto e OTC.

## Tecnologias
- Vite + React + TypeScript
- Tailwind + shadcn-ui
- Supabase (cliente)

## Rodando localmente

```bash
npm install
npm run dev
# abra http://localhost:8080
```

Crie `.env` com:

```env
VITE_SUPABASE_URL="https://<seu-projeto>.supabase.co"
VITE_SUPABASE_ANON_KEY="<sua-chave-anon>"
```

## Build de produção

```bash
npm run build
npm run preview
# abra a URL mostrada
```

## Deploy na Vercel

1. Login e link do projeto:
```bash
vercel login
vercel link --yes
```
2. Variáveis de ambiente (em Project Settings ou CLI):
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`

3. Deploy:
```bash
vercel deploy --prod --yes
```

O arquivo `vercel.json` já está configurado com `buildCommand` e `outputDirectory`.

## Funcionalidades
- Filtro de confiança mínima ajustável (80–100%), aplicado em geração, lista e estatísticas
- Geração automática que reintenta quando não há oportunidade ≥ confiança mínima
- Aprendizado e evolução da IA (histórico em localStorage)
- Notificação de entrada 1 minuto antes e saída ao fim da vela

## Aviso
Trading envolve riscos. Use com responsabilidade.
