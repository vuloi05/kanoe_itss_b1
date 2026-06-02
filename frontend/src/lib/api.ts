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
    ...customHeaders,
  };

  if (!(fetchOptions.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

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
  level?: string | null;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  level?: string | null;
  phone: string | null;
  languagePref: string | null;
  bio?: string | null;
  currentStreak: number;
  learnedVocabCount: number;
  averageToneAccuracy: number;
  totalStudyHours: number;
  currentLevel: string;
  masteryPercentage: number;
  createdAt: string;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
}

export const authApi = {
  registerLearner: (data: { email: string; password: string; displayName: string; level?: string }) =>
    api.post<AuthResponse>("/api/auth/register/learner", data),

  registerPartner: (data: { email: string; password: string; displayName: string; phone?: string; bio?: string; ageRange?: string; job?: string }) =>
    api.post<AuthResponse>("/api/auth/register/partner", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", data),

  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>("/api/auth/forgot-password", data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post<{ resetToken: string }>("/api/auth/verify-otp", data),

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
    return uploadRequest<{ avatarUrl: string }>("/api/users/avatar", formData);
  },
  updateProfile: (data: { name: string; bio: string }) =>
    api.put<{ message: string; displayName: string; bio: string }>("/api/users/profile", data),
  updatePresence: (isOnline: boolean) =>
    api.post<{ isOnline: boolean; lastSeen: string }>("/api/users/presence", { isOnline }),
  getOnlineUsers: () =>
    api.get<string[]>("/api/users/presence"),
  recordStudyActivity: () =>
    api.post<{ currentStreak: number }>("/api/users/record-study"),
  recordStudyTime: (seconds: number) =>
    api.post<{ dailyStudySeconds: number }>("/api/users/record-time", { seconds }),
};

export interface ConversationDto {
  conversationId: string;
  partnerId: string;
  learnerId: string;
  partnerName: string;
  learnerName: string;
  partnerAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageType: string | null;
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

// ─── TTS (Text-to-Speech via FPT.AI) ─────────────────────────
export const ttsApi = {
  synthesize: (text: string) =>
    api.post<{ audioUrl: string }>("/api/tts/synthesize", { text }),
};

// ─── Lesson / Curriculum ──────────────────────────────────────

export interface LessonSummaryDto {
  lessonId: string;
  sceneLabel: string;
  sceneLabelJp: string;
  titleVi: string;
  titleJp: string;
  tag: string | null;
  tagJp: string | null;
  durationMinutes: number | null;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  sortOrder: number;
}

export interface ChapterDto {
  chapterId: number;
  titleVi: string;
  titleJp: string;
  icon: string;
  sortOrder: number;
  lessons: LessonSummaryDto[];
}

export interface DialogueDto {
  speaker: string;
  speakerJp: string;
  lineVi: string;
  lineJp: string;
  isActive: boolean;
  highlightWordsJson: string | null;
}

export interface ToneNoteDto {
  tone: string;
  descVi: string;
  descJp: string;
  example: string;
  color: string;
}

export interface LessonDetailDto {
  lessonId: string;
  sceneLabel: string;
  sceneLabelJp: string;
  titleVi: string;
  titleJp: string;
  subtitleVi: string;
  subtitleJp: string;
  tag: string | null;
  tagJp: string | null;
  durationMinutes: number | null;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  dialogues: DialogueDto[];
  toneNotes: ToneNoteDto[];
}

export const lessonApi = {
  getChaptersByLevel: (levelId: number = 1) =>
    api.get<ChapterDto[]>(`/api/lesson/chapters?levelId=${levelId}`),

  getLessonById: (id: string) =>
    api.get<LessonDetailDto>(`/api/lesson/${id}`),

  completeLesson: (id: string) =>
    api.post<{ message: string; newLevel?: string | null }>(`/api/lesson/${id}/complete`),

  getContinueLesson: () =>
    api.get<ContinueLessonDto | undefined>("/api/lesson/continue"),
};

// ─── Continue Learning CTA ────────────────────────────────────

export interface ContinueLessonDto {
  lessonId: string;
  sceneLabel: string;
  sceneLabelJp: string;
  titleVi: string;
  titleJp: string;
  chapterTitleVi: string;
  chapterTitleJp: string;
}

// ─── Voice Lab (Pronunciation Scoring) ────────────────────────
export interface VoiceLabEvaluateResponse {
  actualText: string | null;
  completeness: number;
  accuracy: number;
  fluency: number;
  prosody: number;
}

export const voiceLabApi = {
  evaluate: (formData: FormData) =>
    uploadRequest<VoiceLabEvaluateResponse>("/api/voicelab/evaluate", formData),
};

// ─── Vocabulary Tracking ──────────────────────────────────────
export const vocabApi = {
  /** Record learned words (fire-and-forget from Voice Lab) */
  recordLearnedWords: (words: string[]) =>
    api.post<{ recorded: number; totalVocab: number }>("/api/vocabularies/record", { words }),
};

// ─── Partner Matching ─────────────────────────────────────────
export interface PartnerDto {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  ageRange: string | null;
  job: string | null;
  specialties: string[] | null;
  hasConversation: boolean;
  conversationId: string | null;
}

export interface StartConversationResponse {
  conversationId: string;
  isNew: boolean;
}

export const partnerApi = {
  getPartners: () =>
    api.get<PartnerDto[]>("/api/partners"),

  startConversation: (partnerId: string) =>
    api.post<StartConversationResponse>(`/api/partners/${partnerId}/start-conversation`, {}),
};

// ─── Matching Token Economy ───────────────────────────────────

export interface ConnectResponse {
  conversationId: string;
  isNew: boolean;
  remainingBalance: number;
  amountCharged: number;
}

export interface TokenBalanceResponse {
  tokenBalance: number;
}

export interface TransactionHistoryDto {
  id: string;
  type: "debit" | "credit";
  amount: number;
  counterpartyName: string;
  counterpartyAvatarUrl: string | null;
  createdAt: string;
}

export const matchingApi = {
  /** Atomically deducts tokens, creates conversation, logs transaction */
  connect: (partnerId: string) =>
    api.post<ConnectResponse>("/api/matching/connect", { partnerId }),

  /** Returns current token balance for the authenticated user */
  getBalance: () =>
    api.get<TokenBalanceResponse>("/api/matching/balance"),

  /** Returns transaction history (debits + credits), newest first */
  getTransactions: () =>
    api.get<TransactionHistoryDto[]>("/api/matching/transactions"),
};