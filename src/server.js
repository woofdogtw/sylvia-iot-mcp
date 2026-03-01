import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAuthTools } from './tools/auth.js';
import { registerClientTools } from './tools/client.js';
import { registerUnitTools } from './tools/unit.js';
import { registerApplicationTools } from './tools/application.js';
import { registerNetworkTools } from './tools/network.js';
import { registerDeviceTools } from './tools/device.js';
import { registerDeviceRouteTools } from './tools/device-route.js';
import { registerNetworkRouteTools } from './tools/network-route.js';
import { registerDldataBufferTools } from './tools/dldata-buffer.js';
import { registerDataTools } from './tools/data.js';

export const server = new McpServer({
  name: 'sylvia-iot-mcp',
  version: '0.1.0',
});

registerAuthTools(server);
registerClientTools(server);
registerUnitTools(server);
registerApplicationTools(server);
registerNetworkTools(server);
registerDeviceTools(server);
registerDeviceRouteTools(server);
registerNetworkRouteTools(server);
registerDldataBufferTools(server);
registerDataTools(server);
