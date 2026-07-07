import { api, setAccessToken, getAccessToken } from "./api-client";

export async function login(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const response = await api.post<{ token: string }>("/admin/login", {
      email,
      password,
    });
    setAccessToken(response.token);
    return true;
  } catch {
    return false;
  }
}

export async function refreshSession(): Promise<boolean> {
  try {
    const response = await api.post<{ token: string }>("/admin/refresh");
    setAccessToken(response.token);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/admin/logout");
  } finally {
    setAccessToken(null);
  }
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
