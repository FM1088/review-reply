"use client";

import { cn } from "@/lib/utils";
import { Briefcase, Heart, HandHeart, HandMetal } from "lucide-react";
import type { Tone } from "@/lib/ai";

const tones: { value: Tone; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "professional", label: "Professional", icon: Briefcase, desc: "Polished & formal" },
  { value: "friendly", label: "Friendly", icon: Heart, desc: "Warm & personal" },
  { value: "empathetic", label: "Empathetic", icon: HandHeart, desc: "Understanding & caring" },
  { value: "apologetic", label: "Apologetic", icon: HandMetal, desc: "Sincere & remorseful" },
];

interface ToneSelectorProps {
  selected: Tone;
  onChange: (tone: Tone) => void;
}

export function ToneSelector({ selected, onChange }: ToneSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tones.map(({ value, label, icon: Icon, desc }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center",
            selected === value
              ? "border-primary bg-primary/10 text-primary glow-sm"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <Icon size={20} />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{desc}</span>
        </button>
      ))}
    </div>
  );
}
