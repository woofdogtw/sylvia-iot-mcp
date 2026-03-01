import { getToken, invalidateToken } from './auth.js';

const COREMGR_URL = process.env.SYLVIA_IOT_COREMGR_URL || 'http://localhost:1080/coremgr';

export async function request(method, path, { params, body } = {}) {
  const token = await getToken();
  const url = new URL(`${COREMGR_URL}${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
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
