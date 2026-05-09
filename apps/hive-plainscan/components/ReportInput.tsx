"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExplainRequestBody } from "@/types/plainscan";
import { detectPhi } from "@/lib/privacy";
import { SAMPLE_REPORT } from "@/lib/sampleReport";

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

const EXAM_TYPES = [
  "Auto-detect",
  "MRI",
  "CT",
  "X-ray",
  "Ultrasound",
  "Other",
];

const BODY_REGIONS = [
  "Auto-detect",
  "Spine",
  "Cervical Spine",
  "Lumbar Spine",
  "Brain",
  "Knee",
  "Shoulder",
  "Hip",
  "Abdomen",
  "Chest",
  "Other",
];

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
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

async function extractDocxText(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/extract-report", {
    method: "POST",
    body: formData,
  });
  const data = (await res.json()) as { reportText?: string; error?: string };
  if (!res.ok || !data.reportText) {
    throw new Error(data.error || "Could not extract text from this DOCX file.");
  }
  return data.reportText;
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
  const [examType, setExamType] = useState("Auto-detect");
  const [bodyRegion, setBodyRegion] = useState("Auto-detect");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Platform detection runs in useEffect so SSR + initial hydration agree
  // (the hint label otherwise mismatches between server and client).
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.platform));
  }, []);

  const cyclePlaceholder = () => {
    setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
  };

  const phiWarnings = useMemo(() => detectPhi(reportText), [reportText]);

  const loadSample = () => {
    setReportText(SAMPLE_REPORT);
    setExamType("MRI");
    setBodyRegion("Lumbar Spine");
    setTab("text");
    setPdfStatus(null);
    setPdfText(null);
  };

  const normaliseSelectValue = (value: string): string =>
    value === "Auto-detect" ? "" : value;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    setPdfStatus(null);
    setPdfText(null);
    if (!file) return;
    const name = file.name.toLowerCase();
    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx");
    setPdfStatus(isDocx ? "Reading DOCX..." : "Reading PDF...");
    try {
      const text = isDocx ? await extractDocxText(file) : await extractPdfText(file);
      if (!text) {
        setPdfStatus(
          isDocx
            ? "Could not extract text from this DOCX file."
            : "This PDF appears to be a scanned image. Please use the Upload Image tab instead.",
        );
        return;
      }
      setPdfText(text);
      setPdfStatus(`Extracted ${text.length} characters. Ready to explain.`);
    } catch (err) {
      setPdfStatus(
        err instanceof Error
          ? err.message
          : "Could not read this file. Try pasting the text instead.",
      );
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
  };

  // The form's onSubmit handler. Fires on:
  //   1. Click on a type="submit" button (the "Explain my report" CTA).
  //   2. Enter pressed inside an input (browser default form submit).
  //   3. Cmd/Ctrl+Enter inside the textarea (handleTextareaKeyDown calls
  //      formRef.current?.requestSubmit()).
  // Always preventDefault — we control navigation ourselves so the page
  // doesn't reload.
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    if (!canSubmit) return;
    const examOpt = normaliseSelectValue(examType);
    const regionOpt = normaliseSelectValue(bodyRegion);
    if (tab === "text") {
      const trimmed = reportText.trim();
      if (!trimmed) return;
      await onSubmit({
        reportText: trimmed,
        examType: examOpt,
        bodyRegion: regionOpt,
      });
      return;
    }
    if (tab === "pdf") {
      if (!pdfText) return;
      await onSubmit({
        reportText: pdfText,
        examType: examOpt,
        bodyRegion: regionOpt,
      });
      return;
    }
    if (tab === "image") {
      if (!imageFile) return;
      const mediaType =
        imageFile.type === "image/png" ? "image/png" : "image/jpeg";
      const base64 = await fileToBase64(imageFile);
      await onSubmit({
        imageBase64: base64,
        mediaType,
        examType: examOpt,
        bodyRegion: regionOpt,
      });
    }
  };

  // Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux) inside the textarea fires
  // the form. Plain Enter without modifier still inserts a newline (default
  // textarea behaviour) — this matches Slack, GitHub, Linear, and the
  // ChatGPT convention so users don't have to learn a new shortcut.
  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key !== "Enter") return;
    if (!(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    formRef.current?.requestSubmit();
  };

  const canSubmit = (() => {
    if (disabled) return false;
    if (tab === "text") return reportText.trim().length > 0;
    if (tab === "pdf") return Boolean(pdfText);
    if (tab === "image") return Boolean(imageFile);
    return false;
  })();

  const submitHint = isMac ? "Cmd+Enter to submit" : "Ctrl+Enter to submit";

  return (
    <form ref={formRef} onSubmit={handleFormSubmit} noValidate>
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
          Upload PDF or DOCX
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
          <>
            <textarea
              className="input-area"
              placeholder={PLACEHOLDERS[placeholderIdx]}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              onFocus={cyclePlaceholder}
              onKeyDown={handleTextareaKeyDown}
              aria-label="Paste your radiology report"
            />
            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className="link-button"
                onClick={loadSample}
                style={{
                  background: "none",
                  border: 0,
                  color: "var(--muted)",
                  textDecoration: "underline",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Try sample report
              </button>
            </div>
            {phiWarnings.length > 0 && (
              <p
                role="status"
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                  lineHeight: 1.4,
                }}
              >
                Heads up: the report text contains{" "}
                {phiWarnings.map((w) => w.label.toLowerCase()).join(", ")}. We
                will remove anything matching these patterns before sending the
                report to the AI.
              </p>
            )}
          </>
        )}

        {tab === "pdf" && (
          <div>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
              className="input-file"
              onChange={handleFileChange}
              aria-label="Upload PDF or DOCX report"
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

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Exam type
            </span>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid var(--line)",
                fontSize: "0.95rem",
              }}
            >
              {EXAM_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Body region
            </span>
            <select
              value={bodyRegion}
              onChange={(e) => setBodyRegion(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid var(--line)",
                fontSize: "0.95rem",
              }}
            >
              {BODY_REGIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="actions"
          style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
        >
          <button
            type="submit"
            className="btn btn-gold focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
            disabled={!canSubmit}
            aria-keyshortcuts={isMac ? "Meta+Enter" : "Control+Enter"}
          >
            {disabled ? "Working..." : "Explain my report"}
          </button>
          {tab === "text" && (
            <span
              className="submit-hint"
              aria-hidden="true"
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
              }}
            >
              {submitHint}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
