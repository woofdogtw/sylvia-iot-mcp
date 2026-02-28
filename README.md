# sylvia-iot-mcp

An [MCP](https://modelcontextprotocol.io) server that exposes [sylvia-iot-core](https://github.com/woofdogtw/sylvia-iot-core) management APIs as tools for AI assistants (Claude, etc.).

> **Note:** This project is a practice ground for AI-assisted development using [Claude Code](https://claude.ai/claude-code) with a spec-driven workflow powered by [OpenSpec](https://github.com/Fission-AI/OpenSpec).

## Features

66 tools across 10 capability areas:

| Category | Tools |
|---|---|
| Auth | `auth_tokeninfo`, `user_get`, `user_update` |
| OAuth2 Clients | `client_create/count/list/get/update/delete` |
| Units | `unit_create/count/list/get/update/delete` |
| Applications | `application_create/count/list/get/update/delete/stats`, `application_send_dldata` |
| Networks | `network_create/count/list/get/update/delete/stats`, `network_send_uldata` |
| Devices | `device_create/count/list/get/update/delete`, bulk and range create/delete |
| Device Routes | `device_route_create/count/list/delete`, bulk and range create/delete |
| Network Routes | `network_route_create/count/list/delete` |
| Downlink Buffer | `dldata_buffer_count/list/delete` |
| Data | application/network uplink/downlink data counts and lists, coremgr operation logs |

## Requirements

- Node.js >= 18
- A running sylvia-iot-core instance
- An OAuth2 client with `client_credentials` grant enabled

## Setup

### 1. Create an OAuth2 client

The MCP server authenticates to sylvia-iot-core using the `client_credentials` grant. You need a **private** (confidential) client with this grant enabled.

If you have admin access, you can create one via the sylvia-iot-auth API or management UI.

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```sh
cp .env.example .env
```

```
SYLVIA_IOT_AUTH_URL=http://your-host/auth
SYLVIA_IOT_COREMGR_URL=http://your-host/coremgr
SYLVIA_IOT_DATA_URL=http://your-host/data
SYLVIA_IOT_CLIENT_ID=your-client-id
SYLVIA_IOT_CLIENT_SECRET=your-client-secret
```

The URL defaults point to a local sylvia-iot-core instance started with default settings.

### 3. Run the server

```sh
npm install
node src/index.js
```

## Claude Code / Claude Desktop Integration

Add the server to your MCP config (e.g. `~/.claude.json` for Claude Code):

```json
{
  "mcpServers": {
    "sylvia-iot": {
      "command": "node",
      "args": ["/path/to/sylvia-iot-mcp/src/index.js"],
      "env": {
        "SYLVIA_IOT_AUTH_URL": "http://your-host/auth",
        "SYLVIA_IOT_COREMGR_URL": "http://your-host/coremgr",
        "SYLVIA_IOT_DATA_URL": "http://your-host/data",
        "SYLVIA_IOT_CLIENT_ID": "your-client-id",
        "SYLVIA_IOT_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Once connected, you can manage your IoT platform conversationally:

> "List all units", "Create a new application for unit X", "Show me the latest uplink data from network Y"

## Authentication

The server uses OAuth2 `client_credentials` grant to obtain a bearer token. The token is cached in memory and refreshed automatically on expiry or 401 responses. No user login is required.

## Development

```sh
# Watch mode
npm run dev

# Run end-to-end tests (requires running sylvia-iot-core)
node test-mcp.mjs
```
