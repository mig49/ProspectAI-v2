# Epic 1: Resolucao de Debitos Tecnicos — ProspectAI

| Campo | Valor |
|-------|-------|
| **ID** | EPIC-1 |
| **Status** | Done |
| **Owner** | @architect (Aria) |
| **Criado** | 2026-03-06 |
| **Origem** | Brownfield Discovery |
| **Prioridade** | Alta |

---

## Objetivo

Resolver os 16 debitos tecnicos identificados no Brownfield Discovery, priorizando seguranca (3 criticos), qualidade (5 altos) e manutencao (8 medios). Transformar o MVP funcional em produto production-ready.

## Business Value

- Eliminar 3 vulnerabilidades criticas de seguranca
- Estabelecer cobertura de testes (de 0% para 60%+)
- Reduzir custos de API Gemini em ~50% via cache
- Melhorar DX para velocidade de desenvolvimento futuro
- Habilitar escala segura do produto

## Stakeholders

- **Tech Lead / Solo Dev:** Miguel Versiani
- **Usuarios:** Profissionais de IA em Portugal (B2B)

---

## Scope

### In Scope
- Correcao de vulnerabilidades de seguranca (SEC-1, SEC-2, SEC-3)
- Setup de testes automatizados (QA-1)
- Cache de reports + timeout Gemini (PERF-1, PERF-2)
- Fix RLS policies (DB-1)
- Cleanup de dependencias e configs (DEPS-1, DEPS-2, CONFIG-1, DX-1)
- Migrations versionadas (DB-2)
- Paginacao de resultados (API-1)
- Melhoria de tipos (TYPE-1)
- UX de progresso (UX-1)
- Documentacao (DOC-1)

### Out of Scope
- Novas features de negocio
- Redesign de UI (ja feito no UI Overhaul)
- Migracao de provider AI
- Dashboard de analytics
- Integracao CRM

---

## Stories

| ID | Titulo | Fase | Points | Prioridade | Status | Debitos |
|----|--------|------|--------|------------|--------|---------|
| 1.1 | Fix vulnerabilidades criticas de auth e API | 1 | 3 | P0 | Ready | SEC-1, SEC-2 |
| 1.2 | Implementar rate limiting nas APIs | 1 | 5 | P0 | Ready | SEC-3 |
| 1.3 | Cleanup: deps mortas, configs, ESLint, RLS | 1 | 2 | P1 | Ready | DB-1, DX-1, CONFIG-1, DEPS-1, DEPS-2 |
| 1.4 | Setup testing framework + testes core | 2 | 13 | P1 | Done | QA-1 |
| 1.5 | Cache de reports + timeout Gemini | 2 | 3 | P1 | Done | PERF-1, PERF-2 |
| 1.6 | DB migrations + paginacao + tipos | 3 | 8 | P2 | Done | DB-2, API-1, TYPE-1 |
| 1.7 | UX progress feedback + documentacao | 3 | 5 | P2 | Done | UX-1, DOC-1 |

**Total:** 39 story points | ~52-72 horas estimadas

---

## Sprint Planning

### Sprint 1 — Seguranca (Fase 1)
- Story 1.1 (3 pts) + Story 1.2 (5 pts) + Story 1.3 (2 pts) = **10 pts**
- Duracao estimada: 1-2 dias
- Objetivo: Zero vulnerabilidades criticas

### Sprint 2 — Qualidade (Fase 2)
- Story 1.4 (13 pts) + Story 1.5 (3 pts) = **16 pts**
- Duracao estimada: 1 semana
- Objetivo: Cobertura de testes + performance

### Sprint 3 — Evolucao (Fase 3)
- Story 1.6 (8 pts) + Story 1.7 (5 pts) = **13 pts**
- Duracao estimada: 1-2 semanas
- Objetivo: Projeto scalavel e documentado

---

## Success Criteria

- [x] Zero vulnerabilidades criticas (SEC-1, SEC-2, SEC-3 resolvidos)
- [x] Cobertura de testes >= 60% nas API routes e hooks
- [x] Rate limiting ativo (max 10 buscas/min por usuario)
- [x] Reports cacheados no Supabase (custo Gemini reduzido)
- [x] Timeout de 60s em todas chamadas Gemini
- [x] RLS completo (SELECT/INSERT/UPDATE/DELETE)
- [x] Zero dependencias mortas
- [x] ESLint ativo no build
- [x] `npm run build` passa sem erros ou warnings

## Risks

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Rate limiting pode afetar UX de power users | Medio | Limites generosos (10/min) + feedback claro |
| Testes podem revelar bugs nao mapeados | Baixo | Tratar como bonus — mais bugs encontrados = melhor |
| Cache de reports pode servir dados stale | Baixo | TTL de 24h + botao "regenerar" |
| Migracao de schema pode afetar dados existentes | Alto | Backup antes + migration reversivel |

---

## Documentacao Relacionada

- [System Architecture](../architecture/system-architecture.md)
- [Technical Debt Report](../reports/TECHNICAL-DEBT-REPORT.md)

---

**Change Log:**

| Data | Versao | Descricao | Autor |
|------|--------|-----------|-------|
| 2026-03-06 | 1.0 | Epic criado a partir do Brownfield Discovery | @architect |
