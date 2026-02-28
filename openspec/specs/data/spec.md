# Data Capability Spec

## Purpose

Exposes MCP tools for querying IoT data records via the Sylvia-IoT data API. Covers count and list operations for application uplink data, application downlink data, network uplink data, network downlink data, and coremgr operation logs.

## Requirements

### Requirement: Application uplink data count
The MCP server SHALL expose a tool `data_application_uldata_count` that calls `GET /data/api/v1/application-uldata/count` and accepts required `unit` (unitId for normal users), optional `device` (deviceId), `network` (networkCode), `addr` (networkAddr), `profile` (string), `tfield` (required when using time filters; values: `proc`, `pub`, `time`), `tstart` (number, ms), and `tend` (number, ms).

#### Scenario: Count application uplink data
- **WHEN** the LLM calls `data_application_uldata_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

#### Scenario: Count with time filter
- **WHEN** the LLM calls `data_application_uldata_count` with `unit`, `tfield: "proc"`, `tstart`, and `tend`
- **THEN** the tool passes all four params and returns the filtered count

### Requirement: Application uplink data list
The MCP server SHALL expose a tool `data_application_uldata_list` that calls `GET /data/api/v1/application-uldata/list` and accepts the same filters as `data_application_uldata_count` plus optional `offset`, `limit`, and `sort`.

#### Scenario: List application uplink data
- **WHEN** the LLM calls `data_application_uldata_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `proc:desc` with up to 100 items; each item includes `dataId`, `proc`, `pub`, `unitCode`, `networkCode`, `networkAddr`, `unitId`, `deviceId`, `time`, `profile`, `data`, and optional `extension`

### Requirement: Application downlink data count
The MCP server SHALL expose a tool `data_application_dldata_count` that calls `GET /data/api/v1/application-dldata/count` and accepts required `unit`, optional `device`, `network`, `addr`, `profile`, and time filters `tfield` (values: `proc`, `resp`), `tstart`, `tend`.

#### Scenario: Count application downlink data
- **WHEN** the LLM calls `data_application_dldata_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Application downlink data list
The MCP server SHALL expose a tool `data_application_dldata_list` that calls `GET /data/api/v1/application-dldata/list` and accepts the same filters as `data_application_dldata_count` plus optional `offset`, `limit`, and `sort`.

#### Scenario: List application downlink data
- **WHEN** the LLM calls `data_application_dldata_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `proc:desc` with up to 100 items; each item includes `dataId`, `proc`, optional `resp`, `status`, `unitId`, optional `deviceId`, optional `networkCode`, optional `networkAddr`, `profile`, `data`, and optional `extension`

### Requirement: Network uplink data count
The MCP server SHALL expose a tool `data_network_uldata_count` that calls `GET /data/api/v1/network-uldata/count` and accepts required `unit`, optional `device`, `network`, `addr`, `profile`, and time filters `tfield` (values: `proc`, `time`), `tstart`, `tend`.

#### Scenario: Count network uplink data
- **WHEN** the LLM calls `data_network_uldata_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Network uplink data list
The MCP server SHALL expose a tool `data_network_uldata_list` that calls `GET /data/api/v1/network-uldata/list` and accepts the same filters as `data_network_uldata_count` plus optional `offset`, `limit`, and `sort`.

#### Scenario: List network uplink data
- **WHEN** the LLM calls `data_network_uldata_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `proc:desc` with up to 100 items; each item includes `dataId`, `proc`, `unitCode`, `networkCode`, `networkAddr`, optional `unitId`, optional `deviceId`, `time`, `profile`, `data`, and optional `extension`

### Requirement: Network downlink data count
The MCP server SHALL expose a tool `data_network_dldata_count` that calls `GET /data/api/v1/network-dldata/count` and accepts required `unit`, optional `device`, `network`, `addr`, `profile`, and time filters `tfield` (values: `proc`, `pub`, `resp`), `tstart`, `tend`.

#### Scenario: Count network downlink data
- **WHEN** the LLM calls `data_network_dldata_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Network downlink data list
The MCP server SHALL expose a tool `data_network_dldata_list` that calls `GET /data/api/v1/network-dldata/list` and accepts the same filters as `data_network_dldata_count` plus optional `offset`, `limit`, and `sort`.

#### Scenario: List network downlink data
- **WHEN** the LLM calls `data_network_dldata_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `proc:desc` with up to 100 items; each item includes `dataId`, `proc`, `pub`, optional `resp`, `status`, `unitId`, `deviceId`, `networkCode`, `networkAddr`, `profile`, `data`, and optional `extension`

### Requirement: Coremgr operation data count
The MCP server SHALL expose a tool `data_coremgr_opdata_count` that calls `GET /data/api/v1/coremgr-opdata/count` and accepts optional time filters `tfield` (values: `req`, `res`), `tstart`, and `tend`. Normal users see only their own operation data.

#### Scenario: Count own operation logs
- **WHEN** the LLM calls `data_coremgr_opdata_count` with no parameters
- **THEN** the tool returns `{ data: { count: N } }` as JSON for the current user's API calls

### Requirement: Coremgr operation data list
The MCP server SHALL expose a tool `data_coremgr_opdata_list` that calls `GET /data/api/v1/coremgr-opdata/list` and accepts the same filters as `data_coremgr_opdata_count` plus optional `offset`, `limit`, and `sort`.

#### Scenario: List own operation logs
- **WHEN** the LLM calls `data_coremgr_opdata_list` with no parameters
- **THEN** the tool returns `{ data: [...] }` sorted by `req:desc` with up to 100 items; each item includes `dataId`, `reqTime`, `resTime`, `latencyMs`, `status`, `sourceIp`, `method`, `path`, optional `body`, `userId`, `clientId`, optional `errCode`, optional `errMessage`
