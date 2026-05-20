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

  if (res.status === 204) return undefined as T;

  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: Record<string, string> = {};
  if (storedToken) {
    headers["Authorization"] = `Bearer ${storedToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
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

  return res.json();
}

export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

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
  passwordChangedAt: string | null;
}

export const authApi = {
  registerLearner: (data: { email: string; password: string; displayName: string; level?: string }) =>
    api.post<AuthResponse>("/api/auth/register/learner", data),

  registerPartner: (data: { email: string; password: string; displayName: string; phone?: string; bio?: string }) =>
    api.post<AuthResponse>("/api/auth/register/partner", data),

  login: (data: { email: string; password: string }) =>
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

export const userApi = {
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ avatarUrl: string }>("/api/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updatePresence: (isOnline: boolean) =>
    api.post<{ isOnline: boolean; lastSeen: string }>("/api/users/presence", { isOnline }),
  getOnlineUsers: () =>
    api.get<string[]>("/api/users/presence"),
};

export interface ConversationDto {
  conversationId: string;
  partnerId: string;
  learnerId: string;
  partnerName: string;
  learnerName: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface MessageDto {
  messageId: string;
  conversationId: string;
  senderId: string;
  type: "TEXT" | "LESSON_REQUEST" | "MEET_LINK";
  content: string;
  contentTranslated?: string | null;
  isRead: boolean;
  timestamp: string;
  
  lessonRequestId?: string;
  lessonDate?: string;
  lessonStartTime?: string;
  lessonEndTime?: string;
  lessonDuration?: number;
  lessonStatus?: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  meetingUrl?: string | null;
}

export const messageApi = {
  getConversations: () =>
    api.get<ConversationDto[]>("/api/message/conversations"),

  getMessages: (conversationId: string, page: number = 1, pageSize: number = 50) =>
    api.get<MessageDto[]>(`/api/message/${conversationId}?page=${page}&pageSize=${pageSize}`),

  sendMessage: (conversationId: string, content: string) =>
    api.post<MessageDto>(`/api/message/${conversationId}`, { content }),

  markAsRead: (conversationId: string) =>
    api.put<{ message: string }>(`/api/message/${conversationId}/read`),
};

// ─── Booking / Lesson Request ─────────────────────────────────

export interface BookingDto {
  bookingId: string;
  learnerId: string;
  partnerId: string;
  learnerName: string;
  partnerName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: "pending" | "confirmed" | "declined" | "cancelled";
  meetingUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export const bookingApi = {
  createLessonRequest: (data: { learnerId: string; date: string; startTime: string; durationMinutes: number; notes?: string; meetingUrl?: string }) =>
    api.post<BookingDto>("/api/booking/request", data),

  acceptLessonRequest: (bookingId: string) =>
    api.patch<BookingDto>(`/api/booking/${bookingId}/accept`),

  declineLessonRequest: (bookingId: string) =>
    api.patch<BookingDto>(`/api/booking/${bookingId}/decline`),

  cancelLessonRequest: (bookingId: string) =>
    api.delete<BookingDto>(`/api/booking/${bookingId}`),

  getBookingsForConversation: (conversationId: string) =>
    api.get<BookingDto[]>(`/api/booking/conversation/${conversationId}`),

  getUpcomingBookings: () =>
    api.get<BookingDto[]>("/api/booking/upcoming"),
};
