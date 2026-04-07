# ProspectAI — Relatorio de Auditoria Tecnica Consolidado

**Data:** 2026-03-05
**Projeto:** ProspectAI
**Local:** `/Users/miguelversiani/code2/ProspectAI`
**Stack:** Next.js 15.5.12 | React 19 | TypeScript 5.9.3 | Tailwind CSS 4 | Gemini AI
**Deploy:** Vercel (https://prospect-ai-flame.vercel.app)

---

## Sumario Executivo

| Fase | Score (1-10) | Principal Achado |
|------|:---:|---|
| **Fase 1: Arquitetura** | 3/10 | API key do Gemini exposta no client-side (P0). Zero testes, zero CI/CD. Logica de negocio acoplada ao componente de UI. |
| **Fase 2: Dados** | 2/10 | Zero persistencia — todos os dados vivem em useState e sao perdidos no refresh. Supabase configurado mas nao utilizado. Sem autenticacao, validacao ou rate limiting. |
| **Fase 3: Frontend/UX** | 4/10 | Contraste WCAG insuficiente. Ausencia de design tokens. God component em page.tsx. Acessibilidade precaria (sem aria-live, sem skip nav, sem prefers-reduced-motion). |

**Score Consolidado: 3/10**

---

## Fase 1: Arquitetura (@architect)

### Stack

| Componente | Versao | Avaliacao |
|---|---|---|
| Next.js | 15.5.12 | Atual, mas pagina principal e client component — anula SSR/SSG |
| React | 19 | Atual. Nenhum recurso do React 19 utilizado (Actions, use, useOptimistic) |
| TypeScript | 5.9.3 | strict: true habilitado |
| Tailwind CSS | 4.1.11 | Atual |
| @google/genai | ^1.17.0 | **CRITICO:** Chamada diretamente do browser |
| Node.js | Nao fixado | Sem .nvmrc ou engines no package.json |

### Estrutura

```
app/
  globals.css         # 2 linhas (import tailwind + plugin)
  layout.tsx          # Root layout, Inter font, lang pt-BR
  page.tsx            # GOD COMPONENT — UI + API + parsing + state (189 linhas)
components/
  SearchForm.tsx      # Formulario de busca (123 linhas)
  ResultsList.tsx     # Lista card/table (254 linhas)
  LeadDetail.tsx      # Detalhe + relatorio AI (259 linhas)
  ui/button.tsx       # Shadcn-style button (CVA + Radix)
  ui/input.tsx        # Input basico
  ui/textarea.tsx     # Textarea basico
hooks/
  use-mobile.ts       # DEAD CODE — nao utilizado
lib/
  constants.ts        # 20 distritos de Portugal
  utils.ts            # cn() = clsx + twMerge
types/
  index.ts            # Lead, SearchParams
```

**Total:** 27 arquivos, ~985 linhas de codigo frontend

### Problemas Criticos

- **API key exposta:** `NEXT_PUBLIC_GEMINI_API_KEY` e enviada ao browser. Qualquer usuario pode extrair e usar.
- **Zero testes:** Sem test runner, sem test files, npm test falha.
- **Zero CI/CD:** Sem GitHub Actions, sem pre-commit hooks.
- **Dual ESLint config:** `.eslintrc.json` E `eslint.config.mjs` coexistem (conflito).
- **ESLint ignorado no build:** `ignoreDuringBuilds: true` no next.config.ts.
- **Dead code:** use-mobile.ts, picsum.photos config, Supabase env vars sem uso.

### Debitos Arquiteturais

| ID | Debito | Sev. | Descricao | Recomendacao |
|---|---|:---:|---|---|
| TD-001 | API key exposta client-side | **P0** | NEXT_PUBLIC_GEMINI_API_KEY no bundle JS do browser. Risco de seguranca e financeiro. | Criar API Route server-side. Remover prefixo NEXT_PUBLIC_. |
| TD-002 | Markdown AI sem sanitizacao | **P0** | react-markdown renderiza output do Gemini sem rehype-sanitize. Risco de XSS. | Adicionar rehype-sanitize ao pipeline do react-markdown. |
| TD-003 | Zero test coverage | **P1** | Nenhum teste. Nenhum test runner instalado. | Instalar Vitest + @testing-library/react. Target 80% coverage. |
| TD-004 | Zero CI/CD | **P1** | Sem GitHub Actions, sem quality gates automatizados. | Criar workflow CI: lint, typecheck, test, build. Branch protection. |
| TD-005 | Logica acoplada ao UI | **P1** | page.tsx contem prompt engineering, API config, parsing e UI. | Extrair para lib/prompts.ts, lib/gemini.ts, hooks/useProspectSearch.ts. |
| TD-006 | Dual ESLint config | **P2** | .eslintrc.json e eslint.config.mjs coexistem. | Deletar .eslintrc.json. Manter flat config. |
| TD-007 | ESLint ignorado no build | **P2** | ignoreDuringBuilds: true permite codigo nao-compliant em producao. | Remover flag. Corrigir lint errors. |
| TD-008 | Sem validacao de input | **P2** | SearchParams vai direto para prompt Gemini sem sanitizacao. Prompt injection possivel. | Adicionar Zod schemas. Validar client + server. |
| TD-009 | Sem error boundaries | **P2** | Erro em qualquer componente crasha app inteira. | Adicionar ErrorBoundary React + next/error. |
| TD-010 | Sem rate limiting | **P2** | Chamadas ilimitadas ao Gemini. Bot pode consumir quota inteira. | Rate limiting na API route: 10/min, 100/hora. |
| TD-011 | Dead code: use-mobile.ts | **P3** | Hook nao utilizado. | Deletar arquivo. |
| TD-012 | Dead config: picsum.photos | **P3** | remotePatterns configurado mas nao usado. | Remover entrada. |
| TD-013 | Dead config: Supabase .env | **P3** | Credenciais presentes sem codigo que as use. | Remover ate ser necessario. |
| TD-014 | Node.js nao fixado | **P3** | Sem .nvmrc ou engines. Drift entre ambientes. | Adicionar engines no package.json + .nvmrc. |
| TD-015 | Sem monitoring | **P2** | Zero observabilidade em producao. | Adicionar Sentry + analytics basico. |
| TD-016 | "use client" na pagina principal | **P2** | Desabilita SSR/SSG. Nega valor do Next.js. | Reestruturar: server component shell + client interactive parts. |

---

## Fase 2: Dados (@data-engineer)

### Estado Atual: Zero Persistencia

- **Banco de dados:** NENHUM implementado
- **Supabase:** Credenciais no .env mas zero codigo de integracao
- **State:** useState apenas. Refresh = dados perdidos.
- **Cache:** Nenhum. Cada busca = nova chamada ao Gemini.
- **Auth:** Inexistente. Qualquer pessoa usa sem limites.
- **localStorage:** Apenas view mode (card/table) — dado cosmetico.

### Modelo de Dados Implicito

| Entidade | Campos Principais | Status |
|---|---|---|
| `leads` | id, name, address, city, state, rating, phone, website, score, summary | Apenas in-memory (useState) |
| `lead_types` | lead_id, type_name (1:N) | Tipado como `any[]` |
| `lead_photos` | lead_id, url, metadata (1:N) | Tipado como `any[]` |
| `lead_reviews` | lead_id, text, rating (1:N) | Tipado como `any[]` |
| `searches` | icp, service, state, city, created_at | **NAO EXISTE** nem como type |
| `search_results` | search_id, lead_id (N:N) | **NAO EXISTE** |

### Fluxo de Dados Atual

```
User Input → SearchForm → page.tsx (useState) → Gemini API (BROWSER) → Parse JSON → useState → Display
                                                                                         ↓
                                                                                    LeadDetail → Gemini API (BROWSER) → Relatorio
```

**Problemas:** Client-side API calls, sem cache, sem persistencia, sem validacao de schema no output do Gemini.

### Debitos de Dados

| ID | Debito | Sev. | Descricao | Recomendacao |
|---|---|:---:|---|---|
| DD-001 | API key Gemini no client | **P0** | Mesma issue que TD-001. Exploracao trivial via DevTools. | Mover para server-side. |
| DD-002 | Zero persistencia | **P0** | Leads e buscas vivem em useState. Refresh perde tudo. | Schema Supabase PostgreSQL normalizado. |
| DD-003 | Sem autenticacao | **P1** | Qualquer pessoa usa. Impossivel multi-tenancy, RLS, audit. | Supabase Auth (email + OAuth). |
| DD-004 | SERVICE_ROLE_KEY no .env | **P1** | Chave admin Supabase ociosa. Risco de uso acidental client-side. | Remover ate ser necessaria. |
| DD-005 | Zero validacao de input | **P1** | Prompt injection via campos de busca. | Zod schemas + sanitizacao server-side. |
| DD-006 | Output Gemini sem schema validation | **P1** | JSON parseado direto para Lead[] sem validacao runtime. | Zod schema para Lead. Validar server-side. |
| DD-007 | Sem cache de buscas | **P1** | Mesma busca N vezes = N chamadas ao Gemini. Custo linear. | Cache por hash de SearchParams com TTL 24h. |
| DD-008 | Types com `any` | **P2** | photos, reviews, openingHours tipados como any[]. Sem contrato. | Definir interfaces tipadas. |
| DD-009 | Sem separacao de camada de dados | **P2** | page.tsx acumula UI + API + parsing. | Criar services/ e lib/db/. |
| DD-010 | Relatorio regenerado a cada clique | **P2** | LeadDetail chama Gemini novamente para cada visualizacao. | Persistir relatorio. Regenerar sob demanda. |
| DD-011 | Sem rate limiting | **P2** | Loop automatizado consome quota inteira. | Rate limiting na API route. |
| DD-012 | Sem audit trail | **P2** | Nenhum registro de uso. Impossivel analisar ou debugar. | Tabela audit_log. Logar toda interacao com Gemini. |
| DD-013 | Sem paginacao | **P3** | Todos os leads em memoria de uma vez. | Paginacao server-side (20/pagina). |
| DD-014 | Sem indexacao planejada | **P3** | Queries lentas quando schema for criado. | Indices: (city, state), primary_type, score DESC, GIN em summary. |
| DD-015 | Sem backup/recovery | **P3** | Nenhum plano para quando persistencia existir. | PITR no Supabase. Definir RPO/RTO. |

---

## Fase 3: Frontend/UX (@ux-design-expert)

### Inventario de Componentes

| Componente | Linhas | Responsabilidade | Problema |
|---|:---:|---|---|
| page.tsx | 189 | Orquestrador + API + state | God component |
| SearchForm.tsx | 123 | Formulario de busca | Sem validacao visual |
| ResultsList.tsx | 254 | Lista card/table | Tabela nao-responsiva |
| LeadDetail.tsx | 259 | Detalhe + relatorio AI | reload como recovery |
| button.tsx | ~60 | Botao CVA | OK |
| input.tsx | ~20 | Input basico | Sem estado de erro |
| textarea.tsx | ~20 | Textarea basico | Sem estado de erro |
| use-mobile.ts | ~15 | Deteccao mobile | Dead code |

### Acessibilidade (WCAG 2.1)

| Area | Status | Problemas |
|---|---|---|
| Contraste | **FALHA** | slate-400 on white (~3.9:1), placeholders (~3.5:1) falham AA |
| Keyboard | **PARCIAL** | Toggle card/table sem aria-pressed. Sem skip nav. |
| Screen Reader | **FALHA** | Sem aria-live para loading/errors. Icons sem aria-hidden. Sem landmarks completos. |
| Motion | **FALHA** | Animacoes sem prefers-reduced-motion. |

### Responsividade

| Viewport | Problemas |
|---|---|
| Mobile (< 768px) | Table view com 6 colunas ilegivel. Touch targets possivelmente pequenos. |
| Tablet (768-1024px) | Funcional |
| Desktop (> 1024px) | Funcional |

### Design System

| Aspecto | Maturidade |
|---|---|
| Design Tokens | **INEXISTENTE** — zero variaveis CSS |
| Componentes primitivos | BASICO — 3 componentes shadcn |
| Componentes compostos | **INEXISTENTE** — sem Card, Badge, Alert, Skeleton |
| Spacing | INCONSISTENTE — mix de p-4/p-6/p-8 sem escala |
| Tipografia | MINIMO — Inter sem type scale formal |

### Debitos Frontend

| ID | Debito | Sev. | Descricao | Recomendacao |
|---|---|:---:|---|---|
| FE-001 | God component page.tsx | **P0** | 189 linhas misturando UI, API, parsing, state. Untestavel. | Extrair para hooks customizados. |
| FE-002 | Ausencia de design tokens | **P0** | globals.css tem 2 linhas. Zero CSS custom properties. | Criar tokens: --color-primary, --radius-*, --space-*. |
| FE-003 | Contraste WCAG insuficiente | **P0** | slate-400 em branco falha AA (3.9:1 < 4.5:1). | Substituir slate-400 por slate-600 (~5.9:1). |
| FE-004 | Sem aria-live em conteudo dinamico | **P1** | Screen readers nao notificados de loading/errors. | aria-live="polite" em resultados, "assertive" em erros. |
| FE-005 | Tabela nao-responsiva mobile | **P1** | 6 colunas comprimem em < 768px. | overflow-x-auto ou forcar card view em mobile. |
| FE-006 | Animacoes sem prefers-reduced-motion | **P1** | Pode causar desconforto. Falha WCAG 2.3.3. | Media query em globals.css ou motion-safe: do Tailwind. |
| FE-007 | Icons sem aria-hidden | **P1** | Ruido em screen readers. | aria-hidden="true" em icons decorativos. |
| FE-008 | Landmarks incompletos | **P1** | Sem `<main>`, `<nav>` explicitos. | Adicionar landmarks semanticos. |
| FE-009 | Sem componentes compostos | **P1** | Sem Card, Badge, Alert reutilizaveis. Codigo duplicado. | Extrair componentes shadcn-style. |
| FE-010 | window.location.reload como recovery | **P2** | Destroi todo o estado da app. | Retry local sem resetar contexto. |
| FE-011 | Dead code use-mobile.ts | **P2** | Nao utilizado. | Deletar. |
| FE-012 | Sem skip navigation | **P2** | Usuarios de teclado forçados a tab por todo header. | Adicionar skip-to-content link. |
| FE-013 | Clipboard sem feedback acessivel | **P2** | Apenas visual, sem aria-live. | Adicionar aria-live="polite" com mensagem. |
| FE-014 | Sem validacao visual no form | **P2** | Inputs nao mostram estado de erro. | Prop error nos componentes UI. |
| FE-015 | Touch targets pequenos | **P2** | Buttons sm podem ser < 44x44px. | min-h-[44px] em mobile. |
| FE-016 | Score por cor apenas | **P2** | Daltonicos nao distinguem niveis. WCAG 1.4.1. | Texto descritivo + icone alem da cor. |
| FE-017 | Spacing inconsistente | **P3** | Mix p-4/p-6/p-8 sem escala. | Definir spacing scale nos tokens. |
| FE-018 | suppressHydrationWarning sem dark mode | **P3** | Setup incompleto. | Implementar dark mode ou remover flag. |

---

## Consolidado: Debitos Priorizados

### P0 — Corrigir Imediatamente

| # | ID | Debito | Fase |
|---|---|---|---|
| 1 | TD-001 / DD-001 | API key Gemini exposta no client-side | Arq + Dados |
| 2 | TD-002 | Markdown AI renderizado sem sanitizacao (XSS) | Arq |
| 3 | DD-002 | Zero persistencia de dados (tudo em useState) | Dados |
| 4 | FE-001 | God component page.tsx (UI + API + state misturados) | Frontend |
| 5 | FE-002 | Ausencia total de design tokens | Frontend |
| 6 | FE-003 | Contraste WCAG AA insuficiente | Frontend |

### P1 — Corrigir Neste Sprint

| # | ID | Debito | Fase |
|---|---|---|---|
| 7 | TD-003 | Zero test coverage | Arq |
| 8 | TD-004 | Zero CI/CD | Arq |
| 9 | TD-005 | Logica de negocio acoplada ao UI | Arq |
| 10 | DD-003 | Sem autenticacao/autorizacao | Dados |
| 11 | DD-004 | SERVICE_ROLE_KEY ociosa no .env | Dados |
| 12 | DD-005 | Zero validacao de input (prompt injection) | Dados |
| 13 | DD-006 | Output Gemini sem schema validation | Dados |
| 14 | DD-007 | Sem cache de buscas (custo linear) | Dados |
| 15 | FE-004 | Sem aria-live em conteudo dinamico | Frontend |
| 16 | FE-005 | Tabela nao-responsiva em mobile | Frontend |
| 17 | FE-006 | Animacoes sem prefers-reduced-motion | Frontend |
| 18 | FE-007 | Icons sem aria-hidden | Frontend |
| 19 | FE-008 | Landmarks semanticos incompletos | Frontend |
| 20 | FE-009 | Sem componentes compostos reutilizaveis | Frontend |

### P2 — Proximo Sprint

| # | ID | Debito | Fase |
|---|---|---|---|
| 21 | TD-006 | Dual ESLint config conflitante | Arq |
| 22 | TD-007 | ESLint ignorado durante builds | Arq |
| 23 | TD-008 | Sem validacao de input (client) | Arq |
| 24 | TD-009 | Sem error boundaries | Arq |
| 25 | TD-010 | Sem rate limiting | Arq |
| 26 | TD-015 | Sem monitoring/observabilidade | Arq |
| 27 | TD-016 | "use client" na pagina principal | Arq |
| 28 | DD-008 | Types com `any` (photos, reviews) | Dados |
| 29 | DD-009 | Sem separacao de camada de dados | Dados |
| 30 | DD-010 | Relatorio regenerado a cada clique | Dados |
| 31 | DD-011 | Sem rate limiting (dados) | Dados |
| 32 | DD-012 | Sem audit trail | Dados |
| 33 | FE-010 | reload como error recovery | Frontend |
| 34 | FE-011 | Dead code use-mobile.ts | Frontend |
| 35 | FE-012 | Sem skip navigation | Frontend |
| 36 | FE-013 | Clipboard sem feedback acessivel | Frontend |
| 37 | FE-014 | Sem validacao visual no form | Frontend |
| 38 | FE-015 | Touch targets pequenos | Frontend |
| 39 | FE-016 | Score por cor apenas (daltonismo) | Frontend |

### P3 — Backlog

| # | ID | Debito | Fase |
|---|---|---|---|
| 40 | TD-011 | Dead code: use-mobile.ts | Arq |
| 41 | TD-012 | Dead config: picsum.photos | Arq |
| 42 | TD-013 | Dead config: Supabase .env vars | Arq |
| 43 | TD-014 | Node.js nao fixado | Arq |
| 44 | DD-013 | Sem paginacao de resultados | Dados |
| 45 | DD-014 | Sem indexacao planejada | Dados |
| 46 | DD-015 | Sem backup/recovery | Dados |
| 47 | FE-017 | Spacing inconsistente | Frontend |
| 48 | FE-018 | suppressHydrationWarning sem dark mode | Frontend |

---

## Roadmap Sugerido

### Sprint 1: Seguranca e Fundacao (P0)

1. **Mover Gemini para server-side** — Criar `app/api/prospect/route.ts` como proxy. Remover NEXT_PUBLIC_ prefix. (TD-001/DD-001)
2. **Adicionar rehype-sanitize** ao react-markdown. (TD-002)
3. **Decompor page.tsx** — Extrair hooks useProspectSearch e useLeadReport. (FE-001/TD-005)
4. **Criar design tokens** em globals.css com CSS custom properties. (FE-002)
5. **Corrigir contrastes** — slate-400 → slate-600 para texto auxiliar. (FE-003)
6. **Setup Supabase** — Schema basico para leads e buscas. (DD-002)

### Sprint 2: Qualidade e Dados (P1)

1. **Instalar Vitest** + @testing-library/react. Testes para utils, UI primitives, search flow. (TD-003)
2. **GitHub Actions CI** — lint, typecheck, test, build. (TD-004)
3. **Supabase Auth** — email + OAuth Google. (DD-003)
4. **Zod schemas** para SearchParams e Lead. Validacao input/output. (DD-005/DD-006)
5. **Cache de buscas** por hash de params com TTL 24h. (DD-007)
6. **Acessibilidade P1** — aria-live, aria-hidden, landmarks, prefers-reduced-motion, tabela responsiva. (FE-004 a FE-009)

### Sprint 3: Robustez e Polish (P2)

1. **Resolver ESLint** — deletar .eslintrc.json, reativar no build. (TD-006/TD-007)
2. **Error boundaries** + error.tsx. (TD-009)
3. **Rate limiting** na API route. (TD-010/DD-011)
4. **Monitoring** — Sentry + analytics. (TD-015)
5. **Componentes compostos** — Card, Badge, Alert, Skeleton. (FE-009)
6. **Audit trail** + persistencia de relatorios. (DD-010/DD-012)
7. **Acessibilidade P2** — skip nav, form validation visual, touch targets, score multimodal. (FE-012 a FE-016)

---

## Metricas do Projeto

| Metrica | Valor |
|---|---|
| Total de arquivos (excl. node_modules/.next/.git) | 27 |
| Linhas de codigo frontend | ~985 |
| Componentes de UI | 8 (3 primitivos + 3 domain + 1 hook + 1 page) |
| Total de debitos identificados | **49** |
| Debitos P0 (criticos) | 6 |
| Debitos P1 (altos) | 14 |
| Debitos P2 (medios) | 19 |
| Debitos P3 (baixos) | 9 |
| Test coverage | 0% |
| CI/CD pipelines | 0 |
| Banco de dados | Nenhum |
| Autenticacao | Nenhuma |

---

*Auditoria realizada por Synkra AIOS — Brownfield Discovery Pipeline*
*Agentes: @architect (Aria), @data-engineer (Dara), @ux-design-expert*
*Consolidacao: @devops (Gage)*
