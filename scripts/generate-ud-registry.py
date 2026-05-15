#!/usr/bin/env python3
"""Generate engines.json entries, registry/engines.md rows, and registry/dns-inventory.md
rows for the 128 UD engines under apps/ud-*. Run from repo root.

Outputs three files in /tmp:
  /tmp/ud-engines.json.fragment   — JSON list to splice into engines.json
  /tmp/ud-engines.md.fragment     — MD rows to append to registry/engines.md
  /tmp/ud-dns.md.fragment         — MD rows to append to registry/dns-inventory.md

Categorization is intentionally coarse (5 buckets) to avoid mis-classifying
long-tail engines. Status is "scaffolded" for all except ud-medical and ud-bulk
("built") and ud-inc ("scaffolded" — hub repaired in same PR but not deployed).
"""

import json
import os
from pathlib import Path

REPO = Path(__file__).parent.parent
APPS_DIR = REPO / "apps"
TODAY = "2026-05-15"

# Slugs known to be differentiated from the PlainScan clone
BUILT_SCOPE_FIT = {"ud-medical"}     # template fits declared scope
BUILT_CUSTOM = {"ud-bulk"}            # custom UI

# Coarse categorization. Slugs not in any bucket fall to "domain".
CORE = {"ud-inc", "ud-converter", "ud-creator", "ud-reader", "ud-validator",
        "ud-utilities", "ud-signer", "ud-bulk", "ud-api", "ud-audit"}
FORMAT = {"ud-pdf", "ud-docx", "ud-xlsx", "ud-pptx", "ud-jpg", "ud-png",
          "ud-svg", "ud-tiff", "ud-csv", "ud-json", "ud-yaml", "ud-xml",
          "ud-html", "ud-markdown", "ud-txt", "ud-rtf", "ud-mobi", "ud-epub",
          "ud-mp3-transcript", "ud-mp4-transcript", "ud-audioscript", "ud-ocr"}
SECURITY = {"ud-encryptor", "ud-decryptor", "ud-redactor", "ud-anonymizer",
            "ud-watermarker", "ud-versioncontrol", "ud-syntaxchecker",
            "ud-gdpr-consent", "ud-soc2-audit", "ud-hipaa-claims", "ud-crypto"}
ANALYSIS = {"ud-summarizer", "ud-translator", "ud-toneanalyzer",
            "ud-factchecker", "ud-plagiarismchecker", "ud-classifier",
            "ud-comparator", "ud-diffviewer", "ud-formattingfixer",
            "ud-formextractor", "ud-graphextractor", "ud-tableextractor",
            "ud-metadataextractor", "ud-signatureextractor", "ud-indexer",
            "ud-searcher", "ud-citationgenerator", "ud-splitter",
            "ud-compressor"}

# Per-slug human descriptions. Falls back to a templated description if absent.
DESCRIPTIONS = {
    "ud-inc": "Universal Document™ hub — the front door to the UD ecosystem",
    "ud-converter": "Universal Document™ converter — transform between document formats",
    "ud-creator": "Universal Document™ creator — author UDR documents from scratch",
    "ud-reader": "Universal Document™ reader — view UDR/UDS documents",
    "ud-validator": "Universal Document™ validator — schema-check UDR/UDS files",
    "ud-utilities": "Universal Document™ utilities — misc tools for UD workflows",
    "ud-signer": "Universal Document™ signer — produce sealed UDS documents",
    "ud-bulk": "Universal Document™ bulk — enterprise dropzone for mass ingestion",
    "ud-api": "Universal Document™ API — programmatic access to the UD substrate",
    "ud-audit": "Universal Document™ audit — trace and review UD operations",
    "ud-medical": "Universal Document™ medical — clinical document analysis",
    "ud-pdf": "Universal Document™ for PDF — PDF-specific tooling",
    "ud-docx": "Universal Document™ for DOCX — Word document tooling",
    "ud-xlsx": "Universal Document™ for XLSX — spreadsheet tooling",
    "ud-pptx": "Universal Document™ for PPTX — presentation tooling",
    "ud-ocr": "Universal Document™ OCR — image-to-text extraction",
    "ud-summarizer": "Universal Document™ summarizer — condense long documents",
    "ud-translator": "Universal Document™ translator — translate documents across languages",
    "ud-redactor": "Universal Document™ redactor — remove sensitive content",
    "ud-anonymizer": "Universal Document™ anonymizer — strip identifying info",
    "ud-watermarker": "Universal Document™ watermarker — add provenance marks",
    "ud-encryptor": "Universal Document™ encryptor — protect UD files at rest",
    "ud-decryptor": "Universal Document™ decryptor — unlock encrypted UD files",
    "ud-1099": "Universal Document™ for 1099 forms — IRS 1099 processing",
    "ud-w2": "Universal Document™ for W-2 forms — IRS W-2 processing",
    "ud-irs-form": "Universal Document™ for IRS forms — general IRS form processing",
    "ud-passport": "Universal Document™ for passports — passport document processing",
    "ud-visa": "Universal Document™ for visas — visa document processing",
    "ud-driverslicense": "Universal Document™ for driver's licenses",
    "ud-prescription": "Universal Document™ for prescriptions",
    "ud-contract": "Universal Document™ for contracts",
    "ud-nda": "Universal Document™ for NDAs",
    "ud-deed": "Universal Document™ for deeds",
    "ud-will": "Universal Document™ for wills",
    "ud-trust": "Universal Document™ for trust documents",
    "ud-patent": "Universal Document™ for patents",
    "ud-trademark": "Universal Document™ for trademarks",
    "ud-copyright": "Universal Document™ for copyright filings",
    "ud-dna-sequence": "Universal Document™ for DNA sequences",
    "ud-protein": "Universal Document™ for protein structure documents",
    "ud-chemical-formula": "Universal Document™ for chemical formulas",
    "ud-flight-log": "Universal Document™ for flight logs",
    "ud-astronomy-log": "Universal Document™ for astronomy observation logs",
    "ud-seismic": "Universal Document™ for seismic data",
    "ud-weather-data": "Universal Document™ for weather data",
    "ud-resume": "Universal Document™ for résumés and CVs",
    "ud-receipt": "Universal Document™ for receipts",
    "ud-invoice": "Universal Document™ for invoices",
    "ud-purchaseorder": "Universal Document™ for purchase orders",
}


def slug_to_name(slug: str) -> str:
    """ud-1099 -> UD1099; ud-mp3-transcript -> UDMp3Transcript."""
    parts = slug.split("-")
    head = parts[0].upper()  # UD
    rest = []
    for p in parts[1:]:
        if p.isdigit():
            rest.append(p)
        else:
            rest.append(p[0].upper() + p[1:])
    return head + "".join(rest)


def category_for(slug: str) -> str:
    if slug in CORE:
        return "core"
    if slug in FORMAT:
        return "format"
    if slug in SECURITY:
        return "security"
    if slug in ANALYSIS:
        return "analysis"
    return "domain"


def status_for(slug: str) -> str:
    if slug in BUILT_SCOPE_FIT:
        return "built-scope-fit"
    if slug in BUILT_CUSTOM:
        return "built-custom"
    return "scaffolded"


def description_for(slug: str) -> str:
    if slug in DESCRIPTIONS:
        return DESCRIPTIONS[slug]
    # Templated fallback: derive from slug (best-effort)
    rest = slug.replace("ud-", "").replace("-", " ")
    return f"Universal Document™ for {rest}"


def domain_for(slug: str) -> str:
    if slug == "ud-inc":
        return "universaldocument.hive.baby"
    sub = slug.replace("ud-", "")
    return f"{sub}.universaldocument.hive.baby"


def main() -> None:
    slugs = sorted(d.name for d in APPS_DIR.iterdir() if d.is_dir() and d.name.startswith("ud-"))
    if len(slugs) != 128:
        print(f"WARN: expected 128 ud-* slugs, found {len(slugs)}")

    json_entries = []
    md_rows = []
    dns_rows = []

    for slug in slugs:
        name = slug_to_name(slug)
        desc = description_for(slug)
        cat = category_for(slug)
        status = status_for(slug)
        domain = domain_for(slug)

        json_entries.append({
            "id": slug,
            "name": name,
            "url": f"https://{domain}",
            "description": desc,
            "status": status,
            "category": cat,
            "path": f"apps/{slug}",
            "dns": "missing",
            "vercel": "not_provisioned",
            "planet_listed": False,
        })

        md_rows.append(
            f"| {name} | saggarsonny-boop/hivebaby (apps/{slug}) | {domain} | v0.1 | {status} | — | UD ecosystem |"
        )

        dns_rows.append(
            f"| {domain} | (not registered) | CNAME | NOT REGISTERED | UD scaffold; {status}; not deployed. |"
        )

    Path("/tmp/ud-engines.json.fragment").write_text(
        json.dumps(json_entries, indent=2, ensure_ascii=False) + "\n"
    )
    Path("/tmp/ud-engines.md.fragment").write_text("\n".join(md_rows) + "\n")
    Path("/tmp/ud-dns.md.fragment").write_text("\n".join(dns_rows) + "\n")

    print(f"Generated {len(slugs)} entries.")
    print("  /tmp/ud-engines.json.fragment")
    print("  /tmp/ud-engines.md.fragment")
    print("  /tmp/ud-dns.md.fragment")


if __name__ == "__main__":
    main()
