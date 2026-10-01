/**
 * REST API client for NodeVigil.
 * Replaces Supabase SDK with direct fetch() calls using JWT authentication.
 * API base URL is configurable in app settings (stored in localStorage).
 */

const API_URL_KEY = 'monitor_api_url';
const TOKEN_KEY = 'monitor_token';

// Use VITE_API_URL env var, default to production custom domain
export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://monitor-server-api.onrender.com/api/v1';

export function getApiUrl(): string {
  return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
}

export function setApiUrl(url: string): void {
  localStorage.setItem(API_URL_KEY, url.replace(/\/$/, ''));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Decode a JWT payload without verifying the signature
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

// Core fetch wrapper used by all API modules
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const base = getApiUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getToken();
    if (!token) {
      window.dispatchEvent(new CustomEvent('monitor:unauthorized'));
      throw new Error('Not authenticated');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
  clearTimeout(timeout);

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('monitor:unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? message;
    } catch { /* response body not JSON */ }
    throw new Error(message);
  }

  // No content responses (204)
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// Convenience helpers
export const api = {
  get: <T>(path: string, auth = true) => apiRequest<T>(path, { method: 'GET' }, auth),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }, auth),
  put: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }, auth),
  delete: <T>(path: string, auth = true) => apiRequest<T>(path, { method: 'DELETE' }, auth),
};
