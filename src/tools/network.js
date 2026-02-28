import { z } from 'zod';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerNetworkTools(server) {
  server.registerTool(
    'network_create',
    {
      description: 'Create a network. Returns networkId and the one-time default password.',
      inputSchema: {
        code: z.string().describe('Network code, pattern [A-Za-z0-9][A-Za-z0-9-_]*. Lowercased.'),
        unitId: z.string().describe('Associated unit ID for a private network.'),
        hostUri: z.string().describe('Network queue URI (e.g. amqp://host/vhost).'),
        name: z.string().optional().describe('Display name.'),
        info: z.record(z.unknown()).optional().describe('Other information.'),
        ttl: z.number().int().optional().describe('AMQP message TTL in milliseconds (0 = unlimited).'),
        length: z.number().int().optional().describe('AMQP max queue length (0 = unlimited).'),
      },
    },
    async ({ code, unitId, hostUri, name, info, ttl, length }) => {
      const dataFields = { code, unitId, hostUri };
      if (name !== undefined) dataFields.name = name;
      if (info !== undefined) dataFields.info = info;
      if (ttl !== undefined) dataFields.ttl = ttl;
      if (length !== undefined) dataFields.length = length;
      try {
        const data = await coremgr.request('POST', '/api/v1/network', { body: { data: dataFields } });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_count',
    {
      description: 'Get the count of networks in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        contains: z.string().optional().describe('Filter by code substring (case insensitive).'),
      },
    },
    async ({ unit, contains }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/network/count', { params: { unit, contains } });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_list',
    {
      description: 'List networks in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        contains: z.string().optional().describe('Filter by code substring.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: code, created, modified, name.'),
      },
    },
    async ({ unit, contains, offset, limit, sort }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/network/list', {
          params: { unit, contains, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_get',
    {
      description: 'Get details of a specific network.',
      inputSchema: {
        networkId: z.string().describe('The network ID to retrieve.'),
      },
    },
    async ({ networkId }) => {
      try {
        const data = await coremgr.request('GET', `/api/v1/network/${networkId}`);
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_update',
    {
      description: 'Update a network. password is required when changing hostUri.',
      inputSchema: {
        networkId: z.string().describe('The network ID to update.'),
        hostUri: z.string().optional().describe('New queue URI. Triggers reconnection.'),
        name: z.string().optional().describe('New display name.'),
        info: z.record(z.unknown()).optional().describe('Other information (full replacement).'),
        ttl: z.number().int().optional().describe('AMQP message TTL in milliseconds.'),
        length: z.number().int().optional().describe('AMQP max queue length.'),
        password: z.string().optional().describe('New queue connection password (required when changing hostUri).'),
      },
    },
    async ({ networkId, hostUri, name, info, ttl, length, password }) => {
      const dataFields = {};
      if (hostUri !== undefined) dataFields.hostUri = hostUri;
      if (name !== undefined) dataFields.name = name;
      if (info !== undefined) dataFields.info = info;
      if (ttl !== undefined) dataFields.ttl = ttl;
      if (length !== undefined) dataFields.length = length;
      if (password !== undefined) dataFields.password = password;
      try {
        await coremgr.request('PATCH', `/api/v1/network/${networkId}`, { body: { data: dataFields } });
        return ok({ result: 'updated' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_delete',
    {
      description: 'Delete a network and all its resources.',
      inputSchema: {
        networkId: z.string().describe('The network ID to delete.'),
      },
    },
    async ({ networkId }) => {
      try {
        await coremgr.request('DELETE', `/api/v1/network/${networkId}`);
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_stats',
    {
      description: 'Get queue statistics for a network (dldata queue).',
      inputSchema: {
        networkId: z.string().describe('The network ID.'),
      },
    },
    async ({ networkId }) => {
      try {
        const data = await coremgr.request('GET', `/api/v1/network/${networkId}/stats`);
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_send_uldata',
    {
      description: 'Simulate uplink data from a device via a network.',
      inputSchema: {
        networkId: z.string().describe('The network ID.'),
        deviceId: z.string().describe('Source device ID.'),
        payload: z.string().describe('Data payload in hexadecimal string format.'),
      },
    },
    async ({ networkId, deviceId, payload }) => {
      try {
        await coremgr.request('POST', `/api/v1/network/${networkId}/uldata`, {
          body: { data: { deviceId, payload } },
        });
        return ok({ result: 'sent' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
