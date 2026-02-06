# ReviewReply.ai

AI-powered review response generator for restaurants. Paste a customer review, select a tone, and get a perfect response in seconds.

## Tech Stack
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase (auth + DB)
- Anthropic Claude API (streaming responses)
- Stripe (billing - ready for integration)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase and Anthropic API keys

# Run the database schema
# Execute supabase/schema.sql in your Supabase SQL editor

# Start development server
npm run dev
```

## Features
- 🎯 4 response tones: Professional, Friendly, Empathetic, Apologetic
- ⭐ Smart strategy based on star rating (1-5)
- 🏪 Brand voice customization
- 📋 Copy to clipboard
- 📜 Response history
- 🚀 Streaming AI responses
- 🎨 Beautiful dark UI
- 📱 Fully responsive
- 🆓 Landing page demo (3 free tries, no auth)

## Pages
- `/` - Landing page with hero, features, pricing, and demo
- `/dashboard` - Main app: generate responses, view history
- `/settings` - Brand voice, usage stats, account
- `/auth` - Sign in / sign up
- `/pricing` - Detailed pricing with FAQ

---

## 🔗 Role in Curateria Ecosystem

**ReviewReply is the Reputation Manager.**

```
ECOSYSTEM POSITION: Tier 2 — Tools 🛠️
```

### What It Does
- AI-powered review response generation
- Tone matching (professional, friendly, empathetic)
- Brand voice customisation
- Response history and analytics

### How It Connects
```
Customer visits restaurant (via Curateria)
     ↓
Leaves review (Google, TripAdvisor)
     ↓
ReviewReply → generates perfect response
     ↓
Positive engagement → better reputation
     ↓
Higher ratings → better Curateria ranking
```

### Value to Ecosystem
1. **Partner retention** — Free for Curateria partners
2. **Reputation loop** — Good responses → better reviews → more discovery
3. **Time savings** — Responses in seconds, not 30+ minutes
4. **Consistency** — Every review gets a response, on-brand

See: `/home/ernando_atsuda/projects/ECOSYSTEM.md` for full strategy.
