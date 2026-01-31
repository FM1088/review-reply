"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { ToneSelector } from "@/components/tone-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import type { Tone } from "@/lib/ai";

interface ReviewGeneratorProps {
  onSave?: (data: { review: string; rating: number; tone: Tone; response: string }) => void;
  restaurantName?: string;
  brandVoice?: string;
  isDemo?: boolean;
  demoUsesLeft?: number;
}

export function ReviewGenerator({ onSave, restaurantName, brandVoice, isDemo, demoUsesLeft }: ReviewGeneratorProps) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [tone, setTone] = useState<Tone>("professional");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!review.trim()) return;
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review, rating, tone, restaurantName, brandVoice, isDemo }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          full += chunk;
          setResponse(full);
        }
      }

      onSave?.({ review, rating, tone, response: full });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">Paste the customer review</label>
        <Textarea
          placeholder="e.g. The food was amazing but the service was a bit slow. We waited 30 minutes for our appetizers..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="min-h-[140px]"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">Star rating of the review</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">Response tone</label>
        <ToneSelector selected={tone} onChange={setTone} />
      </div>

      <Button
        onClick={generate}
        disabled={loading || !review.trim()}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Response
            {isDemo && demoUsesLeft !== undefined && (
              <span className="ml-2 text-xs opacity-70">({demoUsesLeft} free left)</span>
            )}
          </>
        )}
      </Button>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {response && (
        <Card className="glow animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Generated Response</h3>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
            <div ref={responseRef} className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
              {response}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
