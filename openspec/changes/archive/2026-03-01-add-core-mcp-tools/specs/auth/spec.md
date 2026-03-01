## ADDED Requirements

### Requirement: Token info retrieval
The MCP server SHALL expose a tool `auth_tokeninfo` that calls `GET {AUTH_URL}/api/v1/auth/tokeninfo` (directly to the auth service, not through coremgr; note: AUTH_URL already includes the `/auth` prefix) and returns the token's associated user ID, account, display name, roles, client ID, and scopes as JSON.

#### Scenario: Successful token info retrieval
- **WHEN** the LLM calls `auth_tokeninfo` with no parameters
- **THEN** the tool returns `{ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }` where `data` contains `userId`, `account`, `name`, `roles`, `clientId`, and `scopes`

#### Scenario: Token expired
- **WHEN** the upstream API returns 401
- **THEN** the MCP server re-fetches the token once and retries; if still 401, returns `{ content: [...], isError: true }` with the error message

### Requirement: Current user profile retrieval
The MCP server SHALL expose a tool `user_get` that calls `GET /coremgr/api/v1/user` and returns the authenticated user's profile (account, createdAt, modifiedAt, verifiedAt, roles, name, info).

#### Scenario: Successful user profile retrieval
- **WHEN** the LLM calls `user_get` with no parameters
- **THEN** the tool returns the user profile fields as formatted JSON

### Requirement: Current user profile update
The MCP server SHALL expose a tool `user_update` that calls `PATCH /coremgr/api/v1/user` and accepts optional fields `password`, `name`, and `info`.

#### Scenario: Successful user profile update
- **WHEN** the LLM calls `user_update` with at least one of `password`, `name`, or `info`
- **THEN** the tool sends `{ data: { password?, name?, info? } }` to the API and returns `{ content: [{ type: "text", text: "updated" }] }` on HTTP 204

#### Scenario: Update with no fields provided
- **WHEN** the LLM calls `user_update` with no parameters at all
- **THEN** the tool returns `{ content: [...], isError: true }` indicating at least one field is required
