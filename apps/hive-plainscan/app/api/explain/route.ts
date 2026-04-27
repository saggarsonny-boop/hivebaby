import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  USER_TEXT_INSTRUCTION,
  USER_IMAGE_INSTRUCTION,
} from "@/lib/promptTemplate";
import { ParseError, parseModelResponse } from "@/lib/parseReport";
import type { ExplainRequestBody } from "@/types/plainscan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 2048;

function isTextBody(
  body: ExplainRequestBody,
): body is { reportText: string } {
  return typeof (body as { reportText?: unknown }).reportText === "string";
}

function isImageBody(
  body: ExplainRequestBody,
): body is { imageBase64: string; mediaType: "image/jpeg" | "image/png" } {
  const b = body as {
    imageBase64?: unknown;
    mediaType?: unknown;
  };
  return (
    typeof b.imageBase64 === "string" &&
    (b.mediaType === "image/jpeg" || b.mediaType === "image/png")
  );
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError("Service is not configured. Please try again later.", 500);
  }

  let body: ExplainRequestBody;
  try {
    body = (await req.json()) as ExplainRequestBody;
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const client = new Anthropic({ apiKey });

  let userContent: Anthropic.MessageParam["content"];

  if (isTextBody(body)) {
    const text = body.reportText.trim();
    if (!text) {
      return jsonError("Report text is empty.", 400);
    }
    userContent = [
      { type: "text", text: USER_TEXT_INSTRUCTION },
      { type: "text", text },
    ];
  } else if (isImageBody(body)) {
    if (!body.imageBase64.trim()) {
      return jsonError("Image is empty.", 400);
    }
    userContent = [
      { type: "text", text: USER_IMAGE_INSTRUCTION },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: body.mediaType,
          data: body.imageBase64,
        },
      },
    ];
  } else {
    return jsonError(
      "Provide either reportText or imageBase64 with mediaType.",
      400,
    );
  }

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });
  } catch {
    return jsonError(
      "Something went wrong. Please check your report and try again.",
      502,
    );
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );

  if (!textBlock) {
    return jsonError(
      "Something went wrong. Please check your report and try again.",
      422,
    );
  }

  try {
    const parsed = parseModelResponse(textBlock.text);
    return NextResponse.json(parsed);
  } catch (err) {
    if (err instanceof ParseError) {
      return jsonError(
        "Something went wrong. Please check your report and try again.",
        422,
      );
    }
    return jsonError(
      "Something went wrong. Please check your report and try again.",
      500,
    );
  }
}
