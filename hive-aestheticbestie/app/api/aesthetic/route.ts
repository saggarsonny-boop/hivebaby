import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/client";
import { fallbackAesthetic, sanitizePalette } from "@/lib/aesthetic/catalog";
import { aestheticSystemPrompt, buildUserMessage, extractText, parseAestheticJson } from "@/lib/aesthetic/prompt";
import { env } from "@/lib/env";

type AestheticRequest = {
  vibe?: string;
  imageDataUrl?: string;
};

function toImageBlock(imageDataUrl: string) {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  const mediaType = match[1].toLowerCase();
  const base64 = match[2];
  if (!base64 || base64.length < 120) return null;

  const supportedMediaTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
  if (!supportedMediaTypes.has(mediaType)) return null;

  return {
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
      data: base64,
    },
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as AestheticRequest;
  const fallback = fallbackAesthetic();
  const client = getAnthropicClient();
  const vibe = typeof body.vibe === "string" ? body.vibe : "";
  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";
  const imageBlock = imageDataUrl ? toImageBlock(imageDataUrl) : null;

  if (!client || (!vibe.trim() && !imageBlock)) {
    return NextResponse.json({ ...fallback, source: "template" });
  }

  try {
    const message = await client.messages.create({
      model: env.anthropicModel,
      max_tokens: 260,
      temperature: 0.9,
      system: aestheticSystemPrompt,
      messages: buildUserMessage(vibe, imageBlock ?? undefined),
    });

    const parsed = parseAestheticJson(extractText(message));
    if (!parsed?.label || !parsed?.moodSentence || !Array.isArray(parsed.palette)) {
      return NextResponse.json({ ...fallback, source: "template" });
    }

    return NextResponse.json({
      label: String(parsed.label).slice(0, 42),
      palette: sanitizePalette(parsed.palette as string[]),
      moodSentence: String(parsed.moodSentence).slice(0, 220),
      outfitSuggestion: String(parsed.outfitSuggestion || fallback.outfitSuggestion).slice(0, 220),
      source: "ai",
    });
  } catch (error) {
    console.error("[aesthetic]", error);
    return NextResponse.json({ ...fallback, source: "template" });
  }
}