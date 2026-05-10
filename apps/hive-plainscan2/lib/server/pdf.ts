import { putSecureObject } from "./storage";

export async function renderApprovedSummaryPdf(params: {
  organizationId: string;
  title: string;
  summary: string;
  reviewerLine: string;
}) {
  const html = `ReportBridge Clinical\n\n${params.title}\n\n${params.summary}\n\n${params.reviewerLine}\n\nThis document is a patient education summary of a finalized imaging report. It is not a diagnosis, treatment plan, or substitute for medical advice. Please discuss your results with your clinician.`;
  const bytes = Buffer.from(html, "utf8");
  return putSecureObject({ organizationId: params.organizationId, bytes, fileName: `approved-summary-${Date.now()}.pdf` });
}
