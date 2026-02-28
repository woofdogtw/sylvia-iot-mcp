## Context

This is a greenfield MCP server project. The sylvia-iot-core platform exposes REST APIs through
three services (auth, coremgr, data). The target users are platform users with a `dev` role who
manage their own IoT resources. Each user runs their own instance of this MCP server locally,
configured with their own `client_id` and `client_secret` via environment variables — the same
pattern as GitLab MCP and other single-user MCP tools.

## Goals / Non-Goals

**Goals:**
- Expose all user-accessible coremgr and data APIs as MCP tools
- Auto-manage OAuth2 tokens (fetch, cache, refresh) transparently
- stdio transport for seamless integration with Claude Code and Claude Desktop
- Self-contained project (skills, scripts) so contributors can run locally after cloning

**Non-Goals:**
- Multi-tenant or shared-server deployment
- Persistent token storage (DB) — in-memory cache is sufficient per process lifetime
- Admin-level user management (create/list/delete other users)
- HTTP server or exposed network port

## Decisions

### D1: stdio transport

The server communicates with the MCP client via stdin/stdout. The MCP client (Claude Code /
Claude Desktop) spawns the server process and manages its lifecycle.

**Rationale**: No TCP port, no network exposure, no session management. Credentials stay in the
user's local MCP config file. Process isolation means each user's credentials are completely
separate. Matches the standard pattern for single-user MCP tools (GitLab MCP, filesystem MCP).

**Alternative considered**: Streamable HTTP for remote/shared deployment. Rejected for initial
implementation — adds HTTP server complexity, multi-tenant auth, and token DB without clear
benefit for the primary use case of personal local usage.

### D2: Module-level in-memory token cache

`src/auth.js` exports `getToken()` which holds the cached token and expiry time in module-level
variables. On 401 responses from upstream APIs, the token is invalidated and re-fetched.

**Rationale**: The process is single-user and typically short-lived. In-memory cache eliminates
DB dependency entirely. On process restart (which the MCP client handles automatically), a new
token is fetched — the extra round-trip is negligible.

**Alternative considered**: Persist token to a local file / SQLite between restarts. Rejected as
unnecessary complexity: `client_credentials` tokens are cheap to fetch and the MCP client restarts
the server process infrequently.

### D3: Three API helper modules — `src/auth.js`, `src/coremgr.js`, and `src/data.js`

`src/auth.js` serves dual purposes: it manages the token cache (`getToken()`) and also exports
a `request(method, path, { params, body })` function for calling auth service endpoints directly
(e.g. `GET /auth/api/v1/auth/tokeninfo`). The auth service is NOT proxied through coremgr.

`src/coremgr.js` and `src/data.js` each export a `request(method, path, { params, body })`
function that:
1. Calls `getToken()` to obtain a valid Bearer token
2. Builds the full URL from the respective env var (`SYLVIA_IOT_COREMGR_URL` / `SYLVIA_IOT_DATA_URL`)
3. Strips `undefined` / `null` / `''` query params before sending
4. Returns the parsed JSON body, or `null` for 204 responses
5. Throws an error with `{ status, code, message }` on non-2xx; invalidates token cache on 401

API routing summary:
- `auth_tokeninfo` → `src/auth.js` → `{AUTH_URL}/auth/api/v1/auth/tokeninfo`
- user, client, unit, application, network, device, device-route, network-route, dldata-buffer → `src/coremgr.js` → `{COREMGR_URL}/api/v1/...`
- data queries → `src/data.js` → `{DATA_URL}/api/v1/...`

**Rationale**: The auth service's tokeninfo endpoint is a first-party auth concern and is not
wrapped by coremgr. Data queries bypass coremgr entirely. Separating the three helpers keeps each
module's base URL and responsibility clear.

### D4: One tool module per capability, each exporting `registerXxxTools(server)`

Tool modules under `src/tools/` receive the `McpServer` instance and call `server.registerTool()`
for every tool in their domain. All modules are imported and called from `src/server.js`.

**Rationale**: Keeps files small and focused. New capabilities can be added by creating a new
module and one import line in `src/server.js`.

### D5: Tool return format — JSON text for success, `isError: true` for API errors

Success: `{ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }`
API error: `{ content: [{ type: 'text', text: errorMessage }], isError: true }`

**Rationale**: Using `isError: true` (rather than throwing) lets the LLM see the error message
and potentially recover, instead of receiving an opaque exception. Structured JSON is directly
readable by the LLM.

### D6: Zod schemas for all tool input parameters

Each tool declares its input schema as a Zod raw shape passed to `server.registerTool()`.
Optional parameters use `.optional()` and include `.describe()` for LLM discoverability.

**Rationale**: The MCP SDK validates inputs against Zod schemas before calling the handler,
eliminating manual validation code. Descriptions improve LLM tool-selection accuracy.

## Risks / Trade-offs

- **Token lost on process restart**: The MCP client may restart the server process (e.g., on
  config reload). A new `client_credentials` token fetch is required on each startup.
  → Mitigation: `client_credentials` token fetches are fast and cheap; acceptable overhead.

- **No retry on upstream API failure**: Tool errors are returned as `isError: true` to the LLM.
  → Mitigation: The LLM can instruct the user to retry, or the user can re-invoke the tool.
  → Exception: 401 responses automatically trigger one token re-fetch and retry.
