import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanId } from "@/lib/stripe";

export type UsageFeature = "searches" | "reports" | "exports";

const FEATURE_COLUMN_MAP: Record<UsageFeature, string> = {
  searches: "searches_count",
  reports: "reports_count",
  exports: "exports_count",
};

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .single();

  if (!data || data.status !== "active") return "free";
  return (data.plan as PlanId) || "free";
}

export async function getUsage(userId: string): Promise<{ searches_count: number; reports_count: number; exports_count: number }> {
  const supabase = await createClient();
  const month = getCurrentMonth();

  const { data } = await supabase
    .from("usage")
    .select("searches_count, reports_count, exports_count")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  return data || { searches_count: 0, reports_count: 0, exports_count: 0 };
}

export async function checkUsageLimit(userId: string, feature: UsageFeature): Promise<{ allowed: boolean; used: number; limit: number; plan: PlanId }> {
  const plan = await getUserPlan(userId);
  const usage = await getUsage(userId);
  const limit = PLAN_LIMITS[plan][feature];
  const column = FEATURE_COLUMN_MAP[feature] as keyof typeof usage;
  const used = usage[column] as number;

  return { allowed: used < limit, used, limit, plan };
}

export async function incrementUsage(userId: string, feature: UsageFeature): Promise<void> {
  const supabase = await createClient();
  const month = getCurrentMonth();
  const column = FEATURE_COLUMN_MAP[feature];

  // Upsert: create row if not exists, then increment
  const { data: existing } = await supabase
    .from("usage")
    .select("id, " + column)
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (existing) {
    const currentCount = (existing as any)[column] as number || 0;
    await supabase
      .from("usage")
      .update({ [column]: currentCount + 1 })
      .eq("id", (existing as any).id);
  } else {
    await supabase
      .from("usage")
      .insert({ user_id: userId, month, [column]: 1 });
  }
}

export function paywallResponse(feature: string, plan: PlanId, used: number, limit: number) {
  const featureNames: Record<string, string> = {
    searches: "buscas",
    reports: "relatorios",
    exports: "exportacoes",
  };
  const name = featureNames[feature] || feature;
  const planNames: Record<string, string> = { free: "Free", pro: "Pro", scale: "Scale" };

  return {
    error: `Limite de ${name} excedido para o plano ${planNames[plan]}.`,
    plan,
    used,
    limit,
    upgradeUrl: "/pricing",
  };
}
