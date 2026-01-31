import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ReviewReply.ai — AI-Powered Review Responses for Restaurants",
  description: "Generate perfect, personalized responses to customer reviews in seconds. Save hours every week with AI that understands your brand voice.",
  keywords: ["restaurant review response", "AI review reply", "Google review response generator", "TripAdvisor reply"],
  openGraph: {
    title: "ReviewReply.ai — AI-Powered Review Responses",
    description: "Generate perfect responses to customer reviews in seconds.",
    url: "https://reviewreply.ai",
    siteName: "ReviewReply.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewReply.ai — AI-Powered Review Responses",
    description: "Generate perfect responses to customer reviews in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
