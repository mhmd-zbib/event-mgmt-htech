// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_SORT_ORDER = 'DESC';

// Toast notification durations
export const TOAST_SUCCESS_DURATION = 3000; // 3 seconds
export const TOAST_ERROR_DURATION = 5000; // 5 seconds

// Local storage keys
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/events/${id}`,
  EVENT_CREATE: '/events/create',
  EVENT_EDIT: (id: string) => `/events/${id}/edit`,
  CATEGORIES: '/categories',
  CATEGORY_CREATE: '/categories/create',
  CATEGORY_EDIT: (id: string) => `/categories/${id}/edit`,
  TAGS: '/tags',
  TAG_CREATE: '/tags/create',
  TAG_EDIT: (id: string) => `/tags/${id}/edit`,
};
