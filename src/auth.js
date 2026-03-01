const AUTH_URL = process.env.SYLVIA_IOT_AUTH_URL || 'http://localhost:1080/auth';
const CLIENT_ID = process.env.SYLVIA_IOT_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SYLVIA_IOT_CLIENT_SECRET || '';

let cachedToken = null;
let tokenExpiresAt = 0;

export function invalidateToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

export async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${AUTH_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Expire 60 seconds early to avoid using a token right on the edge
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

/**
 * Call an auth service endpoint directly (not proxied through coremgr).
 */
export async function request(method, path, { params, body } = {}) {
  const token = await getToken();
  const url = new URL(`${AUTH_URL}${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, v);
      }
    }
  }

  const options = {
    method,
    headers: { Authorization: `Bearer ${token}` },
  };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), options);

  if (res.status === 401) {
    invalidateToken();
    // Retry once with a fresh token
    const newToken = await getToken();
    options.headers['Authorization'] = `Bearer ${newToken}`;
    const retry = await fetch(url.toString(), options);
    return handleResponse(retry);
  }

  return handleResponse(res);
}

async function handleResponse(res) {
  if (res.status === 204) return null;

  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const err = new Error(parsed?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = parsed?.code;
    err.message = parsed?.message || `HTTP ${res.status}`;
    throw err;
  }

  return parsed;
}
