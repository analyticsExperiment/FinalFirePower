# Citi Analytics and Third Party Tagging Current State Findings

**As observed 25 September and refreshed 29 September 2026.** Scope is public, unauthenticated Citi pages, delivered production JavaScript and browser requests. No Adobe or Ensighten administration access, customer login, application submission, payment or transfer was used. “Observed code” means a public library contains the implementation; it does not prove the rule fired. Full row-level inventory and source pointers are in `Citi_Tagging_Current_State_Inventory.xlsx`, [Citi_Ensighten_Tag_Management_Deep_Dive.md](Citi_Ensighten_Tag_Management_Deep_Dive.md) and `evidence/`.

**Correction to the 25 September version:** That report's Ensighten coverage was incomplete. The expanded public module sample establishes three Microsoft UET tag IDs in delivered banking and mortgage code, 25 explicit Floodlight activity bindings, and additional Meta, X, Rakuten, Kenshoo/Skai, Tapper and Google Ads implementations. The new findings are code-level unless a request is called out below.

## Strongest findings

1. **Observed network:** The homepage and several public product pages load both `nexus.ensighten.com/citi/na_prod/Bootstrap.js` and a production Adobe Data Collection library. The Launch build identifies property `AEM-CBOL-Web`, production environment, and build date 22 September 2026. Its deployed package contains **seven rules, 199 data elements, and two extensions**: Adobe Core and Adobe Experience Platform Web SDK. Extension package versions and unpublished property content are not visible in the delivered file.
2. **Observed code:** The Launch `Window Loaded` rule installs `window._trackAnalyticsLaunch(dataObj)`. It assigns the object to `window._dl`, sets `plat=browser`, reads a `cls_e` cookie, parses transfer-related values from `event`, then routes `action_type` values containing `view` to `_satellite.track("na_launch_page_view")` and values containing `event` to `_satellite.track("na_launch_interaction")`. It first obtains an ECID through Alloy if one is not already available. A mortgage-specific `replayStoredAnalytics()` consumes `window.stored_analytics` once per page lifetime. The legacy Ensighten module also contains a separate replay of `stored_analytics` into `_trackAnalytics`; whether the two paths duplicate beacons was not tested.
3. **Observed code:** The page-view and interaction direct-call rules require `sessionStorage.adobeLaunch=enabled` and allow a missing or value `1` Performance Analytics cookie. They use Web SDK variable actions and `sendEvent`: `web.webpagedetails.pageViews` for views and `web.webinteraction.linkClicks` for interactions. The interaction rule sets Analytics `linkType=o` and a link name from the `page_interaction` data element.
4. **Observed code:** The `Events logic` data element contains **257 `site_events` entries but 256 distinct names** and appends **11 numeric source fields** as `eventNNN=value`. `offer_clicked` is declared twice, as `event121` then `event88`; JavaScript object-key behavior makes `event88` the effective lookup. The code deduplicates the resulting event list. `Product flatDl Logic` builds an Analytics product string from product, banner, offer and POS arrays; its product branch adds `event133=quantity` and `event138=price` when supplied. The page-view and interaction rules assign both formatted events and products into `data.__adobe.analytics`.
5. **Observed network:** A public personal-loan page view sent a POST to `https://metrics1.citi.com/ee/ind1/v1/interact` with `web.webpagedetails.pageViews`, `pageName=us|web|public|marketing|Citi Personal Loan|pdp`, `events=event8`, and a product string. A separate Edge request carried `decisioning.propositionFetch`. Only non-personal fields were retained.
6. **Observed code:** Ensighten uses a bootstrap, a page-specific `serverComponent.php` manifest with ClientID `1129`, and condition-selected code modules. Ten distinct modules in the expanded five-page sample expose 141 `Bootstrapper.bind*` calls, including 40 data definitions. These are bindings, not 141 marketing tags. The shared module contains legacy AppMeasurement and Adobe Target, an `_trackAnalytics` helper, and named event routing; page-specific modules contain UET, Floodlight, Meta, X and other vendor code. Module delivery alone is insufficient to claim a marketing conversion fired.

## Microsoft Advertising

**Observed delivered code, correcting the earlier report:** The banking Ensighten module initializes UET tag IDs `5695784` and `331000549` through `//bat.bing.com/bat.js`. The second binding depends on a shared banking event rule. The mortgage module initializes UET ID `16005485` in six bindings tied to Dragonfly application, registration, VA-loan and HELOC events; some send `ec` and `ea` from literals or `_dl` fields. Several rules recreate `window.uetq` and `new UET`, so ordering and duplicate `pageLoad` outcomes remain unverified. These are **three public tag IDs**, not a proven account count. An untouched five-page browser run captured no `bat.bing.com` request and no `window.UET` instance, so the observed state does not establish a fired UET event. Full rule/deployment IDs are in the [Ensighten deep dive](Citi_Ensighten_Tag_Management_Deep_Dive.md).

The delivered Citi Launch build does not contain a UET extension. [Microsoft's UET documentation](https://learn.microsoft.com/en-us/advertising/guides/universal-event-tracking?view=bingads-13) describes the mechanism; the public code and capture do not establish Citi account ownership, consent policy, or conversion value accuracy.

## Floodlight

**Observed delivered code:** Shared Ensighten rule `4146255/639140` configures five base IDs: `DC-6260004`, `DC-6269322`, `DC-6256710`, `DC-6415812`, `DC-6268858`. The expanded sample exposes **25 explicit activity bindings**: 19 mortgage, three card catalog, one banking, and two shared. Many are named-event conversions and were not exercised. The [deep dive](Citi_Ensighten_Tag_Management_Deep_Dive.md) lists all mortgage `send_to` strings; the workbook lists every activity binding.

**Observed network:** All five `gtag/js?id=DC-…` base scripts and one `ad.doubleclick.net/ccm/s/collect` request appeared on personal loans and mortgage in the fresh browser capture. The sanitized collect records do not resolve the activity. No mortgage application, card conversion, travel portal, or banking event was intentionally generated. Base library loads are not conversion proof.

The code includes leading whitespace in several `DC-` source literals and one `DC- 6256710` embedded-space literal. The card catalog module passes a literal `Manage.DD_citiData.citiData_dd_pageDef` string as one value and random transaction IDs in its three transaction-counted rules. The earlier shared examples, `citih0/citih00` and `cardslp/trave000`, remain code-only activity findings. [Google's Floodlight guide](https://support.google.com/campaignmanager/answer/7554821?hl=en) describes the expected `send_to` and conversion fields. Request-level values and counting behavior remain unknown in the sampled event states.

## Other observed vendor patterns

| Vendor | Current public evidence | Launch overlap |
|---|---|---|
| Zeta / RFIhub | Ensighten `_rfi` code, `c1.rfihub.net` script and RFIhub network on personal loans; `_o=17169175`, page-dependent `ca` values | None in deployed Launch rules |
| LiveRamp | Ensighten `tvpixel` loader and hashed-CCSID iframe; requests captured on personal loans and mortgage | None established |
| Zync / Rezync | Ensighten builds a Rezync sync URL; a Launch rule builds the same endpoint on the Best Buy card path. Ensighten `/sync` requests captured on personal loans and mortgage | **Code exists in both**; duplicate request not tested |
| Amazon Ads | Ensighten image snippet with public `pid` and `PageView`; request captured on personal loans and mortgage | None established |
| Qualtrics | Ensighten Site Intercept loader and feedback container; loader captured on personal loans and mortgage | None established |
| Glassbox detector | Ensighten inserts `cdn.gbqofs.com` script; request captured on home, personal loans and mortgage | None established; vendor attribution is inferred from the script host |
| Meta and X | Card module contains three Meta pixel IDs, `PageView`/`ViewContent` and one X config ID | None established; no matching requests in untouched card capture |
| Rakuten, Kenshoo/Skai and Tapper | Mortgage module contains event-bound affiliate, lead and monitor scripts; a Tapper init token was redacted from local evidence | None established; no corresponding mortgage event generated |
| Google Ads | Banking base `AW-11360697733` and mortgage `AW-830907969` conversion code | None established; conversion requests not captured |

Code paths for Zync, RFIhub and LiveRamp may read CUUID, prospect, CCSID or similar identifiers. This report records the **field names and transformations only**, not any visitor values. Consent permutations and destination payload reviews remain open.

## Existing migration pattern and maintainability

**Observed:** Launch has a shared `_dl` entry point and direct-call rules for Adobe Analytics. Zync also has a Launch page-level rule while Rezync code remains in Ensighten. **Unknown:** whether the Zync rule is a completed migration, a partial replacement, or a parallel implementation. No other vendor migration can be asserted from public code alone.

Maintenance is concentrated in large custom blocks: the Launch event map, product formatter, Analytics variable assignments, global queue/ECID timing, and vendor-specific Ensighten modules. Hardcoded Floodlight IDs and activity strings, page-name conditions, and multiple sources for identity values add review burden. These are current-state observations, not redesign proposals.

## Stakeholder clarification needed

- **Analytics and developers:** canonical `_trackAnalyticsLaunch` contract, `action_type` vocabulary, SPA route-change ownership, sample non-personal payloads, and the intended relationship between `event` and `site_events`.
- **Ensighten administrators:** rule/tag names for numeric IDs, complete exported conditions, consent policy, and UET/Floodlight rule coverage beyond the sampled public pages.
- **Advertising teams:** owner and business purpose of each `DC-` ID and Floodlight activity; owner/account mapping for the three public UET IDs; approved conversion value, currency and transaction ID semantics.
- **Adobe property owners:** unpublished Launch rules and versions, extension publisher/support metadata, datastream and report-suite ownership, and whether Zync is a completed migration.
- **Privacy team:** permitted identity fields and consent behavior for LiveRamp, RFIhub, Zync, Floodlight and Microsoft across states.

## Subjects for the next migration-design phase

Once those facts are supplied, assess per-vendor parity, event and parameter contracts, consent handling, duplicate-beacon tests, identity/data minimization, rule ownership, and extension support. No migration architecture is selected in this current-state report.

## Evidence files

- `evidence/notes/pages.md` — public page and safe network survey.
- `evidence/notes/vendors.md`, `floodlight.md`, `microsoft.md` — vendor-level evidence and limits.
- `evidence/notes/public_launch_metadata.json` — machine-readable extraction of the public deployed Launch build.
- `evidence/notes/ensighten_bindings_2026-09-29.csv` and `.json` — all 141 binding metadata rows from ten public modules.
- `.artifact-runtime/public_ensighten_runtime_2026-09-29.json` — sanitized five-page browser request and rule-run capture.
- `evidence/raw/` — public script and manifest snapshots for source traceability.
