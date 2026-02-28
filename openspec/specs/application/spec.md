# Application Capability Spec

## Purpose

Exposes MCP tools for managing applications via the Sylvia-IoT coremgr API. Covers application creation, count, listing, retrieval, update, deletion, queue statistics, and sending downlink data.

## Requirements

### Requirement: Application creation
The MCP server SHALL expose a tool `application_create` that calls `POST /coremgr/api/v1/application` and accepts required `code` (string), `unitId` (string), `hostUri` (string), optional `name` (string), optional `info` (object), optional `ttl` (number, AMQP message TTL in ms), and optional `length` (number, AMQP max queue length).

#### Scenario: Create an application
- **WHEN** the LLM calls `application_create` with `code`, `unitId`, and `hostUri`
- **THEN** the tool sends `{ data: { code, unitId, hostUri, name?, info?, ttl?, length? } }` and returns `{ data: { applicationId, password } }` as JSON; note the password is returned only once

#### Scenario: Duplicate application code in unit
- **WHEN** the LLM calls `application_create` with a `code` already used in that unit
- **THEN** the tool returns `{ content: [...], isError: true }` with error code `err_broker_application_exist`

### Requirement: Application count
The MCP server SHALL expose a tool `application_count` that calls `GET /coremgr/api/v1/application/count` and accepts required `unit` (unitId for normal users) and optional `contains` (string).

#### Scenario: Count applications in a unit
- **WHEN** the LLM calls `application_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Application list
The MCP server SHALL expose a tool `application_list` that calls `GET /coremgr/api/v1/application/list` and accepts required `unit` (unitId for normal users), optional `contains`, `offset`, `limit`, and `sort`.

#### Scenario: List applications in a unit
- **WHEN** the LLM calls `application_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `code:asc` with up to 100 items; each item includes `applicationId`, `code`, `unitId`, `unitCode`, `createdAt`, `modifiedAt`, `hostUri`, `name`, `info`

### Requirement: Application retrieval
The MCP server SHALL expose a tool `application_get` that calls `GET /coremgr/api/v1/application/{applicationId}` and returns application details including AMQP-specific `ttl` and `length` when present.

#### Scenario: Get existing application
- **WHEN** the LLM calls `application_get` with a valid `applicationId`
- **THEN** the tool returns the application object as formatted JSON

#### Scenario: Application not found
- **WHEN** the LLM calls `application_get` with a non-existent `applicationId`
- **THEN** the tool returns `{ content: [...], isError: true }` with a 404 error message

### Requirement: Application update
The MCP server SHALL expose a tool `application_update` that calls `PATCH /coremgr/api/v1/application/{applicationId}` and accepts optional `hostUri`, `name`, `info`, `ttl`, `length`, and `password` (required when changing `hostUri`).

#### Scenario: Update application host URI
- **WHEN** the LLM calls `application_update` with `applicationId`, `hostUri`, and `password`
- **THEN** the tool sends `{ data: { hostUri, password } }` and returns `{ content: [{ type: "text", text: "updated" }] }` on HTTP 204

#### Scenario: Update display name only
- **WHEN** the LLM calls `application_update` with `applicationId` and `name`
- **THEN** the tool sends `{ data: { name } }` and returns updated confirmation

### Requirement: Application deletion
The MCP server SHALL expose a tool `application_delete` that calls `DELETE /coremgr/api/v1/application/{applicationId}`.

#### Scenario: Delete existing application
- **WHEN** the LLM calls `application_delete` with a valid `applicationId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204

### Requirement: Application queue statistics
The MCP server SHALL expose a tool `application_stats` that calls `GET /coremgr/api/v1/application/{applicationId}/stats` and returns queue statistics for `uldata`, `dldataResp`, and `dldataResult` queues.

#### Scenario: Get queue stats
- **WHEN** the LLM calls `application_stats` with a valid `applicationId`
- **THEN** the tool returns `{ data: { uldata: { consumers, messages, publishRate, deliverRate }, dldataResp: {...}, dldataResult: {...} } }` as JSON

### Requirement: Send application downlink data
The MCP server SHALL expose a tool `application_send_dldata` that calls `POST /coremgr/api/v1/application/{applicationId}/dldata` and accepts `applicationId`, `deviceId` (string), and `payload` (hexadecimal string).

#### Scenario: Send downlink data to a device
- **WHEN** the LLM calls `application_send_dldata` with `applicationId`, `deviceId`, and `payload`
- **THEN** the tool sends `{ data: { deviceId, payload } }` and returns `{ content: [{ type: "text", text: "sent" }] }` on HTTP 204
