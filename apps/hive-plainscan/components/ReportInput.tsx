"use client";

import { useRef, useState } from "react";
import type { ExplainRequestBody } from "@/types/plainscan";

type Tab = "text" | "pdf" | "image";

interface Props {
  onSubmit: (payload: ExplainRequestBody) => Promise<void> | void;
  disabled: boolean;
}

const PLACEHOLDERS = [
  "Paste your radiology report here.",
  "Paste your MRI report here.",
  "Paste your CT scan report here.",
  "Paste your X-ray report here.",
  "Paste your ultrasound report here.",
];

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  // Use the worker that ships with pdfjs-dist via a CDN URL.
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  let combined = "";
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ");
    combined += `${pageText}\n`;
  }
  return combined.trim();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const comma = dataUrl.indexOf(",");
      resolve(comma === -1 ? dataUrl : dataUrl.slice(comma + 1));
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function ReportInput({ onSubmit, disabled }: Props) {
  const [tab, setTab] = useState<Tab>("text");
  const [reportText, setReportText] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const cyclePlaceholder = () => {
    setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
  };

  const handlePdfChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    setPdfStatus(null);
    setPdfText(null);
    if (!file) return;
    setPdfStatus("Reading PDF...");
    try {
      const text = await extractPdfText(file);
      if (!text) {
        setPdfStatus(
          "This PDF appears to be a scanned image. Please use the Upload Image tab instead.",
        );
        return;
      }
      setPdfText(text);
      setPdfStatus(`Extracted ${text.length} characters. Ready to explain.`);
    } catch {
      setPdfStatus(
        "Could not read this PDF. Try pasting the text or uploading an image.",
      );
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handleSubmit = async () => {
    if (disabled) return;
    if (tab === "text") {
      const trimmed = reportText.trim();
      if (!trimmed) return;
      await onSubmit({ reportText: trimmed });
      return;
    }
    if (tab === "pdf") {
      if (!pdfText) return;
      await onSubmit({ reportText: pdfText });
      return;
    }
    if (tab === "image") {
      if (!imageFile) return;
      const mediaType =
        imageFile.type === "image/png" ? "image/png" : "image/jpeg";
      const base64 = await fileToBase64(imageFile);
      await onSubmit({ imageBase64: base64, mediaType });
    }
  };

  const canSubmit = (() => {
    if (disabled) return false;
    if (tab === "text") return reportText.trim().length > 0;
    if (tab === "pdf") return Boolean(pdfText);
    if (tab === "image") return Boolean(imageFile);
    return false;
  })();

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Report input method">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "text"}
          className="tab"
          onClick={() => setTab("text")}
        >
          Paste Text
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "pdf"}
          className="tab"
          onClick={() => setTab("pdf")}
        >
          Upload PDF
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "image"}
          className="tab"
          onClick={() => setTab("image")}
        >
          Upload Image
        </button>
      </div>

      <div className="tab-panel">
        {tab === "text" && (
          <textarea
            className="input-area"
            placeholder={PLACEHOLDERS[placeholderIdx]}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            onFocus={cyclePlaceholder}
            aria-label="Paste your radiology report"
          />
        )}

        {tab === "pdf" && (
          <div>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="input-file"
              onChange={handlePdfChange}
              aria-label="Upload PDF report"
            />
            {pdfStatus && (
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                }}
              >
                {pdfStatus}
              </p>
            )}
          </div>
        )}

        {tab === "image" && (
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              className="input-file"
              onChange={handleImageChange}
              aria-label="Upload image of report"
            />
            {imageFile && (
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                }}
              >
                Selected: {imageFile.name}
              </p>
            )}
          </div>
        )}

        <div className="actions">
          <button
            type="button"
            className="btn btn-gold"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {disabled ? "Working..." : "Explain my report"}
          </button>
        </div>
      </div>
    </div>
  );
}
