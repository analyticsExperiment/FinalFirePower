# Segment Cleanup application packages — 25 October 2026

Two separate source packages are included:

- `CJA_AA_Segment_Cleanup_V3_2026-10-25.zip`: unified CJA + Adobe Analytics application; default local address http://127.0.0.1:5003.
- `Adobe_Analytics_Segment_Cleanup_Standalone_2026-10-25.zip`: standalone Adobe Analytics application; default local address http://127.0.0.1:5001.

Download the required ZIP, extract the entire folder and open `START_HERE.md`. Each contains all required local Python modules, offline tests, requirements, setup instructions and a blank `.env.example`. Configure your authorised credentials locally. Python 3.10 or later is recommended.

The update includes approval status/counts, group-member Workspace usage, owner metadata fallbacks and guarded single/bulk deletion with read-only preview, explicit confirmation, fresh checks, audit and report refresh. The existing validated matching engine and desktop flow are retained.

**Live deletion is disabled by default.** No real Adobe segments were deleted in release testing. Unknown approval/publication/usage metadata blocks execution. Owner approval and outside-dependency review remain required. See each package's `FEATURE_PARITY.md` for details and limits.

The ZIPs exclude real environment files, credentials, token caches, generated inventories/reports, audit logs, screenshots and virtual environments. Only synthetic sample data in tests is included. Fresh-extraction offline testing passed: V3 120/120; standalone 101 passed and one CJA-only case skipped. Desktop simulated browser flows and actual export readback passed previously in the release check.

`SHA256SUMS.txt` provides archive hashes. Each ZIP also has a `PACKAGE_MANIFEST.json` with individual file hashes. Windows, native Excel, production hosting and mobile view were not certified.
