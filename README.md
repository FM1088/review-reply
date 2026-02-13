# ReviewReply.ai

AI-powered review response generator for restaurant owners. Paste a customer review, select a tone, and get a perfect, on-brand response in seconds.

## Features

- **4 Response Tones** -- Professional, Friendly, Empathetic, Apologetic
- **Smart Strategy** -- AI adapts based on star rating (positive, mixed, negative)
- **Brand Voice** -- Set your restaurant name and style notes for personalized replies
- **Streaming Responses** -- Watch your reply generate in real-time via Claude AI
- **Response History** -- All generated responses saved and searchable
- **Copy to Clipboard** -- One-click copy for pasting back to Google, Yelp, TripAdvisor
- **Landing Page Demo** -- 3 free tries without signing up
- **Usage Limits & Billing** -- Free tier (10/month) + Pro plan ($19/month unlimited) via Stripe
- **Dark UI** -- Beautiful dark theme, fully responsive

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + custom design system
- **Auth & Database**: Supabase (email/password auth, PostgreSQL, RLS)
- **AI**: Anthropic Claude API (streaming)
- **Billing**: Stripe (checkout, customer portal, webhooks)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, pricing preview, and live demo |
| `/auth` | Sign in / Sign up |
| `/dashboard` | Generate responses, view history |
| `/settings` | Brand voice config, subscription management, usage stats |
| `/pricing` | Detailed pricing with FAQ |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate AI response (streaming) |
| `/api/usage` | GET | Get current user's usage stats |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/portal` | POST | Create Stripe billing portal session |
| `/api/stripe/webhook` | POST | Handle Stripe webhook events |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Stripe](https://stripe.com) account (for billing)

### 1. Clone and install

```bash
git clone https://github.com/FM1088/review-reply.git
cd review-reply
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual keys:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

Run the SQL in `supabase/schema.sql` (or `supabase/migrations/001_init.sql`) in your Supabase SQL Editor. This creates:

- `profiles` table (user settings, subscription status)
- `responses` table (generated response history)
- Row Level Security policies
- Auto-create profile trigger on signup
- `get_monthly_usage()` function for usage tracking

### 4. Set up Stripe (optional, for billing)

1. Create a product and price in Stripe Dashboard
2. Set `STRIPE_PRO_PRICE_ID` to your price ID
3. Set up a webhook endpoint pointing to `/api/stripe/webhook`
4. Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx              # Landing page with demo
    layout.tsx            # Root layout with metadata
    globals.css           # Tailwind + custom styles
    auth/
      page.tsx            # Sign in / Sign up
      callback/route.ts   # OAuth callback handler
    dashboard/page.tsx    # Main app (generator + history)
    settings/page.tsx     # Brand voice, subscription, usage
    pricing/page.tsx      # Pricing plans with FAQ
    api/
      generate/route.ts   # AI response generation (streaming)
      usage/route.ts      # Usage stats endpoint
      stripe/
        checkout/route.ts # Create checkout session
        portal/route.ts   # Billing portal session
        webhook/route.ts  # Stripe webhook handler
  components/
    navbar.tsx            # Navigation bar
    review-generator.tsx  # Core review response generator
    star-rating.tsx       # Interactive star rating
    tone-selector.tsx     # Tone picker (4 options)
    ui/                   # Base UI components (Button, Card, Input, Textarea)
  lib/
    ai.ts                 # Prompt builder with tone/rating strategy
    utils.ts              # cn() utility for Tailwind
    supabase/
      client.ts           # Browser Supabase client
      server.ts           # Server-side Supabase client
    stripe/
      client.ts           # Browser Stripe loader
      server.ts           # Server-side Stripe + plan config
  middleware.ts           # Supabase session refresh
supabase/
  schema.sql              # Full database schema
  migrations/
    001_init.sql          # Initial migration
```

## License

MIT
