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

type ReviewStatus =
  | "Draft"
  | "Ready for Physician Review"
  | "Approved"
  | "Sent to Patient"
  | "Needs Revision"
  | "Archived";

type ClinicalDraft = {
  id: string;
  status: ReviewStatus;
  patientName: string;
  mrn: string;
  createdAt: string;
  reviewer: string;
  approvedAt?: string;
  originalReport: string;
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
  ["08:43", "ReportBridge AI", "Generated draft", "Plain-language explanation and diagram prompt created"],
  ["08:48", "Dr. Shah", "Edited summary", "Reworded cord flattening caution"],
  ["08:52", "Dr. Shah", "Approved", "Patient handout marked approved"],
  ["08:55", "System", "Exported PDF", "PDF handout downloaded for after-visit summary"]
];

function createDraft(
  explanation: Explanation,
  diagram: string,
  diagramSource?: "ai-image" | "svg-fallback",
  originalReport = sampleReport
): ClinicalDraft {
  return {
    id: `RB-${Math.floor(10000 + Math.random() * 89999)}`,
    status: "Ready for Physician Review",
    patientName: "Example Patient",
    mrn: "MRN-104582",
    createdAt: new Date().toLocaleString(),
    reviewer: "Unassigned",
    originalReport,
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
  const [approvalChecked, setApprovalChecked] = useState(false);

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
      setDraft(createDraft(data.explanation, data.diagramSvg, data.diagramSource, reportText));
      setApprovalChecked(false);
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
      status: current.status === "Approved" ? "Ready for Physician Review" : current.status,
      approvedAt: current.status === "Approved" ? undefined : current.approvedAt
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
      status: current.status === "Approved" ? "Ready for Physician Review" : current.status,
      approvedAt: current.status === "Approved" ? undefined : current.approvedAt
    }));
  }

  function approveDraft() {
    if (!approvalChecked) return;
    setDraft((current) => ({
      ...current,
      status: "Approved",
      reviewer: "Dr. Morgan Lee",
      approvedAt: new Date().toLocaleString()
    }));
    setView("handout");
  }

  function sendBack() {
    setDraft((current) => ({ ...current, status: "Needs Revision", reviewer: "Dr. Morgan Lee" }));
    setApprovalChecked(false);
    setView("dashboard");
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
            updateExplanation={updateExplanation}
            updateFinding={updateFinding}
            approveDraft={approveDraft}
            sendBack={sendBack}
            approvalChecked={approvalChecked}
            setApprovalChecked={setApprovalChecked}
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
            <span className="block text-lg font-bold text-clinical-navy">ReportBridge Clinical</span>
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
            Clinician-approved visual explanations for imaging reports.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-clinical-calm">
            ReportBridge turns finalized radiology reports into patient-friendly education summaries with physician
            approval, audit logs, and HIPAA-ready safeguards.
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
          text="ReportBridge is positioned as patient education, report translation, visual explanation, and communication support."
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
    ["Starter Clinic", "Small primary care or orthopedic office", "$499/month", "Basic review workflow"],
    ["Specialty Practice", "Ortho, spine, neurosurgery groups", "$1,250/month", "Branding and templates"],
    ["Imaging Center", "Radiology centers and outpatient imaging", "Starting at $3,000/month", "Report attachment workflow"],
    ["Enterprise", "Hospital or radiology network", "Custom", "SSO, integrations, white-label"]
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
          Enter ReportBridge
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
          <ReportRow patient="James R." modality="CT" region="Chest" status="Ready for Physician Review" onClick={() => setView("review")} />
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
  updateExplanation: (partial: Partial<Explanation>) => void;
  updateFinding: (index: number, partial: Partial<KeyFinding>) => void;
  approveDraft: () => void;
  sendBack: () => void;
  approvalChecked: boolean;
  setApprovalChecked: (checked: boolean) => void;
  setView: (view: View) => void;
  flaggedTerms: string[];
}) {
  const { draft } = props;
  const isApproved = draft.status === "Approved" || draft.status === "Sent to Patient";
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-clinical-blue">One-screen physician approval</p>
            <h1 className="mt-2 text-3xl font-bold text-clinical-navy">
              {draft.explanation.patient_friendly_title || `${draft.explanation.exam_type} / ${draft.explanation.body_region}`}
            </h1>
            <p className="mt-2 text-sm text-clinical-calm">
              {draft.patientName} | {draft.mrn} | {draft.id}
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

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-clinical-navy">Original radiology report</h2>
            <span className="rounded-full bg-clinical-mist px-3 py-1 text-xs font-bold text-clinical-blue">Finalized report text</span>
          </div>
          <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-md border border-clinical-line bg-[#fbfdff] p-4 text-sm leading-6 text-clinical-ink">
            {draft.originalReport || "Original report text is not available for this sample draft."}
          </pre>
        </section>

        <section className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-clinical-navy">Patient-friendly explanation</h2>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Physician review required</span>
          </div>
          <EditorBlock
            label="Plain-English summary"
            value={draft.explanation.plain_english_summary}
            onChange={(value) => props.updateExplanation({ plain_english_summary: value })}
          />
          <div className="mt-5 grid gap-3">
            {draft.explanation.key_findings.map((finding, index) => (
              <div key={`${finding.medical_term}-${index}`} className="rounded-lg border border-clinical-line bg-[#fbfdff] p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="Finding / term"
                    value={finding.medical_term}
                    onChange={(value) => props.updateFinding(index, { medical_term: value })}
                  />
                  <Input
                    label="Location"
                    value={finding.body_location || finding.anatomic_location || ""}
                    onChange={(value) => props.updateFinding(index, { body_location: value, anatomic_location: value })}
                  />
                </div>
                <EditorBlock
                  label="Patient explanation"
                  value={finding.plain_language_explanation}
                  onChange={(value) => props.updateFinding(index, { plain_language_explanation: value })}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-clinical-navy">Diagram preview</h2>
            <p className="mt-1 text-sm text-clinical-calm">
              Educational illustration based on the finalized report text. Not the actual imaging study. Not to scale.
            </p>
          </div>
          <span className="rounded-full bg-clinical-mist px-3 py-1 text-xs font-bold text-clinical-blue">
            {draft.diagramSource === "ai-image" ? "Approved image provider" : "structured SVG template"}
          </span>
        </div>
        {draft.diagram ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.diagram} alt="Educational diagram" className="w-full rounded-md border border-clinical-line" />
        ) : (
          <div className="rounded-md border border-dashed border-clinical-line p-8 text-center text-clinical-calm">
            Generate a draft to create a diagram.
          </div>
        )}
      </section>

      <section className="rounded-lg border border-clinical-line bg-white p-5 shadow-sm">
        <label className="flex items-start gap-3 rounded-md border border-clinical-line bg-[#fbfdff] p-4">
          <input
            type="checkbox"
            checked={props.approvalChecked}
            disabled={isApproved}
            onChange={(event) => props.setApprovalChecked(event.target.checked)}
            className="mt-1 h-5 w-5 accent-clinical-blue"
          />
          <span className="leading-6">
            <span className="block font-bold text-clinical-navy">
              I reviewed this patient education summary and approve it for release.
            </span>
            <span className="block text-sm text-clinical-calm">
              By approving, you confirm that you have reviewed this patient education summary for release to the patient.
            </span>
          </span>
        </label>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            onClick={props.approveDraft}
            disabled={!props.approvalChecked || isApproved}
            className="rounded-md bg-clinical-blue px-5 py-4 text-lg font-bold text-white disabled:bg-slate-300"
          >
            Approve
          </button>
          <button
            onClick={props.approveDraft}
            disabled={!props.approvalChecked || isApproved}
            className="rounded-md border border-clinical-blue bg-white px-5 py-4 text-lg font-bold text-clinical-blue disabled:border-slate-200 disabled:text-slate-400"
          >
            Edit & Approve
          </button>
          <button
            onClick={props.sendBack}
            disabled={isApproved}
            className="rounded-md border border-clinical-line bg-white px-5 py-4 text-lg font-bold text-clinical-navy disabled:text-slate-400"
          >
            Send Back
          </button>
        </div>
        {draft.approvedAt && (
          <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            Approved by {draft.reviewer} on {draft.approvedAt}.
          </p>
        )}
      </section>
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
      <SectionHeader
        eyebrow="Compliance Readiness"
        title="HIPAA workflow controls"
        text="Readiness checklist for BAA-backed vendors, tenant policy, branding, data retention, PHI logging controls, and integrations. This does not certify compliance by itself."
      />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <SettingsCard title="BAA / vendor checklist" items={["BAA required with hosting provider", "BAA required with AI provider", "BAA required with storage provider", "Incident response contact configured"]} />
        <SettingsCard title="Security" items={["Encryption enabled", "Audit logs enabled", "User roles configured", "Session timeout enabled"]} />
        <SettingsCard title="Data policy" items={["Retention policy configured", "Delete patient data on request", "PHI logging disabled", "Minimum necessary fields"]} />
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
        <StatusBadge status="Ready for Physician Review" />
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
    "Ready for Physician Review": "bg-clinical-amber text-amber-800",
    Approved: "bg-clinical-mint text-green-800",
    "Sent to Patient": "bg-clinical-mist text-clinical-blue",
    "Needs Revision": "bg-red-50 text-red-700",
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

