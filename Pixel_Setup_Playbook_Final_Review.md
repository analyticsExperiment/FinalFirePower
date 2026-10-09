# Pixel Setup Playbook Final Review

Review date: 9 October 2026

## 1. Review basis and result

The final playbook uses the manager’s original Word document as its design foundation. Its existing Word styles, table formats, title banner, callouts, page layout and screenshot components have been reused. The verified implementation content from the latest technical playbook and technical review has been fitted into that structure.

| Input | Role |
|---|---|
| `Pixel_Setup_Playbook_Adobe_Tags.docx` | Authoritative design and process presentation |
| `Adobe_Tags_Pixel_Implementation_Playbook.docx` | Latest technical explanations and corrections |
| `Adobe_Tags_Playbook_Technical_Review.md` | Confirmed details and outstanding team verification items |
| `Citi_BridgeTrack_Implementation_Playbook(1).docx` | Original team implementation reference |

This refinement checked the supplied documents and retained technical review. No live Adobe Tags configuration, API or application journey was accessed. No deployed rule, Data Element, extension, library or JavaScript was changed. Implementation statements retain the basis documented in the existing technical review; they are not new claims of live verification.

The final Word document and matching PDF preview contain **20 pages** in the inspected rendering. All seven screenshots are included. All four original inputs remain unchanged.

## 2. Content and formatting changes

### Manager presentation retained

- Exact cover wording: **PROCESS PLAYBOOK**, **Pixel Setup in Adobe Tags**, and **A step-by-step guide for the media pixel team**.
- Original navy title banner and original two-column cover information table, including its labels, text, owner placeholder and October 2026 version line.
- Original Arial typography, heading sizes and colours, blue heading rules, step headings, navy table headers and light-blue/grey table cells.
- Original NOTE, TIP, IMPORTANT and DO NOT formatting, including backgrounds, accent borders and spacing.
- Original A4 page dimensions, margins, table widths and header/footer positions.
- Original right-aligned grey header style. Its wording is now “Pixel Setup in Adobe Tags” so the document remains suitable for additional vendors.
- Original centred grey footer and top rule: **Internal and confidential | Page X of Y**. PAGE and NUMPAGES remain actual Word fields. The cached total is refreshed to 20 and field updating is enabled.
- Original screenshot media and caption style. Figure 7 uses the established crop from the latest technical document.

The cover banner and information table are unchanged in the Word package and match the original rendered cover body pixel for pixel. The source style definitions, numbering, theme, fonts, document relationships and all seven media files are unchanged. Only the document content, header wording, field-update setting, footer’s cached total and related document metadata were edited.

### Content fitted into the original process structure

1. About this playbook
2. How the pixel works
3. Before you start
4. Vendor 1: BridgeTrack
5. Part A: Set up the App Start pixel
6. Part B: Set up the outcome pixels
7. Part C: How the NGA rule triggers the pixels
8. Part D: Data Elements
9. Part E: Test your pixel
10. Fixing common problems
11. Record your work
12. Adding a brand-new third-party pixel
13. Golden rules
14. Who to contact

The opening now explains third-party pixels generally. Vendor details begin in the BridgeTrack section. Funding Start remains a separate page-load explanation within Part B, and all three prequalification mappings remain in the outcome table. The future-vendor guidance remains a nine-step process with the manager’s quick-reference table.

Technical explanations were reused from the latest playbook within the manager’s paragraphs, tables and callouts. Small pagination changes keep short reference tables together, repeat headers where longer tables continue, and remove a short contact-only trailing page. The expansion from the original 18 pages to 20 pages retains its typography and spacing while adding the verified details; the compact 14-page document’s replacement design was not reused.

## 3. Technical information and corrections retained

| Area | Final treatment |
|---|---|
| Existing App Start rule | `Third_Party_Bridgetrack_MV_Cards_Conversion_NGAAppStartPages` is identified; Core Window Loaded, order 50 |
| Application path | Core Path with regex enabled: `^(/US/(ag\|nga)/cards/application/?)$`; explained as a pattern with optional trailing slash, not a literal URL |
| Application query | Core Query String parameter `app`; regex `^(UNSOL)$` |
| Campaign lookup | `URL_cmp` reads `cmp`; parameter-name case sensitivity is distinct from the value comparison |
| Campaign condition | Separate `%URL_cmp%` Starts With `afa`; no unsupported comparison-case setting is invented |
| Host condition | Existing condition retained; no new approved host list or revised regex supplied |
| App Start data sources | `window._dl.pid`, `window._dl.prospect_id`, `window.sc`, `window.appId`, `window.businessTypCd`, `window.prodType`, `window.appType` |
| Six required values | `prodId`, `prspectId`, `sc`, `businessTypCd`, `prodType`, `appType`; application values are read again inside `checker()` |
| Retry count | Immediate initial evaluation plus up to ten additional checks scheduled approximately one second apart; up to eleven evaluations |
| appId distinction | Used in the outgoing URL but outside `allReady`; existing empty-appId behaviour retained |
| Vendor endpoint | `https://citi.bridgetrack.com/track/citicards/s/` |
| All eight parameters | `pid`, `docid`, `app`, `appId`, `type`, `r`, `ProspectID`, `sc`; spelling and case preserved |
| pid and cache buster | Existing `prodId + prodType` sequence and value types retained; `Math.random() * 10000000000000` described as a cache buster |
| Native script insertion | Create script, set type, set async, assign URL, append to head/documentElement; all five lines remain selectable text and are shown in Figure 4 |
| Ensighten helper | `Bootstrapper.insertScript()` belongs to Ensighten; original deferred insertion and Launch’s immediate append remain distinguished |
| Page events | Original DOM-loaded binding and migrated Window Loaded are identified as different events |
| Outcome/prequalification actions | Seven exact identifiers/docid pairs retained; direct request construction is not presented as App Start’s recursive checker |
| Approval check | `_dl.site_events` check for `app_approved`, `registration_complete` or `application_complete` retained |
| Rule conditions versus action checks | Separate explanations; no new outer conditions invented for the seven mapped outcome/prequalification rules |
| NGA signals | `na_tms_page_view` → `na_launch_page_view`; `na_tms_custom_event` → `na_launch_interaction` |
| Business-event Direct Calls | NGA checks the application state and sends the specific identifier; sending a Direct Call does not bypass conditions or internal checks |
| Original NGA data model | Original Ensighten NGA code already read `_dl.pid` and `_dl.prospect_id`; no unsupported citiData-to-_dl migration is claimed |
| Funding Start | Separate Window Loaded/order 50 rule, existing hosts/path/page-name condition, `dd_fundstart`, global request values and direct insertion retained |
| Funding lookup | `citidata_pageDef` reads `window.citiData.pageName`; existing “na”/undefined fallback distinction retained |
| Data standardization | Validate the equivalent `_dl` field, value, type and timing before changing a rule that still reads `citiData` |
| Testing | Developer Tools, Network filtering, request parameters, values, identifiers, missing values, retries, duplicate requests and navigation checks retained |
| Future vendors | Choose the vendor’s appropriate extension, JavaScript/library or tracking method; do not apply BridgeTrack parameters, insertion or retries to every vendor |

### Exact event mapping

| Business event | Direct Call identifier | BridgeTrack docid |
|---|---|---|
| Approved | `NGA_application_approved` | `NGA_Approved` |
| Declined | `NGA_application_declined` | `NGA_Declined` |
| Pending | `NGA_application_pended` | `NGA_Pending` |
| Registered | `NGA_application_registration` | `NGA_Registered` |
| Prequal Submit | `NGA_prequal_submit` | `NGA_INPQ_SUBMIT` |
| Prequal Approved | `NGA_prequal_approved` | `NGA_INPQ_APPROVE` |
| Prequal Declined | `NGA_prequal_declined` | `NGA_INPQ_DECLINE` |

## 4. Items requiring implementation-team verification

These items remain from the existing technical review. This formatting refinement does not resolve them or change the implementation.

1. **App Start hostname condition.** The retained local expression is `/^(uat.\.online\.citi\.com|uat..\.online\.citi\.com|online\.citi\.com)$/`. The dots immediately following `uat` are wildcard characters. Confirm the intended approved host set and current condition before changing the expression.
2. **URL_cmp default value.** The retained configuration has a default string containing two double-quote characters (`""`), rather than an empty string. Confirm whether this fallback is intended. It does not validate the `afa` campaign prefix.
3. **NGA route coverage and timing.** The retained outer path condition covers the base application path, while the action checks declined, pended and pend-resolution subpaths. Confirm the applicable route when the application signals run and the intended outer condition. The pend-resolution dispatch visible in Figure 6 is commented out and is not added as an active mapping.
4. **Future Funding _dl field.** The existing source establishes `window.citiData.pageName`, but not its equivalent `_dl` field. Confirm its field name, business value, data type and availability before changing the Funding lookup.

## 5. Screenshot and visual review

| Figure | Content | Final PDF page | Treatment |
|---|---|---|---|
| 1 | App Start Core Window Loaded event | 7 | Original screenshot and size retained; order is documented in text |
| 2 | App Start Core Custom Code action | 8 | Original screenshot retained |
| 3 | App Start inputs and six-field readiness check | 8 | Original technical values retained |
| 4 | Native JavaScript script insertion | 10 | Original screenshot retained; selectable code also included |
| 5 | Core Direct Call and Approval identifier | 12 | Original screenshot retained |
| 6 | NGA named application Direct Calls | 13 | Original screenshot retained; commented branch not treated as active |
| 7 | cmp query lookup and case option | 15 | Existing crop reused to show the relevant configuration without unrelated naming/UI |

All seven meaningful screenshots are included; none were excluded, replaced or fabricated.

### Review A — Visual comparison

The final cover was compared directly with the manager’s original rendered cover. Banner, title hierarchy, subtitle, information table, alignment and margins match. Only the generic header wording and updated page total differ intentionally. Representative internal pages retain the original blue headings, step bars, tables, callouts, captions and screenshot presentation.

All 20 final pages were inspected individually after the final revision. No clipped text, overlaps, stranded headings, split rows or blank trailing pages were found. Longer glossary and troubleshooting tables continue with repeated headers. Short event, condition, source, lookup, checklist and record tables remain together. Header and footer appear on all 20 pages, with correct sequential page numbers and total 20. The PDF is the matching rendering of the delivered Word file.

### Review B — Technical completeness

Checked all eight request parameters, seven Direct Call/docid pairs, exact App Start regex/query settings, source mappings, native insertion lines, retry count, appId distinction, Funding lookup and data-standardization guidance against the latest technical content and review. These details remain present. No new host list, equivalent Funding field, business condition or live validation result is asserted.

### Review C — Reader usability

The generic opening explains pixels, common terms and Event → Condition → Action. Parts A–E give the reader the rule configuration, conditions, source values and browser checks in order. App Start’s readiness function is distinguished from direct outcome actions. The NGA example shows how the exact Direct Call identifies the matching rule. Troubleshooting and new-vendor instructions retain the manager’s simple process wording and tables.

The reader-facing text has no POC wording, unnecessary architecture terminology or private tooling references.

## 6. Remaining placeholders

- Cover document owner: `[Add name / team]`.
- Technical contact: `[Add technical lead name and email]`.
- Adobe Tags access contact: `[Add access owner]`.
- Business contact: `[Add business owner]`.
- Section 11 contains intentional `[Enter ...]` prompts for recording each future pixel; they are reusable form fields, not missing implementation details.
- The cover version/date remains the requested **1.0 | October 2026**.

## 7. Input preservation

| Unchanged input | SHA-256 |
|---|---|
| `Pixel_Setup_Playbook_Adobe_Tags.docx` | `98eb5e0b32f25f83776fd80081e0e1b17ae2adc3c3ce0c0356b572c8afdfd166` |
| `Adobe_Tags_Pixel_Implementation_Playbook.docx` | `dad3c488d048164ce3879646d0dbcf71896758b25c6157dea2ee98375075611d` |
| `Adobe_Tags_Playbook_Technical_Review.md` | `9ccb18939251af02291dd99314eccac93d9551425cfc52bcd1386439837c5e77` |
| `Citi_BridgeTrack_Implementation_Playbook(1).docx` | `6b194339bdcc798ff358aa1321c721cdf21f5e5ba357964be2dde4b81170f3ec` |
