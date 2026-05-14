# hivePlainscan / HivePlainScanProfessional Source Code

## package.json
```json
{
  "name": "hive-plainscan",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "mammoth": "^1.12.0",
    "next": "^14.2.15",
    "openai": "^4.73.1",
    "pdf-parse": "^2.4.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.17.6",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.15",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}

```

## next.config.mjs
```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth"]
  }
};

export default nextConfig;

```

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

## tailwind.config.ts
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          blue: "#1f6feb",
          navy: "#102a43",
          ink: "#243b53",
          mist: "#eef6ff",
          line: "#d9e8f6",
          calm: "#6b879f",
          mint: "#dff7ed",
          amber: "#fff3d6",
          rose: "#ffe8e8"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(16, 42, 67, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

```

## postcss.config.mjs
```mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;

```

## next-env.d.ts
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

## app\layout.tsx
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hivePlainscan",
  description: "Plain-English imaging report explanations for patients."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

```

## app\globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

html {
  scroll-behavior: smooth;
}

body {
  background: #f8fbff;
  color: #243b53;
}

button,
select,
textarea,
input {
  font: inherit;
}

@media print {
  body {
    background: white;
  }

  .no-print {
    display: none !important;
  }

  .print-page {
    box-shadow: none !important;
    border: 0 !important;
    padding: 0 !important;
  }
}

```

## app\page.tsx
```tsx
"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileSearch,
  FileText,
  FileUp,
  History,
  Hospital,
  LockKeyhole,
  LogIn,
  MessageSquareText,
  PenLine,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import { detectPhi, removePhi } from "@/lib/privacy";
import type { Explanation, KeyFinding, PhiWarning } from "@/lib/types";

type View =
  | "landing"
  | "pricing"
  | "login"
  | "dashboard"
  | "upload"
  | "review"
  | "handout"
  | "audit"
  | "settings";

type ReviewStatus = "Draft" | "Needs Review" | "Approved" | "Sent to Patient" | "Archived";

type ClinicalDraft = {
  id: string;
  status: ReviewStatus;
  patientName: string;
  mrn: string;
  createdAt: string;
  reviewer: string;
  explanation: Explanation;
  diagram: string;
  diagramSource?: "ai-image" | "svg-fallback";
};

type ApiResponse = {
  explanation: Explanation;
  diagramSvg: string;
  diagramSource?: "ai-image" | "svg-fallback";
  source: "ai" | "local-fallback";
};

const roles = ["Admin", "Physician", "Radiologist", "APP", "Nurse", "Medical Assistant", "Front Desk", "Viewer"];
const examTypes = ["Auto-detect", "MRI", "CT", "X-ray", "Ultrasound", "Other"];
const bodyRegions = [
  "Auto-detect",
  "Spine",
  "Cervical Spine",
  "Lumbar Spine",
  "Brain",
  "Shoulder",
  "Knee",
  "Hip",
  "Chest",
  "Abdomen",
  "Pelvis",
  "Other"
];

const safetyTerms = [
  "malignancy",
  "mass",
  "tumor",
  "cancer",
  "metastasis",
  "aneurysm",
  "hemorrhage",
  "stroke",
  "infarct",
  "cord compression",
  "cauda equina",
  "fracture",
  "abscess",
  "osteomyelitis",
  "infection",
  "pulmonary embolism",
  "dissection",
  "critical result",
  "urgent",
  "emergent"
];

const sampleReport = `MRI CERVICAL SPINE WITHOUT CONTRAST
FINDINGS:
C5-C6: Broad based mixed protrusion effaces the ventral thecal sac with slight flattening of the leftward ventral cord. Moderate to severe bilateral foraminal stenosis. Mild central canal stenosis.
C6-C7: Mild posterior disc bulging with uncovertebral joint spurring and facet hypertrophy causing mild bilateral foraminal stenosis.
IMPRESSION:
1. Multilevel degenerative disc and joint disease, greatest at C5-C6.
2. C5-C6 protrusion with slight ventral cord flattening and moderate to severe bilateral foraminal stenosis.
3. Mild bilateral foraminal stenosis at C6-C7.`;

const starterExplanation: Explanation = {
  exam_type: "MRI",
  body_region: "Cervical Spine",
  plain_english_summary:
    "The report describes wear-and-tear changes in the neck, mainly at C5-C6 and C6-C7. The most important area is C5-C6, where the disc pushes backward and narrows spaces around the spinal cord and nerves.",
  key_findings: [
    {
      medical_term: "disc protrusion",
      plain_language_explanation: "A disc is pushing backward more than usual.",
      severity: "moderate",
      body_location: "C5-C6",
      possible_symptoms: "May relate to neck pain or arm symptoms if it matches the exam.",
      doctor_followup: "Does this level match my symptoms and neurologic exam?"
    },
    {
      medical_term: "foraminal stenosis",
      plain_language_explanation: "The openings where nerves exit are narrowed.",
      severity: "severe",
      body_location: "C5-C6",
      possible_symptoms: "Can be associated with arm pain, numbness, or weakness.",
      doctor_followup: "Which nerve roots may be affected?"
    }
  ],
  red_flags: ["The report describes slight flattening of the spinal cord. Clinician review is required before patient release."],
  questions_for_doctor: [
    "Do these findings match my symptoms?",
    "Is there any pressure on the spinal cord or nerves that needs prompt attention?",
    "What symptoms should make me seek urgent care?"
  ],
  image_prompt:
    "Create a cervical spine patient education illustration showing C5-C6 disc protrusion, central canal narrowing, foraminal stenosis, and C6-C7 mild foraminal narrowing.",
  disclaimer:
    "This tool supports patient education and communication. It does not independently diagnose, interpret images, recommend treatment, or replace clinician judgment."
};

const auditSeed = [
  ["08:42", "Olivia Chen, MA", "Uploaded report", "MRI cervical spine report added to draft queue"],
  ["08:43", "HivePlainScanProfessional AI", "Generated draft", "Plain-language explanation and diagram prompt created"],
  ["08:48", "Dr. Shah", "Edited summary", "Reworded cord flattening caution"],
  ["08:52", "Dr. Shah", "Approved", "Patient handout marked approved"],
  ["08:55", "System", "Exported PDF", "PDF handout downloaded for after-visit summary"]
];

function createDraft(explanation: Explanation, diagram: string, diagramSource?: "ai-image" | "svg-fallback"): ClinicalDraft {
  const hasSensitive = urgentFindings(explanation).length > 0;
  return {
    id: `RB-${Math.floor(10000 + Math.random() * 89999)}`,
    status: hasSensitive ? "Needs Review" : "Draft",
    patientName: "Example Patient",
    mrn: "MRN-104582",
    createdAt: new Date().toLocaleString(),
    reviewer: "Unassigned",
    explanation,
    diagram,
    diagramSource
  };
}

function urgentFindings(explanation: Explanation) {
  const text = `${explanation.plain_english_summary} ${explanation.red_flags.join(" ")} ${explanation.key_findings
    .map((finding) => `${finding.medical_term} ${finding.plain_language_explanation} ${finding.doctor_followup || ""}`)
    .join(" ")}`.toLowerCase();
  return safetyTerms.filter((term) => text.includes(term));
}

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [role, setRole] = useState("Physician");
  const [reportText, setReportText] = useState(sampleReport);
  const [examType, setExamType] = useState("Auto-detect");
  const [bodyRegion, setBodyRegion] = useState("Auto-detect");
  const [deidentify, setDeidentify] = useState(true);
  const [deleteAfterGeneration, setDeleteAfterGeneration] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ClinicalDraft>(() => createDraft(starterExplanation, ""));
  const [activeTab, setActiveTab] = useState<"summary" | "findings" | "diagram" | "release">("summary");

  const phiWarnings = useMemo<PhiWarning[]>(() => detectPhi(reportText), [reportText]);
  const flaggedTerms = useMemo(() => urgentFindings(draft.explanation), [draft]);

  async function extractReportFromFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setIsExtracting(true);
    setUploadedFileName("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-report", { method: "POST", body: formData });
      const data = (await res.json()) as { reportText?: string; fileName?: string; error?: string };
      if (!res.ok || !data.reportText) throw new Error(data.error || "Could not extract text from that file.");
      setReportText(data.reportText);
      setUploadedFileName(data.fileName || file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not extract text from that file.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function generateDraft() {
    setIsLoading(true);
    setError("");
    try {
      const text = deidentify ? removePhi(reportText) : reportText;
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText: text, examType, bodyRegion, deleteAfterGeneration })
      });
      const data = (await res.json()) as ApiResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not generate draft.");
      setDraft(createDraft(data.explanation, data.diagramSvg, data.diagramSource));
      if (deleteAfterGeneration) setReportText("");
      setView("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateExplanation(partial: Partial<Explanation>) {
    setDraft((current) => ({
      ...current,
      explanation: { ...current.explanation, ...partial },
      status: current.status === "Approved" ? "Needs Review" : current.status
    }));
  }

  function updateFinding(index: number, partial: Partial<KeyFinding>) {
    setDraft((current) => ({
      ...current,
      explanation: {
        ...current.explanation,
        key_findings: current.explanation.key_findings.map((finding, itemIndex) =>
          itemIndex === index ? { ...finding, ...partial } : finding
        )
      },
      status: current.status === "Approved" ? "Needs Review" : current.status
    }));
  }

  function approveDraft() {
    setDraft((current) => ({ ...current, status: "Approved", reviewer: "Dr. Morgan Lee" }));
    setView("handout");
  }

  return (
    <main className="min-h-screen bg-[#f7faff] text-clinical-ink">
      <TopNav view={view} setView={setView} />
      {view === "landing" && <Landing setView={setView} />}
      {view === "pricing" && <Pricing setView={setView} />}
      {view === "login" && <Login role={role} setRole={setRole} setView={setView} />}
      {view === "dashboard" && (
        <Shell view={view} setView={setView} role={role}>
          <Dashboard draft={draft} setView={setView} />
        </Shell>
      )}
      {view === "upload" && (
        <Shell view={view} setView={setView} role={role}>
          <Upload
            reportText={reportText}
            setReportText={setReportText}
            examType={examType}
            setExamType={setExamType}
            bodyRegion={bodyRegion}
            setBodyRegion={setBodyRegion}
            deidentify={deidentify}
            setDeidentify={setDeidentify}
            deleteAfterGeneration={deleteAfterGeneration}
            setDeleteAfterGeneration={setDeleteAfterGeneration}
            phiWarnings={phiWarnings}
            uploadedFileName={uploadedFileName}
            isExtracting={isExtracting}
            isLoading={isLoading}
            error={error}
            extractReportFromFile={extractReportFromFile}
            generateDraft={generateDraft}
          />
        </Shell>
      )}
      {view === "review" && (
        <Shell view={view} setView={setView} role={role}>
          <Review
            draft={draft}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            updateExplanation={updateExplanation}
            updateFinding={updateFinding}
            approveDraft={approveDraft}
            setView={setView}
            flaggedTerms={flaggedTerms}
          />
        </Shell>
      )}
      {view === "handout" && (
        <Shell view={view} setView={setView} role={role}>
          <Handout draft={draft} setDraft={setDraft} />
        </Shell>
      )}
      {view === "audit" && (
        <Shell view={view} setView={setView} role={role}>
          <AuditLog />
        </Shell>
      )}
      {view === "settings" && (
        <Shell view={view} setView={setView} role={role}>
          <SettingsPage />
        </Shell>
      )}
    </main>
  );
}

function TopNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-clinical-line bg-white/95 backdrop-blur no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <button onClick={() => setView("landing")} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-clinical-blue text-white">
            <Stethoscope size={21} />
          </span>
          <span className="text-left">
            <span className="block text-lg font-bold text-clinical-navy">HivePlainScanProfessional</span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-clinical-calm">
              Clinician-reviewed patient education
            </span>
          </span>
        </button>
        <nav className="hidden items-center gap-2 md:flex">
          <NavButton active={view === "pricing"} onClick={() => setView("pricing")}>
            Pricing
          </NavButton>
          <NavButton active={view === "login"} onClick={() => setView("login")}>
            Login
          </NavButton>
          <button
            onClick={() => setView("login")}
            className="inline-flex items-center gap-2 rounded-md bg-clinical-blue px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Request a demo
            <ArrowRight size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}

function Landing({ setView }: { setView: (view: View) => void }) {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-clinical-line bg-white px-4 py-2 text-sm font-semibold text-clinical-ink shadow-sm">
            <ShieldCheck size={17} className="text-clinical-blue" />
            Not diagnostic AI. Communication support.
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-clinical-navy sm:text-5xl lg:text-6xl">
            Make imaging reports understandable.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-clinical-calm">
            Turn complex finalized imaging reports into clear, visual patient education summaries that clinicians review
            before release.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setView("login")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-clinical-blue px-5 py-3 font-semibold text-white shadow-soft"
            >
              Request a demo
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setView("dashboard")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-clinical-line bg-white px-5 py-3 font-semibold text-clinical-ink"
            >
              View prototype
            </button>
          </div>
        </div>
        <ClinicalPreview />
      </section>
      <section className="border-y border-clinical-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-4">
          <ValueCard icon={<Hospital />} title="Radiology centers" text="Attach reviewed patient-friendly summaries to reports." />
          <ValueCard icon={<Activity />} title="Orthopedic clinics" text="Explain MRI and X-ray findings during visits." />
          <ValueCard icon={<Stethoscope />} title="Neurosurgery" text="Translate spine terminology into visual handouts." />
          <ValueCard icon={<Building2 />} title="Primary care" text="Help patients understand outside imaging reports." />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionHeader
          eyebrow="Workflow"
          title="Upload report -> AI draft -> clinician review -> patient-ready visual summary"
          text="HivePlainScanProfessional is positioned as patient education, report translation, visual explanation, and communication support."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {["Secure ingestion", "AI draft", "Clinician approval", "Portal-ready output"].map((item, index) => (
            <div key={item} className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
              <div className="mb-4 grid h-9 w-9 place-items-center rounded-md bg-clinical-mist font-bold text-clinical-blue">
                {index + 1}
              </div>
              <h3 className="font-bold text-clinical-navy">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-clinical-calm">
                {[
                  "Paste, upload, or integrate finalized report text.",
                  "Generate plain-English education and diagram prompt.",
                  "Edit, remove findings, flag caution, and approve.",
                  "Export PDF, print, or prepare for portal/EHR delivery."
                ][index]}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-clinical-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-200">HIPAA-ready architecture</p>
            <h2 className="mt-3 text-3xl font-bold">Designed for clinical governance.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Role-based access",
              "Audit trails",
              "Tenant separation",
              "No PHI for model training",
              "Configurable retention",
              "SSO/SAML ready",
              "Encrypted storage design",
              "BAA-ready vendor posture"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm">
                <CheckCircle2 size={16} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Pricing({ setView }: { setView: (view: View) => void }) {
  const tiers = [
    ["Starter Clinic", "Small primary care or orthopedic office", "Per provider / month", "Basic review workflow"],
    ["Specialty Practice", "Ortho, spine, neurosurgery groups", "Provider + report volume", "Branding and templates"],
    ["Imaging Center", "Radiology centers and outpatient imaging", "Per report generated", "Report attachment workflow"],
    ["Enterprise", "Hospital or radiology network", "Annual contract", "SSO, integrations, white-label"]
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <SectionHeader
        eyebrow="Pricing"
        title="Clinical pricing placeholders"
        text="Final pricing can be structured around providers, report volume, integrations, and enterprise support."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {tiers.map(([name, text, price, feature]) => (
          <div key={name} className="rounded-lg border border-clinical-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-clinical-navy">{name}</h2>
            <p className="mt-2 min-h-14 text-sm leading-6 text-clinical-calm">{text}</p>
            <p className="mt-5 rounded-md bg-clinical-mist px-3 py-2 text-sm font-bold text-clinical-blue">{price}</p>
            <p className="mt-4 text-sm text-clinical-ink">{feature}</p>
            <button
              onClick={() => setView("login")}
              className="mt-6 w-full rounded-md bg-clinical-blue px-4 py-2 text-sm font-semibold text-white"
            >
              Request quote
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Login({ role, setRole, setView }: { role: string; setRole: (role: string) => void; setView: (view: View) => void }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl grid-cols-1 items-center gap-8 px-5 py-10 md:grid-cols-[1fr_430px]">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-clinical-blue">Secure access mockup</p>
        <h1 className="mt-3 text-4xl font-bold text-clinical-navy">Clinical workspace login</h1>
        <p className="mt-4 max-w-xl leading-7 text-clinical-calm">
          Prototype login for role-based workflows. Production deployment would use Auth.js, Clerk, SSO/SAML, session
          timeout, MFA policy, and tenant-based access control.
        </p>
      </div>
      <div className="rounded-lg border border-clinical-line bg-white p-6 shadow-soft">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-md bg-clinical-blue text-white">
          <LogIn />
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-clinical-navy">Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-md border border-clinical-line px-3 py-3"
          >
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setView("dashboard")}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-clinical-blue px-4 py-3 font-semibold text-white"
        >
          Enter HivePlainScanProfessional
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

function Shell({ children, view, setView, role }: { children: React.ReactNode; view: View; setView: (view: View) => void; role: string }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-lg border border-clinical-line bg-white p-3 shadow-sm">
        {[
          ["dashboard", "Dashboard", Activity],
          ["upload", "Upload report", FileUp],
          ["review", "Clinician review", ClipboardCheck],
          ["handout", "Handout preview", FileText],
          ["audit", "Audit log", History],
          ["settings", "Settings", Settings]
        ].map(([key, label, Icon]) => (
          <button
            key={key as string}
            onClick={() => setView(key as View)}
            className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold ${
              view === key ? "bg-clinical-mist text-clinical-blue" : "text-clinical-ink hover:bg-slate-50"
            }`}
          >
            <Icon size={17} />
            {label as string}
          </button>
        ))}
        <div className="mt-4 rounded-md bg-[#fbfdff] p-3 text-xs leading-5 text-clinical-calm">
          Signed in as <span className="font-bold text-clinical-navy">{role}</span>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}

function Dashboard({ draft, setView }: { draft: ClinicalDraft; setView: (view: View) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Clinic dashboard"
        title="Pending clinical communication work"
        text="Recent reports, clinician review queue, approved patient handouts, and compliance activity."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Pending review" value="12" />
        <Metric label="Approved today" value="28" />
        <Metric label="Portal-ready" value="16" />
        <Metric label="Flagged reports" value="3" urgent />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-clinical-navy">Recent reports</h2>
            <div className="flex items-center gap-2 rounded-md border border-clinical-line px-3 py-2 text-sm text-clinical-calm">
              <Search size={16} />
              Search patient / MRN
            </div>
          </div>
          <ReportRow patient={draft.patientName} modality={draft.explanation.exam_type} region={draft.explanation.body_region} status={draft.status} onClick={() => setView("review")} />
          <ReportRow patient="Maria S." modality="X-ray" region="Knee" status="Approved" onClick={() => setView("handout")} />
          <ReportRow patient="James R." modality="CT" region="Chest" status="Needs Review" onClick={() => setView("review")} />
        </div>
        <div className="rounded-lg border border-amber-200 bg-clinical-amber p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 text-amber-700" />
            <div>
              <h2 className="font-bold text-clinical-navy">Clinician review required</h2>
              <p className="mt-2 text-sm leading-6 text-clinical-ink">
                Reports with urgent, sensitive, cancer-related, neurologic, vascular, infectious, or fracture terms are
                held before patient release.
              </p>
              <button onClick={() => setView("review")} className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-bold">
                Review queue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Upload(props: {
  reportText: string;
  setReportText: (text: string) => void;
  examType: string;
  setExamType: (value: string) => void;
  bodyRegion: string;
  setBodyRegion: (value: string) => void;
  deidentify: boolean;
  setDeidentify: (value: boolean) => void;
  deleteAfterGeneration: boolean;
  setDeleteAfterGeneration: (value: boolean) => void;
  phiWarnings: PhiWarning[];
  uploadedFileName: string;
  isExtracting: boolean;
  isLoading: boolean;
  error: string;
  extractReportFromFile: (file: File | undefined) => void;
  generateDraft: () => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="Secure report ingestion"
        title="Upload finalized report text"
        text="Paste a finalized report, upload PDF/DOCX, or upload a report photo. The platform explains report text only."
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-clinical-line bg-white p-5 shadow-soft">
          <div className="mb-4 rounded-md border border-clinical-line bg-clinical-mist p-4">
            <div className="flex gap-3">
              <LockKeyhole className="mt-0.5 shrink-0 text-clinical-blue" size={20} />
              <p className="text-sm leading-6 text-clinical-ink">
                Minimum necessary data principle. De-identification mode can remove common identifiers before AI
                generation. Production storage would use encrypted object storage and tenant isolation.
              </p>
            </div>
          </div>
          {props.phiWarnings.length > 0 && (
            <div className="mb-4 rounded-md border border-amber-200 bg-clinical-amber p-4 text-sm">
              Possible identifiers detected: {props.phiWarnings.map((warning) => warning.label).join(", ")}.
            </div>
          )}
          <div className="mb-4 rounded-md border border-clinical-line bg-[#fbfdff] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <FileUp className="mt-0.5 shrink-0 text-clinical-blue" size={21} />
                <div>
                  <p className="font-semibold text-clinical-navy">Upload report file or photo</p>
                  <p className="mt-1 text-sm leading-6 text-clinical-calm">
                    PDF, DOCX, JPG, PNG, or WEBP. Photos use vision OCR and require an API key.
                  </p>
                  {props.uploadedFileName && <p className="mt-1 text-sm font-semibold text-clinical-blue">Loaded: {props.uploadedFileName}</p>}
                </div>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-clinical-line bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                {props.isExtracting ? "Extracting..." : "Choose File"}
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={props.isExtracting}
                  onChange={(event) => {
                    props.extractReportFromFile(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>
          <textarea
            value={props.reportText}
            onChange={(event) => props.setReportText(event.target.value)}
            className="min-h-[390px] w-full resize-y rounded-md border border-clinical-line p-4 leading-7 outline-none focus:border-clinical-blue"
          />
          {props.error && <p className="mt-3 text-sm font-semibold text-red-700">{props.error}</p>}
        </section>
        <aside className="rounded-lg border border-clinical-line bg-white p-5 shadow-soft">
          <div className="space-y-4">
            <SelectField label="Exam type" value={props.examType} options={examTypes} onChange={props.setExamType} />
            <SelectField label="Body area" value={props.bodyRegion} options={bodyRegions} onChange={props.setBodyRegion} />
            <Toggle label="De-identification mode" text="Remove common identifiers before AI generation." checked={props.deidentify} onChange={props.setDeidentify} />
            <Toggle
              label="Delete report after generation"
              text="Clears pasted text from the browser after draft creation."
              checked={props.deleteAfterGeneration}
              onChange={props.setDeleteAfterGeneration}
            />
          </div>
          <button
            onClick={props.generateDraft}
            disabled={props.isLoading || props.reportText.trim().length < 20}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-clinical-blue px-5 py-3 font-semibold text-white disabled:bg-slate-300"
          >
            {props.isLoading ? "Generating draft..." : "Generate AI Draft"}
            <Sparkles size={18} />
          </button>
        </aside>
      </div>
    </div>
  );
}

function Review(props: {
  draft: ClinicalDraft;
  activeTab: "summary" | "findings" | "diagram" | "release";
  setActiveTab: (tab: "summary" | "findings" | "diagram" | "release") => void;
  updateExplanation: (partial: Partial<Explanation>) => void;
  updateFinding: (index: number, partial: Partial<KeyFinding>) => void;
  approveDraft: () => void;
  setView: (view: View) => void;
  flaggedTerms: string[];
}) {
  const { draft } = props;
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-clinical-blue">Clinician review editor</p>
            <h1 className="mt-2 text-3xl font-bold text-clinical-navy">{draft.explanation.exam_type} / {draft.explanation.body_region}</h1>
            <p className="mt-2 text-sm text-clinical-calm">
              {draft.patientName} Â· {draft.mrn} Â· {draft.id}
            </p>
          </div>
          <StatusBadge status={draft.status} />
        </div>
        {props.flaggedTerms.length > 0 && (
          <div className="mt-4 rounded-md border border-amber-200 bg-clinical-amber p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" />
              <p className="text-sm leading-6">
                Clinician review required before patient release. Flagged terms: {props.flaggedTerms.join(", ")}.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap gap-2">
          {["summary", "findings", "diagram", "release"].map((tab) => (
            <button
              key={tab}
              onClick={() => props.setActiveTab(tab as "summary" | "findings" | "diagram" | "release")}
              className={`rounded-md px-4 py-2 text-sm font-semibold capitalize ${
                props.activeTab === tab ? "bg-clinical-blue text-white" : "bg-clinical-mist text-clinical-blue"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {props.activeTab === "summary" && (
          <EditorBlock
            label="Plain-English summary"
            value={draft.explanation.plain_english_summary}
            onChange={(value) => props.updateExplanation({ plain_english_summary: value })}
          />
        )}
        {props.activeTab === "findings" && (
          <div className="grid gap-4">
            {draft.explanation.key_findings.map((finding, index) => (
              <div key={`${finding.medical_term}-${index}`} className="rounded-lg border border-clinical-line p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="Report phrase / term" value={finding.medical_term} onChange={(value) => props.updateFinding(index, { medical_term: value })} />
                  <Input label="Location" value={finding.body_location} onChange={(value) => props.updateFinding(index, { body_location: value })} />
                </div>
                <EditorBlock
                  label="Patient-friendly explanation"
                  value={finding.plain_language_explanation}
                  onChange={(value) => props.updateFinding(index, { plain_language_explanation: value })}
                />
              </div>
            ))}
          </div>
        )}
        {props.activeTab === "diagram" && (
          <div>
            <div className="mb-3 rounded-md bg-clinical-mist px-3 py-2 text-sm text-clinical-blue">
              Diagram source: {draft.diagramSource === "ai-image" ? "AI medical illustration" : "structured SVG fallback"}
            </div>
            {draft.diagram ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.diagram} alt="Educational diagram" className="w-full rounded-md border border-clinical-line" />
            ) : (
              <div className="rounded-md border border-dashed border-clinical-line p-8 text-center text-clinical-calm">
                Generate a draft to create a diagram.
              </div>
            )}
            <EditorBlock
              label="Diagram prompt"
              value={draft.explanation.image_prompt}
              onChange={(value) => props.updateExplanation({ image_prompt: value })}
            />
          </div>
        )}
        {props.activeTab === "release" && (
          <div className="grid gap-4 md:grid-cols-3">
            <ActionCard icon={<PenLine />} title="Edit" text="Revise summary, findings, and disclaimers." />
            <ActionCard icon={<BadgeCheck />} title="Approve" text="Mark ready for patient release." />
            <ActionCard icon={<Download />} title="Export" text="Download PDF or prepare portal attachment." />
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={() => props.setView("handout")} className="rounded-md border border-clinical-line bg-white px-4 py-2 font-semibold">
            Preview handout
          </button>
          <button onClick={props.approveDraft} className="rounded-md bg-clinical-blue px-4 py-2 font-semibold text-white">
            Approve final version
          </button>
        </div>
      </div>
    </div>
  );
}

function Handout({ draft, setDraft }: { draft: ClinicalDraft; setDraft: (draft: ClinicalDraft) => void }) {
  function markSent() {
    setDraft({ ...draft, status: "Sent to Patient" });
  }
  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-clinical-blue px-4 py-2 font-semibold text-white">
          <Printer size={17} />
          Download / print PDF
        </button>
        <button onClick={markSent} className="rounded-md border border-clinical-line bg-white px-4 py-2 font-semibold">
          Mark sent to patient
        </button>
      </div>
      <article className="print-page rounded-lg border border-clinical-line bg-white p-7 shadow-soft">
        <div className="mb-6 flex items-start justify-between border-b border-clinical-line pb-5">
          <div>
            <p className="font-bold text-clinical-blue">North Valley Orthopedics</p>
            <h1 className="mt-2 text-3xl font-bold text-clinical-navy">Your imaging report in plain English</h1>
            <p className="mt-2 text-sm text-clinical-calm">
              Date: {new Date().toLocaleDateString()} Â· Exam: {draft.explanation.exam_type} Â· {draft.explanation.body_region}
            </p>
          </div>
          <StatusBadge status={draft.status} />
        </div>
        <p className="text-lg leading-8">{draft.explanation.plain_english_summary}</p>
        {draft.diagram && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.diagram} alt="Educational illustration" className="mt-6 w-full rounded-md border border-clinical-line" />
        )}
        <h2 className="mt-7 text-xl font-bold text-clinical-navy">Key findings</h2>
        <div className="mt-3 grid gap-3">
          {draft.explanation.key_findings.map((finding, index) => (
            <div key={`${finding.medical_term}-${index}`} className="rounded-md border border-clinical-line p-4">
              <p className="font-bold text-clinical-navy">
                {finding.body_location}: {finding.medical_term}
              </p>
              <p className="mt-2 leading-7 text-clinical-ink">{finding.plain_language_explanation}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-7 text-xl font-bold text-clinical-navy">Questions to ask your doctor</h2>
        <ul className="mt-3 grid gap-2">
          {draft.explanation.questions_for_doctor.map((question) => (
            <li key={question} className="rounded-md bg-clinical-mist px-4 py-3">{question}</li>
          ))}
        </ul>
        <div className="mt-7 rounded-md border border-clinical-line bg-[#fbfdff] p-4 text-sm leading-6">
          {draft.explanation.disclaimer}
          <div className="mt-4 border-t border-clinical-line pt-4">Reviewed by: {draft.reviewer || "Clinician"} ____________________</div>
        </div>
      </article>
    </div>
  );
}

function AuditLog() {
  return (
    <div>
      <SectionHeader eyebrow="Audit trail" title="Access and release activity" text="Mock immutable log for upload, generation, review, approval, export, and patient release events." />
      <div className="mt-6 rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
        {auditSeed.map(([time, user, action, note]) => (
          <div key={`${time}-${action}`} className="grid gap-2 border-b border-clinical-line py-4 text-sm last:border-b-0 md:grid-cols-[90px_180px_180px_1fr]">
            <span className="font-bold text-clinical-blue">{time}</span>
            <span>{user}</span>
            <span className="font-semibold text-clinical-navy">{action}</span>
            <span className="text-clinical-calm">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <SectionHeader eyebrow="Organization settings" title="HIPAA-ready controls" text="Prototype controls for enterprise deployment, tenant policy, branding, data retention, and integrations." />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <SettingsCard title="Security" items={["SSO/SAML optional", "Session timeout: 15 minutes", "Encrypted storage design", "Access log export"]} />
        <SettingsCard title="Data policy" items={["Retention: 30/90/365 days", "Delete patient data on request", "No PHI used for model training", "De-identification mode"]} />
        <SettingsCard title="Branding" items={["Clinic logo", "Custom footer", "Reviewed by signature line", "Custom disclaimer"]} />
        <SettingsCard title="Integration-ready" items={["FHIR DiagnosticReport ingestion", "FHIR DocumentReference export", "HL7 ORU future support", "PACS/RIS webhooks"]} />
      </div>
    </div>
  );
}

function ClinicalPreview() {
  return (
    <div className="rounded-lg border border-clinical-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between border-b border-clinical-line pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clinical-calm">Clinical draft</p>
          <h2 className="mt-1 text-2xl font-bold text-clinical-navy">MRI cervical spine</h2>
        </div>
        <StatusBadge status="Needs Review" />
      </div>
      <div className="grid gap-3">
        <PreviewRow icon={<FileSearch size={18} />} title="Report translation" text="Plain-English summary grounded in finalized report text." />
        <PreviewRow icon={<ClipboardCheck size={18} />} title="Clinician review" text="Draft, edit, approve, send, and archive workflow." />
        <PreviewRow icon={<MessageSquareText size={18} />} title="Patient handout" text="PDF-ready visual explanation with questions and disclaimers." />
      </div>
      <div className="mt-5 rounded-md bg-clinical-mist p-4 text-sm leading-6 text-clinical-calm">
        Intended to support patient education and communication. It does not independently diagnose, interpret images,
        recommend treatment, or replace clinician judgment.
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-clinical-blue">{eyebrow}</p>
      <h1 className="mt-2 max-w-4xl text-3xl font-bold text-clinical-navy sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-clinical-calm">{text}</p>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-clinical-navy">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-clinical-line bg-white px-3 py-3">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, text, checked, onChange }: { label: string; text: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-clinical-line bg-[#fbfdff] p-3">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-clinical-blue" />
      <span>
        <span className="block font-semibold text-clinical-navy">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-clinical-calm">{text}</span>
      </span>
    </label>
  );
}

function EditorBlock({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-semibold text-clinical-navy">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 w-full rounded-md border border-clinical-line p-3 leading-6" />
    </label>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-clinical-navy">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-clinical-line px-3 py-2" />
    </label>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, string> = {
    Draft: "bg-slate-100 text-slate-700",
    "Needs Review": "bg-clinical-amber text-amber-800",
    Approved: "bg-clinical-mint text-green-800",
    "Sent to Patient": "bg-clinical-mist text-clinical-blue",
    Archived: "bg-slate-100 text-slate-500"
  };
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[status]}`}>{status}</span>;
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-md px-3 py-2 text-sm font-semibold ${active ? "bg-clinical-mist text-clinical-blue" : "text-clinical-ink"}`}>{children}</button>;
}

function Metric({ label, value, urgent = false }: { label: string; value: string; urgent?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 shadow-sm ${urgent ? "border-amber-200 bg-clinical-amber" : "border-clinical-line bg-white"}`}>
      <p className="text-sm font-semibold text-clinical-calm">{label}</p>
      <p className="mt-2 text-3xl font-bold text-clinical-navy">{value}</p>
    </div>
  );
}

function ReportRow({ patient, modality, region, status, onClick }: { patient: string; modality: string; region: string; status: ReviewStatus; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full gap-3 border-b border-clinical-line py-4 text-left last:border-b-0 md:grid-cols-[1fr_100px_140px_140px]">
      <span className="font-bold text-clinical-navy">{patient}</span>
      <span>{modality}</span>
      <span>{region}</span>
      <StatusBadge status={status} />
    </button>
  );
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="mb-3 text-clinical-blue">{icon}</div>
      <h3 className="font-bold text-clinical-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-clinical-calm">{text}</p>
    </div>
  );
}

function PreviewRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-clinical-line bg-[#fbfdff] p-4">
      <span className="mt-0.5 text-clinical-blue">{icon}</span>
      <div>
        <h3 className="font-bold text-clinical-navy">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-clinical-calm">{text}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-clinical-line p-4">
      <div className="mb-3 text-clinical-blue">{icon}</div>
      <h3 className="font-bold text-clinical-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-clinical-calm">{text}</p>
    </div>
  );
}

function SettingsCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
      <h2 className="font-bold text-clinical-navy">{title}</h2>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-clinical-ink">
            <CheckCircle2 size={16} className="text-clinical-blue" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

```

## app\api\explain\route.ts
```ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildDiagramSvg } from "@/lib/diagram";
import { fallbackExplanation } from "@/lib/fallback";
import { buildMedicalIllustrationPrompt } from "@/lib/image-prompt";
import { removePhi } from "@/lib/privacy";
import type { DiagramSource, ExplainRequest, Explanation } from "@/lib/types";

export const runtime = "nodejs";

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

function repairExplanation(value: Partial<Explanation>, request: ExplainRequest): Explanation {
  const fallback = fallbackExplanation(request.reportText, request.examType, request.bodyRegion);
  return {
    exam_type: value.exam_type || fallback.exam_type,
    body_region: value.body_region || fallback.body_region,
    plain_english_summary: value.plain_english_summary || fallback.plain_english_summary,
    key_findings: Array.isArray(value.key_findings) && value.key_findings.length > 0 ? value.key_findings : fallback.key_findings,
    red_flags: Array.isArray(value.red_flags) ? value.red_flags : fallback.red_flags,
    questions_for_doctor:
      Array.isArray(value.questions_for_doctor) && value.questions_for_doctor.length > 0
        ? value.questions_for_doctor
        : fallback.questions_for_doctor,
    image_prompt: value.image_prompt || fallback.image_prompt,
    disclaimer:
      value.disclaimer ||
      "This is not a diagnostic tool. It explains the written imaging report only and does not replace a physician, radiologist, or clinical evaluation."
  };
}

async function generateIllustration(client: OpenAI, explanation: Explanation) {
  const image = await client.images.generate({
    model: imageModel,
    prompt: buildMedicalIllustrationPrompt(explanation),
    n: 1,
    size: "1536x1024",
    quality: "high",
    output_format: "png",
    background: "opaque"
  });

  const b64 = image.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation did not return image data.");
  return `data:image/png;base64,${b64}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ExplainRequest;
  const cleanedReport = removePhi(body.reportText || "").slice(0, 15000);
  const normalizedBody = {
    ...body,
    examType: body.examType === "Auto-detect" ? "" : body.examType,
    bodyRegion: body.bodyRegion === "Auto-detect" ? "" : body.bodyRegion
  };
  const safeRequest = { ...normalizedBody, reportText: cleanedReport };

  if (!cleanedReport.trim()) {
    return NextResponse.json({ error: "Report text is required." }, { status: 400 });
  }

  let explanation: Explanation;
  let client: OpenAI | null = null;

  if (!process.env.OPENAI_API_KEY) {
    explanation = fallbackExplanation(cleanedReport, normalizedBody.examType, normalizedBody.bodyRegion);
  } else {
    try {
      client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You explain written imaging reports to patients. Do not interpret images. Use calm 6th-8th grade plain English. Preserve uncertainty and medical accuracy. Say 'Your report describes...' instead of 'You have...'. Do not give treatment plans, dosing, or definitive diagnoses. Return only valid JSON matching the requested schema."
          },
          {
            role: "user",
            content: JSON.stringify({
              task:
                "Convert this written imaging report into patient-friendly education. Include urgent red flags only when report language or symptoms warrant it. Explain terms such as stenosis, bulge, herniation, spondylolisthesis, facet arthritis, degenerative changes, foraminal narrowing, nerve root compression, effusion, edema, tear, mass, and nodule when present.",
              schema: {
                exam_type: "",
                body_region: "",
                plain_english_summary: "",
                key_findings: [
                  {
                    medical_term: "",
                    plain_language_explanation: "",
                    severity: "mild/moderate/severe/unspecified",
                    body_location: "",
                    possible_symptoms: "",
                    doctor_followup: ""
                  }
                ],
                red_flags: [],
                questions_for_doctor: [],
                image_prompt: "",
                disclaimer: ""
              },
              selected_exam_type: normalizedBody.examType,
              selected_body_region: normalizedBody.bodyRegion,
              report: cleanedReport
            })
          }
        ],
        temperature: 0.2
      });

      const content = completion.choices[0]?.message.content || "{}";
      explanation = repairExplanation(JSON.parse(content), safeRequest);
    } catch {
      explanation = fallbackExplanation(cleanedReport, normalizedBody.examType, normalizedBody.bodyRegion);
    }
  }

  let diagramImage = buildDiagramSvg(explanation);
  let diagramSource: DiagramSource = "svg-fallback";

  if (client && process.env.DISABLE_IMAGE_GENERATION !== "true") {
    try {
      diagramImage = await generateIllustration(client, explanation);
      diagramSource = "ai-image";
    } catch (error) {
      console.error("Image generation failed; falling back to SVG diagram", error);
    }
  }

  return NextResponse.json({
    explanation,
    diagramSvg: diagramImage,
    diagramSource,
    source: process.env.OPENAI_API_KEY ? "ai" : "local-fallback"
  });
}

```

## app\api\extract-report\route.ts
```ts
import OpenAI from "openai";
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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Photo upload requires OPENAI_API_KEY because the app uses vision OCR for images.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_OCR_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You transcribe medical imaging report photos for patient education. Extract only visible report text. Preserve headings, findings, impression, levels, and measurements. Do not summarize, interpret, diagnose, or add text not visible in the image."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Transcribe the visible text from this photo or screenshot of a radiology report. Return plain text only. If the image is unreadable, say UNREADABLE_IMAGE."
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ]
      }
    ],
    temperature: 0
  });

  return completion.choices[0]?.message.content || "";
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
      const mimeType = imageTypes.has(file.type) ? file.type : fileName.endsWith(".webp") ? "image/webp" : fileName.endsWith(".png") ? "image/png" : "image/jpeg";
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
  } catch (error) {
    console.error("Report extraction failed", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? `Could not extract text from this file: ${error.message}`
            : "Could not extract text from this file. Try a clearer report photo, text-based PDF/DOCX, or paste the report manually."
      },
      { status: 422 }
    );
  }
}

```

## lib\types.ts
```ts
export type Severity = "mild" | "moderate" | "severe" | "unspecified";

export type KeyFinding = {
  medical_term: string;
  plain_language_explanation: string;
  severity: Severity;
  body_location: string;
  possible_symptoms: string;
  doctor_followup: string;
};

export type Explanation = {
  exam_type: string;
  body_region: string;
  plain_english_summary: string;
  key_findings: KeyFinding[];
  red_flags: string[];
  questions_for_doctor: string[];
  image_prompt: string;
  disclaimer: string;
};

export type ExplainRequest = {
  reportText: string;
  examType: string;
  bodyRegion: string;
  deleteAfterGeneration: boolean;
};

export type DiagramSource = "ai-image" | "svg-fallback";

export type PhiWarning = {
  type: "name" | "date" | "mrn" | "phone" | "address";
  label: string;
};

```

## lib\privacy.ts
```ts
import type { PhiWarning } from "./types";

const patterns: Array<{ type: PhiWarning["type"]; label: string; regex: RegExp; replacement: string }> = [
  {
    type: "mrn",
    label: "Possible medical record number",
    regex: /\b(?:MRN|Medical Record(?: Number)?|Record #)\s*[:#]?\s*[A-Z0-9-]{5,}\b/gi,
    replacement: "[removed medical record number]"
  },
  {
    type: "date",
    label: "Possible date of birth or service date",
    regex: /\b(?:DOB|Date of Birth|Birthdate)\s*[:#]?\s*(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[A-Z][a-z]+ \d{1,2},? \d{4})\b/gi,
    replacement: "[removed date]"
  },
  {
    type: "phone",
    label: "Possible phone number",
    regex: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    replacement: "[removed phone number]"
  },
  {
    type: "address",
    label: "Possible street address",
    regex: /\b\d{2,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct)\b/gi,
    replacement: "[removed address]"
  },
  {
    type: "name",
    label: "Possible patient name",
    regex: /\b(?:Patient|Name)\s*[:#]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g,
    replacement: "[removed patient name]"
  }
];

export function detectPhi(text: string): PhiWarning[] {
  const found = patterns.filter((item) => item.regex.test(text));
  return found.map(({ type, label }) => ({ type, label }));
}

export function removePhi(text: string): string {
  return patterns.reduce((cleaned, item) => cleaned.replace(item.regex, item.replacement), text);
}

```

## lib\fallback.ts
```ts
import type { Explanation, KeyFinding, Severity } from "./types";

const glossary = [
  {
    term: "stenosis",
    regex: /\b(?:central canal )?stenosis\b/i,
    plain: "Narrowing of a space where nerves travel.",
    question: "How much narrowing is present, and does it match my symptoms?"
  },
  {
    term: "disc bulge",
    regex: /\b(?:disc bulg(?:e|ing)|disc protrusion|protrusion)\b/i,
    plain: "A spinal disc is pushing outward, often from wear-and-tear changes.",
    question: "Is the disc bulge touching or irritating a nerve?"
  },
  {
    term: "herniation",
    regex: /\bherniat(?:ion|ed)\b/i,
    plain: "Part of a disc has pushed out farther than usual.",
    question: "Is the herniation expected to improve, and what symptoms should I watch for?"
  },
  {
    term: "spondylolisthesis",
    regex: /\bspondylolisthesis\b/i,
    plain: "One spinal bone has slipped slightly compared with the bone next to it.",
    question: "Is the slipping stable, and are follow-up images needed?"
  },
  {
    term: "facet arthritis",
    regex: /\b(?:facet arthropathy|facet arthritis|facet hypertrophy)\b/i,
    plain: "Small joints in the back of the spine show arthritis or wear-and-tear change.",
    question: "Could facet arthritis be contributing to my pain?"
  },
  {
    term: "degenerative changes",
    regex: /\bdegenerative\b/i,
    plain: "Wear-and-tear changes are described in the report.",
    question: "Are these changes typical for my age and history?"
  },
  {
    term: "foraminal narrowing",
    regex: /\bforaminal (?:narrowing|stenosis)\b/i,
    plain: "The opening where a nerve exits is narrowed.",
    question: "Which nerve opening is narrowed, and could that explain symptoms in my arm or leg?"
  },
  {
    term: "nerve root compression",
    regex: /\b(?:nerve root|root) (?:compression|impingement|contact)\b/i,
    plain: "The report describes pressure on or contact with a nerve.",
    question: "Does the nerve finding match my pain, numbness, tingling, or weakness?"
  },
  {
    term: "effusion",
    regex: /\beffusion\b/i,
    plain: "Extra fluid is present in or around a joint or body space.",
    question: "What might be causing the extra fluid?"
  },
  {
    term: "edema",
    regex: /\bedema\b/i,
    plain: "Swelling or extra fluid is seen in the tissue.",
    question: "What does the swelling suggest in my situation?"
  },
  {
    term: "tear",
    regex: /\btear\b/i,
    plain: "A structure such as a tendon, ligament, cartilage, or muscle may be partly or fully torn.",
    question: "Is the tear partial or complete, and what activities should I avoid until follow-up?"
  },
  {
    term: "mass",
    regex: /\bmass\b(?!\s+effect)/i,
    plain: "The report describes an area or growth that needs clinical follow-up.",
    question: "What follow-up testing or specialist visit is recommended?"
  },
  {
    term: "nodule",
    regex: /\bnodule\b/i,
    plain: "A small rounded spot is described in the report.",
    question: "Does this nodule need comparison with older imaging or follow-up imaging?"
  }
];

const urgentTerms = [
  { label: "cord compression or cord flattening", regex: /\b(?:cord compression|cord flattening|flattening .* cord|mass effect .* cord)\b/i },
  { label: "cauda equina", regex: /\bcauda equina\b/i },
  { label: "fracture", regex: /\bfracture\b/i },
  { label: "mass", regex: /\bmass\b(?!\s+effect)/i },
  { label: "aneurysm", regex: /\baneurysm\b/i },
  { label: "bleed", regex: /\b(?:bleed|hemorrhage)\b/i },
  { label: "abscess", regex: /\babscess\b/i },
  { label: "infection", regex: /\binfection\b/i }
];

function inferSeverity(text: string): Severity {
  if (/\bsevere\b/i.test(text)) return "severe";
  if (/\bmoderate\b/i.test(text)) return "moderate";
  if (/\bmild\b/i.test(text)) return "mild";
  return "unspecified";
}

function locationFromText(text: string): string {
  const level = text.match(/\b(?:C|T|L|S)\d(?:[-/](?:C|T|L|S)?\d)?\b/i)?.[0];
  if (level) return level.toUpperCase();
  const side = text.match(/\b(left|right|bilateral|central|midline)\b/i)?.[0];
  return side ? side.toLowerCase() : "Location not clearly stated";
}

function spineSections(text: string) {
  const matches = [...text.matchAll(/\b([CTL]\d(?:[-â€“](?:[CTL])?\d)?)\s*:\s*/gi)];
  return matches.map((match, index) => {
    const start = match.index || 0;
    const next = matches[index + 1]?.index ?? text.length;
    const sectionText = text.slice(start, next).split(/\n(?:Apart\b|IMPRESSION\b|--)/i)[0];
    return {
      level: match[1].replace("â€“", "-").replace(/([CTL])(\d)-(?=\d)/i, "$1$2-$1").toUpperCase(),
      text: sectionText
    };
  });
}

function isNegatedFinding(sectionText: string, term: string) {
  const text = sectionText.replace(/\s+/g, " ").toLowerCase();
  if ((term === "herniation" || term === "disc bulge") && /no disc herniation or bulg(?:e|ing)/i.test(text)) {
    return true;
  }
  if (term === "stenosis" && /no (?:canal or foraminal|central canal|canal) stenosis/i.test(text)) {
    return true;
  }
  if (term === "foraminal narrowing" && /no (?:canal or foraminal|foraminal) stenosis/i.test(text)) {
    return true;
  }
  return false;
}

function sectionFindings(reportText: string): KeyFinding[] {
  const sections = spineSections(reportText);
  if (sections.length < 2) return [];

  return sections.flatMap((section) =>
    glossary
      .filter((item) => item.regex.test(section.text) && !isNegatedFinding(section.text, item.term))
      .slice(0, 4)
      .map((item) => ({
        medical_term: item.term,
        plain_language_explanation: item.plain,
        severity: inferSeverity(section.text),
        body_location: section.level,
        possible_symptoms: "This may or may not cause symptoms. Symptoms depend on location and your exam.",
        doctor_followup: item.question
      }))
  );
}

export function fallbackExplanation(reportText: string, examType: string, bodyRegion: string): Explanation {
  const findingsFromSections = sectionFindings(reportText);
  const findings: KeyFinding[] =
    findingsFromSections.length > 0
      ? findingsFromSections
      : glossary
          .filter((item) => item.regex.test(reportText))
          .slice(0, 7)
          .map((item) => ({
            medical_term: item.term,
            plain_language_explanation: item.plain,
            severity: inferSeverity(reportText),
            body_location: locationFromText(reportText),
            possible_symptoms: "This may or may not cause symptoms. Symptoms depend on location and your exam.",
            doctor_followup: item.question
          }));

  const redFlags = urgentTerms
    .filter((term) => term.regex.test(reportText))
    .map((term) => `The report mentions "${term.label}". Contact your clinician promptly. Seek urgent care now for severe or worsening symptoms.`);

  const safeFindings: KeyFinding[] =
    findings.length > 0
      ? findings
      : [
          {
            medical_term: "No specific glossary term detected",
            plain_language_explanation:
              "The app could not confidently identify a common finding from the report text. Review the exact wording with your clinician.",
            severity: "unspecified",
            body_location: "Not specified",
            possible_symptoms: "Symptoms cannot be estimated from this text alone.",
            doctor_followup: "Can you walk me through the main impression of this report?"
          }
        ];

  return {
    exam_type: examType || "Imaging exam",
    body_region: bodyRegion || "Body area not specified",
    plain_english_summary:
      "Your report describes imaging findings that should be reviewed with the clinician who ordered the test. This explanation summarizes the written report in plain language and does not interpret the images.",
    key_findings: safeFindings,
    red_flags: redFlags,
    questions_for_doctor: [
      "What are the main findings in this report?",
      "Do the findings match my symptoms and physical exam?",
      "Do I need follow-up imaging, a referral, or any activity limits?",
      "What symptoms should make me call you or seek urgent care?"
    ],
    image_prompt: `Create a simple patient education diagram for a ${examType || "medical imaging"} report of the ${bodyRegion || "reported body area"}, highlighting: ${safeFindings
      .map((item) => item.medical_term)
      .join(", ")}.`,
    disclaimer:
      "This is not a diagnostic tool. It explains the written imaging report only and does not replace a physician, radiologist, or clinical evaluation."
  };
}

```

## lib\diagram.ts
```ts
import type { Explanation, KeyFinding } from "./types";

type FindingCard = {
  color: string;
  level: string;
  title: string;
  lines: string[];
  x: number;
  y: number;
  targetX: number;
  targetY: number;
};

const palette = ["#1f7a2d", "#0b61a4", "#7542a8", "#e9650b", "#b83280"];

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function labelLines(text: string, max = 30, limit = 5) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, limit);
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function levelFromFinding(finding: KeyFinding, fallback: string) {
  const combined = `${finding.body_location} ${finding.medical_term} ${finding.plain_language_explanation}`;
  return combined.match(/\b(?:C|T|L|S)\d(?:[-/](?:C|T|L|S)?\d)?\b/i)?.[0].toUpperCase() || fallback;
}

function spineKind(explanation: Explanation) {
  const combined = `${explanation.body_region} ${explanation.exam_type} ${explanation.key_findings
    .map((finding) => `${finding.body_location} ${finding.medical_term} ${finding.plain_language_explanation}`)
    .join(" ")}`;
  if (/\bC\d(?:[-/](?:C)?\d)?\b/i.test(combined) || /cervical/i.test(combined)) return "cervical";
  if (/\bL\d|lumbar/i.test(combined)) return "lumbar";
  return "lumbar";
}

function normalizeLevel(level: string) {
  return level.replace(/([CTL])(\d)-(?=\d)/i, "$1$2-$1").toUpperCase();
}

function findingCards(explanation: Explanation, kind: "cervical" | "lumbar"): FindingCard[] {
  const defaults = kind === "cervical" ? ["C3-C4", "C4-C5", "C5-C6", "C6-C7"] : ["L2-L3", "L3-L4", "L4-L5", "L5-S1"];
  const grouped = new Map<string, KeyFinding[]>();

  for (const finding of explanation.key_findings) {
    const level = normalizeLevel(levelFromFinding(finding, defaults[grouped.size] || "Finding"));
    grouped.set(level, [...(grouped.get(level) || []), finding]);
  }

  const selected = [...grouped.entries()].slice(0, 4);
  return selected.map(([level, findings], index) => {
    const terms = [...new Set(findings.map((finding) => finding.medical_term).filter(Boolean))].slice(0, 4);
    const severe = findings.find((finding) => finding.severity !== "unspecified")?.severity;
    const summary = `${severe ? `${severe} ` : ""}${terms.join(", ") || "reported finding"}`;
    const sideNote = findings
      .map((finding) => finding.plain_language_explanation)
      .find((text) => /cord|canal|foraminal|nerve|facet|disc/i.test(text));
    const yTargets = kind === "cervical" ? [206, 320, 438, 552] : [214, 336, 476, 618];
    return {
      color: palette[index % palette.length],
      level,
      title: summary,
      lines: labelLines(`${summary}. ${sideNote || ""}`, 27, 4),
      x: 48,
      y: 112 + index * 166,
      targetX: 524,
      targetY: yTargets[index] || 438
    };
  });
}

export function buildDiagramSvg(explanation: Explanation): string {
  const region = explanation.body_region.toLowerCase();
  if (region.includes("spine") || region.includes("lumbar") || region.includes("cervical")) {
    return spineDiagram(explanation);
  }
  if (["knee", "shoulder", "hip"].some((part) => region.includes(part))) {
    return jointDiagram(explanation);
  }
  if (["chest", "abdomen", "brain"].some((part) => region.includes(part))) {
    return organDiagram(explanation);
  }
  return generalDiagram(explanation);
}

function footer() {
  return `
    <text x="725" y="1042" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-style="italic" fill="#3f4b5f">
      Educational illustration based on report text - not an actual image and not to scale.
    </text>`;
}

function defs() {
  return `
    <defs>
      <linearGradient id="bone" x1="0" x2="1">
        <stop offset="0" stop-color="#fff7ea"/>
        <stop offset="0.25" stop-color="#efd7b8"/>
        <stop offset="0.62" stop-color="#caa67b"/>
        <stop offset="1" stop-color="#fff1dc"/>
      </linearGradient>
      <radialGradient id="boneCore" cx="50%" cy="45%" r="62%">
        <stop offset="0" stop-color="#f9ecd8"/>
        <stop offset="0.6" stop-color="#d7b58a"/>
        <stop offset="1" stop-color="#9d7b5d"/>
      </radialGradient>
      <linearGradient id="disc" x1="0" x2="1">
        <stop offset="0" stop-color="#e5edf7"/>
        <stop offset="0.35" stop-color="#aebdd2"/>
        <stop offset="0.7" stop-color="#65768e"/>
        <stop offset="1" stop-color="#eef5fd"/>
      </linearGradient>
      <linearGradient id="softTissue" x1="0" x2="1">
        <stop offset="0" stop-color="#f2f0ed"/>
        <stop offset="0.45" stop-color="#cbc8c5"/>
        <stop offset="1" stop-color="#8f949c"/>
      </linearGradient>
      <linearGradient id="nerve" x1="0" x2="1">
        <stop offset="0" stop-color="#fff6a8"/>
        <stop offset="0.5" stop-color="#f2c94c"/>
        <stop offset="1" stop-color="#9b6f0f"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#101828" flood-opacity="0.22"/>
      </filter>
      <pattern id="speckle" width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="4" r="1.3" fill="#a37e52" opacity="0.42"/>
        <circle cx="12" cy="10" r="1" fill="#755739" opacity="0.28"/>
        <circle cx="7" cy="15" r="0.9" fill="#ffffff" opacity="0.55"/>
      </pattern>
      <pattern id="crossHatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
        <path d="M0 11 H22" stroke="#7d684f" stroke-width="1.2" opacity="0.28"/>
        <path d="M0 18 H22" stroke="#ffffff" stroke-width="1" opacity="0.28"/>
      </pattern>
      <pattern id="striations" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
        <path d="M0 8 H18" stroke="#737982" stroke-width="1.2" opacity="0.26"/>
      </pattern>
    </defs>`;
}

function callout(card: FindingCard) {
  const textX = card.x + 20;
  const connectorStartX = card.x < 700 ? card.x + 310 : card.x;
  return `
    <rect x="${card.x}" y="${card.y}" width="320" height="138" rx="12" fill="#ffffff" stroke="${card.color}" stroke-width="3"/>
    <text x="${textX}" y="${card.y + 34}" font-family="Arial, sans-serif" font-size="29" font-weight="800" fill="${card.color}">${escapeXml(card.level)}:</text>
    ${card.lines
      .map(
        (line, lineIndex) =>
          `<text x="${textX}" y="${card.y + 62 + lineIndex * 22}" font-family="Arial, sans-serif" font-size="17" fill="#111827">${escapeXml(line)}</text>`
      )
      .join("")}
    <path d="M${connectorStartX} ${card.y + 72} L${card.targetX} ${card.targetY}" fill="none" stroke="${card.color}" stroke-width="4"/>
    <circle cx="${card.targetX}" cy="${card.targetY}" r="9" fill="${card.color}" stroke="#ffffff" stroke-width="3"/>`;
}

function vertebra(y: number, label: string, scale = 1) {
  const h = 92 * scale;
  return `
    <g filter="url(#softShadow)">
      <path d="M520 ${y} C560 ${y - 16} 644 ${y - 12} 674 ${y + 10} C660 ${y + h} 578 ${y + h + 16} 512 ${y + h - 2} C508 ${y + h - 2} 516 ${y + 10} 520 ${y}Z" fill="url(#bone)" stroke="#775f49" stroke-width="3.5"/>
      <path d="M535 ${y + 12} C572 ${y + 2} 631 ${y + 5} 655 ${y + 21} C642 ${y + h - 14} 580 ${y + h - 6} 530 ${y + h - 14} C526 ${y + h - 14} 531 ${y + 24} 535 ${y + 12}Z" fill="url(#boneCore)" opacity="0.72"/>
      <path d="M535 ${y + 12} C572 ${y + 2} 631 ${y + 5} 655 ${y + 21} C642 ${y + h - 14} 580 ${y + h - 6} 530 ${y + h - 14} C526 ${y + h - 14} 531 ${y + 24} 535 ${y + 12}Z" fill="url(#speckle)" opacity="0.95"/>
      <path d="M538 ${y + 20} C570 ${y + 35} 626 ${y + 20} 652 ${y + 40} M536 ${y + 52} C582 ${y + 36} 620 ${y + 58} 654 ${y + 48} M536 ${y + 74} C584 ${y + 62} 622 ${y + 80} 646 ${y + 66}" fill="none" stroke="#7d684f" stroke-width="1.6" opacity="0.45"/>
      <path d="M535 ${y + 12} C572 ${y + 2} 631 ${y + 5} 655 ${y + 21} C642 ${y + h - 14} 580 ${y + h - 6} 530 ${y + h - 14} C526 ${y + h - 14} 531 ${y + 24} 535 ${y + 12}Z" fill="url(#crossHatch)" opacity="0.45"/>
      <path d="M523 ${y + 4} C562 ${y - 9} 638 ${y - 7} 666 ${y + 13}" fill="none" stroke="#fff8ed" stroke-width="5" opacity="0.72"/>
    </g>
    <text x="452" y="${y + 58}" text-anchor="middle" font-family="Arial, sans-serif" font-size="35" font-weight="800" fill="#08111f">${label}</text>`;
}

function disc(y: number, highlight = false) {
  return `
    <path d="M512 ${y} C552 ${y - 15} 636 ${y - 14} 680 ${y + 2} C674 ${y + 31} 536 ${y + 40} 500 ${y + 17} C502 ${y + 9} 505 ${y + 3} 512 ${y}Z" fill="url(#disc)" stroke="#46566d" stroke-width="3.5"/>
    <path d="M527 ${y + 4} C566 ${y - 5} 625 ${y - 5} 660 ${y + 8}" fill="none" stroke="#f6fbff" stroke-width="4" opacity="0.82"/>
    <path d="M523 ${y + 23} C566 ${y + 34} 623 ${y + 31} 662 ${y + 17}" fill="none" stroke="#3e4f68" stroke-width="2" opacity="0.42"/>
    <path d="M540 ${y + 13} C580 ${y + 5} 621 ${y + 6} 646 ${y + 18}" fill="none" stroke="#cdd9e8" stroke-width="7" opacity="0.7"/>
    ${highlight ? `<path d="M646 ${y + 2} C690 ${y + 8} 707 ${y + 27} 687 ${y + 47}" fill="none" stroke="#cc1f1a" stroke-width="5.5"/>
    <path d="M667 ${y + 15} C684 ${y + 17} 692 ${y + 27} 684 ${y + 36}" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.75"/>` : ""}`;
}

function posteriorElements(y: number) {
  return `
    <path d="M730 ${y + 20} C780 ${y - 18} 838 ${y - 4} 846 ${y + 42} C806 ${y + 36} 782 ${y + 58} 748 ${y + 94}" fill="url(#bone)" stroke="#775f49" stroke-width="3"/>
    <path d="M744 ${y + 102} C792 ${y + 68} 852 ${y + 82} 858 ${y + 130} C816 ${y + 122} 784 ${y + 146} 750 ${y + 182}" fill="url(#bone)" stroke="#775f49" stroke-width="3"/>
    <path d="M778 ${y + 58} C800 ${y + 42} 822 ${y + 42} 836 ${y + 58}" fill="none" stroke="#9bd2f3" stroke-width="8" opacity="0.9"/>
    <path d="M786 ${y + 138} C808 ${y + 122} 832 ${y + 124} 848 ${y + 140}" fill="none" stroke="#9bd2f3" stroke-width="8" opacity="0.9"/>
    <path d="M752 ${y + 28} C778 ${y + 16} 812 ${y + 17} 832 ${y + 36}" fill="none" stroke="#fff7ea" stroke-width="4" opacity="0.62"/>
    <path d="M764 ${y + 112} C792 ${y + 98} 828 ${y + 99} 848 ${y + 121}" fill="none" stroke="#fff7ea" stroke-width="4" opacity="0.62"/>`;
}

function spineDiagram(explanation: Explanation) {
  const kind = spineKind(explanation);
  const cards = findingCards(explanation, kind);
  const titleRegion = kind === "cervical" ? "Cervical Spine" : "Lumbar Spine";
  const levelLabels = kind === "cervical" ? ["C3", "C4", "C5", "C6", "C7"] : ["L2", "L3", "L4", "L5", "S1"];
  const axialLevel = cards[0]?.level || (kind === "cervical" ? "C5-C6" : "L4-L5");
  const body = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1450 1080" role="img" aria-label="${escapeXml(titleRegion)} report findings illustration">
  ${defs()}
  <rect width="1450" height="1080" fill="#ffffff"/>
  <text x="725" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#071126">${escapeXml(titleRegion)} ${escapeXml(explanation.exam_type || "Imaging")} Findings (Sagittal View)</text>

  <path d="M764 72 C830 235 826 420 774 574 C739 677 753 834 822 980" fill="none" stroke="url(#softTissue)" stroke-width="112" opacity="0.75"/>
  <path d="M716 96 C790 256 788 456 728 630 C702 705 721 850 782 970" fill="none" stroke="url(#striations)" stroke-width="88" opacity="0.55"/>
  <path d="M701 84 C727 254 732 432 690 604 C668 700 681 846 724 994" fill="none" stroke="#2e3544" stroke-width="20" opacity="0.75"/>
  <path d="M721 80 C745 254 747 440 704 612 C684 704 698 850 742 996" fill="none" stroke="url(#nerve)" stroke-width="12"/>
  <path d="M723 250 C782 262 805 286 835 316 M713 398 C780 410 812 444 842 474 M705 548 C774 570 812 604 846 632 M716 702 C786 724 814 760 842 790" fill="none" stroke="url(#nerve)" stroke-width="7" stroke-linecap="round"/>

  ${vertebra(76, levelLabels[0])}
  ${disc(183, cards.length > 0)}
  ${vertebra(210, levelLabels[1], 1.08)}
  ${disc(330, cards.length > 1)}
  ${vertebra(358, levelLabels[2], 1.08)}
  ${disc(480, cards.length > 2)}
  ${vertebra(510, levelLabels[3], 1.05)}
  ${disc(625, cards.length > 3)}
  ${vertebra(655, levelLabels[4], 1.18)}
  ${posteriorElements(102)}
  ${posteriorElements(350)}
  <path d="M692 333 C725 370 733 420 710 474" fill="none" stroke="#cc1f1a" stroke-width="5" stroke-dasharray="10 8"/>
  <path d="M698 474 l42 -4 l-28 -26" fill="none" stroke="#cc1f1a" stroke-width="6"/>
  <path d="M698 502 C732 544 739 596 716 654" fill="none" stroke="#cc1f1a" stroke-width="5" stroke-dasharray="10 8"/>
  <path d="M705 652 l42 -5 l-29 -26" fill="none" stroke="#cc1f1a" stroke-width="6"/>
  <ellipse cx="747" cy="644" rx="18" ry="28" fill="#66b8ef" stroke="#12649c" stroke-width="3"/>
  <ellipse cx="772" cy="748" rx="20" ry="30" fill="#66b8ef" stroke="#12649c" stroke-width="3"/>

  ${cards.map(callout).join("")}

  <circle cx="1110" cy="232" r="158" fill="#f8fbff" stroke="#0b4f9f" stroke-width="4"/>
  <ellipse cx="1110" cy="214" rx="118" ry="74" fill="#d9dde5" stroke="#8c96a5" stroke-width="4"/>
  <path d="M1002 278 C1048 232 1168 232 1214 278" fill="none" stroke="#9a7652" stroke-width="28" stroke-linecap="round"/>
  <path d="M1014 276 C1065 308 1155 308 1206 276" fill="none" stroke="#f2ca47" stroke-width="9" stroke-linecap="round"/>
  <circle cx="1110" cy="284" r="28" fill="#111827"/>
  <path d="M1094 284 C1110 268 1126 268 1142 284" fill="none" stroke="#ffffff" stroke-width="5"/>
  <text x="1110" y="94" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#0b4f9f">${escapeXml(axialLevel)} Axial View (from above)</text>
  <line x1="1210" y1="190" x2="1305" y2="142" stroke="#111827" stroke-width="2.5"/>
  <text x="1312" y="148" font-family="Arial, sans-serif" font-size="18" fill="#111827">Broad-based</text>
  <text x="1312" y="170" font-family="Arial, sans-serif" font-size="18" fill="#111827">disc bulge</text>
  <line x1="1136" y1="283" x2="1305" y2="262" stroke="#111827" stroke-width="2.5"/>
  <text x="1312" y="264" font-family="Arial, sans-serif" font-size="18" fill="#111827">Central canal</text>
  <text x="1312" y="286" font-family="Arial, sans-serif" font-size="18" fill="#111827">narrowing</text>

  <text x="1180" y="446" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="800" fill="#0b4f9f">${escapeXml(axialLevel)} Facet / Joint Detail</text>
  <rect x="982" y="472" width="386" height="170" rx="13" fill="#ffffff" stroke="#0b61a4" stroke-width="3"/>
  <line x1="1175" y1="472" x2="1175" y2="642" stroke="#0b61a4" stroke-width="2"/>
  <text x="1078" y="498" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#111827">Left facet</text>
  <text x="1272" y="498" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#111827">Right facet</text>
  <path d="M1028 602 C1070 526 1130 526 1152 604" fill="none" stroke="#9a7652" stroke-width="24" stroke-linecap="round"/>
  <path d="M1217 602 C1258 536 1315 536 1340 604" fill="none" stroke="#9a7652" stroke-width="22" stroke-linecap="round"/>
  <path d="M1062 594 C1086 558 1120 558 1136 596" fill="none" stroke="#4aa8e8" stroke-width="8"/>
  <path d="M1252 594 C1274 564 1310 564 1324 596" fill="none" stroke="#4aa8e8" stroke-width="8"/>

  <rect x="52" y="836" width="262" height="166" rx="12" fill="#ffffff" stroke="#9aa4b2" stroke-width="2"/>
  <text x="72" y="864" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#111827">Anatomy Key</text>
  <rect x="72" y="882" width="30" height="20" fill="url(#bone)" stroke="#8d765d"/>
  <text x="114" y="899" font-family="Arial, sans-serif" font-size="16" fill="#111827">Vertebral body (bone)</text>
  <rect x="72" y="912" width="30" height="20" fill="url(#disc)" stroke="#58677d"/>
  <text x="114" y="929" font-family="Arial, sans-serif" font-size="16" fill="#111827">Intervertebral disc</text>
  <rect x="72" y="942" width="30" height="20" fill="#f7d34d" stroke="#9b7b14"/>
  <text x="114" y="959" font-family="Arial, sans-serif" font-size="16" fill="#111827">Nerve roots / canal</text>
  <rect x="72" y="972" width="30" height="20" fill="#66b8ef" stroke="#12649c"/>
  <text x="114" y="989" font-family="Arial, sans-serif" font-size="16" fill="#111827">Fluid or highlighted finding</text>

  <rect x="858" y="666" width="182" height="126" rx="12" fill="#ffffff" stroke="#9aa4b2" stroke-width="2"/>
  <path d="M880 694 h32" stroke="#cc1f1a" stroke-width="4"/>
  <path d="M912 694 l-13 -8 l3 16 z" fill="#cc1f1a"/>
  <text x="930" y="700" font-family="Arial, sans-serif" font-size="15" fill="#111827">Forward slip</text>
  <ellipse cx="896" cy="730" rx="12" ry="8" fill="#66b8ef" stroke="#12649c" stroke-width="2"/>
  <text x="930" y="736" font-family="Arial, sans-serif" font-size="15" fill="#111827">Facet fluid</text>
  <rect x="884" y="758" width="24" height="14" fill="url(#disc)" stroke="#58677d"/>
  <text x="930" y="772" font-family="Arial, sans-serif" font-size="15" fill="#111827">Disc bulge</text>

  ${footer()}
</svg>`;
  return encodeSvg(body);
}

function simpleShell(title: string, anatomy: string, explanation: Explanation) {
  const findings = explanation.key_findings.slice(0, 4);
  const body = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1450 900" role="img" aria-label="${escapeXml(title)}">
  ${defs()}
  <rect width="1450" height="900" fill="#ffffff"/>
  <text x="725" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#071126">${escapeXml(title)}</text>
  ${anatomy}
  ${findings
    .map((finding, index) => {
      const x = index % 2 === 0 ? 74 : 1068;
      const y = 126 + Math.floor(index / 2) * 210;
      const color = palette[index % palette.length];
      return `
        <rect x="${x}" y="${y}" width="310" height="156" rx="14" fill="#ffffff" stroke="${color}" stroke-width="3"/>
        <text x="${x + 22}" y="${y + 38}" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="${color}">${escapeXml(finding.medical_term || "Finding")}</text>
        ${labelLines(finding.plain_language_explanation, 32, 4)
          .map((line, lineIndex) => `<text x="${x + 22}" y="${y + 72 + lineIndex * 24}" font-family="Arial, sans-serif" font-size="19" fill="#111827">${escapeXml(line)}</text>`)
          .join("")}
        <path d="M${x < 500 ? x + 310 : x} ${y + 78} L725 ${330 + index * 35}" stroke="${color}" stroke-width="4" fill="none"/>`;
    })
    .join("")}
  ${footer().replace("1042", "862")}
</svg>`;
  return encodeSvg(body);
}

function jointDiagram(explanation: Explanation) {
  const anatomy = `
    <circle cx="725" cy="430" r="230" fill="#f8fbff" stroke="#0b61a4" stroke-width="4"/>
    <path d="M570 360 C630 270 810 270 880 360" fill="none" stroke="url(#bone)" stroke-width="58" stroke-linecap="round"/>
    <path d="M570 515 C640 610 812 610 882 515" fill="none" stroke="url(#bone)" stroke-width="58" stroke-linecap="round"/>
    <path d="M620 434 C676 380 776 380 832 434 C782 492 674 492 620 434Z" fill="url(#disc)" stroke="#58677d" stroke-width="5"/>
    <circle cx="825" cy="430" r="34" fill="#fff3d6" stroke="#e9650b" stroke-width="6"/>
    <text x="725" y="710" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#3f4b5f">Simplified joint diagram with report findings highlighted</text>`;
  return simpleShell("Joint Imaging Findings", anatomy, explanation);
}

function organDiagram(explanation: Explanation) {
  const anatomy = `
    <path d="M640 170 C520 250 520 540 680 628 C802 694 976 630 1015 472 C1058 298 918 116 742 118 C704 118 670 136 640 170Z" fill="#eef6ff" stroke="#0b61a4" stroke-width="5"/>
    <path d="M748 174 C856 256 884 430 820 558" fill="none" stroke="#6b879f" stroke-width="28" stroke-linecap="round"/>
    <circle cx="820" cy="420" r="46" fill="#fff3d6" stroke="#e9650b" stroke-width="7"/>
    <text x="770" y="710" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#3f4b5f">Simplified organ-region map, not an anatomical diagnosis</text>`;
  return simpleShell("Body Region Imaging Findings", anatomy, explanation);
}

function generalDiagram(explanation: Explanation) {
  const anatomy = `
    <rect x="572" y="170" width="310" height="420" rx="50" fill="#eef6ff" stroke="#0b61a4" stroke-width="5"/>
    <circle cx="727" cy="285" r="76" fill="#ffffff" stroke="#6b879f" stroke-width="8"/>
    <path d="M610 538 C642 440 812 440 844 538" fill="#ffffff" stroke="#6b879f" stroke-width="8"/>
    <circle cx="812" cy="408" r="36" fill="#fff3d6" stroke="#e9650b" stroke-width="7"/>
    <text x="727" y="682" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#3f4b5f">General educational map based on the report text</text>`;
  return simpleShell("Educational Imaging Findings", anatomy, explanation);
}

```

## lib\image-prompt.ts
```ts
import type { Explanation } from "./types";

function spineRegion(explanation: Explanation) {
  const combined = `${explanation.body_region} ${explanation.key_findings
    .map((finding) => `${finding.body_location} ${finding.medical_term} ${finding.plain_language_explanation}`)
    .join(" ")}`;
  if (/\bC\d|cervical/i.test(combined)) return "cervical spine";
  if (/\bL\d|lumbar/i.test(combined)) return "lumbar spine";
  if (/\bT\d|thoracic/i.test(combined)) return "thoracic spine";
  return explanation.body_region || "reported anatomy";
}

export function buildMedicalIllustrationPrompt(explanation: Explanation) {
  const findings = explanation.key_findings
    .slice(0, 6)
    .map(
      (finding) =>
        `${finding.body_location || "unspecified location"}: ${finding.severity !== "unspecified" ? `${finding.severity} ` : ""}${finding.medical_term} - ${finding.plain_language_explanation}`
    )
    .join("\n");

  return `Create a polished patient-education medical illustration plate for the ${spineRegion(explanation)}.

Visual quality target:
- High-end medical atlas illustration, hand-painted anatomical realism, warm bone tones, blue-gray intervertebral discs, yellow nerve roots, crisp black leader lines, clean white background.
- Similar level of anatomical polish to a professional medical textbook illustration, but do not copy any named artist's exact style.
- Landscape infographic composition, suitable for a patient handout.

Content:
- Main large sagittal anatomy view showing the relevant spine region and levels.
- Add a smaller axial inset at the most important level.
- Add a small comparison/detail inset if relevant, such as facet joint narrowing, disc bulge, foraminal narrowing, or canal narrowing.
- Use calm color-coded callout boxes for key levels and findings.
- Keep text short and legible. Avoid dense paragraphs.
- Include an anatomy key with bone, disc, nerve/canal, and highlighted finding.

Report-derived findings:
${findings || "No specific findings were extracted."}

Safety and accuracy constraints:
- This is an educational illustration based only on written report text.
- Do not depict this as an actual MRI, CT, X-ray, or ultrasound.
- Do not invent extra diagnoses beyond the listed findings.
- Include this exact note at the bottom: "Educational illustration based on report text - not an actual image and not to scale."`;
}

```

