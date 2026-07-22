const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

let accessToken: string | null = null;

if (typeof window !== "undefined") {
  accessToken = sessionStorage.getItem("admin_access_token");
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem("admin_access_token", token);
    } else {
      sessionStorage.removeItem("admin_access_token");
    }
  }
}

export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = sessionStorage.getItem("admin_access_token");
  }
  return accessToken;
}

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorType: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: { error?: string; message?: string } = {};
    try {
      errorBody = await response.json();
    } catch {
      // Response might not be JSON
    }

    throw new ApiError(
      response.status,
      errorBody.error ?? "UnknownError",
      errorBody.message ?? `Request failed with status ${response.status}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildHeaders(isFormData = false): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const currentHeaders = {
    ...buildHeaders(options.body instanceof FormData),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: currentHeaders,
  });

  // Auto-refresh on 401 if it's an authenticated endpoint (not login)
  if (response.status === 401 && !path.includes("/login") && !path.includes("/refresh")) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the original request with newly refreshed token
      const retryHeaders = {
        ...currentHeaders,
        Authorization: `Bearer ${getAccessToken()}`,
      };
      const retryResponse = await fetch(url, {
        ...options,
        credentials: "include",
        headers: retryHeaders,
      });
      return handleResponse<T>(retryResponse);
    }
  }

  return handleResponse<T>(response);
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      setAccessToken(null);
      return false;
    }

    const data = (await response.json()) as { token: string };
    setAccessToken(data.token);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

/* ─── Public Methods ─── */

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: "GET",
    });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: "DELETE",
    });
  },

  async upload<T>(path: string, formData: FormData): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: formData,
    });
  },
};

export { ApiError };
