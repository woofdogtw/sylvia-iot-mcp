# Unit Capability Spec

## Purpose

Exposes MCP tools for managing units via the Sylvia-IoT coremgr/broker API. Covers unit creation, count, listing, retrieval, update, and deletion.

## Requirements

### Requirement: Unit creation
The MCP server SHALL expose a tool `unit_create` that calls `POST /coremgr/api/v1/unit` and accepts required `code` (string, pattern `[A-Za-z0-9][A-Za-z0-9-_]*`), optional `name` (string), and optional `info` (object).

#### Scenario: Create a unit
- **WHEN** the LLM calls `unit_create` with `code: "sylvia"` and optional `name`
- **THEN** the tool sends `{ data: { code, name?, info? } }` and returns `{ data: { unitId } }` as JSON

#### Scenario: Duplicate unit code
- **WHEN** the LLM calls `unit_create` with a `code` that is already in use
- **THEN** the tool returns `{ content: [...], isError: true }` with error code `err_broker_unit_exist`

### Requirement: Unit count
The MCP server SHALL expose a tool `unit_count` that calls `GET /coremgr/api/v1/unit/count` and accepts optional `contains` (string) to filter by code substring.

#### Scenario: Count own units
- **WHEN** the LLM calls `unit_count` with no parameters
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Unit list
The MCP server SHALL expose a tool `unit_list` that calls `GET /coremgr/api/v1/unit/list` and accepts optional `contains` (string), `offset` (number), `limit` (number), and `sort` (string).

#### Scenario: List own units
- **WHEN** the LLM calls `unit_list` with no parameters
- **THEN** the tool returns `{ data: [...] }` sorted by `code:asc` with up to 100 items; each item includes `unitId`, `code`, `createdAt`, `modifiedAt`, `ownerId`, `memberIds`, `name`, `info`

### Requirement: Unit retrieval
The MCP server SHALL expose a tool `unit_get` that calls `GET /coremgr/api/v1/unit/{unitId}`.

#### Scenario: Get existing unit
- **WHEN** the LLM calls `unit_get` with a valid `unitId`
- **THEN** the tool returns the unit object as formatted JSON

#### Scenario: Unit not found
- **WHEN** the LLM calls `unit_get` with a non-existent `unitId`
- **THEN** the tool returns `{ content: [...], isError: true }` with a 404 error message

### Requirement: Unit update
The MCP server SHALL expose a tool `unit_update` that calls `PATCH /coremgr/api/v1/unit/{unitId}` and accepts optional `name` (string) and optional `info` (object).

#### Scenario: Update unit display name
- **WHEN** the LLM calls `unit_update` with `unitId` and `name`
- **THEN** the tool sends `{ data: { name } }` and returns `{ content: [{ type: "text", text: "updated" }] }` on HTTP 204

### Requirement: Unit deletion
The MCP server SHALL expose a tool `unit_delete` that calls `DELETE /coremgr/api/v1/unit/{unitId}` and deletes the unit along with all its resources.

#### Scenario: Delete existing unit
- **WHEN** the LLM calls `unit_delete` with a valid `unitId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204
