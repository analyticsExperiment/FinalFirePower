#!/usr/bin/env python3
"""Export all accessible Adobe Tags properties using the existing local .env.

Run: python3 launch-api/list_launch_properties.py
Requires reactor_client.py beside this file; no pip packages are needed.
Only GET requests are made to Reactor (OAuth may POST to Adobe IMS for a token).
"""

import argparse
import csv
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import urllib.error

from reactor_client import Reactor, load_env


BASE = Path(__file__).resolve().parent
UNAVAILABLE = "Not available"
FIELDS = [
    "company_name", "company_id", "property_name", "property_id", "platform",
    "enabled", "development", "domains", "created_at_utc", "created_by",
    "created_by_email", "last_modified_at_utc", "last_modified_by",
    "last_modified_by_email",
]


def property_row(company, prop):
    """Use property metadata directly; do not infer missing user identities."""
    attrs = prop["attributes"]
    return {
        "company_name": company.get("attributes", {}).get("name", ""),
        "company_id": company["id"],
        "property_name": attrs.get("name", ""),
        "property_id": prop["id"],
        "platform": attrs.get("platform", ""),
        "enabled": attrs.get("enabled", ""),
        "development": attrs.get("development", ""),
        "domains": "; ".join(attrs.get("domains") or []),
        "created_at_utc": attrs.get("created_at") or UNAVAILABLE,
        "created_by": attrs.get("created_by_display_name") or UNAVAILABLE,
        "created_by_email": attrs.get("created_by_email") or UNAVAILABLE,
        "last_modified_at_utc": attrs.get("updated_at") or UNAVAILABLE,
        "last_modified_by": attrs.get("updated_by_display_name") or UNAVAILABLE,
        "last_modified_by_email": attrs.get("updated_by_email") or UNAVAILABLE,
    }


def collect_properties(client):
    companies = client.all("/companies")
    rows, properties = [], []
    for company in companies:
        # Reactor.all follows pagination, including organizations with >100 properties.
        items = client.all(f"/companies/{company['id']}/properties")
        rows.extend(property_row(company, prop) for prop in items)
        properties.extend(items)
    rows.sort(key=lambda row: (row["company_name"].casefold(),
                               row["property_name"].casefold(), row["property_id"]))
    return companies, properties, rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=BASE / "property_inventory",
                        help="Folder for the CSV and JSON exports")
    parser.add_argument("--print", dest="print_rows", action="store_true",
                        help="Also print the property list as CSV in the terminal")
    args = parser.parse_args()

    config = load_env()
    missing = [key for key in ("ADOBE_CLIENT_ID", "ADOBE_ORG_ID") if not config.get(key)]
    if missing:
        raise RuntimeError("Missing required .env fields: " + ", ".join(missing))
    started = datetime.now(timezone.utc)
    companies, properties, rows = collect_properties(Reactor())
    captured = datetime.now(timezone.utc)

    out = args.output_dir.expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    stamp = captured.strftime("%Y%m%dT%H%M%S_%fZ")
    csv_path = out / f"launch_properties_{stamp}.csv"
    json_path = out / f"launch_properties_{stamp}.json"
    # UTF-8 BOM helps Excel display property and user names correctly.
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    with json_path.open("w", encoding="utf-8") as handle:
        json.dump({
            "collection_started_at_utc": started.isoformat(),
            "captured_at_utc": captured.isoformat(),
            "scope": "All current properties visible to the configured API credential",
            "property_count": len(rows),
            "companies": companies,
            "rows": rows,
            "properties": properties,
        }, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    if args.print_rows:
        writer = csv.DictWriter(sys.stdout, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    # Keep status on stderr so --print can also be redirected as valid CSV.
    print(f"Found {len(rows)} properties across {len(companies)} accessible companies.",
          file=sys.stderr)
    print(f"CSV:  {csv_path}\nJSON: {json_path}", file=sys.stderr)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, ValueError, urllib.error.URLError) as error:
        # Redact credentials if Adobe includes them in an error response.
        message = str(error)
        try:
            config = load_env()
            for key in ("ADOBE_CLIENT_ID", "ADOBE_CLIENT_SECRET", "ADOBE_ACCESS_TOKEN"):
                if config.get(key):
                    message = message.replace(config[key], "[REDACTED]")
        except OSError:
            pass
        print(f"Error: {message}", file=sys.stderr)
        sys.exit(1)
