"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ReviewGenerator } from "@/components/review-generator";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Copy, Check, Trash2, Clock, Zap, Crown } from "lucide-react";
import type { Tone } from "@/lib/ai";
import type { User } from "@supabase/supabase-js";

interface HistoryItem {
  id: string;
  review: string;
  rating: number;
  tone: Tone;
  response: string;
  created_at: string;
}

interface UsageData {
  plan: string;
  monthlyUsage: number;
  monthlyLimit: number;
  remaining: number;
  totalResponses: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<{ restaurant_name?: string; brand_voice?: string }>({});
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const loadData = async (userId: string) => {
    // Load history from Supabase
    const { data: responses } = await supabase
      .from("responses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (responses) {
      setHistory(responses as HistoryItem[]);
    }

    // Load profile settings
    const { data: profile } = await supabase
      .from("profiles")
      .select("restaurant_name, brand_voice")
      .eq("id", userId)
      .single();

    if (profile) {
      setSettings({
        restaurant_name: profile.restaurant_name || undefined,
        brand_voice: profile.brand_voice || undefined,
      });
    }

    // Load usage stats
    const usageRes = await fetch("/api/usage");
    if (usageRes.ok) {
      const usageData = await usageRes.json();
      setUsage(usageData);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      await loadData(user.id);
      setLoading(false);
    };
    init();
  }, []);

  const handleGenerated = async () => {
    // Reload history and usage after generating
    if (user) {
      await loadData(user.id);
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    
    await supabase.from("responses").delete().eq("id", id);
    setHistory(history.filter((h) => h.id !== id));
    
    // Update usage count
    if (usage) {
      setUsage({
        ...usage,
        monthlyUsage: Math.max(0, usage.monthlyUsage - 1),
        remaining: usage.plan === "pro" ? Infinity : usage.remaining + 1,
        totalResponses: usage.totalResponses - 1,
      });
    }
  };

  const copyResponse = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isPro = usage?.plan === "pro";
  const usagePercent = usage ? Math.min(100, (usage.monthlyUsage / usage.monthlyLimit) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Banner */}
        <Card className="glass mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isPro ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Crown className="h-5 w-5" />
                    <span className="font-semibold">Pro Plan</span>
                    <span className="text-muted-foreground text-sm">• Unlimited responses</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Free Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {usage?.remaining === 0 ? (
                          <span className="text-red-400">No uses left</span>
                        ) : (
                          <>{usage?.remaining} of {usage?.monthlyLimit} left this month</>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {!isPro && (
                <Link href="/pricing">
                  <Button size="sm" variant="outline">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Generator */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold mb-6">Generate Response</h1>
            <Card className="glass">
              <CardContent className="p-6">
                <ReviewGenerator
                  onSave={handleGenerated}
                  restaurantName={settings.restaurant_name}
                  brandVoice={settings.brand_voice}
                  usageRemaining={usage?.remaining}
                  isPro={isPro}
                />
              </CardContent>
            </Card>
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">History</h2>
            <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No responses yet. Generate your first one!</p>
                  </CardContent>
                </Card>
              ) : (
                history.map((item) => (
                  <Card key={item.id} className="glass hover:glow-sm transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{item.tone}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyResponse(item.id, item.response)}
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">&ldquo;{item.review}&rdquo;</p>
                      <p className="text-sm line-clamp-3">{item.response}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
