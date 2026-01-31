/**
 * Authentication helper for API tests
 * Handles login and extracts account_id + JWT token
 */
import config from '../config/default.js';

let authState = {
  token: null,
  accountId: null,
  user: null,
  isAuthenticated: false,
};

/**
 * Login and store auth state
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, accountId: number, user: object}>}
 */
export async function login(email, password) {
  const url = `${config.baseUrl}/api/auth/login`;
  
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Key': config.apiKey,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(`Login failed: ${data.detail || data.message || 'Unknown error'}`);
  }

  authState = {
    token: data.access_token,
    accountId: data.user?.id,
    user: data.user,
    isAuthenticated: true,
  };

  console.log(`🔐 Logged in as ${data.user?.email} (account_id: ${data.user?.id})`);

  return authState;
}

/**
 * Get current auth state
 */
export function getAuthState() {
  return authState;
}

/**
 * Get JWT token
 */
export function getToken() {
  return authState.token || config.jwtToken;
}

/**
 * Get account ID (from login or config)
 */
export function getAccountId() {
  return authState.accountId || config.testAccountId;
}

/**
 * Check if authenticated
 */
export function isAuthenticated() {
  return authState.isAuthenticated || !!config.jwtToken;
}

/**
 * Reset auth state
 */
export function logout() {
  authState = {
    token: null,
    accountId: null,
    user: null,
    isAuthenticated: false,
  };
}

export default { login, getAuthState, getToken, getAccountId, isAuthenticated, logout };
