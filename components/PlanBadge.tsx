"use client";

import type { PlanId } from "@/lib/stripe";

const BADGE_STYLES: Record<PlanId, string> = {
  free: "bg-slate-100 text-slate-600 border-slate-200",
  pro: "bg-blue-100 text-blue-700 border-blue-200",
  scale: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const BADGE_LABELS: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  scale: "Scale",
};

export function PlanBadge({ plan }: { plan: PlanId }) {
  if (plan === "free") return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${BADGE_STYLES[plan]}`}
    >
      {BADGE_LABELS[plan]}
    </span>
  );
}
