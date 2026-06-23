import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { parseCsv } from "../src/create-business-inventory-workbook.js";
import {
  AEP_AJO_CSV_FILES,
  AEP_DESTINATION_CATALOG_COLUMNS,
  AEP_DESTINATION_DATAFLOWS_COLUMNS,
  AEP_DESTINATIONS_LIST_COLUMNS,
  AEP_SOURCE_CATALOG_COLUMNS,
  AEP_SOURCE_DATAFLOWS_COLUMNS,
  AEP_SOURCES_LIST_COLUMNS,
  AJO_JOURNEY_DETAILS_COLUMNS,
  AJO_JOURNEY_NODES_COLUMNS,
  AJO_JOURNEYS_LIST_COLUMNS,
  buildAepDestinationCatalogRows,
  buildAepDestinationDataflowRows,
  buildAepDestinationsListRows,
  buildAepSourceCatalogRows,
  buildAepSourceDataflowRows,
  buildAepSourcesListRows,
  buildAjoJourneyDetailsRows,
  buildAjoJourneyNodeRows,
  buildAjoJourneysListRows,
  runAepAjoInventory
} from "../src/aep-ajo-inventory.js";

test("AJO journey inventory builds business-readable list, detail, and node rows", () => {
  const journeys = [
    {
      id: "journey-1",
      name: "Welcome Journey",
      status: "Deployed",
      type: "unitary",
      version: "3",
      description: "Triggered welcome journey",
      priority: 5,
      sandboxName: "prod",
      profileMergePolicyId: "merge-1",
      startNodeId: "node-start",
      metadata: {
        createdAt: "2026-01-01T00:00:00Z",
        createdBy: "owner@example.com",
        lastModifiedAt: "2026-01-03T00:00:00Z",
        lastModifiedBy: "editor@example.com",
        firstDeployedAt: "2026-01-02T00:00:00Z",
        lastDeployedAt: "2026-01-04T00:00:00Z"
      },
      schedule: {
        type: "daily",
        startDate: "2026-02-01T00:00:00Z",
        endDate: "2026-03-01T00:00:00Z",
        timezone: "UTC",
        recurring: true,
        useProfileTimezone: false
      },
      reentrance: { policy: "allow", durationInSecs: 86400 },
      timeouts: { actionExecution: 30, entityEnrichment: 10 },
      labels: ["Lifecycle", { labelName: "Welcome" }],
      metrics: ["entries", "exits"],
      ruleset: { id: "rule-1", name: "Eligibility", status: "enabled" },
      nodes: [
        {
          id: "node-start",
          type: "event",
          name: "Start",
          audiences: [{ id: "aud-1", name: "New Members" }],
          transitions: [{ targetNodeId: "node-email", name: "Continue", conditionType: "always" }]
        },
        {
          id: "node-email",
          type: "action",
          name: "Send Email",
          channel: { type: "email" },
          surface: { name: "Email Surface" },
          campaign: { campaignId: "camp-1", name: "Welcome Email" },
          sendTimeOptimization: { enabled: true }
        }
      ],
      rawFile: "raw/ajo/journeys/journey-1.json"
    }
  ];

  const listRows = buildAjoJourneysListRows(journeys);
  const detailRows = buildAjoJourneyDetailsRows(journeys);
  const nodeRows = buildAjoJourneyNodeRows(journeys);

  assert.deepEqual(Object.keys(listRows[0]), AJO_JOURNEYS_LIST_COLUMNS);
  assert.deepEqual(Object.keys(detailRows[0]), AJO_JOURNEY_DETAILS_COLUMNS);
  assert.deepEqual(Object.keys(nodeRows[0]), AJO_JOURNEY_NODES_COLUMNS);
  assert.equal(listRows[0].journey_active_state, "active");
  assert.equal(listRows[0].journey_node_count, 2);
  assert.equal(detailRows[0].journey_channels, "email");
  assert.equal(detailRows[0].journey_audience_ids, "aud-1");
  assert.equal(nodeRows.length, 2);
  assert.equal(nodeRows[1].node_campaign_name, "Welcome Email");
  assert.equal(nodeRows[1].uses_send_time_optimization, true);
});

test("AEP source and destination inventories summarize configured dataflows", () => {
  const connectionSpecs = [
    { id: "spec-source", name: "Amazon S3", providerId: "amazon", attributes: { category: "Cloud Storage" } },
    { id: "spec-dest", name: "Azure Blob Destination", providerId: "azure", attributes: { category: "Cloud Storage" } }
  ];
  const connections = [
    {
      id: "base-source",
      name: "S3 Account",
      state: "enabled",
      connectionSpec: { id: "spec-source" },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
      rawFile: "raw/aep/connections/base-source.json"
    },
    {
      id: "base-dest",
      name: "Azure Account",
      state: "enabled",
      connectionSpec: { id: "spec-dest" },
      createdAt: "2026-01-05T00:00:00Z",
      updatedAt: "2026-01-06T00:00:00Z",
      rawFile: "raw/aep/connections/base-dest.json"
    }
  ];
  const sourceConnections = [
    { id: "src-conn-1", name: "S3 Objects", baseConnectionId: "base-source", connectionSpec: { id: "spec-source" } }
  ];
  const targetConnections = [
    {
      id: "target-conn-1",
      name: "Azure Export",
      baseConnectionId: "base-dest",
      connectionSpec: { id: "spec-dest" },
      params: { datasetId: "dataset-export" }
    }
  ];
  const flows = [
    {
      id: "flow-source",
      name: "S3 Ingestion",
      state: "enabled",
      sourceConnectionIds: ["src-conn-1"],
      targetConnectionIds: ["dataset-target"],
      scheduleParams: { frequency: "hour", interval: 1 },
      lastRunDetails: { status: "Success", startedAtUTC: "2026-01-07T00:00:00Z" },
      createdAt: "2026-01-03T00:00:00Z",
      updatedAt: "2026-01-04T00:00:00Z",
      rawFile: "raw/aep/flows/flow-source.json"
    },
    {
      id: "flow-dest",
      name: "Azure Activation",
      state: "enabled",
      sourceConnectionIds: ["profile-store"],
      targetConnectionIds: ["target-conn-1"],
      inheritedAttributes: { properties: { isDestinationFlow: true } },
      transformations: [
        {
          params: {
            segmentSelectors: { selectors: [{ value: { id: "segment-1", name: "VIP Members" } }] },
            mappingId: "mapping-1"
          }
        }
      ],
      rawFile: "raw/aep/flows/flow-dest.json"
    }
  ];

  const sourceRows = buildAepSourcesListRows({ connectionSpecs, connections, sourceConnections, flows });
  const sourceDataflows = buildAepSourceDataflowRows({ connectionSpecs, connections, sourceConnections, targetConnections, flows });
  const destinationRows = buildAepDestinationsListRows({ connectionSpecs, connections, targetConnections, flows });
  const destinationDataflows = buildAepDestinationDataflowRows({ connectionSpecs, connections, sourceConnections, targetConnections, flows });

  assert.deepEqual(Object.keys(sourceRows[0]), AEP_SOURCES_LIST_COLUMNS);
  assert.deepEqual(Object.keys(sourceDataflows[0]), AEP_SOURCE_DATAFLOWS_COLUMNS);
  assert.deepEqual(Object.keys(destinationRows[0]), AEP_DESTINATIONS_LIST_COLUMNS);
  assert.deepEqual(Object.keys(destinationDataflows[0]), AEP_DESTINATION_DATAFLOWS_COLUMNS);
  assert.equal(sourceRows.length, 1);
  assert.equal(sourceRows[0].source_name, "S3 Account");
  assert.equal(sourceRows[0].dataflow_count, 1);
  assert.equal(sourceDataflows[0].source_name, "S3 Account");
  assert.equal(sourceDataflows[0].last_run_status, "Success");
  assert.equal(destinationRows.length, 1);
  assert.equal(destinationRows[0].destination_name, "Azure Account");
  assert.equal(destinationDataflows[0].segment_ids, "segment-1");
  assert.equal(destinationDataflows[0].segment_names, "VIP Members");
});

test("AEP source and destination catalog inventories expose available connectors", () => {
  const connectionSpecs = [
    {
      id: "spec-source-s3",
      name: "Amazon S3",
      providerId: "amazon",
      version: "1.0",
      attributes: {
        category: "Cloud Storage",
        uiAttributes: {
          isSource: true,
          sourceType: "cloud_storage",
          documentationLink: "https://example.com/source"
        },
        authSpec: [{ name: "Access Key" }]
      }
    },
    {
      id: "spec-destination-google",
      name: "Google Ads",
      providerId: "google",
      version: "1.0",
      attributes: {
        category: "Advertising",
        uiAttributes: {
          isDestination: true,
          destinationType: "advertising",
          documentationLink: "https://example.com/destination"
        },
        authSpec: [{ name: "OAuth 2" }]
      }
    }
  ];
  const connections = [
    { id: "base-source", connectionSpec: { id: "spec-source-s3" } },
    { id: "base-destination", connectionSpec: { id: "spec-destination-google" } }
  ];
  const sourceConnections = [{ id: "source-conn", baseConnectionId: "base-source", connectionSpec: { id: "spec-source-s3" } }];
  const targetConnections = [{ id: "target-conn", baseConnectionId: "base-destination", connectionSpec: { id: "spec-destination-google" } }];
  const flows = [
    { id: "source-flow", sourceConnectionIds: ["source-conn"], state: "enabled" },
    { id: "destination-flow", targetConnectionIds: ["target-conn"], state: "enabled" }
  ];

  const sourceCatalogRows = buildAepSourceCatalogRows({ connectionSpecs, connections, sourceConnections, flows });
  const destinationCatalogRows = buildAepDestinationCatalogRows({ connectionSpecs, connections, targetConnections, flows });

  assert.deepEqual(Object.keys(sourceCatalogRows[0]), AEP_SOURCE_CATALOG_COLUMNS);
  assert.deepEqual(Object.keys(destinationCatalogRows[0]), AEP_DESTINATION_CATALOG_COLUMNS);
  assert.equal(sourceCatalogRows.length, 1);
  assert.equal(sourceCatalogRows[0].source_name, "Amazon S3");
  assert.equal(sourceCatalogRows[0].configured_base_connection_count, 1);
  assert.equal(sourceCatalogRows[0].configured_source_connection_count, 1);
  assert.equal(sourceCatalogRows[0].enabled_dataflow_count, 1);
  assert.equal(destinationCatalogRows.length, 1);
  assert.equal(destinationCatalogRows[0].destination_name, "Google Ads");
  assert.equal(destinationCatalogRows[0].configured_base_connection_count, 1);
  assert.equal(destinationCatalogRows[0].configured_target_connection_count, 1);
  assert.equal(destinationCatalogRows[0].enabled_dataflow_count, 1);
});

test("AEP configured source and destination lists include accounts even without dataflows", () => {
  const connectionSpecs = [
    { id: "spec-source", name: "Salesforce", attributes: { uiAttributes: { isSource: true }, category: "CRM" } },
    { id: "spec-destination", name: "Facebook Custom Audiences", attributes: { uiAttributes: { isDestination: true }, category: "Advertising" } }
  ];
  const connections = [
    { id: "base-source", name: "Salesforce Account", state: "enabled", connectionSpec: { id: "spec-source" } },
    { id: "base-destination", name: "Facebook Account", state: "enabled", connectionSpec: { id: "spec-destination" } }
  ];
  const sourceConnections = [{ id: "source-conn", baseConnectionId: "base-source", connectionSpec: { id: "spec-source" } }];
  const targetConnections = [{ id: "target-conn", baseConnectionId: "base-destination", connectionSpec: { id: "spec-destination" } }];

  const sourceRows = buildAepSourcesListRows({ connectionSpecs, connections, sourceConnections, flows: [] });
  const destinationRows = buildAepDestinationsListRows({ connectionSpecs, connections, targetConnections, flows: [] });

  assert.equal(sourceRows.length, 1);
  assert.equal(sourceRows[0].source_name, "Salesforce Account");
  assert.equal(sourceRows[0].dataflow_count, 0);
  assert.equal(destinationRows.length, 1);
  assert.equal(destinationRows[0].destination_name, "Facebook Account");
  assert.equal(destinationRows[0].dataflow_count, 0);
});

test("AEP destination dataflows are recognized through target connection specs when the flow flag is absent", () => {
  const connectionSpecs = [
    { id: "spec-destination", name: "Adobe Target", attributes: { uiAttributes: { isDestination: true }, category: "Personalization" } }
  ];
  const connections = [
    { id: "base-destination", name: "Target Destination", state: "enabled", connectionSpec: { id: "spec-destination" } }
  ];
  const targetConnections = [
    { id: "target-conn", name: "Target Activation", baseConnectionId: "base-destination", connectionSpec: { id: "spec-destination" } }
  ];
  const flows = [
    {
      id: "target-flow",
      name: "Target Activation Flow",
      state: "enabled",
      sourceConnectionIds: ["profile-store"],
      targetConnectionIds: ["target-conn"]
    }
  ];

  const destinationRows = buildAepDestinationsListRows({ connectionSpecs, connections, targetConnections, flows });
  const destinationDataflows = buildAepDestinationDataflowRows({ connectionSpecs, connections, targetConnections, flows });
  const sourceDataflows = buildAepSourceDataflowRows({ connectionSpecs, connections, targetConnections, flows });

  assert.equal(destinationRows[0].dataflow_count, 1);
  assert.equal(destinationDataflows.length, 1);
  assert.equal(destinationDataflows[0].destination_name, "Target Destination");
  assert.equal(sourceDataflows.length, 0);
});
test("AEP/AJO runner writes exactly the configured CSVs from mocked API responses", async () => {
  const outRoot = await mkdtemp(path.join(os.tmpdir(), "aep-ajo-inventory-"));
  const calls = [];
  const responses = new Map([
    [
      "/ajo/journey?page=0&pageSize=100",
      {
        results: [{ id: "journey-1", name: "Welcome Journey", status: "Deployed" }],
        page: 0,
        limit: 100,
        pages: 1
      }
    ],
    [
      "/ajo/journey/journey-1?include=campaigns%2Crulesets%2Csurfaces",
      {
        id: "journey-1",
        name: "Welcome Journey",
        status: "Deployed",
        nodes: [{ id: "node-1", type: "event", name: "Start" }]
      }
    ],
    ["/data/foundation/flowservice/connectionSpecs?limit=100", { items: [] }],
    ["/data/foundation/flowservice/connections?limit=100", { items: [] }],
    ["/data/foundation/flowservice/sourceConnections?limit=100", { items: [] }],
    ["/data/foundation/flowservice/targetConnections?limit=100", { items: [] }],
    ["/data/foundation/flowservice/flows?limit=100", { items: [] }]
  ]);

  const result = await runAepAjoInventory({
    clientId: "client-id",
    clientSecret: "client-secret",
    orgId: "org-id",
    scopes: "scope",
    sandboxName: "prod",
    platformBaseUrl: "https://platform.adobe.io",
    outDir: outRoot,
    pageSize: 100,
    concurrency: 2,
    scope: "all"
  }, {
    getAccessToken: async () => "token",
    fetchJson: async (url) => {
      const parsed = new URL(String(url));
      const key = `${parsed.pathname}${parsed.search}`;
      calls.push(key);
      const response = responses.get(key);
      if (!response) throw new Error(`Unexpected API call: ${key}`);
      return response;
    }
  });

  assert.ok(result.runDir.startsWith(outRoot));
  assert.deepEqual(result.csvFiles.sort(), AEP_AJO_CSV_FILES.map((item) => item.fileName).sort());
  assert.ok(!calls.some((call) => call.startsWith("/target/")), "AEP/AJO runner must not call Adobe Target endpoints");

  const journeysCsv = parseCsv(await readFile(path.join(result.csvDir, "ajo_journeys_list.csv"), "utf8"));
  const nodeCsv = parseCsv(await readFile(path.join(result.csvDir, "ajo_journey_nodes_inventory.csv"), "utf8"));
  assert.equal(journeysCsv[1][0], "journey-1");
  assert.equal(nodeCsv[1][3], "1");
});


test("AEP Flow Service pagination keeps relative next links under the flowservice path", async () => {
  const outRoot = await mkdtemp(path.join(os.tmpdir(), "aep-flow-pagination-"));
  const calls = [];

  const result = await runAepAjoInventory({
    clientId: "client-id",
    clientSecret: "client-secret",
    orgId: "org-id",
    scopes: "scope",
    sandboxName: "prod",
    platformBaseUrl: "https://platform.adobe.io",
    outDir: outRoot,
    pageSize: 100,
    concurrency: 2,
    scope: "aep"
  }, {
    getAccessToken: async () => "token",
    fetchJson: async (url) => {
      const parsed = new URL(String(url));
      const key = parsed.pathname + parsed.search;
      calls.push(key);

      if (key === "/data/foundation/flowservice/flows?limit=100") {
        return {
          items: [{ id: "flow-1", name: "First Flow" }],
          _links: { next: { href: "/flows?continuationToken=next-page" } }
        };
      }
      if (key === "/data/foundation/flowservice/flows?continuationToken=next-page") {
        return { items: [{ id: "flow-2", name: "Second Flow" }] };
      }
      if (key.startsWith("/data/foundation/flowservice/")) return { items: [] };
      throw new Error("Unexpected API call: " + key);
    }
  });

  assert.equal(result.errors, 0);
  assert.ok(calls.includes("/data/foundation/flowservice/flows?continuationToken=next-page"));
  assert.ok(!calls.some((call) => call.startsWith("/flows?")));
});
