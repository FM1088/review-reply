import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const currentPeriodStart = (subscription as any).current_period_start;
          const currentPeriodEnd = (subscription as any).current_period_end;
          
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "pro",
              stripe_subscription_id: subscriptionId,
              current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
              current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const currentPeriodStart = (subscription as any).current_period_start;
        const currentPeriodEnd = (subscription as any).current_period_end;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          const status = subscription.status === "active" ? "pro" : "cancelled";
          
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: status,
              current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
              current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "free",
              stripe_subscription_id: null,
              current_period_start: null,
              current_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
