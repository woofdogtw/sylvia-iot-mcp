## ADDED Requirements

### Requirement: Client creation
The MCP server SHALL expose a tool `client_create` that calls `POST /coremgr/api/v1/client` and accepts `redirectUris` (string array), `scopes` (string array), `name` (string), optional `image` (string), and optional `credentials` (boolean, default false to create without secret; set true for a private client with secret).

#### Scenario: Create a private client with credentials
- **WHEN** the LLM calls `client_create` with `redirectUris`, `scopes`, `name`, and `credentials: true`
- **THEN** the tool sends `{ data: { redirectUris, scopes, name }, credentials: true }` and returns `{ data: { clientId } }` as JSON; the `clientSecret` is only visible in subsequent `client_get` or `client_list` calls

#### Scenario: Create a public client without secret
- **WHEN** the LLM calls `client_create` with `redirectUris`, `scopes`, and `name` but omits `credentials`
- **THEN** the tool sends `{ data: { redirectUris, scopes, name } }` and returns `{ data: { clientId } }` as JSON

### Requirement: Client count
The MCP server SHALL expose a tool `client_count` that calls `GET /coremgr/api/v1/client/count` and returns the number of clients owned by the current user.

#### Scenario: Count own clients
- **WHEN** the LLM calls `client_count` with no parameters
- **THEN** the tool returns `{ data: { count: N } }` as JSON

### Requirement: Client list
The MCP server SHALL expose a tool `client_list` that calls `GET /coremgr/api/v1/client/list` and accepts optional `offset` (number), `limit` (number), and `sort` (string).

#### Scenario: List own clients with defaults
- **WHEN** the LLM calls `client_list` with no parameters
- **THEN** the tool returns `{ data: [...] }` sorted by `name:asc` with up to 100 items

#### Scenario: List clients with pagination
- **WHEN** the LLM calls `client_list` with `offset: 20` and `limit: 10`
- **THEN** the tool passes these query params and returns the paginated slice

### Requirement: Client retrieval
The MCP server SHALL expose a tool `client_get` that calls `GET /coremgr/api/v1/client/{clientId}` and returns full client details including `clientSecret` (null for public clients).

#### Scenario: Get existing client
- **WHEN** the LLM calls `client_get` with a valid `clientId`
- **THEN** the tool returns the client object including `clientSecret` if private

#### Scenario: Client not found
- **WHEN** the LLM calls `client_get` with a non-existent `clientId`
- **THEN** the tool returns `{ content: [...], isError: true }` with a 404 error message

### Requirement: Client update
The MCP server SHALL expose a tool `client_update` that calls `PATCH /coremgr/api/v1/client/{clientId}` and accepts optional `redirectUris`, `scopes`, `name`, `image`, and `regenSecret` (boolean).

#### Scenario: Update client name
- **WHEN** the LLM calls `client_update` with `clientId` and `name`
- **THEN** the tool sends `{ data: { name } }` and returns `{ content: [{ type: "text", text: "updated" }] }` on HTTP 204

#### Scenario: Regenerate client secret
- **WHEN** the LLM calls `client_update` with `clientId` and `regenSecret: true`
- **THEN** the tool sends `{ regenSecret: true }` and the API rotates the secret

### Requirement: Client deletion
The MCP server SHALL expose a tool `client_delete` that calls `DELETE /coremgr/api/v1/client/{clientId}`.

#### Scenario: Delete existing client
- **WHEN** the LLM calls `client_delete` with a valid `clientId`
- **THEN** the tool sends the DELETE request and returns `{ content: [{ type: "text", text: "deleted" }] }` on HTTP 204
