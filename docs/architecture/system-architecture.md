# ProspectAI — System Architecture (Brownfield Discovery)

**Data:** 2026-03-06
**Agente:** @architect (Aria)
**Tipo:** Brownfield Discovery — Fase 1 (Coleta: Sistema)

---

## 1. Visao Geral

ProspectAI e uma ferramenta SaaS B2B de prospeccao inteligente de leads para profissionais de IA atuando em Portugal. Usa Google Gemini 2.5 Flash + Google Maps para identificar, qualificar e gerar relatorios estrategicos sobre leads.

**Classificacao:** Monolito Full-Stack (Next.js App Router)
**Maturidade:** MVP funcional (v0.1.0) — em producao via Vercel

---

## 2. Tech Stack Completa

### Frontend
| Tecnologia | Versao | Papel |
|-----------|--------|-------|
| React | 19.2.1 | UI framework |
| Next.js | 15.4.9 | Full-stack framework (App Router) |
| Tailwind CSS | 4.1.11 | Utility-first CSS |
| tw-animate-css | 1.4.0 | Animacoes CSS utilitarias |
| Motion (Framer) | 12.23.24 | Animacoes declarativas React |
| Lucide React | 0.553.0 | Icones SVG |
| CVA | 0.7.1 | Variantes de componentes |
| Radix UI (Slot) | 1.2.4 | Primitivo de composicao |
| react-markdown | 10.1.0 | Renderizacao Markdown |
| rehype-sanitize | 6.0.0 | Sanitizacao HTML |

### Backend / API
| Tecnologia | Versao | Papel |
|-----------|--------|-------|
| Next.js API Routes | 15.4.9 | Server-side endpoints |
| @google/genai | 1.17.0 | Google Gemini SDK |
| Zod | 4.3.6 | Validacao de schemas |

### Autenticacao & Dados
| Tecnologia | Versao | Papel |
|-----------|--------|-------|
| Supabase JS | 2.98.0 | Cliente PostgreSQL + Auth |
| Supabase SSR | 0.9.0 | Server-side auth via cookies |

### Build & Tooling
| Tecnologia | Versao | Papel |
|-----------|--------|-------|
| TypeScript | 5.9.3 | Type safety |
| ESLint | 9.39.1 | Linting |
| PostCSS | 8.5.6 | CSS processing |
| Autoprefixer | 10.4.21 | Vendor prefixes |
| Vercel CLI | 50.28.0 | Deploy |

### Nao Utilizados (instalados)
| Tecnologia | Versao | Observacao |
|-----------|--------|------------|
| firebase-tools | 15.0.0 | DevDep — sem uso no codigo. Remanescente de setup anterior |
| @hookform/resolvers | 5.2.1 | Dep — sem uso no codigo. react-hook-form nao instalado |

---

## 3. Arquitetura de Pastas

```
ProspectAI/                         # Raiz do projeto
├── app/                            # Next.js App Router
│   ├── api/
│   │   └── prospect/
│   │       ├── route.ts            # POST /api/prospect (busca leads)
│   │       └── report/
│   │           └── route.ts        # POST /api/prospect/report (gera relatorio)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts            # GET /auth/callback (OAuth)
│   ├── login/
│   │   └── page.tsx                # Pagina de login (dark glassmorphism)
│   ├── globals.css                 # Design tokens + utilities
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home — step machine (search/results/detail)
├── components/
│   ├── SearchForm.tsx              # Formulario de busca
│   ├── ResultsList.tsx             # Lista de leads (card/table)
│   ├── LeadDetail.tsx              # Detalhe + relatorio AI
│   └── ui/
│       ├── button.tsx              # Button com CVA variants
│       ├── input.tsx               # Input glassmorphism
│       └── textarea.tsx            # Textarea glassmorphism
├── hooks/
│   ├── use-prospect-search.ts      # Hook de busca
│   └── use-lead-report.ts          # Hook de relatorio
├── lib/
│   ├── constants.ts                # Distritos de Portugal
│   ├── utils.ts                    # cn() (clsx + tailwind-merge)
│   ├── validation.ts               # Zod schemas
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # Server client
│       ├── middleware.ts            # Session management
│       ├── schema.sql              # DDL do banco
│       └── migrations/             # (vazio)
├── types/
│   └── index.ts                    # Lead, SearchParams
├── middleware.ts                    # Next.js middleware (auth guard)
├── next.config.ts                  # Config: standalone, motion transpile
├── tsconfig.json                   # Strict mode, @/* alias
├── postcss.config.mjs              # Tailwind v4 + autoprefixer
├── eslint.config.mjs               # ESLint flat config
└── package.json                    # 18 deps + 12 devDeps
```

**Metricas:**
- 27 arquivos TypeScript/TSX
- ~2.200 linhas de codigo (excl. package-lock)
- 3 API routes
- 3 paginas
- 6 componentes
- 2 custom hooks
- 30 dependencias diretas

---

## 4. Fluxo de Dados

```
[Usuario]
    │
    ▼
[SearchForm] ─── POST /api/prospect ───► [Gemini 2.5 Flash + Google Maps]
    │                                              │
    │                                              ▼
    │                                    [JSON: 50 leads qualificados]
    │                                              │
    ▼                                              ▼
[ResultsList] ◄─────────── sorted by digitalPainScore
    │
    │  (select lead)
    ▼
[LeadDetail] ─── POST /api/prospect/report ───► [Gemini 2.5 Flash]
    │                                                    │
    ▼                                                    ▼
[Markdown Report] ◄──────────── [Relatorio Estrategico MD]

                    ┌─────────────────────┐
                    │   Supabase (async)   │
                    │  searches + leads    │
                    │  RLS por user_id     │
                    └─────────────────────┘
```

---

## 5. Autenticacao

```
Browser ──► middleware.ts ──► lib/supabase/middleware.ts
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                    authenticated?      /login ou /auth?
                         │                   │
                    continua              permite
                         │
                    redireciona
                    para /login
```

**Metodos:** Email/Password + Google OAuth (Supabase Auth)
**Sessao:** HTTP-only cookies via @supabase/ssr
**Protecao:** Middleware-level (todas as rotas exceto /login e /auth)

---

## 6. Database Schema

### Tabelas

**searches** — Historico de buscas
| Coluna | Tipo | Constraint |
|--------|------|-----------|
| id | UUID | PK, auto |
| user_id | UUID | FK auth.users |
| icp | TEXT | NOT NULL |
| service | TEXT | NOT NULL |
| district | TEXT | NOT NULL |
| city | TEXT | DEFAULT '' |
| results_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**leads** — Leads encontrados
| Coluna | Tipo | Constraint |
|--------|------|-----------|
| id | UUID | PK, auto |
| search_id | UUID | FK searches(id) CASCADE |
| user_id | UUID | FK auth.users |
| external_id | TEXT | — |
| name | TEXT | NOT NULL |
| address | TEXT | DEFAULT '' |
| city | TEXT | DEFAULT '' |
| district | TEXT | DEFAULT '' |
| rating | NUMERIC(2,1) | — |
| user_rating_count | INTEGER | DEFAULT 0 |
| primary_type | TEXT | DEFAULT '' |
| phone | TEXT | — |
| website | TEXT | — |
| google_maps_uri | TEXT | — |
| digital_pain_score | INTEGER | DEFAULT 0 |
| ai_summary | TEXT | DEFAULT '' |
| detailed_report | TEXT | — |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### Indices
- `idx_leads_search_id` — Lookup por busca
- `idx_leads_district_city` — Filtro geografico
- `idx_leads_score` — Ranking por score (DESC)
- `idx_searches_created` — Timeline
- `idx_searches_user_id` — Isolamento por usuario
- `idx_leads_user_id` — Isolamento por usuario

### RLS Policies
- searches: SELECT/INSERT/DELETE com `auth.uid() = user_id`
- leads: SELECT/INSERT/DELETE com `auth.uid() = user_id`
- **Nota:** Falta policy UPDATE em ambas tabelas

---

## 7. Deploy & Infraestrutura

- **Plataforma:** Vercel
- **Output:** standalone (otimizado para serverless)
- **CI/CD:** Push-to-deploy via Vercel CLI (sem Git integration automatica)
- **Env Vars:** GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- **Dominio:** prospect-ai-v2.vercel.app

---

## 8. Padroes Identificados

### Positivos
1. **Validacao E2E com Zod** — Input e output validados
2. **Supabase SSR correto** — Cookie-based auth, middleware refresh
3. **Separacao de concerns** — hooks/components/api/types bem separados
4. **RLS ativado** — Isolamento de dados por usuario
5. **Indices adequados** — Cobertura para queries comuns
6. **Design tokens CSS** — Custom properties centralizados
7. **TypeScript strict** — Habilitado no tsconfig
8. **Glassmorphism consistente** — Design system via utilities CSS

### Problematicos
1. **Zero testes** — Nenhum test file no projeto
2. **ESLint ignorado no build** — `ignoreDuringBuilds: true`
3. **Sem rate limiting** — APIs abertas a abuso
4. **Sem timeout em Gemini** — Pode travar indefinidamente
5. **Sem cache** — Reports regenerados a cada visualizacao
6. **firebase-tools instalado sem uso** — Dead dependency
7. **@hookform/resolvers sem react-hook-form** — Dead dependency
8. **Migrations vazias** — Schema nao versionado
9. **2 configs ESLint** — `.eslintrc.json` + `eslint.config.mjs` (conflito)
10. **Sem paginacao** — Retorna ate 50 leads de uma vez
11. **Open redirect em /auth/callback** — Param `next` nao validado
12. **Report endpoint sem auth check** — Nao verifica ownership do lead

---

— Aria, arquitetando o futuro
