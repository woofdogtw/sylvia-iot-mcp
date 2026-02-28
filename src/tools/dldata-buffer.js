import { z } from 'zod';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerDldataBufferTools(server) {
  server.registerTool(
    'dldata_buffer_count',
    {
      description: 'Get the count of buffered downlink data items waiting to be sent to devices.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        application: z.string().optional().describe('Filter by application ID.'),
        network: z.string().optional().describe('Filter by network ID.'),
        device: z.string().optional().describe('Filter by device ID.'),
      },
    },
    async ({ unit, application, network, device }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/dldata-buffer/count', {
          params: { unit, application, network, device },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'dldata_buffer_list',
    {
      description: 'List buffered downlink data items waiting to be sent to devices.',
      inputSchema: {
        unit: z.string().describe('Unit ID (required for normal users).'),
        application: z.string().optional().describe('Filter by application ID.'),
        network: z.string().optional().describe('Filter by network ID.'),
        device: z.string().optional().describe('Filter by device ID.'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: application, created, expired.'),
      },
    },
    async ({ unit, application, network, device, offset, limit, sort }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/dldata-buffer/list', {
          params: { unit, application, network, device, offset, limit, sort },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'dldata_buffer_delete',
    {
      description: 'Delete a buffered downlink data item.',
      inputSchema: {
        dataId: z.string().describe('The buffered data ID to delete.'),
      },
    },
    async ({ dataId }) => {
      try {
        await coremgr.request('DELETE', `/api/v1/dldata-buffer/${dataId}`);
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
