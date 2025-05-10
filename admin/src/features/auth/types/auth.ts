/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  role?: string;
  avatar?: string;
}

/**
 * Token interface
 */
export interface Token {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  message: string;
  user: User;
  token: Token;
}

/**
 * API error interface
 */
export interface ApiError {
  message: string;
  statusCode: number;
  timestamp?: string;
  details?: ErrorDetail[];
}

/**
 * Error detail interface
 */
export interface ErrorDetail {
  path: string;
  message: string;
}