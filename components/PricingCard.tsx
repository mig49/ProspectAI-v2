"use client";

import { Check, X } from "lucide-react";
import type { PlanId } from "@/lib/stripe";

interface Feature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  plan: PlanId;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: Feature[];
  cta: string;
  onAction: () => void;
  isCurrentPlan: boolean;
  isPopular?: boolean;
  isLoading?: boolean;
}

export function PricingCard({
  name,
  price,
  period = "/mes",
  description,
  features,
  cta,
  onAction,
  isCurrentPlan,
  isPopular,
  isLoading,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-200 ${
        isPopular
          ? "border-blue-500 shadow-[var(--shadow-blue-lg)] scale-[1.02]"
          : "border-[var(--color-border)] shadow-[var(--shadow-sm)]"
      } bg-[var(--color-surface)]`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Mais Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Plano Atual
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">{name}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-[var(--color-text)]">{price}</span>
        {price !== "0" && (
          <span className="text-[var(--color-text-muted)] ml-1">{period}</span>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {feature.included ? (
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
            )}
            <span className={feature.included ? "text-[var(--color-text-secondary)]" : "text-slate-400"}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onAction}
        disabled={isCurrentPlan || isLoading}
        className={`w-full py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-default ${
          isPopular
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[var(--shadow-blue-md)] hover:-translate-y-0.5 disabled:opacity-50"
            : isCurrentPlan
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-slate-100 text-[var(--color-text)] hover:bg-slate-200 disabled:opacity-50"
        }`}
      >
        {isLoading ? "Aguarde..." : isCurrentPlan ? "Plano Atual" : cta}
      </button>
    </div>
  );
}
