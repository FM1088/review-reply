"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewGenerator } from "@/components/review-generator";
import { Navbar } from "@/components/navbar";
import {
  MessageSquareReply, Sparkles, Clock, Shield, Zap, Star,
  ArrowRight, CheckCircle2, ChevronRight
} from "lucide-react";

const DEMO_COOKIE = "rr_demo_uses";
const MAX_DEMO = 3;

function getDemoUses(): number {
  return parseInt(Cookies.get(DEMO_COOKIE) || "0");
}

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [demoUses, setDemoUses] = useState(0);

  useEffect(() => {
    setDemoUses(getDemoUses());
  }, []);

  const handleDemoSave = () => {
    const uses = getDemoUses() + 1;
    Cookies.set(DEMO_COOKIE, String(uses), { expires: 1 });
    setDemoUses(uses);
  };

  const demoUsesLeft = MAX_DEMO - demoUses;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              Trusted by 500+ restaurant owners
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              Perfect Review Responses
              <br />
              <span className="gradient-text">in Seconds</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Stop spending hours crafting responses to customer reviews.
              Let AI generate personalized, on-brand replies that delight customers and protect your reputation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" onClick={() => setShowDemo(true)} className="text-lg px-8 h-14">
                Try It Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 h-14 w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" /> 3 free tries</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" /> Instant results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      {showDemo && (
        <section id="demo" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 animate-slide-up">
          <Card className="glass glow">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Try It Now</h2>
                <span className="text-sm text-muted-foreground">
                  {demoUsesLeft > 0 ? `${demoUsesLeft} free uses remaining` : "Sign up for more!"}
                </span>
              </div>
              {demoUsesLeft > 0 ? (
                <ReviewGenerator isDemo demoUsesLeft={demoUsesLeft} onSave={handleDemoSave} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg mb-4">You&apos;ve used all free tries!</p>
                  <Link href="/auth">
                    <Button size="lg">Sign Up for Free <ChevronRight className="ml-1 h-4 w-4" /></Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Restaurant Owners Love Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every review deserves a thoughtful response. We make it effortless.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Generate professional responses in under 10 seconds. No more staring at a blank screen.",
            },
            {
              icon: MessageSquareReply,
              title: "Multiple Tones",
              desc: "Professional, friendly, empathetic, or apologetic — match your response to the situation.",
            },
            {
              icon: Star,
              title: "Smart Strategy",
              desc: "AI adapts its approach based on star rating. Positive reviews get gratitude, negatives get care.",
            },
            {
              icon: Shield,
              title: "Brand Voice",
              desc: "Configure your restaurant name and brand style. Every response sounds authentically you.",
            },
            {
              icon: Clock,
              title: "Save Hours Weekly",
              desc: "Restaurant owners save 5+ hours per week by automating review responses.",
            },
            {
              icon: Sparkles,
              title: "Powered by Claude AI",
              desc: "Built on Anthropic's Claude — the most nuanced, helpful AI for professional communication.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="glass hover:glow-sm transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Paste the Review", desc: "Copy a customer review from Google, TripAdvisor, Yelp, or anywhere." },
            { step: "02", title: "Choose Your Tone", desc: "Select the star rating and pick a tone that fits the situation." },
            { step: "03", title: "Copy & Reply", desc: "Get your AI-generated response instantly. Copy it and paste it back." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-5xl font-bold gradient-text mb-4">{step}</div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you&apos;re ready.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Free", price: "$0", period: "forever", features: ["5 responses/day", "All tones", "Copy to clipboard"], cta: "Get Started", highlighted: false },
            { name: "Starter", price: "$19", period: "/month", features: ["Unlimited responses", "Brand voice", "Response history", "Priority support"], cta: "Start Free Trial", highlighted: true },
            { name: "Pro", price: "$39", period: "/month", features: ["Everything in Starter", "Team accounts", "API access", "Analytics dashboard", "Custom tones"], cta: "Start Free Trial", highlighted: false },
          ].map(({ name, price, period, features, cta, highlighted }) => (
            <Card key={name} className={highlighted ? "glass glow border-primary/50 scale-105" : "glass"}>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-1">{name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{price}</span>
                  <span className="text-muted-foreground text-sm">{period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth">
                  <Button variant={highlighted ? "default" : "outline"} className="w-full">{cta}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="glass glow rounded-2xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Save Hours Every Week?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join hundreds of restaurant owners who never stress about reviews again.
          </p>
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 h-14">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageSquareReply className="h-5 w-5 text-primary" />
              <span className="font-semibold gradient-text">ReviewReply.ai</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ReviewReply.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
