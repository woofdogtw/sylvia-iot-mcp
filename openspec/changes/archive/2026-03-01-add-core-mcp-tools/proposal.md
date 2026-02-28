## Why

Sylvia-IoT platform users need to manage their IoT resources (units, applications, networks,
devices, routes) programmatically via LLM agents. Exposing the coremgr REST APIs as MCP tools
enables AI-assisted management without requiring users to call HTTP APIs directly.

## What Changes

- **New MCP server project**: `@modelcontextprotocol/sdk` stdio server — spawned as a child process by the MCP client; no HTTP port required
- **OAuth2 client_credentials auth**: Token auto-fetched and cached in memory using `SYLVIA_IOT_CLIENT_ID` / `SYLVIA_IOT_CLIENT_SECRET` from env
- **MCP tools** covering the coremgr API surface available to a normal user with `dev` role:
  - Auth: tokeninfo, current user profile (read/update)
  - Client: full CRUD (dev role required; only private clients expose secrets)
  - Unit: full CRUD
  - Application: full CRUD + queue stats + send downlink data
  - Network: full CRUD + queue stats + simulate uplink data
  - Device: full CRUD + bulk create/delete by list and by address range
  - Device Route: create/list/count/delete + bulk by list and by address range
  - Network Route: create/list/count/delete
  - DL Data Buffer: list/count/delete
  - Data query (read-only, via data service): application-uldata, application-dldata, network-uldata, network-dldata, coremgr-opdata
- **No user-management tools**: creating/listing/deleting other users is admin-only and out of scope

## Capabilities

### New Capabilities

- `auth`: Tokeninfo and current-user profile tools
- `client`: OAuth2 client management tools
- `unit`: Unit management tools
- `application`: Application management tools including queue stats and downlink data
- `network`: Network management tools including queue stats and uplink data simulation
- `device`: Device management tools including bulk operations
- `device-route`: Device route management tools including bulk operations
- `network-route`: Network route management tools
- `dldata-buffer`: Downlink data buffer read and delete tools
- `data`: Read-only data query tools (application/network ul/dl data and coremgr operation logs)

### Modified Capabilities

_(none — this is the initial implementation)_

## Impact

- **New code**: `src/` (auth, api helper, tool modules, server, index)
- **New config**: `.env.example`, `package.json`
- **Dependencies**: `@modelcontextprotocol/sdk`, `zod`
- **External**: requires a running sylvia-iot-core instance and a registered private OAuth2 client with `client_credentials` grant enabled
- **Test infrastructure**: `skills/sylvia-iot-services/` (copied from sylvia-iot-gui-genai) provides start/stop scripts for RabbitMQ, EMQX, and sylvia-iot-core
