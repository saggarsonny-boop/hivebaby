import { z } from "zod";

export const idSchema = z.string().min(8).max(64);

export const roleSchema = z.enum(["admin", "physician", "clinician_reviewer", "staff", "viewer"]);

export const patientInputSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  mrn: z.string().max(100).optional()
});

export const reportCreateSchema = z.object({
  patientId: idSchema.optional(),
  patient: patientInputSchema.optional(),
  examType: z.string().min(1).max(80),
  bodyRegion: z.string().min(1).max(120),
  modality: z.string().min(1).max(80),
  examDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  orderingClinician: z.string().max(160).optional(),
  reportText: z.string().min(20).max(50000),
  sourceType: z.enum(["pasted_text", "pdf_upload"]).default("pasted_text")
});

export const reportPatchSchema = z.object({
  examType: z.string().min(1).max(80).optional(),
  bodyRegion: z.string().min(1).max(120).optional(),
  modality: z.string().min(1).max(80).optional(),
  examDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  orderingClinician: z.string().max(160).optional(),
  status: z.enum(["draft", "ready_for_review", "approved", "sent_to_patient", "needs_revision", "archived"]).optional()
});

export const keyFindingSchema = z.object({
  originalReportPhrase: z.string().max(1000).optional(),
  medicalTerm: z.string().min(1).max(200),
  plainLanguageExplanation: z.string().min(1).max(2000),
  anatomicLocation: z.string().max(200).optional(),
  severityIfStated: z.string().max(100).optional(),
  lateralityIfStated: z.string().max(100).optional(),
  patientRelevance: z.string().max(1000).optional(),
  clinicianReviewNote: z.string().max(1000).optional()
});

export const generatedExplanationSchema = z.object({
  patientFriendlyTitle: z.string().min(1).max(300),
  plainEnglishSummary: z.string().min(1).max(5000),
  keyFindings: z.array(keyFindingSchema).min(1),
  redFlags: z.array(z.object({ term: z.string(), whyFlagged: z.string(), clinicianAttentionMessage: z.string() })).default([]),
  questionsForDoctor: z.array(z.string().max(300)).default([]),
  diagramPrompt: z.string().max(3000).default(""),
  patientDisclaimer: z.string().max(2000)
});

export const explanationPatchSchema = generatedExplanationSchema.partial().extend({
  keyFindings: z.array(keyFindingSchema).optional()
});

export const approvalSchema = z.object({
  approvalAttestation: z.literal("I reviewed this patient education summary and approve it for release."),
  flaggedFindingsAttestation: z.string().optional()
});

export const rejectionSchema = z.object({
  rejectionReason: z.string().min(5).max(1000)
});

export const settingsPatchSchema = z.object({
  requirePhysicianApproval: z.boolean().optional(),
  allowClinicianReviewerApproval: z.boolean().optional(),
  allowPdfBeforeApproval: z.boolean().optional(),
  dailyAiCostCapCents: z.number().int().min(0).max(1_000_000).optional(),
  sessionTimeoutMinutes: z.number().int().min(5).max(480).optional(),
  defaultRetentionDays: z.number().int().min(1).max(3650).optional(),
  allowPdfUpload: z.boolean().optional(),
  allowImageUpload: z.boolean().optional(),
  phiLoggingDisabled: z.boolean().optional()
});

export const compliancePatchSchema = z.object({
  hostingBaaConfirmed: z.boolean().optional(),
  databaseBaaConfirmed: z.boolean().optional(),
  aiVendorBaaConfirmed: z.boolean().optional(),
  storageBaaConfirmed: z.boolean().optional(),
  auditLogsEnabled: z.boolean().optional(),
  phiLoggingDisabled: z.boolean().optional(),
  encryptionAtRestConfirmed: z.boolean().optional(),
  tlsConfirmed: z.boolean().optional(),
  roleAccessConfigured: z.boolean().optional(),
  retentionPolicyConfigured: z.boolean().optional(),
  incidentResponseContactSet: z.boolean().optional(),
  accessReviewCompleted: z.boolean().optional()
});
