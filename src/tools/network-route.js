import { z } from 'zod';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerNetworkRouteTools(server) {
  server.registerTool(
    'network_route_create',
    {
      description: 'Create a network route linking a network to an application. All uplink data from the network will be forwarded to the application.',
      inputSchema: {
        networkId: z.string().describe('The network ID to route.'),
        applicationId: z.string().describe('The application ID to receive network data.'),
      },
    },
    async ({ networkId, applicationId }) => {
      try {
        const data = await coremgr.request('POST', '/api/v1/network-route', {
          body: { data: { networkId, applicationId } },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_route_count',
    {
      description: 'Get the count of network routes in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        application: z.string().optional().describe('Filter by application ID.'),
        network: z.string().optional().describe('Filter by network ID.'),
      },
    },
    async ({ unit, application, network }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/network-route/count', {
          params: { unit, application, network },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_route_list',
    {
      description: 'List network routes in a unit.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        application: z.string().optional().describe('Filter by application ID.'),
        network: z.string().optional().describe('Filter by network ID.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: network, created.'),
      },
    },
    async ({ unit, application, network, offset, limit, sort }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/network-route/list', {
          params: { unit, application, network, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'network_route_delete',
    {
      description: 'Delete a network route.',
      inputSchema: {
        routeId: z.string().describe('The route ID to delete.'),
      },
    },
    async ({ routeId }) => {
      try {
        await coremgr.request('DELETE', `/api/v1/network-route/${routeId}`);
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
