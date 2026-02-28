import { z } from 'zod';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerClientTools(server) {
  server.registerTool(
    'client_create',
    {
      description: 'Create an OAuth2 client. Use credentials:true to create a private client with a secret.',
      inputSchema: {
        redirectUris: z.array(z.string()).describe('Allowed redirect URIs.'),
        scopes: z.array(z.string()).describe('Allowed scopes.'),
        name: z.string().describe('Client display name.'),
        image: z.string().optional().describe('URI of the client icon.'),
        credentials: z.boolean().optional().describe('Set true to create a private client with a secret (default false).'),
      },
    },
    async ({ redirectUris, scopes, name, image, credentials }) => {
      try {
        const data = await coremgr.request('POST', '/api/v1/client', {
          body: {
            data: { redirectUris, scopes, name, ...(image !== undefined && { image }) },
            ...(credentials !== undefined && { credentials }),
          },
        });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'client_count',
    {
      description: 'Get the count of OAuth2 clients owned by the current user.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await coremgr.request('GET', '/api/v1/client/count');
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'client_list',
    {
      description: 'List OAuth2 clients owned by the current user.',
      inputSchema: {
        offset: z.number().int().optional().describe('Data offset (default 0).'),
        limit: z.number().int().optional().describe('Max items to return; 0 for all (default 100).'),
        sort: z.string().optional().describe('Sort key:order, e.g. "name:asc". Keys: created, modified, name.'),
      },
    },
    async ({ offset, limit, sort }) => {
      try {
        const data = await coremgr.request('GET', '/api/v1/client/list', { params: { offset, limit, sort } });
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'client_get',
    {
      description: 'Get details of a specific OAuth2 client, including its secret if private.',
      inputSchema: {
        clientId: z.string().describe('The client ID to retrieve.'),
      },
    },
    async ({ clientId }) => {
      try {
        const data = await coremgr.request('GET', `/api/v1/client/${clientId}`);
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'client_update',
    {
      description: 'Update an OAuth2 client. Provide at least one field to change.',
      inputSchema: {
        clientId: z.string().describe('The client ID to update.'),
        redirectUris: z.array(z.string()).optional().describe('New allowed redirect URIs.'),
        scopes: z.array(z.string()).optional().describe('New allowed scopes.'),
        name: z.string().optional().describe('New display name.'),
        image: z.string().nullable().optional().describe('New icon URI, or null to remove.'),
        regenSecret: z.boolean().optional().describe('Set true to regenerate the client secret.'),
      },
    },
    async ({ clientId, redirectUris, scopes, name, image, regenSecret }) => {
      const dataFields = {};
      if (redirectUris !== undefined) dataFields.redirectUris = redirectUris;
      if (scopes !== undefined) dataFields.scopes = scopes;
      if (name !== undefined) dataFields.name = name;
      if (image !== undefined) dataFields.image = image;
      const bodyObj = {};
      if (Object.keys(dataFields).length > 0) bodyObj.data = dataFields;
      if (regenSecret !== undefined) bodyObj.regenSecret = regenSecret;
      try {
        await coremgr.request('PATCH', `/api/v1/client/${clientId}`, { body: bodyObj });
        return ok({ result: 'updated' });
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'client_delete',
    {
      description: 'Delete an OAuth2 client.',
      inputSchema: {
        clientId: z.string().describe('The client ID to delete.'),
      },
    },
    async ({ clientId }) => {
      try {
        await coremgr.request('DELETE', `/api/v1/client/${clientId}`);
        return ok({ result: 'deleted' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
