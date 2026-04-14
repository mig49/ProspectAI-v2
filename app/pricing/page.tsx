"use client";

import { Suspense } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { PricingCard } from "@/components/PricingCard";
import { PlanBadge } from "@/components/PlanBadge";
import { Sparkles, ArrowLeft, Shield, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PLANS_DATA = [
  {
    plan: "free" as const,
    name: "Free",
    price: "0",
    description: "Para experimentar o ProspectAI",
    features: [
      { text: "3 buscas por mes", included: true },
      { text: "20 leads por busca", included: true },
      { text: "1 relatorio detalhado por mes", included: true },
      { text: "Export CSV", included: false },
      { text: "WhatsApp direto", included: false },
      { text: "CRM integrado", included: false },
      { text: "Alertas semanais", included: false },
    ],
    cta: "Plano Atual",
  },
  {
    plan: "pro" as const,
    name: "Pro",
    price: "29",
    description: "Para freelancers que prospectam ativamente",
    features: [
      { text: "30 buscas por mes", included: true },
      { text: "50 leads por busca", included: true },
      { text: "Relatorios ilimitados", included: true },
      { text: "Export CSV", included: true },
      { text: "WhatsApp direto", included: true },
      { text: "CRM integrado", included: true },
      { text: "Alertas semanais (1 distrito)", included: true },
    ],
    cta: "Assinar Pro",
    isPopular: true,
  },
  {
    plan: "scale" as const,
    name: "Scale",
    price: "79",
    description: "Para agencias e equipas",
    features: [
      { text: "100 buscas por mes", included: true },
      { text: "50 leads por busca", included: true },
      { text: "Relatorios ilimitados", included: true },
      { text: "Export CSV", included: true },
      { text: "WhatsApp direto", included: true },
      { text: "CRM integrado", included: true },
      { text: "Alertas semanais (5 distritos)", included: true },
    ],
    cta: "Assinar Scale",
  },
];

function PricingContent() {
  const { plan: currentPlan, checkout, openPortal, isLoading } = useSubscription();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const handleAction = (plan: "free" | "pro" | "scale") => {
    if (plan === "free") return;
    if (currentPlan === plan) {
      openPortal();
    } else if (currentPlan !== "free") {
      openPortal();
    } else {
      checkout(plan);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-[var(--shadow-blue-md)]">
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl tracking-tight">ProspectAI</span>
            <PlanBadge plan={currentPlan} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Success/Cancel banners */}
        {success && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-center">
            Assinatura ativada com sucesso! Bem-vindo ao ProspectAI Pro.
          </div>
        )}
        {canceled && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-center">
            Checkout cancelado. Pode assinar quando quiser.
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
            Escolha seu plano
          </h1>
          <p className="mt-3 text-[var(--color-text-muted)] max-w-xl mx-auto">
            Encontre leads qualificados, gere relatorios de oportunidade e feche mais negocios com IA.
          </p>
        </div>

        {/* Early Adopter Banner */}
        <div className="mb-10 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-center">
          <p className="text-sm font-medium text-blue-800">
            <Zap className="w-4 h-4 inline-block mr-1 -mt-0.5" />
            Early Adopter: Primeiros 100 assinantes pagam <strong>19 EUR/mes</strong> para sempre no Pro.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PLANS_DATA.map((planData) => (
            <PricingCard
              key={planData.plan}
              plan={planData.plan}
              name={planData.name}
              price={planData.price === "0" ? "0" : `${planData.price} EUR`}
              period={planData.price === "0" ? "" : "/mes"}
              description={planData.description}
              features={planData.features}
              cta={currentPlan === planData.plan ? "Plano Atual" : currentPlan !== "free" ? "Gerenciar" : planData.cta}
              onAction={() => handleAction(planData.plan)}
              isCurrentPlan={currentPlan === planData.plan}
              isPopular={planData.isPopular}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">
              14 dias gratis. Cancele quando quiser. Sem compromisso.
            </span>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-center text-[var(--color-text)] mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Como funciona a busca de leads?</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                O ProspectAI usa Google Maps e IA (Gemini) para encontrar negocios reais que correspondam ao seu ICP. Cada lead recebe um Digital Pain Score e um relatorio de oportunidade.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Posso cancelar a qualquer momento?</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Sim. Cancele diretamente pelo portal de assinatura. Voce mantem acesso ate o final do periodo pago.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Os leads sao reais?</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Sim. Os dados vem diretamente do Google Maps — negocios reais com endereco, telefone, website e avaliacoes verificadas.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Qual a diferenca entre Pro e Scale?</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                O Pro e ideal para freelancers solo (30 buscas/mes). O Scale e para agencias que precisam de mais volume (100 buscas/mes) e alertas em multiplos distritos.
              </p>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="mt-16 p-6 sm:p-8 bg-slate-50 border border-[var(--color-border)] rounded-2xl text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[var(--color-text)]">ROI Garantido</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)] max-w-lg mx-auto">
            Se fechar apenas 1 cliente de automacao por mes (media 1.500 EUR), o retorno sobre o investimento no ProspectAI Pro e de <strong className="text-blue-600">51x</strong>.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
