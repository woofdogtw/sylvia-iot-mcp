## ADDED Requirements

### Requirement: Network route creation
The MCP server SHALL expose a tool `network_route_create` that calls `POST /coremgr/api/v1/network-route` and accepts required `networkId` (string) and `applicationId` (string).

#### Scenario: Create a network route
- **WHEN** the LLM calls `network_route_create` with `networkId` and `applicationId`
- **THEN** the tool sends `{ data: { networkId, applicationId } }` and returns `{ data: { routeId } }` as JSON

#### Scenario: Route already exists
- **WHEN** the LLM calls `network_route_create` with a network-application pair that already has a route
- **THEN** the tool returns `{ content: [...], isError: true }` with error code `err_broker_route_exist`

### Requirement: Network route count
The MCP server SHALL expose a tool `network_route_count` that calls `GET /coremgr/api/v1/network-route/count` and accepts required `unit` (unitId for normal users), optional `application` (applicationId), and optional `network` (networkId).

#### Scenario: Count network routes in a unit
- **WHEN** the LLM calls `network_route_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Network route list
The MCP server SHALL expose a tool `network_route_list` that calls `GET /coremgr/api/v1/network-route/list` and accepts required `unit`, optional `application`, `network`, `offset`, `limit`, and `sort`.

#### Scenario: List network routes in a unit
- **WHEN** the LLM calls `network_route_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `network:asc,created:asc` with up to 100 items; each item includes `routeId`, `unitId`, `applicationId`, `applicationCode`, `networkId`, `networkCode`, `createdAt`

### Requirement: Network route deletion
The MCP server SHALL expose a tool `network_route_delete` that calls `DELETE /coremgr/api/v1/network-route/{routeId}`.

#### Scenario: Delete existing network route
- **WHEN** the LLM calls `network_route_delete` with a valid `routeId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204
