import { z } from 'zod';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerUnitTools(server) {
  server.registerTool(
    'unit_create',
    {
      description: 'Create a unit. The calling user becomes the owner.',
      inputSchema: {
        code: z.string().describe('Unit code, pattern [A-Za-z0-9][A-Za-z0-9-_]*. Lowercased.'),
        name: z.string().optional().describe('Display name.'),
        info: z.record(z.unknown()).optional().describe('Other information.'),
      },
    },
    async ({ code, name, info }) => {
      try {
        const data = await coremgr.request('POST', '/api/v1/unit', {
          body: { data: { code, ...(name !== undefined && { name }), ...(info !== undefined && { info }) } },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'unit_count',
    {
      description: 'Get the count of units owned by the current user.',
      inputSchema: {
        contains: z.string().optional().describe('Filter by code substring (case insensitive).'),
      },
    },
    async ({ contains }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/unit/count', { params: { contains } });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'unit_list',
    {
      description: 'List units owned by the current user.',
      inputSchema: {
        contains: z.string().optional().describe('Filter by code substring (case insensitive).'),
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order. Keys: code, created, modified, name.'),
      },
    },
    async ({ contains, offset, limit, sort }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/unit/list', { params: { contains, offset, limit, sort } });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'unit_get',
    {
      description: 'Get details of a specific unit.',
      inputSchema: {
        unitId: z.string().describe('The unit ID to retrieve.'),
      },
    },
    async ({ unitId }) => {
      try {
        const data = await coremgr.request('GET', `/api/v1/unit/${unitId}`);
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'unit_update',
    {
      description: 'Update a unit\'s display name or info.',
      inputSchema: {
        unitId: z.string().describe('The unit ID to update.'),
        name: z.string().optional().describe('New display name.'),
        info: z.record(z.unknown()).optional().describe('Other information (full replacement).'),
      },
    },
    async ({ unitId, name, info }) => {
      const dataFields = {};
      if (name !== undefined) dataFields.name = name;
      if (info !== undefined) dataFields.info = info;
      try {
        await coremgr.request('PATCH', `/api/v1/unit/${unitId}`, { body: { data: dataFields } });
        return ok({ result: 'updated' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'unit_delete',
    {
      description: 'Delete a unit and all its resources.',
      inputSchema: {
        unitId: z.string().describe('The unit ID to delete.'),
      },
    },
    async ({ unitId }) => {
      try {
        await coremgr.request('DELETE', `/api/v1/unit/${unitId}`);
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
