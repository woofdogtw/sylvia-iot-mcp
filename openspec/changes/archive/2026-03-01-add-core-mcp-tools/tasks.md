## 1. Project Setup

- [x] 1.1 Update `package.json`: remove `express` dependency, keep `@modelcontextprotocol/sdk` and `zod`
- [x] 1.2 Run `npm install` to install dependencies
- [x] 1.3 Create `.env.example` with `SYLVIA_IOT_AUTH_URL`, `SYLVIA_IOT_COREMGR_URL`, `SYLVIA_IOT_DATA_URL`, `SYLVIA_IOT_CLIENT_ID`, `SYLVIA_IOT_CLIENT_SECRET`

## 2. Auth and API Helpers

- [x] 2.1 Create `src/auth.js`: module-level token cache, `getToken()` using `client_credentials` grant from `SYLVIA_IOT_AUTH_URL/oauth2/token`, also export `request(method, path, { params, body })` for auth service endpoints (e.g. tokeninfo at `{AUTH_URL}/auth/api/v1/auth/tokeninfo`), invalidate cache on 401
- [x] 2.2 Create `src/coremgr.js`: `request(method, path, { params, body })` — prepend `SYLVIA_IOT_COREMGR_URL`, call `getToken()`, strip undefined/null/empty params, return parsed JSON or null on 204, throw `{ status, code, message }` on error
- [x] 2.3 Create `src/data.js`: same pattern as `coremgr.js` but with `SYLVIA_IOT_DATA_URL` (data service, not proxied through coremgr)

## 3. Tool Modules

- [x] 3.1 Create `src/tools/auth.js`: export `registerAuthTools(server)` — register `auth_tokeninfo`, `user_get`, `user_update`
- [x] 3.2 Create `src/tools/client.js`: export `registerClientTools(server)` — register `client_create`, `client_count`, `client_list`, `client_get`, `client_update`, `client_delete`
- [x] 3.3 Create `src/tools/unit.js`: export `registerUnitTools(server)` — register `unit_create`, `unit_count`, `unit_list`, `unit_get`, `unit_update`, `unit_delete`
- [x] 3.4 Create `src/tools/application.js`: export `registerApplicationTools(server)` — register `application_create`, `application_count`, `application_list`, `application_get`, `application_update`, `application_delete`, `application_stats`, `application_send_dldata`
- [x] 3.5 Create `src/tools/network.js`: export `registerNetworkTools(server)` — register `network_create`, `network_count`, `network_list`, `network_get`, `network_update`, `network_delete`, `network_stats`, `network_send_uldata`
- [x] 3.6 Create `src/tools/device.js`: export `registerDeviceTools(server)` — register `device_create`, `device_bulk_create`, `device_bulk_delete`, `device_range_create`, `device_range_delete`, `device_count`, `device_list`, `device_get`, `device_update`, `device_delete`
- [x] 3.7 Create `src/tools/device-route.js`: export `registerDeviceRouteTools(server)` — register `device_route_create`, `device_route_bulk_create`, `device_route_bulk_delete`, `device_route_range_create`, `device_route_range_delete`, `device_route_count`, `device_route_list`, `device_route_delete`
- [x] 3.8 Create `src/tools/network-route.js`: export `registerNetworkRouteTools(server)` — register `network_route_create`, `network_route_count`, `network_route_list`, `network_route_delete`
- [x] 3.9 Create `src/tools/dldata-buffer.js`: export `registerDldataBufferTools(server)` — register `dldata_buffer_count`, `dldata_buffer_list`, `dldata_buffer_delete`
- [x] 3.10 Create `src/tools/data.js`: export `registerDataTools(server)` — register `data_application_uldata_count`, `data_application_uldata_list`, `data_application_dldata_count`, `data_application_dldata_list`, `data_network_uldata_count`, `data_network_uldata_list`, `data_network_dldata_count`, `data_network_dldata_list`, `data_coremgr_opdata_count`, `data_coremgr_opdata_list`

## 4. Server Entry Point

- [x] 4.1 Create `src/server.js`: instantiate `McpServer`, import and call all `registerXxxTools()` functions, export the server instance
- [x] 4.2 Create `src/index.js`: import server, create `StdioServerTransport`, call `server.connect(transport)`

## 5. End-to-End Tests

- [x] 5.1 Start sylvia-iot-core services using the `sylvia-iot-services` skill
- [x] 5.2 Register a private OAuth2 client with `client_credentials` grant enabled; save `clientId` and `clientSecret`
- [x] 5.3 Create `.env` from `.env.example` and fill in the credentials
- [x] 5.4 Verify the server starts without error: `node src/index.js`
- [x] 5.5 Test auth tools: call `auth_tokeninfo` and `user_get` via MCP client
- [x] 5.6 Test unit tools: `unit_create` → `unit_list` → `unit_get` → `unit_update` → `unit_delete`
- [x] 5.7 Test application tools: create unit first, then `application_create` → `application_stats` → `application_send_dldata` → `application_delete`
- [x] 5.8 Test network tools: `network_create` → `network_stats` → `network_send_uldata` → `network_delete`
- [x] 5.9 Test device tools including bulk and range operations
- [x] 5.10 Test device-route tools including bulk and range operations
- [x] 5.11 Test network-route tools: create, list, count, delete
- [x] 5.12 Test dldata-buffer tools: list and delete buffered items
- [x] 5.13 Test data tools: query application-uldata, application-dldata, network-uldata, network-dldata, coremgr-opdata
- [x] 5.14 Test client tools: `client_create` (with `credentials: true`) → `client_list` → `client_get` → `client_update` (with `regenSecret: true`) → `client_delete`
