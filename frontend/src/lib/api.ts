// Fetch wrapper for the Django REST backend, replacing the Supabase client.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://127.0.0.1:8000";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("adminRole");
  localStorage.removeItem("adminEmail");
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.detail === "string") return b.detail;
    if (Array.isArray(b.non_field_errors) && b.non_field_errors.length) {
      return String(b.non_field_errors[0]);
    }
    for (const key of Object.keys(b)) {
      const val = b[key];
      if (Array.isArray(val) && val.length) return String(val[0]);
      if (typeof val === "string") return val;
    }
  }
  return fallback;
}

// Deduplicates concurrent refresh attempts so parallel 401s only refresh once.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        if (data.access) {
          localStorage.setItem(ACCESS_KEY, data.access);
          if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
          return data.access as string;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const doFetch = (token: string | null) => {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    };
    if (token) requestHeaders["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${path}`, { ...rest, headers: requestHeaders });
  };

  let res = await doFetch(skipAuth ? null : getAccessToken());

  if (!skipAuth && res.status === 401 && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
  }

  if (res.status === 204) return null as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    if (res.status === 401 && !skipAuth) {
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    throw new ApiError(res.status, body, extractErrorMessage(body, "So'rovni bajarishda xatolik yuz berdi"));
  }

  return body as T;
}
