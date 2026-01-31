"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for trying out ReviewReply.ai",
    features: [
      { text: "5 responses per day", included: true },
      { text: "All 4 tone options", included: true },
      { text: "Copy to clipboard", included: true },
      { text: "Brand voice customization", included: false },
      { text: "Response history", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
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
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$39",
    period: "/month",
    desc: "For teams managing multiple locations",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Team accounts (5 seats)", included: true },
      { text: "API access", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Custom tone creation", included: true },
      { text: "Dedicated support", included: true },
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                <Link href="/auth">
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
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
                a: "Absolutely! You get 3 free tries on the homepage without even signing up, plus 5 free responses per day on the Free plan.",
              },
              {
                q: "What AI model do you use?",
                a: "We use Anthropic's Claude, one of the most advanced AI models for nuanced, professional communication.",
              },
              {
                q: "Can I customize the response style?",
                a: "Yes! On Starter and Pro plans, you can configure your brand voice with your restaurant name, style notes, and preferred phrases.",
              },
              {
                q: "Do you support multiple languages?",
                a: "The AI can generate responses in many languages. Just paste a review in any language and it will respond accordingly.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, cancel anytime. No questions asked. Your account will remain active until the end of your billing period.",
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
