import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt, type Tone } from "@/lib/ai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { review, rating, tone, restaurantName, brandVoice, isDemo } = await req.json();

    if (!review?.trim()) {
      return Response.json({ error: "Review text is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check usage limits for authenticated users
    if (user && !isDemo) {
      // Get user profile for subscription status
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

      const subscriptionStatus = profile?.subscription_status || "free";
      const plan = subscriptionStatus === "pro" ? PLANS.pro : PLANS.free;

      // Check monthly usage for free users
      if (subscriptionStatus !== "pro") {
        const { data: usageResult } = await supabase
          .rpc("get_monthly_usage", { p_user_id: user.id });
        
        const monthlyUsage = usageResult || 0;

        if (monthlyUsage >= plan.monthlyLimit) {
          return Response.json({
            error: `You've reached your monthly limit of ${plan.monthlyLimit} responses. Upgrade to Pro for unlimited access!`,
            limitReached: true,
          }, { status: 429 });
        }
      }
    }

    const prompt = buildPrompt({
      review,
      rating: rating || 3,
      tone: (tone as Tone) || "professional",
      restaurantName,
      brandVoice,
    });

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }
        
        // Save to database after streaming completes (for authenticated users)
        if (user && !isDemo) {
          await supabase.from("responses").insert({
            user_id: user.id,
            review,
            rating: rating || 3,
            tone: tone || "professional",
            response: fullResponse,
          });
        }
        
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    console.error("Generate error:", err);
    return Response.json(
      { error: err.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
