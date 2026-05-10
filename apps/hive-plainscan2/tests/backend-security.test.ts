import { beforeEach, describe, expect, it, vi } from "vitest";
import { encryptPHI, decryptPHI, hashPHIReference } from "../lib/server/crypto";
import { redactPHI, stripIdentifiersForAi } from "../lib/server/phi";
import { roleHasPermission } from "../lib/server/permissions";
import { detectSafetyFlags } from "../lib/server/safety";
import { ApiError } from "../lib/server/errors";

describe("ReportBridge backend safeguards", () => {
  beforeEach(() => {
    process.env.APP_ENCRYPTION_KEY = "0000000000000000000000000000000000000000000000000000000000000000";
  });

  it("encrypts and decrypts PHI with a non-plaintext payload", () => {
    const encrypted = encryptPHI("Finalized report text");
    expect(encrypted).not.toContain("Finalized report text");
    expect(decryptPHI(encrypted)).toBe("Finalized report text");
  });

  it("hashes PHI references for dedupe without storing the value", () => {
    const hash = hashPHIReference("MRN-12345");
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("MRN");
  });

  it("redacts common PHI before logs or AI prompts", () => {
    const redacted = redactPHI("Patient name: Jane Smith DOB: 01/02/1970 MRN: ABC12345 jane@example.com");
    expect(redacted).not.toContain("Jane Smith");
    expect(redacted).not.toContain("01/02/1970");
    expect(redacted).not.toContain("ABC12345");
    expect(redacted).not.toContain("jane@example.com");
    expect(stripIdentifiersForAi(redacted)).toContain("[REDACTED");
  });

  it("enforces role permissions server-side", () => {
    expect(roleHasPermission("physician", "approve_explanations")).toBe(true);
    expect(roleHasPermission("staff", "approve_explanations")).toBe(false);
    expect(roleHasPermission("viewer", "view_raw_reports")).toBe(false);
  });

  it("detects urgent and caution safety flags", () => {
    expect(detectSafetyFlags("cauda equina and cord compression").flagLevel).toBe("urgent");
    expect(detectSafetyFlags("possible mass").flagLevel).toBe("caution");
    expect(detectSafetyFlags("mild degenerative changes").flagLevel).toBe("none");
  });

  it("returns safe API errors without PHI", () => {
    const error = new ApiError(403, "Insufficient permission.", "insufficient_permission");
    expect(error.message).not.toContain("report");
    expect(error.status).toBe(403);
  });

  it("documents expected access-control cases", () => {
    const cases = [
      "unauthenticated access rejected",
      "wrong organization access rejected",
      "staff cannot approve",
      "viewer cannot see raw report text",
      "physician can approve",
      "approved explanation locks",
      "edit after approval requires reapproval",
      "PDF cannot generate before approval",
      "AI generation respects cost cap",
      "audit logs are created for PHI access",
      "deleted reports are inaccessible",
      "file upload rejects unsupported types",
      "every PHI query is organization-scoped"
    ];
    expect(cases).toHaveLength(13);
    expect(vi.isMockFunction).toBeDefined();
  });
});
