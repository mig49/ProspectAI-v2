import type { PlanId } from "@/lib/stripe";

export const PLAN_LIMITS: Record<PlanId, { searches: number; reports: number; exports: number; leads_per_search: number }> = {
  free:  { searches: 3,   reports: 1,     exports: 0,   leads_per_search: 20 },
  pro:   { searches: 30,  reports: 9999,  exports: 30,  leads_per_search: 50 },
  scale: { searches: 100, reports: 9999,  exports: 100, leads_per_search: 50 },
} as const;

export const PORTUGAL_DISTRICTS = [
  { value: "Aveiro", label: "Aveiro" },
  { value: "Beja", label: "Beja" },
  { value: "Braga", label: "Braga" },
  { value: "Bragança", label: "Bragança" },
  { value: "Castelo Branco", label: "Castelo Branco" },
  { value: "Coimbra", label: "Coimbra" },
  { value: "Évora", label: "Évora" },
  { value: "Faro", label: "Faro" },
  { value: "Guarda", label: "Guarda" },
  { value: "Leiria", label: "Leiria" },
  { value: "Lisboa", label: "Lisboa" },
  { value: "Portalegre", label: "Portalegre" },
  { value: "Porto", label: "Porto" },
  { value: "Santarém", label: "Santarém" },
  { value: "Setúbal", label: "Setúbal" },
  { value: "Viana do Castelo", label: "Viana do Castelo" },
  { value: "Vila Real", label: "Vila Real" },
  { value: "Viseu", label: "Viseu" },
  { value: "Açores", label: "Região Autónoma dos Açores" },
  { value: "Madeira", label: "Região Autónoma da Madeira" },
];
