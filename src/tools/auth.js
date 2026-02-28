import { z } from 'zod';
import * as authApi from '../auth.js';
import * as coremgr from '../coremgr.js';

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function err(e) {
  return { content: [{ type: 'text', text: e.message || String(e) }], isError: true };
}

export function registerAuthTools(server) {
  server.registerTool(
    'auth_tokeninfo',
    {
      description: 'Get information about the current access token (userId, account, name, roles, clientId, scopes).',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await authApi.request('GET', '/api/v1/auth/tokeninfo');
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'user_get',
    {
      description: 'Get the current user\'s profile (account, name, info, roles, createdAt, modifiedAt, verifiedAt).',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await coremgr.request('GET', '/api/v1/user');
        return ok(data);
      } catch (e) {
        return err(e);
      }
    }
  );

  server.registerTool(
    'user_update',
    {
      description: 'Update the current user\'s profile. Provide at least one of: password, name, info.',
      inputSchema: {
        password: z.string().optional().describe('New password.'),
        name: z.string().optional().describe('New display name.'),
        info: z.record(z.unknown()).optional().describe('Other information (full replacement).'),
      },
    },
    async ({ password, name, info }) => {
      const data = {};
      if (password !== undefined) data.password = password;
      if (name !== undefined) data.name = name;
      if (info !== undefined) data.info = info;
      if (Object.keys(data).length === 0) {
        return err(new Error('At least one of password, name, or info is required.'));
      }
      try {
        await coremgr.request('PATCH', '/api/v1/user', { body: { data } });
        return ok({ result: 'updated' });
      } catch (e) {
        return err(e);
      }
    }
  );
}
