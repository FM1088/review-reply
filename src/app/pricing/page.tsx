"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Loader2, AlertTriangle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for trying out ReviewReply.ai",
    features: [
      { text: "10 responses per month", included: true },
      { text: "All 4 tone options", included: true },
      { text: "Copy to clipboard", included: true },
      { text: "Brand voice customization", included: true },
      { text: "Response history", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/auth",
    highlighted: false,
    checkout: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For restaurant owners who are serious about reputation",
    features: [
      { text: "Unlimited responses", included: true },
      { text: "All 4 tone options", included: true },
      { text: "Copy to clipboard", included: true },
      { text: "Brand voice customization", included: true },
      { text: "Response history", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Upgrade Now",
    ctaLink: null,
    highlighted: true,
    checkout: true,
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const cancelled = searchParams.get("cancelled") === "true";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleCheckout = async (planName: string) => {
    if (!user) {
      // Redirect to auth first
      window.location.href = "/auth?redirect=/pricing";
      return;
    }

    setLoading(planName);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Cancelled Banner */}
        {cancelled && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <p>Checkout was cancelled. No worries, you can try again anytime!</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "glass glow border-primary/50 relative"
                  : "glass"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <CardContent className="p-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">{plan.desc}</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm">
                      {f.included ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/50"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
                {plan.checkout ? (
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                    onClick={() => handleCheckout(plan.name)}
                    disabled={loading === plan.name}
                  >
                    {loading === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
                ) : (
                  <Link href={plan.ctaLink!}>
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I try it before paying?",
                a: "Absolutely! You get 3 free tries on the homepage without even signing up, plus 10 free responses per month on the Free plan.",
              },
              {
                q: "What AI model do you use?",
                a: "We use Anthropic's Claude, one of the most advanced AI models for nuanced, professional communication.",
              },
              {
                q: "Can I customize the response style?",
                a: "Yes! Both Free and Pro plans include brand voice customization. Set your restaurant name and style notes.",
              },
              {
                q: "Do you support multiple languages?",
                a: "The AI can generate responses in many languages. Just paste a review in any language and it will respond accordingly.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, cancel anytime. No questions asked. Your account will remain active until the end of your billing period.",
              },
              {
                q: "What happens when I reach my limit?",
                a: "On the Free plan, you'll see a prompt to upgrade. Your history and settings are preserved. Upgrade anytime to continue.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
