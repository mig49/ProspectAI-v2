# ProspectAI — Technical Debt Assessment & Brownfield Report

**Projeto:** ProspectAI v0.1.0
**Data:** 2026-03-06
**Workflow:** Brownfield Discovery (Fases 1-9 consolidadas)
**Agente:** @architect (Aria)

---

## Executive Summary

ProspectAI e um MVP funcional em producao com arquitetura solida (Next.js 15 + Supabase + Gemini AI). O core de negocios — busca e qualificacao de leads via AI — funciona bem. Porem, ha **16 debitos tecnicos** identificados, sendo **3 criticos** (seguranca), **5 altos** (qualidade/custo) e **8 medios** (manutencao/DX).

| Metrica | Valor |
|---------|-------|
| Total de Debitos | 16 |
| Criticos | 3 |
| Altos | 5 |
| Medios | 8 |
| Esforco Total Estimado | 52-72 horas |

**Recomendacao:** Resolver os 3 criticos imediatamente (8h), depois os 5 altos no proximo sprint (20h).

---

## Inventario Completo de Debitos

### Criticos (Seguranca — Resolver Imediatamente)

| ID | Debito | Area | Impacto | Esforco | Prioridade |
|----|--------|------|---------|---------|------------|
| SEC-1 | **Open redirect em /auth/callback** — param `next` aceita qualquer URL, incluindo URLs externas maliciosas | Auth | Phishing, redirect para sites maliciosos | 1h | P0 |
| SEC-2 | **Report endpoint sem verificacao de ownership** — POST /api/prospect/report nao verifica se o lead pertence ao usuario autenticado | API | Acesso a dados de outros usuarios | 2h | P0 |
| SEC-3 | **Sem rate limiting nas APIs** — endpoints /api/prospect e /api/prospect/report sem throttling, abertos a abuso e explosao de custos Gemini | API | DoS, custo descontrolado, abuso | 4h | P0 |

### Altos (Qualidade/Custo — Proximo Sprint)

| ID | Debito | Area | Impacto | Esforco | Prioridade |
|----|--------|------|---------|---------|------------|
| QA-1 | **Zero testes automatizados** — nenhum arquivo de teste no projeto. Sem unit, integration ou e2e tests | QA | Regressoes silenciosas, medo de refatorar | 16h | P1 |
| PERF-1 | **Sem cache de reports** — relatorio AI regenerado a cada visualizacao do lead. Custo Gemini multiplicado | API | Custo API desnecessario, latencia 15-30s repetida | 3h | P1 |
| PERF-2 | **Sem timeout em chamadas Gemini** — API pode travar indefinidamente se Gemini nao responder | API | Requests pendurados, UX travada | 1h | P1 |
| DB-1 | **Falta policy UPDATE no RLS** — tabelas searches e leads tem SELECT/INSERT/DELETE mas nao UPDATE | DB | Impossivel atualizar leads/buscas sem bypass RLS | 1h | P1 |
| DX-1 | **ESLint ignorado no build** — `eslint.ignoreDuringBuilds: true` em next.config.ts | Build | Erros de lint passam despercebidos em producao | 1h | P1 |

### Medios (Manutencao/DX — Backlog)

| ID | Debito | Area | Impacto | Esforco | Prioridade |
|----|--------|------|---------|---------|------------|
| DEPS-1 | **firebase-tools instalado sem uso** — devDependency sem nenhuma referencia no codigo | Build | +15MB no node_modules, confusao | 0.5h | P2 |
| DEPS-2 | **@hookform/resolvers sem react-hook-form** — dependency instalada mas react-hook-form nao existe | Build | Dependency morta, confusao | 0.5h | P2 |
| CONFIG-1 | **2 configs ESLint conflitantes** — `.eslintrc.json` e `eslint.config.mjs` coexistem | Config | Comportamento inconsistente do linter | 0.5h | P2 |
| DB-2 | **Migrations nao versionadas** — `lib/supabase/migrations/` vazio, schema so em schema.sql | DB | Sem controle de versao do banco, reproducao manual | 4h | P2 |
| API-1 | **Sem paginacao nos resultados** — retorna ate 50 leads em um unico payload | API | Payload grande, sem lazy loading | 3h | P2 |
| TYPE-1 | **Tipagem fraca em campos opcionais** — `any[]` usado para photos, reviews, regularOpeningHours | Types | Falta de type safety, bugs silenciosos | 2h | P2 |
| UX-1 | **Sem feedback de progresso** — chamadas Gemini (15-30s) mostram apenas spinner generico | UX | Usuario nao sabe se esta funcionando ou travou | 3h | P2 |
| DOC-1 | **README minimalista** — sem instrucoes de setup completo, sem docs de API, sem arquitetura | Docs | Dificil onboarding, falta de contexto | 3h | P2 |

---

## Analise por Area

### Sistema / Arquitetura

**Pontos Fortes:**
- Monolito bem estruturado com separacao clara (components/hooks/lib/types)
- Next.js App Router com RSC e API Routes
- TypeScript strict habilitado
- Design tokens centralizados em CSS custom properties
- Standalone output para deploy otimizado

**Debitos:**
- ESLint ignorado no build (DX-1)
- 2 configs ESLint conflitantes (CONFIG-1)
- README minimalista (DOC-1)

### Database (Supabase)

**Pontos Fortes:**
- RLS ativado em ambas tabelas
- Indices bem planejados (6 indices cobrindo queries comuns)
- FK com CASCADE DELETE
- user_id em ambas tabelas para isolamento

**Debitos:**
- Falta UPDATE policy no RLS (DB-1)
- Migrations nao versionadas (DB-2)
- Sem constraint UNIQUE em external_id (leads podem duplicar)

### Frontend / UX

**Pontos Fortes:**
- Design system glassmorphism consistente
- Motion animations com AnimatePresence
- Acessibilidade basica (aria-labels, role, prefers-reduced-motion)
- Dual view mode (card/table) com persistencia localStorage

**Debitos:**
- Sem feedback de progresso granular (UX-1)
- Sem paginacao visual (API-1)
- Tipagem fraca nos tipos de dados (TYPE-1)

### Seguranca

**Pontos Fortes:**
- Input validation com Zod em todos endpoints
- Supabase anon key no client (nao service key)
- Session via HTTP-only cookies
- Middleware-level auth guard

**Debitos:**
- Open redirect (SEC-1)
- Sem ownership check no report (SEC-2)
- Sem rate limiting (SEC-3)

### API / Performance

**Pontos Fortes:**
- Persistencia async no Supabase (nao bloqueia response)
- Validacao rigorosa de input com Zod
- Soft-parsing do output do Gemini (tolerante a erros)

**Debitos:**
- Sem cache de reports (PERF-1)
- Sem timeout em Gemini (PERF-2)
- Sem paginacao (API-1)

---

## Plano de Resolucao Recomendado

### Fase 1: Quick Wins de Seguranca (1-2 dias, ~8h)

| ID | Acao | Horas |
|----|------|-------|
| SEC-1 | Validar param `next` contra whitelist de paths | 1h |
| SEC-2 | Adicionar verificacao de user_id no report endpoint | 2h |
| SEC-3 | Implementar rate limiting (next-rate-limit ou upstash) | 4h |
| DB-1 | Adicionar UPDATE policy no RLS | 1h |

**ROI:** Elimina 3 vulnerabilidades criticas + 1 alto.

### Fase 2: Qualidade & Performance (1 semana, ~24h)

| ID | Acao | Horas |
|----|------|-------|
| QA-1 | Setup Vitest + testes para API routes + hooks | 16h |
| PERF-1 | Cache de reports na coluna `detailed_report` do Supabase | 3h |
| PERF-2 | AbortController com timeout de 60s nas chamadas Gemini | 1h |
| DX-1 | Remover `ignoreDuringBuilds`, corrigir erros de lint | 1h |
| CONFIG-1 | Remover `.eslintrc.json`, manter so `eslint.config.mjs` | 0.5h |
| DEPS-1 | `npm uninstall firebase-tools` | 0.5h |
| DEPS-2 | `npm uninstall @hookform/resolvers` | 0.5h |

**ROI:** Cobertura de testes, -50% custo Gemini, DX melhorada.

### Fase 3: Evolucao (2 semanas, ~16h)

| ID | Acao | Horas |
|----|------|-------|
| DB-2 | Migrar schema.sql para Supabase migrations versionadas | 4h |
| API-1 | Implementar paginacao cursor-based nos resultados | 3h |
| TYPE-1 | Substituir `any[]` por tipos concretos | 2h |
| UX-1 | Streaming de resposta Gemini ou progress steps | 3h |
| DOC-1 | README completo + docs de API | 3h |

**ROI:** Projeto pronto para escalar, onboarding facil.

---

## Metricas do Projeto

| Metrica | Valor |
|---------|-------|
| Linhas de codigo | ~2.200 |
| Arquivos TS/TSX | 27 |
| API Routes | 3 |
| Paginas | 3 |
| Componentes | 6 |
| Custom Hooks | 2 |
| Dependencias (prod) | 18 |
| Dependencias (dev) | 12 |
| Dependencias mortas | 2 |
| Testes | 0 |
| Cobertura de testes | 0% |
| Tabelas no banco | 2 |
| Indices | 6 |
| RLS Policies | 6 (falta UPDATE) |
| Vulnerabilidades criticas | 3 |

---

## Decisoes Arquiteturais Atuais (ADRs Implicitos)

1. **Monolito Next.js** — Correto para MVP. Nao migrar para microservicos ate ter product-market fit.
2. **Gemini como unico provider AI** — Lock-in aceitavel pelo custo zero do Flash. Considerar abstraction layer se migrar.
3. **Supabase como BaaS** — Correto. Auth + DB + RLS em um unico servico. Escala ate ~100k usuarios sem mudanca.
4. **Vercel para deploy** — Edge functions + CDN. Adequado para Next.js. Custo controlavel com rate limiting.
5. **Tailwind v4** — Versao bleeding-edge. Funciona mas pode ter breaking changes. Monitorar.

---

## Proximos Passos

1. **Imediato:** Resolver SEC-1, SEC-2, SEC-3, DB-1 (Fase 1)
2. **Sprint seguinte:** Setup de testes + cache + limpeza (Fase 2)
3. **Backlog:** Migrations + paginacao + docs (Fase 3)
4. **Futuro:** Considerar dashboard de analytics, export de leads, integracao CRM

---

— Aria, arquitetando o futuro
