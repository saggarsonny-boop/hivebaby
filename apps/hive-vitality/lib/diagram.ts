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
