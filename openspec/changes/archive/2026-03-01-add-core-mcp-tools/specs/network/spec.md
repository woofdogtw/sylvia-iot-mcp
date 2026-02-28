## ADDED Requirements

### Requirement: Network creation
The MCP server SHALL expose a tool `network_create` that calls `POST /coremgr/api/v1/network` and accepts required `code` (string), `unitId` (string or null for public networks), `hostUri` (string), optional `name` (string), optional `info` (object), optional `ttl` (number, AMQP message TTL in ms), and optional `length` (number, AMQP max queue length).

#### Scenario: Create a private network for a unit
- **WHEN** the LLM calls `network_create` with `code`, `unitId`, and `hostUri`
- **THEN** the tool sends `{ data: { code, unitId, hostUri, name?, info?, ttl?, length? } }` and returns `{ data: { networkId, password } }` as JSON; the password is returned only once

#### Scenario: Duplicate network code
- **WHEN** the LLM calls `network_create` with a `code` already in use
- **THEN** the tool returns `{ content: [...], isError: true }` with error code `err_broker_network_exist`

### Requirement: Network count
The MCP server SHALL expose a tool `network_count` that calls `GET /coremgr/api/v1/network/count` and accepts required `unit` (unitId for normal users) and optional `contains` (string).

#### Scenario: Count networks in a unit
- **WHEN** the LLM calls `network_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Network list
The MCP server SHALL expose a tool `network_list` that calls `GET /coremgr/api/v1/network/list` and accepts required `unit` (unitId for normal users), optional `contains`, `offset`, `limit`, and `sort`.

#### Scenario: List networks in a unit
- **WHEN** the LLM calls `network_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `code:asc` with up to 100 items; each item includes `networkId`, `code`, `unitId`, `unitCode`, `createdAt`, `modifiedAt`, `hostUri`, `name`, `info`

### Requirement: Network retrieval
The MCP server SHALL expose a tool `network_get` that calls `GET /coremgr/api/v1/network/{networkId}` and returns network details including AMQP-specific `ttl` and `length` when present.

#### Scenario: Get existing network
- **WHEN** the LLM calls `network_get` with a valid `networkId`
- **THEN** the tool returns the network object as formatted JSON

#### Scenario: Network not found
- **WHEN** the LLM calls `network_get` with a non-existent `networkId`
- **THEN** the tool returns `{ content: [...], isError: true }` with a 404 error message

### Requirement: Network update
The MCP server SHALL expose a tool `network_update` that calls `PATCH /coremgr/api/v1/network/{networkId}` and accepts optional `hostUri`, `name`, `info`, `ttl`, `length`, and `password` (required when changing `hostUri`).

#### Scenario: Update network host URI
- **WHEN** the LLM calls `network_update` with `networkId`, `hostUri`, and `password`
- **THEN** the tool sends `{ data: { hostUri, password } }` and returns `{ content: [{ type: "text", text: "updated" }] }` on HTTP 204

### Requirement: Network deletion
The MCP server SHALL expose a tool `network_delete` that calls `DELETE /coremgr/api/v1/network/{networkId}` and deletes the network along with all its resources.

#### Scenario: Delete existing network
- **WHEN** the LLM calls `network_delete` with a valid `networkId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204

### Requirement: Network queue statistics
The MCP server SHALL expose a tool `network_stats` that calls `GET /coremgr/api/v1/network/{networkId}/stats` and returns queue statistics for the `dldata` queue.

#### Scenario: Get network queue stats
- **WHEN** the LLM calls `network_stats` with a valid `networkId`
- **THEN** the tool returns `{ data: { dldata: { consumers, messages, publishRate, deliverRate } } }` as JSON

### Requirement: Simulate device uplink data
The MCP server SHALL expose a tool `network_send_uldata` that calls `POST /coremgr/api/v1/network/{networkId}/uldata` and accepts `networkId`, `deviceId` (string), and `payload` (hexadecimal string).

#### Scenario: Simulate uplink data from a device
- **WHEN** the LLM calls `network_send_uldata` with `networkId`, `deviceId`, and `payload`
- **THEN** the tool sends `{ data: { deviceId, payload } }` and returns `{ content: [{ type: "text", text: "sent" }] }` on HTTP 204
