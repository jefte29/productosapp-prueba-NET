import { CurrentUser, LoginRequest, RegisterRequest } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5033";

class AuthService {

  async login(data: LoginRequest): Promise<CurrentUser> {

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw response;
    }

    return response.json();
  }

  async register(data: RegisterRequest): Promise<CurrentUser> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw response;
    }

    return response.json();
  }

  async getCurrentUser(): Promise<CurrentUser> {

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw response;
    }

    return response.json();
  }

  async logout(): Promise<void> {

  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw response;
  }

}

}

export const authService = new AuthService();