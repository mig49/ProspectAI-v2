import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  free: { name: "Free", priceId: null },
  pro: { name: "Pro", priceId: process.env.STRIPE_PRO_PRICE_ID! },
  scale: { name: "Scale", priceId: process.env.STRIPE_SCALE_PRICE_ID! },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanId {
  if (priceId === PLANS.pro.priceId) return "pro";
  if (priceId === PLANS.scale.priceId) return "scale";
  return "free";
}
