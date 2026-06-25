export interface ApiError {
  error?: string;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  username?: string;
  token?: string;
  billingKioskUser?: boolean;
  error?: string;
}
