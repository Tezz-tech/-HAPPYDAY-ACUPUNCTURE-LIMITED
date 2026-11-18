// Thin fetch wrapper for the API (docs/05 error shape: { error: { code, message, fields?, alternatives? } }).
// In development the Vite proxy forwards /api to :4000. In production set VITE_API_ORIGIN to the API host.
const BASE = import.meta.env.VITE_API_ORIGIN ?? '';

export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   * @param {{ fields?: Record<string, string>, alternatives?: unknown }} [extra]
   */
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = extra.fields;
    this.alternatives = extra.alternatives;
  }
}

/**
 * @param {string} path path after /api/v1, e.g. "/public/config"
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal }} [opts]
 * @returns {Promise<any>}
 */
export async function api(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api/v1${path}`, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK', 'We could not reach the booking system. You can book on WhatsApp instead.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code ?? 'ERROR', data?.error?.message ?? 'Something went wrong. Please try again.', {
      fields: data?.error?.fields,
      alternatives: data?.error?.alternatives,
    });
  }
  return data;
}
