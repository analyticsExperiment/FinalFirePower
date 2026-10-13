# Adobe Tags property inventory

## Configure credentials locally

Keep your existing `.env` beside the scripts in `launch-api/`. For a fresh
checkout, copy the blank template and fill it locally:

```bash
cp launch-api/.env.example launch-api/.env
```

For OAuth Server-to-Server, fill `ADOBE_CLIENT_ID`, `ADOBE_CLIENT_SECRET`,
`ADOBE_SCOPES`, and `ADOBE_ORG_ID` using the same Adobe Developer Console
credential. Use the exact comma-separated scopes from that credential.
Alternatively, set `ADOBE_AUTH_MODE=access_token` and fill
`ADOBE_ACCESS_TOKEN`, `ADOBE_CLIENT_ID`, and `ADOBE_ORG_ID`.
The token value should have no `Bearer ` prefix.

The `.env` and generated inventories are ignored by Git. This package contains
no credentials or exported property records.

## Run

Run from the repository root:

```bash
python3 launch-api/list_launch_properties.py
```

The script reuses `launch-api/.env` and the existing `reactor_client.py`.
It needs only Python's standard library, with no package installation.

It lists all companies and all current properties accessible to the configured
API credential, following every page. It does not restrict the inventory to
`ADOBE_PROPERTY_ID`, `ADOBE_COMPANY_ID`, or a property name in `.env`.
Tags access is scoped by the configured Adobe organization and credential
permissions; an Experience Platform sandbox name is not a Tags inventory filter.

Each run creates timestamped CSV and JSON files in
`launch-api/property_inventory/`. The CSV contains company and property names
and IDs, platform, domains, enabled/development flags, creation time and creator
name/email, and last modification time and modifier name/email. The JSON also
retains all returned property metadata, company records, and collection times.
Credentials are never included in the exports.

Creator and modifier details use `created_by_display_name`, `created_by_email`,
`updated_by_display_name`, and `updated_by_email` directly from the property
response. These fields were observed in the live response on 13 October 2026.
Missing identity or timestamp fields are shown as `Not available`.
Adobe timestamps are preserved in UTC. This is current property metadata;
it does not list every historical change or deleted properties. Changes to rules,
libraries, or other resources have their own metadata and audit events.
The organization may contain additional properties hidden from this credential.

Optional commands:

```bash
# Also display the list in the terminal.
python3 launch-api/list_launch_properties.py --print

# Save the exports to another folder.
python3 launch-api/list_launch_properties.py --output-dir /path/to/output
```

The script only reads Reactor resources. OAuth authentication may request a new
token from Adobe IMS. No Tags properties, rules, libraries, environments, or
existing configuration files are changed. Authentication or API errors stop
the run before exports are written.

Official API references:

- [List accessible companies](https://experienceleague.adobe.com/en/docs/experience-platform/tags/api/endpoints/companies)
- [List properties and property metadata](https://experienceleague.adobe.com/en/docs/experience-platform/tags/api/endpoints/properties)
- [Response pagination](https://experienceleague.adobe.com/en/docs/experience-platform/tags/api/guides/pagination)
- [Reactor authentication](https://experienceleague.adobe.com/en/docs/experience-platform/tags/api/getting-started)
