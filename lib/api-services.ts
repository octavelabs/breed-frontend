import api from './api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'BELIEVER' | 'PREACHER' | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  isEmailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  country?: string;
  city?: string;
  churchName?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ── Auth services ──────────────────────────────────────────────────────────────

export const authService = {
  checkEmail: (email: string): Promise<{ available: boolean }> =>
    api.get(`/auth/check-email?email=${encodeURIComponent(email)}`),

  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    username: string;
    phone?: string;
    role?: 'BELIEVER' | 'PREACHER';
  }) => api.post('/auth/register', data),

  login: <T = LoginResponse>(data: {
    emailOrUsername: string;
    password: string;
    rememberMe?: boolean;
  }) => api.post<T>('/auth/login', data),

  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => api.post('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  verifyResetToken: (token: string): Promise<{ valid: boolean }> =>
    api.post('/auth/verify-reset-token', { token }),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => api.post('/auth/change-password', data),

  me: <T = User>() => api.get<T>('/auth/me'),
};

// ── User services ──────────────────────────────────────────────────────────────

export const userService = {
  getProfile: () => api.get<User>('/users/me'),

  updateProfile: (
    data: Partial<User> & {
      interests?: string[];
      bibleReadingFrequency?: string;
      prayerFrequency?: string;
      isChurchMember?: boolean;
      discipleshipExperience?: string;
    },
  ) => api.patch('/users/me', data),

  updatePreferences: (data: Record<string, boolean | string>) =>
    api.patch('/users/me/preferences', data),

  getStats: () =>
    api.get<{
      coursesEnrolled: number;
      coursesCompleted: number;
      streak: {
        currentStreak: number;
        longestStreak: number;
      };
      prayerCount: number;
      communitiesJoined: number;
    }>('/users/me/stats'),
};

// ── Course services ────────────────────────────────────────────────────────────

export const courseService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    authorId?: string;
    status?: string;
  }) => api.get('/courses', { params }),

  getById: (id: string) => api.get(`/courses/${id}`),

  getCategories: () => api.get('/courses/categories'),

  createCourse: (data: {
    title: string;
    description: string;
    categoryId?: string;
    tags?: string[];
    isFree?: boolean;
    level?: string;
    coverImageUrl?: string;
  }) => api.post('/courses', data),

  updateCourse: (id: string, data: {
    title?: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
    isFree?: boolean;
    level?: string;
    coverImageUrl?: string;
    status?: string;
  }) => api.patch(`/courses/${id}`, data),

  publishCourse: (id: string) => api.post(`/courses/${id}/publish`),

  deleteCourse: (id: string) => api.delete(`/courses/${id}`),

  createLesson: (courseId: string, data: {
    title: string;
    description?: string;
    content?: string;
    type: string;
    sortOrder?: number;
    isPublished?: boolean;
  }) => api.post(`/courses/${courseId}/lessons`, data),

  updateLesson: (courseId: string, lessonId: string, data: {
    title?: string;
    description?: string;
    content?: string;
    sortOrder?: number;
    isPublished?: boolean;
  }) => api.patch(`/courses/${courseId}/lessons/${lessonId}`, data),

  deleteLesson: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`),

  enroll: (id: string) => api.post(`/courses/${id}/enroll`),

  getEnrolled: () => api.get('/courses/me/enrolled'),

  getCompleted: () => api.get('/courses/me/completed'),

  getProgress: (id: string) => api.get(`/courses/${id}/progress`),

  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
};

// ── Devotional services ────────────────────────────────────────────────────────

export const devotionalService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
  }) => api.get('/devotionals', { params }),

  getToday: () => api.get('/devotionals/today'),

  getFeatured: () => api.get('/devotionals/featured'),

  getById: (id: string) => api.get(`/devotionals/${id}`),

  toggleBookmark: (id: string) => api.post(`/devotionals/${id}/bookmark`),

  getBookmarks: () => api.get('/devotionals/me/bookmarks'),

  react: (id: string, type: string) =>
    api.post(`/devotionals/${id}/react`, { type }),

  getComments: (id: string) => api.get(`/devotionals/${id}/comments`),

  addComment: (id: string, content: string, parentId?: string) =>
    api.post(`/devotionals/${id}/comments`, { content, parentId }),
};

// ── Community services ─────────────────────────────────────────────────────────

export const communityService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => api.get('/communities', { params }),

  getMine: () => api.get('/communities/me'),

  getById: (id: string) => api.get(`/communities/${id}`),

  create: (data: {
    name: string;
    description?: string;
    privacy?: string;
  }) => api.post('/communities', data),

  join: (id: string) => api.post(`/communities/${id}/join`),

  leave: (id: string) => api.delete(`/communities/${id}/join`),

  getMessages: (
    id: string,
    params?: { cursor?: string; limit?: number },
  ) => api.get(`/communities/${id}/messages`, { params }),

  sendMessage: (id: string, content: string, replyToId?: string) =>
    api.post(`/communities/${id}/messages`, { content, replyToId }),
};

// ── Prayer services ────────────────────────────────────────────────────────────

export const prayerService = {
  getRequests: (params?: { page?: number; category?: string }) =>
    api.get('/prayer/requests', { params }),

  createRequest: (data: {
    title: string;
    content: string;
    category: string;
    isAnonymous?: boolean;
    isPublic?: boolean;
  }) => api.post('/prayer/requests', data),

  pray: (id: string) => api.post(`/prayer/requests/${id}/pray`),

  getBulletins: () => api.get('/prayer/bulletins'),

  getStats: () => api.get('/prayer/stats'),
};

// ── Notification services ──────────────────────────────────────────────────────

export const notificationService = {
  getAll: (params?: { page?: number; isRead?: boolean }) =>
    api.get('/notifications', { params }),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// ── Mentorship services ────────────────────────────────────────────────────────

export const mentorshipService = {
  getMentors: (params?: { page?: number; limit?: number }) =>
    api.get('/mentorship/mentors', { params }),

  requestMentorship: (mentorId: string, message: string) =>
    api.post('/mentorship/request', { mentorId, message }),

  getMyMentorships: () => api.get('/mentorship/me/mentorships'),

  getMentorProfile: () => api.get('/mentorship/me/profile'),

  getDisciples: () => api.get('/mentorship/requests'),

  getSessions: () => api.get('/mentorship/sessions'),
};
