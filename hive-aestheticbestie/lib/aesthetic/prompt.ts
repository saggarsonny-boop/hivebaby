import type Anthropic from "@anthropic-ai/sdk";
import type { ContentBlockParam, MessageParam, TextBlock } from "@anthropic-ai/sdk/resources/messages";
import type { AestheticResult } from "@/lib/aesthetic/catalog";

export const aestheticSystemPrompt = [
  "You are HiveAestheticBestie.",
  "Return only compact JSON.",
  "Tone is warm, stylish, best-friend energy.",
  "Always affirming and identity-forward.",
  "No appearance criticism, no beauty standards, no negativity.",
  "JSON schema: {\"label\":string,\"palette\":[\"#RRGGBB\",\"#RRGGBB\",\"#RRGGBB\"],\"moodSentence\":string,\"outfitSuggestion\":string}",
  "label: 2-4 words.",
  "moodSentence: 1 sentence only.",
  "outfitSuggestion: 1 sentence only.",
].join(" ");

export function buildUserMessage(vibe: string, imageBlock?: ContentBlockParam): MessageParam[] {
  const content: ContentBlockParam[] = [
    {
      type: "text",
      text: [
        "Generate one aesthetic card.",
        `User vibe text: ${vibe.trim() || "(none provided)"}`,
      ].join("\n"),
    },
  ];

  if (imageBlock) content.push(imageBlock);

  return [{ role: "user", content }];
}

export function extractText(message: Anthropic.Messages.Message) {
  return message.content
    .filter((block): block is TextBlock => block.type === "text")
    .map((block) => block.text)
    .join(" ")
    .trim();
}

export function parseAestheticJson(text: string): Partial<AestheticResult> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Partial<AestheticResult>;
  } catch {
    return null;
  }
}