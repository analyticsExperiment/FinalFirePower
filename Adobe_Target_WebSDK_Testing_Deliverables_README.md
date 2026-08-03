# Adobe Target Web SDK Testing Deliverables

Generated: 01 August 2026

This package contains an editable test strategy and an operational test checklist for validating Adobe Target continuity during an Adobe Experience Platform Web SDK migration. The deliverables are based on the latest available Target business inventory in this project and the accompanying migration analysis notes.

## Files

- `Adobe_Target_WebSDK_End_to_End_Test_Strategy.docx`: 21-page end-to-end strategy covering governance, execution, evidence, risks, entry and exit criteria, production monitoring, and appendices.
- `Adobe_Target_WebSDK_End_to_End_Test_Checklist.xlsx`: formula-driven execution workbook with 13 worksheets, dropdowns, filters, freeze panes, conditional formatting, traceability, defect/evidence logging, and sign-off controls.

## Generated baseline

- Inventory activities: 106
- Activity detail mappings: 431
- Approved activities selected for activity-specific execution: 43
- Generic migration test cases: 30
- Total planned test cases: 73
- Activity coverage rows: 431
- Parameter mapping and validation rows: 104
- Audience and profile validation rows: 113
- Rendering and SPA validation rows: 241
- Reporting and A4T validation rows: 106
- Production smoke rows: 43
- Offers: 117
- Audiences: 292
- Populated profile script inventory rows: 0

## How to use the Word strategy

1. Review the source baseline, assumptions, and open items.
2. Confirm owners, environments, release dates, business groups, browser versions, consent categories, route coverage, and production monitoring windows.
3. Approve the risk-based activity selection and required evidence standard.
4. Use the entry/exit criteria and sign-off model as the release governance baseline.

## How to use the Excel checklist

1. Start in `Instructions & Legend`, then review `Test Summary Dashboard`.
2. Replace `To Be Confirmed` only with approved project facts. Do not invent IDs or production values.
3. Review all inventory rows in `Activity Coverage Matrix`; the approved population also has activity-specific rows in `Test Case Master` and `Production Smoke & Monitoring`.
4. Complete test data in parameter, audience/profile, SPA/rendering, reporting/A4T, consent/identity, and browser/regression sheets.
5. Update execution statuses through the supplied dropdowns. Link every failure to evidence and a defect.
6. Complete production smoke checks and obtain recorded sign-off. The dashboard remains `Not Ready` until mandatory execution and defect conditions pass.

## Source evidence reviewed

- `target-inventory-output/2026-06-05T20-24-18/adobe-target-business-inventory.xlsx`
- Current-run CSV inventories for activities, activity details, offers, audiences, audience details, profile attributes, and profile scripts
- Current-run inventory reconciliation and error reports
- `Other Analysis/SPA Rendering.txt`
- `Other Analysis/Review Adobe QA.txt`
- `Other Analysis/Impacts on WebSDK migration.txt`
- `Other Analysis/A4T Analysis.txt`
- Existing schema and inventory documentation in the repository

## Known information gaps

The current evidence does not safely establish CT/OAO/D1 mappings, SPA route ownership, Data Collection property/library details, datastream and environment values, OneTrust category IDs, browser versions, production URLs/test accounts, or populated profile-script rows. These are deliberately shown as `To Be Confirmed`.

The current inventory reports all activities as Target-reporting activities. Analytics/A4T controls remain in the strategy and checklist for project confirmation without inventing Analytics values.

## Handling guidance

Keep customer identifiers, tokens, cookies, emails, and profile values out of the workbook. Store evidence in an approved controlled location and link to it from the checklist. Preserve inventory IDs as text.
