"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ReviewGenerator } from "@/components/review-generator";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Copy, Check, Trash2, Clock } from "lucide-react";
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<{ restaurant_name?: string; brand_voice?: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);

      // Load history from localStorage (or Supabase in production)
      const saved = localStorage.getItem(`rr_history_${user.id}`);
      if (saved) setHistory(JSON.parse(saved));

      const savedSettings = localStorage.getItem(`rr_settings_${user.id}`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      setLoading(false);
    };
    init();
  }, []);

  const handleSave = (data: { review: string; rating: number; tone: Tone; response: string }) => {
    if (!user) return;
    const item: HistoryItem = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
    };
    const updated = [item, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem(`rr_history_${user.id}`, JSON.stringify(updated));
  };

  const deleteItem = (id: string) => {
    if (!user) return;
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(`rr_history_${user.id}`, JSON.stringify(updated));
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

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Generator */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold mb-6">Generate Response</h1>
            <Card className="glass">
              <CardContent className="p-6">
                <ReviewGenerator
                  onSave={handleSave}
                  restaurantName={settings.restaurant_name}
                  brandVoice={settings.brand_voice}
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
