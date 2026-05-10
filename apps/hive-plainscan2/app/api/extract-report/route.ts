import { NextResponse } from "next/server";

export const runtime = "nodejs";

const maxFileBytes = 10 * 1024 * 1024;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function extractPdf(buffer: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const parsed = await parser.getText();
    return parsed.text || "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

async function extractImageReport(buffer: Buffer, mimeType: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("VISION_OCR_NOT_CONFIGURED");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": process.env.ANTHROPIC_API_KEY
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_OCR_MODEL || process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 3500,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Transcribe the visible text from this photo or screenshot of a finalized radiology report. Return plain text only. Preserve headings, findings, impression, levels, and measurements. Do not summarize, interpret, diagnose, or add text not visible in the image. If unreadable, return UNREADABLE_IMAGE."
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: buffer.toString("base64")
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) throw new Error("VISION_OCR_FAILED");
  const payload = await response.json();
  return payload.content?.find((item: { type: string; text?: string }) => item.type === "text")?.text || "";
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a PDF, DOCX, or report photo." }, { status: 400 });
  }

  if (file.size > maxFileBytes) {
    return NextResponse.json({ error: "File is too large. Please upload a report under 10 MB." }, { status: 400 });
  }

  const fileName = file.name.toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";
    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      text = await extractPdf(bytes);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      text = await extractDocx(bytes);
    } else if (imageTypes.has(file.type) || /\.(jpe?g|png|webp)$/i.test(fileName)) {
      const mimeType = imageTypes.has(file.type)
        ? file.type
        : fileName.endsWith(".webp")
          ? "image/webp"
          : fileName.endsWith(".png")
            ? "image/png"
            : "image/jpeg";
      text = await extractImageReport(bytes, mimeType);
    } else {
      return NextResponse.json({ error: "Unsupported file type. Please upload a PDF, DOCX, JPG, PNG, or WEBP file." }, { status: 400 });
    }

    const reportText = normalizeText(text);
    if (reportText.length < 20 || reportText.includes("UNREADABLE_IMAGE")) {
      return NextResponse.json(
        { error: "Could not find enough readable report text in that file. Try a clearer photo, text-based PDF/DOCX, or paste the report manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      fileName: file.name,
      reportText,
      characterCount: reportText.length
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not extract text from this file. Try a clearer report photo, text-based PDF/DOCX, or paste the report manually. Report photo OCR requires ANTHROPIC_API_KEY."
      },
      { status: 422 }
    );
  }
}
