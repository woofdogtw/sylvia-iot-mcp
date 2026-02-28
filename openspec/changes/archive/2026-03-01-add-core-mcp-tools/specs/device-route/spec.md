## ADDED Requirements

### Requirement: Device route creation
The MCP server SHALL expose a tool `device_route_create` that calls `POST /coremgr/api/v1/device-route` and accepts required `deviceId` (string) and `applicationId` (string). The device and application must belong to the same unit.

#### Scenario: Create a device route
- **WHEN** the LLM calls `device_route_create` with `deviceId` and `applicationId`
- **THEN** the tool sends `{ data: { deviceId, applicationId } }` and returns `{ data: { routeId } }` as JSON

#### Scenario: Route already exists
- **WHEN** the LLM calls `device_route_create` with a device-application pair that already has a route
- **THEN** the tool returns `{ content: [...], isError: true }` with error code `err_broker_route_exist`

#### Scenario: Unit mismatch
- **WHEN** the LLM calls `device_route_create` with a device and application from different units
- **THEN** the tool returns `{ content: [...], isError: true }` with error code `err_broker_unit_not_match`

### Requirement: Bulk device route creation by address list
The MCP server SHALL expose a tool `device_route_bulk_create` that calls `POST /coremgr/api/v1/device-route/bulk` and accepts required `applicationId` (string), `networkId` (string), and `networkAddrs` (string array, max 1024). Existing routes are silently skipped.

#### Scenario: Bulk create device routes by address list
- **WHEN** the LLM calls `device_route_bulk_create` with `applicationId`, `networkId`, and `networkAddrs`
- **THEN** the tool sends `{ data: { applicationId, networkId, networkAddrs } }` and returns `{ content: [{ type: "text", text: "created" }] }` on HTTP 204

### Requirement: Bulk device route deletion by address list
The MCP server SHALL expose a tool `device_route_bulk_delete` that calls `POST /coremgr/api/v1/device-route/bulk-delete` and accepts required `applicationId` (string), `networkId` (string), and `networkAddrs` (string array, max 1024).

#### Scenario: Bulk delete device routes by address list
- **WHEN** the LLM calls `device_route_bulk_delete` with `applicationId`, `networkId`, and `networkAddrs`
- **THEN** the tool sends `{ data: { applicationId, networkId, networkAddrs } }` and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204

### Requirement: Bulk device route creation by address range
The MCP server SHALL expose a tool `device_route_range_create` that calls `POST /coremgr/api/v1/device-route/range` and accepts required `applicationId` (string), `networkId` (string), `startAddr` (hex string), and `endAddr` (hex string, same length as startAddr). Max 1024 devices. Existing routes are silently skipped.

#### Scenario: Bulk create device routes by hex range
- **WHEN** the LLM calls `device_route_range_create` with `applicationId`, `networkId`, `startAddr`, and `endAddr`
- **THEN** the tool sends `{ data: { applicationId, networkId, startAddr, endAddr } }` and returns `{ content: [{ type: "text", text: "created" }] }` on HTTP 204

### Requirement: Bulk device route deletion by address range
The MCP server SHALL expose a tool `device_route_range_delete` that calls `POST /coremgr/api/v1/device-route/range-delete` and accepts required `applicationId` (string), `networkId` (string), `startAddr` (hex string), and `endAddr` (hex string). Max 1024 devices.

#### Scenario: Bulk delete device routes by hex range
- **WHEN** the LLM calls `device_route_range_delete` with `applicationId`, `networkId`, `startAddr`, and `endAddr`
- **THEN** the tool sends `{ data: { applicationId, networkId, startAddr, endAddr } }` and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204

### Requirement: Device route count
The MCP server SHALL expose a tool `device_route_count` that calls `GET /coremgr/api/v1/device-route/count` and accepts required `unit` (unitId for normal users), optional `application` (applicationId), optional `network` (networkId), and optional `device` (deviceId).

#### Scenario: Count device routes in a unit
- **WHEN** the LLM calls `device_route_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Device route list
The MCP server SHALL expose a tool `device_route_list` that calls `GET /coremgr/api/v1/device-route/list` and accepts required `unit`, optional `application`, `network`, `device`, `offset`, `limit`, and `sort`.

#### Scenario: List device routes in a unit
- **WHEN** the LLM calls `device_route_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `network:asc,addr:asc,created:desc` with up to 100 items; each item includes `routeId`, `unitId`, `applicationId`, `applicationCode`, `deviceId`, `networkId`, `networkCode`, `networkAddr`, `profile`, `createdAt`, `modifiedAt`

### Requirement: Device route deletion
The MCP server SHALL expose a tool `device_route_delete` that calls `DELETE /coremgr/api/v1/device-route/{routeId}`.

#### Scenario: Delete existing device route
- **WHEN** the LLM calls `device_route_delete` with a valid `routeId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204
