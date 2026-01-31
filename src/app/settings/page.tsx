"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      const savedSettings = localStorage.getItem(`rr_settings_${user.id}`);
      if (savedSettings) {
        const s = JSON.parse(savedSettings);
        setRestaurantName(s.restaurant_name || "");
        setBrandVoice(s.brand_voice || "");
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = () => {
    if (!user) return;
    localStorage.setItem(`rr_settings_${user.id}`, JSON.stringify({
      restaurant_name: restaurantName,
      brand_voice: brandVoice,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  // Calculate usage from history
  const history = JSON.parse(localStorage.getItem(`rr_history_${user?.id}`) || "[]");
  const today = new Date().toISOString().split("T")[0];
  const todayCount = history.filter((h: any) =>
    h.created_at.startsWith(today)
  ).length;

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-8">
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
              <Button onClick={handleSave}>
                {saved ? (
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
              <CardTitle>Usage</CardTitle>
              <CardDescription>Your API usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-3xl font-bold text-primary">{todayCount}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-3xl font-bold text-primary">{history.length}</div>
                  <div className="text-sm text-muted-foreground">All Time</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="text-3xl font-bold text-primary">Free</div>
                  <div className="text-sm text-muted-foreground">Current Plan</div>
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
