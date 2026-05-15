import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const ACCESS_TOKEN_KEY = 'breed_access_token';
const REFRESH_TOKEN_KEY = 'breed_refresh_token';

// ── Token helpers ─────────────────────────────────────────────────────────────

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// ── Axios instance ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────────

// Track whether a token refresh is already in flight to avoid multiple
// concurrent refresh calls when several requests 401 at the same time.
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processPendingQueue = (error: unknown, token: string | null): void => {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      resolve(api(config));
    } else {
      reject(new Error('No token available after refresh'));
    }
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response.data?.data ?? response.data,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(
          new Error('Session expired. Please log in again.'),
        );
      }

      if (isRefreshing) {
        // Queue this request until the refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use a bare axios call so this request does NOT go through the
        // interceptors again (avoids infinite loops).
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const responseData = refreshResponse.data;
        // Handle both { accessToken, refreshToken } and { data: { ... } }
        const newAccessToken: string =
          responseData?.data?.accessToken ?? responseData?.accessToken;
        const newRefreshToken: string =
          responseData?.data?.refreshToken ?? responseData?.refreshToken;

        setTokens(newAccessToken, newRefreshToken);
        processPendingQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-401 errors: unwrap the error message from the response body
    const data = error.response?.data as
      | { message?: string }
      | undefined;
    const message =
      data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject(new Error(message));
  },
);

export default api;
