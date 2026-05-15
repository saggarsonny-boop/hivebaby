# Hive Engine Registry

Canonical operational list of shipped engines. Append-only — append a row when an engine ships, update the `status` and `version` columns when an engine evolves. The structured machine-readable list is in `engines.json` at the repo root.

| Name | Repo | Domain | Version | Status | Deploy date | Owner |
|---|---|---|---|---|---|---|
| ParkBack | saggarsonny-boop/hivebaby (apps/parkback) | parkback.hive.baby | v0.1 | shipped | 2026-05-04 | Sonny |

## Universal Document™ ecosystem — scaffolded fleet

These 128 engines are scaffolded under `apps/ud-*` but **not deployed**. Status field uses three values:
- `scaffolded` — Next.js app exists; clones the HivePlainScan template; no scope-aligned implementation
- `built-scope-fit` — implementation exists and matches the engine's declared scope (currently only `ud-medical`)
- `built-custom` — non-cloned, differentiated UI (currently only `ud-bulk`)

None have DNS, none have Vercel projects, none appear on the hive.baby planet. See `docs/UD_ECOSYSTEM_AUDIT_2026-05-15.md` and `engines.json` for the structured form.

| Name | Repo | Domain | Version | Status | Deploy date | Owner |
|---|---|---|---|---|---|---|
| UD1099 | saggarsonny-boop/hivebaby (apps/ud-1099) | 1099.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDAcademic | saggarsonny-boop/hivebaby (apps/ud-academic) | academic.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDAnonymizer | saggarsonny-boop/hivebaby (apps/ud-anonymizer) | anonymizer.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDApi | saggarsonny-boop/hivebaby (apps/ud-api) | api.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDArchitecture | saggarsonny-boop/hivebaby (apps/ud-architecture) | architecture.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDAstronomyLog | saggarsonny-boop/hivebaby (apps/ud-astronomy-log) | astronomy-log.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDAudioscript | saggarsonny-boop/hivebaby (apps/ud-audioscript) | audioscript.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDAudit | saggarsonny-boop/hivebaby (apps/ud-audit) | audit.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDAviation | saggarsonny-boop/hivebaby (apps/ud-aviation) | aviation.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDBankstatement | saggarsonny-boop/hivebaby (apps/ud-bankstatement) | bankstatement.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDBilloflading | saggarsonny-boop/hivebaby (apps/ud-billoflading) | billoflading.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDBlueprint | saggarsonny-boop/hivebaby (apps/ud-blueprint) | blueprint.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDBulk | saggarsonny-boop/hivebaby (apps/ud-bulk) | bulk.universaldocument.hive.baby | v0.1 | built-custom | — | UD ecosystem |
| UDChemicalFormula | saggarsonny-boop/hivebaby (apps/ud-chemical-formula) | chemical-formula.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCircuit | saggarsonny-boop/hivebaby (apps/ud-circuit) | circuit.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCitationgenerator | saggarsonny-boop/hivebaby (apps/ud-citationgenerator) | citationgenerator.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDClassifier | saggarsonny-boop/hivebaby (apps/ud-classifier) | classifier.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDComparator | saggarsonny-boop/hivebaby (apps/ud-comparator) | comparator.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCompliance | saggarsonny-boop/hivebaby (apps/ud-compliance) | compliance.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCompressor | saggarsonny-boop/hivebaby (apps/ud-compressor) | compressor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDContract | saggarsonny-boop/hivebaby (apps/ud-contract) | contract.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDConverter | saggarsonny-boop/hivebaby (apps/ud-converter) | converter.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCopyright | saggarsonny-boop/hivebaby (apps/ud-copyright) | copyright.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCreator | saggarsonny-boop/hivebaby (apps/ud-creator) | creator.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCrypto | saggarsonny-boop/hivebaby (apps/ud-crypto) | crypto.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCsv | saggarsonny-boop/hivebaby (apps/ud-csv) | csv.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDCustoms | saggarsonny-boop/hivebaby (apps/ud-customs) | customs.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDDecryptor | saggarsonny-boop/hivebaby (apps/ud-decryptor) | decryptor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDDeed | saggarsonny-boop/hivebaby (apps/ud-deed) | deed.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDDiffviewer | saggarsonny-boop/hivebaby (apps/ud-diffviewer) | diffviewer.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDDnaSequence | saggarsonny-boop/hivebaby (apps/ud-dna-sequence) | dna-sequence.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDDocx | saggarsonny-boop/hivebaby (apps/ud-docx) | docx.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDDriverslicense | saggarsonny-boop/hivebaby (apps/ud-driverslicense) | driverslicense.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDEarningsCall | saggarsonny-boop/hivebaby (apps/ud-earnings-call) | earnings-call.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDEducation | saggarsonny-boop/hivebaby (apps/ud-education) | education.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDEncryptor | saggarsonny-boop/hivebaby (apps/ud-encryptor) | encryptor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDEngineering | saggarsonny-boop/hivebaby (apps/ud-engineering) | engineering.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDEpub | saggarsonny-boop/hivebaby (apps/ud-epub) | epub.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDFactchecker | saggarsonny-boop/hivebaby (apps/ud-factchecker) | factchecker.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDFiction | saggarsonny-boop/hivebaby (apps/ud-fiction) | fiction.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDFinance | saggarsonny-boop/hivebaby (apps/ud-finance) | finance.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDFlightLog | saggarsonny-boop/hivebaby (apps/ud-flight-log) | flight-log.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDFormattingfixer | saggarsonny-boop/hivebaby (apps/ud-formattingfixer) | formattingfixer.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDFormextractor | saggarsonny-boop/hivebaby (apps/ud-formextractor) | formextractor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDGdprConsent | saggarsonny-boop/hivebaby (apps/ud-gdpr-consent) | gdpr-consent.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDGovernance | saggarsonny-boop/hivebaby (apps/ud-governance) | governance.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDGovernment | saggarsonny-boop/hivebaby (apps/ud-government) | government.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDGraphextractor | saggarsonny-boop/hivebaby (apps/ud-graphextractor) | graphextractor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDHipaaClaims | saggarsonny-boop/hivebaby (apps/ud-hipaa-claims) | hipaa-claims.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDHospitality | saggarsonny-boop/hivebaby (apps/ud-hospitality) | hospitality.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDHr | saggarsonny-boop/hivebaby (apps/ud-hr) | hr.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDHtml | saggarsonny-boop/hivebaby (apps/ud-html) | html.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDImmigration | saggarsonny-boop/hivebaby (apps/ud-immigration) | immigration.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDInc | saggarsonny-boop/hivebaby (apps/ud-inc) | universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDIndexer | saggarsonny-boop/hivebaby (apps/ud-indexer) | indexer.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDInsurance | saggarsonny-boop/hivebaby (apps/ud-insurance) | insurance.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDInvoice | saggarsonny-boop/hivebaby (apps/ud-invoice) | invoice.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDIrsForm | saggarsonny-boop/hivebaby (apps/ud-irs-form) | irs-form.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDJournalism | saggarsonny-boop/hivebaby (apps/ud-journalism) | journalism.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDJpg | saggarsonny-boop/hivebaby (apps/ud-jpg) | jpg.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDJson | saggarsonny-boop/hivebaby (apps/ud-json) | json.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDLeaseAgreement | saggarsonny-boop/hivebaby (apps/ud-lease-agreement) | lease-agreement.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDLegal | saggarsonny-boop/hivebaby (apps/ud-legal) | legal.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDLogistics | saggarsonny-boop/hivebaby (apps/ud-logistics) | logistics.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDManufacturing | saggarsonny-boop/hivebaby (apps/ud-manufacturing) | manufacturing.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMaritime | saggarsonny-boop/hivebaby (apps/ud-maritime) | maritime.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMarkdown | saggarsonny-boop/hivebaby (apps/ud-markdown) | markdown.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMarketing | saggarsonny-boop/hivebaby (apps/ud-marketing) | marketing.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMedical | saggarsonny-boop/hivebaby (apps/ud-medical) | medical.universaldocument.hive.baby | v0.1 | built-scope-fit | — | UD ecosystem |
| UDMerger | saggarsonny-boop/hivebaby (apps/ud-merger) | merger.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMetadataextractor | saggarsonny-boop/hivebaby (apps/ud-metadataextractor) | metadataextractor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMobi | saggarsonny-boop/hivebaby (apps/ud-mobi) | mobi.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMp3Transcript | saggarsonny-boop/hivebaby (apps/ud-mp3-transcript) | mp3-transcript.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDMp4Transcript | saggarsonny-boop/hivebaby (apps/ud-mp4-transcript) | mp4-transcript.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDNda | saggarsonny-boop/hivebaby (apps/ud-nda) | nda.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDNonprofit | saggarsonny-boop/hivebaby (apps/ud-nonprofit) | nonprofit.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDOcr | saggarsonny-boop/hivebaby (apps/ud-ocr) | ocr.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPassport | saggarsonny-boop/hivebaby (apps/ud-passport) | passport.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPatent | saggarsonny-boop/hivebaby (apps/ud-patent) | patent.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPdf | saggarsonny-boop/hivebaby (apps/ud-pdf) | pdf.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPlagiarismchecker | saggarsonny-boop/hivebaby (apps/ud-plagiarismchecker) | plagiarismchecker.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPng | saggarsonny-boop/hivebaby (apps/ud-png) | png.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPptx | saggarsonny-boop/hivebaby (apps/ud-pptx) | pptx.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPrescription | saggarsonny-boop/hivebaby (apps/ud-prescription) | prescription.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDProtein | saggarsonny-boop/hivebaby (apps/ud-protein) | protein.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDPurchaseorder | saggarsonny-boop/hivebaby (apps/ud-purchaseorder) | purchaseorder.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDReader | saggarsonny-boop/hivebaby (apps/ud-reader) | reader.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDRealestate | saggarsonny-boop/hivebaby (apps/ud-realestate) | realestate.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDReceipt | saggarsonny-boop/hivebaby (apps/ud-receipt) | receipt.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDRedactor | saggarsonny-boop/hivebaby (apps/ud-redactor) | redactor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDResearch | saggarsonny-boop/hivebaby (apps/ud-research) | research.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDResume | saggarsonny-boop/hivebaby (apps/ud-resume) | resume.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDRetail | saggarsonny-boop/hivebaby (apps/ud-retail) | retail.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDRtf | saggarsonny-boop/hivebaby (apps/ud-rtf) | rtf.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSales | saggarsonny-boop/hivebaby (apps/ud-sales) | sales.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSchematic | saggarsonny-boop/hivebaby (apps/ud-schematic) | schematic.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDScience | saggarsonny-boop/hivebaby (apps/ud-science) | science.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSearcher | saggarsonny-boop/hivebaby (apps/ud-searcher) | searcher.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSecFiling | saggarsonny-boop/hivebaby (apps/ud-sec-filing) | sec-filing.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSeismic | saggarsonny-boop/hivebaby (apps/ud-seismic) | seismic.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDShippingManifest | saggarsonny-boop/hivebaby (apps/ud-shipping-manifest) | shipping-manifest.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSignatureextractor | saggarsonny-boop/hivebaby (apps/ud-signatureextractor) | signatureextractor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSigner | saggarsonny-boop/hivebaby (apps/ud-signer) | signer.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSoc2Audit | saggarsonny-boop/hivebaby (apps/ud-soc2-audit) | soc2-audit.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSplitter | saggarsonny-boop/hivebaby (apps/ud-splitter) | splitter.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSummarizer | saggarsonny-boop/hivebaby (apps/ud-summarizer) | summarizer.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSvg | saggarsonny-boop/hivebaby (apps/ud-svg) | svg.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDSyntaxchecker | saggarsonny-boop/hivebaby (apps/ud-syntaxchecker) | syntaxchecker.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTableextractor | saggarsonny-boop/hivebaby (apps/ud-tableextractor) | tableextractor.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTaxation | saggarsonny-boop/hivebaby (apps/ud-taxation) | taxation.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTaxreturn | saggarsonny-boop/hivebaby (apps/ud-taxreturn) | taxreturn.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTiff | saggarsonny-boop/hivebaby (apps/ud-tiff) | tiff.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDToneanalyzer | saggarsonny-boop/hivebaby (apps/ud-toneanalyzer) | toneanalyzer.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTrademark | saggarsonny-boop/hivebaby (apps/ud-trademark) | trademark.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTranslator | saggarsonny-boop/hivebaby (apps/ud-translator) | translator.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTrust | saggarsonny-boop/hivebaby (apps/ud-trust) | trust.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDTxt | saggarsonny-boop/hivebaby (apps/ud-txt) | txt.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDUtilities | saggarsonny-boop/hivebaby (apps/ud-utilities) | utilities.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDValidator | saggarsonny-boop/hivebaby (apps/ud-validator) | validator.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDVersioncontrol | saggarsonny-boop/hivebaby (apps/ud-versioncontrol) | versioncontrol.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDVisa | saggarsonny-boop/hivebaby (apps/ud-visa) | visa.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDW2 | saggarsonny-boop/hivebaby (apps/ud-w2) | w2.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDWatermarker | saggarsonny-boop/hivebaby (apps/ud-watermarker) | watermarker.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDWeatherData | saggarsonny-boop/hivebaby (apps/ud-weather-data) | weather-data.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDWill | saggarsonny-boop/hivebaby (apps/ud-will) | will.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDXlsx | saggarsonny-boop/hivebaby (apps/ud-xlsx) | xlsx.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDXml | saggarsonny-boop/hivebaby (apps/ud-xml) | xml.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
| UDYaml | saggarsonny-boop/hivebaby (apps/ud-yaml) | yaml.universaldocument.hive.baby | v0.1 | scaffolded | — | UD ecosystem |
