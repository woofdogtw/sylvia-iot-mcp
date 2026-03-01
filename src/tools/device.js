import { z } from 'zod';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerDeviceTools(server) {
  server.registerTool(
    'device_create',
    {
      description: 'Create a single device.',
      inputSchema: {
        unitId: z.string().describe('Associated unit ID.'),
        networkId: z.string().describe('Associated network ID.'),
        networkAddr: z.string().describe('Network address (lowercased).'),
        profile: z.string().optional().describe('Device profile for application servers.'),
        name: z.string().optional().describe('Display name.'),
        info: z.record(z.unknown()).optional().describe('Other information.'),
      },
    },
    async ({ unitId, networkId, networkAddr, profile, name, info }) => {
      const dataFields = { unitId, networkId, networkAddr };
      if (profile !== undefined) dataFields.profile = profile;
      if (name !== undefined) dataFields.name = name;
      if (info !== undefined) dataFields.info = info;
      try {
        const data = await coremgr.request('POST', '/api/v1/device', { body: { data: dataFields } });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_bulk_create',
    {
      description: 'Bulk create devices by address list (max 1024). Existing addresses are skipped.',
      inputSchema: {
        unitId: z.string().describe('Associated unit ID.'),
        networkId: z.string().describe('Associated network ID.'),
        networkAddrs: z.array(z.string()).describe('Network addresses (max 1024).'),
        profile: z.string().optional().describe('Device profile.'),
      },
    },
    async ({ unitId, networkId, networkAddrs, profile }) => {
      const dataFields = { unitId, networkId, networkAddrs };
      if (profile !== undefined) dataFields.profile = profile;
      try {
        await coremgr.request('POST', '/api/v1/device/bulk', { body: { data: dataFields } });
        return ok({ result: 'created' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_bulk_delete',
    {
      description: 'Bulk delete devices by address list (max 1024).',
      inputSchema: {
        unitId: z.string().describe('Associated unit ID.'),
        networkId: z.string().describe('Associated network ID.'),
        networkAddrs: z.array(z.string()).describe('Network addresses to delete (max 1024).'),
      },
    },
    async ({ unitId, networkId, networkAddrs }) => {
      try {
        await coremgr.request('POST', '/api/v1/device/bulk-delete', {
          body: { data: { unitId, networkId, networkAddrs } },
        });
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_range_create',
    {
      description: 'Bulk create devices by hex address range (max 1024). startAddr and endAddr must be same-length hex strings.',
      inputSchema: {
        unitId: z.string().describe('Associated unit ID.'),
        networkId: z.string().describe('Associated network ID.'),
        startAddr: z.string().describe('Start hex address (e.g. "80001000").'),
        endAddr: z.string().describe('End hex address (e.g. "800013ff"), same length as startAddr.'),
        profile: z.string().optional().describe('Device profile.'),
      },
    },
    async ({ unitId, networkId, startAddr, endAddr, profile }) => {
      const dataFields = { unitId, networkId, startAddr, endAddr };
      if (profile !== undefined) dataFields.profile = profile;
      try {
        await coremgr.request('POST', '/api/v1/device/range', { body: { data: dataFields } });
        return ok({ result: 'created' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_range_delete',
    {
      description: 'Bulk delete devices by hex address range (max 1024).',
      inputSchema: {
        unitId: z.string().describe('Associated unit ID.'),
        networkId: z.string().describe('Associated network ID.'),
        startAddr: z.string().describe('Start hex address.'),
        endAddr: z.string().describe('End hex address, same length as startAddr.'),
      },
    },
    async ({ unitId, networkId, startAddr, endAddr }) => {
      try {
        await coremgr.request('POST', '/api/v1/device/range-delete', {
          body: { data: { unitId, networkId, startAddr, endAddr } },
        });
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_count',
    {
      description: 'Get the count of devices in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        network: z.string().optional().describe('Filter by network ID.'),
        addr: z.string().optional().describe('Filter by network address (case insensitive).'),
        profile: z.string().optional().describe('Filter by device profile (case insensitive).'),
        contains: z.string().optional().describe('Filter by name substring (case insensitive).'),
      },
    },
    async ({ unit, network, addr, profile, contains }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/device/count', {
          params: { unit, network, addr, profile, contains },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_list',
    {
      description: 'List devices in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        network: z.string().optional().describe('Filter by network ID.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        contains: z.string().optional().describe('Filter by name substring.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: network, addr, created, modified, profile, name.'),
      },
    },
    async ({ unit, network, addr, profile, contains, offset, limit, sort }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/device/list', {
          params: { unit, network, addr, profile, contains, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_get',
    {
      description: 'Get details of a specific device.',
      inputSchema: {
        deviceId: z.string().describe('The device ID to retrieve.'),
      },
    },
    async ({ deviceId }) => {
      try {
        const data = await coremgr.request('GET', `/api/v1/device/${deviceId}`);
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_update',
    {
      description: 'Update a device.',
      inputSchema: {
        deviceId: z.string().describe('The device ID to update.'),
        networkId: z.string().optional().describe('New associated network ID.'),
        networkAddr: z.string().optional().describe('New network address.'),
        profile: z.string().optional().describe('New device profile.'),
        name: z.string().optional().describe('New display name.'),
        info: z.record(z.unknown()).optional().describe('Other information (full replacement).'),
      },
    },
    async ({ deviceId, networkId, networkAddr, profile, name, info }) => {
      const dataFields = {};
      if (networkId !== undefined) dataFields.networkId = networkId;
      if (networkAddr !== undefined) dataFields.networkAddr = networkAddr;
      if (profile !== undefined) dataFields.profile = profile;
      if (name !== undefined) dataFields.name = name;
      if (info !== undefined) dataFields.info = info;
      try {
        await coremgr.request('PATCH', `/api/v1/device/${deviceId}`, { body: { data: dataFields } });
        return ok({ result: 'updated' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'device_delete',
    {
      description: 'Delete a device and all its resources.',
      inputSchema: {
        deviceId: z.string().describe('The device ID to delete.'),
      },
    },
    async ({ deviceId }) => {
      try {
        await coremgr.request('DELETE', `/api/v1/device/${deviceId}`);
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
