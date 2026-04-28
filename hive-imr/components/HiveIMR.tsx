"use client";
// @ts-nocheck
import { useState, useEffect, useRef, useCallback, useContext, createContext } from "react";

/* ─── STYLES ──────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("hive-css")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "hive-css";
  s.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#06100F;--surf:#0A1A18;--surf2:#0F2220;--surf3:#162B28;
      --bdr:#1A3530;--bdr2:#0D2220;
      --tx:#D6EDE8;--tx2:#6FA898;--tx3:#2E5550;
      --acc:#0FA896;--acc2:#0B8070;
      --green:#18A060;--red:#E53030;--amber:#E89020;
      --cyan:#0BB4CC;--purple:#8B52F5;--ai:#7C3AED;--nurse:#0E9488;
      --rx:#F59E0B;--lab:#06B6D4;
      --ff:'Sora',sans-serif;--ffm:'JetBrains Mono',monospace;
    }
    html,body,#root{height:100%;background:var(--bg);color:var(--tx);font-family:var(--ff);font-size:14px;line-height:1.4}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:4px}
    ::-webkit-scrollbar-track{background:transparent}
    button{cursor:pointer;border:none;background:none;font-family:inherit;font-size:inherit;color:inherit;outline:none}
    textarea,input,select{font-family:inherit;font-size:inherit;outline:none;background:none;color:inherit}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .mod-enter{animation:fadeIn 0.18s ease}
    .drawer-enter{animation:slideUp 0.18s ease}
    .ai-cursor::after{content:'▋';animation:pulse 0.7s infinite;color:var(--ai);margin-left:1px}
  `;
  document.head.appendChild(s);
};
if (typeof document !== "undefined") injectStyles();

/* ─── ROLE CONFIG ─────────────────────────────────────────── */
const ROLE_CONFIG = {
  physician:   { defaultMod:"dashboard", modules:["dashboard","clinical","orders_rx","handoff","shift_board","radiology","pathology","billing","um","coexistence","support","pilot_metrics","architecture"], readOnly:[], color:"#0FA896", icon:"⚕", contextLabel:"All patients · Full access", aiEnabled:true },
  nurse:       { defaultMod:"shift_board", modules:["shift_board","nurse_snapshot","flowsheet","nurse_handoff","orders_rx","dashboard","clinical","architecture"], readOnly:["clinical"], color:"#0E9488", icon:"♥", contextLabel:"Shift board · Assigned patients", aiEnabled:false },
  ed:          { defaultMod:"dashboard", modules:["dashboard","clinical","orders_rx","handoff","radiology","architecture"], readOnly:["radiology"], color:"#E53030", icon:"🚨", contextLabel:"ED context", aiEnabled:true },
  radiologist: { defaultMod:"radiology", modules:["radiology","dashboard","clinical","architecture"], readOnly:["dashboard","clinical"], color:"#0BB4CC", icon:"◎", contextLabel:"Radiology reading context", aiEnabled:true },
  pathologist: { defaultMod:"pathology", modules:["pathology","orders_rx","dashboard","clinical","architecture"], readOnly:["dashboard","clinical"], color:"#8B52F5", icon:"⬡", contextLabel:"Pathology / lab context", aiEnabled:true },
  case_mgr:    { defaultMod:"um", modules:["um","billing","dashboard","handoff","architecture"], readOnly:["clinical"], color:"#E89020", icon:"◧", contextLabel:"Case management · UM context", aiEnabled:true },
  biller:      { defaultMod:"billing", modules:["billing","um","dashboard","architecture"], readOnly:["dashboard"], color:"#E89020", icon:"$", contextLabel:"Billing / revenue context", aiEnabled:false },
  admin:       { defaultMod:"pilot_metrics", modules:["pilot_metrics","coexistence","support","architecture","dashboard"], readOnly:["dashboard"], color:"#0FA896", icon:"⚙", contextLabel:"Admin / implementation view", aiEnabled:false },
};

const ROLES = [
  {id:"physician",label:"Dr. Sarah Kim, MD",role:"Attending Physician"},
  {id:"nurse",label:"Alex Torres, RN",role:"Charge Nurse"},
  {id:"ed",label:"Dr. James Park, MD",role:"Emergency Physician"},
  {id:"radiologist",label:"Dr. Priya Menon, MD",role:"Radiologist"},
  {id:"pathologist",label:"Dr. Nadia Farooq, MD",role:"Pathologist"},
  {id:"case_mgr",label:"Maria Santos, MSW",role:"Case Manager"},
  {id:"biller",label:"Kevin Wright, CPC",role:"Coder / Biller"},
  {id:"admin",label:"Robert Chen",role:"IT Director / Admin"},
];

const ALL_NAV = [
  {id:"shift_board",label:"Shift Board",icon:"▦"},
  {id:"nurse_snapshot",label:"Patient Snapshot",icon:"◈"},
  {id:"flowsheet",label:"Flowsheet",icon:"≋"},
  {id:"nurse_handoff",label:"Nursing Handoff",icon:"⇄"},
  null,
  {id:"dashboard",label:"Patient List",icon:"≡"},
  {id:"clinical",label:"Clinical View",icon:"◈"},
  {id:"orders_rx",label:"Orders & ePrescribing",icon:"⌘"},
  {id:"handoff",label:"Physician Handoff",icon:"→"},
  null,
  {id:"radiology",label:"Radiology / PACS",icon:"◎"},
  {id:"pathology",label:"Pathology / Lab",icon:"⬡"},
  null,
  {id:"billing",label:"Billing / Revenue",icon:"$"},
  {id:"um",label:"UM / Prior Auth",icon:"◧"},
  null,
  {id:"pilot_metrics",label:"Pilot Metrics",icon:"▲"},
  {id:"coexistence",label:"Integration & Coexistence",icon:"⇌"},
  {id:"support",label:"Support & Ownership",icon:"◉"},
  {id:"architecture",label:"Architecture",icon:"⋮⋮"},
];

/* ─── ORDER CATALOG ───────────────────────────────────────── */
const ORDER_CATALOG = {
  labs_inhouse: [
    {id:"cmp",name:"CMP — Comprehensive Metabolic Panel",cat:"labs_inhouse",tat:"2h",specimen:"Blood",price:42},
    {id:"cbc_diff",name:"CBC with Differential",cat:"labs_inhouse",tat:"1h",specimen:"Blood",price:28},
    {id:"bmp",name:"BMP — Basic Metabolic Panel",cat:"labs_inhouse",tat:"1h",specimen:"Blood",price:30},
    {id:"troponin_hs",name:"Troponin I (High Sensitivity)",cat:"labs_inhouse",tat:"45 min",specimen:"Blood",price:55,stat:true},
    {id:"bnp",name:"BNP / NT-proBNP",cat:"labs_inhouse",tat:"1h",specimen:"Blood",price:48},
    {id:"pt_inr",name:"PT/INR",cat:"labs_inhouse",tat:"1h",specimen:"Blood",price:22},
    {id:"ua",name:"Urinalysis with Microscopy",cat:"labs_inhouse",tat:"1h",specimen:"Urine",price:18},
    {id:"abg",name:"Arterial Blood Gas",cat:"labs_inhouse",tat:"30 min",specimen:"Blood (art.)",price:35,stat:true},
    {id:"lft",name:"Liver Function Tests (LFTs)",cat:"labs_inhouse",tat:"2h",specimen:"Blood",price:38},
    {id:"tsh",name:"TSH",cat:"labs_inhouse",tat:"2h",specimen:"Blood",price:44},
    {id:"poc_glucose",name:"Point-of-Care Glucose",cat:"labs_inhouse",tat:"5 min",specimen:"Fingerstick",price:8,poc:true},
    {id:"poc_lactate",name:"Point-of-Care Lactate",cat:"labs_inhouse",tat:"10 min",specimen:"Blood",price:22,poc:true,stat:true},
  ],
  labs_outside: [
    {id:"hba1c",name:"Hemoglobin A1c",cat:"labs_outside",lab:"LabCorp",tat:"24–48h",specimen:"Blood",price:32},
    {id:"lipid",name:"Lipid Panel",cat:"labs_outside",lab:"LabCorp",tat:"24h",specimen:"Blood",price:28},
    {id:"covid_pcr",name:"COVID-19 PCR",cat:"labs_outside",lab:"Quest",tat:"24–72h",specimen:"Nasopharyngeal",price:120},
    {id:"blood_cx",name:"Blood Culture × 2",cat:"labs_outside",lab:"LabCorp",tat:"72h (prelim 24h)",specimen:"Blood",price:95},
    {id:"urine_cx",name:"Urine Culture & Sensitivity",cat:"labs_outside",lab:"LabCorp",tat:"48–72h",specimen:"Urine",price:65},
    {id:"hep_panel",name:"Hepatitis Panel (A/B/C)",cat:"labs_outside",lab:"Quest",tat:"48h",specimen:"Blood",price:88},
    {id:"anca",name:"ANCA Panel",cat:"labs_outside",lab:"Mayo Clinic Labs",tat:"5–7 days",specimen:"Blood",price:220},
    {id:"genetic",name:"Genetic Panel — Cardio",cat:"labs_outside",lab:"GeneDx",tat:"14–21 days",specimen:"Saliva/Blood",price:850},
  ],
  imaging: [
    {id:"cxr_pa",name:"CXR PA/Lateral",cat:"imaging",tat:"2h",price:110},
    {id:"ct_head",name:"CT Head without Contrast",cat:"imaging",tat:"1h",price:880},
    {id:"ct_pe",name:"CT Pulmonary Angiogram",cat:"imaging",tat:"2h",price:1200},
    {id:"echo_tte",name:"Echocardiogram (TTE)",cat:"imaging",tat:"24h",price:650},
    {id:"us_abd",name:"Ultrasound Abdomen",cat:"imaging",tat:"4h",price:480},
  ],
  consults: [
    {id:"card_consult",name:"Cardiology Consult",cat:"consults",priority:"urgent"},
    {id:"id_consult",name:"Infectious Disease Consult",cat:"consults",priority:"routine"},
    {id:"nephro_consult",name:"Nephrology Consult",cat:"consults",priority:"routine"},
    {id:"thoracic_consult",name:"Thoracic Surgery Consult",cat:"consults",priority:"routine"},
  ],
  procedures: [
    {id:"foley",name:"Foley Catheter Insertion",cat:"procedures"},
    {id:"iv_access",name:"IV Access — Peripheral",cat:"procedures"},
    {id:"picc",name:"PICC Line Placement",cat:"procedures",requires_consent:true},
    {id:"lp",name:"Lumbar Puncture",cat:"procedures",requires_consent:true},
  ],
};

/* ─── DRUG DATABASE (abbreviated) ────────────────────────── */
const DRUG_DB = [
  {id:"amox_500",name:"Amoxicillin",strengths:["250 mg","500 mg","875 mg"],forms:["Capsule","Chewable","Suspension"],routes:["PO"],frequencies:["TID","BID"],schedule:null,class:"Antibiotic"},
  {id:"azithro_250",name:"Azithromycin",strengths:["250 mg","500 mg"],forms:["Tablet","Suspension","IV"],routes:["PO","IV"],frequencies:["QD","Q24h"],schedule:null,class:"Antibiotic"},
  {id:"metop_succ",name:"Metoprolol Succinate",strengths:["25 mg","50 mg","100 mg","200 mg"],forms:["Tablet ER"],routes:["PO"],frequencies:["QD"],schedule:null,class:"Beta-blocker"},
  {id:"lisinopril",name:"Lisinopril",strengths:["2.5 mg","5 mg","10 mg","20 mg","40 mg"],forms:["Tablet"],routes:["PO"],frequencies:["QD"],schedule:null,class:"ACE Inhibitor"},
  {id:"furosemide",name:"Furosemide",strengths:["20 mg","40 mg","80 mg","100 mg"],forms:["Tablet","IV","Oral Solution"],routes:["PO","IV"],frequencies:["QD","BID","TID","PRN"],schedule:null,class:"Loop Diuretic"},
  {id:"aspirin_81",name:"Aspirin",strengths:["81 mg","325 mg","650 mg"],forms:["Tablet","EC Tablet"],routes:["PO","PR"],frequencies:["QD","BID","QID","PRN"],schedule:null,class:"Antiplatelet / NSAID"},
  {id:"atorvastatin",name:"Atorvastatin",strengths:["10 mg","20 mg","40 mg","80 mg"],forms:["Tablet"],routes:["PO"],frequencies:["QD"],schedule:null,class:"Statin"},
  {id:"warfarin",name:"Warfarin",strengths:["1 mg","2 mg","2.5 mg","3 mg","4 mg","5 mg","6 mg","7.5 mg","10 mg"],forms:["Tablet"],routes:["PO"],frequencies:["QD"],schedule:null,class:"Anticoagulant",high_alert:true},
  {id:"heparin_iv",name:"Heparin",strengths:["25,000 units/500 mL","5,000 units/mL"],forms:["IV Infusion","Injection"],routes:["IV","SubQ"],frequencies:["Continuous","Q8h","Q12h"],schedule:null,class:"Anticoagulant",high_alert:true},
  {id:"morphine",name:"Morphine",strengths:["2 mg","4 mg","8 mg","15 mg","30 mg"],forms:["Tablet","Oral Solution","IV","IM"],routes:["PO","IV","IM","SubQ"],frequencies:["Q4h","Q6h","Q8h","PRN","Continuous"],schedule:"CII",class:"Opioid",high_alert:true,controlled:true},
  {id:"oxycodone",name:"Oxycodone",strengths:["5 mg","10 mg","15 mg","20 mg","30 mg"],forms:["Tablet","Capsule","Oral Solution"],routes:["PO"],frequencies:["Q4–6h","Q6h","Q8h","PRN"],schedule:"CII",class:"Opioid",high_alert:true,controlled:true},
  {id:"lorazepam",name:"Lorazepam",strengths:["0.5 mg","1 mg","2 mg"],forms:["Tablet","IV","IM"],routes:["PO","IV","IM"],frequencies:["BID","TID","Q6h","PRN"],schedule:"CIV",class:"Benzodiazepine",controlled:true},
  {id:"metformin",name:"Metformin",strengths:["500 mg","850 mg","1000 mg"],forms:["Tablet","ER Tablet"],routes:["PO"],frequencies:["BID","TID","QD (ER)"],schedule:null,class:"Biguanide"},
  {id:"pantoprazole",name:"Pantoprazole",strengths:["20 mg","40 mg"],forms:["Tablet DR","IV"],routes:["PO","IV"],frequencies:["QD","BID"],schedule:null,class:"PPI"},
  {id:"ondansetron",name:"Ondansetron",strengths:["4 mg","8 mg"],forms:["Tablet","ODT","IV","IM"],routes:["PO","IV","IM"],frequencies:["Q6h","Q8h","PRN"],schedule:null,class:"Antiemetic"},
  {id:"albuterol",name:"Albuterol",strengths:["90 mcg/inh","2.5 mg/3 mL"],forms:["MDI","Nebulizer"],routes:["INH","NEB"],frequencies:["Q4–6h","Q2–4h","PRN"],schedule:null,class:"Bronchodilator"},
  {id:"prednisone",name:"Prednisone",strengths:["5 mg","10 mg","20 mg","50 mg"],forms:["Tablet","Oral Solution"],routes:["PO"],frequencies:["QD","BID","QID"],schedule:null,class:"Corticosteroid"},
  {id:"ceftriaxone",name:"Ceftriaxone",strengths:["1 g","2 g"],forms:["IV","IM"],routes:["IV","IM"],frequencies:["QD","Q12h"],schedule:null,class:"Cephalosporin"},
  {id:"vancomycin",name:"Vancomycin",strengths:["500 mg","1 g","1.5 g","2 g"],forms:["IV"],routes:["IV"],frequencies:["Q8h","Q12h","Q24h","AUC-guided"],schedule:null,class:"Glycopeptide",high_alert:true},
  {id:"nitro_sl",name:"Nitroglycerin SL",strengths:["0.4 mg"],forms:["Sublingual Tablet","SL Spray"],routes:["SL"],frequencies:["PRN Q5 min × 3","PRN"],schedule:null,class:"Nitrate",high_alert:true},
];

/* ─── IN-HOUSE PHARMACIES ─────────────────────────────────── */
const INHOUSE_PHARMACIES = [
  {id:"main_rx",name:"Main Hospital Pharmacy",location:"Floor B1 · Pharmacy",hours:"24/7",type:"inhouse"},
  {id:"or_rx",name:"OR Satellite Pharmacy",location:"OR Suite Level 2",hours:"06:00–22:00",type:"inhouse"},
  {id:"ed_rx",name:"ED Pyxis / Dispensing Cabinet",location:"ED Bay Area",hours:"24/7 Automated",type:"inhouse_auto"},
];

/* ─── OUTSIDE PHARMACIES ──────────────────────────────────── */
const OUTSIDE_PHARMACIES = [
  {id:"cvs_main",name:"CVS Pharmacy",address:"1204 Main St, Riverton",phone:"(555) 400-1100",ncpdp:"1234567"},
  {id:"walgreens",name:"Walgreens Pharmacy",address:"890 Oak Ave, Riverton",phone:"(555) 400-2200",ncpdp:"2345678"},
  {id:"walmart_rx",name:"Walmart Pharmacy",address:"200 Commerce Blvd, Riverton",phone:"(555) 400-3300",ncpdp:"3456789"},
  {id:"costco_rx",name:"Costco Pharmacy",address:"400 Wholesale Way, Riverton",phone:"(555) 400-4400",ncpdp:"4567890"},
  {id:"mail_rx",name:"Express Scripts (Mail Order)",address:"Mail Order",phone:"(800) 282-2881",ncpdp:"9000001"},
];

/* ─── NURSING DATA ────────────────────────────────────────── */
const NURSING_DATA = {
  "PT-001": {
    assignedNurse:"Alex Torres, RN",room:"ED Bay 4",acuity:5,
    precautions:["Contact isolation","Fall risk"],
    lines:["Peripheral IV × 2 (L AC, R hand)","Foley catheter"],
    vitalsSchedule:"Q1h",lastVitals:"14:32",nextVitals:"15:32",
    painScore:8,lastPain:"14:20",
    painTrend:[{t:"12:00",v:9},{t:"13:00",v:9},{t:"14:00",v:8},{t:"14:20",v:8}],
    io:{in:320,out:180,period:"This shift"},
    tasks:[
      {id:"t1",label:"12-lead ECG",due:"14:10",status:"done",cat:"procedure"},
      {id:"t2",label:"Vitals Q1h",due:"15:32",status:"due",cat:"vitals"},
      {id:"t3",label:"Pain reassessment",due:"15:20",status:"due",cat:"pain"},
      {id:"t4",label:"Cath lab transport prep",due:"15:00",status:"overdue",cat:"procedure"},
      {id:"t5",label:"Consent witnessed",due:"14:45",status:"overdue",cat:"admin"},
    ],
    recentEvents:[
      {ts:"14:30",type:"alert",text:"Troponin I critical — 4.82 ng/mL"},
      {ts:"14:25",text:"Heparin infusion initiated"},
      {ts:"14:18",text:"Nitroglycerin 0.4 mg SL administered"},
    ],
    vitalsFlow:[
      {ts:"12:00",bp:"162/98",hr:"112",rr:"24",spo2:"93%",temp:"37.2"},
      {ts:"13:00",bp:"160/96",hr:"110",rr:"22",spo2:"94%",temp:"37.1"},
      {ts:"14:32",bp:"158/94",hr:"108",rr:"22",spo2:"94%",temp:"37.1"},
    ],
    ioFlow:[{ts:"08:00",type:"in",cat:"IV fluid",amt:125},{ts:"10:00",type:"in",cat:"PO",amt:120},{ts:"10:30",type:"out",cat:"Urine",amt:180}],
    handoffNotes:"STEMI patient. Cath lab pending. Consent must be completed before transport. K+ 3.2 — repletion ordered. Monitor BP closely.",
    shiftNote:"",
  },
  "PT-002": {
    assignedNurse:"Alex Torres, RN",room:"4 West · Rm 412",acuity:4,
    precautions:["Fall risk","DNR/DNI"],lines:["Peripheral IV (L AC)","Foley catheter"],
    vitalsSchedule:"Q4h",lastVitals:"13:00",nextVitals:"17:00",
    painScore:3,lastPain:"13:00",
    painTrend:[{t:"07:00",v:4},{t:"09:00",v:3},{t:"13:00",v:3}],
    io:{in:890,out:1820,period:"This shift"},
    tasks:[
      {id:"t1",label:"Furosemide 80 mg IV 0800",due:"08:00",status:"done",cat:"med"},
      {id:"t2",label:"Daily weight",due:"08:00",status:"done",cat:"procedure"},
      {id:"t3",label:"Strict I&O",due:"16:00",status:"due",cat:"io"},
      {id:"t4",label:"Furosemide 80 mg IV 1600",due:"16:00",status:"due",cat:"med"},
      {id:"t5",label:"Goals of care discussion",due:"14:00",status:"overdue",cat:"admin"},
    ],
    recentEvents:[{ts:"13:00",text:"Vitals stable. SpO2 91% on 2L NC."},{ts:"08:00",text:"Furosemide 80 mg IV administered"}],
    vitalsFlow:[{ts:"07:00",bp:"146/90",hr:"94",rr:"20",spo2:"90%",temp:"36.7"},{ts:"13:00",bp:"142/88",hr:"92",rr:"18",spo2:"91%",temp:"36.8"}],
    ioFlow:[{ts:"07:00",type:"in",cat:"IV fluid",amt:125},{ts:"09:00",type:"in",cat:"PO",amt:240},{ts:"08:30",type:"out",cat:"Urine",amt:620},{ts:"10:30",type:"out",cat:"Urine",amt:540}],
    handoffNotes:"Day 2 CHF. Net −1.8L. Na+ 131 — limit free water. DNR/DNI — family meeting needed. Evening Lasix due.",
    shiftNote:"",
  },
};

/* ─── PATIENTS ────────────────────────────────────────────── */
const PATIENTS = [
  {
    id:"PT-001",name:"Marcus Chen",age:67,dob:"03/14/1957",mrn:"4421-887",location:"ED Bay 4",ctx:"ed",
    cc:"Chest pain, diaphoresis × 90 min",attending:"Dr. Sarah Kim, MD",dea:"BS1234563",
    allergies:[{drug:"Penicillin",reaction:"Anaphylaxis",severity:"severe"},{drug:"Sulfa",reaction:"Rash",severity:"moderate"}],
    code:"Full Code",weight:"82 kg",insurance:"BlueCross PPO · ID 887441223",
    problems:[{name:"Anterior STEMI",sev:"critical",active:true,icd:"I21.09"},{name:"Hypertension",sev:"chronic",active:true,icd:"I10"},{name:"T2DM",sev:"chronic",active:true,icd:"E11.9"}],
    vitals:{bp:"158/94",hr:"108",rr:"22",spo2:"94%",temp:"37.1°C",ts:"14:32"},
    labs:[
      {id:"l1",name:"Troponin I",val:"4.82",unit:"ng/mL",ref:"<0.04",flag:"H",ts:"14:15",source:"inhouse",status:"resulted",ack:false},
      {id:"l2",name:"BNP",val:"812",unit:"pg/mL",ref:"<100",flag:"H",ts:"14:15",source:"inhouse",status:"resulted",ack:true},
      {id:"l3",name:"K+",val:"3.2",unit:"mEq/L",ref:"3.5–5.0",flag:"L",ts:"14:15",source:"inhouse",status:"resulted",ack:false},
      {id:"l4",name:"Creatinine",val:"1.4",unit:"mg/dL",ref:"0.6–1.2",flag:"H",ts:"14:15",source:"inhouse",status:"resulted",ack:true},
      {id:"l5",name:"POC Glucose",val:"182",unit:"mg/dL",ref:"70–100",flag:"H",ts:"14:05",source:"poc",status:"resulted",ack:true},
    ],
    meds:[
      {id:"m1",name:"Aspirin 325 mg PO",given:"14:20",status:"given",rxId:"RX-4421-001"},
      {id:"m2",name:"Heparin infusion IV — ACS protocol",given:"14:25",status:"active",rxId:"RX-4421-002"},
      {id:"m3",name:"Nitroglycerin 0.4 mg SL",given:"14:18",status:"given",rxId:"RX-4421-003"},
      {id:"m4",name:"Metoprolol 5 mg IV",given:"—",status:"pending",rxId:"RX-4421-004"},
    ],
    orders:[
      {id:"o1",name:"Stat ECG",cat:"procedure",status:"complete",ts:"14:10",priority:"stat",owner:"Dr. Kim"},
      {id:"o2",name:"Cardiology Consult — STAT",cat:"consults",status:"pending",ts:"14:22",priority:"stat",owner:"Dr. Kim"},
      {id:"o3",name:"Cath lab activation",cat:"procedure",status:"active",ts:"14:30",priority:"stat",owner:"Dr. Kim"},
      {id:"o4",name:"CXR Portable",cat:"imaging",status:"ordered",ts:"14:20",priority:"stat",owner:"Dr. Kim"},
      {id:"o5",name:"Troponin I — STAT",cat:"labs_inhouse",status:"resulted",ts:"14:00",priority:"stat",owner:"Dr. Kim"},
      {id:"o6",name:"CMP",cat:"labs_inhouse",status:"resulted",ts:"14:00",priority:"stat",owner:"Dr. Kim"},
    ],
    imaging:[
      {type:"ECG",desc:"ST elevation V1–V4. Anterior STEMI.",ts:"14:12",flag:"critical",state:"final",ack:true},
      {type:"CXR Portable",desc:"Pending read",ts:"14:20",flag:"pending",state:"ordered",ack:false},
    ],
    notes:[{author:"Dr. Kim",type:"ED Attending Note",ts:"14:35",text:"67M presenting with 90 minutes of crushing substernal chest pain. ECG consistent with anterior STEMI. Cath lab activated. Hemodynamically stable. Cardiology en route."}],
    changed:["Troponin I critical — 4.82 ng/mL","Cath lab activated 14:30","K+ 3.2 — repletion ordered"],
    unacknowledged:["Troponin I — 4.82 critical","K+ 3.2 low"],
    tasks:[{id:"a",label:"Confirm consent signed",owner:"Dr. Kim",priority:"urgent"},{id:"b",label:"ICU bed request",owner:"Case Mgmt",priority:"urgent"},{id:"c",label:"K+ repletion — hang KCl 40 mEq",owner:"Nurse",priority:"high"}],
    handoff:{one_liner:"67M w/ anterior STEMI, troponin 4.82, cath lab activated.",watch:["BP — hold nitro if SBP <90","K+ 3.2 — repletion ordered"],pending:["Cardiology ETA 15 min","CXR result"],todo:["Confirm consent","ICU bed"]},
    um:{payer:"BlueCross PPO",loc:"ICU",met:["STEMI","Cath lab activation","Troponin >10× ULN"],missing:["Cardiology attestation","Signed consent"],status:"Approved — conditional",statusOk:true},
    preferredPharmacy:"cvs_main",
  },
  {
    id:"PT-002",name:"Dorothy Okafor",age:74,dob:"08/22/1950",mrn:"3389-221",location:"4 West · Rm 412",ctx:"inpatient",
    cc:"Acute on chronic CHF exacerbation",attending:"Dr. James Walters, MD",dea:"BW9876541",
    allergies:[{drug:"Lisinopril",reaction:"Cough",severity:"moderate"},{drug:"Contrast dye",reaction:"Urticaria",severity:"moderate"}],
    code:"DNR / DNI",weight:"94 kg",insurance:"Medicare Advantage · ID 3389-221-MA",
    problems:[{name:"CHF, HFrEF — EF 30%",sev:"critical",active:true,icd:"I50.20"},{name:"CKD Stage 3b",sev:"chronic",active:true,icd:"N18.32"},{name:"Atrial fibrillation",sev:"chronic",active:true,icd:"I48.91"},{name:"T2DM",sev:"chronic",active:true,icd:"E11.9"}],
    vitals:{bp:"142/88",hr:"92",rr:"18",spo2:"91%",temp:"36.8°C",ts:"13:00"},
    labs:[
      {id:"l1",name:"BNP",val:"2,240",unit:"pg/mL",ref:"<100",flag:"H",ts:"07:00",source:"inhouse",status:"resulted",ack:true},
      {id:"l2",name:"Creatinine",val:"2.1",unit:"mg/dL",ref:"0.6–1.2",flag:"H",ts:"07:00",source:"inhouse",status:"resulted",ack:true},
      {id:"l3",name:"Na+",val:"131",unit:"mEq/L",ref:"136–145",flag:"L",ts:"07:00",source:"inhouse",status:"resulted",ack:false},
      {id:"l4",name:"INR",val:"2.8",unit:"",ref:"2.0–3.0",flag:"N",ts:"07:00",source:"inhouse",status:"resulted",ack:true},
      {id:"l5",name:"Lipid Panel",val:"Pending",unit:"",ref:"",flag:"N",ts:"—",source:"outside",lab:"LabCorp",status:"pending",ack:false},
    ],
    meds:[
      {id:"m1",name:"Furosemide 80 mg IV BID",given:"08:00",status:"given",rxId:"RX-3389-001"},
      {id:"m2",name:"Warfarin 5 mg PO QHS",given:"21:00",status:"scheduled",rxId:"RX-3389-002"},
      {id:"m3",name:"Metoprolol succinate 25 mg PO QD",given:"08:00",status:"given",rxId:"RX-3389-003"},
      {id:"m4",name:"Spironolactone 25 mg PO QD",given:"08:00",status:"given",rxId:"RX-3389-004"},
    ],
    orders:[
      {id:"o1",name:"Daily weight",cat:"nursing",status:"active",ts:"Admit",priority:"routine",owner:"Dr. Walters"},
      {id:"o2",name:"Strict I&O — 1.5L restrict",cat:"nursing",status:"active",ts:"Admit",priority:"routine",owner:"Dr. Walters"},
      {id:"o3",name:"Lipid Panel",cat:"labs_outside",status:"pending",ts:"Yesterday",priority:"routine",owner:"Dr. Walters",lab:"LabCorp"},
    ],
    imaging:[{type:"TTE Echo",desc:"EF 30%, severe LV dysfunction.",ts:"Yesterday",flag:"abnormal",state:"final",ack:true}],
    notes:[],
    changed:["Net −1.8L since admission","BNP trending down from 3,100"],
    unacknowledged:["Na+ 131 — hyponatremia"],
    tasks:[{id:"a",label:"Goals of care conversation",owner:"Dr. Walters",priority:"urgent"},{id:"b",label:"Discharge planning",owner:"Case Mgmt",priority:"normal"}],
    handoff:{one_liner:"74F DNR/DNI CHF exacerbation. Day 2, net −1.8L.",watch:["Creatinine — diuresis","Na+ 131 — fluid restrict"],pending:["Cardiology recs","Goals of care"],todo:["Goals of care","Discharge planning"]},
    um:{payer:"Medicare Advantage",loc:"Acute Inpatient",met:["BNP >1,000","SpO2 <92%","IV diuresis"],missing:["Medical necessity day 3"],status:"Day 2 approved — Day 3 pending",statusOk:false},
    preferredPharmacy:"walgreens",
  },
  {
    id:"PT-003",name:"Raymond Alcazar",age:58,dob:"11/05/1966",mrn:"5512-004",location:"Radiology",ctx:"radiology",
    cc:"Lung nodule follow-up — PET/CT staging",attending:"Dr. Priya Menon, MD",dea:"BM1122334",
    allergies:[{drug:"NKDA",reaction:"",severity:"none"}],
    code:"Full Code",weight:"76 kg",insurance:"United PPO · ID 5512-004-UP",
    problems:[{name:"Lung adenocarcinoma, cT2a N1",sev:"critical",active:true,icd:"C34.11"},{name:"COPD — moderate",sev:"chronic",active:true,icd:"J44.1"}],
    vitals:{bp:"124/76",hr:"72",rr:"16",spo2:"98%",temp:"36.5°C",ts:"10:00"},
    labs:[
      {id:"l1",name:"CEA",val:"12.4",unit:"ng/mL",ref:"<3.0",flag:"H",ts:"2d ago",source:"outside",lab:"LabCorp",status:"resulted",ack:true},
      {id:"l2",name:"ANCA Panel",val:"Pending",unit:"",ref:"",flag:"N",ts:"—",source:"outside",lab:"Mayo Clinic Labs",status:"pending",ack:false},
    ],
    meds:[],
    orders:[
      {id:"o1",name:"Thoracic Surgery Consult",cat:"consults",status:"pending",ts:"Today",priority:"routine",owner:"Dr. Menon"},
      {id:"o2",name:"ANCA Panel",cat:"labs_outside",status:"pending",ts:"Today",priority:"routine",owner:"Dr. Menon",lab:"Mayo Clinic Labs"},
    ],
    imaging:[
      {type:"PET/CT",desc:"FDG-avid RUL mass 4.1 cm, N1 hilar adenopathy. No distant mets.",ts:"Today",flag:"critical",state:"prelim",ack:false},
      {type:"Prior CT Chest",desc:"RUL mass 3.2 cm. No adenopathy at that time.",ts:"6 mo ago",flag:"abnormal",state:"final",ack:true},
    ],
    notes:[],
    changed:["PET/CT N1 upstaging","Mass 4.1 cm — interval growth"],
    unacknowledged:["PET/CT prelim — critical"],
    tasks:[{id:"a",label:"Finalize PET/CT report",owner:"Dr. Menon",priority:"urgent"}],
    handoff:{one_liner:"58M RUL adenocarcinoma. PET/CT — N1, no distant mets.",watch:["Rad report due today"],pending:["Report sign-out","Staging conference"],todo:[]},
    um:{payer:"United PPO",loc:"Outpatient",met:["PET/CT for malignancy staging"],missing:[],status:"Approved",statusOk:true},
    preferredPharmacy:"cvs_main",
  },
];

const PatientsCtx = createContext(PATIENTS);

/* ─── UTILS ───────────────────────────────────────────────── */
const CTX_COLOR={ed:"#E53030",inpatient:"#0FA896",radiology:"#0BB4CC",pathology:"#8B52F5"};
const CTX_LABEL={ed:"ED",inpatient:"Inpatient",radiology:"Radiology",pathology:"Pathology"};
const flagColor=f=>({H:"#E53030",L:"#E89020",N:"#18A060",critical:"#E53030",abnormal:"#E89020",pending:"#6FA898"}[f]||"#6FA898");
const statusColor=s=>({given:"#18A060",active:"#0BB4CC",pending:"#E89020",complete:"#18A060",done:"#18A060",ordered:"#0FA896",scheduled:"#6FA898",due:"#E89020",overdue:"#E53030",upcoming:"#2E5550",prelim:"#E89020",final:"#18A060",stat:"#E53030",urgent:"#E89020",routine:"#2E5550",resulted:"#18A060",collected:"#0BB4CC",sent:"#E89020",cancelled:"#E53030"}[s]||"#6FA898");
const nowTime=()=>{const d=new Date();return`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;};
const taskSort={overdue:0,due:1,upcoming:2,done:3};

/* ─── AI STREAMING ────────────────────────────────────────── */
const useAIStream=()=>{
  const[st,setSt]=useState({status:"idle",text:"",error:null});
  const abort=useRef(null);
  const generate=useCallback(async(prompt)=>{
    if(abort.current) abort.current.abort();
    const ctrl=new AbortController();abort.current=ctrl;
    setSt({status:"streaming",text:"",error:null});
    try{
      const res=await fetch("/api/ai/generate",{method:"POST",headers:{"Content-Type":"application/json"},signal:ctrl.signal,body:JSON.stringify({prompt})});
      if(!res.ok) throw new Error(`API ${res.status}`);
      const reader=res.body.getReader();const dec=new TextDecoder();let acc="";
      while(true){
        const{done,value}=await reader.read();if(done)break;
        const chunk=dec.decode(value,{stream:true});
        for(const line of chunk.split("\n")){
          if(!line.startsWith("data: "))continue;const data=line.slice(6).trim();if(data==="[DONE]")continue;
          try{const p=JSON.parse(data);if(p.type==="content_block_delta"&&p.delta?.text){acc+=p.delta.text;setSt({status:"streaming",text:acc,error:null});}}catch{}
        }
      }
      setSt({status:"done",text:acc,error:null});
    }catch(e){if(e.name==="AbortError")return;setSt({status:"error",text:"",error:e.message});}
  },[]);
  const reset=useCallback(()=>{if(abort.current)abort.current.abort();setSt({status:"idle",text:"",error:null});},[]);
  return{...st,generate,reset};
};

/* ─── AI PANEL ────────────────────────────────────────────── */
const AIPanel=({title,desc,getPrompt,onDismiss,currentUser,patientId,role})=>{
  const{status,text,error,generate,reset}=useAIStream();
  const[edited,setEdited]=useState("");const[signed,setSigned]=useState(null);
  const isStreaming=status==="streaming";const isDone=status==="done";
  const acceptAndSign=()=>{
    const ts=nowTime();
    const finalText=edited||text;
    setSigned({user:currentUser,ts,text:finalText});
    fetch("/api/ai/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({patientId:patientId??null,role:role||"unknown",promptType:title,prompt:getPrompt(),output:text,edited:edited||null,signed:true,signedBy:currentUser,signedAt:new Date().toISOString()})}).catch(()=>{});
  };
  return(
    <div style={{background:"var(--surf2)",border:"1px solid var(--ai)",borderRadius:8,padding:16,boxShadow:"0 0 0 1px #7C3AED15,0 8px 32px #00000060"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--ai)20",border:"1px solid var(--ai)44",borderRadius:5,padding:"3px 9px"}}><div style={{width:6,height:6,borderRadius:3,background:"var(--ai)",animation:isStreaming?"pulse 0.7s infinite":"none"}}/><span style={{fontSize:10,fontWeight:700,color:"var(--ai)",letterSpacing:"0.08em"}}>{isStreaming?"GENERATING…":isDone?"AI DRAFT":"AI ASSIST"}</span></div>
        <span style={{fontSize:13,fontWeight:600}}>{title}</span>
        <button onClick={()=>{reset();onDismiss&&onDismiss();}} style={{marginLeft:"auto",color:"var(--tx3)",fontSize:18,lineHeight:1,padding:"0 4px"}}>×</button>
      </div>
      {status==="idle"&&<div style={{fontSize:12,color:"var(--tx2)",marginBottom:14,lineHeight:1.6}}>{desc}</div>}
      {status==="error"&&<div style={{fontSize:12,color:"var(--red)",marginBottom:12,padding:"8px 12px",background:"var(--red)10",borderRadius:5}}>Generation failed. Try again.</div>}
      {(isStreaming||isDone)&&!signed&&(<div style={{marginBottom:12}}><textarea value={isDone?(edited||text):text} onChange={e=>isDone&&setEdited(e.target.value)} readOnly={isStreaming} className={isStreaming?"ai-cursor":""} style={{width:"100%",minHeight:140,background:"var(--surf3)",border:`1px solid ${isDone?"var(--ai)44":"var(--ai)22"}`,borderRadius:6,padding:"10px 12px",color:"var(--tx)",fontSize:13,lineHeight:1.7,resize:"vertical"}}/>{isDone&&<div style={{fontSize:11,color:"var(--tx3)",marginTop:5}}>✎ Editable. Review before signing.</div>}</div>)}
      {signed&&(<div style={{marginBottom:12}}><div style={{background:"var(--green)0C",border:"1px solid var(--green)30",borderRadius:6,padding:"10px 12px",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{signed.text}</div><div style={{marginTop:8,display:"flex",gap:8,fontSize:11,color:"var(--green)"}}><span style={{fontWeight:700}}>✓ Signed</span><span style={{color:"var(--tx3)"}}>·</span><span>{signed.user}</span><span style={{color:"var(--tx3)"}}>·</span><span style={{fontFamily:"var(--ffm)"}}>{signed.ts}</span><span style={{color:"var(--tx3)"}}>·</span><span style={{color:"var(--tx3)"}}>Audit-logged</span></div></div>)}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        {status==="idle"&&<button onClick={()=>{setEdited("");setSigned(null);generate(getPrompt());}} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 16px",borderRadius:5,background:"var(--ai)",color:"#fff",fontSize:12,fontWeight:600}}><span>✦</span>Generate with AI</button>}
        {isDone&&!signed&&<><button onClick={acceptAndSign} style={{padding:"7px 16px",borderRadius:5,background:"var(--green)",color:"#fff",fontSize:12,fontWeight:600}}>Accept & Sign</button><button onClick={()=>{setEdited("");setSigned(null);generate(getPrompt());}} style={{padding:"7px 14px",borderRadius:5,border:"1px solid var(--bdr)",color:"var(--tx2)",fontSize:12}}>Regenerate</button></>}
        {isStreaming&&<button onClick={reset} style={{padding:"7px 14px",borderRadius:5,border:"1px solid var(--red)40",color:"var(--red)",fontSize:12}}>Stop</button>}
        {signed&&<button onClick={()=>setSigned(null)} style={{padding:"7px 14px",borderRadius:5,border:"1px solid var(--bdr)",color:"var(--tx3)",fontSize:11}}>Edit</button>}
        <span style={{marginLeft:"auto",fontSize:10,color:"var(--tx3)"}}>hiveIMR AI · Human review required</span>
      </div>
    </div>
  );
};

/* ─── PRIMITIVES ──────────────────────────────────────────── */
const Pill=({color="#6FA898",children,small})=>(<span style={{display:"inline-flex",alignItems:"center",padding:small?"1px 6px":"2px 8px",borderRadius:99,background:color+"22",color,border:`1px solid ${color}40`,fontSize:small?10:11,fontWeight:600,letterSpacing:"0.03em",whiteSpace:"nowrap"}}>{children}</span>);
const Sec=({title,accent,children,style,action})=>(<div style={{marginBottom:14,...style}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9,paddingBottom:7,borderBottom:"1px solid var(--bdr2)"}}>{accent&&<span style={{width:3,height:12,background:accent,borderRadius:2,display:"block",flexShrink:0}}/>}<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",color:"var(--tx3)",textTransform:"uppercase",flex:1}}>{title}</span>{action}</div>{children}</div>);
const HCard=({children,style,onClick})=>{const[h,setH]=useState(false);return(<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick} style={{background:h?"var(--surf3)":"var(--surf2)",border:`1px solid ${h?"var(--bdr)":"var(--bdr2)"}`,borderRadius:6,padding:14,transition:"all 0.12s",cursor:onClick?"pointer":"default",...style}}>{children}</div>);};
const Btn=({children,onClick,color="var(--acc)",outline,small,style,disabled})=>(<button onClick={onClick} disabled={disabled} style={{padding:small?"4px 10px":"7px 14px",borderRadius:5,fontSize:small?11:12,fontWeight:600,background:outline?"transparent":color,color:outline?color:"#fff",border:outline?`1px solid ${color}44`:"none",opacity:disabled?0.4:1,transition:"all 0.12s",...style}}>{children}</button>);
const Input=({label,value,onChange,placeholder,style,mono,width})=>(<div style={{display:"flex",flexDirection:"column",gap:3,...style}}>{label&&<label style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.07em",textTransform:"uppercase"}}>{label}</label>}<input value={value} onChange={onChange} placeholder={placeholder} style={{width:width||"100%",padding:"6px 10px",borderRadius:5,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:12,fontFamily:mono?"var(--ffm)":"var(--ff)"}}/></div>);
const Sel=({label,value,onChange,options,style,width})=>(<div style={{display:"flex",flexDirection:"column",gap:3,...style}}>{label&&<label style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.07em",textTransform:"uppercase"}}>{label}</label>}<select value={value} onChange={onChange} style={{width:width||"100%",padding:"6px 10px",borderRadius:5,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:12}}>{options.map((o,i)=>(<option key={i} value={o.value||o}>{o.label||o}</option>))}</select></div>);
const ReadOnlyBanner=({roleColor,roleName})=>(<div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:5,marginBottom:12,background:`${roleColor}0C`,border:`1px solid ${roleColor}28`}}><span style={{fontSize:12,color:roleColor}}>👁</span><span style={{fontSize:12,color:roleColor,fontWeight:600}}>View access</span><span style={{fontSize:12,color:"var(--tx3)"}}>· {roleName} — read only in this module.</span></div>);

/* ─── ALLERGY CHECK ───────────────────────────────────────── */
const AllergyCheck=({drug,allergies})=>{
  if(!drug||!allergies) return null;
  const cross={Penicillin:["Amoxicillin","Ampicillin","Piperacillin"],Sulfa:["Trimethoprim-Sulfamethoxazole"]};
  const directHit=allergies.find(a=>a.drug!=="NKDA"&&drug.name.toLowerCase().includes(a.drug.toLowerCase()));
  const crossHit=allergies.find(a=>(cross[a.drug]||[]).some(c=>drug.name.toLowerCase().includes(c.toLowerCase())));
  if(directHit) return(<div style={{background:"var(--red)12",border:"1px solid var(--red)50",borderRadius:5,padding:"8px 12px",display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:15,color:"var(--red)"}}>⚠</span><div><div style={{fontSize:12,fontWeight:700,color:"var(--red)"}}>ALLERGY ALERT — {directHit.drug}</div><div style={{fontSize:11,color:"var(--tx2)"}}>Patient has documented {directHit.severity} reaction: {directHit.reaction}. Review before prescribing.</div></div></div>);
  if(crossHit) return(<div style={{background:"var(--amber)10",border:"1px solid var(--amber)44",borderRadius:5,padding:"8px 12px",display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:14,color:"var(--amber)"}}>⚠</span><div><div style={{fontSize:12,fontWeight:700,color:"var(--amber)"}}>Cross-reactivity check — {crossHit.drug}</div><div style={{fontSize:11,color:"var(--tx2)"}}>Possible cross-reactivity. Confirm clinical appropriateness.</div></div></div>);
  return(<div style={{display:"flex",gap:6,alignItems:"center",padding:"6px 10px",background:"var(--green)0A",borderRadius:5,border:"1px solid var(--green)25"}}><span style={{color:"var(--green)",fontSize:12}}>✓</span><span style={{fontSize:11,color:"var(--green)"}}>No allergy interactions detected</span></div>);
};

/* ─── ORDERS & EPRESCRIBING MODULE ───────────────────────────
   Tab 1: Order Entry (labs inhouse/outside, imaging, consults, procedures, nursing)
   Tab 2: ePrescribing (new Rx, in-house pharmacy queue, outside pharmacy send)
   Tab 3: Lab Results (inhouse + outside, all statuses)
─────────────────────────────────────────────────────────────── */
const OrdersRx=({patient,setMod,currentUser,roleConf,role})=>{
  const[tab,setTab]=useState("orders");
  const canWrite=!roleConf.readOnly.includes("orders_rx");

  if(!patient) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:14}}>
      <div style={{fontSize:52,opacity:0.12}}>⌘</div>
      <div style={{fontWeight:600,fontSize:16}}>No patient selected</div>
      <div style={{color:"var(--tx2)",fontSize:13}}>Select a patient to enter orders or prescriptions.</div>
      <Btn onClick={()=>setMod("dashboard")} color="var(--acc)">Go to Patient List</Btn>
    </div>
  );

  const TABS=[{id:"orders",label:"Order Entry",icon:"⌘"},{id:"rx",label:"ePrescribing",icon:"℞"},{id:"labs",label:"Lab Results",icon:"◉"}];

  return(
    <div className="mod-enter">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontWeight:700,fontSize:20,letterSpacing:"-0.4px",marginBottom:2}}>Orders & ePrescribing</h2>
          <div style={{fontSize:12,color:"var(--tx2)"}}>{patient.name} · {patient.age}yo · MRN {patient.mrn} · {patient.attending}</div>
        </div>
        {patient.code!=="Full Code"&&<Pill color="var(--amber)">{patient.code}</Pill>}
        {patient.allergies.filter(a=>a.drug!=="NKDA").map((a,i)=>(<span key={i} style={{fontSize:11,background:"#E5303015",border:"1px solid #E5303030",borderRadius:4,padding:"2px 7px",color:"var(--red)",fontWeight:500}}>⚠ {a.drug}</span>))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,marginBottom:14,borderBottom:"1px solid var(--bdr2)"}}>
        {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 18px",fontSize:12,fontWeight:tab===t.id?700:500,color:tab===t.id?"var(--acc)":"var(--tx2)",borderBottom:`2px solid ${tab===t.id?"var(--acc)":"transparent"}`,marginBottom:-1,transition:"all 0.12s",display:"flex",alignItems:"center",gap:6}}><span style={{opacity:tab===t.id?1:0.6}}>{t.icon}</span>{t.label}</button>))}
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center",paddingBottom:4}}>
          <span style={{fontSize:11,color:"var(--tx3)"}}>Weight: {patient.weight}</span>
          <span style={{fontSize:11,color:"var(--tx3)"}}>Insurance: {patient.insurance?.split("·")[0]?.trim()}</span>
        </div>
      </div>

      {tab==="orders"&&<OrderEntryTab patient={patient} canWrite={canWrite} currentUser={currentUser}/>}
      {tab==="rx"&&<EprescribeTab patient={patient} canWrite={canWrite} currentUser={currentUser}/>}
      {tab==="labs"&&<LabResultsTab patient={patient} canWrite={canWrite} currentUser={currentUser}/>}
    </div>
  );
};

/* ─── ORDER ENTRY TAB ─────────────────────────────────────── */
const OrderEntryTab=({patient,canWrite,currentUser})=>{
  const[search,setSearch]=useState("");
  const[selectedCat,setSelectedCat]=useState("all");
  const[priority,setPriority]=useState("routine");
  const[dx,setDx]=useState(patient.problems[0]?.name||"");
  const[cart,setCart]=useState([]);
  const[submitted,setSubmitted]=useState(false);

  const CATS=[{id:"all",label:"All"},{id:"labs_inhouse",label:"In-House Lab"},{id:"labs_outside",label:"Reference Lab"},{id:"imaging",label:"Imaging"},{id:"consults",label:"Consults"},{id:"procedures",label:"Procedures"}];
  const allOrders=Object.values(ORDER_CATALOG).flat();
  const filtered=allOrders.filter(o=>{
    const catOk=selectedCat==="all"||o.cat===selectedCat;
    const searchOk=!search||o.name.toLowerCase().includes(search.toLowerCase());
    return catOk&&searchOk;
  });

  const addToCart=(o)=>{if(!cart.find(c=>c.id===o.id)) setCart(c=>[...c,{...o,priority,dx,note:""}]);};
  const removeFromCart=(id)=>setCart(c=>c.filter(x=>x.id!==id));

  const handleSubmit=()=>{
    const submittedCart=cart;
    setSubmitted(true);setTimeout(()=>setSubmitted(false),3000);setCart([]);
    fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({patientId:patient.id,orderType:"bundle",orderData:submittedCart,priority,dx,note:null,submittedBy:currentUser})}).catch(()=>{});
  };

  const catColor={labs_inhouse:"var(--lab)",labs_outside:"var(--cyan)",imaging:"var(--acc)",consults:"var(--purple)",procedures:"var(--amber)"};

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14}}>
      {/* Left: catalog */}
      <div>
        {submitted&&<div style={{background:"var(--green)12",border:"1px solid var(--green)44",borderRadius:6,padding:"10px 14px",marginBottom:10,display:"flex",gap:8,alignItems:"center"}}><span style={{color:"var(--green)",fontWeight:700}}>✓ Orders submitted</span><span style={{fontSize:12,color:"var(--tx2)"}}>All orders sent to appropriate departments. Audit-logged.</span></div>}
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders…" style={{flex:1,minWidth:160,padding:"7px 12px",borderRadius:5,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:12}}/>
          <div style={{display:"flex",gap:2,background:"var(--surf3)",borderRadius:5,padding:2,border:"1px solid var(--bdr)"}}>
            {["stat","urgent","routine"].map(p=>(<button key={p} onClick={()=>setPriority(p)} style={{padding:"4px 10px",borderRadius:4,fontSize:10,fontWeight:priority===p?700:500,background:priority===p?statusColor(p)+"22":"transparent",color:priority===p?statusColor(p):"var(--tx2)",border:`1px solid ${priority===p?statusColor(p)+"55":"transparent"}`,textTransform:"uppercase",letterSpacing:"0.06em"}}>{p}</button>))}
          </div>
        </div>
        <div style={{display:"flex",gap:2,marginBottom:10,overflowX:"auto"}}>
          {CATS.map(c=>(<button key={c.id} onClick={()=>setSelectedCat(c.id)} style={{padding:"4px 12px",borderRadius:4,fontSize:11,fontWeight:selectedCat===c.id?700:500,background:selectedCat===c.id?"var(--acc)22":"transparent",color:selectedCat===c.id?"var(--acc)":"var(--tx2)",border:`1px solid ${selectedCat===c.id?"var(--acc)40":"transparent"}`,whiteSpace:"nowrap"}}>{c.label}</button>))}
        </div>
        {/* Order sets quick launch */}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {[{l:"ACS Bundle",items:["troponin_hs","cmp","cbc_diff","cxr_pa"]},{l:"Sepsis Bundle",items:["cmp","cbc_diff","blood_cx","urine_cx","poc_lactate"]},{l:"CHF Admit",items:["bmp","lft","bnp","cxr_pa","echo_tte"]}].map((set,i)=>(
            <button key={i} onClick={()=>{const orders=set.items.map(id=>allOrders.find(o=>o.id===id)).filter(Boolean);orders.forEach(o=>addToCart(o));}} style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:600,background:"var(--acc)15",color:"var(--acc)",border:"1px solid var(--acc)30",display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10}}>◈</span>{set.l} order set
            </button>
          ))}
        </div>
        <div style={{display:"grid",gap:5,maxHeight:420,overflowY:"auto"}}>
          {filtered.map(o=>{
            const inCart=cart.find(c=>c.id===o.id);
            return(<div key={o.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"var(--surf3)",borderRadius:5,border:`1px solid ${inCart?"var(--acc)44":"var(--bdr2)"}`,opacity:inCart?0.7:1}}>
              <div style={{width:6,height:6,borderRadius:2,flexShrink:0,background:catColor[o.cat]||"var(--tx3)"}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{o.name}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {o.tat&&<span style={{fontSize:10,color:"var(--tx3)"}}>TAT: {o.tat}</span>}
                  {o.specimen&&<span style={{fontSize:10,color:"var(--tx3)"}}>{o.specimen}</span>}
                  {o.lab&&<span style={{fontSize:10,color:"var(--cyan)"}}>→ {o.lab}</span>}
                  {o.poc&&<Pill color="var(--green)" small>POC</Pill>}
                  {o.stat&&<Pill color="var(--red)" small>STAT available</Pill>}
                  {o.requires_consent&&<Pill color="var(--amber)" small>Consent required</Pill>}
                </div>
              </div>
              {o.price&&<span style={{fontSize:11,color:"var(--tx3)",fontFamily:"var(--ffm)",flexShrink:0}}>${o.price}</span>}
              {canWrite&&!inCart&&<Btn small color="var(--acc)" onClick={()=>addToCart(o)}>+ Add</Btn>}
              {canWrite&&inCart&&<span style={{fontSize:11,color:"var(--acc)",fontWeight:700}}>✓ Added</span>}
            </div>);
          })}
          {filtered.length===0&&<div style={{color:"var(--tx3)",fontSize:12,padding:"20px",textAlign:"center"}}>No orders match your search.</div>}
        </div>
      </div>

      {/* Right: cart / order review */}
      <div>
        <div style={{background:"var(--surf2)",border:"1px solid var(--bdr2)",borderRadius:8,overflow:"hidden",position:"sticky",top:0}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid var(--bdr2)",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,fontWeight:700}}>Order Cart</span>
            <Pill color="var(--acc)" small>{cart.length} item{cart.length!==1?"s":""}</Pill>
            {cart.length>0&&<button onClick={()=>setCart([])} style={{marginLeft:"auto",fontSize:10,color:"var(--tx3)"}}>Clear</button>}
          </div>

          {/* Associated diagnosis */}
          {cart.length>0&&(
            <div style={{padding:"10px 14px",borderBottom:"1px solid var(--bdr2)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>Associated Diagnosis</div>
              <select value={dx} onChange={e=>setDx(e.target.value)} style={{width:"100%",padding:"5px 8px",borderRadius:4,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:11}}>
                {patient.problems.filter(p=>p.active).map(p=>(<option key={p.icd} value={p.name}>{p.name} ({p.icd})</option>))}
              </select>
            </div>
          )}

          <div style={{maxHeight:360,overflowY:"auto"}}>
            {cart.length===0&&<div style={{padding:"30px 14px",textAlign:"center",color:"var(--tx3)",fontSize:12}}>No orders added yet.</div>}
            {cart.map(o=>(<div key={o.id} style={{padding:"10px 14px",borderBottom:"1px solid var(--bdr2)"}}>
              <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{o.name}</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Pill color={statusColor(o.priority||"routine")} small>{o.priority||"routine"}</Pill>{o.cat==="labs_outside"&&<Pill color="var(--cyan)" small>{o.lab}</Pill>}</div></div>
                <button onClick={()=>removeFromCart(o.id)} style={{color:"var(--tx3)",fontSize:14,marginTop:-1}}>×</button>
              </div>
              <input placeholder="Clinical indication / note…" style={{width:"100%",marginTop:5,padding:"4px 8px",borderRadius:4,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:11}} onChange={e=>{const updated=cart.map(c=>c.id===o.id?{...c,note:e.target.value}:c);setCart(updated);}}/>
            </div>))}
          </div>

          {canWrite&&cart.length>0&&(
            <div style={{padding:"10px 14px",borderTop:"1px solid var(--bdr)"}}>
              <Btn color="var(--acc)" style={{width:"100%",justifyContent:"center",display:"flex"}} onClick={handleSubmit}>
                Submit {cart.length} Order{cart.length!==1?"s":""}
              </Btn>
              <div style={{fontSize:10,color:"var(--tx3)",marginTop:5,textAlign:"center"}}>All orders are audit-logged · Requires cosign if applicable</div>
            </div>
          )}
          {!canWrite&&<div style={{padding:"10px 14px",fontSize:11,color:"var(--tx3)",textAlign:"center"}}>Read-only: order submission requires attending authorization.</div>}
        </div>
      </div>
    </div>
  );
};

/* ─── ePRESCRIBING TAB ────────────────────────────────────── */
const EprescribeTab=({patient,canWrite,currentUser})=>{
  const[rxMode,setRxMode]=useState("new"); // new|inhouse_queue|outside_queue
  const[drugSearch,setDrugSearch]=useState("");
  const[selectedDrug,setSelectedDrug]=useState(null);
  const[form,setForm]=useState({strength:"",form:"",route:"",frequency:"",qty:"30",refills:"0",days:"30",sig:"",note:"",dispenseAs:"brand_allowed",pharmacy:"inhouse",outsidePharmacy:"cvs_main",controlled_verify:false});
  const[sentRx,setSentRx]=useState([]);
  const[rxSent,setRxSent]=useState(false);

  const drugs=drugSearch.length>1?DRUG_DB.filter(d=>d.name.toLowerCase().includes(drugSearch.toLowerCase())):[];

  const selectDrug=(d)=>{
    setSelectedDrug(d);
    setDrugSearch(d.name);
    setForm(f=>({...f,strength:d.strengths[0]||"",form:d.forms[0]||"",route:d.routes[0]||"",frequency:d.frequencies[0]||""}));
  };

  const buildSig=()=>{if(!selectedDrug||!form.strength||!form.route||!form.frequency) return "";return `${form.route==="PO"?"Take":"Give"} ${form.strength} ${form.form} by ${form.route.toLowerCase()} ${form.frequency.toLowerCase()}${form.days?` for ${form.days} days`:""}`;};
  const pharmacyLabel=form.pharmacy==="inhouse"?INHOUSE_PHARMACIES[0].name:OUTSIDE_PHARMACIES.find(p=>p.id===form.outsidePharmacy)?.name||"Unknown";

  const handleSend=()=>{
    const rx={id:`RX-${Date.now()}`,drug:selectedDrug.name,strength:form.strength,form:form.form,route:form.route,frequency:form.frequency,sig:form.sig||buildSig(),qty:form.qty,refills:form.refills,pharmacy:pharmacyLabel,type:form.pharmacy,prescriber:currentUser,ts:nowTime(),controlled:selectedDrug.controlled,schedule:selectedDrug.schedule};
    setSentRx(s=>[rx,...s]);setRxSent(true);
    setTimeout(()=>setRxSent(false),2500);
    setDrugSearch("");setSelectedDrug(null);setForm(f=>({...f,strength:"",form:"",route:"",frequency:"",qty:"30",refills:"0",days:"30",sig:"",note:"",controlled_verify:false}));
  };

  const QUEUE_INHOUSE=[
    {id:"RX-4421-002",drug:"Heparin IV — ACS Protocol",status:"dispensing",ts:"14:25",location:"ED Pyxis",urgent:true},
    {id:"RX-3389-002",drug:"Warfarin 5 mg PO",status:"ready",ts:"20:45",location:"Main Pharmacy"},
    {id:"RX-3389-001",drug:"Furosemide 80 mg IV",status:"dispensed",ts:"07:55",location:"Floor nursing"},
  ];

  return(
    <div>
      {/* Mode tabs */}
      <div style={{display:"flex",gap:2,background:"var(--surf3)",borderRadius:7,padding:3,border:"1px solid var(--bdr)",width:"fit-content",marginBottom:14}}>
        {[{id:"new",l:"New Prescription"},{id:"inhouse_queue",l:"In-House Pharmacy Queue"},{id:"outside_queue",l:"Sent Outside Rx"}].map(m=>(<button key={m.id} onClick={()=>setRxMode(m.id)} style={{padding:"5px 16px",borderRadius:5,fontSize:11,fontWeight:rxMode===m.id?700:500,background:rxMode===m.id?"var(--rx)22":"transparent",color:rxMode===m.id?"var(--rx)":"var(--tx2)",border:`1px solid ${rxMode===m.id?"var(--rx)44":"transparent"}`}}>{m.l}</button>))}
      </div>

      {rxMode==="new"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {/* Drug selector */}
          <div>
            <Sec title="Drug Selection" accent="var(--rx)">
              <div style={{position:"relative",marginBottom:10}}>
                <input value={drugSearch} onChange={e=>{setDrugSearch(e.target.value);if(!e.target.value) setSelectedDrug(null);}} placeholder="Search drug name…" style={{width:"100%",padding:"8px 12px",borderRadius:5,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:13}}/>
                {drugs.length>0&&!selectedDrug&&(
                  <div style={{position:"absolute",top:"calc(100% + 2px)",left:0,right:0,background:"var(--surf3)",border:"1px solid var(--bdr)",borderRadius:5,zIndex:10,maxHeight:220,overflowY:"auto",boxShadow:"0 8px 30px #00000060"}}>
                    {drugs.map(d=>(<div key={d.id} onClick={()=>selectDrug(d)} style={{padding:"9px 12px",borderBottom:"1px solid var(--bdr2)",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{d.name}</div><div style={{fontSize:10,color:"var(--tx3)"}}>{d.class}</div></div>
                      {d.high_alert&&<Pill color="var(--red)" small>High Alert</Pill>}
                      {d.controlled&&<Pill color="var(--amber)" small>{d.schedule}</Pill>}
                    </div>))}
                  </div>
                )}
              </div>

              {selectedDrug&&(
                <div>
                  {/* Allergy check */}
                  <div style={{marginBottom:10}}><AllergyCheck drug={selectedDrug} allergies={patient.allergies}/></div>
                  {selectedDrug.high_alert&&<div style={{background:"var(--red)10",border:"1px solid var(--red)40",borderRadius:5,padding:"7px 10px",marginBottom:10,fontSize:11,color:"var(--red)",fontWeight:600}}>⚠ HIGH-ALERT MEDICATION — Double-check dose, route, and indication.</div>}
                  {selectedDrug.controlled&&<div style={{background:"var(--amber)10",border:"1px solid var(--amber)40",borderRadius:5,padding:"7px 10px",marginBottom:10,fontSize:11,color:"var(--amber)"}}>🔒 Schedule {selectedDrug.schedule} Controlled Substance — DEA oversight required. Prescriber DEA: {patient.dea}</div>}

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <Sel label="Strength" value={form.strength} onChange={e=>setForm(f=>({...f,strength:e.target.value}))} options={selectedDrug.strengths}/>
                    <Sel label="Form" value={form.form} onChange={e=>setForm(f=>({...f,form:e.target.value}))} options={selectedDrug.forms}/>
                    <Sel label="Route" value={form.route} onChange={e=>setForm(f=>({...f,route:e.target.value}))} options={selectedDrug.routes}/>
                    <Sel label="Frequency" value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))} options={selectedDrug.frequencies}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <Input label="Qty" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} placeholder="30" mono/>
                    <Input label="Refills" value={form.refills} onChange={e=>setForm(f=>({...f,refills:e.target.value}))} placeholder="0" mono/>
                    <Input label="Days Supply" value={form.days} onChange={e=>setForm(f=>({...f,days:e.target.value}))} placeholder="30" mono/>
                  </div>

                  {/* SIG preview */}
                  <div style={{background:"var(--surf3)",border:"1px solid var(--bdr)",borderRadius:5,padding:"8px 10px",marginBottom:8}}>
                    <div style={{fontSize:9,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:3}}>SIG Preview</div>
                    <div style={{fontSize:12,color:"var(--tx2)",lineHeight:1.5}}>{buildSig()||"— complete form above —"}</div>
                  </div>

                  <Input label="Additional SIG / Instructions" value={form.sig} onChange={e=>setForm(f=>({...f,sig:e.target.value}))} placeholder="Override or supplement auto-generated SIG…" style={{marginBottom:8}}/>
                  <Input label="Prescriber Note to Pharmacist" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Optional note…"/>
                </div>
              )}
            </Sec>
          </div>

          {/* Pharmacy routing */}
          <div>
            <Sec title="Pharmacy Routing" accent="var(--rx)">
              <div style={{display:"flex",gap:2,background:"var(--surf3)",borderRadius:6,padding:2,border:"1px solid var(--bdr)",marginBottom:12}}>
                {[{v:"inhouse",l:"🏥 In-House Pharmacy"},{v:"outside",l:"🏪 Outside Pharmacy"}].map(m=>(<button key={m.v} onClick={()=>setForm(f=>({...f,pharmacy:m.v}))} style={{flex:1,padding:"6px 10px",borderRadius:4,fontSize:11,fontWeight:form.pharmacy===m.v?700:500,background:form.pharmacy===m.v?"var(--rx)22":"transparent",color:form.pharmacy===m.v?"var(--rx)":"var(--tx2)",border:`1px solid ${form.pharmacy===m.v?"var(--rx)44":"transparent"}`}}>{m.l}</button>))}
              </div>

              {form.pharmacy==="inhouse"&&(
                <div>
                  {INHOUSE_PHARMACIES.map(ph=>(<div key={ph.id} onClick={()=>setForm(f=>({...f,inhousePharmacy:ph.id}))} style={{padding:"10px 12px",borderRadius:5,border:`1px solid ${form.inhousePharmacy===ph.id?"var(--rx)55":"var(--bdr2)"}`,background:form.inhousePharmacy===ph.id?"var(--rx)0F":"var(--surf3)",marginBottom:6,cursor:"pointer"}}>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{ph.name}</div>
                    <div style={{fontSize:11,color:"var(--tx3)"}}>{ph.location} · {ph.hours}</div>
                    {ph.type==="inhouse_auto"&&<Pill color="var(--green)" small style={{marginTop:4}}>Automated dispensing</Pill>}
                  </div>))}
                  <div style={{fontSize:11,color:"var(--tx3)",marginTop:6}}>In-house Rx will populate the dispense queue immediately upon submission. Pyxis/automated cabinets update within 2 minutes.</div>
                </div>
              )}

              {form.pharmacy==="outside"&&(
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6}}>Patient preferred: {OUTSIDE_PHARMACIES.find(p=>p.id===patient.preferredPharmacy)?.name}</div>
                  {OUTSIDE_PHARMACIES.map(ph=>(<div key={ph.id} onClick={()=>setForm(f=>({...f,outsidePharmacy:ph.id}))} style={{padding:"9px 12px",borderRadius:5,border:`1px solid ${form.outsidePharmacy===ph.id?"var(--rx)55":"var(--bdr2)"}`,background:form.outsidePharmacy===ph.id?"var(--rx)0F":"var(--surf3)",marginBottom:5,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:12,marginBottom:1}}>{ph.name}</div>
                      <div style={{fontSize:11,color:"var(--tx3)"}}>{ph.address}</div>
                    </div>
                    {ph.id===patient.preferredPharmacy&&<Pill color="var(--green)" small>Preferred</Pill>}
                  </div>))}
                  <div style={{fontSize:11,color:"var(--tx3)",marginTop:6}}>Outside Rx transmits via SureScripts network. Controlled substances require paper or state EPCS.</div>
                </div>
              )}

              {/* Substitution */}
              <div style={{marginTop:10,padding:"8px 12px",background:"var(--surf3)",borderRadius:5,border:"1px solid var(--bdr)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>Substitution</div>
                <div style={{display:"flex",gap:2,background:"var(--surf2)",borderRadius:4,padding:2}}>
                  {[{v:"brand_allowed",l:"Generic OK"},{v:"brand_only",l:"Brand Only — DAW"},{v:"patient_req",l:"Patient Requested"}].map(m=>(<button key={m.v} onClick={()=>setForm(f=>({...f,dispenseAs:m.v}))} style={{flex:1,padding:"3px 6px",borderRadius:3,fontSize:10,fontWeight:form.dispenseAs===m.v?700:400,background:form.dispenseAs===m.v?"var(--surf3)":"transparent",color:form.dispenseAs===m.v?"var(--tx)":"var(--tx3)"}}>{m.l}</button>))}
                </div>
              </div>

              {selectedDrug?.controlled&&(
                <div style={{marginTop:10,background:"var(--amber)10",border:"1px solid var(--amber)44",borderRadius:5,padding:"9px 12px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--amber)",marginBottom:6}}>Controlled Substance — {selectedDrug.schedule}</div>
                  <label style={{display:"flex",gap:8,alignItems:"flex-start",cursor:"pointer"}}>
                    <input type="checkbox" checked={form.controlled_verify} onChange={e=>setForm(f=>({...f,controlled_verify:e.target.checked}))} style={{marginTop:2}}/>
                    <span style={{fontSize:11,color:"var(--tx2)",lineHeight:1.5}}>I confirm this prescription is medically necessary, patient identity verified, DEA {patient.dea} applies. State PDMP checked.</span>
                  </label>
                </div>
              )}

              {canWrite&&selectedDrug&&(
                <div style={{marginTop:14}}>
                  {rxSent&&<div style={{background:"var(--green)12",border:"1px solid var(--green)44",borderRadius:5,padding:"8px 12px",marginBottom:8,fontSize:12,fontWeight:700,color:"var(--green)"}}>✓ Prescription sent to {pharmacyLabel}</div>}
                  <Btn color="var(--rx)" style={{width:"100%",justifyContent:"center",display:"flex",opacity:selectedDrug.controlled&&!form.controlled_verify?0.4:1}} disabled={selectedDrug?.controlled&&!form.controlled_verify} onClick={handleSend}>
                    ℞ Send to {pharmacyLabel}
                  </Btn>
                  <div style={{fontSize:10,color:"var(--tx3)",marginTop:5,textAlign:"center"}}>Prescriber: {currentUser} · Audit-logged · {selectedDrug.controlled?"EPCS/paper":"SureScripts"}</div>
                </div>
              )}
            </Sec>

            {/* Sent Rx log */}
            {sentRx.length>0&&(
              <Sec title="Sent This Session" accent="var(--green)">
                {sentRx.map((rx,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:"1px solid var(--bdr2)",alignItems:"center"}}>
                  <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{rx.drug} {rx.strength}</div><div style={{fontSize:10,color:"var(--tx3)"}}>{rx.pharmacy} · {rx.ts}</div></div>
                  <Pill color="var(--green)" small>Sent</Pill>
                  {rx.controlled&&<Pill color="var(--amber)" small>{rx.schedule}</Pill>}
                </div>))}
              </Sec>
            )}
          </div>
        </div>
      )}

      {rxMode==="inhouse_queue"&&(
        <div>
          <div style={{fontSize:12,color:"var(--tx2)",marginBottom:12}}>In-house pharmacy queue for {patient.name} — all orders routed to dispensing system</div>
          {[...QUEUE_INHOUSE,...sentRx.filter(r=>r.type==="inhouse").map(r=>({id:r.id,drug:`${r.drug} ${r.strength||""}`,status:"queued",ts:r.ts,location:INHOUSE_PHARMACIES[0].name,urgent:false}))].map((item,i)=>(
            <HCard key={i} style={{marginBottom:8,padding:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:600}}>{item.drug}</span>
                    {item.urgent&&<Pill color="var(--red)" small>Urgent</Pill>}
                  </div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{item.location} · Ordered {item.ts}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <Pill color={statusColor(item.status)}>{item.status}</Pill>
                  {item.status==="ready"&&<Btn small color="var(--green)" outline>Confirm Pick-up</Btn>}
                </div>
              </div>
            </HCard>
          ))}
        </div>
      )}

      {rxMode==="outside_queue"&&(
        <div>
          <div style={{fontSize:12,color:"var(--tx2)",marginBottom:12}}>Outside prescriptions sent for {patient.name} — transmitted via SureScripts</div>
          {[...patient.meds.map(m=>({id:m.rxId,drug:m.name,pharmacy:OUTSIDE_PHARMACIES.find(p=>p.id===patient.preferredPharmacy)?.name||"—",status:"transmitted",ts:m.given||"—"})),...sentRx.filter(r=>r.type==="outside")].map((item,i)=>(
            <HCard key={i} style={{marginBottom:8,padding:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{item.drug}</div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{item.pharmacy} · {item.ts}</div>
                </div>
                <Pill color={statusColor(item.status||"sent")}>{item.status||"sent"}</Pill>
              </div>
            </HCard>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── LAB RESULTS TAB ─────────────────────────────────────── */
const LabResultsTab=({patient,canWrite,currentUser})=>{
  const[filter,setFilter]=useState("all"); // all|inhouse|outside|poc|pending|abnormal
  const[ackedLabs,setAckedLabs]=useState({});

  const allLabs=[
    ...patient.labs,
    // additional outside ref labs
    ...(patient.id==="PT-001"?[
      {id:"l6",name:"Blood Culture × 2",val:"No growth — 48h",unit:"",ref:"No growth",flag:"N",ts:"Yesterday",source:"outside",lab:"LabCorp",status:"resulted",ack:true},
      {id:"l7",name:"Urine Culture & Sensitivity",val:"Pending",unit:"",ref:"",flag:"N",ts:"—",source:"outside",lab:"LabCorp",status:"pending",ack:false},
    ]:[]),
    ...(patient.id==="PT-002"?[
      {id:"l6",name:"Hemoglobin A1c",val:"8.4%",unit:"",ref:"<5.7%",flag:"H",ts:"2 wk ago",source:"outside",lab:"LabCorp",status:"resulted",ack:true},
    ]:[]),
  ];

  const filtered=allLabs.filter(l=>{
    if(filter==="inhouse") return l.source==="inhouse";
    if(filter==="outside") return l.source==="outside";
    if(filter==="poc") return l.source==="poc";
    if(filter==="pending") return l.status==="pending";
    if(filter==="abnormal") return l.flag!=="N";
    return true;
  });

  const unacked=allLabs.filter(l=>l.flag!=="N"&&!l.ack&&!ackedLabs[l.id]);

  const sourceColor={inhouse:"var(--lab)",outside:"var(--cyan)",poc:"var(--green)"};
  const sourceLabel={inhouse:"In-House Lab",outside:"Reference Lab",poc:"POC"};

  const ORDER_NEW_LABS=["troponin_hs","cmp","cbc_diff","ua","poc_glucose","poc_lactate","blood_cx","urine_cx"];

  return(
    <div>
      {/* Unacknowledged banner */}
      {unacked.length>0&&(
        <div style={{background:"var(--red)08",border:"1px solid var(--red)30",borderRadius:7,padding:"10px 14px",marginBottom:12,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>⚠ {unacked.length} Unacknowledged</span>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {unacked.map(l=>(<div key={l.id} style={{display:"flex",gap:8,alignItems:"center",background:"var(--surf3)",border:`1px solid ${flagColor(l.flag)}44`,borderRadius:5,padding:"5px 10px"}}>
              <div><div style={{fontSize:10,color:"var(--tx3)"}}>{l.name}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:13,color:flagColor(l.flag)}}>{l.val||"—"}{l.flag==="H"?"↑":l.flag==="L"?"↓":""}</div></div>
              {canWrite&&<button onClick={()=>setAckedLabs(a=>({...a,[l.id]:true}))} style={{padding:"2px 8px",borderRadius:3,background:"var(--green)",color:"#fff",fontSize:10,fontWeight:600}}>Ack</button>}
            </div>))}
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:14}}>
        <div>
          {/* Filter bar */}
          <div style={{display:"flex",gap:2,marginBottom:10,background:"var(--surf3)",borderRadius:6,padding:2,border:"1px solid var(--bdr)",width:"fit-content"}}>
            {[{v:"all",l:"All"},{v:"inhouse",l:"In-House"},{v:"outside",l:"Reference Lab"},{v:"poc",l:"POC"},{v:"pending",l:"Pending"},{v:"abnormal",l:"Abnormal"}].map(f=>(<button key={f.v} onClick={()=>setFilter(f.v)} style={{padding:"4px 12px",borderRadius:4,fontSize:11,fontWeight:filter===f.v?700:500,background:filter===f.v?"var(--lab)22":"transparent",color:filter===f.v?"var(--lab)":"var(--tx2)",border:`1px solid ${filter===f.v?"var(--lab)44":"transparent"}`}}>{f.l}</button>))}
          </div>

          {/* Results table */}
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"2px solid var(--bdr)"}}>
                  {["Test","Value","Reference","Source","Lab / Location","Status","Time","Ack"].map(h=>(<th key={h} style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textAlign:"left",padding:"5px 8px",letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l=>{
                  const isAcked=l.ack||ackedLabs[l.id];
                  return(<tr key={l.id} style={{borderBottom:"1px solid var(--bdr2)",background:l.status==="pending"?"var(--amber)03":l.flag!=="N"&&!isAcked?"var(--red)04":"transparent"}}>
                    <td style={{padding:"7px 8px",fontSize:12,fontWeight:l.flag!=="N"&&!isAcked?700:500}}>{l.name}</td>
                    <td style={{padding:"7px 8px",fontFamily:"var(--ffm)",fontWeight:700,fontSize:13,color:l.status==="pending"?"var(--tx3)":flagColor(l.flag)}}>
                      {l.status==="pending"?<span style={{color:"var(--amber)"}}>⏳ Pending</span>:<>{l.val}{l.flag==="H"&&<span style={{fontSize:9}}>↑</span>}{l.flag==="L"&&<span style={{fontSize:9}}>↓</span>}</>}
                    </td>
                    <td style={{padding:"7px 8px",fontSize:11,color:"var(--tx3)",fontFamily:"var(--ffm)"}}>{l.ref||"—"}</td>
                    <td style={{padding:"7px 8px"}}><span style={{fontSize:10,color:sourceColor[l.source]||"var(--tx3)",fontWeight:600}}>{sourceLabel[l.source]||l.source}</span></td>
                    <td style={{padding:"7px 8px",fontSize:11,color:"var(--tx3)"}}>{l.lab||"In-house"}</td>
                    <td style={{padding:"7px 8px"}}><Pill color={statusColor(l.status)} small>{l.status}</Pill></td>
                    <td style={{padding:"7px 8px",fontSize:11,color:"var(--tx3)",fontFamily:"var(--ffm)",whiteSpace:"nowrap"}}>{l.ts}</td>
                    <td style={{padding:"7px 8px"}}>
                      {l.flag!=="N"&&(isAcked?<span style={{fontSize:10,color:"var(--green)"}}>✓</span>:canWrite?<button onClick={()=>setAckedLabs(a=>({...a,[l.id]:true}))} style={{padding:"2px 7px",borderRadius:3,background:"var(--acc)22",color:"var(--acc)",fontSize:10,fontWeight:700,border:"1px solid var(--acc)44"}}>Ack</button>:<span style={{fontSize:10,color:"var(--amber)"}}>Unread</span>)}
                    </td>
                  </tr>);
                })}
                {filtered.length===0&&<tr><td colSpan={8} style={{padding:"24px",textAlign:"center",color:"var(--tx3)",fontSize:12}}>No results match this filter.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: quick order + lab info */}
        <div>
          <Sec title="Quick Lab Order" accent="var(--lab)">
            <div style={{fontSize:11,color:"var(--tx2)",marginBottom:8,lineHeight:1.5}}>Common orders — adds to Order Entry cart. Set priority and submit from Order Entry tab.</div>
            {ORDER_CATALOG.labs_inhouse.filter(l=>ORDER_NEW_LABS.includes(l.id)).map(l=>(<div key={l.id} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 0",borderBottom:"1px solid var(--bdr2)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:500}}>{l.name}</div>
                <div style={{fontSize:10,color:"var(--tx3)"}}>TAT: {l.tat}</div>
              </div>
              {l.poc&&<Pill color="var(--green)" small>POC</Pill>}
              {l.stat&&<Pill color="var(--red)" small>STAT</Pill>}
            </div>))}
          </Sec>
          <Sec title="Reference Lab Status" accent="var(--cyan)">
            {[{lab:"LabCorp",status:"healthy",tat:"On time"},{lab:"Quest",status:"healthy",tat:"On time"},{lab:"Mayo Clinic Labs",status:"delayed",tat:"+1 day delay"}].map((l,i)=>(<div key={i} style={{display:"flex",gap:7,alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}>
              <div style={{width:6,height:6,borderRadius:3,background:l.status==="healthy"?"var(--green)":"var(--amber)"}}/>
              <span style={{fontSize:11,flex:1}}>{l.lab}</span>
              <span style={{fontSize:10,color:l.status==="delayed"?"var(--amber)":"var(--tx3)"}}>{l.tat}</span>
            </div>))}
          </Sec>
        </div>
      </div>
    </div>
  );
};

/* ─── CLINICAL VIEW ───────────────────────────────────────── */
const ClinicalView=({patient,setMod,currentUser,readOnly,roleConf,role})=>{
  const[ackedLabs,setAckedLabs]=useState({});
  const[ackedImaging,setAckedImaging]=useState({});
  const[showNoteAI,setShowNoteAI]=useState(false);
  const[tasksDone,setTasksDone]=useState({});
  const nd=patient?NURSING_DATA[patient.id]:null;
  if(!patient) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:14}}><div style={{fontSize:52,opacity:0.12}}>◈</div><div style={{fontWeight:600}}>No patient selected</div><Btn onClick={()=>setMod("dashboard")} color="var(--acc)">Patient List</Btn></div>);
  const unackedLabs=patient.labs.filter(l=>l.flag!=="N"&&!l.ack&&!ackedLabs[l.id]);
  const unackedImaging=patient.imaging.filter(i=>!i.ack&&!ackedImaging[i.type]&&i.state!=="ordered");
  return(
    <div className="mod-enter">
      {readOnly&&<ReadOnlyBanner roleColor={roleConf.color} roleName={ROLES.find(r=>r.id===role)?.role||""}/>}
      {/* Patient header */}
      <div style={{background:"var(--surf2)",border:"1px solid var(--bdr)",borderRadius:7,padding:"11px 15px",marginBottom:10,borderLeft:`3px solid ${CTX_COLOR[patient.ctx]}`}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:17,letterSpacing:"-0.4px"}}>{patient.name}</span><span style={{color:"var(--tx2)",fontSize:13}}>{patient.age}yo · MRN {patient.mrn}</span><Pill color={CTX_COLOR[patient.ctx]}>{CTX_LABEL[patient.ctx]}</Pill>{patient.code!=="Full Code"&&<Pill color="var(--amber)">{patient.code}</Pill>}</div>
            <div style={{fontSize:12,color:"var(--tx2)",marginBottom:5}}>{patient.attending} · {patient.location}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{patient.allergies.filter(a=>a.drug!=="NKDA").map((a,i)=>(<span key={i} style={{fontSize:11,background:"#E5303015",border:"1px solid #E5303030",borderRadius:4,padding:"2px 7px",color:"var(--red)",fontWeight:500}}>⚠ {a.drug} — {a.reaction}</span>))}</div>
          </div>
          {patient.vitals.bp!=="—"&&(<div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{[{l:"BP",v:patient.vitals.bp,w:parseInt(patient.vitals.bp)>140},{l:"HR",v:patient.vitals.hr,w:parseInt(patient.vitals.hr)>100},{l:"SpO₂",v:patient.vitals.spo2,w:parseInt(patient.vitals.spo2)<95}].map((v,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:9,color:"var(--tx3)",marginBottom:1,letterSpacing:"0.06em",textTransform:"uppercase"}}>{v.l}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:15,color:v.w?"var(--red)":"var(--tx)"}}>{v.v}</div></div>))}</div>)}
        </div>
      </div>
      {/* Attention panel */}
      {(unackedLabs.length>0||unackedImaging.length>0||patient.changed.length>0)&&(
        <div style={{background:"var(--red)08",border:"1px solid var(--red)28",borderRadius:7,padding:"10px 14px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:6,height:6,borderRadius:2,background:"var(--red)",animation:"pulse 1.5s infinite"}}/><span style={{fontSize:11,fontWeight:700,color:"var(--red)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Needs attention</span>{(unackedLabs.length+unackedImaging.length)>0&&<span style={{fontSize:11,color:"var(--red)"}}>{unackedLabs.length+unackedImaging.length} unacknowledged result{(unackedLabs.length+unackedImaging.length)!==1?"s":""}</span>}</div>
          {unackedLabs.length>0&&<div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:patient.changed.length>0?8:0}}>{unackedLabs.map(l=>(<div key={l.id} style={{display:"flex",alignItems:"center",gap:8,background:"var(--surf3)",border:`1px solid ${flagColor(l.flag)}44`,borderRadius:5,padding:"5px 10px"}}><div><div style={{fontSize:10,color:"var(--tx3)"}}>{l.name}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:14,color:flagColor(l.flag)}}>{l.val} {l.unit}<span style={{fontSize:10,marginLeft:2}}>{l.flag==="H"?"↑":"↓"}</span></div></div>{!readOnly&&<button onClick={()=>setAckedLabs(a=>({...a,[l.id]:true}))} style={{padding:"2px 8px",borderRadius:3,background:"var(--green)",color:"#fff",fontSize:10,fontWeight:600}}>Ack</button>}</div>))}</div>}
          {patient.changed.length>0&&<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>Changed:</span>{patient.changed.map((c,i)=>(<span key={i} style={{fontSize:12,color:"var(--tx2)"}}>{i>0&&<span style={{color:"var(--tx3)",margin:"0 5px"}}>·</span>}{c}</span>))}</div>}
        </div>
      )}
      {/* Tasks */}
      {patient.tasks.length>0&&(<div style={{background:"var(--surf2)",border:"1px solid var(--bdr2)",borderRadius:7,padding:"10px 14px",marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:7}}>Open Tasks</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{patient.tasks.map(t=>(<div key={t.id} style={{display:"flex",alignItems:"center",gap:7,background:"var(--surf3)",border:`1px solid ${t.priority==="urgent"?"var(--red)28":"var(--bdr)"}`,borderRadius:5,padding:"6px 10px",opacity:tasksDone[t.id]?0.5:1}}>{tasksDone[t.id]?<span style={{color:"var(--green)",fontWeight:700,fontSize:11}}>✓</span>:<div style={{width:5,height:5,borderRadius:2,background:t.priority==="urgent"?"var(--red)":"var(--amber)"}}/>}<div><div style={{fontSize:11,fontWeight:600,textDecoration:tasksDone[t.id]?"line-through":"none",color:tasksDone[t.id]?"var(--tx3)":"var(--tx)"}}>{t.label}</div><div style={{fontSize:10,color:"var(--tx3)"}}>→ {t.owner}</div></div>{!readOnly&&!tasksDone[t.id]&&<button onClick={()=>setTasksDone(d=>({...d,[t.id]:true}))} style={{padding:"1px 7px",borderRadius:3,background:"var(--acc)20",color:"var(--acc)",fontSize:9,fontWeight:700,border:"1px solid var(--acc)44",marginLeft:3}}>Done</button>}</div>))}</div></div>)}
      {/* Nursing strip */}
      {nd&&(<div style={{background:"var(--nurse)0A",border:"1px solid var(--nurse)28",borderRadius:5,padding:"7px 12px",marginBottom:10,display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:10,fontWeight:700,color:"var(--nurse)",letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>♥ Nursing</span>{[{l:"Pain",v:`${nd.painScore}/10`,c:nd.painScore>=7?"var(--red)":"var(--tx2)"},{l:"I/O",v:`${nd.io.in}↓/${nd.io.out}↑mL`,c:"var(--tx2)"},{l:"Next vitals",v:nd.nextVitals,c:"var(--amber)"}].map((k,i)=>(<div key={i} style={{fontSize:12}}><span style={{color:"var(--tx3)"}}>{k.l}: </span><strong style={{color:k.c}}>{k.v}</strong></div>))}</div>)}
      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Sec title="Active Problems" accent="var(--red)">{patient.problems.filter(p=>p.active).map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 0",borderBottom:"1px solid var(--bdr2)"}}><div style={{width:6,height:6,borderRadius:2,flexShrink:0,background:p.sev==="critical"?"var(--red)":"var(--amber)"}}/><span style={{fontSize:12,flex:1,fontWeight:p.sev==="critical"?600:400}}>{p.name}</span><span style={{fontSize:10,color:"var(--tx3)",fontFamily:"var(--ffm)"}}>{p.icd}</span></div>))}</Sec>
        <Sec title="Lab Results" accent="var(--green)" action={!readOnly&&roleConf.aiEnabled&&<button onClick={()=>setShowNoteAI(v=>!v)} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:600,background:showNoteAI?"var(--ai)30":"var(--ai)18",border:`1px solid ${showNoteAI?"var(--ai)":"var(--ai)40"}`,color:"var(--ai)"}}><span>✦</span>Note</button>}>
          <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{patient.labs.map((l,i)=>{const isAcked=l.ack||ackedLabs[l.id];return(<tr key={i} style={{borderBottom:"1px solid var(--bdr2)",background:l.flag!=="N"&&!isAcked?"var(--red)07":"transparent"}}><td style={{padding:"5px 4px",fontSize:12}}>{l.name}</td><td style={{padding:"5px 4px",fontFamily:"var(--ffm)",fontWeight:700,fontSize:13,color:l.status==="pending"?"var(--amber)":flagColor(l.flag)}}>{l.status==="pending"?"pending":l.val}{l.flag==="H"&&l.status!=="pending"&&<span style={{fontSize:9}}>↑</span>}{l.flag==="L"&&<span style={{fontSize:9}}>↓</span>}</td><td style={{padding:"5px 4px",fontSize:10,color:"var(--tx3)"}}>{l.unit}</td><td style={{padding:"5px 4px",textAlign:"right"}}>{l.flag!=="N"&&(isAcked?<span style={{fontSize:9,color:"var(--green)"}}>✓</span>:<span style={{fontSize:9,color:"var(--amber)",fontWeight:700}}>unread</span>)}</td></tr>);})}</tbody></table>
        </Sec>
        <Sec title="Medications" accent="var(--cyan)">{patient.meds.map((m,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{fontSize:12,flex:1}}>{m.name}</span><span style={{fontSize:10,color:"var(--tx3)"}}>{m.given}</span><Pill color={statusColor(m.status)} small>{m.status}</Pill></div>))}</Sec>
        <Sec title="Active Orders" accent="var(--acc)">{patient.orders.map((o,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><div style={{width:5,height:5,borderRadius:2,flexShrink:0,background:statusColor(o.priority||"routine")}}/><span style={{fontSize:11,flex:1}}>{o.name}</span><span style={{fontSize:9,color:"var(--tx3)"}}>{o.owner?.split(" ")[0]}</span><Pill color={statusColor(o.status)} small>{o.status}</Pill></div>))}</Sec>
        {showNoteAI&&(<div style={{gridColumn:"1/-1"}}><AIPanel title="Progress Note" desc="Draft progress note from clinical data." getPrompt={()=>`A&P progress note for ${patient.name}, ${patient.age}yo. CC: ${patient.cc}. Problems: ${patient.problems.filter(p=>p.active).map(p=>p.name+" ("+p.icd+")").join(", ")}. Vitals: BP ${patient.vitals.bp}, HR ${patient.vitals.hr}, SpO2 ${patient.vitals.spo2}. Labs: ${patient.labs.map(l=>`${l.name} ${l.val} [${l.flag}]`).join(" | ")}. Under 200 words, mark [VERIFY] where needed.`} onDismiss={()=>setShowNoteAI(false)} currentUser={currentUser} patientId={patient.id} role={role}/></div>)}
      </div>
    </div>
  );
};

/* ─── DASHBOARD ───────────────────────────────────────────── */
const Dashboard=({onSelect,roleConf,role,setMod})=>{
  const PATIENTS=useContext(PatientsCtx);
  const isNurse=role==="nurse";
  const allTasks=Object.values(NURSING_DATA).flatMap(nd=>nd.tasks);
  const odCount=allTasks.filter(t=>t.status==="overdue").length;
  const dueCount=allTasks.filter(t=>t.status==="due").length;
  return(
    <div className="mod-enter">
      <div style={{marginBottom:14}}><h1 style={{fontSize:20,fontWeight:700,letterSpacing:"-0.5px",marginBottom:3}}>Patient List</h1><Pill color={roleConf.color} small>{ROLES.find(r=>r.id===role)?.role}</Pill></div>
      {isNurse&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>{[{l:"Shift Board",icon:"▦",mod:"shift_board",c:"var(--nurse)"},{l:`${odCount} Overdue`,icon:"⚠",mod:"shift_board",c:odCount>0?"var(--red)":"var(--tx3)"},{l:`${dueCount} Due Now`,icon:"◌",mod:"shift_board",c:dueCount>0?"var(--amber)":"var(--tx3)"},{l:"Nursing Handoff",icon:"⇄",mod:"nurse_handoff",c:"var(--nurse)"}].map((k,i)=>(<HCard key={i} onClick={()=>setMod(k.mod)} style={{padding:10,border:`1px solid ${k.c}28`,cursor:"pointer"}}><div style={{fontSize:17,color:k.c,marginBottom:3}}>{k.icon}</div><div style={{fontWeight:700,fontSize:12,color:k.c}}>{k.l}</div></HCard>))}</div>}
      {PATIENTS.map(p=>{
        const nd=NURSING_DATA[p.id];const ptOD=nd?nd.tasks.filter(t=>t.status==="overdue").length:0;const ptDue=nd?nd.tasks.filter(t=>t.status==="due").length:0;
        const unreadLabs=p.labs.filter(l=>l.flag!=="N"&&!l.ack).length;
        return(<HCard key={p.id} onClick={()=>onSelect(p)} style={{padding:14,marginBottom:7,borderLeft:ptOD>0?"3px solid var(--red)":ptDue>0?"3px solid var(--amber)":"3px solid transparent"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:7,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}><span style={{fontWeight:700,fontSize:14}}>{p.name}</span><span style={{color:"var(--tx2)",fontSize:11}}>{p.age}yo · MRN {p.mrn}</span>{p.code!=="Full Code"&&<Pill color="var(--amber)">{p.code}</Pill>}<Pill color={CTX_COLOR[p.ctx]} small>{CTX_LABEL[p.ctx]}</Pill>{nd&&<span style={{fontSize:11,color:"var(--tx3)"}}>{nd.room}</span>}</div>
              <div style={{fontSize:12,color:"var(--tx2)",marginBottom:3}}>{p.cc}</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>{p.attending}</div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end",flexShrink:0}}>
              {ptOD>0&&<Pill color="var(--red)">{ptOD} overdue</Pill>}
              {ptDue>0&&<Pill color="var(--amber)">{ptDue} due</Pill>}
              {unreadLabs>0&&<Pill color="var(--amber)" small>{unreadLabs} unread lab{unreadLabs!==1?"s":""}</Pill>}
            </div>
            <div style={{color:"var(--tx3)",fontSize:16,alignSelf:"center"}}>›</div>
          </div>
        </HCard>);
      })}
    </div>
  );
};

/* ─── RADIOLOGY ───────────────────────────────────────────── */
const RADIOLOGY_QUEUE=[
  {id:"R-001",mrn:"4421-887",name:"Marcus Chen",age:67,study:"CXR Portable",modality:"XR",priority:"stat",status:"ordered",assigned:"Dr. Menon",ts:"14:20",clinical:"Anterior STEMI. Rule out pulmonary edema.",flags:["STAT"]},
  {id:"R-002",mrn:"5512-004",name:"Raymond Alcazar",age:58,study:"PET/CT Chest/Abd/Pelvis",modality:"PET",priority:"routine",status:"prelim",assigned:"Dr. Menon",ts:"Today 10:30",clinical:"Lung adenocarcinoma staging.",flags:["COMPARISON AVAILABLE","PRELIM — NEEDS SIGN"]},
  {id:"R-003",mrn:"8821-331",name:"Elaine Burch",age:81,study:"CT Head w/o Contrast",modality:"CT",priority:"urgent",status:"read_pending",assigned:"Dr. Menon",ts:"13:45",clinical:"Acute confusion, fall. Rule out bleed. On apixaban.",flags:["URGENT","CRITICAL RESULT POSSIBLE"]},
];

const Radiology=({currentUser,roleConf,role})=>{
  const PATIENTS=useContext(PatientsCtx);
  const[active,setActive]=useState(RADIOLOGY_QUEUE[1]);
  const[reportState,setReportState]=useState("prelim");
  const[showAI,setShowAI]=useState(false);
  const[hanging,setHanging]=useState("1up");
  const isOwner=role==="radiologist";
  const patient=PATIENTS.find(p=>p.mrn===active?.mrn);
  const stateColor={ordered:"#6FA898",read_pending:"#E89020",prelim:"#E89020",final:"#18A060"};
  const stateLabel={ordered:"Ordered",read_pending:"Read Pending",prelim:"Prelim — Needs Sign",final:"Final — Signed"};
  return(
    <div className="mod-enter">
      {!isOwner&&<ReadOnlyBanner roleColor={roleConf.color} roleName={ROLES.find(r=>r.id===role)?.role||""}/>}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        <div><h2 style={{fontWeight:700,fontSize:20,letterSpacing:"-0.4px",marginBottom:1}}>Radiology / PACS</h2><div style={{fontSize:11,color:"var(--tx3)"}}>Worklist · Context · Reader · Report — one system</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>{[{l:"STAT",c:"var(--red)",n:1},{l:"Urgent",c:"var(--amber)",n:1},{l:"Prelim",c:"var(--amber)",n:1}].map((k,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:4,background:`${k.c}15`,border:`1px solid ${k.c}28`}}><span style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:14,color:k.c}}>{k.n}</span><span style={{fontSize:10,color:k.c,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{k.l}</span></div>))}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"210px 1fr",gap:12}}>
        {/* Worklist */}
        <div style={{background:"var(--surf)",border:"1px solid var(--bdr2)",borderRadius:7,maxHeight:680,overflow:"auto"}}>
          <div style={{padding:"9px 12px",borderBottom:"1px solid var(--bdr2)",fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Queue</div>
          {RADIOLOGY_QUEUE.map(s=>(<div key={s.id} onClick={()=>{setActive(s);setShowAI(false);setReportState(s.status);}} style={{padding:"10px 12px",borderBottom:"1px solid var(--bdr2)",cursor:"pointer",background:active?.id===s.id?"var(--acc)12":"transparent",borderLeft:`3px solid ${active?.id===s.id?"var(--acc)":s.priority==="stat"?"var(--red)":s.priority==="urgent"?"var(--amber)":"transparent"}`}}>
            <div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{s.name}</div>
            <div style={{fontSize:11,color:"var(--tx2)",marginBottom:4,fontWeight:500}}>{s.study}</div>
            <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{s.flags.map((f,i)=>(<Pill key={i} color={f.includes("STAT")?"var(--red)":f.includes("PRELIM")?"var(--amber)":f.includes("CRITICAL")?"var(--red)":f.includes("COMPARISON")?"var(--cyan)":"var(--tx3)"} small>{f}</Pill>))}</div>
            <div style={{fontSize:10,color:"var(--tx3)",marginTop:3}}>{s.ts}</div>
          </div>))}
        </div>
        {/* Reader */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:"var(--surf2)",border:`1px solid ${stateColor[reportState]||"var(--bdr2)"}35`,borderRadius:6}}>
            <div style={{display:"flex",gap:2}}>{["ordered","read_pending","prelim","final"].map(st=>(<div key={st} style={{padding:"2px 9px",borderRadius:3,fontSize:10,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",background:reportState===st?`${stateColor[st]}22`:"transparent",color:reportState===st?stateColor[st]:"var(--tx3)",border:`1px solid ${reportState===st?stateColor[st]+"44":"transparent"}`}}>{stateLabel[st]}</div>))}</div>
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              <div style={{display:"flex",gap:1,background:"var(--surf3)",borderRadius:4,padding:"1px",border:"1px solid var(--bdr)"}}>{["1up","2up","comp"].map(h=>(<button key={h} onClick={()=>setHanging(h)} style={{padding:"3px 9px",borderRadius:3,fontSize:10,fontWeight:hanging===h?700:500,background:hanging===h?"var(--acc)":"transparent",color:hanging===h?"#fff":"var(--tx3)"}}>{h==="comp"?"Comp":h}</button>))}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:10}}>
            <div style={{background:"#020810",border:"1px solid var(--bdr2)",borderRadius:7,minHeight:210,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 40% 50%, #0a1f3a 0%, #010810 70%)"}}/>
              {hanging==="comp"&&<div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"#0a3a6a",zIndex:5}}/>}
              {[{l:42,t:30,w:55,h:22},{l:20,t:50,w:35,h:14},{l:60,t:55,w:44,h:18},{l:10,t:20,w:28,h:12}].map((s,i)=>(<div key={i} style={{position:"absolute",width:s.w,height:s.h,background:"rgba(30,80,160,0.24)",borderRadius:99,left:`${s.l}%`,top:`${s.t}%`,filter:"blur(2px)"}}/>))}
              <div style={{position:"relative",zIndex:2,textAlign:"center"}}><div style={{fontSize:9,color:"#2a6a9a",letterSpacing:"0.12em",marginBottom:3}}>{active?.modality||"—"} · {active?.study} {hanging==="comp"&&<span style={{color:"#0a6a8a",marginLeft:6}}>+ Comparison</span>}</div><div style={{fontSize:7,color:"#1a4a6a"}}>DICOM VIEWER</div><div style={{marginTop:8,display:"flex",gap:4,justifyContent:"center"}}>{["W/L","Zoom","Pan","Measure","MPR"].map(t=>(<div key={t} style={{fontSize:8,color:"#2a6a9a",padding:"2px 6px",border:"1px solid #0a3a5a",borderRadius:3}}>{t}</div>))}</div></div>
            </div>
            <div style={{background:"var(--surf2)",border:"1px solid var(--bdr2)",borderRadius:7,padding:11,overflow:"auto",maxHeight:220}}>
              <div style={{fontSize:9,fontWeight:700,color:"var(--acc)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>Patient Context</div>
              {patient?(<><div style={{fontWeight:700,fontSize:12,marginBottom:1}}>{patient.name} · {patient.age}yo</div><div style={{fontSize:11,color:"var(--tx2)",marginBottom:7}}>{patient.cc}</div>{patient.problems.filter(p=>p.active).map((p,i)=>(<div key={i} style={{fontSize:11,color:p.sev==="critical"?"var(--red)":"var(--tx2)",marginBottom:1}}>· {p.name}</div>))}<div style={{fontSize:9,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.06em",textTransform:"uppercase",marginTop:7,marginBottom:3}}>Clinical Indication</div><div style={{fontSize:11,color:"var(--tx2)",lineHeight:1.5}}>{active?.clinical}</div></>):<div style={{fontSize:11,color:"var(--tx3)"}}>—</div>}
            </div>
          </div>
          <div style={{background:"var(--surf2)",border:"1px solid var(--bdr2)",borderRadius:7,padding:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:13}}>Report</span><Pill color={stateColor[reportState]} small>{stateLabel[reportState]}</Pill>{isOwner&&active?.flags.includes("COMPARISON AVAILABLE")&&<Pill color="var(--cyan)" small>Comparison</Pill>}<div style={{marginLeft:"auto",display:"flex",gap:6}}>{isOwner&&<button onClick={()=>setShowAI(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"3px 9px",borderRadius:4,background:showAI?"var(--ai)30":"var(--ai)18",border:`1px solid ${showAI?"var(--ai)":"var(--ai)40"}`,color:"var(--ai)",fontWeight:600}}><span>✦</span>AI Impression</button>}{isOwner&&reportState!=="final"&&<Btn small color="var(--green)" onClick={()=>setReportState("final")}>Sign Final</Btn>}</div></div>
            {patient?.imaging.filter(i=>i.state!=="ordered").map((img,i)=>(<div key={i} style={{marginBottom:8,padding:"7px 10px",background:"var(--surf3)",borderRadius:5,borderLeft:`3px solid ${flagColor(img.flag)}`}}><div style={{fontSize:9,fontWeight:700,color:flagColor(img.flag),letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:3}}>{img.type} · {img.ts}</div><div style={{fontSize:12,color:"var(--tx2)",lineHeight:1.6}}>{img.desc}</div></div>))}
            {showAI&&isOwner?(<AIPanel title="Radiology Impression" desc="Generate structured impression from findings and clinical context." getPrompt={()=>`Radiology IMPRESSION section for ${active?.study}. Clinical: ${active?.clinical}. Findings: ${patient?.imaging.map(i=>`${i.type}: ${i.desc}`).join(" | ")}. 3-5 sentences, standard radiology language.`} onDismiss={()=>setShowAI(false)} currentUser={currentUser} patientId={patient?.id} role={role}/>) : (<div><div style={{fontSize:9,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>IMPRESSION</div><textarea style={{width:"100%",background:"var(--surf3)",border:"1px solid var(--bdr)",borderRadius:5,padding:"7px 10px",color:"var(--tx)",fontSize:12,resize:"vertical",minHeight:52,lineHeight:1.6}} placeholder="Dictate or use AI Impression…"/></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── NURSING MODULES (compact) ──────────────────────────── */
const ShiftBoard=({onSelectPatient,chartPatient,setChartPatient})=>{
  const PATIENTS=useContext(PatientsCtx);
  const pts=PATIENTS.filter(p=>NURSING_DATA[p.id]);
  const allTasks=pts.flatMap(p=>(NURSING_DATA[p.id]?.tasks||[]).map(t=>({...t,patient:p})));
  const overdue=allTasks.filter(t=>t.status==="overdue");const due=allTasks.filter(t=>t.status==="due");const done=allTasks.filter(t=>t.status==="done");
  const progress=Math.round((done.length/allTasks.length)*100);
  return(<div className="mod-enter">
    <div style={{background:"linear-gradient(120deg,var(--nurse)18,var(--surf2) 60%)",border:"1px solid var(--nurse)30",borderRadius:7,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
      <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}><span style={{fontSize:14}}>♥</span><span style={{fontWeight:700,fontSize:14,color:"var(--nurse)"}}>Shift Board</span><Pill color="var(--nurse)" small>Day 07:00–19:00</Pill></div><div style={{fontSize:11,color:"var(--tx2)"}}>Alex Torres, RN · {pts.length} patients</div></div>
      <div style={{flex:1}}/>
      {[{l:"Overdue",v:overdue.length,c:"var(--red)"},{l:"Due Now",v:due.length,c:"var(--amber)"},{l:"Done",v:done.length,c:"var(--green)"},{l:"Shift",v:`${progress}%`,c:"var(--nurse)"}].map((k,i)=>(<div key={i} style={{textAlign:"center",minWidth:54}}><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:20,color:k.c,lineHeight:1}}>{k.v}</div><div style={{fontSize:9,color:"var(--tx3)",marginTop:1,letterSpacing:"0.06em",textTransform:"uppercase"}}>{k.l}</div></div>))}
      <div style={{minWidth:100}}><div style={{height:4,background:"var(--surf3)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${progress}%`,background:"var(--nurse)",borderRadius:3}}/></div></div>
    </div>
    {overdue.length>0&&<div style={{background:"var(--red)0C",border:"1px solid var(--red)28",borderRadius:5,padding:"7px 12px",marginBottom:9,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:10,fontWeight:700,color:"var(--red)",textTransform:"uppercase",letterSpacing:"0.06em"}}>⚠ {overdue.length} Overdue</span>{overdue.map((t,i)=>(<span key={i} style={{fontSize:11,color:"var(--tx2)"}}>{i>0&&<span style={{color:"var(--tx3)",margin:"0 4px"}}>·</span>}{t.label} <span style={{color:"var(--tx3)"}}>({t.patient.name})</span></span>))}</div>}
    <div style={{display:"grid",gap:7}}>
      {pts.map(p=>{const nd=NURSING_DATA[p.id];const ptOD=nd.tasks.filter(t=>t.status==="overdue").length;const ptDue=nd.tasks.filter(t=>t.status==="due").length;const isC=chartPatient?.id===p.id;return(<div key={p.id} style={{background:"var(--surf2)",border:`1px solid ${ptOD>0?"var(--red)28":ptDue>0?"var(--amber)24":"var(--bdr2)"}`,borderRadius:6,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderBottom:"1px solid var(--bdr2)",cursor:"pointer"}} onClick={()=>onSelectPatient(p)}>
          <div style={{width:3,alignSelf:"stretch",borderRadius:2,background:ptOD>0?"var(--red)":ptDue>0?"var(--amber)":"var(--nurse)"}}/>
          <div style={{flex:1,minWidth:0}}><div style={{display:"flex",gap:7,marginBottom:2,flexWrap:"wrap",alignItems:"center"}}><span style={{fontWeight:700,fontSize:12}}>{p.name}</span><span style={{fontSize:11,color:"var(--tx2)"}}>{nd.room}</span><Pill color={CTX_COLOR[p.ctx]} small>{CTX_LABEL[p.ctx]}</Pill>{p.code!=="Full Code"&&<Pill color="var(--amber)" small>{p.code}</Pill>}{nd.precautions.map((pr,i)=>(<Pill key={i} color="var(--purple)" small>{pr}</Pill>))}</div><div style={{fontSize:11,color:"var(--tx2)"}}>{p.cc} · Acuity {nd.acuity}/5</div></div>
          <div style={{display:"flex",gap:9,flexShrink:0}}>{[{l:"BP",v:p.vitals.bp,w:parseInt(p.vitals.bp)>140},{l:"HR",v:p.vitals.hr,w:parseInt(p.vitals.hr)>100},{l:"Pain",v:`${nd.painScore}/10`,w:nd.painScore>=7}].map((v,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:8,color:"var(--tx3)",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:1}}>{v.l}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:12,color:v.w?"var(--red)":"var(--tx)"}}>{v.v}</div></div>))}</div>
          <div style={{display:"flex",gap:4,flexShrink:0}}>{ptOD>0&&<Pill color="var(--red)">{ptOD} overdue</Pill>}{ptDue>0&&<Pill color="var(--amber)">{ptDue} due</Pill>}{ptOD===0&&ptDue===0&&<Pill color="var(--green)" small>on track</Pill>}</div>
        </div>
        <div style={{padding:"6px 12px 8px",display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {nd.tasks.sort((a,b)=>(taskSort[a.status]||9)-(taskSort[b.status]||9)).map(t=>(<div key={t.id} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:99,background:`${statusColor(t.status)}15`,border:`1px solid ${statusColor(t.status)}30`,fontSize:10}}><div style={{width:4,height:4,borderRadius:99,background:statusColor(t.status)}}/><span style={{color:t.status==="overdue"?"var(--red)":t.status==="due"?"var(--amber)":t.status==="done"?"var(--tx3)":"var(--tx)"}}>{t.label}</span>{t.status==="done"&&<span style={{color:"var(--green)",fontSize:9}}>✓</span>}</div>))}
          <button onClick={()=>setChartPatient(isC?null:p)} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:4,background:isC?"var(--nurse)":"var(--nurse)15",border:`1px solid ${isC?"var(--nurse)":"var(--nurse)38"}`,color:isC?"#fff":"var(--nurse)",fontSize:10,fontWeight:600}}>{isC?"▲ Close":"+ Chart"}</button>
        </div>
      </div>);})}
    </div>
  </div>);
};

const NurseSnapshot=({patient,setMod,setChartPatient})=>{
  const nd=patient?NURSING_DATA[patient.id]:null;
  if(!patient||!nd) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:14}}><div style={{fontSize:48,opacity:0.12}}>♥</div><div style={{fontWeight:600}}>No patient selected</div><Btn onClick={()=>setMod("shift_board")} color="var(--nurse)">Shift Board</Btn></div>);
  return(<div className="mod-enter">
    <div style={{background:"var(--surf2)",border:"1px solid var(--nurse)40",borderRadius:7,padding:"11px 14px",marginBottom:10,borderLeft:"3px solid var(--nurse)",display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
      <div style={{flex:1}}><div style={{display:"flex",gap:7,marginBottom:3,flexWrap:"wrap",alignItems:"center"}}><span style={{fontWeight:700,fontSize:14}}>{patient.name}</span><span style={{color:"var(--tx2)",fontSize:11}}>{patient.age}yo · {nd.room}</span><Pill color={CTX_COLOR[patient.ctx]}>{CTX_LABEL[patient.ctx]}</Pill>{patient.code!=="Full Code"&&<Pill color="var(--amber)">{patient.code}</Pill>}{nd.precautions.map((pr,i)=>(<Pill key={i} color="var(--purple)" small>{pr}</Pill>))}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{patient.allergies.filter(a=>a.drug!=="NKDA").map((a,i)=>(<span key={i} style={{fontSize:11,background:"#E5303015",border:"1px solid #E5303030",borderRadius:4,padding:"1px 6px",color:"var(--red)",fontWeight:500}}>⚠ {a.drug}</span>))}</div></div>
      <Btn small color="var(--nurse)" onClick={()=>setChartPatient(p=>p?.id===patient.id?null:patient)}>+ Quick Chart</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:10}}>
      <Sec title="Vitals" accent="var(--acc)" style={{marginBottom:0}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{[{l:"BP",v:patient.vitals.bp,w:parseInt(patient.vitals.bp)>140},{l:"HR",v:patient.vitals.hr,w:parseInt(patient.vitals.hr)>100},{l:"RR",v:patient.vitals.rr,w:false},{l:"SpO₂",v:patient.vitals.spo2,w:parseInt(patient.vitals.spo2)<95}].map((v,i)=>(<div key={i} style={{background:"var(--surf3)",borderRadius:4,padding:"5px 7px"}}><div style={{fontSize:8,color:"var(--tx3)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:1}}>{v.l}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:13,color:v.w?"var(--red)":"var(--tx)"}}>{v.v}</div></div>))}</div><div style={{fontSize:9,color:"var(--tx3)",marginTop:4}}>Next: {nd.nextVitals}</div></Sec>
      <Sec title="Pain" accent="var(--amber)" style={{marginBottom:0}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:44,height:44,borderRadius:99,border:`3px solid ${nd.painScore>=7?"var(--red)":nd.painScore>=4?"var(--amber)":"var(--green)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",flexShrink:0}}><span style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:16,color:nd.painScore>=7?"var(--red)":nd.painScore>=4?"var(--amber)":"var(--green)",lineHeight:1}}>{nd.painScore}</span><span style={{fontSize:7,color:"var(--tx3)"}}>/10</span></div><div style={{display:"flex",gap:2}}>{nd.painTrend.slice(-4).map((pt,i)=>(<div key={i} style={{width:18,height:18,borderRadius:3,background:`${pt.v>=7?"var(--red)":pt.v>=4?"var(--amber)":"var(--green)"}20`,border:`1px solid ${pt.v>=7?"var(--red)":pt.v>=4?"var(--amber)":"var(--green)"}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:pt.v>=7?"var(--red)":pt.v>=4?"var(--amber)":"var(--green)"}}>{pt.v}</div>))}</div></div></Sec>
      <Sec title={`I&O`} accent="var(--cyan)" style={{marginBottom:0}}><div style={{display:"flex",gap:7,marginBottom:5}}>{[{l:"In",v:nd.io.in,c:"var(--cyan)"},{l:"Out",v:nd.io.out,c:"var(--amber)"}].map((k,i)=>(<div key={i} style={{flex:1,background:`${k.c}10`,border:`1px solid ${k.c}22`,borderRadius:4,padding:"5px 7px",textAlign:"center"}}><div style={{fontSize:8,color:k.c,fontWeight:700,textTransform:"uppercase",marginBottom:1}}>{k.l}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:14,color:k.c}}>{k.v}<span style={{fontSize:8}}>mL</span></div></div>))}</div><div style={{fontSize:10,color:"var(--tx2)",textAlign:"center"}}>Net: <strong style={{color:nd.io.out>nd.io.in?"var(--green)":"var(--amber)"}}>{nd.io.out>nd.io.in?"−":"+"}  {Math.abs(nd.io.in-nd.io.out)}mL</strong></div></Sec>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
      <Sec title="Tasks" accent="var(--nurse)" action={<span style={{fontSize:10,color:"var(--tx3)"}}>{nd.tasks.filter(t=>t.status==="done").length}/{nd.tasks.length}</span>}>{nd.tasks.sort((a,b)=>(taskSort[a.status]||9)-(taskSort[b.status]||9)).map(t=>(<div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><div style={{width:5,height:5,borderRadius:2,flexShrink:0,background:statusColor(t.status)}}/><span style={{fontSize:11,flex:1,color:t.status==="done"?"var(--tx3)":"var(--tx)",textDecoration:t.status==="done"?"line-through":"none"}}>{t.label}</span><Pill color={statusColor(t.status)} small>{t.status}</Pill></div>))}</Sec>
      <div><Sec title="Lines" accent="var(--purple)">{nd.lines.map((l,i)=>(<div key={i} style={{display:"flex",gap:6,padding:"4px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--purple)",fontSize:11}}>⬡</span><span style={{fontSize:11}}>{l}</span></div>))}</Sec><Sec title="Recent Events" accent="var(--cyan)">{nd.recentEvents.slice(0,3).map((e,i)=>(<div key={i} style={{display:"flex",gap:6,padding:"4px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{fontFamily:"var(--ffm)",fontSize:9,color:"var(--tx3)",minWidth:30,marginTop:1}}>{e.ts}</span><span style={{fontSize:11,color:e.type==="alert"?"var(--red)":"var(--tx2)",lineHeight:1.4}}>{e.text}</span></div>))}</Sec></div>
    </div>
  </div>);
};

const FlowsheetView=({patient,setMod})=>{
  const nd=patient?NURSING_DATA[patient.id]:null;const[sec,setSec]=useState("vitals");
  if(!patient||!nd) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:12}}><Btn onClick={()=>setMod("shift_board")} color="var(--nurse)">Shift Board</Btn></div>);
  const abn=(v,k)=>{if(k==="spo2") return parseFloat(v)<95;if(k==="hr") return parseFloat(v)>100;if(k==="bp") return parseInt(v)>140;return false;};
  return(<div className="mod-enter"><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><h2 style={{fontWeight:700,fontSize:20,letterSpacing:"-0.4px"}}>Flowsheet</h2><span style={{fontWeight:600,color:"var(--nurse)"}}>{patient.name}</span><Pill color="var(--nurse)" small>{nd.room}</Pill><div style={{marginLeft:"auto"}}><Btn small color="var(--nurse)">+ Entry</Btn></div></div>
  <div style={{display:"flex",gap:2,marginBottom:12,borderBottom:"1px solid var(--bdr2)",overflowX:"auto"}}>{["vitals","i/o","pain","lines"].map(s=>(<button key={s} onClick={()=>setSec(s)} style={{padding:"5px 12px",fontSize:10,fontWeight:sec===s?700:400,color:sec===s?"var(--nurse)":"var(--tx2)",borderBottom:`2px solid ${sec===s?"var(--nurse)":"transparent"}`,marginBottom:-1,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{s}</button>))}</div>
  {sec==="vitals"&&<div><div style={{fontSize:11,color:"var(--tx2)",marginBottom:8}}>Schedule: <strong>{nd.vitalsSchedule}</strong> · Next due: <strong style={{color:"var(--amber)"}}>{nd.nextVitals}</strong></div><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:"2px solid var(--bdr)"}}><th style={{textAlign:"left",padding:"5px 8px",fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Time</th>{["BP","HR","RR","SpO₂","Temp"].map(h=>(<th key={h} style={{textAlign:"center",padding:"5px 8px",fontSize:10,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>))}</tr></thead><tbody>{nd.vitalsFlow.map((v,i)=>{const keys=["bp","hr","rr","spo2","temp"];const vals=[v.bp,v.hr,v.rr,v.spo2,v.temp];const isLatest=i===nd.vitalsFlow.length-1;return(<tr key={i} style={{borderBottom:"1px solid var(--bdr2)",background:isLatest?"var(--nurse)08":"transparent"}}><td style={{padding:"7px 8px",fontFamily:"var(--ffm)",fontSize:11,color:isLatest?"var(--nurse)":"var(--tx2)",fontWeight:isLatest?700:400}}>{v.ts}{isLatest&&<span style={{marginLeft:4,fontSize:8,color:"var(--nurse)",fontWeight:700}}>NOW</span>}</td>{vals.map((val,j)=>{const ab=abn(val,keys[j]);return(<td key={j} style={{padding:"7px 8px",textAlign:"center",fontFamily:"var(--ffm)",fontWeight:ab?700:500,fontSize:12,color:ab?"var(--red)":"var(--tx)",background:ab?"var(--red)06":"transparent"}}>{val}{ab&&<span style={{fontSize:8}}>↑</span>}</td>);})}</tr>);})}<tr style={{borderBottom:"1px solid var(--bdr2)",opacity:0.6}}><td style={{padding:"7px 8px",fontFamily:"var(--ffm)",fontSize:10,color:"var(--amber)",fontWeight:700}}>{nd.nextVitals} <span style={{fontSize:7,background:"var(--amber)22",borderRadius:2,padding:"1px 3px"}}>DUE</span></td>{["—","—","—","—","—"].map((v,j)=>(<td key={j} style={{textAlign:"center",padding:"7px 8px",color:"var(--tx3)",fontSize:12}}>—</td>))}</tr></tbody></table></div>}
  {sec==="pain"&&<div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:50,height:50,borderRadius:99,border:`3px solid ${nd.painScore>=7?"var(--red)":nd.painScore>=4?"var(--amber)":"var(--green)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><span style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:20,color:nd.painScore>=7?"var(--red)":nd.painScore>=4?"var(--amber)":"var(--green)",lineHeight:1}}>{nd.painScore}</span><span style={{fontSize:8,color:"var(--tx3)"}}>/10</span></div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>Current: {nd.painScore}/10 · Last: {nd.lastPain}</div></div></div><div style={{display:"flex",gap:6}}>{nd.painTrend.map((pt,i)=>(<div key={i} style={{flex:1,background:"var(--surf3)",borderRadius:5,padding:"8px",textAlign:"center"}}><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:18,color:pt.v>=7?"var(--red)":pt.v>=4?"var(--amber)":"var(--green)",marginBottom:3}}>{pt.v}</div><div style={{fontSize:10,color:"var(--tx3)"}}>{pt.t}</div></div>))}</div></div>}
  {sec==="lines"&&<div>{nd.lines.map((l,i)=>(<HCard key={i} style={{marginBottom:6,padding:10}}><div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{color:"var(--purple)",fontSize:13}}>⬡</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{l}</div><div style={{fontSize:10,color:"var(--tx3)"}}>Patent · No complications documented</div></div><Btn small outline color="var(--tx3)">Assess</Btn></div></HCard>))}</div>}
  {sec==="i/o"&&<div><div style={{display:"flex",gap:8,marginBottom:10}}>{[{l:"Intake",v:`${nd.io.in} mL`,c:"var(--cyan)"},{l:"Output",v:`${nd.io.out} mL`,c:"var(--amber)"},{l:"Net",v:`${nd.io.out>nd.io.in?"−":"+"}${Math.abs(nd.io.in-nd.io.out)} mL`,c:"var(--green)"}].map((k,i)=>(<div key={i} style={{flex:1,background:`${k.c}10`,border:`1px solid ${k.c}22`,borderRadius:5,padding:"8px",textAlign:"center"}}><div style={{fontSize:9,color:k.c,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{k.l}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:16,color:k.c}}>{k.v}</div></div>))}</div></div>}
  </div>);
};

const NursingHandoff=({patient,setMod})=>{
  const nd=patient?NURSING_DATA[patient.id]:null;const[showAI,setShowAI]=useState(false);
  if(!patient||!nd) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:12}}><Btn onClick={()=>setMod("shift_board")} color="var(--nurse)">Shift Board</Btn></div>);
  const odTasks=nd.tasks.filter(t=>t.status==="overdue");const doneTasks=nd.tasks.filter(t=>t.status==="done");const pendingTasks=nd.tasks.filter(t=>["due","upcoming"].includes(t.status));
  return(<div className="mod-enter">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}><div><h2 style={{fontWeight:700,fontSize:20,letterSpacing:"-0.4px",marginBottom:2}}>Nursing Handoff — {patient.name}</h2><div style={{fontSize:12,color:"var(--tx2)"}}>Day Shift · Alex Torres, RN</div></div><div style={{display:"flex",gap:6}}><Btn outline color="var(--tx2)" small>Print</Btn><Btn color="var(--nurse)" small>Complete Handoff</Btn></div></div>
    <div style={{background:"var(--surf2)",border:"1px solid var(--nurse)40",borderRadius:6,padding:"9px 12px",marginBottom:10,borderLeft:"3px solid var(--nurse)",display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:12,marginBottom:1}}>{patient.name} · {patient.age}yo · {nd.room}</div><div style={{fontSize:11,color:"var(--tx2)"}}>{patient.code} · {nd.precautions.join(" · ")||"No precautions"}</div></div>{[{l:"Pain",v:`${nd.painScore}/10`,c:nd.painScore>=7?"var(--red)":"var(--green)"},{l:"SpO₂",v:patient.vitals.spo2,c:parseInt(patient.vitals.spo2)<95?"var(--red)":"var(--green)"},{l:"Net I/O",v:`${nd.io.out>nd.io.in?"−":"+"}${Math.abs(nd.io.in-nd.io.out)}mL`,c:"var(--tx)"}].map((v,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:9,color:"var(--tx3)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:1}}>{v.l}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:12,color:v.c}}>{v.v}</div></div>))}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
      <Sec title="What Changed" accent="var(--acc)">{patient.changed.map((c,i)=>(<div key={i} style={{display:"flex",gap:6,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--acc)",fontSize:10,marginTop:2}}>●</span><span style={{fontSize:12}}>{c}</span></div>))}{nd.recentEvents.slice(0,2).map((e,i)=>(<div key={i} style={{display:"flex",gap:6,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{fontFamily:"var(--ffm)",fontSize:9,color:"var(--tx3)",minWidth:30}}>{e.ts}</span><span style={{fontSize:11,color:e.type==="alert"?"var(--red)":"var(--tx2)"}}>{e.text}</span></div>))}</Sec>
      <Sec title="Watch / Unresolved" accent="var(--red)">{odTasks.map(t=>(<div key={t.id} style={{display:"flex",gap:6,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--red)"}}>⚠</span><div><div style={{fontSize:11,fontWeight:600,color:"var(--red)"}}>{t.label}</div><div style={{fontSize:10,color:"var(--tx3)"}}>Overdue since {t.due}</div></div></div>))}{patient.handoff.watch.map((w,i)=>(<div key={i} style={{display:"flex",gap:6,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--amber)"}}>⚠</span><span style={{fontSize:11}}>{w}</span></div>))}{odTasks.length===0&&patient.handoff.watch.length===0&&<div style={{color:"var(--green)",fontSize:12}}>✓ No watch items</div>}</Sec>
      <Sec title="Done This Shift" accent="var(--green)">{doneTasks.map(t=>(<div key={t.id} style={{display:"flex",gap:6,padding:"4px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--green)",fontWeight:700,fontSize:11}}>✓</span><span style={{fontSize:11,color:"var(--tx3)",textDecoration:"line-through"}}>{t.label}</span></div>))}{doneTasks.length===0&&<div style={{color:"var(--tx3)",fontSize:11}}>None yet.</div>}</Sec>
      <Sec title="Pending for Next Shift" accent="var(--amber)">{[...pendingTasks,...patient.handoff.pending.map(p=>({id:"h_"+p,label:p,due:""}))].map((t,i)=>(<div key={t.id} style={{display:"flex",gap:6,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--amber)"}}>◌</span><div><div style={{fontSize:11}}>{t.label}</div>{t.due&&<div style={{fontSize:9,color:"var(--tx3)"}}>Due {t.due}</div>}</div></div>))}</Sec>
      <div style={{gridColumn:"1/-1"}}><Sec title="SBAR Handoff Note" accent="var(--nurse)" action={<Btn small outline color="var(--nurse)" onClick={()=>setShowAI(v=>!v)}>{showAI?"Hide AI":"✦ AI Draft"}</Btn>}>{showAI&&<div style={{marginBottom:8}}><AIPanel title="SBAR Handoff" desc="Generate SBAR nursing handoff from shift data." getPrompt={()=>`SBAR nursing handoff for ${patient.name}, ${patient.age}yo, ${nd.room}. Dx: ${patient.cc}. Code: ${patient.code}. Vitals: BP ${patient.vitals.bp}, HR ${patient.vitals.hr}, SpO2 ${patient.vitals.spo2}, Pain ${nd.painScore}/10. I/O: ${nd.io.in}mL in / ${nd.io.out}mL out. Overdue: ${nd.tasks.filter(t=>t.status==="overdue").map(t=>t.label).join(", ")||"None"}. Under 150 words.`} onDismiss={()=>setShowAI(false)} currentUser="Alex Torres, RN" patientId={patient.id} role="nurse"/></div>}{!showAI&&<div style={{background:"var(--surf3)",borderRadius:5,padding:"8px 11px",fontSize:12,color:nd.handoffNotes?"var(--tx2)":"var(--tx3)",lineHeight:1.7,border:"1px solid var(--nurse)1A",minHeight:44}}>{nd.handoffNotes||"No handoff note yet."}</div>}</Sec></div>
      <div style={{gridColumn:"1/-1"}}><HCard style={{padding:10}}><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:700,color:"var(--nurse)"}}>Completeness</span><div style={{flex:1,display:"flex",gap:7,flexWrap:"wrap"}}>{[{l:"Vitals charted",ok:nd.lastVitals!=="—"},{l:"Pain assessed",ok:nd.lastPain!=="—"},{l:"I/O documented",ok:nd.io.in>0||nd.io.out>0},{l:"Shift note",ok:!!nd.handoffNotes},{l:"Overdue addressed",ok:odTasks.length===0}].map((c,i)=>(<div key={i} style={{display:"flex",gap:4,fontSize:11}}><span style={{color:c.ok?"var(--green)":"var(--red)"}}>{c.ok?"✓":"✗"}</span><span style={{color:c.ok?"var(--tx)":"var(--tx3)"}}>{c.l}</span></div>))}</div></div></HCard></div>
    </div>
  </div>);
};

/* ─── PHYSICIAN HANDOFF ───────────────────────────────────── */
const Handoff=({patient,setMod,currentUser,roleConf})=>{
  const[showAI,setShowAI]=useState(false);
  if(!patient) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:12}}><Btn onClick={()=>setMod("dashboard")} color="var(--acc)">Patient List</Btn></div>);
  const h=patient.handoff;
  return(<div className="mod-enter">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
      <div><h2 style={{fontWeight:700,fontSize:20,letterSpacing:"-0.4px",marginBottom:2}}>Handoff — {patient.name}</h2><div style={{fontSize:12,color:"var(--tx2)"}}>Physician handoff · Audit-logged</div></div>
      <div style={{display:"flex",gap:6}}>{roleConf.aiEnabled&&<button onClick={()=>setShowAI(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:5,fontSize:12,fontWeight:600,background:showAI?"var(--ai)30":"var(--ai)18",border:`1px solid ${showAI?"var(--ai)":"var(--ai)40"}`,color:"var(--ai)"}}><span>✦</span>{showAI?"Hide AI":"Generate with AI"}</button>}<Btn color="var(--acc)" small>Sign Handoff</Btn></div>
    </div>
    <div style={{background:"var(--surf2)",border:"1px solid var(--bdr)",borderRadius:6,padding:"9px 12px",marginBottom:10,borderLeft:`3px solid ${CTX_COLOR[patient.ctx]}`}}>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:13}}>{patient.name}</span><span style={{color:"var(--tx2)",fontSize:12}}>{patient.age}yo · MRN {patient.mrn}</span><Pill color={CTX_COLOR[patient.ctx]}>{CTX_LABEL[patient.ctx]}</Pill>{patient.code!=="Full Code"&&<Pill color="var(--amber)">{patient.code}</Pill>}</div>
    </div>
    {showAI&&<div style={{marginBottom:10}}><AIPanel title="Physician Handoff" desc="Generate complete physician handoff." getPrompt={()=>`Physician handoff for ${patient.name}, ${patient.age}yo. CC: ${patient.cc}. Problems: ${patient.problems.filter(p=>p.active).map(p=>p.name).join(", ")}. Vitals: BP ${patient.vitals.bp}, SpO2 ${patient.vitals.spo2}. Labs: ${patient.labs.map(l=>`${l.name} ${l.val} [${l.flag}]`).join(" | ")}.\n\nONE-LINER:\nWATCH ITEMS:\nPENDING:\nTO-DO:\n\nDirect, no markdown.`} onDismiss={()=>setShowAI(false)} currentUser={currentUser} patientId={patient.id} role="physician"/></div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1"}}><Sec title="One-Liner" accent="var(--acc)"><div style={{background:"var(--surf3)",borderRadius:5,padding:"9px 12px",border:"1px solid var(--acc)1A",fontSize:14,lineHeight:1.7}}>{h.one_liner}</div></Sec></div>
      <Sec title="Watch Items" accent="var(--amber)">{h.watch.map((w,i)=>(<div key={i} style={{display:"flex",gap:6,padding:"6px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--amber)"}}>⚠</span><span style={{fontSize:13,lineHeight:1.5}}>{w}</span></div>))}</Sec>
      <Sec title="Pending" accent="var(--cyan)">{h.pending.map((p,i)=>(<div key={i} style={{display:"flex",gap:6,padding:"6px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--cyan)"}}>◌</span><span style={{fontSize:13}}>{p}</span></div>))}</Sec>
      <div style={{background:patient.code!=="Full Code"?"var(--amber)0E":"var(--surf2)",border:`1px solid ${patient.code!=="Full Code"?"var(--amber)40":"var(--bdr2)"}`,borderRadius:6,padding:12}}><div style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:"var(--tx3)",textTransform:"uppercase",marginBottom:5}}>Code Status</div><div style={{fontSize:18,fontWeight:700,color:patient.code!=="Full Code"?"var(--amber)":"var(--green)"}}>{patient.code}</div></div>
    </div>
  </div>);
};

/* ─── COEXISTENCE ─────────────────────────────────────────── */
const Coexistence=()=>{
  const STAGES=[{n:1,label:"Radiology Workflow",desc:"Deploy radiology worklist + reading workspace alongside existing PACS. Read-only HL7 feed from legacy ADT and orders. Zero disruption to non-radiology staff.",effort:"Low",risk:"Very Low",timeframe:"4–8 weeks",active:true},{n:2,label:"Clinical Command View",desc:"Introduce clinician-facing command view. Reads from existing EHR via HL7/FHIR. Write actions optional — can remain in legacy initially.",effort:"Low–Medium",risk:"Low",timeframe:"8–16 weeks",active:false},{n:3,label:"Orders, ePrescribing & Labs",desc:"Activate order entry, ePrescribing, and integrated lab results. Bidirectional HL7 for lab orders and results. Pharmacy integration via SureScripts.",effort:"Medium",risk:"Low–Medium",timeframe:"12–20 weeks",active:false},{n:4,label:"Nursing Shift Module",desc:"Layer nursing shift board, quick charting, and flowsheet. Nursing documentation can coexist with legacy or migrate selectively.",effort:"Medium",risk:"Low",timeframe:"16–24 weeks",active:false}];
  const INTERFACES=[{name:"ADT Feed (HL7 v2.x)",direction:"inbound",status:"healthy",source:"Legacy HIS",latency:"<2s"},{name:"Lab Results (HL7 ORU)",direction:"inbound",status:"healthy",source:"LIS",latency:"<5s"},{name:"Lab Orders (HL7 ORM)",direction:"bidirectional",status:"healthy",source:"Meridian ↔ LIS",latency:"<3s"},{name:"Radiology Orders (HL7 ORM)",direction:"inbound",status:"healthy",source:"Legacy EHR",latency:"<3s"},{name:"Radiology Results (HL7 ORU)",direction:"outbound",status:"healthy",source:"hiveIMR",latency:"<5s"},{name:"ePrescribing (SureScripts)",direction:"outbound",status:"healthy",source:"hiveIMR",latency:"<10s"},{name:"FHIR Patient Read",direction:"inbound",status:"healthy",source:"Legacy EHR",latency:"<1s"},{name:"Pharmacy — In-House (Omnicell)",direction:"bidirectional",status:"healthy",source:"hiveIMR ↔ Pharmacy",latency:"<2s"},{name:"FHIR Medication Read",direction:"inbound",status:"degraded",source:"Pharmacy",latency:"8–12s"}];
  return(<div className="mod-enter">
    <div style={{marginBottom:14}}><h2 style={{fontSize:20,fontWeight:700,letterSpacing:"-0.4px",marginBottom:3}}>Integration & Coexistence</h2><div style={{fontSize:13,color:"var(--tx2)"}}>Staged modernization · Not a rip-and-replace · Coexists with your existing systems</div></div>
    <div style={{background:"linear-gradient(120deg,var(--acc)12,var(--surf2) 60%)",border:"1px solid var(--acc)28",borderRadius:7,padding:"12px 16px",marginBottom:12}}>
      <div style={{fontSize:14,fontWeight:700,lineHeight:1.5,marginBottom:5}}>"Deploy what you need. Keep what works. Add capability without replacing everything."</div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{[{icon:"◎",l:"Radiology first",d:"Highest ROI, lowest risk."},{icon:"⇌",l:"Reads before writes",d:"Prove value before committing to bidirectional flow."},{icon:"⌘",l:"Orders layered in",d:"Order entry and ePrescribing added in Stage 3, not forced up front."}].map((k,i)=>(<div key={i} style={{display:"flex",gap:7}}><span style={{color:"var(--acc)",fontSize:14,marginTop:2}}>{k.icon}</span><div><div style={{fontSize:11,fontWeight:700,color:"var(--acc)"}}>{k.l}</div><div style={{fontSize:10,color:"var(--tx3)"}}>{k.d}</div></div></div>))}</div>
    </div>
    <Sec title="Staged Adoption Path" accent="var(--acc)"><div style={{display:"grid",gap:7}}>{STAGES.map(stage=>(<div key={stage.n} style={{display:"flex",gap:10,padding:"10px 12px",background:"var(--surf3)",borderRadius:6,border:`1px solid ${stage.active?"var(--green)28":"var(--bdr2)"}`,alignItems:"flex-start"}}>
      <div style={{width:26,height:26,borderRadius:5,background:stage.active?"var(--green)20":"var(--surf2)",border:`1px solid ${stage.active?"var(--green)40":"var(--bdr)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--ffm)",fontWeight:700,fontSize:12,color:stage.active?"var(--green)":"var(--tx3)",flexShrink:0}}>{stage.n}</div>
      <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:12}}>{stage.label}</span>{stage.active&&<Pill color="var(--green)" small>Start here</Pill>}<Pill color="var(--tx3)" small>Effort: {stage.effort}</Pill><Pill color="var(--green)" small>Risk: {stage.risk}</Pill><Pill color="var(--acc)" small>{stage.timeframe}</Pill></div><div style={{fontSize:11,color:"var(--tx2)",lineHeight:1.5}}>{stage.desc}</div></div>
    </div>))}</div></Sec>
    <Sec title="Interface Health" accent="var(--cyan)" action={<Pill color="var(--green)" small>8/9 healthy</Pill>}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}><thead><tr style={{borderBottom:"2px solid var(--bdr)"}}>{["Interface","Direction","Status","Source","Latency"].map(h=>(<th key={h} style={{fontSize:10,fontWeight:700,color:"var(--tx3)",textAlign:"left",padding:"4px 8px",letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>{INTERFACES.map((intf,i)=>(<tr key={i} style={{borderBottom:"1px solid var(--bdr2)",background:intf.status==="degraded"?"var(--amber)04":"transparent"}}><td style={{padding:"7px 8px",fontSize:12,fontWeight:600}}>{intf.name}</td><td style={{padding:"7px 8px"}}><Pill color={intf.direction==="inbound"?"var(--cyan)":intf.direction==="outbound"?"var(--green)":"var(--acc)"} small>{intf.direction}</Pill></td><td style={{padding:"7px 8px"}}><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:intf.status==="healthy"?"var(--green)":"var(--amber)"}}><span style={{width:5,height:5,borderRadius:3,background:intf.status==="healthy"?"var(--green)":"var(--amber)",display:"block"}}/>{intf.status}</span></td><td style={{padding:"7px 8px",fontSize:11,color:"var(--tx3)"}}>{intf.source}</td><td style={{padding:"7px 8px",fontFamily:"var(--ffm)",fontSize:11,color:"var(--tx2)"}}>{intf.latency}</td></tr>))}</tbody></table></div></Sec>
  </div>);
};

/* ─── SUPPORT ─────────────────────────────────────────────── */
const Support=()=>{
  const[mode,setMode]=useState("normal");
  const TEAM=[{role:"Account Owner",name:"Lisa Farrington",contact:"lfarrington@hiveimr.health",desc:"Primary relationship, contract, configuration decisions.",color:"var(--acc)"},{role:"Clinical Workflow Owner",name:"Dr. Mark Tanaka",contact:"mtanaka@hiveimr.health",desc:"Clinical informaticist, workflow configuration, training oversight.",color:"var(--green)"},{role:"Technical Integration Owner",name:"Priya Sood",contact:"psood@hiveimr.health",desc:"HL7/FHIR, SureScripts, lab interfaces, security.",color:"var(--cyan)"},{role:"Go-Live Command Contact",name:"James Burke",contact:"Direct cell at contract",desc:"On-site or remote command during go-live. Not a ticket queue.",color:"var(--amber)"}];
  const modeC={normal:"var(--acc)",golive:"var(--amber)",critical:"var(--red)"};
  return(<div className="mod-enter">
    <div style={{marginBottom:14}}><h2 style={{fontSize:20,fontWeight:700,letterSpacing:"-0.4px",marginBottom:3}}>Support & Ownership</h2><div style={{fontSize:13,color:"var(--tx2)"}}>Named contacts · Clear escalation · Support is part of the product</div></div>
    <div style={{display:"flex",gap:2,marginBottom:12,background:"var(--surf3)",borderRadius:6,padding:2,border:"1px solid var(--bdr)",width:"fit-content"}}>
      {[{v:"normal",l:"Normal"},{v:"golive",l:"Go-Live Mode"},{v:"critical",l:"Critical Incident"}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{padding:"5px 14px",borderRadius:4,fontSize:11,fontWeight:mode===m.v?700:500,background:mode===m.v?`${modeC[m.v]}20`:"transparent",color:mode===m.v?modeC[m.v]:"var(--tx2)",border:`1px solid ${mode===m.v?modeC[m.v]+"44":"transparent"}`}}>{m.l}</button>))}
    </div>
    {mode==="golive"&&<div style={{background:"var(--amber)0C",border:"1px solid var(--amber)44",borderRadius:7,padding:"10px 14px",marginBottom:10,display:"flex",gap:8}}><span style={{color:"var(--amber)"}}>⚡</span><div><div style={{fontWeight:700,color:"var(--amber)"}}>Go-Live Mode Active</div><div style={{fontSize:12,color:"var(--tx2)"}}>Response targets shortened. James Burke on direct line. Tier 1: 30 min, Tier 2/3: 15 min, Tier 4: 60 min.</div></div></div>}
    {mode==="critical"&&<div style={{background:"var(--red)0C",border:"1px solid var(--red)44",borderRadius:7,padding:"10px 14px",marginBottom:10,display:"flex",gap:8}}><span style={{color:"var(--red)"}}>⚠</span><div><div style={{fontWeight:700,color:"var(--red)"}}>Critical Incident Mode</div><div style={{fontSize:12,color:"var(--tx2)"}}>All contacts notified simultaneously. Bridge within 15 min: (888) 448-CRIT.</div></div></div>}
    <Sec title="Named Support Team" accent="var(--acc)"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{TEAM.map((t,i)=>(<HCard key={i} style={{padding:12,border:`1px solid ${t.color}22`}}><div style={{display:"flex",gap:8}}><div style={{width:32,height:32,borderRadius:7,background:`${t.color}20`,border:`1px solid ${t.color}38`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:t.color,fontWeight:700,flexShrink:0}}>{t.name[0]}</div><div style={{flex:1}}><div style={{fontSize:9,fontWeight:700,color:t.color,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:1}}>{t.role}</div><div style={{fontSize:12,fontWeight:700,marginBottom:1}}>{t.name}</div><div style={{fontSize:10,color:"var(--tx3)",marginBottom:3,fontFamily:"var(--ffm)"}}>{t.contact}</div><div style={{fontSize:11,color:"var(--tx2)",lineHeight:1.4}}>{t.desc}</div></div></div></HCard>))}</div></Sec>
    <Sec title="Escalation Path" accent="var(--green)">{[{tier:"Tier 1",label:"In-product support",resp:"<4h / 30 min go-live",desc:"Logged, triaged, assigned within SLA."},{tier:"Tier 2",label:"Technical owner direct",resp:"<2h / 15 min go-live",desc:"Interface, connectivity, lab/pharmacy issues."},{tier:"Tier 3",label:"Clinical owner direct",resp:"<2h / 15 min go-live",desc:"Patient safety-adjacent workflow issues."},{tier:"Tier 4",label:"Account owner",resp:"<1h any mode",desc:"Contract or unresolved escalation."}].map((e,i)=>(<div key={i} style={{display:"flex",gap:10,padding:"8px 12px",background:"var(--surf3)",borderRadius:5,marginBottom:5,alignItems:"center"}}><div style={{width:52,flexShrink:0}}><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:10,color:"var(--acc)",letterSpacing:"0.08em",textTransform:"uppercase"}}>{e.tier}</div></div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,marginBottom:1}}>{e.label}</div><div style={{fontSize:11,color:"var(--tx2)"}}>{e.desc}</div></div><Pill color="var(--acc)" small>Response: {e.resp}</Pill></div>))}</Sec>
  </div>);
};

/* ─── PILOT METRICS ───────────────────────────────────────── */
const PilotMetrics=()=>{
  const[period,setPeriod]=useState("30d");
  const METRICS=[
    {cat:"Radiology",color:"var(--cyan)",items:[{l:"STAT Report TAT",base:"48 min",cur:"22 min",delta:-54},{l:"Worklist-to-dictation clicks",base:"14",cur:"5",delta:-64},{l:"PACS/chart context switches",base:"8.3/study",cur:"1.1/study",delta:-87},{l:"Critical result escalation time",base:"19 min",cur:"6 min",delta:-68}]},
    {cat:"Order Entry & ePrescribing",color:"var(--rx)",items:[{l:"Order entry clicks per encounter",base:"22",cur:"7",delta:-68},{l:"ePrescribing time (new Rx)",base:"4.2 min",cur:"1.8 min",delta:-57},{l:"Allergy-check catch rate",base:"72%",cur:"100%",delta:+39},{l:"Outside pharmacy transmission error",base:"—",cur:"0",delta:null}]},
    {cat:"Lab Result Workflow",color:"var(--lab)",items:[{l:"Unacknowledged critical results",base:"3.8/day",cur:"0.4/day",delta:-89},{l:"Lab result-to-acknowledgment time",base:"14.2 min",cur:"3.1 min",delta:-78},{l:"Outside lab status visibility",base:"Phone/fax",cur:"Real-time",delta:null}]},
    {cat:"Clinical Command View",color:"var(--acc)",items:[{l:"Chart review time (rounds)",base:"9.4 min",cur:"5.1 min",delta:-46},{l:"Screen switches per encounter",base:"12",cur:"4",delta:-67},{l:"Task ownership clarity (survey)",base:"2.1/5",cur:"4.3/5",delta:+105}]},
    {cat:"Adoption & Support",color:"var(--green)",items:[{l:"Training completion (≤4h target)",base:"N/A",cur:"96%",delta:null},{l:"Physician satisfaction (1–5)",base:"2.4",cur:"4.1",delta:+71},{l:"Support ticket volume",base:"—",cur:"3/week",delta:null},{l:"Support SLA met",base:"—",cur:"100%",delta:null}]},
  ];
  return(<div className="mod-enter">
    <div style={{marginBottom:14}}><h2 style={{fontSize:20,fontWeight:700,letterSpacing:"-0.4px",marginBottom:3}}>Pilot Metrics & ROI</h2><div style={{fontSize:13,color:"var(--tx2)"}}>Riverton Valley Medical Center · hiveIMR Pilot</div></div>
    <div style={{display:"flex",gap:7,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:1,background:"var(--surf3)",borderRadius:5,padding:2,border:"1px solid var(--bdr)"}}>{["30d","60d","90d"].map(p=>(<button key={p} onClick={()=>setPeriod(p)} style={{padding:"3px 12px",borderRadius:4,fontSize:11,fontWeight:period===p?700:500,background:period===p?"var(--acc)":"transparent",color:period===p?"#fff":"var(--tx2)"}}>{p}</button>))}</div>
      <Pill color="var(--green)" small>23/30 beds enrolled</Pill>
      <Pill color="var(--acc)" small>3 radiologists · 12 physicians · 28 nurses · 4 pharmacists</Pill>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>
      {[{l:"STAT TAT",v:"22 min",c:"var(--cyan)",d:"-54%"},{l:"Order clicks",v:"7 avg",c:"var(--rx)",d:"-68%"},{l:"Unread crits",v:"0.4/day",c:"var(--lab)",d:"-89%"},{l:"Rx allergy catch",v:"100%",c:"var(--green)",d:"+39%"},{l:"Satisfaction",v:"4.1/5",c:"var(--acc)",d:"+71%"}].map((k,i)=>(<div key={i} style={{background:"var(--surf2)",border:`1px solid ${k.c}24`,borderRadius:7,padding:"10px 12px"}}><div style={{fontSize:9,color:k.c,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:3}}>{k.l}</div><div style={{fontFamily:"var(--ffm)",fontWeight:700,fontSize:18,color:k.c,marginBottom:2}}>{k.v}</div><Pill color="var(--green)" small>{k.d}</Pill></div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {METRICS.map((cat,ci)=>(<Sec key={ci} title={cat.cat} accent={cat.color}>{cat.items.map((item,ii)=>(<div key={ii} style={{padding:"6px 0",borderBottom:"1px solid var(--bdr2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}><span style={{fontSize:11,flex:1}}>{item.l}</span>{item.delta!==null&&<span style={{fontSize:11,fontWeight:700,color:"var(--green)"}}>{item.delta>0?"+":""}{item.delta}%</span>}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>{item.base!=="N/A"&&item.base!=="—"&&<><span style={{fontSize:10,color:"var(--tx3)"}}>Was: {item.base}</span><span style={{fontSize:10,color:"var(--tx3)"}}>→</span></>}<span style={{fontSize:11,fontWeight:600,color:cat.color}}>{item.cur}</span></div>
        {item.delta!==null&&<div style={{height:3,background:"var(--surf3)",borderRadius:2,overflow:"hidden",marginTop:3}}><div style={{height:"100%",width:`${Math.min(100,Math.abs(item.delta))}%`,background:cat.color,borderRadius:2}}/></div>}
      </div>))}</Sec>))}
    </div>
  </div>);
};

/* ─── PATHOLOGY ───────────────────────────────────────────── */
const Pathology=({roleConf,role})=>{
  const isOwner=role==="pathologist";
  return(<div className="mod-enter">{!isOwner&&<ReadOnlyBanner roleColor={roleConf.color} roleName={ROLES.find(r=>r.id===role)?.role||""}/>}<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><h2 style={{fontWeight:700,fontSize:20}}>Pathology / Lab</h2><Pill color="var(--purple)">Case #2024-1447</Pill></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div style={{background:"#08010F",border:"1px solid var(--bdr2)",borderRadius:7,height:210,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse,#180828 0%,#060010 100%)"}}/>{[{l:42,t:30,w:55,h:22,r:180,g:90,b:200},{l:20,t:50,w:35,h:14,r:160,g:70,b:180},{l:60,t:55,w:44,h:18,r:200,g:100,b:220}].map((s,i)=>(<div key={i} style={{position:"absolute",width:s.w,height:s.h,background:`rgba(${s.r},${s.g},${s.b},0.35)`,borderRadius:99,left:`${s.l}%`,top:`${s.t}%`,filter:"blur(1.5px)"}}/>))}<div style={{position:"relative",zIndex:2,textAlign:"center"}}><div style={{fontSize:9,color:"#6B42C5",letterSpacing:"0.12em",marginBottom:3}}>H&E · 40×</div><div style={{fontSize:7,color:"#4a2a8a"}}>DIGITAL PATHOLOGY VIEWER</div><div style={{marginTop:8,display:"flex",gap:4,justifyContent:"center"}}>{["4×","10×","20×","40×"].map(z=>(<div key={z} style={{fontSize:8,color:"#7B52D5",padding:"1px 5px",border:"1px solid #3a1a6a",borderRadius:2}}>{z}</div>))}</div></div></div>
  <div><Sec title="Specimen" accent="var(--purple)">{[["Site","Sigmoid colon — biopsy"],["Submitted","3 days ago"],["CEA","8.1 ng/mL ↑"]].map(([l,v],i)=>(<div key={i} style={{display:"flex",gap:7,padding:"4px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{fontSize:10,color:"var(--tx3)",width:65,flexShrink:0}}>{l}:</span><span style={{fontSize:11}}>{v}</span></div>))}</Sec><Sec title="Processing" accent="var(--cyan)">{[{step:"H&E staining",s:"complete"},{step:"H&E read",s:"active"},{step:"IHC panel",s:"pending"},{step:"Final sign-out",s:"pending"}].map((x,i)=>(<div key={i} style={{display:"flex",gap:7,alignItems:"center",padding:"4px 0",borderBottom:"1px solid var(--bdr2)"}}><div style={{width:5,height:5,borderRadius:2,background:statusColor(x.s)}}/><span style={{fontSize:11,flex:1}}>{x.step}</span><Pill color={statusColor(x.s)} small>{x.s}</Pill></div>))}</Sec></div></div></div>);
};

const UM=({patient,setMod,currentUser,roleConf,role})=>{
  const[showAI,setShowAI]=useState(false);const isOwner=["case_mgr","biller","physician"].includes(role);
  if(!patient) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:12}}><Btn onClick={()=>setMod("dashboard")} color="var(--acc)">Patient List</Btn></div>);
  const um=patient.um;
  return(<div className="mod-enter"><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:7}}><div><h2 style={{fontWeight:700,fontSize:20,marginBottom:1}}>UM / Prior Auth</h2><div style={{fontSize:12,color:"var(--tx2)"}}>Payer: {um.payer} · {um.loc}</div></div>{isOwner&&<div style={{display:"flex",gap:6,alignItems:"center"}}><Pill color={um.statusOk?"var(--green)":"var(--amber)"}>{um.status}</Pill>{roleConf.aiEnabled&&<button onClick={()=>setShowAI(v=>!v)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:4,fontSize:11,fontWeight:600,background:showAI?"var(--ai)30":"var(--ai)18",border:`1px solid ${showAI?"var(--ai)":"var(--ai)40"}`,color:"var(--ai)"}}><span>✦</span>Generate</button>}</div>}</div>
  <div style={{background:"var(--surf2)",border:"1px solid var(--bdr)",borderRadius:6,padding:"8px 12px",marginBottom:10,borderLeft:`3px solid ${CTX_COLOR[patient.ctx]}`}}><div style={{fontWeight:700,fontSize:12,marginBottom:1}}>{patient.name} · {patient.age}yo</div><div style={{fontSize:11,color:"var(--tx2)"}}>{patient.attending}</div></div>
  {showAI&&isOwner&&<div style={{marginBottom:10}}><AIPanel title="Prior Authorization Letter" desc="Generate prior auth from clinical data." getPrompt={()=>`Prior auth letter for ${patient.name}, ${patient.age}yo. Payer: ${um.payer}. LOC: ${um.loc}. Dx: ${patient.cc}. Criteria met: ${um.met.join("; ")}. Missing: ${um.missing.join("; ")||"None"}. Under 250 words, flag missing with [PENDING].`} onDismiss={()=>setShowAI(false)} currentUser={currentUser} patientId={patient.id} role={role}/></div>}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Sec title="Criteria Met" accent="var(--green)">{um.met.map((c,i)=>(<div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--green)",fontWeight:700,fontSize:11}}>✓</span><span style={{fontSize:12}}>{c}</span></div>))}</Sec><Sec title="Missing" accent="var(--red)">{um.missing.length>0?um.missing.map((m,i)=>(<div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--red)",fontSize:11}}>✗</span><span style={{fontSize:12}}>{m}</span></div>)):<div style={{color:"var(--green)",fontSize:12}}>✓ No missing documentation</div>}</Sec></div></div>);
};

const Billing=({patient,setMod,role})=>{
  const isOwner=["biller","case_mgr","physician"].includes(role);
  if(!patient) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:12}}><Btn onClick={()=>setMod("dashboard")} color="var(--acc)">Patient List</Btn></div>);
  return(<div className="mod-enter"><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:7}}><div><h2 style={{fontWeight:700,fontSize:20,marginBottom:1}}>Billing / Revenue</h2><div style={{fontSize:12,color:"var(--tx2)"}}>Clinical truth first · Revenue logic second</div></div>{isOwner&&<Btn small color="var(--acc)">Submit to Coding</Btn>}</div>
  <div style={{background:"var(--surf2)",border:"1px solid var(--bdr)",borderRadius:6,padding:"8px 12px",marginBottom:10,borderLeft:`3px solid ${CTX_COLOR[patient.ctx]}`}}><div style={{fontWeight:700,fontSize:12,marginBottom:1}}>{patient.name} · {patient.age}yo</div><div style={{fontSize:11,color:"var(--tx2)"}}>{patient.insurance||"—"}</div></div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Sec title="Diagnosis Capture" accent="var(--acc)">{patient.problems.filter(p=>p.active).map((d,i)=>(<div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><div style={{width:5,height:5,borderRadius:2,background:d.sev==="critical"?"var(--red)":"var(--amber)"}}/><span style={{fontSize:11,flex:1}}>{d.name}</span><span style={{fontSize:9,color:"var(--tx3)",fontFamily:"var(--ffm)"}}>{d.icd}</span></div>))}</Sec><Sec title="Charge Completeness" accent="var(--green)">{[{item:"Attending attestation",ok:true},{item:"Time documentation",ok:false},{item:"MDM documented",ok:true},{item:"Diagnosis specificity",ok:false}].map((c,i)=>(<div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:c.ok?"var(--green)":"var(--red)",fontWeight:700,fontSize:11}}>{c.ok?"✓":"✗"}</span><span style={{fontSize:11,flex:1}}>{c.item}</span>{!c.ok&&<Pill color="var(--amber)" small>Action</Pill>}</div>))}</Sec></div></div>);
};

/* ─── ARCHITECTURE ────────────────────────────────────────── */
const Architecture=()=>(<div className="mod-enter">
  <div style={{marginBottom:14}}><h2 style={{fontSize:20,fontWeight:700,letterSpacing:"-0.4px",marginBottom:3}}>Architecture Brief</h2><div style={{fontSize:11,color:"var(--tx2)"}}>Distributed-first · Local-first · Minimal cloud · Safety core · Bounded AI · Order + ePrescribing + Lab integrated</div></div>
  <div style={{background:"linear-gradient(130deg,var(--acc)14,var(--surf2) 70%)",border:"1px solid var(--acc)28",borderRadius:7,padding:"14px 18px",marginBottom:12}}>
    <div style={{fontSize:16,fontWeight:700,lineHeight:1.5,letterSpacing:"-0.3px",marginBottom:5}}>"A lower-friction, lower-risk, radiology-strong, local-first clinical workflow platform<br/>for rural hospitals and small systems."</div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["Radiology-first wedge","Order entry + ePrescribing","In-house + reference lab","SureScripts ePrescribing","Staged modernization","Local-first resilience","Named support ownership"].map((l,i)=>(<Pill key={i} color="var(--acc)" small>{l}</Pill>))}</div>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
    <HCard style={{padding:13}}><div style={{fontWeight:700,fontSize:12,marginBottom:8,display:"flex",gap:6,alignItems:"center"}}><span style={{color:"var(--rx)"}}>℞</span> ePrescribing Model</div>{[{l:"In-house pharmacy",d:"Direct dispense queue + Omnicell/Pyxis integration",c:"var(--green)"},{l:"Outside pharmacy",d:"SureScripts certified network transmission",c:"var(--acc)"},{l:"Controlled substances",d:"EPCS compliant · DEA-aware · PDMP prompt",c:"var(--amber)"},{l:"Allergy check",d:"Drug–allergy and cross-reactivity at point of order",c:"var(--red)"}].map((n,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><div style={{width:6,height:6,borderRadius:2,flexShrink:0,marginTop:3,background:n.c}}/><div><div style={{fontSize:11,fontWeight:600,color:n.c,marginBottom:1}}>{n.l}</div><div style={{fontSize:11,color:"var(--tx2)"}}>{n.d}</div></div></div>))}</HCard>
    <HCard style={{padding:13}}><div style={{fontWeight:700,fontSize:12,marginBottom:8,display:"flex",gap:6,alignItems:"center"}}><span style={{color:"var(--lab)"}}>◉</span> Lab Architecture</div>{[{l:"In-house lab",d:"Direct LIS integration — HL7 ORU real-time results",c:"var(--lab)"},{l:"POC testing",d:"Bedside glucose, lactate, ABG — sub-10 min TAT",c:"var(--green)"},{l:"Reference labs",d:"LabCorp / Quest / Mayo — send-out order + result tracking",c:"var(--cyan)"},{l:"Unack tracking",d:"Critical result acknowledgment enforced at point of care",c:"var(--red)"}].map((n,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid var(--bdr2)"}}><div style={{width:6,height:6,borderRadius:2,flexShrink:0,marginTop:3,background:n.c}}/><div><div style={{fontSize:11,fontWeight:600,color:n.c,marginBottom:1}}>{n.l}</div><div style={{fontSize:11,color:"var(--tx2)"}}>{n.d}</div></div></div>))}</HCard>
    <HCard style={{padding:13}}><div style={{fontWeight:700,fontSize:12,marginBottom:8,display:"flex",gap:6,alignItems:"center"}}><span style={{color:"var(--red)"}}>◈</span> Safety Core</div>{["The clinical core must survive.","No silent unsafe behavior.","Every action leaves a trail.","Allergy check never skippable.","Controlled substance guardrails enforced.","Downtime mode is a product feature."].map((p,i)=>(<div key={i} style={{display:"flex",gap:7,padding:"4px 0",borderBottom:"1px solid var(--bdr2)"}}><span style={{color:"var(--red)",fontSize:9,marginTop:2}}>■</span><span style={{fontSize:11}}>{p}</span></div>))}</HCard>
    <HCard style={{padding:13}}><div style={{fontWeight:700,fontSize:12,marginBottom:8,display:"flex",gap:6,alignItems:"center"}}><span style={{color:"var(--green)"}}>⬡</span> Module Map — v1.0</div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:5}}>{[{n:"Clinical Command",s:"Safety Core",c:"var(--red)"},{n:"Orders + ePrescribing",s:"Clinical Core",c:"var(--rx)"},{n:"Lab Results",s:"Clinical Core",c:"var(--lab)"},{n:"Nursing Shift Module",s:"Nursing Core",c:"var(--nurse)"},{n:"Radiology / PACS",s:"Wedge — First Deploy",c:"var(--cyan)"},{n:"Coexistence Layer",s:"Integration",c:"var(--green)"},{n:"Support Model",s:"Product Moat",c:"var(--amber)"},{n:"AI Assist Layer",s:"Bounded Sidecar",c:"var(--ai)"}].map((m,i)=>(<div key={i} style={{background:"var(--surf3)",border:`1px solid ${m.c}24`,borderRadius:4,padding:"6px 8px"}}><div style={{fontSize:10,fontWeight:600,marginBottom:2,lineHeight:1.3}}>{m.n}</div><Pill color={m.c} small>{m.s}</Pill></div>))}</div></HCard>
  </div>
</div>);

/* ─── QUICK CHART DRAWER ──────────────────────────────────── */
const QuickChartDrawer=({patient,nd,onClose,onSave})=>{
  const[tab,setTab]=useState("vitals");const[vitals,setVitals]=useState({bp:"",hr:"",rr:"",spo2:"",temp:""});const[pain,setPain]=useState(null);const[ioEntry,setIoEntry]=useState({type:"in",cat:"PO",amt:""});
  return(<div className="drawer-enter" style={{position:"fixed",bottom:0,left:196,right:0,background:"var(--surf)",borderTop:"2px solid var(--nurse)",zIndex:200,boxShadow:"0 -8px 40px #00000055"}}>
    <div style={{padding:"8px 20px 0",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid var(--bdr2)"}}><div style={{width:5,height:5,borderRadius:3,background:"var(--nurse)"}}/><span style={{fontWeight:700,fontSize:12,color:"var(--nurse)"}}>Quick Chart</span><span style={{fontSize:11,color:"var(--tx2)"}}>— {patient.name} · {nd?.room}</span><div style={{marginLeft:"auto",display:"flex",gap:1}}>{["vitals","pain","i/o","note"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{padding:"4px 12px",borderRadius:"4px 4px 0 0",fontSize:10,fontWeight:tab===t?700:500,color:tab===t?"var(--nurse)":"var(--tx2)",background:tab===t?"var(--surf2)":"transparent",borderBottom:`2px solid ${tab===t?"var(--nurse)":"transparent"}`,textTransform:"uppercase",letterSpacing:"0.06em"}}>{t}</button>))}</div><Btn onClick={onClose} outline color="var(--tx3)" small>× Close</Btn></div>
    <div style={{padding:"12px 20px 16px",background:"var(--surf2)",display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
      {tab==="vitals"&&(<>{[{k:"bp",l:"BP",ph:"120/80"},{k:"hr",l:"HR",ph:"72"},{k:"rr",l:"RR",ph:"16"},{k:"spo2",l:"SpO₂",ph:"98%"},{k:"temp",l:"Temp",ph:"37.0°C"}].map(f=>(<div key={f.k} style={{display:"flex",flexDirection:"column",gap:3}}><label style={{fontSize:9,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.07em",textTransform:"uppercase"}}>{f.l}</label><input value={vitals[f.k]} onChange={e=>setVitals(v=>({...v,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:88,padding:"5px 9px",borderRadius:4,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:12,fontFamily:"var(--ffm)"}}/></div>))}<div style={{alignSelf:"flex-end"}}><Btn color="var(--nurse)" small onClick={()=>onSave&&onSave("vitals",vitals)}>Save Vitals</Btn></div></>)}
      {tab==="pain"&&(<><div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.07em",textTransform:"uppercase",width:"100%",marginBottom:-4}}>Pain Score — Current: {nd?.painScore}/10</div><div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>{[0,1,2,3,4,5,6,7,8,9,10].map(v=>(<button key={v} onClick={()=>setPain(v)} style={{width:30,height:30,borderRadius:4,fontWeight:700,fontSize:12,background:pain===v?(v<=3?"var(--green)":v<=6?"var(--amber)":"var(--red)")+"30":"var(--surf3)",border:`1px solid ${pain===v?(v<=3?"var(--green)":v<=6?"var(--amber)":"var(--red)")+"55":"var(--bdr)"}`,color:pain===v?(v<=3?"var(--green)":v<=6?"var(--amber)":"var(--red)"):"var(--tx2)"}}>{v}</button>))}<Btn color="var(--nurse)" small style={{marginLeft:6,opacity:pain===null?0.4:1}} onClick={()=>onSave&&onSave("pain",{score:pain})}>Save</Btn></div></>)}
      {tab==="i/o"&&(<><div style={{fontSize:10,fontWeight:700,color:"var(--tx3)",letterSpacing:"0.07em",textTransform:"uppercase",width:"100%",marginBottom:-4}}>I/O — {nd?.io.in}mL in / {nd?.io.out}mL out</div><div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>{["in","out"].map(t=>(<button key={t} onClick={()=>setIoEntry(v=>({...v,type:t}))} style={{padding:"4px 12px",borderRadius:4,fontSize:11,fontWeight:600,background:ioEntry.type===t?(t==="in"?"var(--cyan)":"var(--amber)")+"28":"var(--surf3)",border:`1px solid ${ioEntry.type===t?(t==="in"?"var(--cyan)":"var(--amber)")+"44":"var(--bdr)"}`,color:ioEntry.type===t?(t==="in"?"var(--cyan)":"var(--amber)"):"var(--tx2)"}}>{t==="in"?"↓ In":"↑ Out"}</button>))}<select value={ioEntry.cat} onChange={e=>setIoEntry(v=>({...v,cat:e.target.value}))} style={{padding:"4px 8px",borderRadius:4,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:11}}>{(ioEntry.type==="in"?["PO","IV fluid","Medication","Other"]:["Urine","Output","Drain","Other"]).map(o=>(<option key={o}>{o}</option>))}</select><input value={ioEntry.amt} onChange={e=>setIoEntry(v=>({...v,amt:e.target.value}))} placeholder="mL" style={{width:70,padding:"4px 8px",borderRadius:4,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:12,fontFamily:"var(--ffm)"}}/><Btn color="var(--nurse)" small onClick={()=>onSave&&onSave("io",ioEntry)}>Add</Btn></div></>)}
      {tab==="note"&&(<><textarea placeholder="Brief nursing note…" style={{flex:1,minWidth:380,minHeight:54,padding:"7px 10px",borderRadius:4,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)",fontSize:12,lineHeight:1.6,resize:"none"}}/><div style={{alignSelf:"flex-end"}}><Btn color="var(--nurse)" small>Save Note</Btn></div></>)}
    </div>
  </div>);
};

/* ─── TOPBAR ──────────────────────────────────────────────── */
const Topbar=({role,setRole,roleConf})=>{
  const[open,setOpen]=useState(false);const cur=ROLES.find(r=>r.id===role);
  return(<div style={{position:"fixed",top:0,left:0,right:0,height:52,background:"var(--surf)",borderBottom:"1px solid var(--bdr2)",display:"flex",alignItems:"center",padding:"0 18px",gap:12,zIndex:100}}>
    {/* hiveIMR Logo */}
    <div style={{display:"flex",alignItems:"center",gap:10,minWidth:190}}>
      <div style={{width:32,height:32,background:"linear-gradient(135deg,var(--acc),#0B8070)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 12px var(--acc)44"}}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polygon points="9,1 16,5 16,13 9,17 2,13 2,5" stroke="#fff" strokeWidth="1.5" fill="none"/><polygon points="9,5 13,7 13,11 9,13 5,11 5,7" fill="#fff" opacity="0.35"/></svg>
      </div>
      <div><div style={{fontWeight:700,fontSize:14,letterSpacing:"-0.5px",lineHeight:1,color:"var(--tx)"}}>hive<span style={{color:"var(--acc)"}}>IMR</span></div><div style={{fontSize:8,color:"var(--tx3)",letterSpacing:"0.1em",fontWeight:600}}>INTELLIGENT MEDICAL RECORD</div></div>
    </div>
    <div style={{flex:1}}/>
    {roleConf.aiEnabled&&<div style={{display:"flex",alignItems:"center",gap:5,background:"var(--ai)18",border:"1px solid var(--ai)38",borderRadius:5,padding:"3px 9px"}}><span style={{fontSize:11}}>✦</span><span style={{fontSize:11,fontWeight:600,color:"var(--ai)"}}>AI Active</span></div>}
    {role==="nurse"&&<div style={{display:"flex",alignItems:"center",gap:5,background:"var(--nurse)15",border:"1px solid var(--nurse)38",borderRadius:5,padding:"3px 9px"}}><span style={{fontSize:11}}>♥</span><span style={{fontSize:11,fontWeight:600,color:"var(--nurse)"}}>Day Shift</span></div>}
    <div style={{display:"flex",gap:10,alignItems:"center"}}>{[{l:"Local",ok:true},{l:"Peer",ok:true},{l:"Cloud",warn:true}].map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:5,height:5,borderRadius:3,background:s.ok?"var(--green)":s.warn?"var(--amber)":"var(--red)",animation:s.warn?"pulse 2s infinite":"none"}}/><span style={{fontSize:10,color:"var(--tx3)"}}>{s.l}</span></div>))}</div>
    <div style={{width:1,height:22,background:"var(--bdr2)"}}/>
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 9px",borderRadius:5,background:"var(--surf3)",border:"1px solid var(--bdr)",color:"var(--tx)"}}>
        <div style={{width:24,height:24,borderRadius:4,background:roleConf.color+"22",border:`1px solid ${roleConf.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:roleConf.color,fontWeight:700}}>{roleConf.icon}</div>
        <div style={{textAlign:"left"}}><div style={{fontSize:11,fontWeight:600,lineHeight:1.2}}>{cur?.label}</div><div style={{fontSize:9,color:"var(--tx2)"}}>{cur?.role}</div></div>
        <span style={{color:"var(--tx3)",fontSize:9,marginLeft:1}}>▾</span>
      </button>
      {open&&(<div style={{position:"absolute",top:"calc(100% + 5px)",right:0,background:"var(--surf3)",border:"1px solid var(--bdr)",borderRadius:6,overflow:"hidden",minWidth:240,zIndex:200,boxShadow:"0 12px 40px #00000088"}}>
        {ROLES.map(r=>{const rc=ROLE_CONFIG[r.id];return(<button key={r.id} onClick={()=>{setRole(r.id);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",textAlign:"left",background:r.id===role?"var(--acc)18":"transparent",borderBottom:"1px solid var(--bdr2)",color:r.id===role?"var(--acc)":"var(--tx)"}}>
          <div style={{width:20,height:20,borderRadius:4,background:rc.color+"22",border:`1px solid ${rc.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,flexShrink:0}}>{rc.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{r.label}</div><div style={{fontSize:9,color:"var(--tx3)"}}>{r.role}</div></div>
          {r.id===role&&<span style={{color:"var(--acc)",fontSize:9}}>●</span>}
        </button>);})}
      </div>)}
    </div>
    <div style={{fontSize:10,color:"var(--tx3)",fontFamily:"var(--ffm)",whiteSpace:"nowrap"}}>Tue 21 Apr · {nowTime()}</div>
  </div>);
};

/* ─── SIDEBAR ─────────────────────────────────────────────── */
const Sidebar=({active,setActive,patient,roleConf,role})=>{
  const allowed=roleConf.modules;
  const items=ALL_NAV.map((item,i,arr)=>{
    if(item===null){const nxt=arr.slice(i+1).find(x=>x!==null);return(nxt&&allowed.includes(nxt.id))?item:null;}
    return allowed.includes(item.id)?item:null;
  }).filter((x,i,arr)=>{if(x===null){const nxt=arr.slice(i+1).find(y=>y!==null);return nxt!==null&&nxt!==undefined;}return x!==null;});
  const NURSE_IDS=["shift_board","nurse_snapshot","flowsheet","nurse_handoff"];
  const ADMIN_IDS=["pilot_metrics","coexistence","support"];
  const RX_IDS=["orders_rx"];
  const getAccent=(id)=>NURSE_IDS.includes(id)?"var(--nurse)":ADMIN_IDS.includes(id)?"var(--green)":RX_IDS.includes(id)?"var(--rx)":"var(--acc)";
  return(<div style={{position:"fixed",top:52,left:0,bottom:0,width:194,background:"var(--surf)",borderRight:"1px solid var(--bdr2)",display:"flex",flexDirection:"column",padding:"8px 6px",overflowY:"auto",zIndex:50}}>
    <div style={{margin:"0 4px 8px",padding:"8px 10px",borderRadius:6,background:roleConf.color+"12",border:`1px solid ${roleConf.color}28`}}>
      <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:3}}><span style={{fontSize:13}}>{roleConf.icon}</span><span style={{fontSize:11,fontWeight:700,color:roleConf.color}}>{ROLES.find(r=>r.id===role)?.role}</span></div>
      <div style={{fontSize:10,color:"var(--tx3)",lineHeight:1.4}}>{roleConf.contextLabel}</div>
    </div>
    <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",color:"var(--tx3)",textTransform:"uppercase",padding:"2px 8px",marginBottom:3}}>Modules</div>
    {items.map((item,i)=>item===null?(<div key={i} style={{height:1,background:"var(--bdr2)",margin:"4px 4px"}}/>):(
      <button key={item.id} onClick={()=>setActive(item.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 9px",borderRadius:5,textAlign:"left",marginBottom:1,background:active===item.id?`${getAccent(item.id)}1A`:"transparent",color:active===item.id?getAccent(item.id):"var(--tx2)",fontWeight:active===item.id?600:400,fontSize:11,border:`1px solid ${active===item.id?getAccent(item.id)+"30":"transparent"}`,transition:"all 0.12s"}}>
        <span style={{fontSize:12,width:14,textAlign:"center",opacity:active===item.id?1:0.6,flexShrink:0}}>{item.icon}</span>
        <span style={{flex:1}}>{item.label}</span>
        {roleConf.readOnly.includes(item.id)&&<span style={{fontSize:8,color:"var(--tx3)"}}>view</span>}
      </button>
    ))}
    <div style={{flex:1}}/>
    {patient&&<div style={{margin:"6px 4px",padding:"8px",borderRadius:6,background:"var(--surf2)",border:"1px solid var(--bdr2)"}}><div style={{fontSize:8,color:"var(--tx3)",letterSpacing:"0.08em",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>Active Patient</div><div style={{fontSize:11,fontWeight:600,marginBottom:2}}>{patient.name}</div><Pill color={CTX_COLOR[patient.ctx]} small>{CTX_LABEL[patient.ctx]}</Pill>{patient.code==="DNR / DNI"&&<div style={{marginTop:4,fontSize:9,fontWeight:700,color:"var(--amber)"}}>⚠ DNR / DNI</div>}</div>}
    <div style={{padding:"6px 10px 3px"}}><div style={{fontSize:9,color:"var(--tx3)"}}>hiveIMR v1.0-beta</div></div>
  </div>);
};

/* ─── APP ROOT ────────────────────────────────────────────── */
export default function App(){
  const[role,setRole]=useState("physician");
  const[mod,setMod]=useState("dashboard");
  const[patient,setPatient]=useState(null);
  const[chartPatient,setChartPatient]=useState(null);
  const[patients,setPatients]=useState(PATIENTS);
  const roleConf=ROLE_CONFIG[role];
  const currentUser=ROLES.find(r=>r.id===role)?.label||"Unknown";

  useEffect(()=>{
    let cancelled=false;
    fetch("/api/patients").then(r=>r.ok?r.json():Promise.reject(r.status)).then(d=>{
      if(!cancelled && Array.isArray(d?.patients) && d.patients.length>0) setPatients(d.patients);
    }).catch(()=>{ /* keep hardcoded fallback */ });
    return()=>{cancelled=true;};
  },[]);

  useEffect(()=>{
    const nc=ROLE_CONFIG[role];setMod(nc.defaultMod);setChartPatient(null);
    const pm=["clinical","handoff","billing","um","orders_rx","nurse_snapshot","flowsheet","nurse_handoff"];
    if(!pm.some(m=>nc.modules.includes(m))) setPatient(null);
  },[role]);

  const handleSelectPatient=(p)=>{
    setPatient(p);
    if(role==="nurse") setMod("nurse_snapshot");
    else if(roleConf.modules.includes("clinical")) setMod("clinical");
  };

  const renderMod=()=>{
    if(!roleConf.modules.includes(mod)) return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:12}}><div style={{fontSize:48,opacity:0.12}}>◧</div><div style={{fontWeight:600}}>Module not available for your role.</div></div>);
    switch(mod){
      case "shift_board":    return <ShiftBoard onSelectPatient={handleSelectPatient} chartPatient={chartPatient} setChartPatient={setChartPatient}/>;
      case "nurse_snapshot": return <NurseSnapshot patient={patient} setMod={setMod} setChartPatient={setChartPatient}/>;
      case "flowsheet":      return <FlowsheetView patient={patient} setMod={setMod}/>;
      case "nurse_handoff":  return <NursingHandoff patient={patient} setMod={setMod}/>;
      case "dashboard":      return <Dashboard onSelect={handleSelectPatient} roleConf={roleConf} role={role} setMod={setMod}/>;
      case "clinical":       return <ClinicalView patient={patient} setMod={setMod} currentUser={currentUser} readOnly={roleConf.readOnly.includes("clinical")} roleConf={roleConf} role={role}/>;
      case "orders_rx":      return <OrdersRx patient={patient} setMod={setMod} currentUser={currentUser} roleConf={roleConf} role={role}/>;
      case "handoff":        return <Handoff patient={patient} setMod={setMod} currentUser={currentUser} roleConf={roleConf}/>;
      case "radiology":      return <Radiology currentUser={currentUser} roleConf={roleConf} role={role}/>;
      case "pathology":      return <Pathology roleConf={roleConf} role={role}/>;
      case "billing":        return <Billing patient={patient} setMod={setMod} role={role}/>;
      case "um":             return <UM patient={patient} setMod={setMod} currentUser={currentUser} roleConf={roleConf} role={role}/>;
      case "coexistence":    return <Coexistence/>;
      case "support":        return <Support/>;
      case "pilot_metrics":  return <PilotMetrics/>;
      case "architecture":   return <Architecture/>;
      default: return null;
    }
  };

  return(<PatientsCtx.Provider value={patients}><div style={{minHeight:"100vh",background:"var(--bg)"}}>
    <Topbar role={role} setRole={setRole} roleConf={roleConf}/>
    <Sidebar active={mod} setActive={setMod} patient={patient} roleConf={roleConf} role={role}/>
    <main style={{marginLeft:194,marginTop:52,padding:"18px 22px",minHeight:"calc(100vh - 52px)",paddingBottom:chartPatient?"170px":"18px"}}>{renderMod()}</main>
    {chartPatient&&<QuickChartDrawer patient={chartPatient} nd={NURSING_DATA[chartPatient.id]} onClose={()=>setChartPatient(null)} onSave={()=>setChartPatient(null)}/>}
  </div></PatientsCtx.Provider>);
}
