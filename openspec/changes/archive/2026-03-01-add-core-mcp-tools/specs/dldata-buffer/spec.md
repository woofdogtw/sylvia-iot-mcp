## ADDED Requirements

### Requirement: Downlink data buffer count
The MCP server SHALL expose a tool `dldata_buffer_count` that calls `GET /coremgr/api/v1/dldata-buffer/count` and accepts required `unit` (unitId for normal users), optional `application` (applicationId), optional `network` (networkId), and optional `device` (deviceId).

#### Scenario: Count buffered downlink data items
- **WHEN** the LLM calls `dldata_buffer_count` with `unit`
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Downlink data buffer list
The MCP server SHALL expose a tool `dldata_buffer_list` that calls `GET /coremgr/api/v1/dldata-buffer/list` and accepts required `unit`, optional `application`, `network`, `device`, `offset`, `limit`, and `sort`.

#### Scenario: List buffered downlink data items
- **WHEN** the LLM calls `dldata_buffer_list` with `unit`
- **THEN** the tool returns `{ data: [...] }` sorted by `application:asc,created:asc` with up to 100 items; each item includes `dataId`, `unitId`, `applicationId`, `applicationCode`, `deviceId`, `networkId`, `networkAddr`, `createdAt`, `expiredAt`

### Requirement: Downlink data buffer deletion
The MCP server SHALL expose a tool `dldata_buffer_delete` that calls `DELETE /coremgr/api/v1/dldata-buffer/{dataId}`.

#### Scenario: Delete a buffered downlink data item
- **WHEN** the LLM calls `dldata_buffer_delete` with a valid `dataId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204
