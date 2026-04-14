"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  plan: string;
  used: number;
  limit: number;
  onDismiss?: () => void;
}

export function UpgradePrompt({ feature, plan, used, limit, onDismiss }: UpgradePromptProps) {
  const featureNames: Record<string, string> = {
    searches: "buscas",
    reports: "relatorios",
    exports: "exportacoes",
  };
  const name = featureNames[feature] || feature;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-lg shrink-0">
          <Zap className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900">
            Limite de {name} atingido
          </h4>
          <p className="mt-1 text-sm text-amber-700">
            Voce usou {used}/{limit} {name} do plano {plan}. Faca upgrade para continuar.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-[var(--shadow-blue-md)] transition-all duration-200"
            >
              <Zap className="w-3.5 h-3.5" />
              Ver Planos
            </Link>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-amber-600 hover:text-amber-800 cursor-pointer"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
