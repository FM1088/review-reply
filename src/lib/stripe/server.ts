import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    monthlyLimit: 10,
    price: 0,
  },
  pro: {
    name: "Pro",
    monthlyLimit: Infinity,
    price: 1900, // $19.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
  },
} as const;
