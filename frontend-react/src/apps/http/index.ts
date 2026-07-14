import { ApiResponse } from '../types';

const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

function handleUnauthorized() {
  localStorage.removeItem('accessToken');
  if (window.location.pathname.startsWith('/dashboard')) {
    window.location.href = '/dashboard/login';
  }
}

export class HttpClient {
  protected baseUrl = BASE_URL;

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Необходима авторизация');
    }

    const json: ApiResponse<T> = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Request failed');
    }

    return json;
  }

  protected get<T>(path: string, options?: RequestInit) {
    return this.request<T>('GET', path, undefined, options);
  }

  protected post<T>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>('POST', path, body, options);
  }

  protected upload<T>(path: string, formData: FormData) {
    return this.request<T>('POST', path, formData);
  }
}
