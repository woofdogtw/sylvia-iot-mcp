import { z } from 'zod';
import * as dataApi from '../data.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerDataTools(server) {
  server.registerTool(
    'data_application_uldata_count',
    {
      description: 'Get the count of application uplink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc, pub, or time. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/application-uldata/count', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_application_uldata_list',
    {
      description: 'List application uplink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc, pub, or time. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: proc, pub, time, network, addr.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/application-uldata/list', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_application_dldata_count',
    {
      description: 'Get the count of application downlink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc or resp. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/application-dldata/count', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_application_dldata_list',
    {
      description: 'List application downlink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc or resp. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: proc, resp, network, addr.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/application-dldata/list', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_network_uldata_count',
    {
      description: 'Get the count of network uplink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc or time. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/network-uldata/count', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_network_uldata_list',
    {
      description: 'List network uplink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc or time. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: proc, time, network, addr.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/network-uldata/list', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_network_dldata_count',
    {
      description: 'Get the count of network downlink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc, pub, or resp. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/network-dldata/count', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_network_dldata_list',
    {
      description: 'List network downlink data records.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        device: z.string().optional().describe('Filter by device ID.'),
        network: z.string().optional().describe('Filter by network code.'),
        addr: z.string().optional().describe('Filter by network address.'),
        profile: z.string().optional().describe('Filter by device profile.'),
        tfield: z.string().optional().describe('Time field for filtering: proc, pub, or resp. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: proc, pub, resp, network, addr.'),
      },
    },
    async ({ unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/network-dldata/list', {
          params: { unit, device, network, addr, profile, tfield, tstart, tend, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_coremgr_opdata_count',
    {
      description: 'Get the count of coremgr operation log records. Normal users see only their own logs.',
      inputSchema: {
        tfield: z.string().optional().describe('Time field for filtering: req or res. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
      },
    },
    async ({ tfield, tstart, tend }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/coremgr-opdata/count', {
          params: { tfield, tstart, tend },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'data_coremgr_opdata_list',
    {
      description: 'List coremgr operation log records. Normal users see only their own logs.',
      inputSchema: {
        tfield: z.string().optional().describe('Time field for filtering: req or res. Required when using tstart/tend.'),
        tstart: z.number().optional().describe('Start time in milliseconds since epoch.'),
        tend: z.number().optional().describe('End time in milliseconds since epoch.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: req, res.'),
      },
    },
    async ({ tfield, tstart, tend, offset, limit, sort }) => {
      try {
        const data = await dataApi.request('GET', '/api/v1/coremgr-opdata/list', {
          params: { tfield, tstart, tend, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );
}
