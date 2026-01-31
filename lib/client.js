/**
 * API Client for Inference Service V2
 * Supports API Key and JWT Token authentication
 */
import config from '../config/default.js';
import { getToken, getAccountId } from './auth.js';

export class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || config.baseUrl;
    this.apiKey = options.apiKey || config.apiKey;
    this.timeout = options.timeout || config.timeout.default;
    this.verbose = options.verbose ?? config.verbose;
  }

  /**
   * Get JWT token (from auth state or config)
   */
  getJwtToken() {
    return getToken();
  }

  /**
   * Get account ID (from auth state or config)
   */
  getAccountId() {
    return getAccountId();
  }

  async request(method, path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT token if available and not explicitly disabled
    const token = this.getJwtToken();
    if (token && options.auth !== false) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutMs = options.timeout || this.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const startTime = Date.now();
    
    try {
      const fetchOptions = { method, headers, signal: controller.signal };
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      if (this.verbose) {
        console.log(`→ ${method} ${url}`);
        if (options.body) {
          console.log(`  Body: ${JSON.stringify(options.body).slice(0, 200)}...`);
        }
      }

      const response = await fetch(url, fetchOptions);
      const duration = Date.now() - startTime;

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = await response.text();
        }
      } else {
        data = await response.text();
      }

      if (this.verbose) {
        console.log(`← ${response.status} (${duration}ms)`);
      }

      return { 
        ok: response.ok, 
        status: response.status, 
        data, 
        duration,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      if (error.name === 'AbortError') {
        return { ok: false, status: 0, error: 'Request timeout', duration, timeout: true };
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
export default client;
