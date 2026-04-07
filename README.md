# ProspectAI

Ferramenta B2B SaaS de prospeccao de leads para profissionais de IA em Portugal. Usa Google Gemini 2.5 Flash + Google Maps para identificar, qualificar e gerar relatorios estrategicos sobre oportunidades de vendas.

## Arquitetura

```mermaid
graph LR
  A[SearchForm] -->|POST| B[/api/prospect]
  B -->|Gemini + Maps| C[Leads]
  C --> D[ResultsList]
  D -->|Select| E[LeadDetail]
  E -->|POST| F[/api/prospect/report]
  F -->|Gemini / Cache| G[AI Report]
  B & F -->|Persist| H[(Supabase)]
  B & F -->|Rate Limit| I[In-Memory]
```

## Tech Stack

- **Frontend:** React 19, Next.js 15 (App Router), Tailwind CSS 4, Motion
- **Backend:** Next.js API Routes, Google Gemini SDK
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Testing:** Vitest, Testing Library
- **Deploy:** Vercel

## Setup Local

**Pre-requisitos:** Node.js 18+

```bash
git clone https://github.com/mig49/ProspectAI-v2.git
cd ProspectAI-v2
npm install
cp .env.example .env.local  # Preencher variaveis
npm run dev
```

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatoria |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Chave da API Google Gemini | Sim |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publica (anon) do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de servico (server-only) | Sim |
| `APP_URL` | URL de deploy (para OAuth callbacks) | Sim |

## API Reference

### POST /api/prospect

Busca leads baseados no ICP e localizacao.

**Request:**
```json
{
  "icp": "restaurantes com presenca digital fraca",
  "service": "chatbot AI para atendimento",
  "state": "Lisboa",
  "city": "Sintra",
  "page": 1,
  "limit": 20
}
```

**Response:**
```json
{
  "leads": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Rate Limit:** 10 req/min por usuario

### POST /api/prospect/report

Gera relatorio AI para um lead especifico. Retorna cache se disponivel.

**Request:**
```json
{
  "leadId": "external-lead-id",
  "forceRegenerate": false,
  "lead": { "name": "...", "address": "..." },
  "service": "chatbot AI"
}
```

**Response:**
```json
{
  "report": "## Diagnostico Digital\n...",
  "cached": true
}
```

**Rate Limit:** 20 req/min por usuario | **Timeout:** 60s

## Scripts

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run lint` | Verificar ESLint |
| `npm test` | Rodar testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |

## Deploy

Deploy automatico via Vercel. Push para `main` aciona o build.

```bash
vercel --prod
```

## Licenca

Privado. Todos os direitos reservados.
