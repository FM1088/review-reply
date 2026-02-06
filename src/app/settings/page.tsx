"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle2, Crown, CreditCard, Loader2, ExternalLink } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface UsageData {
  plan: string;
  monthlyUsage: number;
  monthlyLimit: number;
  remaining: number;
  totalResponses: number;
  currentPeriodEnd?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const showSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      // Load profile settings from Supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_name, brand_voice")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRestaurantName(profile.restaurant_name || "");
        setBrandVoice(profile.brand_voice || "");
      }

      // Load usage stats
      const usageRes = await fetch("/api/usage");
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        restaurant_name: restaurantName || null,
        brand_voice: brandVoice || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setPortalLoading(false);
    }
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

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Success Banner */}
        {showSuccess && (
          <div className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">Welcome to Pro!</p>
                <p className="text-sm opacity-80">Your subscription is now active. Enjoy unlimited responses!</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Subscription */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className={isPro ? "h-5 w-5 text-primary" : "h-5 w-5"} />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{isPro ? "Pro Plan" : "Free Plan"}</span>
                    {isPro && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isPro ? (
                      <>Unlimited responses • Renews {usage?.currentPeriodEnd ? new Date(usage.currentPeriodEnd).toLocaleDateString() : "soon"}</>
                    ) : (
                      <>10 responses per month • {usage?.remaining || 0} remaining</>
                    )}
                  </p>
                </div>
                {isPro ? (
                  <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href="/pricing">
                    <Button>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Brand Voice */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Brand Voice</CardTitle>
              <CardDescription>
                Customize how your AI responses sound. This is applied to every generated response.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Restaurant Name</label>
                <Input
                  placeholder="e.g. The Golden Fork"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Brand Voice Notes</label>
                <Textarea
                  placeholder="e.g. We're a family-owned Italian restaurant. Keep it warm and personal. Use first names when possible. Mention our homemade pasta as a signature."
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Tips: mention your cuisine type, personality, signature dishes, and any phrases you like to use.
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : saved ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4 text-green-400" /> Saved!</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Settings</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Your response generation stats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-3xl font-bold text-primary">{usage?.monthlyUsage || 0}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-3xl font-bold text-primary">{usage?.totalResponses || 0}</div>
                  <div className="text-sm text-muted-foreground">All Time</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-3xl font-bold text-primary">
                    {isPro ? "∞" : usage?.remaining || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(user?.created_at || "").toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
