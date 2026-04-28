// Phase 3 migration + seed for HiveIMR.
// Idempotent: schema + tables created IF NOT EXISTS; seed skipped if patients already present.
// Run: node --env-file=.env.local scripts/migrate.mjs

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);

const PATIENTS = [
  {
    id: "PT-001", name: "Marcus Chen", age: 67, dob: "03/14/1957", mrn: "4421-887", location: "ED Bay 4", ctx: "ed",
    cc: "Chest pain, diaphoresis × 90 min", attending: "Dr. Sarah Kim, MD", dea: "BS1234563",
    allergies: [{ drug: "Penicillin", reaction: "Anaphylaxis", severity: "severe" }, { drug: "Sulfa", reaction: "Rash", severity: "moderate" }],
    code: "Full Code", weight: "82 kg", insurance: "BlueCross PPO · ID 887441223",
    problems: [{ name: "Anterior STEMI", sev: "critical", active: true, icd: "I21.09" }, { name: "Hypertension", sev: "chronic", active: true, icd: "I10" }, { name: "T2DM", sev: "chronic", active: true, icd: "E11.9" }],
    vitals: { bp: "158/94", hr: "108", rr: "22", spo2: "94%", temp: "37.1°C", ts: "14:32" },
    labs: [
      { id: "l1", name: "Troponin I", val: "4.82", unit: "ng/mL", ref: "<0.04", flag: "H", ts: "14:15", source: "inhouse", status: "resulted", ack: false },
      { id: "l2", name: "BNP", val: "812", unit: "pg/mL", ref: "<100", flag: "H", ts: "14:15", source: "inhouse", status: "resulted", ack: true },
      { id: "l3", name: "K+", val: "3.2", unit: "mEq/L", ref: "3.5–5.0", flag: "L", ts: "14:15", source: "inhouse", status: "resulted", ack: false },
      { id: "l4", name: "Creatinine", val: "1.4", unit: "mg/dL", ref: "0.6–1.2", flag: "H", ts: "14:15", source: "inhouse", status: "resulted", ack: true },
      { id: "l5", name: "POC Glucose", val: "182", unit: "mg/dL", ref: "70–100", flag: "H", ts: "14:05", source: "poc", status: "resulted", ack: true },
    ],
    meds: [
      { id: "m1", name: "Aspirin 325 mg PO", given: "14:20", status: "given", rxId: "RX-4421-001" },
      { id: "m2", name: "Heparin infusion IV — ACS protocol", given: "14:25", status: "active", rxId: "RX-4421-002" },
      { id: "m3", name: "Nitroglycerin 0.4 mg SL", given: "14:18", status: "given", rxId: "RX-4421-003" },
      { id: "m4", name: "Metoprolol 5 mg IV", given: "—", status: "pending", rxId: "RX-4421-004" },
    ],
    orders: [
      { id: "o1", name: "Stat ECG", cat: "procedure", status: "complete", ts: "14:10", priority: "stat", owner: "Dr. Kim" },
      { id: "o2", name: "Cardiology Consult — STAT", cat: "consults", status: "pending", ts: "14:22", priority: "stat", owner: "Dr. Kim" },
      { id: "o3", name: "Cath lab activation", cat: "procedure", status: "active", ts: "14:30", priority: "stat", owner: "Dr. Kim" },
      { id: "o4", name: "CXR Portable", cat: "imaging", status: "ordered", ts: "14:20", priority: "stat", owner: "Dr. Kim" },
      { id: "o5", name: "Troponin I — STAT", cat: "labs_inhouse", status: "resulted", ts: "14:00", priority: "stat", owner: "Dr. Kim" },
      { id: "o6", name: "CMP", cat: "labs_inhouse", status: "resulted", ts: "14:00", priority: "stat", owner: "Dr. Kim" },
    ],
    imaging: [
      { type: "ECG", desc: "ST elevation V1–V4. Anterior STEMI.", ts: "14:12", flag: "critical", state: "final", ack: true },
      { type: "CXR Portable", desc: "Pending read", ts: "14:20", flag: "pending", state: "ordered", ack: false },
    ],
    notes: [{ author: "Dr. Kim", type: "ED Attending Note", ts: "14:35", text: "67M presenting with 90 minutes of crushing substernal chest pain. ECG consistent with anterior STEMI. Cath lab activated. Hemodynamically stable. Cardiology en route." }],
    changed: ["Troponin I critical — 4.82 ng/mL", "Cath lab activated 14:30", "K+ 3.2 — repletion ordered"],
    unacknowledged: ["Troponin I — 4.82 critical", "K+ 3.2 low"],
    tasks: [{ id: "a", label: "Confirm consent signed", owner: "Dr. Kim", priority: "urgent" }, { id: "b", label: "ICU bed request", owner: "Case Mgmt", priority: "urgent" }, { id: "c", label: "K+ repletion — hang KCl 40 mEq", owner: "Nurse", priority: "high" }],
    handoff: { one_liner: "67M w/ anterior STEMI, troponin 4.82, cath lab activated.", watch: ["BP — hold nitro if SBP <90", "K+ 3.2 — repletion ordered"], pending: ["Cardiology ETA 15 min", "CXR result"], todo: ["Confirm consent", "ICU bed"] },
    um: { payer: "BlueCross PPO", loc: "ICU", met: ["STEMI", "Cath lab activation", "Troponin >10× ULN"], missing: ["Cardiology attestation", "Signed consent"], status: "Approved — conditional", statusOk: true },
    preferredPharmacy: "cvs_main",
  },
  {
    id: "PT-002", name: "Dorothy Okafor", age: 74, dob: "08/22/1950", mrn: "3389-221", location: "4 West · Rm 412", ctx: "inpatient",
    cc: "Acute on chronic CHF exacerbation", attending: "Dr. James Walters, MD", dea: "BW9876541",
    allergies: [{ drug: "Lisinopril", reaction: "Cough", severity: "moderate" }, { drug: "Contrast dye", reaction: "Urticaria", severity: "moderate" }],
    code: "DNR / DNI", weight: "94 kg", insurance: "Medicare Advantage · ID 3389-221-MA",
    problems: [{ name: "CHF, HFrEF — EF 30%", sev: "critical", active: true, icd: "I50.20" }, { name: "CKD Stage 3b", sev: "chronic", active: true, icd: "N18.32" }, { name: "Atrial fibrillation", sev: "chronic", active: true, icd: "I48.91" }, { name: "T2DM", sev: "chronic", active: true, icd: "E11.9" }],
    vitals: { bp: "142/88", hr: "92", rr: "18", spo2: "91%", temp: "36.8°C", ts: "13:00" },
    labs: [
      { id: "l1", name: "BNP", val: "2,240", unit: "pg/mL", ref: "<100", flag: "H", ts: "07:00", source: "inhouse", status: "resulted", ack: true },
      { id: "l2", name: "Creatinine", val: "2.1", unit: "mg/dL", ref: "0.6–1.2", flag: "H", ts: "07:00", source: "inhouse", status: "resulted", ack: true },
      { id: "l3", name: "Na+", val: "131", unit: "mEq/L", ref: "136–145", flag: "L", ts: "07:00", source: "inhouse", status: "resulted", ack: false },
      { id: "l4", name: "INR", val: "2.8", unit: "", ref: "2.0–3.0", flag: "N", ts: "07:00", source: "inhouse", status: "resulted", ack: true },
      { id: "l5", name: "Lipid Panel", val: "Pending", unit: "", ref: "", flag: "N", ts: "—", source: "outside", lab: "LabCorp", status: "pending", ack: false },
    ],
    meds: [
      { id: "m1", name: "Furosemide 80 mg IV BID", given: "08:00", status: "given", rxId: "RX-3389-001" },
      { id: "m2", name: "Warfarin 5 mg PO QHS", given: "21:00", status: "scheduled", rxId: "RX-3389-002" },
      { id: "m3", name: "Metoprolol succinate 25 mg PO QD", given: "08:00", status: "given", rxId: "RX-3389-003" },
      { id: "m4", name: "Spironolactone 25 mg PO QD", given: "08:00", status: "given", rxId: "RX-3389-004" },
    ],
    orders: [
      { id: "o1", name: "Daily weight", cat: "nursing", status: "active", ts: "Admit", priority: "routine", owner: "Dr. Walters" },
      { id: "o2", name: "Strict I&O — 1.5L restrict", cat: "nursing", status: "active", ts: "Admit", priority: "routine", owner: "Dr. Walters" },
      { id: "o3", name: "Lipid Panel", cat: "labs_outside", status: "pending", ts: "Yesterday", priority: "routine", owner: "Dr. Walters", lab: "LabCorp" },
    ],
    imaging: [{ type: "TTE Echo", desc: "EF 30%, severe LV dysfunction.", ts: "Yesterday", flag: "abnormal", state: "final", ack: true }],
    notes: [],
    changed: ["Net −1.8L since admission", "BNP trending down from 3,100"],
    unacknowledged: ["Na+ 131 — hyponatremia"],
    tasks: [{ id: "a", label: "Goals of care conversation", owner: "Dr. Walters", priority: "urgent" }, { id: "b", label: "Discharge planning", owner: "Case Mgmt", priority: "normal" }],
    handoff: { one_liner: "74F DNR/DNI CHF exacerbation. Day 2, net −1.8L.", watch: ["Creatinine — diuresis", "Na+ 131 — fluid restrict"], pending: ["Cardiology recs", "Goals of care"], todo: ["Goals of care", "Discharge planning"] },
    um: { payer: "Medicare Advantage", loc: "Acute Inpatient", met: ["BNP >1,000", "SpO2 <92%", "IV diuresis"], missing: ["Medical necessity day 3"], status: "Day 2 approved — Day 3 pending", statusOk: false },
    preferredPharmacy: "walgreens",
  },
  {
    id: "PT-003", name: "Raymond Alcazar", age: 58, dob: "11/05/1966", mrn: "5512-004", location: "Radiology", ctx: "radiology",
    cc: "Lung nodule follow-up — PET/CT staging", attending: "Dr. Priya Menon, MD", dea: "BM1122334",
    allergies: [{ drug: "NKDA", reaction: "", severity: "none" }],
    code: "Full Code", weight: "76 kg", insurance: "United PPO · ID 5512-004-UP",
    problems: [{ name: "Lung adenocarcinoma, cT2a N1", sev: "critical", active: true, icd: "C34.11" }, { name: "COPD — moderate", sev: "chronic", active: true, icd: "J44.1" }],
    vitals: { bp: "124/76", hr: "72", rr: "16", spo2: "98%", temp: "36.5°C", ts: "10:00" },
    labs: [
      { id: "l1", name: "CEA", val: "12.4", unit: "ng/mL", ref: "<3.0", flag: "H", ts: "2d ago", source: "outside", lab: "LabCorp", status: "resulted", ack: true },
      { id: "l2", name: "ANCA Panel", val: "Pending", unit: "", ref: "", flag: "N", ts: "—", source: "outside", lab: "Mayo Clinic Labs", status: "pending", ack: false },
    ],
    meds: [],
    orders: [
      { id: "o1", name: "Thoracic Surgery Consult", cat: "consults", status: "pending", ts: "Today", priority: "routine", owner: "Dr. Menon" },
      { id: "o2", name: "ANCA Panel", cat: "labs_outside", status: "pending", ts: "Today", priority: "routine", owner: "Dr. Menon", lab: "Mayo Clinic Labs" },
    ],
    imaging: [
      { type: "PET/CT", desc: "FDG-avid RUL mass 4.1 cm, N1 hilar adenopathy. No distant mets.", ts: "Today", flag: "critical", state: "prelim", ack: false },
      { type: "Prior CT Chest", desc: "RUL mass 3.2 cm. No adenopathy at that time.", ts: "6 mo ago", flag: "abnormal", state: "final", ack: true },
    ],
    notes: [],
    changed: ["PET/CT N1 upstaging", "Mass 4.1 cm — interval growth"],
    unacknowledged: ["PET/CT prelim — critical"],
    tasks: [{ id: "a", label: "Finalize PET/CT report", owner: "Dr. Menon", priority: "urgent" }],
    handoff: { one_liner: "58M RUL adenocarcinoma. PET/CT — N1, no distant mets.", watch: ["Rad report due today"], pending: ["Report sign-out", "Staging conference"], todo: [] },
    um: { payer: "United PPO", loc: "Outpatient", met: ["PET/CT for malignancy staging"], missing: [], status: "Approved", statusOk: true },
    preferredPharmacy: "cvs_main",
  },
];

async function main() {
  console.log("Creating schema hive_imr…");
  await sql`CREATE SCHEMA IF NOT EXISTS hive_imr`;

  console.log("Creating table hive_imr.patients…");
  await sql`
    CREATE TABLE IF NOT EXISTS hive_imr.patients (
      id text PRIMARY KEY,
      mrn text UNIQUE NOT NULL,
      data jsonb NOT NULL,
      ctx text NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `;

  console.log("Creating table hive_imr.sessions…");
  await sql`
    CREATE TABLE IF NOT EXISTS hive_imr.sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      role text NOT NULL,
      patient_id text REFERENCES hive_imr.patients(id),
      user_label text NOT NULL,
      created_at timestamptz DEFAULT now()
    )
  `;

  console.log("Creating table hive_imr.ai_generations…");
  await sql`
    CREATE TABLE IF NOT EXISTS hive_imr.ai_generations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id text REFERENCES hive_imr.patients(id),
      role text NOT NULL,
      prompt_type text NOT NULL,
      prompt text NOT NULL,
      output text NOT NULL,
      edited text,
      signed boolean DEFAULT false,
      signed_by text,
      signed_at timestamptz,
      audit_logged boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
    )
  `;

  console.log("Creating table hive_imr.orders…");
  await sql`
    CREATE TABLE IF NOT EXISTS hive_imr.orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id text REFERENCES hive_imr.patients(id),
      order_type text NOT NULL,
      order_data jsonb NOT NULL,
      priority text NOT NULL,
      dx text,
      note text,
      submitted_by text NOT NULL,
      submitted_at timestamptz DEFAULT now(),
      status text DEFAULT 'submitted'
    )
  `;

  console.log("Creating table hive_imr.lab_acknowledgements…");
  await sql`
    CREATE TABLE IF NOT EXISTS hive_imr.lab_acknowledgements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id text REFERENCES hive_imr.patients(id),
      lab_id text NOT NULL,
      acknowledged_by text NOT NULL,
      acknowledged_at timestamptz DEFAULT now()
    )
  `;

  console.log("Creating table hive_imr.vitals…");
  await sql`
    CREATE TABLE IF NOT EXISTS hive_imr.vitals (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id text REFERENCES hive_imr.patients(id),
      bp text,
      hr text,
      rr text,
      spo2 text,
      temp text,
      pain_score integer,
      charted_by text NOT NULL,
      charted_at timestamptz DEFAULT now()
    )
  `;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM hive_imr.patients`;
  if (count > 0) {
    console.log(`Seed skipped — ${count} patient(s) already present.`);
  } else {
    console.log("Seeding 3 demo patients…");
    for (const p of PATIENTS) {
      await sql`
        INSERT INTO hive_imr.patients (id, mrn, data, ctx)
        VALUES (${p.id}, ${p.mrn}, ${JSON.stringify(p)}, ${p.ctx})
      `;
    }
    console.log("Seed complete.");
  }

  console.log("Migration done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
