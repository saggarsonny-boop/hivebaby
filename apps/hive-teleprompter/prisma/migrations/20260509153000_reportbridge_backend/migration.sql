-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'physician', 'clinician_reviewer', 'staff', 'viewer');

-- CreateEnum
CREATE TYPE "ImagingReportStatus" AS ENUM ('draft', 'ready_for_review', 'approved', 'sent_to_patient', 'needs_revision', 'archived', 'deleted');

-- CreateEnum
CREATE TYPE "ExplanationStatus" AS ENUM ('draft', 'ready_for_review', 'approved', 'needs_revision', 'archived');

-- CreateEnum
CREATE TYPE "SafetyFlagLevel" AS ENUM ('none', 'caution', 'urgent');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('pasted_text', 'pdf_upload');

-- CreateEnum
CREATE TYPE "UploadedFileStatus" AS ENUM ('pending_scan', 'accepted', 'rejected', 'deleted');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('approved', 'rejected', 'reopened');

-- CreateEnum
CREATE TYPE "BaaStatus" AS ENUM ('not_started', 'in_review', 'confirmed');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hipaaModeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "allowClinicianReviewerApproval" BOOLEAN NOT NULL DEFAULT false,
    "defaultRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "dailyAiCostCapCents" INTEGER NOT NULL DEFAULT 500,
    "baaStatus" "BaaStatus" NOT NULL DEFAULT 'not_started',
    "incidentResponseContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "mrn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingReport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "bodyRegion" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "examDate" TIMESTAMP(3),
    "orderingClinician" TEXT,
    "reportTextEncrypted" TEXT NOT NULL,
    "reportTextHash" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "status" "ImagingReportStatus" NOT NULL DEFAULT 'draft',
    "safetyFlagLevel" "SafetyFlagLevel" NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ImagingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT,
    "imagingReportId" TEXT,
    "uploadedByUserId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256Hash" TEXT NOT NULL,
    "status" "UploadedFileStatus" NOT NULL DEFAULT 'pending_scan',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedExplanation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "imagingReportId" TEXT NOT NULL,
    "generatedByUserId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "patientFriendlyTitle" TEXT NOT NULL,
    "plainEnglishSummary" TEXT NOT NULL,
    "questionsForDoctorJson" JSONB NOT NULL,
    "redFlagsJson" JSONB NOT NULL,
    "diagramPrompt" TEXT NOT NULL,
    "patientDisclaimer" TEXT NOT NULL,
    "status" "ExplanationStatus" NOT NULL DEFAULT 'ready_for_review',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "GeneratedExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyFinding" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedExplanationId" TEXT NOT NULL,
    "originalReportPhrase" TEXT,
    "medicalTerm" TEXT NOT NULL,
    "plainLanguageExplanation" TEXT NOT NULL,
    "anatomicLocation" TEXT,
    "severityIfStated" TEXT,
    "lateralityIfStated" TEXT,
    "patientRelevance" TEXT,
    "clinicianReviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedExplanationId" TEXT NOT NULL,
    "diagramType" TEXT NOT NULL,
    "diagramPromptDeidentified" TEXT NOT NULL,
    "storageKey" TEXT,
    "altText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicianApproval" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedExplanationId" TEXT NOT NULL,
    "imagingReportId" TEXT NOT NULL,
    "approvedByUserId" TEXT NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL,
    "approvalAttestation" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhysicianApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "Role",
    "eventType" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "patientId" TEXT,
    "imagingReportId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "imagingReportId" TEXT,
    "generatedExplanationId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "inputTokenEstimate" INTEGER NOT NULL,
    "outputTokenEstimate" INTEGER NOT NULL,
    "estimatedCostCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requirePhysicianApproval" BOOLEAN NOT NULL DEFAULT true,
    "allowPdfBeforeApproval" BOOLEAN NOT NULL DEFAULT false,
    "retainDeletedRecordsDays" INTEGER NOT NULL DEFAULT 30,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 15,
    "phiLoggingDisabled" BOOLEAN NOT NULL DEFAULT true,
    "allowPdfUpload" BOOLEAN NOT NULL DEFAULT true,
    "allowImageUpload" BOOLEAN NOT NULL DEFAULT false,
    "allowPatientEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandingSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "logoStorageKey" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "clinicDisplayName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "defaultPdfFooter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionPolicy" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "retainReportsDays" INTEGER NOT NULL DEFAULT 90,
    "retainAuditLogsDays" INTEGER NOT NULL DEFAULT 2190,
    "retainUploadedFilesDays" INTEGER NOT NULL DEFAULT 90,
    "autoArchiveAfterDays" INTEGER NOT NULL DEFAULT 30,
    "secureDeleteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceChecklist" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "hostingBaaConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "databaseBaaConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "aiVendorBaaConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "storageBaaConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "auditLogsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "phiLoggingDisabled" BOOLEAN NOT NULL DEFAULT true,
    "encryptionAtRestConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "tlsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "roleAccessConfigured" BOOLEAN NOT NULL DEFAULT false,
    "retentionPolicyConfigured" BOOLEAN NOT NULL DEFAULT false,
    "incidentResponseContactSet" BOOLEAN NOT NULL DEFAULT false,
    "accessReviewCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastReviewedByUserId" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_clerkUserId_key" ON "UserProfile"("clerkUserId");

-- CreateIndex
CREATE INDEX "UserProfile_organizationId_role_idx" ON "UserProfile"("organizationId", "role");

-- CreateIndex
CREATE INDEX "Patient_organizationId_mrn_idx" ON "Patient"("organizationId", "mrn");

-- CreateIndex
CREATE INDEX "Patient_organizationId_deletedAt_idx" ON "Patient"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "ImagingReport_organizationId_status_idx" ON "ImagingReport"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ImagingReport_organizationId_patientId_idx" ON "ImagingReport"("organizationId", "patientId");

-- CreateIndex
CREATE INDEX "ImagingReport_organizationId_deletedAt_idx" ON "ImagingReport"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "UploadedFile_organizationId_imagingReportId_idx" ON "UploadedFile"("organizationId", "imagingReportId");

-- CreateIndex
CREATE INDEX "GeneratedExplanation_organizationId_imagingReportId_idx" ON "GeneratedExplanation"("organizationId", "imagingReportId");

-- CreateIndex
CREATE INDEX "KeyFinding_organizationId_generatedExplanationId_idx" ON "KeyFinding"("organizationId", "generatedExplanationId");

-- CreateIndex
CREATE UNIQUE INDEX "Diagram_generatedExplanationId_key" ON "Diagram"("generatedExplanationId");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicianApproval_generatedExplanationId_key" ON "PhysicianApproval"("generatedExplanationId");

-- CreateIndex
CREATE INDEX "PhysicianApproval_organizationId_imagingReportId_idx" ON "PhysicianApproval"("organizationId", "imagingReportId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_eventType_idx" ON "AuditLog"("organizationId", "eventType");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_imagingReportId_idx" ON "AuditLog"("organizationId", "imagingReportId");

-- CreateIndex
CREATE INDEX "AIUsageLog_organizationId_createdAt_idx" ON "AIUsageLog"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandingSettings_organizationId_key" ON "BrandingSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionPolicy_organizationId_key" ON "RetentionPolicy"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceChecklist_organizationId_key" ON "ComplianceChecklist"("organizationId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingReport" ADD CONSTRAINT "ImagingReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingReport" ADD CONSTRAINT "ImagingReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingReport" ADD CONSTRAINT "ImagingReport_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_imagingReportId_fkey" FOREIGN KEY ("imagingReportId") REFERENCES "ImagingReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedExplanation" ADD CONSTRAINT "GeneratedExplanation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedExplanation" ADD CONSTRAINT "GeneratedExplanation_imagingReportId_fkey" FOREIGN KEY ("imagingReportId") REFERENCES "ImagingReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedExplanation" ADD CONSTRAINT "GeneratedExplanation_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyFinding" ADD CONSTRAINT "KeyFinding_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyFinding" ADD CONSTRAINT "KeyFinding_generatedExplanationId_fkey" FOREIGN KEY ("generatedExplanationId") REFERENCES "GeneratedExplanation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagram" ADD CONSTRAINT "Diagram_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagram" ADD CONSTRAINT "Diagram_generatedExplanationId_fkey" FOREIGN KEY ("generatedExplanationId") REFERENCES "GeneratedExplanation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianApproval" ADD CONSTRAINT "PhysicianApproval_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianApproval" ADD CONSTRAINT "PhysicianApproval_generatedExplanationId_fkey" FOREIGN KEY ("generatedExplanationId") REFERENCES "GeneratedExplanation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianApproval" ADD CONSTRAINT "PhysicianApproval_imagingReportId_fkey" FOREIGN KEY ("imagingReportId") REFERENCES "ImagingReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicianApproval" ADD CONSTRAINT "PhysicianApproval_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandingSettings" ADD CONSTRAINT "BrandingSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionPolicy" ADD CONSTRAINT "RetentionPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklist" ADD CONSTRAINT "ComplianceChecklist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

