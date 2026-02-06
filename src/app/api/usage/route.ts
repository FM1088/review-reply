import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile with subscription status
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, current_period_end")
      .eq("id", user.id)
      .single();

    const subscriptionStatus = profile?.subscription_status || "free";
    const plan = subscriptionStatus === "pro" ? PLANS.pro : PLANS.free;

    // Get monthly usage
    const { data: monthlyUsage } = await supabase
      .rpc("get_monthly_usage", { p_user_id: user.id });

    // Get all-time count
    const { count: totalResponses } = await supabase
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return Response.json({
      plan: subscriptionStatus,
      monthlyUsage: monthlyUsage || 0,
      monthlyLimit: plan.monthlyLimit,
      remaining: subscriptionStatus === "pro" ? Infinity : Math.max(0, plan.monthlyLimit - (monthlyUsage || 0)),
      totalResponses: totalResponses || 0,
      currentPeriodEnd: profile?.current_period_end,
    });
  } catch (err: any) {
    console.error("Usage error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
