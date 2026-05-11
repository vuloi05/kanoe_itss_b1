const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ApiOptions extends RequestInit {
  token?: string;
}




export class ApiException extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiException";
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Attach JWT token if available
  const storedToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
  if (storedToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${storedToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    let errorMessage = "Đã xảy ra lỗi.";
    try {
      const errorBody = await res.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      // Response body is not JSON
    }
    throw new ApiException(errorMessage, res.status);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// Typed API methods
export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

// Auth-specific API types
export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  phone: string | null;
  languagePref: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

// Auth API endpoints
export const authApi = {
  registerLearner: (data: { email: string; password: string; displayName: string; level?: string }) =>
    api.post<AuthResponse>("/api/auth/register/learner", data),

  registerPartner: (data: { email: string; password: string; displayName: string; phone?: string; bio?: string }) =>
    api.post<AuthResponse>("/api/auth/register/partner", data),

  login: (data: { email: string; password: string; role: string }) =>
    api.post<AuthResponse>("/api/auth/login", data),

  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>("/api/auth/forgot-password", data),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post<{ message: string }>("/api/auth/reset-password", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>("/api/auth/change-password", data),

  getProfile: () =>
    api.get<UserProfile>("/api/auth/me"),
};
