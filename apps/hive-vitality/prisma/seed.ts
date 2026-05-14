import { PrismaClient } from "@prisma/client";
import { createCipheriv, createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

function seedKey() {
  const raw = process.env.APP_ENCRYPTION_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
  return raw.startsWith("base64:") ? Buffer.from(raw.slice(7), "base64") : Buffer.from(raw, "hex");
}

function encryptSeedPHI(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", seedKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "demo-orthopedics" },
    update: {},
    create: {
      name: "Demo Orthopedics",
      slug: "demo-orthopedics",
      baaStatus: "in_review",
      incidentResponseContact: "security@example.invalid",
      settings: { create: {} },
      retentionPolicy: { create: {} },
      brandingSettings: { create: { clinicDisplayName: "Demo Orthopedics" } },
      complianceChecklist: { create: { roleAccessConfigured: true, auditLogsEnabled: true, phiLoggingDisabled: true } }
    }
  });

  const admin = await prisma.userProfile.upsert({
    where: { clerkUserId: "seed-admin" },
    update: {},
    create: { clerkUserId: "seed-admin", organizationId: org.id, email: "admin@example.invalid", firstName: "Avery", lastName: "Admin", role: "admin" }
  });
  const physician = await prisma.userProfile.upsert({
    where: { clerkUserId: "seed-physician" },
    update: {},
    create: { clerkUserId: "seed-physician", organizationId: org.id, email: "physician@example.invalid", firstName: "Morgan", lastName: "Lee", role: "physician" }
  });
  await prisma.userProfile.upsert({
    where: { clerkUserId: "seed-staff" },
    update: {},
    create: { clerkUserId: "seed-staff", organizationId: org.id, email: "staff@example.invalid", firstName: "Sam", lastName: "Staff", role: "staff" }
  });

  const patient = await prisma.patient.create({
    data: { organizationId: org.id, firstName: "Sample", lastName: "Patient", mrn: "DEMO-MRN" }
  });
  const reportText =
    "MRI LUMBAR SPINE WITHOUT CONTRAST. Impression: Mild L4-L5 broad-based disc bulge with mild central canal stenosis and facet arthropathy. No acute fracture.";
  const report = await prisma.imagingReport.create({
    data: {
      organizationId: org.id,
      patientId: patient.id,
      createdByUserId: admin.id,
      examType: "MRI",
      bodyRegion: "Lumbar spine",
      modality: "MRI",
      reportTextEncrypted: encryptSeedPHI(reportText),
      reportTextHash: createHash("sha256").update(reportText).digest("hex"),
      sourceType: "pasted_text",
      status: "ready_for_review",
      safetyFlagLevel: "caution"
    }
  });
  await prisma.generatedExplanation.create({
    data: {
      organizationId: org.id,
      imagingReportId: report.id,
      generatedByUserId: admin.id,
      version: 1,
      patientFriendlyTitle: "Lumbar spine MRI summary",
      plainEnglishSummary: "The report describes mild wear-and-tear changes in the lower back, mainly at L4-L5.",
      questionsForDoctorJson: ["Do these findings match my symptoms?", "What warning symptoms should I watch for?"],
      redFlagsJson: { safety: { flagLevel: "caution", detectedTerms: ["fracture"] } },
      diagramPrompt: "Lumbar spine educational diagram showing L4-L5 mild disc bulge and facet arthropathy.",
      patientDisclaimer: "This is patient education based on a finalized report and requires clinician review.",
      status: "ready_for_review",
      keyFindings: {
        create: [
          {
            organizationId: org.id,
            medicalTerm: "disc bulge",
            plainLanguageExplanation: "A disc is slightly pushing outward.",
            anatomicLocation: "L4-L5",
            severityIfStated: "mild"
          }
        ]
      }
    }
  });
  console.log(`Seeded ${org.name}; physician reviewer ${physician.email}`);
}

main().finally(async () => prisma.$disconnect());
