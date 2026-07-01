export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface CurrentUser {
  userId: string;
  nombre: string;
  email: string;
  role: string;
}