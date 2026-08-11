import { apiFetch, setTokens } from "./api";

export type Role = "main" | "qabul" | "payment" | "registrants";

export interface LoginResponse {
  access: string;
  refresh: string;
  role: Role;
  email: string;
}

export interface Me {
  id: number;
  email: string;
  role: Role | null;
}

export const register = (email: string, password: string) =>
  apiFetch<{ email: string }>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const data = await apiFetch<LoginResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  setTokens(data.access, data.refresh);
  return data;
};

export const getMe = () => apiFetch<Me>("/api/auth/me/");
