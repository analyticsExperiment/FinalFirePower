# Segment Cleanup V4 and V5 packages

Release 26 October 2026.

- `CJA_AA_Segment_Cleanup_V4_2026-10-26.zip` keeps the product dropdown approach. Choose CJA or Adobe Analytics, then select the scope and threshold. Default local port 5004.
- `CJA_AA_Segment_Cleanup_V5_2026-10-26.zip` uses the requested two-tab approach, with CJA selected by default and separate scope and threshold values for each product. Default local port 5005.

Download the required ZIP and extract the complete folder. Open its README.md for setup. Each package has an `application` directory with exactly three Python source files: app.py, cja_segment_finder.py and aa_segment_finder.py. Tests, requirements, a blank environment example and setup notes are kept outside that directory. Neither ZIP needs V2, V3 or the other ZIP to run.

Each freshly extracted package passed all 154 offline tests. Application source files are unchanged from the second independent verification. Current CJA and Analytics comparison/grouping parity, desktop browser flows and export readback passed in that verification. The package-local cross-version parity test uses recorded source hashes instead of requiring a sibling application folder.

Live deletion is disabled by default. No Adobe segment was deleted during verification. Structural similarity is not audience equivalence, and zero accessible Workspace references are not proof of organisation-wide non-use. Approval, publication, owner consent and dependencies outside accessible projects still require review. Do not enable deletion just because a report suggests a match.

Real credentials, populated environment files, token caches, virtual environments, captured inventories, generated reports, audit logs, screenshots and private QA documents are excluded. Configure only the product needed by the client, using authorised credentials locally. Windows, native Excel, mobile and production hosting/load are not certified.

SHA256SUMS.txt records the ZIP hashes. Each ZIP includes PACKAGE_MANIFEST.json with the hashes of its distributed files.
