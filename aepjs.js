import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  extractArrayFromResponse,
  fetchJson as defaultFetchJson,
  safeFileName,
  writeCsv,
  writeJson
} from "./target-activities-inventory.js";
import { collectDetailItemsWithErrors } from "./business-inventory.js";

const DEFAULT_IMS_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const DEFAULT_PLATFORM_BASE_URL = "https://platform.adobe.io";
const DEFAULT_OUTPUT_DIR = "./aep-ajo-inventory-output";
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_CONCURRENCY = 3;
const MAX_PAGES = 10000;
const DASH = "-";
const RAW_JSON_PREVIEW_LIMIT = 5000;

export const AJO_JOURNEYS_LIST_COLUMNS = [
  "journey_id",
  "journey_name",
  "journey_status",
  "journey_active_state",
  "journey_type",
  "journey_version",
  "journey_description",
  "journey_priority",
  "journey_sandbox_name",
  "journey_created_at",
  "journey_created_by",
  "journey_last_modified_at",
  "journey_last_modified_by",
  "journey_first_deployed_at",
  "journey_last_deployed_at",
  "journey_start_date",
  "journey_end_date",
  "journey_timezone",
  "journey_recurring",
  "journey_reentrance_policy",
  "journey_label_names",
  "journey_node_count",
  "journey_metric_names",
  "profile_merge_policy_id"
];

export const AJO_JOURNEY_DETAILS_COLUMNS = [
  "journey_id",
  "journey_name",
  "journey_status",
  "journey_active_state",
  "journey_type",
  "journey_version",
  "journey_description",
  "profile_merge_policy_id",
  "start_node_id",
  "schedule_type",
  "schedule_start_date",
  "schedule_end_date",
  "schedule_timezone",
  "schedule_use_profile_timezone",
  "schedule_recurring",
  "reentrance_policy",
  "reentrance_duration_seconds",
  "timeout_action_execution_seconds",
  "timeout_entity_enrichment_seconds",
  "ruleset_id",
  "ruleset_name",
  "ruleset_status",
  "journey_label_names",
  "journey_metric_names",
  "journey_node_count",
  "journey_campaign_count",
  "journey_message_surface_names",
  "journey_channels",
  "journey_audience_ids",
  "journey_audience_names",
  "raw_journey_file"
];

export const AJO_JOURNEY_NODES_COLUMNS = [
  "journey_id",
  "journey_name",
  "journey_status",
  "node_sequence",
  "node_id",
  "node_type",
  "node_name",
  "node_channel",
  "node_surface_name",
  "node_campaign_id",
  "node_campaign_name",
  "node_action_type",
  "node_audience_ids",
  "node_identity_namespace",
  "node_throttling_rate",
  "node_delay",
  "node_expression",
  "transition_count",
  "transition_target_node_ids",
  "transition_names",
  "transition_condition_types",
  "uses_send_time_optimization",
  "raw_node_json",
  "raw_journey_file"
];

export const AEP_SOURCE_CATALOG_COLUMNS = [
  "connection_spec_id",
  "source_name",
  "source_description",
  "source_category",
  "source_type",
  "provider_id",
  "spec_version",
  "is_source",
  "authentication_types",
  "documentation_url",
  "icon_name",
  "is_beta",
  "is_deprecated",
  "configured_base_connection_count",
  "configured_source_connection_count",
  "configured_dataflow_count",
  "enabled_dataflow_count",
  "raw_connection_spec_file"
];

export const AEP_DESTINATION_CATALOG_COLUMNS = [
  "connection_spec_id",
  "destination_name",
  "destination_description",
  "destination_category",
  "destination_type",
  "provider_id",
  "spec_version",
  "is_destination",
  "authentication_types",
  "delivery_type",
  "supported_data_types",
  "supported_frequencies",
  "documentation_url",
  "icon_name",
  "is_beta",
  "is_deprecated",
  "configured_base_connection_count",
  "configured_target_connection_count",
  "configured_dataflow_count",
  "enabled_dataflow_count",
  "raw_connection_spec_file"
];
export const AEP_SOURCES_LIST_COLUMNS = [
  "source_id",
  "source_name",
  "source_type",
  "source_category",
  "source_state",
  "connection_spec_id",
  "connection_spec_name",
  "base_connection_id",
  "base_connection_name",
  "source_connection_ids",
  "source_connection_count",
  "dataflow_count",
  "enabled_dataflow_count",
  "created_at",
  "updated_at",
  "raw_source_file"
];

export const AEP_SOURCE_DATAFLOWS_COLUMNS = [
  "dataflow_id",
  "dataflow_name",
  "dataflow_state",
  "dataflow_description",
  "source_id",
  "source_name",
  "connection_spec_id",
  "connection_spec_name",
  "source_connection_ids",
  "target_connection_ids",
  "target_dataset_ids",
  "target_schema_ids",
  "schedule_frequency",
  "schedule_interval",
  "schedule_start_time",
  "transformation_count",
  "mapping_set_ids",
  "last_run_status",
  "last_run_started_at",
  "last_run_ended_at",
  "created_at",
  "updated_at",
  "raw_flow_file"
];

export const AEP_DESTINATIONS_LIST_COLUMNS = [
  "destination_id",
  "destination_name",
  "destination_type",
  "destination_category",
  "destination_state",
  "connection_spec_id",
  "connection_spec_name",
  "base_connection_id",
  "base_connection_name",
  "target_connection_ids",
  "target_connection_count",
  "dataflow_count",
  "enabled_dataflow_count",
  "activation_mode",
  "created_at",
  "updated_at",
  "raw_destination_file"
];

export const AEP_DESTINATION_DATAFLOWS_COLUMNS = [
  "dataflow_id",
  "dataflow_name",
  "dataflow_state",
  "dataflow_description",
  "destination_id",
  "destination_name",
  "connection_spec_id",
  "connection_spec_name",
  "source_connection_ids",
  "target_connection_ids",
  "target_connection_names",
  "segment_ids",
  "segment_names",
  "dataset_ids",
  "schedule_frequency",
  "schedule_interval",
  "activation_fields",
  "mapping_set_ids",
  "last_run_status",
  "last_run_started_at",
  "last_run_ended_at",
  "created_at",
  "updated_at",
  "raw_flow_file"
];

export const AEP_AJO_CSV_FILES = [
  { fileName: "ajo_journeys_list.csv", columns: AJO_JOURNEYS_LIST_COLUMNS },
  { fileName: "ajo_journey_details_inventory.csv", columns: AJO_JOURNEY_DETAILS_COLUMNS },
  { fileName: "ajo_journey_nodes_inventory.csv", columns: AJO_JOURNEY_NODES_COLUMNS },
  { fileName: "aep_source_catalog.csv", columns: AEP_SOURCE_CATALOG_COLUMNS },
  { fileName: "aep_sources_list.csv", columns: AEP_SOURCES_LIST_COLUMNS },
  { fileName: "aep_source_dataflows_inventory.csv", columns: AEP_SOURCE_DATAFLOWS_COLUMNS },
  { fileName: "aep_destination_catalog.csv", columns: AEP_DESTINATION_CATALOG_COLUMNS },
  { fileName: "aep_destinations_list.csv", columns: AEP_DESTINATIONS_LIST_COLUMNS },
  { fileName: "aep_destination_dataflows_inventory.csv", columns: AEP_DESTINATION_DATAFLOWS_COLUMNS }
];

export function parseAepAjoInventoryCliArgs(argv = process.argv.slice(2)) {
  const options = { scope: "all" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [key, inlineValue] = arg.includes("=") ? arg.split(/=(.*)/s, 2) : [arg, undefined];
    const nextValue = inlineValue ?? argv[index + 1];

    if (key === "--scope") {
      options.scope = nextValue;
      if (inlineValue === undefined) index += 1;
    } else if (key === "--out") {
      options.outDir = nextValue;
      if (inlineValue === undefined) index += 1;
    } else if (key === "--sandbox") {
      options.sandboxName = nextValue;
      if (inlineValue === undefined) index += 1;
    } else if (key === "--page-size" || key === "--limit") {
      options.pageSize = Number(nextValue);
      if (inlineValue === undefined) index += 1;
    } else if (key === "--concurrency") {
      options.concurrency = Number(nextValue);
      if (inlineValue === undefined) index += 1;
    } else if (key === "--help" || key === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

export function loadAepAjoInventoryConfig(cliOptions = parseAepAjoInventoryCliArgs(), env = process.env) {
  return {
    clientId: env.ADOBE_CLIENT_ID,
    clientSecret: env.ADOBE_CLIENT_SECRET,
    orgId: env.ADOBE_ORG_ID,
    scopes: env.ADOBE_SCOPES,
    imsTokenUrl: env.ADOBE_IMS_TOKEN_URL || DEFAULT_IMS_TOKEN_URL,
    platformBaseUrl: env.ADOBE_PLATFORM_BASE_URL || env.AEP_PLATFORM_BASE_URL || DEFAULT_PLATFORM_BASE_URL,
    sandboxName: cliOptions.sandboxName || env.AEP_SANDBOX_NAME || env.ADOBE_SANDBOX_NAME,
    outDir: cliOptions.outDir || env.AEP_AJO_INVENTORY_OUTPUT_DIR || DEFAULT_OUTPUT_DIR,
    pageSize: toPositiveInteger(cliOptions.pageSize, env.AEP_AJO_PAGE_SIZE, DEFAULT_PAGE_SIZE),
    concurrency: toPositiveInteger(cliOptions.concurrency, env.AEP_AJO_CONCURRENCY, DEFAULT_CONCURRENCY),
    scope: normalizeScope(cliOptions.scope),
    help: Boolean(cliOptions.help)
  };
}

export async function runAepAjoInventory(config = loadAepAjoInventoryConfig(), deps = {}) {
  validateAepAjoConfig(config);

  const startedAt = new Date();
  const runDir = path.resolve(config.outDir, formatRunTimestamp(startedAt));
  const dirs = createRunDirs(runDir);
  const errors = [];
  const state = createEmptyState();
  const accessToken = await (deps.getAccessToken ?? getAdobeAccessToken)(config, deps);

  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true })));

  if (shouldRunScope(config.scope, "ajo")) {
    Object.assign(state.ajo, await runAjoJourneysSection({ config, dirs, runDir, errors, accessToken, deps }));
  }

  if (shouldRunScope(config.scope, "aep")) {
    Object.assign(state.aep, await runAepFlowServiceSection({ config, dirs, errors, accessToken, deps }));
  }

  const includeAjo = shouldEmitScope(config.scope, "ajo");
  const includeAepSources = shouldEmitScope(config.scope, "aep-sources");
  const includeAepDestinations = shouldEmitScope(config.scope, "aep-destinations");
  const csvPayloads = {
    "ajo_journeys_list.csv": includeAjo ? buildAjoJourneysListRows(state.ajo.journeys) : [],
    "ajo_journey_details_inventory.csv": includeAjo ? buildAjoJourneyDetailsRows(state.ajo.journeys) : [],
    "ajo_journey_nodes_inventory.csv": includeAjo ? buildAjoJourneyNodeRows(state.ajo.journeys) : [],
    "aep_source_catalog.csv": includeAepSources ? buildAepSourceCatalogRows(state.aep) : [],
    "aep_sources_list.csv": includeAepSources ? buildAepSourcesListRows(state.aep) : [],
    "aep_source_dataflows_inventory.csv": includeAepSources ? buildAepSourceDataflowRows(state.aep) : [],
    "aep_destination_catalog.csv": includeAepDestinations ? buildAepDestinationCatalogRows(state.aep) : [],
    "aep_destinations_list.csv": includeAepDestinations ? buildAepDestinationsListRows(state.aep) : [],
    "aep_destination_dataflows_inventory.csv": includeAepDestinations ? buildAepDestinationDataflowRows(state.aep) : []
  };

  await Promise.all(
    AEP_AJO_CSV_FILES.map((file) => writeCsv(path.join(dirs.csv, file.fileName), csvPayloads[file.fileName], file.columns))
  );
  await writeJson(path.join(dirs.reports, "errors.json"), errors);
  await writeFile(
    path.join(dirs.reports, "aep-ajo-inventory-summary.md"),
    buildSummaryMarkdown({ runDir, startedAt, completedAt: new Date(), config, csvPayloads, errors }),
    "utf8"
  );

  return {
    runDir,
    csvDir: dirs.csv,
    csvFiles: AEP_AJO_CSV_FILES.map((file) => file.fileName),
    errors: errors.length
  };
}

export function buildAjoJourneysListRows(journeys = []) {
  return toArray(journeys).map((journey) =>
    orderRow(
      {
        journey_id: pickJourneyId(journey),
        journey_name: pickFirst(journey, ["name", "journeyName"]),
        journey_status: pickFirst(journey, ["status", "state"]),
        journey_active_state: classifyJourneyActiveState(pickFirst(journey, ["status", "state"])),
        journey_type: pickFirst(journey, ["type", "journeyType"]),
        journey_version: pickFirst(journey, ["version"]),
        journey_description: pickFirst(journey, ["description"]),
        journey_priority: pickFirst(journey, ["priority"]),
        journey_sandbox_name: pickFirst(journey, ["sandboxName"]),
        journey_created_at: pickNested(journey, [["createdAt"], ["metadata", "createdAt"], ["created"]]),
        journey_created_by: pickNested(journey, [["createdBy"], ["metadata", "createdBy"]]),
        journey_last_modified_at: pickNested(journey, [["updatedAt"], ["modifiedAt"], ["metadata", "lastModifiedAt"], ["metadata", "modifiedAt"]]),
        journey_last_modified_by: pickNested(journey, [["updatedBy"], ["modifiedBy"], ["metadata", "lastModifiedBy"], ["metadata", "modifiedBy"]]),
        journey_first_deployed_at: pickNested(journey, [["firstDeployedAt"], ["metadata", "firstDeployedAt"]]),
        journey_last_deployed_at: pickNested(journey, [["lastDeployedAt"], ["metadata", "lastDeployedAt"]]),
        journey_start_date: pickNested(journey, [["schedule", "startDate"], ["schedule", "startAt"], ["startDate"]]),
        journey_end_date: pickNested(journey, [["schedule", "endDate"], ["schedule", "endAt"], ["endDate"]]),
        journey_timezone: pickNested(journey, [["schedule", "timezone"], ["timezone"]]),
        journey_recurring: pickNested(journey, [["schedule", "recurring"], ["schedule", "isRecurring"]]),
        journey_reentrance_policy: pickNested(journey, [["reentrance", "policy"], ["reentrancePolicy"]]),
        journey_label_names: joinValuesOrDash(extractLabelNames(journey.labels)),
        journey_node_count: toArray(journey.nodes).length,
        journey_metric_names: joinValuesOrDash(extractMetricNames(journey.metrics)),
        profile_merge_policy_id: pickFirst(journey, ["profileMergePolicyId", "mergePolicyId"])
      },
      AJO_JOURNEYS_LIST_COLUMNS
    )
  );
}

export function buildAjoJourneyDetailsRows(journeys = []) {
  return toArray(journeys).map((journey) => {
    const ruleset = isObject(journey.ruleset) ? journey.ruleset : firstObject(journey.rulesets);
    const campaigns = collectJourneyCampaigns(journey);
    const surfaces = collectJourneySurfaces(journey);
    const audiences = collectJourneyAudiences(journey);
    return orderRow(
      {
        journey_id: pickJourneyId(journey),
        journey_name: pickFirst(journey, ["name", "journeyName"]),
        journey_status: pickFirst(journey, ["status", "state"]),
        journey_active_state: classifyJourneyActiveState(pickFirst(journey, ["status", "state"])),
        journey_type: pickFirst(journey, ["type", "journeyType"]),
        journey_version: pickFirst(journey, ["version"]),
        journey_description: pickFirst(journey, ["description"]),
        profile_merge_policy_id: pickFirst(journey, ["profileMergePolicyId", "mergePolicyId"]),
        start_node_id: pickFirst(journey, ["startNodeId"]),
        schedule_type: pickNested(journey, [["schedule", "type"], ["schedule", "frequency"]]),
        schedule_start_date: pickNested(journey, [["schedule", "startDate"], ["schedule", "startAt"], ["startDate"]]),
        schedule_end_date: pickNested(journey, [["schedule", "endDate"], ["schedule", "endAt"], ["endDate"]]),
        schedule_timezone: pickNested(journey, [["schedule", "timezone"], ["timezone"]]),
        schedule_use_profile_timezone: pickNested(journey, [["schedule", "useProfileTimezone"]]),
        schedule_recurring: pickNested(journey, [["schedule", "recurring"], ["schedule", "isRecurring"]]),
        reentrance_policy: pickNested(journey, [["reentrance", "policy"], ["reentrancePolicy"]]),
        reentrance_duration_seconds: pickNested(journey, [["reentrance", "durationInSecs"], ["reentrance", "duration"], ["reentranceDurationInSecs"]]),
        timeout_action_execution_seconds: pickNested(journey, [["timeouts", "actionExecution"], ["timeouts", "actionExecutionInSecs"]]),
        timeout_entity_enrichment_seconds: pickNested(journey, [["timeouts", "entityEnrichment"], ["timeouts", "entityEnrichmentInSecs"]]),
        ruleset_id: pickFirst(ruleset, ["id", "rulesetId"]),
        ruleset_name: pickFirst(ruleset, ["name", "label"]),
        ruleset_status: pickFirst(ruleset, ["status", "state"]),
        journey_label_names: joinValuesOrDash(extractLabelNames(journey.labels)),
        journey_metric_names: joinValuesOrDash(extractMetricNames(journey.metrics)),
        journey_node_count: toArray(journey.nodes).length,
        journey_campaign_count: campaigns.length,
        journey_message_surface_names: joinValuesOrDash(surfaces),
        journey_channels: joinValuesOrDash(collectJourneyChannels(journey)),
        journey_audience_ids: joinValuesOrDash(audiences.map((audience) => audience.id)),
        journey_audience_names: joinValuesOrDash(audiences.map((audience) => audience.name)),
        raw_journey_file: journey.rawFile
      },
      AJO_JOURNEY_DETAILS_COLUMNS
    );
  });
}

export function buildAjoJourneyNodeRows(journeys = []) {
  const rows = [];

  for (const journey of toArray(journeys)) {
    toArray(journey.nodes).forEach((node, index) => {
      const transitions = toArray(node.transitions ?? node.outgoingTransitions ?? node.next);
      const campaign = pickNodeCampaign(node);
      const audiences = collectNodeAudiences(node);
      rows.push(
        orderRow(
          {
            journey_id: pickJourneyId(journey),
            journey_name: pickFirst(journey, ["name", "journeyName"]),
            journey_status: pickFirst(journey, ["status", "state"]),
            node_sequence: index + 1,
            node_id: pickFirst(node, ["id", "nodeId"]),
            node_type: pickFirst(node, ["type", "nodeType", "kind"]),
            node_name: pickFirst(node, ["name", "label", "displayName"]),
            node_channel: pickNodeChannel(node),
            node_surface_name: pickNodeSurfaceName(node),
            node_campaign_id: pickFirst(campaign, ["id", "campaignId"]),
            node_campaign_name: pickFirst(campaign, ["name", "campaignName"]),
            node_action_type: pickNested(node, [["action", "type"], ["actionType"], ["type"]]),
            node_audience_ids: joinValuesOrDash(audiences.map((audience) => audience.id)),
            node_identity_namespace: pickNested(node, [["identity", "namespace"], ["identityNamespace"], ["namespace"]]),
            node_throttling_rate: pickNested(node, [["throttling", "rate"], ["throttle", "rate"]]),
            node_delay: pickNested(node, [["delay", "duration"], ["delay"], ["wait", "duration"]]),
            node_expression: pickNested(node, [["condition", "expression"], ["expression"], ["rule", "expression"]]),
            transition_count: transitions.length,
            transition_target_node_ids: joinValuesOrDash(transitions.map((transition) => pickFirst(transition, ["targetNodeId", "to", "nextNodeId", "nodeId"]))),
            transition_names: joinValuesOrDash(transitions.map((transition) => pickFirst(transition, ["name", "label"]))),
            transition_condition_types: joinValuesOrDash(transitions.map((transition) => pickFirst(transition, ["conditionType", "type"]))),
            uses_send_time_optimization: Boolean(pickNested(node, [["sendTimeOptimization", "enabled"], ["sto", "enabled"], ["isSendTimeOptimized"]])),
            raw_node_json: truncateJson(node),
            raw_journey_file: journey.rawFile
          },
          AJO_JOURNEY_NODES_COLUMNS
        )
      );
    });
  }

  return rows;
}

export function buildAepSourceCatalogRows({ connectionSpecs = [], connections = [], sourceConnections = [], flows = [] } = {}) {
  const context = buildAepContext({ connectionSpecs, connections, sourceConnections });
  return toArray(connectionSpecs)
    .filter(isSourceConnectionSpec)
    .map((spec) => {
      const specId = normalizeId(spec.id);
      const baseConnections = toArray(connections).filter((connection) => normalizeId(getConnectionSpecId(connection)) === specId);
      const baseConnectionIds = new Set(baseConnections.map((connection) => normalizeId(connection.id)).filter(Boolean));
      const configuredSourceConnections = toArray(sourceConnections).filter((connection) =>
        normalizeId(getConnectionSpecId(connection)) === specId || baseConnectionIds.has(normalizeId(connection.baseConnectionId))
      );
      const configuredSourceConnectionIds = configuredSourceConnections.map((connection) => connection.id);
      const relatedFlows = toArray(flows).filter((flow) =>
        hasAnyId(extractIds(flow.sourceConnectionIds ?? flow.sourceConnections), configuredSourceConnectionIds)
      );
      const uiAttributes = getSourceUiAttributes(spec);

      return orderRow(
        {
          connection_spec_id: specId,
          source_name: pickFirst(spec, ["name", "displayName", "title"]),
          source_description: pickFirst(spec, ["description"]),
          source_category: pickSpecCategory(spec),
          source_type: pickFirst(uiAttributes, ["sourceType", "type"]) ?? pickFirst(spec, ["providerId", "type"]),
          provider_id: pickFirst(spec, ["providerId"]),
          spec_version: pickFirst(spec, ["version", "specVersion"]),
          is_source: true,
          authentication_types: joinValuesOrDash(collectSpecAuthTypes(spec)),
          documentation_url: pickSpecDocumentationUrl(spec, uiAttributes),
          icon_name: pickSpecIconName(spec, uiAttributes),
          is_beta: pickFirst(uiAttributes, ["isBeta", "beta"]) ?? pickNested(spec, [["attributes", "isBeta"], ["attributes", "beta"]]),
          is_deprecated: pickFirst(uiAttributes, ["isDeprecated", "deprecated"]) ?? pickNested(spec, [["attributes", "isDeprecated"], ["attributes", "deprecated"]]),
          configured_base_connection_count: baseConnections.length,
          configured_source_connection_count: configuredSourceConnections.length,
          configured_dataflow_count: relatedFlows.length,
          enabled_dataflow_count: relatedFlows.filter(isEnabledState).length,
          raw_connection_spec_file: spec.rawFile
        },
        AEP_SOURCE_CATALOG_COLUMNS
      );
    });
}

export function buildAepDestinationCatalogRows({ connectionSpecs = [], connections = [], targetConnections = [], flows = [] } = {}) {
  const context = buildAepContext({ connectionSpecs, connections, targetConnections });
  return toArray(connectionSpecs)
    .filter(isDestinationConnectionSpec)
    .map((spec) => {
      const specId = normalizeId(spec.id);
      const baseConnections = toArray(connections).filter((connection) => normalizeId(getConnectionSpecId(connection)) === specId);
      const baseConnectionIds = new Set(baseConnections.map((connection) => normalizeId(connection.id)).filter(Boolean));
      const configuredTargetConnections = toArray(targetConnections).filter((connection) =>
        normalizeId(getConnectionSpecId(connection)) === specId || baseConnectionIds.has(normalizeId(connection.baseConnectionId))
      );
      const configuredTargetConnectionIds = configuredTargetConnections.map((connection) => connection.id);
      const relatedFlows = toArray(flows).filter((flow) =>
        isDestinationFlow(flow, context) && hasAnyId(extractIds(flow.targetConnectionIds ?? flow.targetConnections), configuredTargetConnectionIds)
      );
      const uiAttributes = getDestinationUiAttributes(spec);

      return orderRow(
        {
          connection_spec_id: specId,
          destination_name: pickFirst(spec, ["name", "displayName", "title"]),
          destination_description: pickFirst(spec, ["description"]),
          destination_category: pickSpecCategory(spec),
          destination_type: pickFirst(uiAttributes, ["destinationType", "type"]) ?? pickFirst(spec, ["providerId", "type"]),
          provider_id: pickFirst(spec, ["providerId"]),
          spec_version: pickFirst(spec, ["version", "specVersion"]),
          is_destination: true,
          authentication_types: joinValuesOrDash(collectSpecAuthTypes(spec)),
          delivery_type: pickFirst(uiAttributes, ["deliveryType", "destinationDelivery", "activationMode"]),
          supported_data_types: joinValuesOrDash(collectSpecSupportedValues(spec, ["supportedDataTypes", "dataTypes", "supportedDataType"])),
          supported_frequencies: joinValuesOrDash(collectSpecSupportedValues(spec, ["supportedFrequencies", "frequency", "frequencies"])),
          documentation_url: pickSpecDocumentationUrl(spec, uiAttributes),
          icon_name: pickSpecIconName(spec, uiAttributes),
          is_beta: pickFirst(uiAttributes, ["isBeta", "beta"]) ?? pickNested(spec, [["attributes", "isBeta"], ["attributes", "beta"]]),
          is_deprecated: pickFirst(uiAttributes, ["isDeprecated", "deprecated"]) ?? pickNested(spec, [["attributes", "isDeprecated"], ["attributes", "deprecated"]]),
          configured_base_connection_count: baseConnections.length,
          configured_target_connection_count: configuredTargetConnections.length,
          configured_dataflow_count: relatedFlows.length,
          enabled_dataflow_count: relatedFlows.filter(isEnabledState).length,
          raw_connection_spec_file: spec.rawFile
        },
        AEP_DESTINATION_CATALOG_COLUMNS
      );
    });
}
export function buildAepSourcesListRows({ connectionSpecs = [], connections = [], sourceConnections = [], flows = [] } = {}) {
  const context = buildAepContext({ connectionSpecs, connections, sourceConnections });
  const sourceFlows = toArray(flows).filter((flow) => isSourceFlow(flow, context));
  const relevantSourceConnections = filterAepSourceConnections(sourceConnections, context);
  const grouped = groupByBaseConnection(relevantSourceConnections);

  return Array.from(grouped.entries()).map(([baseConnectionId, groupedSourceConnections]) => {
    const firstSourceConnection = groupedSourceConnections[0] ?? {};
    const baseConnection = context.connectionsById.get(baseConnectionId) ?? {};
    const specId = getConnectionSpecId(baseConnection) || getConnectionSpecId(firstSourceConnection);
    const spec = context.connectionSpecsById.get(specId) ?? {};
    const relatedFlows = sourceFlows.filter((flow) => hasAnyId(extractIds(flow.sourceConnectionIds ?? flow.sourceConnections), groupedSourceConnections.map((item) => item.id)));
    return orderRow(
      {
        source_id: baseConnectionId || firstSourceConnection.id,
        source_name: pickFirst(baseConnection, ["name", "displayName"]) ?? pickFirst(firstSourceConnection, ["name", "displayName"]),
        source_type: pickFirst(spec, ["providerId", "type"]) ?? pickFirst(baseConnection, ["type"]),
        source_category: pickSpecCategory(spec),
        source_state: pickFirst(baseConnection, ["state", "status"]) ?? pickFirst(firstSourceConnection, ["state", "status"]),
        connection_spec_id: specId,
        connection_spec_name: pickFirst(spec, ["name", "displayName", "title"]),
        base_connection_id: baseConnectionId,
        base_connection_name: pickFirst(baseConnection, ["name", "displayName"]),
        source_connection_ids: joinValuesOrDash(groupedSourceConnections.map((connection) => connection.id)),
        source_connection_count: groupedSourceConnections.length,
        dataflow_count: relatedFlows.length,
        enabled_dataflow_count: relatedFlows.filter(isEnabledState).length,
        created_at: pickFirst(baseConnection, ["createdAt", "created"]),
        updated_at: pickFirst(baseConnection, ["updatedAt", "modifiedAt", "modified"]),
        raw_source_file: pickFirst(baseConnection, ["rawFile"]) ?? pickFirst(firstSourceConnection, ["rawFile"])
      },
      AEP_SOURCES_LIST_COLUMNS
    );
  });
}

export function buildAepSourceDataflowRows({ connectionSpecs = [], connections = [], sourceConnections = [], targetConnections = [], flows = [] } = {}) {
  const context = buildAepContext({ connectionSpecs, connections, sourceConnections, targetConnections, flows });
  return toArray(flows)
    .filter((flow) => isSourceFlow(flow, context))
    .map((flow) => {
      const sourceConnection = firstMapped(extractIds(flow.sourceConnectionIds ?? flow.sourceConnections), context.sourceConnectionsById) ?? {};
      const baseConnection = context.connectionsById.get(normalizeId(sourceConnection.baseConnectionId)) ?? {};
      const specId = getConnectionSpecId(baseConnection) || getConnectionSpecId(sourceConnection);
      const spec = context.connectionSpecsById.get(specId) ?? {};
      const targets = extractIds(flow.targetConnectionIds ?? flow.targetConnections)
        .map((id) => context.targetConnectionsById.get(id))
        .filter(Boolean);
      return orderRow(
        {
          dataflow_id: pickFirst(flow, ["id", "flowId"]),
          dataflow_name: pickFirst(flow, ["name", "flowName"]),
          dataflow_state: pickFirst(flow, ["state", "status"]),
          dataflow_description: pickFirst(flow, ["description"]),
          source_id: pickFirst(baseConnection, ["id"]) ?? pickFirst(sourceConnection, ["baseConnectionId", "id"]),
          source_name: pickFirst(baseConnection, ["name", "displayName"]) ?? pickFirst(sourceConnection, ["name", "displayName"]),
          connection_spec_id: specId,
          connection_spec_name: pickFirst(spec, ["name", "displayName", "title"]),
          source_connection_ids: joinValuesOrDash(extractIds(flow.sourceConnectionIds ?? flow.sourceConnections)),
          target_connection_ids: joinValuesOrDash(extractIds(flow.targetConnectionIds ?? flow.targetConnections)),
          target_dataset_ids: joinValuesOrDash(collectDeepValues(targets.length ? targets : [flow], ["datasetId", "dataSetId", "targetDatasetId"])),
          target_schema_ids: joinValuesOrDash(collectDeepValues(targets.length ? targets : [flow], ["schemaId", "targetSchemaId"])),
          schedule_frequency: pickNested(flow, [["scheduleParams", "frequency"], ["schedule", "frequency"]]),
          schedule_interval: pickNested(flow, [["scheduleParams", "interval"], ["schedule", "interval"]]),
          schedule_start_time: pickNested(flow, [["scheduleParams", "startTime"], ["schedule", "startTime"]]),
          transformation_count: toArray(flow.transformations).length,
          mapping_set_ids: joinValuesOrDash(collectMappingIds(flow)),
          last_run_status: pickNested(flow, [["lastRunDetails", "status"], ["lastRun", "status"]]),
          last_run_started_at: pickNested(flow, [["lastRunDetails", "startedAtUTC"], ["lastRun", "startedAt"]]),
          last_run_ended_at: pickNested(flow, [["lastRunDetails", "completedAtUTC"], ["lastRun", "endedAt"]]),
          created_at: pickFirst(flow, ["createdAt", "created"]),
          updated_at: pickFirst(flow, ["updatedAt", "modifiedAt", "modified"]),
          raw_flow_file: flow.rawFile
        },
        AEP_SOURCE_DATAFLOWS_COLUMNS
      );
    });
}

export function buildAepDestinationsListRows({ connectionSpecs = [], connections = [], targetConnections = [], flows = [] } = {}) {
  const context = buildAepContext({ connectionSpecs, connections, targetConnections });
  const destinationFlows = toArray(flows).filter((flow) => isDestinationFlow(flow, context));
  const relevantTargetConnections = filterAepDestinationTargetConnections(targetConnections, context);
  const grouped = groupByBaseConnection(relevantTargetConnections);

  return Array.from(grouped.entries()).map(([baseConnectionId, groupedTargetConnections]) => {
    const firstTargetConnection = groupedTargetConnections[0] ?? {};
    const baseConnection = context.connectionsById.get(baseConnectionId) ?? {};
    const specId = getConnectionSpecId(baseConnection) || getConnectionSpecId(firstTargetConnection);
    const spec = context.connectionSpecsById.get(specId) ?? {};
    const relatedFlows = destinationFlows.filter((flow) => hasAnyId(extractIds(flow.targetConnectionIds ?? flow.targetConnections), groupedTargetConnections.map((item) => item.id)));
    return orderRow(
      {
        destination_id: baseConnectionId || firstTargetConnection.id,
        destination_name: pickFirst(baseConnection, ["name", "displayName"]) ?? pickFirst(firstTargetConnection, ["name", "displayName"]),
        destination_type: pickFirst(spec, ["providerId", "type"]) ?? pickFirst(baseConnection, ["type"]),
        destination_category: pickSpecCategory(spec),
        destination_state: pickFirst(baseConnection, ["state", "status"]) ?? pickFirst(firstTargetConnection, ["state", "status"]),
        connection_spec_id: specId,
        connection_spec_name: pickFirst(spec, ["name", "displayName", "title"]),
        base_connection_id: baseConnectionId,
        base_connection_name: pickFirst(baseConnection, ["name", "displayName"]),
        target_connection_ids: joinValuesOrDash(groupedTargetConnections.map((connection) => connection.id)),
        target_connection_count: groupedTargetConnections.length,
        dataflow_count: relatedFlows.length,
        enabled_dataflow_count: relatedFlows.filter(isEnabledState).length,
        activation_mode: pickNested(firstTargetConnection, [["params", "mode"], ["params", "activationMode"], ["activationMode"]]),
        created_at: pickFirst(baseConnection, ["createdAt", "created"]),
        updated_at: pickFirst(baseConnection, ["updatedAt", "modifiedAt", "modified"]),
        raw_destination_file: pickFirst(baseConnection, ["rawFile"]) ?? pickFirst(firstTargetConnection, ["rawFile"])
      },
      AEP_DESTINATIONS_LIST_COLUMNS
    );
  });
}

export function buildAepDestinationDataflowRows({ connectionSpecs = [], connections = [], sourceConnections = [], targetConnections = [], flows = [] } = {}) {
  const context = buildAepContext({ connectionSpecs, connections, sourceConnections, targetConnections, flows });
  return toArray(flows)
    .filter((flow) => isDestinationFlow(flow, context))
    .map((flow) => {
      const targets = extractIds(flow.targetConnectionIds ?? flow.targetConnections)
        .map((id) => context.targetConnectionsById.get(id))
        .filter(Boolean);
      const targetConnection = targets[0] ?? {};
      const baseConnection = context.connectionsById.get(normalizeId(targetConnection.baseConnectionId)) ?? {};
      const specId = getConnectionSpecId(baseConnection) || getConnectionSpecId(targetConnection);
      const spec = context.connectionSpecsById.get(specId) ?? {};
      return orderRow(
        {
          dataflow_id: pickFirst(flow, ["id", "flowId"]),
          dataflow_name: pickFirst(flow, ["name", "flowName"]),
          dataflow_state: pickFirst(flow, ["state", "status"]),
          dataflow_description: pickFirst(flow, ["description"]),
          destination_id: pickFirst(baseConnection, ["id"]) ?? pickFirst(targetConnection, ["baseConnectionId", "id"]),
          destination_name: pickFirst(baseConnection, ["name", "displayName"]) ?? pickFirst(targetConnection, ["name", "displayName"]),
          connection_spec_id: specId,
          connection_spec_name: pickFirst(spec, ["name", "displayName", "title"]),
          source_connection_ids: joinValuesOrDash(extractIds(flow.sourceConnectionIds ?? flow.sourceConnections)),
          target_connection_ids: joinValuesOrDash(extractIds(flow.targetConnectionIds ?? flow.targetConnections)),
          target_connection_names: joinValuesOrDash(targets.map((target) => pickFirst(target, ["name", "displayName"]))),
          segment_ids: joinValuesOrDash(collectSegmentValues(flow, "id")),
          segment_names: joinValuesOrDash(collectSegmentValues(flow, "name")),
          dataset_ids: joinValuesOrDash(collectDeepValues([flow, ...targets], ["datasetId", "dataSetId"])),
          schedule_frequency: pickNested(flow, [["scheduleParams", "frequency"], ["schedule", "frequency"]]),
          schedule_interval: pickNested(flow, [["scheduleParams", "interval"], ["schedule", "interval"]]),
          activation_fields: joinValuesOrDash(collectDeepValues(flow, ["activationField", "mandatoryField", "mappingSource"])),
          mapping_set_ids: joinValuesOrDash(collectMappingIds(flow)),
          last_run_status: pickNested(flow, [["lastRunDetails", "status"], ["lastRun", "status"]]),
          last_run_started_at: pickNested(flow, [["lastRunDetails", "startedAtUTC"], ["lastRun", "startedAt"]]),
          last_run_ended_at: pickNested(flow, [["lastRunDetails", "completedAtUTC"], ["lastRun", "endedAt"]]),
          created_at: pickFirst(flow, ["createdAt", "created"]),
          updated_at: pickFirst(flow, ["updatedAt", "modifiedAt", "modified"]),
          raw_flow_file: flow.rawFile
        },
        AEP_DESTINATION_DATAFLOWS_COLUMNS
      );
    });
}

async function runAjoJourneysSection({ config, dirs, runDir, errors, accessToken, deps }) {
  const listResult = await fetchPaginatedCollection({
    endpointPath: "/ajo/journey",
    query: { page: 0, pageSize: config.pageSize },
    pagination: "page",
    config,
    accessToken,
    deps
  });
  await writeJson(path.join(dirs.rawAjo, "journeys-list.json"), listResult.raw);
  const journeyList = listResult.items;
  const fetchable = journeyList.filter((journey) => pickJourneyId(journey));

  const detailResult = await collectDetailItemsWithErrors({
    items: fetchable,
    concurrency: config.concurrency,
    fetchDetail: async (journey) => {
      const journeyId = pickJourneyId(journey);
      const endpointPath = `/ajo/journey/${encodeURIComponent(journeyId)}`;
      const detail = await fetchPlatformJson(endpointPath, {
        query: { include: "campaigns,rulesets,surfaces" },
        config,
        accessToken,
        deps
      });
      const safeName = safeFileName(pickFirst(detail, ["name", "journeyName"]) ?? pickFirst(journey, ["name", "journeyName"]) ?? journeyId);
      const rawPath = path.join(dirs.rawAjoJourneys, `${safeFileName(journeyId)}-${safeName}.json`);
      await writeJson(rawPath, detail);
      return {
        detail,
        rawFile: toPosixPath(path.relative(runDir, rawPath))
      };
    },
    buildPackage: ({ item, detail }) => ({
      listItem: item,
      detail: detail.detail,
      rawFile: detail.rawFile
    }),
    buildError: ({ item, error }) => serializeError(error, config, {
      section: "ajo_journeys",
      itemId: pickJourneyId(item),
      itemName: pickFirst(item, ["name", "journeyName"])
    })
  });

  errors.push(...detailResult.errors);
  const packagesById = new Map(detailResult.packages.map((item) => [normalizeId(pickJourneyId(item.detail) || pickJourneyId(item.listItem)), item]));
  const journeys = journeyList.map((listItem) => {
    const journeyId = normalizeId(pickJourneyId(listItem));
    const detailPackage = packagesById.get(journeyId);
    return {
      ...listItem,
      ...(detailPackage?.detail ?? {}),
      rawFile: detailPackage?.rawFile ?? DASH
    };
  });

  return { journeys };
}

async function runAepFlowServiceSection({ config, dirs, errors, accessToken, deps }) {
  const endpoints = [
    { key: "connectionSpecs", fileName: "connection-specs-list.json", path: "/data/foundation/flowservice/connectionSpecs" },
    { key: "connections", fileName: "connections-list.json", path: "/data/foundation/flowservice/connections" },
    { key: "sourceConnections", fileName: "source-connections-list.json", path: "/data/foundation/flowservice/sourceConnections" },
    { key: "targetConnections", fileName: "target-connections-list.json", path: "/data/foundation/flowservice/targetConnections" },
    { key: "flows", fileName: "flows-list.json", path: "/data/foundation/flowservice/flows" }
  ];

  const state = {
    connectionSpecs: [],
    connections: [],
    sourceConnections: [],
    targetConnections: [],
    flows: []
  };

  for (const endpoint of endpoints) {
    try {
      const result = await fetchPaginatedCollection({
        endpointPath: endpoint.path,
        query: { limit: config.pageSize },
        pagination: "continuation",
        config,
        accessToken,
        deps
      });
      const rawPath = path.join(dirs.rawAep, endpoint.fileName);
      await writeJson(rawPath, result.raw);
      const rawFile = toPosixPath(path.relative(dirs.runDir, rawPath));
      state[endpoint.key] = result.items.map((item) => ({ ...item, rawFile }));
    } catch (error) {
      errors.push(serializeError(error, config, { section: `aep_${endpoint.key}` }));
    }
  }

  return state;
}

async function fetchPaginatedCollection({ endpointPath, query = {}, pagination, config, accessToken, deps }) {
  const items = [];
  const pages = [];
  let page = Number(query.page ?? 0);
  let continuationToken;
  let nextUrl;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const pageQuery = { ...query };
    if (pagination === "page") pageQuery.page = page;
    if (pagination === "continuation" && continuationToken) pageQuery.continuationToken = continuationToken;

    const response = await fetchPlatformJson(nextUrl ?? endpointPath, {
      query: nextUrl ? {} : pageQuery,
      config,
      accessToken,
      deps
    });
    const pageItems = extractArrayFromResponse(response);
    pages.push({
      count: pageItems.length,
      response
    });
    items.push(...pageItems);

    if (pagination === "page") {
      const totalPages = Number(response?.pages ?? response?.totalPages);
      if (Number.isInteger(totalPages) && page + 1 >= totalPages) break;
      if (pageItems.length < (query.pageSize ?? config.pageSize)) break;
      page += 1;
      continue;
    }

    continuationToken = extractContinuationToken(response);
    nextUrl = resolveCollectionNextUrl(extractNextUrl(response), endpointPath);
    if (!continuationToken && !nextUrl) break;
  }

  return {
    items,
    raw: pages.length === 1 ? pages[0].response : { pages, items }
  };
}

async function fetchPlatformJson(endpointOrUrl, { query = {}, config, accessToken, deps = {} }) {
  const url = buildPlatformUrl(config, endpointOrUrl, query);
  return (deps.fetchJson ?? defaultFetchJson)(url, {
    method: "GET",
    headers: buildPlatformHeaders(config, accessToken)
  });
}

async function getAdobeAccessToken(config, deps = {}) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: config.scopes
  });
  const response = await (deps.fetchJson ?? defaultFetchJson)(config.imsTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response?.access_token) {
    throw new Error("IMS token response did not include access_token.");
  }
  return response.access_token;
}

function buildPlatformHeaders(config, accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "x-api-key": config.clientId,
    "x-gw-ims-org-id": config.orgId,
    "x-sandbox-name": config.sandboxName,
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  };
}

function buildPlatformUrl(config, endpointOrUrl, query = {}) {
  const url = /^https?:\/\//i.test(String(endpointOrUrl))
    ? new URL(endpointOrUrl)
    : new URL(`${trimTrailingSlash(config.platformBaseUrl)}/${String(endpointOrUrl).replace(/^\/+/, "")}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

function buildAepContext({ connectionSpecs = [], connections = [], sourceConnections = [], targetConnections = [] } = {}) {
  const specs = toArray(connectionSpecs);
  return {
    connectionSpecsById: indexById(specs),
    connectionsById: indexById(connections),
    sourceConnectionsById: indexById(sourceConnections),
    targetConnectionsById: indexById(targetConnections),
    hasSourceSpecMarkers: specs.some(isSourceConnectionSpec),
    hasDestinationSpecMarkers: specs.some(isDestinationConnectionSpec)
  };
}

function groupByBaseConnection(connections) {
  const grouped = new Map();
  for (const connection of toArray(connections)) {
    const baseId = normalizeId(connection.baseConnectionId ?? connection.baseConnection?.id ?? connection.id);
    if (!baseId) continue;
    if (!grouped.has(baseId)) grouped.set(baseId, []);
    grouped.get(baseId).push(connection);
  }
  return grouped;
}

function filterAepSourceConnections(sourceConnections, context) {
  const connections = toArray(sourceConnections);
  if (!context.hasSourceSpecMarkers) return connections;
  return connections.filter((connection) => isSourceConnection(connection, context));
}

function filterAepDestinationTargetConnections(targetConnections, context) {
  const connections = toArray(targetConnections);
  if (!context.hasDestinationSpecMarkers) return connections;
  return connections.filter((connection) => isDestinationTargetConnection(connection, context));
}

function isSourceFlow(flow, context = {}) {
  if (isDestinationFlow(flow, context)) return false;
  const sourceRefs = toArray(flow?.sourceConnections).filter(isObject);
  if (sourceRefs.some((connection) => isSourceConnection(connection, context))) return true;

  const sourceIds = extractIds(flow?.sourceConnectionIds ?? flow?.sourceConnections);
  if (sourceIds.length === 0 || !context.hasSourceSpecMarkers) return true;
  return sourceIds.some((id) => isSourceConnection(context.sourceConnectionsById?.get(normalizeId(id)), context));
}

function isSourceConnection(connection, context = {}) {
  if (!isObject(connection)) return false;
  const spec = context.connectionSpecsById?.get(normalizeId(getConnectionSpecId(connection))) ?? {};
  return isSourceConnectionSpec(spec);
}

function isDestinationTargetConnection(connection, context = {}) {
  if (!isObject(connection)) return false;
  const spec = context.connectionSpecsById?.get(normalizeId(getConnectionSpecId(connection))) ?? {};
  return isDestinationConnectionSpec(spec);
}

function isSourceConnectionSpec(spec) {
  if (!isObject(spec)) return false;
  const sourceUi = getSourceUiAttributes(spec);
  if (isTruthyValue(pickFirst(sourceUi, ["isSource"]))) return true;
  if (isTruthyValue(pickFirst(getDestinationUiAttributes(spec), ["isDestination"]))) return false;
  return Boolean(spec.sourceSpec || spec.sourceSpecs) && !(spec.targetSpec || spec.targetSpecs);
}

function isDestinationConnectionSpec(spec) {
  if (!isObject(spec)) return false;
  const destinationUi = getDestinationUiAttributes(spec);
  if (isTruthyValue(pickFirst(destinationUi, ["isDestination"]))) return true;
  if (isTruthyValue(pickFirst(getSourceUiAttributes(spec), ["isSource"]))) return false;
  return Boolean(spec.targetSpec || spec.targetSpecs) && !(spec.sourceSpec || spec.sourceSpecs);
}

function getSourceUiAttributes(spec) {
  return firstObject([
    spec?.sourceSpec?.attributes?.uiAttributes,
    spec?.sourceSpec?.uiAttributes,
    ...toArray(spec?.sourceSpecs).map((item) => item?.attributes?.uiAttributes ?? item?.uiAttributes),
    spec?.attributes?.source?.uiAttributes,
    spec?.attributes?.uiAttributes
  ]) ?? {};
}

function getDestinationUiAttributes(spec) {
  return firstObject([
    spec?.targetSpec?.attributes?.uiAttributes,
    spec?.targetSpec?.uiAttributes,
    ...toArray(spec?.targetSpecs).map((item) => item?.attributes?.uiAttributes ?? item?.uiAttributes),
    spec?.attributes?.destination?.uiAttributes,
    spec?.attributes?.uiAttributes
  ]) ?? {};
}

function pickSpecCategory(spec) {
  return pickNested(spec, [
    ["attributes", "category"],
    ["category"],
    ["sourceSpec", "attributes", "category"],
    ["targetSpec", "attributes", "category"]
  ]);
}

function collectSpecAuthTypes(spec) {
  const values = [];
  const candidates = [
    spec?.authSpec,
    spec?.authSpecs,
    spec?.attributes?.authSpec,
    spec?.attributes?.authSpecs,
    spec?.sourceSpec?.authSpec,
    spec?.targetSpec?.authSpec
  ];
  for (const candidate of candidates) {
    for (const item of toArray(candidate)) {
      values.push(isObject(item) ? pickFirst(item, ["name", "specName", "type", "title"]) : item);
    }
  }
  return uniqueValues(values);
}

function collectSpecSupportedValues(spec, keys) {
  return uniqueValues(keys.flatMap((key) => collectDeepValues(spec, [key])));
}

function pickSpecDocumentationUrl(spec, uiAttributes = {}) {
  return pickFirst(uiAttributes, ["documentationLink", "documentationUrl", "documentationURL", "helpLink"]) ??
    pickNested(spec, [["attributes", "documentationLink"], ["attributes", "documentationUrl"], ["documentationUrl"]]);
}

function pickSpecIconName(spec, uiAttributes = {}) {
  return pickFirst(uiAttributes, ["iconName", "icon", "logo"]) ??
    pickNested(spec, [["attributes", "iconName"], ["attributes", "icon"]]);
}

function isTruthyValue(value) {
  return value === true || String(value).toLowerCase() === "true";
}
function isDestinationFlow(flow, context = {}) {
  const explicitFlags = toArray([
    flow?.inheritedAttributes?.properties?.isDestinationFlow,
    flow?.properties?.isDestinationFlow,
    flow?.isDestinationFlow
  ]);
  if (explicitFlags.some(isTruthyValue)) return true;

  const targetRefs = toArray(flow?.targetConnections).filter(isObject);
  if (targetRefs.some((connection) => isDestinationTargetConnection(connection, context))) return true;

  return extractIds(flow?.targetConnectionIds ?? flow?.targetConnections)
    .some((id) => isDestinationTargetConnection(context.targetConnectionsById?.get(normalizeId(id)), context));
}

function isEnabledState(value) {
  const source = isObject(value) ? pickFirst(value, ["state", "status"]) : value;
  return ["enabled", "active", "deployed", "live"].includes(String(source ?? "").toLowerCase());
}

function getConnectionSpecId(value) {
  return normalizeId(value?.connectionSpec?.id ?? value?.connectionSpecId ?? value?.connectionSpec?.connectionSpecId);
}

function collectMappingIds(flow) {
  return collectDeepValues(flow, ["mappingId", "mappingSetId", "mappingSetIds"]);
}

function collectSegmentValues(flow, wantedKey) {
  const values = [];
  walkJson(flow, (value, key) => {
    if (!isObject(value)) return;
    if (key === "value" && (value.id || value.name)) {
      values.push(value[wantedKey]);
      return;
    }
    if (/segment|audience/i.test(String(key)) && (value.id || value.name)) {
      values.push(value[wantedKey]);
    }
  });
  return uniqueValues(values);
}

function collectDeepValues(source, keys) {
  const values = [];
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  walkJson(source, (value, key) => {
    if (wanted.has(String(key).toLowerCase())) {
      if (Array.isArray(value)) values.push(...value);
      else values.push(value);
    }
  });
  return uniqueValues(values);
}

function collectJourneyCampaigns(journey) {
  const campaigns = [...toArray(journey.campaigns)];
  for (const node of toArray(journey.nodes)) {
    const campaign = pickNodeCampaign(node);
    if (isObject(campaign)) campaigns.push(campaign);
  }
  return uniqueObjectsBy(campaigns, (campaign) => normalizeId(pickFirst(campaign, ["id", "campaignId"]) ?? pickFirst(campaign, ["name", "campaignName"])));
}

function collectJourneySurfaces(journey) {
  const surfaces = [...extractSurfaceNames(journey.surfaces)];
  for (const node of toArray(journey.nodes)) {
    surfaces.push(pickNodeSurfaceName(node));
  }
  return uniqueValues(surfaces);
}

function collectJourneyChannels(journey) {
  const channels = [];
  for (const node of toArray(journey.nodes)) {
    channels.push(pickNodeChannel(node));
  }
  walkJson(journey.campaigns, (value, key) => {
    if (/channel/i.test(String(key)) && (typeof value === "string" || typeof value === "number")) channels.push(value);
  });
  return uniqueValues(channels);
}

function collectJourneyAudiences(journey) {
  const audiences = [];
  for (const node of toArray(journey.nodes)) {
    audiences.push(...collectNodeAudiences(node));
  }
  walkJson(journey, (value, key) => {
    if (!/audience|segment/i.test(String(key))) return;
    if (isObject(value) && (value.id || value.name)) {
      audiences.push({ id: value.id ?? value.audienceId ?? value.segmentId, name: value.name ?? value.audienceName ?? value.segmentName });
    }
  });
  return uniqueObjectsBy(audiences, (audience) => normalizeId(audience.id ?? audience.name));
}

function collectNodeAudiences(node) {
  const audiences = [];
  for (const source of [node.audiences, node.audience, node.segments, node.segment]) {
    for (const item of toArray(source)) {
      if (isObject(item)) {
        audiences.push({ id: item.id ?? item.audienceId ?? item.segmentId, name: item.name ?? item.audienceName ?? item.segmentName });
      } else {
        audiences.push({ id: item, name: undefined });
      }
    }
  }
  return uniqueObjectsBy(audiences, (audience) => normalizeId(audience.id ?? audience.name));
}

function pickNodeCampaign(node) {
  return firstObject([node.campaign, node.campaigns, node.message, node.action?.campaign]);
}

function pickNodeChannel(node) {
  return pickNested(node, [
    ["channel", "type"],
    ["channel", "name"],
    ["surface", "channel"],
    ["message", "channel"],
    ["action", "channel"]
  ]);
}

function pickNodeSurfaceName(node) {
  return pickNested(node, [
    ["surface", "name"],
    ["messageSurface", "name"],
    ["surfaceName"],
    ["message", "surface", "name"]
  ]);
}

function extractSurfaceNames(surfaces) {
  return toArray(surfaces).map((surface) => isObject(surface) ? pickFirst(surface, ["name", "surfaceName", "id"]) : surface);
}

function extractLabelNames(labels) {
  return toArray(labels).map((label) => isObject(label) ? pickFirst(label, ["name", "labelName", "label", "id"]) : label);
}

function extractMetricNames(metrics) {
  return toArray(metrics).map((metric) => isObject(metric) ? pickFirst(metric, ["name", "metricName", "id"]) : metric);
}

function classifyJourneyActiveState(status) {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (["deployed", "redeployed", "live"].includes(normalized)) return "active";
  if (normalized === "paused") return "paused";
  if (["draft", "testing", "draft (test)", "in review", "finished", "stopped", "dry run", "closed"].includes(normalized)) {
    return "inactive";
  }
  return normalized ? "unknown" : DASH;
}

function pickJourneyId(journey) {
  return pickFirst(journey, ["id", "journeyId"]);
}

function extractIds(value) {
  return uniqueValues(toArray(value).flatMap((item) => {
    if (isObject(item)) return [item.id ?? item.connectionId ?? item.sourceConnectionId ?? item.targetConnectionId];
    return [item];
  }));
}

function hasAnyId(leftValues, rightValues) {
  const right = new Set(rightValues.map(normalizeId).filter(Boolean));
  return leftValues.map(normalizeId).some((value) => right.has(value));
}

function firstMapped(ids, map) {
  for (const id of ids) {
    const value = map.get(normalizeId(id));
    if (value) return value;
  }
  return undefined;
}

function firstObject(value) {
  if (isObject(value)) return value;
  return toArray(value).find(isObject);
}

function orderRow(row, columns) {
  return Object.fromEntries(columns.map((column) => [column, valueOrDash(row[column])]));
}

function valueOrDash(value) {
  if (value === undefined || value === null || value === "") return DASH;
  if (Array.isArray(value)) return joinValuesOrDash(value);
  if (isObject(value)) return JSON.stringify(value);
  return value;
}

function joinValuesOrDash(values) {
  const joined = uniqueValues(values).join(", ");
  return joined || DASH;
}

function uniqueValues(values) {
  const normalized = [];
  const seen = new Set();
  for (const value of toArray(values).flat()) {
    if (value === undefined || value === null || value === "") continue;
    const text = String(value);
    if (seen.has(text)) continue;
    seen.add(text);
    normalized.push(value);
  }
  return normalized;
}

function uniqueObjectsBy(values, keyFn) {
  const rows = [];
  const seen = new Set();
  for (const value of values.filter(Boolean)) {
    const key = keyFn(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    rows.push(value);
  }
  return rows;
}

function indexById(values) {
  return new Map(toArray(values).map((value) => [normalizeId(value?.id), value]).filter(([id]) => id));
}

function pickFirst(source, keys) {
  if (!isObject(source)) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function pickNested(source, paths) {
  for (const keys of paths) {
    let current = source;
    for (const key of keys) {
      current = current?.[key];
      if (current === undefined || current === null || current === "") break;
    }
    if (current !== undefined && current !== null && current !== "") return current;
  }
  return undefined;
}

function truncateJson(value) {
  const json = JSON.stringify(value ?? {});
  return json.length > RAW_JSON_PREVIEW_LIMIT ? `${json.slice(0, RAW_JSON_PREVIEW_LIMIT)}...` : json;
}

function walkJson(source, visitor, seen = new WeakSet()) {
  if (source === null || source === undefined) return;
  if (Array.isArray(source)) {
    source.forEach((item, index) => {
      visitor(item, index);
      walkJson(item, visitor, seen);
    });
    return;
  }
  if (!isObject(source)) return;
  if (seen.has(source)) return;
  seen.add(source);
  Object.entries(source).forEach(([key, value]) => {
    visitor(value, key);
    walkJson(value, visitor, seen);
  });
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function normalizeId(value) {
  return value === undefined || value === null || value === "" ? "" : String(value);
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPositiveInteger(primary, secondary, fallback) {
  for (const value of [primary, secondary]) {
    const number = Number(value);
    if (Number.isInteger(number) && number > 0) return number;
  }
  return fallback;
}

function normalizeScope(value) {
  const scope = String(value ?? "all").toLowerCase();
  const aliases = {
    journeys: "ajo",
    journey: "ajo",
    sources: "aep-sources",
    destinations: "aep-destinations"
  };
  const normalized = aliases[scope] ?? scope;
  const allowed = new Set(["all", "ajo", "aep", "aep-sources", "aep-destinations"]);
  if (!allowed.has(normalized)) throw new Error(`Unknown scope: ${value}`);
  return normalized;
}

function shouldRunScope(currentScope, section) {
  if (currentScope === "all") return true;
  if (section === "ajo") return currentScope === "ajo";
  if (section === "aep") return ["aep", "aep-sources", "aep-destinations"].includes(currentScope);
  return false;
}

function shouldEmitScope(currentScope, section) {
  if (currentScope === "all") return true;
  if (section === "ajo") return currentScope === "ajo";
  if (section === "aep-sources") return ["aep", "aep-sources"].includes(currentScope);
  if (section === "aep-destinations") return ["aep", "aep-destinations"].includes(currentScope);
  return false;
}

function validateAepAjoConfig(config) {
  const missing = [];
  if (!config.clientId) missing.push("ADOBE_CLIENT_ID");
  if (!config.clientSecret) missing.push("ADOBE_CLIENT_SECRET");
  if (!config.orgId) missing.push("ADOBE_ORG_ID");
  if (!config.scopes) missing.push("ADOBE_SCOPES");
  if (!config.sandboxName) missing.push("AEP_SANDBOX_NAME");
  if (missing.length > 0) throw new Error(`Missing required Adobe Platform config: ${missing.join(", ")}`);
}

function createEmptyState() {
  return {
    ajo: { journeys: [] },
    aep: {
      connectionSpecs: [],
      connections: [],
      sourceConnections: [],
      targetConnections: [],
      flows: []
    }
  };
}

function createRunDirs(runDir) {
  const raw = path.join(runDir, "raw");
  const rawAjo = path.join(raw, "ajo");
  const rawAep = path.join(raw, "aep");
  return {
    runDir,
    raw,
    rawAjo,
    rawAjoJourneys: path.join(rawAjo, "journeys"),
    rawAep,
    csv: path.join(runDir, "csv"),
    reports: path.join(runDir, "reports")
  };
}

function extractContinuationToken(response) {
  return response?.continuationToken ?? response?.nextToken ?? response?._page?.nextToken;
}

function extractNextUrl(response) {
  const candidates = [
    response?.next,
    response?.nextUrl,
    response?._links?.next?.href,
    response?.links?.next?.href
  ];
  return candidates.find((candidate) => typeof candidate === "string" && candidate);
}

function resolveCollectionNextUrl(nextUrl, endpointPath) {
  if (!nextUrl || /^https?:\/\//i.test(nextUrl)) return nextUrl;

  const placeholderOrigin = "https://pagination.invalid";
  const parsedNext = new URL(nextUrl, placeholderOrigin);
  const parsedEndpoint = new URL(endpointPath, placeholderOrigin);
  const nextParts = parsedNext.pathname.split("/").filter(Boolean);
  const endpointParts = parsedEndpoint.pathname.split("/").filter(Boolean);

  if (nextParts.length === 1 && nextParts[0] === endpointParts.at(-1)) {
    return parsedEndpoint.pathname + parsedNext.search;
  }

  return nextUrl;
}

function buildSummaryMarkdown({ runDir, startedAt, completedAt, config, csvPayloads, errors }) {
  const rows = AEP_AJO_CSV_FILES.map((file) => `- ${file.fileName}: ${csvPayloads[file.fileName].length}`).join("\n");
  return `# AEP and AJO Inventory Summary

- Run directory: ${runDir}
- Started: ${startedAt.toISOString()}
- Completed: ${completedAt.toISOString()}
- Scope: ${config.scope}
- Sandbox: ${config.sandboxName}
- Adobe Target API calls: none
- Errors: ${errors.length}

## CSV Rows

${rows}
`;
}

function serializeError(error, config, item = {}) {
  return {
    section: item.section,
    itemId: item.itemId,
    itemName: item.itemName,
    status: error?.status,
    message: redactSecrets(error?.message || String(error), config),
    url: redactSecrets(error?.url, config),
    details: redactSecrets(error?.details, config)
  };
}

function redactSecrets(value, config = {}) {
  if (value === undefined || value === null) return value;
  if (typeof value === "string") {
    let redacted = value
      .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
      .replace(/(client_secret=)[^&\s]+/gi, "$1[REDACTED]")
      .replace(/(access_token=)[^&\s]+/gi, "$1[REDACTED]");
    for (const secret of [config.clientSecret].filter(Boolean)) {
      redacted = redacted.split(secret).join("[REDACTED]");
    }
    return redacted;
  }
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item, config));
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        /authorization|client_secret|secret|access[_-]?token|refresh[_-]?token|password/i.test(key) ? "[REDACTED]" : redactSecrets(child, config)
      ])
    );
  }
  return value;
}

function formatRunTimestamp(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/g, "");
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function printHelp() {
  console.log(`AEP and AJO CSV inventory

Usage:
  node src/aep-ajo-inventory.js [options]

Options:
  --scope all|ajo|aep|aep-sources|aep-destinations
  --sandbox <name>       AEP/AJO sandbox name. Defaults to AEP_SANDBOX_NAME.
  --out <dir>            Output root. Default: ./aep-ajo-inventory-output
  --page-size <number>   API list page size. Default: 100
  --concurrency <number> AJO journey detail concurrency. Default: 3
  --help

Examples:
  npm run inventory:aep-ajo
  npm run inventory:aep-ajo -- --sandbox prod --scope all
  node src/aep-ajo-inventory.js --scope ajo --sandbox prod
`);
}

async function main() {
  const cliOptions = parseAepAjoInventoryCliArgs();
  if (cliOptions.help) {
    printHelp();
    return;
  }

  const result = await runAepAjoInventory(loadAepAjoInventoryConfig(cliOptions));
  console.log(`AEP/AJO CSV inventory complete: ${result.csvDir}`);
  console.log("CSV files:");
  result.csvFiles.forEach((fileName) => console.log(`- ${fileName}`));
  if (result.errors > 0) console.log(`Errors recorded: ${result.errors}`);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
