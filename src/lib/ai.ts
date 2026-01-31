export type Tone = "professional" | "friendly" | "empathetic" | "apologetic";

export interface GenerateRequest {
  review: string;
  rating: number;
  tone: Tone;
  restaurantName?: string;
  brandVoice?: string;
}

export function buildPrompt(req: GenerateRequest): string {
  const { review, rating, tone, restaurantName, brandVoice } = req;
  
  let strategy = "";
  if (rating >= 4) {
    strategy = "This is a POSITIVE review. Thank the reviewer warmly, highlight specific things they enjoyed (reference their words), and invite them to visit again. Be genuinely grateful.";
  } else if (rating <= 2) {
    strategy = "This is a NEGATIVE review. Acknowledge their specific concerns with empathy, sincerely apologize for their experience, offer to make it right, and invite them to contact you directly to resolve it. Never be defensive.";
  } else {
    strategy = "This is a MIXED review (3 stars). Thank them for their feedback, address the specific concerns they raised, highlight the positives they mentioned, and express commitment to improving.";
  }

  const toneGuide: Record<Tone, string> = {
    professional: "Use a polished, professional tone. Be courteous and business-appropriate.",
    friendly: "Use a warm, conversational, friendly tone. Be personable and approachable.",
    empathetic: "Use a deeply empathetic and understanding tone. Show genuine care for their experience.",
    apologetic: "Use a sincerely apologetic tone. Take full responsibility and express genuine remorse.",
  };

  return `You are an expert restaurant reputation manager. Generate a response to the following customer review.

${strategy}

TONE: ${toneGuide[tone]}

${restaurantName ? `RESTAURANT NAME: ${restaurantName}` : ""}
${brandVoice ? `BRAND VOICE NOTES: ${brandVoice}` : ""}

REVIEW (${rating} stars):
"${review}"

Write a concise, authentic response (2-4 paragraphs). Do not use generic phrases. Reference specific details from the review. ${restaurantName ? `Sign off as the ${restaurantName} team.` : ""}

Response:`;
}
