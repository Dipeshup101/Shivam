export interface User {
  email: string;
  password: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  email?: string;
  password?: string;
  name?: string;
  general?: string;
} 