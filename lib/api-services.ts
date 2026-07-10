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

export type ActivityType =
  | 'OVERALL'
  | 'DEVOTIONAL_READ'
  | 'PRAYER_PRAYED'
  | 'LESSON_COMPLETED'
  | 'COMMUNITY_ENGAGED'
  | 'MENTORSHIP_TASK_COMPLETED'
  | 'MENTORSHIP_SESSION_ATTENDED';

export interface DayActivity {
  date: string;
  label: string;
  activities: ActivityType[];
  isToday: boolean;
}

export interface ActivityStreakStat {
  current: number;
  longest: number;
  label: string;
}

export interface WeekStreakResult {
  currentStreak: number;
  longestStreak: number;
  days: DayActivity[];
  breakdown: Partial<Record<ActivityType, ActivityStreakStat>>;
}

export interface CalendarDay {
  date: string;
  activities: ActivityType[];
  count: number;
}

export interface StreakStatsResult {
  overall: { current: number; longest: number };
  breakdown: Partial<Record<ActivityType, ActivityStreakStat>>;
  calendar: CalendarDay[];
  totalActiveDays: number;
  mostActiveType: ActivityType | null;
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

  getPublicProfile: (id: string) => api.get(`/users/${id}`),

  setAvatarUrl: (url: string) => api.patch('/users/me/avatar', { url }),

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
      streak: { currentStreak: number; longestStreak: number };
      prayerCount: number;
      communitiesJoined: number;
    }>('/users/me/stats'),

  getWeekStreak: () => api.get<WeekStreakResult>('/users/me/streak/week'),

  getStreakStats: () => api.get<StreakStatsResult>('/users/me/streak/stats'),

  activateStreakFreeze: () => api.post<{ message: string }>('/users/me/streak/freeze'),

  follow:   (id: string) => api.post(`/users/${id}/follow`),
  unfollow: (id: string) => api.delete(`/users/${id}/follow`),

  getFollowers: (id: string) => api.get(`/users/${id}/followers`),

  lookup: (q: string) => api.get(`/users/lookup?q=${encodeURIComponent(q)}`),
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

  syncChapters: (courseId: string, data: {
    chapters: { editorId: string; title: string; sortOrder: number }[];
  }) => api.post(`/courses/${courseId}/chapters/sync`, data),

  createLesson: (courseId: string, data: {
    title: string;
    description?: string;
    content?: string;
    type: string;
    sortOrder?: number;
    chapterId?: string;
    isPublished?: boolean;
  }) => api.post(`/courses/${courseId}/lessons`, data),

  updateLesson: (courseId: string, lessonId: string, data: {
    title?: string;
    description?: string;
    content?: string;
    sortOrder?: number;
    chapterId?: string;
    isPublished?: boolean;
  }) => api.patch(`/courses/${courseId}/lessons/${lessonId}`, data),

  deleteLesson: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`),

  enroll: (id: string) => api.post(`/courses/${id}/enroll`),

  getAuthored: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/courses/me/authored', { params }),

  getEnrolled: () => api.get('/courses/me/enrolled'),

  getCompleted: () => api.get('/courses/me/completed'),

  getProgress: (id: string) => api.get(`/courses/${id}/progress`),

  getMyQuizResults: (courseId: string) => api.get(`/courses/${courseId}/my-quiz-results`),

  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),

  getCourseQuiz: (courseId: string) =>
    api.get(`/courses/${courseId}/quizzes/author`),

  createQuiz: (courseId: string, data: {
    title: string;
    description?: string;
    passMark: number;
    timeLimit?: number;
    questions: {
      question: string;
      type: string;
      options?: string[];
      correctAnswer: unknown;
      explanation?: string;
      points?: number;
      sortOrder?: number;
    }[];
  }) => api.post(`/courses/${courseId}/quizzes`, data),

  deleteQuiz: (courseId: string, quizId: string) =>
    api.delete(`/courses/${courseId}/quizzes/${quizId}`),

  // Lesson quizzes
  getLessonQuizForAuthor: (courseId: string, lessonId: string) =>
    api.get(`/courses/${courseId}/lessons/${lessonId}/quiz/author`),

  createLessonQuiz: (courseId: string, lessonId: string, data: {
    title: string;
    description?: string;
    passMark: number;
    timeLimit?: number;
    questions: {
      question: string;
      type: string;
      options?: string[];
      correctAnswer: unknown;
      explanation?: string;
      points?: number;
      sortOrder?: number;
    }[];
  }) => api.post(`/courses/${courseId}/lessons/${lessonId}/quiz`, data),

  deleteLessonQuiz: (courseId: string, lessonId: string, quizId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}/quiz/${quizId}`),

  // Learner quiz fetch (no correct answers)
  getQuizForLearner: (quizId: string) =>
    api.get(`/courses/quizzes/${quizId}`),

  submitQuiz: (quizId: string, data: { answers: { questionId: string; answer: unknown }[] }) =>
    api.post(`/courses/quizzes/${quizId}/submit`, data),
};

// ── Devotional services ────────────────────────────────────────────────────────

export const devotionalService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    authorId?: string;
    search?: string;
  }) => api.get('/devotionals', { params }),

  getToday: () => api.get('/devotionals/today'),

  getFeatured: () => api.get('/devotionals/featured'),

  getById: (id: string) => api.get(`/devotionals/${id}`),

  toggleBookmark: (id: string) => api.post(`/devotionals/${id}/bookmark`),

  getBookmarks: (params?: { page?: number; limit?: number }) =>
    api.get('/devotionals/me/bookmarks', { params }),

  react: (id: string, type: string) =>
    api.post(`/devotionals/${id}/react`, { type }),

  getComments: (id: string) => api.get(`/devotionals/${id}/comments`),

  addComment: (id: string, content: string, parentId?: string) =>
    api.post(`/devotionals/${id}/comments`, { content, parentId }),

  // Subscriptions
  getFeed: (params?: { page?: number; limit?: number }) =>
    api.get('/devotionals/me/feed', { params }),

  getMySubscriptions: () => api.get('/devotionals/me/subscriptions'),

  toggleSubscription: (authorId: string) =>
    api.post(`/devotionals/authors/${authorId}/subscribe`),

  getAuthorStats: (authorId: string) =>
    api.get(`/devotionals/authors/${authorId}`),

  // Preacher: create / update
  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    seriesId?: string;
    categoryId?: string;
    bibleReference?: string;
    tags?: string[];
    status?: string;
    coverImageUrl?: string;
    estimatedMinutes?: number;
    scheduledFor?: string;
  }) => api.post('/devotionals', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/devotionals/${id}`, data),

  delete: (id: string) => api.delete(`/devotionals/${id}`),

  getCategories: () => api.get('/devotionals/categories'),

  // Series
  getAllSeries: (params?: { page?: number; limit?: number; authorId?: string }) =>
    api.get('/devotionals/series', { params }),

  getSeriesById: (id: string) => api.get(`/devotionals/series/${id}`),

  createSeries: (data: { title: string; description?: string; coverImageUrl?: string }) =>
    api.post('/devotionals/series', data),

  updateSeries: (id: string, data: { title?: string; description?: string; coverImageUrl?: string }) =>
    api.patch(`/devotionals/series/${id}`, data),

  toggleSeriesSubscription: (seriesId: string) =>
    api.post(`/devotionals/series/${seriesId}/subscribe`),

  getSeriesFeed: (params?: { page?: number; limit?: number }) =>
    api.get('/devotionals/me/series-feed', { params }),

  getMySeriesSubscriptions: () => api.get('/devotionals/me/series-subscriptions'),
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
    coverImage?: string;
  }) => api.post('/communities', data),

  join: (id: string) => api.post(`/communities/${id}/join`),

  leave: (id: string) => api.delete(`/communities/${id}/join`),

  getMessages: (
    id: string,
    params?: { cursor?: string; limit?: number },
  ) => api.get(`/communities/${id}/messages`, { params }),

  sendMessage: (id: string, content: string, replyToId?: string) =>
    api.post(`/communities/${id}/messages`, { content, replyToId }),

  invite: (id: string, data: { recipientId: string; message?: string }) =>
    api.post(`/communities/${id}/invite`, data),

  updateCommunity: (id: string, data: {
    name?: string;
    description?: string;
    privacy?: string;
    maxMembers?: number;
    coverImage?: string;
  }) => api.patch(`/communities/${id}`, data),

  deleteCommunity: (id: string) => api.delete(`/communities/${id}`),

  getMembers: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/communities/${id}/members`, { params }),

  updateMemberRole: (id: string, userId: string, role: string) =>
    api.patch(`/communities/${id}/members/${userId}/role`, { role }),

  banMember: (id: string, userId: string, reason?: string) =>
    api.post(`/communities/${id}/members/${userId}/ban`, { reason }),

  unbanMember: (id: string, userId: string) =>
    api.delete(`/communities/${id}/members/${userId}/ban`),

  removeMember: (id: string, userId: string) =>
    api.delete(`/communities/${id}/members/${userId}`),
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

  getBulletins: (params?: { page?: number; limit?: number }) =>
    api.get('/prayer/bulletins', { params }),

  getTodaysBulletin: () => api.get('/prayer/bulletins/today'),

  getBulletinById: (id: string) => api.get(`/prayer/bulletins/${id}`),

  getBulletinsByCategory: (category: string, params?: { page?: number; limit?: number }) =>
    api.get(`/prayer/bulletins/category/${category}`, { params }),

  toggleBulletinBookmark: (id: string) =>
    api.post(`/prayer/bulletins/${id}/bookmark`),

  getBulletinBookmarks: (params?: { page?: number; limit?: number }) =>
    api.get('/prayer/bulletins/bookmarks', { params }),

  getStats: () => api.get('/prayer/stats'),
};

// ── Meeting services ───────────────────────────────────────────────────────────

export const meetingsService = {
  create: (data: {
    title: string;
    description?: string;
    scheduledAt: string;
    duration?: number;
    meetingLink?: string;
    platform?: string;
    communityId?: string;
    type?: 'COMMUNITY' | 'OPEN';
    attendeeIds?: string[];
    reminderMinutes?: number[];
    isRecurring?: boolean;
    recurrence?: { frequency: 'daily' | 'weekly' | 'monthly'; endsAt: string };
  }) => api.post('/meetings', data),

  getAll: (params?: {
    status?: string;
    from?: string;
    to?: string;
    type?: 'COMMUNITY' | 'OPEN';
    page?: number;
    limit?: number;
  }) => api.get('/meetings', { params }),

  getUpcoming: () => api.get('/meetings/upcoming'),

  getById: (id: string) => api.get(`/meetings/${id}`),

  update: (id: string, data: {
    title?: string;
    description?: string;
    scheduledAt?: string;
    duration?: number;
    meetingLink?: string;
    platform?: string;
  }) => api.patch(`/meetings/${id}`, data),

  cancel: (id: string) => api.post(`/meetings/${id}/cancel`),

  addAttendee: (id: string, userId: string) =>
    api.post(`/meetings/${id}/attendees`, { userId }),

  markAttendance: (id: string) => api.post(`/meetings/${id}/attend`),

  markLeft: (id: string) => api.post(`/meetings/${id}/leave`),
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
  // ── Discovery ────────────────────────────────────────────────────────────────
  getMentors: (params?: { page?: number; limit?: number }) =>
    api.get('/mentorship/mentors', { params }),
  getMentorById: (id: string) => api.get(`/mentorship/mentors/${id}`),

  // ── Mentor profile (preacher) ─────────────────────────────────────────────
  getMentorProfile: () => api.get('/mentorship/me/profile'),
  createMentorProfile: (data: { bio?: string; specializations?: string[]; maxDisciples?: number; sessionRate?: number }) =>
    api.post('/mentorship/me/profile', data),
  updateMentorProfile: (data: {
    bio?: string; specializations?: string[]; maxDisciples?: number; isAccepting?: boolean;
    availabilitySchedule?: { days: number[]; startHour: number; endHour: number; slotDuration?: number; blockedDates?: string[] } | null;
  }) => api.patch('/mentorship/me/profile', data),
  toggleBreak: (breakEndsAt?: string) =>
    api.post('/mentorship/me/break', { breakEndsAt }),
  getMentorStats: () => api.get('/mentorship/me/stats'),

  // ── Requests & lifecycle ──────────────────────────────────────────────────
  requestMentorship: (mentorId: string, message?: string, proposedSessionAt?: string, proposedTopic?: string) =>
    api.post('/mentorship/request', { mentorId, message, proposedSessionAt, proposedTopic }),

  getMentorAvailability: (mentorId: string, month?: string) =>
    api.get<{ schedule: any; bookedSlots: { start: string; duration: number }[] }>(`/mentorship/mentors/${mentorId}/availability`, { params: { month } }),
  getMyMentorships: (params?: { role?: 'mentor' | 'disciple'; status?: string; page?: number; limit?: number }) =>
    api.get('/mentorship/me/mentorships', { params }),
  getIncomingRequests: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/mentorship/requests', { params }),
  getDisciples: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/mentorship/me/mentees', { params }),
  getMentorship: (id: string) => api.get(`/mentorship/${id}`),
  respondToRequest: (id: string, action: 'accept' | 'reject', rejectionReason?: string) =>
    api.post(`/mentorship/${id}/respond`, { action, rejectionReason }),
  pauseMentorship: (id: string) => api.post(`/mentorship/${id}/pause`),
  resumeMentorship: (id: string) => api.post(`/mentorship/${id}/resume`),
  endMentorship: (id: string, reason?: string) => api.post(`/mentorship/${id}/end`, { reason }),

  // ── Sessions ──────────────────────────────────────────────────────────────
  getMySessions: (params?: { page?: number; limit?: number }) =>
    api.get('/mentorship/me/sessions', { params }),
  getSessionById: (id: string) => api.get(`/mentorship/sessions/${id}`),
  createSession: (data: { mentorshipId: string; title: string; scheduledAt: string; duration?: number; meetingLink?: string; description?: string }) =>
    api.post('/mentorship/sessions', data),
  updateSession: (id: string, data: { scheduledAt?: string; meetingLink?: string; title?: string; duration?: number }) =>
    api.patch(`/mentorship/sessions/${id}`, data),
  cancelSession: (id: string) => api.post(`/mentorship/sessions/${id}/cancel`),
  completeSession: (id: string) => api.post(`/mentorship/sessions/${id}/complete`),

  // ── Tasks ─────────────────────────────────────────────────────────────────
  getMyTasks: (params?: { mentorshipId?: string; page?: number; limit?: number }) =>
    api.get('/mentorship/me/tasks', { params }),
  createTask: (data: { mentorshipId: string; discipleId: string; title: string; description?: string; dueDate?: string }) =>
    api.post('/mentorship/tasks', data),
  completeTask: (id: string) => api.post(`/mentorship/tasks/${id}/complete`),

  // ── Assessments ───────────────────────────────────────────────────────────
  getMyAssessments: (params?: { page?: number; limit?: number }) =>
    api.get('/mentorship/me/assessments', { params }),
  createAssessment: (data: { mentorshipId: string; discipleId: string; title: string; content: string; dueDate?: string }) =>
    api.post('/mentorship/assessments', data),
  submitAssessment: (id: string, response: string) =>
    api.post(`/mentorship/assessments/${id}/submit`, { response }),
  gradeAssessment: (id: string, grade: number, feedback?: string) =>
    api.post(`/mentorship/assessments/${id}/grade`, { grade, feedback }),

  // ── Reports ───────────────────────────────────────────────────────────────
  getMyReports: (params?: { page?: number; limit?: number }) =>
    api.get('/mentorship/me/reports', { params }),
  generateReport: (mentorshipId: string) => api.post(`/mentorship/${mentorshipId}/report`),
};

// ── Accountability services ────────────────────────────────────────────────────

export const accountabilityService = {
  createPartnership: (data: {
    email?: string;
    username?: string;
    prayerDays: string[];
    prayerTime: string;
    timezone?: string;
  }) => api.post('/accountability/partnerships', data),

  getMyPartnerships: () => api.get('/accountability/partnerships'),

  getPartnershipById: (id: string) => api.get(`/accountability/partnerships/${id}`),

  updatePartnership: (id: string, data: { prayerDays?: string[]; prayerTime?: string; timezone?: string }) =>
    api.patch(`/accountability/partnerships/${id}`, data),

  endPartnership: (id: string) => api.delete(`/accountability/partnerships/${id}`),

  getInviteInfo: (token: string) => api.get(`/accountability/join/${token}`),

  acceptInvite: (token: string) => api.post(`/accountability/join/${token}`),

  startPrayerSession: (partnershipId: string) =>
    api.post(`/accountability/partnerships/${partnershipId}/start-session`),

  leaveSession: (sessionId: string) =>
    api.post(`/accountability/sessions/${sessionId}/leave`),

  getStreaks: (partnershipId: string) =>
    api.get(`/accountability/partnerships/${partnershipId}/streaks`),
};

// ── Admin services ─────────────────────────────────────────────────────────────

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),

  getUserGrowth: (days?: number) =>
    api.get('/admin/analytics/user-growth', { params: { days } }),

  getActivityAnalytics: (days?: number) =>
    api.get('/admin/analytics/activity', { params: { days } }),

  getContentAnalytics: () => api.get('/admin/analytics/content'),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => api.get('/admin/users', { params }),

  updateUserStatus: (id: string, status: string) =>
    api.patch(`/admin/users/${id}/status`, { status }),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};
