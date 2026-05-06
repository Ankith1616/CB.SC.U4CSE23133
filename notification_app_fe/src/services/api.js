import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Notification APIs ─────────────────────── */

export const fetchNotifications = (params = {}) =>
  api.get('/notifications', { params }).then((r) => r.data);

export const fetchNotification = (id) =>
  api.get(`/notifications/${id}`).then((r) => r.data);

export const fetchUnreadCount = () =>
  api.get('/notifications/unread/count').then((r) => r.data);

export const markAsRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllAsRead = () =>
  api.patch('/notifications/read/all').then((r) => r.data);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`).then((r) => r.data);

export const createNotification = (data) =>
  api.post('/notifications', data).then((r) => r.data);

/* ── Preference APIs ───────────────────────── */

export const fetchPreferences = () =>
  api.get('/preferences').then((r) => r.data);

export const updatePreferences = (data) =>
  api.put('/preferences', data).then((r) => r.data);

/* ── Auth (Demo) ───────────────────────────── */

export const getAuthToken = (userData = {}) =>
  axios
    .post(`${API_BASE}/auth/token`, userData)
    .then((r) => r.data);

export default api;
