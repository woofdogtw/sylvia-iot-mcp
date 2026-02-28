## ADDED Requirements

### Requirement: Device creation
The MCP server SHALL expose a tool `device_create` that calls `POST /coremgr/api/v1/device` and accepts required `unitId` (string), `networkId` (string), `networkAddr` (string), optional `profile` (string), optional `name` (string), and optional `info` (object).

#### Scenario: Create a device
- **WHEN** the LLM calls `device_create` with `unitId`, `networkId`, and `networkAddr`
- **THEN** the tool sends `{ data: { unitId, networkId, networkAddr, profile?, name?, info? } }` and returns `{ data: { deviceId } }` as JSON

#### Scenario: Network address already in use
- **WHEN** the LLM calls `device_create` with a `networkAddr` already assigned in that network
- **THEN** the tool returns `{ content: [...], isError: true }` with error code `err_broker_network_addr_exist`

### Requirement: Bulk device creation by address list
The MCP server SHALL expose a tool `device_bulk_create` that calls `POST /coremgr/api/v1/device/bulk` and accepts required `unitId` (string), `networkId` (string), `networkAddrs` (string array, max 1024), and optional `profile` (string). Existing addresses are silently skipped.

#### Scenario: Bulk create devices
- **WHEN** the LLM calls `device_bulk_create` with `unitId`, `networkId`, and `networkAddrs`
- **THEN** the tool sends `{ data: { unitId, networkId, networkAddrs, profile? } }` and returns `{ content: [{ type: "text", text: "created" }] }` on HTTP 204

### Requirement: Bulk device deletion by address list
The MCP server SHALL expose a tool `device_bulk_delete` that calls `POST /coremgr/api/v1/device/bulk-delete` and accepts required `unitId` (string), `networkId` (string), and `networkAddrs` (string array, max 1024).

#### Scenario: Bulk delete devices
- **WHEN** the LLM calls `device_bulk_delete` with `unitId`, `networkId`, and `networkAddrs`
- **THEN** the tool sends `{ data: { unitId, networkId, networkAddrs } }` and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204

### Requirement: Bulk device creation by address range
The MCP server SHALL expose a tool `device_range_create` that calls `POST /coremgr/api/v1/device/range` and accepts required `unitId` (string), `networkId` (string), `startAddr` (hex string), `endAddr` (hex string, same length as startAddr), and optional `profile` (string). Max 1024 devices (0x400). Existing addresses are silently skipped.

#### Scenario: Bulk create devices with hex range
- **WHEN** the LLM calls `device_range_create` with `unitId`, `networkId`, `startAddr: "80001000"`, and `endAddr: "800013ff"`
- **THEN** the tool sends `{ data: { unitId, networkId, startAddr, endAddr, profile? } }` and returns `{ content: [{ type: "text", text: "created" }] }` on HTTP 204

### Requirement: Bulk device deletion by address range
The MCP server SHALL expose a tool `device_range_delete` that calls `POST /coremgr/api/v1/device/range-delete` and accepts required `unitId` (string), `networkId` (string), `startAddr` (hex string), and `endAddr` (hex string). Max 1024 devices.

#### Scenario: Bulk delete devices with hex range
- **WHEN** the LLM calls `device_range_delete` with `unitId`, `networkId`, `startAddr`, and `endAddr`
- **THEN** the tool sends `{ data: { unitId, networkId, startAddr, endAddr } }` and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204

### Requirement: Device count
The MCP server SHALL expose a tool `device_count` that calls `GET /coremgr/api/v1/device/count` and accepts required `unit` (unitId for normal users), optional `network` (networkId), optional `addr` (networkAddr), optional `profile` (string), and optional `contains` (string for name search).

#### Scenario: Count devices in a unit
- **WHEN** the LLM calls `device_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Device list
The MCP server SHALL expose a tool `device_list` that calls `GET /coremgr/api/v1/device/list` and accepts required `unit`, optional `network`, `addr`, `profile`, `contains`, `offset`, `limit`, and `sort`.

#### Scenario: List devices in a unit
- **WHEN** the LLM calls `device_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `network:asc,addr:asc` with up to 100 items; each item includes `deviceId`, `unitId`, `unitCode`, `networkId`, `networkCode`, `networkAddr`, `createdAt`, `modifiedAt`, `profile`, `name`, `info`

### Requirement: Device retrieval
The MCP server SHALL expose a tool `device_get` that calls `GET /coremgr/api/v1/device/{deviceId}`.

#### Scenario: Get existing device
- **WHEN** the LLM calls `device_get` with a valid `deviceId`
- **THEN** the tool returns the device object as formatted JSON

#### Scenario: Device not found
- **WHEN** the LLM calls `device_get` with a non-existent `deviceId`
- **THEN** the tool returns `{ content: [...], isError: true }` with a 404 error message

### Requirement: Device update
The MCP server SHALL expose a tool `device_update` that calls `PATCH /coremgr/api/v1/device/{deviceId}` and accepts optional `networkId`, `networkAddr`, `profile`, `name`, and `info`.

#### Scenario: Update device profile and name
- **WHEN** the LLM calls `device_update` with `deviceId`, `profile`, and `name`
- **THEN** the tool sends `{ data: { profile, name } }` and returns `{ content: [{ type: "text", text: "updated" }] }` on HTTP 204

### Requirement: Device deletion
The MCP server SHALL expose a tool `device_delete` that calls `DELETE /coremgr/api/v1/device/{deviceId}`.

#### Scenario: Delete existing device
- **WHEN** the LLM calls `device_delete` with a valid `deviceId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204
