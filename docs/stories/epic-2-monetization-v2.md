# EPIC-2: ProspectAI v2.0 — Monetizacao e Features Pro

| Campo | Valor |
|-------|-------|
| **ID** | EPIC-2 |
| **Status** | Ready |
| **Prioridade** | P0 - Estrategica |
| **Owner** | @pm |
| **Origem** | Hormozi Grand Slam Offer Analysis |

---

## Objetivo

Transformar o ProspectAI de MVP gratuito em micro SaaS monetizado com planos Free/Pro/Scale, adicionando features de alto valor (export, CRM, alertas) e redesign completo para ambicao comercial.

---

## Contexto de Negocio

- **ICP:** Freelancer de IA que vende automacao WhatsApp para PMEs em Portugal
- **Ticket medio do ICP:** 1.500 - 3.000 EUR/projeto
- **Promessa:** 50 leads qualificados por busca com relatorio de oportunidade
- **Modelo:** Micro SaaS (Free / Pro 29 EUR / Scale 79 EUR)
- **ROI para o cliente:** 51x no minimo (29 EUR → 1.500 EUR)

---

## Planos

| Feature | Free | Pro (29 EUR) | Scale (79 EUR) |
|---------|------|-------------|----------------|
| Buscas/mes | 3 | 30 | 100 |
| Leads/busca | 20 | 50 | 50 |
| Relatorio detalhado | 1/mes | Ilimitado | Ilimitado |
| Export CSV | -- | Sim | Sim |
| WhatsApp direto | -- | Sim | Sim |
| CRM (status leads) | 5 leads | Ilimitado | Ilimitado |
| Historico buscas | Ultima | 90 dias | Ilimitado |
| Alertas semanais | -- | 1 distrito | 5 distritos |
| Multi-usuario | -- | -- | 3 seats |

---

## Stories

| ID | Story | Sprint | Points | Prioridade |
|----|-------|--------|--------|------------|
| 2.1 | Stripe integration + checkout | Sprint 1 | 5 | P0 |
| 2.2 | Paywall middleware + usage tracking | Sprint 1 | 5 | P0 |
| 2.3 | Pricing page + plan management | Sprint 1 | 3 | P0 |
| 2.4 | Export CSV + WhatsApp link | Sprint 2 | 3 | P1 |
| 2.5 | CRM minimo (status, notas, dashboard) | Sprint 3 | 5 | P1 |
| 2.6 | Alertas semanais (cron + email) | Sprint 4 | 5 | P2 |
| 2.7 | Redesign UI completo | Sprint 5 | 8 | P1 |
| 2.8 | Rewrite copy + landing page | Sprint 6 | 3 | P1 |

---

## Metricas de Sucesso

- 100 usuarios free no primeiro mes
- 10 assinantes Pro no primeiro mes
- MRR de 290 EUR no mes 1
- Churn < 10% mensal
- NPS > 40

---

## Dependencias

- Conta Stripe configurada
- Supabase Pro (para Edge Functions nos alertas)
- Dominio e DNS para emails transacionais

---

## Riscos

| Risco | Mitigacao |
|-------|----------|
| Custo Gemini API escala com uso | Rate limit por plano, cache de resultados |
| Stripe webhook reliability | Fallback check no middleware |
| Free users abusando | Limites rígidos + IP rate limit |
