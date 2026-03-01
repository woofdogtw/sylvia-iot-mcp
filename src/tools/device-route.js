import { z } from 'zod';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerDeviceRouteTools(server) {
  server.registerTool(
    'device_route_create',
    {
      description: 'Create a device route linking a device to an application. Both must belong to the same unit.',
      inputSchema: {
        deviceId: z.string().describe('The device ID to route.'),
        applicationId: z.string().describe('The application ID to receive the device data.'),
      },
    },
    async ({ deviceId, applicationId }) => {
      try {
        const data = await coremgr.request('POST', '/api/v1/device-route', {
          body: { data: { deviceId, applicationId } },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_route_bulk_create',
    {
      description: 'Bulk create device routes by address list (max 1024). Existing routes are skipped.',
      inputSchema: {
        applicationId: z.string().describe('The application ID to route devices to.'),
        networkId: z.string().describe('The network ID of the devices.'),
        networkAddrs: z.array(z.string()).describe('Network addresses to create routes for (max 1024).'),
      },
    },
    async ({ applicationId, networkId, networkAddrs }) => {
      try {
        await coremgr.request('POST', '/api/v1/device-route/bulk', {
          body: { data: { applicationId, networkId, networkAddrs } },
        });
        return ok({ result: 'created' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_route_bulk_delete',
    {
      description: 'Bulk delete device routes by address list (max 1024).',
      inputSchema: {
        applicationId: z.string().describe('The application ID of the routes to delete.'),
        networkId: z.string().describe('The network ID of the devices.'),
        networkAddrs: z.array(z.string()).describe('Network addresses to delete routes for (max 1024).'),
      },
    },
    async ({ applicationId, networkId, networkAddrs }) => {
      try {
        await coremgr.request('POST', '/api/v1/device-route/bulk-delete', {
          body: { data: { applicationId, networkId, networkAddrs } },
        });
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_route_range_create',
    {
      description: 'Bulk create device routes by hex address range (max 1024). Existing routes are skipped. startAddr and endAddr must be same-length hex strings.',
      inputSchema: {
        applicationId: z.string().describe('The application ID to route devices to.'),
        networkId: z.string().describe('The network ID of the devices.'),
        startAddr: z.string().describe('Start hex address (e.g. "80001000").'),
        endAddr: z.string().describe('End hex address (e.g. "800013ff"), same length as startAddr.'),
      },
    },
    async ({ applicationId, networkId, startAddr, endAddr }) => {
      try {
        await coremgr.request('POST', '/api/v1/device-route/range', {
          body: { data: { applicationId, networkId, startAddr, endAddr } },
        });
        return ok({ result: 'created' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_route_range_delete',
    {
      description: 'Bulk delete device routes by hex address range (max 1024).',
      inputSchema: {
        applicationId: z.string().describe('The application ID of the routes to delete.'),
        networkId: z.string().describe('The network ID of the devices.'),
        startAddr: z.string().describe('Start hex address.'),
        endAddr: z.string().describe('End hex address, same length as startAddr.'),
      },
    },
    async ({ applicationId, networkId, startAddr, endAddr }) => {
      try {
        await coremgr.request('POST', '/api/v1/device-route/range-delete', {
          body: { data: { applicationId, networkId, startAddr, endAddr } },
        });
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_route_count',
    {
      description: 'Get the count of device routes in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        application: z.string().optional().describe('Filter by application ID.'),
        network: z.string().optional().describe('Filter by network ID.'),
        device: z.string().optional().describe('Filter by device ID.'),
      },
    },
    async ({ unit, application, network, device }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/device-route/count', {
          params: { unit, application, network, device },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_route_list',
    {
      description: 'List device routes in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        application: z.string().optional().describe('Filter by application ID.'),
        network: z.string().optional().describe('Filter by network ID.'),
        device: z.string().optional().describe('Filter by device ID.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: network, addr, created.'),
      },
    },
    async ({ unit, application, network, device, offset, limit, sort }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/device-route/list', {
          params: { unit, application, network, device, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_route_delete',
    {
      description: 'Delete a device route.',
      inputSchema: {
        routeId: z.string().describe('The route ID to delete.'),
      },
    },
    async ({ routeId }) => {
      try {
        await coremgr.request('DELETE', `/api/v1/device-route/${routeId}`);
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
