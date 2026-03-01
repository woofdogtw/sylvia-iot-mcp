/**
 * MCP stdio test client (newline-delimited JSON protocol).
 */
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = spawn('node', ['src/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  cwd: __dirname,
  env: {
    ...process.env,
    SYLVIA_IOT_AUTH_URL: 'http://localhost:1080/auth',
    SYLVIA_IOT_COREMGR_URL: 'http://localhost:1080/coremgr',
    SYLVIA_IOT_DATA_URL: 'http://localhost:1080/data',
    SYLVIA_IOT_CLIENT_ID: 'private',
    SYLVIA_IOT_CLIENT_SECRET: 'secret',
  },
});

let idSeq = 1;
const pending = new Map();

const rl = createInterface({ input: server.stdout });
rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve } = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg);
    }
  } catch (e) {
    console.error('Failed to parse server line:', line);
  }
});

function send(method, params = {}) {
  const id = idSeq++;
  const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params });
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    server.stdin.write(msg + '\n');
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`Timeout id=${id} method=${method}`));
      }
    }, 10000);
  });
}

function notify(method, params = {}) {
  const msg = JSON.stringify({ jsonrpc: '2.0', method, params });
  server.stdin.write(msg + '\n');
}

function callTool(name, args = {}) {
  return send('tools/call', { name, arguments: args });
}

function assertOk(result, label) {
  if (result.error) throw new Error(`${label} → RPC error: ${JSON.stringify(result.error)}`);
  if (result.result?.isError) throw new Error(`${label} → tool error: ${result.result.content[0]?.text}`);
  const text = result.result?.content?.[0]?.text;
  const parsed = JSON.parse(text);
  const preview = JSON.stringify(parsed).slice(0, 100);
  console.log(`  ✓ ${label}: ${preview}`);
  return parsed;
}

async function main() {
  const init = await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0' },
  });
  console.log('✓ initialize:', init.result?.serverInfo?.name, init.result?.serverInfo?.version);
  notify('notifications/initialized', {});

  const tools = await send('tools/list', {});
  console.log(`✓ tools/list: ${tools.result?.tools?.length} tools registered`);

  console.log('\n── 5.5 Auth tools ──');
  assertOk(await callTool('auth_tokeninfo'), 'auth_tokeninfo');
  assertOk(await callTool('user_get'), 'user_get');

  console.log('\n── 5.6 Unit tools ──');
  const unitCreate = assertOk(await callTool('unit_create', { code: 'testunit', name: 'Test Unit' }), 'unit_create');
  const unitId = unitCreate.data.unitId;
  assertOk(await callTool('unit_list', { owner: 'me' }), 'unit_list');
  assertOk(await callTool('unit_get', { unitId }), 'unit_get');
  assertOk(await callTool('unit_update', { unitId, name: 'Updated Unit' }), 'unit_update');

  console.log('\n── 5.14 Client tools ──');
  const clientCreate = assertOk(await callTool('client_create', {
    redirectUris: ['http://localhost:9000/callback'],
    scopes: [],
    name: 'mcp-test-client',
    credentials: true,
  }), 'client_create');
  const clientId = clientCreate.data.clientId;
  assertOk(await callTool('client_list', {}), 'client_list');
  assertOk(await callTool('client_get', { clientId }), 'client_get');
  assertOk(await callTool('client_update', { clientId, name: 'mcp-test-client-updated' }), 'client_update');
  assertOk(await callTool('client_delete', { clientId }), 'client_delete');

  console.log('\n── 5.7 Application tools ──');
  const appCreate = assertOk(await callTool('application_create', {
    code: 'testapp', unitId, hostUri: 'mqtt://localhost', name: 'Test App',
  }), 'application_create');
  const applicationId = appCreate.data.applicationId;
  assertOk(await callTool('application_list', { unit: unitId }), 'application_list');
  assertOk(await callTool('application_get', { applicationId }), 'application_get');
  assertOk(await callTool('application_stats', { applicationId }), 'application_stats');
  assertOk(await callTool('application_update', { applicationId, name: 'Test App Updated' }), 'application_update');

  console.log('\n── 5.8 Network tools ──');
  const netCreate = assertOk(await callTool('network_create', {
    code: 'testnet', unitId, hostUri: 'mqtt://localhost', name: 'Test Net',
  }), 'network_create');
  const networkId = netCreate.data.networkId;
  assertOk(await callTool('network_list', { unit: unitId }), 'network_list');
  assertOk(await callTool('network_get', { networkId }), 'network_get');
  assertOk(await callTool('network_stats', { networkId }), 'network_stats');
  assertOk(await callTool('network_update', { networkId, name: 'Test Net Updated' }), 'network_update');

  console.log('\n── 5.9 Device tools ──');
  const devCreate = assertOk(await callTool('device_create', {
    unitId, networkId, networkAddr: 'aa000001', name: 'Test Device',
  }), 'device_create');
  const deviceId = devCreate.data.deviceId;
  assertOk(await callTool('device_count', { unit: unitId }), 'device_count');
  assertOk(await callTool('device_list', { unit: unitId }), 'device_list');
  assertOk(await callTool('device_get', { deviceId }), 'device_get');
  assertOk(await callTool('device_update', { deviceId, name: 'Test Device Updated' }), 'device_update');
  assertOk(await callTool('device_bulk_create', {
    unitId, networkId, networkAddrs: ['aa000002', 'aa000003'],
  }), 'device_bulk_create');
  assertOk(await callTool('device_range_create', {
    unitId, networkId, startAddr: 'aa000010', endAddr: 'aa000012',
  }), 'device_range_create');
  const devCount = assertOk(await callTool('device_count', { unit: unitId }), 'device_count after bulk/range');
  console.log(`    device count: ${devCount.data.count}`);

  console.log('\n── 5.10 Device route tools ──');
  const drCreate = assertOk(await callTool('device_route_create', { deviceId, applicationId }), 'device_route_create');
  const routeId = drCreate.data.routeId;
  assertOk(await callTool('device_route_count', { unit: unitId }), 'device_route_count');
  assertOk(await callTool('device_route_list', { unit: unitId }), 'device_route_list');
  assertOk(await callTool('device_route_bulk_create', {
    applicationId, networkId, networkAddrs: ['aa000002', 'aa000003'],
  }), 'device_route_bulk_create');
  assertOk(await callTool('device_route_range_create', {
    applicationId, networkId, startAddr: 'aa000010', endAddr: 'aa000012',
  }), 'device_route_range_create');
  assertOk(await callTool('device_route_bulk_delete', {
    applicationId, networkId, networkAddrs: ['aa000002', 'aa000003'],
  }), 'device_route_bulk_delete');
  assertOk(await callTool('device_route_range_delete', {
    applicationId, networkId, startAddr: 'aa000010', endAddr: 'aa000012',
  }), 'device_route_range_delete');
  assertOk(await callTool('device_route_delete', { routeId }), 'device_route_delete');

  console.log('\n── 5.11 Network route tools ──');
  const nrCreate = assertOk(await callTool('network_route_create', { networkId, applicationId }), 'network_route_create');
  const nrRouteId = nrCreate.data.routeId;
  assertOk(await callTool('network_route_count', { unit: unitId }), 'network_route_count');
  assertOk(await callTool('network_route_list', { unit: unitId }), 'network_route_list');
  assertOk(await callTool('network_route_delete', { routeId: nrRouteId }), 'network_route_delete');

  console.log('\n── 5.12 Dldata buffer tools ──');
  assertOk(await callTool('dldata_buffer_count', { unit: unitId }), 'dldata_buffer_count');
  assertOk(await callTool('dldata_buffer_list', { unit: unitId }), 'dldata_buffer_list');

  console.log('\n── 5.13 Data tools ──');
  assertOk(await callTool('data_application_uldata_count', { unit: unitId }), 'data_application_uldata_count');
  assertOk(await callTool('data_application_uldata_list', { unit: unitId }), 'data_application_uldata_list');
  assertOk(await callTool('data_application_dldata_count', { unit: unitId }), 'data_application_dldata_count');
  assertOk(await callTool('data_application_dldata_list', { unit: unitId }), 'data_application_dldata_list');
  assertOk(await callTool('data_network_uldata_count', { unit: unitId }), 'data_network_uldata_count');
  assertOk(await callTool('data_network_uldata_list', { unit: unitId }), 'data_network_uldata_list');
  assertOk(await callTool('data_network_dldata_count', { unit: unitId }), 'data_network_dldata_count');
  assertOk(await callTool('data_network_dldata_list', { unit: unitId }), 'data_network_dldata_list');
  assertOk(await callTool('data_coremgr_opdata_count', {}), 'data_coremgr_opdata_count');
  assertOk(await callTool('data_coremgr_opdata_list', {}), 'data_coremgr_opdata_list');

  console.log('\n── Cleanup ──');
  assertOk(await callTool('application_delete', { applicationId }), 'application_delete');
  assertOk(await callTool('device_bulk_delete', {
    unitId, networkId, networkAddrs: ['aa000002', 'aa000003'],
  }), 'device_bulk_delete');
  assertOk(await callTool('device_range_delete', {
    unitId, networkId, startAddr: 'aa000010', endAddr: 'aa000012',
  }), 'device_range_delete');
  assertOk(await callTool('device_delete', { deviceId }), 'device_delete');
  assertOk(await callTool('network_delete', { networkId }), 'network_delete');
  assertOk(await callTool('unit_delete', { unitId }), 'unit_delete');

  console.log('\n✅ All tests passed!');
}

main()
  .catch((e) => { console.error('\n❌ Test failed:', e.message); process.exitCode = 1; })
  .finally(() => { server.stdin.end(); setTimeout(() => server.kill(), 500); });
