import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, getUsage } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { plan: "free", status: "active", usage: { searches: 0, reports: 0, exports: 0 }, limits: PLAN_LIMITS.free },
      );
    }

    const plan = await getUserPlan(user.id);
    const usage = await getUsage(user.id);

    return NextResponse.json({
      plan,
      status: "active",
      usage: {
        searches: usage.searches_count,
        reports: usage.reports_count,
        exports: usage.exports_count,
      },
      limits: PLAN_LIMITS[plan],
    });
  } catch (err: any) {
    console.error("Subscription status error:", err);
    return NextResponse.json(
      { plan: "free", status: "active", usage: { searches: 0, reports: 0, exports: 0 }, limits: PLAN_LIMITS.free },
    );
  }
}
