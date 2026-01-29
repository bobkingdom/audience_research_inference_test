/**
 * API Client for Inference Service V2
 */
import config from '../config/default.js';

export class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || config.baseUrl;
    this.apiKey = options.apiKey || config.apiKey;
    this.timeout = options.timeout || config.timeout.default;
    this.verbose = options.verbose ?? config.verbose;
  }

  async request(method, path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);
    const startTime = Date.now();
    
    try {
      const fetchOptions = { method, headers, signal: controller.signal };
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      if (this.verbose) {
        console.log(`→ ${method} ${url}`);
      }

      const response = await fetch(url, fetchOptions);
      const duration = Date.now() - startTime;

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return { ok: response.ok, status: response.status, data, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      if (error.name === 'AbortError') {
        return { ok: false, status: 0, error: 'Request timeout', duration };
      }
      return { ok: false, status: 0, error: error.message, duration };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  get(path, options) { return this.request('GET', path, options); }
  post(path, body, options) { return this.request('POST', path, { ...options, body }); }
  put(path, body, options) { return this.request('PUT', path, { ...options, body }); }
  patch(path, body, options) { return this.request('PATCH', path, { ...options, body }); }
  delete(path, options) { return this.request('DELETE', path, options); }
}

export const client = new ApiClient();
