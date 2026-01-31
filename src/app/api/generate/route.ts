import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt, type Tone } from "@/lib/ai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { review, rating, tone, restaurantName, brandVoice, isDemo } = await req.json();

    if (!review?.trim()) {
      return Response.json({ error: "Review text is required" }, { status: 400 });
    }

    // Demo rate limiting via cookie check (client sends isDemo flag)
    // In production, verify auth and check subscription limits

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
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
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
