# Adobe Tags Playbook Technical Review

Review date: 8 October 2026

Final playbook: `Adobe_Tags_Pixel_Implementation_Playbook.docx`

## Review basis

Both selected documents were read in full and their pages and seven screenshots were inspected individually:

| Source | Role | Input SHA-256 |
|---|---|---|
| `Pixel_Setup_Playbook_Adobe_Tags.docx` | Manager's presentation reference | `98eb5e0b32f25f83776fd80081e0e1b17ae2adc3c3ce0c0356b572c8afdfd166` |
| `Citi_BridgeTrack_Implementation_Playbook(1).docx` | Team's manually revised technical reference | `6b194339bdcc798ff358aa1321c721cdf21f5e5ba357964be2dde4b81170f3ec` |

Implementation details were also checked against the existing 6 October local Citi UAT/Ensighten source files. This was a documentation review. No current Launch UI/API configuration or live application journey was inspected in this task, and no deployed rule, Data Element, extension or library was changed. Local source confirmation is distinguished from live verification below.

## A. Content comparison

### Content retained and presentation adopted

| Area | Retained technical detail | Presentation in final playbook |
|---|---|---|
| General introduction | Events, conditions, actions, Direct Calls, Data Elements and source values | Generic opening before the BridgeTrack vendor section; short glossary and WHEN → IF → THEN explanation |
| Completed migration | Ensighten methods replaced with Launch/native JavaScript; vendor request retained | Simple comparison table and selectable before/after examples |
| App Start | Window Loaded, order 50, conditions, `_dl`/global values, six-field readiness, checker and URL/script behaviour | Parts A1–A9 with configuration tables and the original figures |
| Script insertion | Create element, type, async, src and appendChild; difference from Ensighten helper insertion | All five native lines are selectable Word text; actual code screenshot retained |
| Application events | Exact identifiers, event-specific docid, direct request construction and internal checks | Part B mapping table covering all seven outcome/prequalification events |
| Funding Start | Separate Window Loaded rule, `dd_fundstart`, global request values and `citiData.pageName` lookup | Separate setting table rather than grouping it with NGA outcome Direct Calls |
| NGA Rule | Application event names, business-event Direct Calls and matching BridgeTrack rules | Part C simple vertical flow, Approval example and code screenshot |
| Lookups and data layer | `URL_cmp`, `citidata_pageDef`, actual NGA `_dl` fields and scoped standardization guidance | Part D practical lookup instructions with a tightly cropped campaign figure |
| Testing/support | Event/conditions/values/request checks and maintainable implementation guidance | Part E checklist; troubleshooting table; new-vendor steps; reusable documentation record |

### Technical corrections and clarifications

| Supplied wording or omission | Final treatment | Reason |
|---|---|---|
| Application path presented as an exact `/US/(ag\|nga)/cards/application` URL | Shows actual Core Path regex `^(/US/(ag\|nga)/cards/application/?)$`, with regex enabled and the two resulting paths | It is a regular expression, with an optional trailing slash, not a literal URL |
| `cmp`, capitalization option and `afa` condition could be read as one setting | Separates query key `cmp`, lookup `URL_cmp`, parameter-name case and `%URL_cmp%` Starts With `afa` | The Data Element reads the value; a separate rule condition compares the prefix |
| Broad wording suggests all `citiData` fields already moved to `_dl` | Explicitly states that original NGA Ensighten code already used `_dl.pid` and `_dl.prospect_id`; Funding remains on `citiData.pageName` | Avoids attributing an unsupported data-source change to this migration |
| Main parameter table omits `sc` | Includes all eight parameters, including rule-specific `sc` | `sc` is part of the existing BridgeTrack URL |
| Random value described as making the request unique | Describes `Math.random() * 10000000000000` as a cache buster | It does not guarantee a unique business/conversion identifier |
| “Tries ten times” wording | Immediate evaluation plus up to ten scheduled retries, up to eleven evaluations | Matches the actual checker and retry counter |
| `appId` appears in URL but its readiness status is unclear | Explicitly outside the six-field `allReady` check; empty value remains possible | Preserves the existing implementation rather than changing it |
| DOM-loaded and Window Loaded could appear equivalent | Identifies the original and migrated events separately | These are different browser events |
| App Start example could become a universal template | Explains that outcomes/prequalification construct requests directly without its checker | Retry logic belongs to the specific requirement |
| Shared condition wording could imply every rule has identical conditions | Separates interface conditions from code checks; documents Approval's `_dl.site_events` check | The seven mapped outcome/prequalification rules have empty outer conditions in the local source |
| Outcome table omits prequalification detail | Adds all three supplied prequalification identifiers/docid pairs, confirmed in local source | Preserves the event-specific configuration |
| Generic new-vendor method implies every tag needs native script creation | Requires the vendor's method; includes approved extension, Custom Code, Direct Call and readiness only when appropriate | BridgeTrack is one vendor example |
| A Network request could imply conversion attribution | Describes the browser request check and separate media/account attribution check | Browser-side execution and downstream attribution are different checks |

### Duplicate content removed and useful explanations added

- Combined repeated outcome identifier tables into one seven-row reference.
- Kept one detailed native insertion explanation instead of repeating it in every rule.
- Linked save/build instructions to Part E rather than repeating the complete testing checklist in Parts A and B.
- Kept the generic opening brief; the detailed future-vendor process appears once in Part 3.
- Added the explicit field/source table, initial-check versus retry explanation, `appId` behaviour, query-key versus campaign-value distinction and Funding Start separation.
- Removed the fixed-page-count footer, excessive callout boxes, POC naming in the visible campaign screenshot and the suggestion that only a single built rule can run.

## B. Technical verification

Status meanings:

- **Verified from supplied documents:** the detail is established by the selected documents.
- **Corrected after comparison:** the final text reconciles a mismatch or omission; local source is identified where used.
- **Requires confirmation against the actual Adobe Tags implementation:** current live configuration or intended business behaviour was not established by this task.

| Item | Verification status | Source/decision | Current live configuration |
|---|---|---|---|
| App Start event and order | Verified from supplied documents | Core Window Loaded, order 50; corroborated in local `uat-named-bridgetrack-rules.json` | Not checked live |
| App Start path and query conditions | Corrected after comparison | Core Path regex enabled; actual expression shown. Core Query String `app` regex `^(UNSOL)$` | Not checked live |
| App Start hostname condition | Requires confirmation against the actual Adobe Tags implementation | Existing hostname Custom Code is retained; no new host list or revised regex invented | Approved current host set requires confirmation |
| Campaign lookup and comparison | Corrected after comparison | `URL_cmp` reads `cmp` with `caseInsensitive: false`; Starts With `afa` is a separate Value Comparison. Comparison case-insensitive setting is absent in local source | Not checked live |
| Direct Call identifiers | Corrected/expanded after comparison | All seven table entries match local rule event settings; order 50 | Not checked live |
| BridgeTrack docid mappings | Corrected/expanded after comparison | All seven values match the decoded local actions; App Start `NGA_AppPage`; Funding `dd_fundstart` | Not checked live |
| Vendor endpoint | Verified from supplied documents | `https://citi.bridgetrack.com/track/citicards/s/` in original/migrated source | Not checked live |
| All vendor parameters | Corrected after comparison | `pid`, `docid`, `app`, `appId`, `type`, `r`, `ProspectID`, `sc`; exact `ProspectID` case preserved | Not checked live |
| pid and random expression | Verified/corrected after comparison | Preserve the URL's `+prodId+prodType` sequence and value types; retain random expression without a uniqueness guarantee | No code modification |
| NGA data-layer mappings | Corrected after comparison | Original Ensighten App Start source reads `_dl.pid` and `_dl.prospect_id`; Launch retains them | Not checked live |
| App Start/global sources | Verified from supplied documents | `window.sc`, `window.appId`, `window.businessTypCd`, `window.prodType`, `window.appType`; local `_dl` guard inside checker | Not checked live |
| Funding sources and lookup | Corrected/expanded after comparison | Separate Window Loaded rule reads globals; `citidata_pageDef` reads `window.citiData.pageName` | Equivalent future `_dl` field unconfirmed |
| Data Element references | Verified/corrected after comparison | Exact source lookup names `URL_cmp` and `citidata_pageDef`; descriptive purpose labels are not claimed as new production names | Not checked live; default value needs confirmation below |
| Retry behaviour | Corrected after comparison | `checker()` immediate; `retries < 10`, increment then `setTimeout(checker, 1000)`; maximum ten scheduled retries | Code reviewed; no runtime retry test performed here |
| appId readiness | Corrected after comparison | Used in URL but absent from six-field `allReady`; final guide preserves the behaviour | No business requirement changed |
| Native script insertion | Verified from supplied documents | Five original native lines provided as text and figure; append head/documentElement; no executed Ensighten helper required | No runtime script test performed here |
| NGA event flow | Verified from supplied documents | `na_launch_page_view` / `na_launch_interaction` → state check → matching business Direct Call → BridgeTrack action | Route coverage requires confirmation below |
| Rule-level versus internal checks | Corrected after comparison | Seven outcome/prequal rules have empty conditions arrays in local capture; Approval has `_dl.site_events` checks | Not checked live |
| New-vendor guidance | Corrected after comparison | Vendor-dependent event, conditions, values and action; no universal BridgeTrack parameters, retry or script method | Process guidance; no new vendor implementation claimed |

### Confirmed event mappings

| Direct Call identifier | docid | Local Launch rule ID |
|---|---|---|
| `NGA_application_approved` | `NGA_Approved` | `RL20fc6917305a4acf8255e35550b14b04` |
| `NGA_application_declined` | `NGA_Declined` | `RL52996caa15ef4044880488be94e3a633` |
| `NGA_application_pended` | `NGA_Pending` | `RL662573ad29834e1a848104d7ebcbc803` |
| `NGA_application_registration` | `NGA_Registered` | `RL809c8e341f3d4d49a5195b6d7d0ff871` |
| `NGA_prequal_submit` | `NGA_INPQ_SUBMIT` | `RL03a922d050934e50aba6678a26350c33` |
| `NGA_prequal_approved` | `NGA_INPQ_APPROVE` | `RL099ae5e3234940809ab53d8b458af331` |
| `NGA_prequal_declined` | `NGA_INPQ_DECLINE` | `RLceb47866cef24755a2c2823358a287f5` |

### Local implementation sources

Under `evidence/2026-10-06_bridgetrack_migration/phase-a/`:

- `uat-named-bridgetrack-rules.json`: event descriptors, orders, conditions and action references.
- `uat-related-data-elements.json`: exact lookup settings and Funding fallback.
- `source/decoded/*.js`: decoded App Start, seven outcome/prequalification actions, Funding Start and NGA Rule.
- `source/ensighten-extracts/d98c43563834cb1cc13694c0bbe3c887_DD393.js`: original App Start DOM-loaded binding, `_dl` fields, readiness, retry and vendor URL.
- `source/ensighten-insertScript-excerpt.js`: original helper's deferred insertion before the first head child.
- `source/uat-launch.min.js`: retained UAT build supporting the extracted rules.

| Key local source | SHA-256 |
|---|---|
| `uat-named-bridgetrack-rules.json` | `2e40b7eda165ba03bedc872fa463b767bc1dca0ab314fb8d0da95018cbfd8d1c` |
| `uat-related-data-elements.json` | `62c4144e83f2cea5fdeb61fe626e8940a55f5a7a42b020179e4a184c3e826d56` |
| `source/uat-launch.min.js` | `119697282bb4d3c2010c443c5c668e491690454f34d71826ee3f4e6b8f93b5d3` |
| Original Ensighten App Start extract | `464e5f889d3ca74e5d8eb966893f30a1dbf6de4d350f3115e7df9161453d3c4b` |

## C. Items requiring team confirmation

1. **Current approved App Start host set.** The local condition contains `/^(uat.\.online\.citi\.com|uat..\.online\.citi\.com|online\.citi\.com)$/`. The dots after `uat` are wildcards in this existing expression. The documents do not establish the intended complete host set. The playbook directs the developer to retain the existing approved condition; no regex correction or expanded host list was made.
2. **Campaign default value.** Local `URL_cmp.defaultValue` is a string containing two double-quote characters (`""`), not an empty string. Confirm whether that fallback is intended in the current lookup. The guide does not instruct a silent change, or imply that default value validates `afa`.
3. **NGA route coverage and event timing.** The local NGA rule's outer path condition matches the base application path, while its action checks declined, pended and pend-resolution subpaths. Confirm the intended outer condition and the path when application Direct Calls are sent. The guide explains the event flow without claiming every branch was exercised. The pend-resolution dispatch shown in the figure is commented out and is not added as an active mapping.
4. **Future Funding `_dl` mapping.** The available source establishes `window.citiData.pageName` but does not establish its equivalent `_dl` field. Confirm field name, business value, type and timing before a future standardization change. The existing lookup is documented unchanged.

These are confirmation points for maintaining the document and implementation. They are not changes to deployed business logic.

## D. Final document changes

- New generic title, audience/purpose page and three-part structure; BridgeTrack clearly identified as Vendor 1.
- Manager's step-by-step presentation retained with Parts A–E, blue tables, short explanations and actual screenshots.
- Team's technical details retained with the documented corrections listed in Section A.
- Added selectable native script insertion and named-event examples, seven event/docid mappings, source table, `sc` and Funding Start details.
- Preserved A4 page geometry and source Arial typography/palette; clear navy headings and neutral table rows; monospaced code.
- Removed recurring header/footer and fixed page-count text. No company logo added.
- Kept screenshot media unchanged. Campaign screenshot uses the tightly cropped configuration from the team's revised document to hide unrelated POC naming.
- Owner/contact values remain clear placeholders. No invented people, approved hosts or future vendor settings.

### Screenshot inventory

| Figure | Content | Treatment |
|---|---|---|
| 1 | App Start Window Loaded card | Retained; caption identifies event only. Order is confirmed separately in text/source |
| 2 | Core Custom Code action card | Retained |
| 3 | App Start fields and allReady expression | Retained with original technical values |
| 4 | Native script insertion | Retained; five lines also provided as selectable text |
| 5 | Direct Call UI and Approval identifier | Retained |
| 6 | NGA business-event Direct Calls | Retained; commented source branch is not presented as an active event |
| 7 | cmp query lookup and case option | Tight source crop; POC name and unrelated surrounding UI removed |

All seven meaningful screenshots are included. No screenshot was replaced or fabricated.

### Final quality review

- Both selected input hashes match the baseline; neither input was overwritten.
- Final DOCX and matching PDF contain **14 pages**. Every final page was inspected individually after the final layout revision.
- Generic opening, three parts and Parts A–E are present. Numbered sections run sequentially from 1 to 24.
- All seven screenshots are included with matching captions. Original media bytes remain unchanged; figure 7 uses a visible crop only.
- All seven Direct Call/docid pairs and all eight vendor parameters were checked in the Word content.
- Native script insertion remains selectable text, with readable monospaced formatting.
- No footer or fixed page count remains. No POC or unnecessary technical architecture wording appears in the reader-facing text.
- Visual comparison with the manager’s document confirms the source-derived typography, navy/blue palette, step-by-step presentation and screenshot components. Reflow reflects the requested synthesis and footer removal.
- The source A4 section geometry and unaffected package components were preserved. No controls, bookmarks or body fields were lost.
- Tables use repeating headers and nonsplitting rows. The glossary, event mapping and documentation template remain together; the testing checklist continues with its header repeated.
- No clipped text, overlapping elements, stranded headings or blank trailing pages were found.
- No deployed implementation or business logic was modified; no live verification is claimed.
