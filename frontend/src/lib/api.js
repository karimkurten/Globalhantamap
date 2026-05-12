import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// withCredentials so the HttpOnly session cookie is sent on every request.
export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const fetchOutbreaks = (params) =>
  api.get("/outbreaks", { params }).then((r) => r.data);
export const fetchOutbreak = (code) =>
  api.get(`/outbreaks/${code}`).then((r) => r.data);
export const fetchGlobalStats = () =>
  api.get("/stats/global").then((r) => r.data);
export const fetchGlobalTimeline = () =>
  api.get("/stats/timeline-global").then((r) => r.data);
export const fetchNews = (limit = 20) =>
  api.get("/news", { params: { limit } }).then((r) => r.data);
export const fetchBreakingNews = () =>
  api.get("/news/breaking").then((r) => r.data);
export const fetchAdSlots = () => api.get("/ad-slots").then((r) => r.data);
export const fetchConfig = () => api.get("/config").then((r) => r.data);
export const subscribe = (payload) =>
  api.post("/subscribe", payload).then((r) => r.data);
export const aiSummary = (payload) =>
  api.post("/ai/summary", payload).then((r) => r.data);

// Admin (HttpOnly cookie auth - no token in localStorage)
export const adminLogin = (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return axios
    .post(`${API}/auth/login`, form, {
      withCredentials: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((r) => r.data);
};
export const adminLogout = () => api.post("/auth/logout").then((r) => r.data);
export const adminMe = () => api.get("/auth/me").then((r) => r.data);
export const adminFetchOutbreaks = () =>
  api.get("/admin/outbreaks").then((r) => r.data);
export const adminUpdateOutbreak = (code, patch) =>
  api.patch(`/admin/outbreaks/${code}`, patch).then((r) => r.data);
export const adminFetchNews = () => api.get("/admin/news").then((r) => r.data);
export const adminCreateNews = (item) =>
  api.post("/admin/news", item).then((r) => r.data);
export const adminDeleteNews = (id) =>
  api.delete(`/admin/news/${id}`).then((r) => r.data);
export const adminFetchSubs = () =>
  api.get("/admin/subscriptions").then((r) => r.data);
export const adminFetchAdSlots = () =>
  api.get("/admin/ad-slots").then((r) => r.data);
export const adminUpdateAdSlot = (key, body) =>
  api.patch(`/admin/ad-slots/${key}`, body).then((r) => r.data);
export const adminAnalytics = () =>
  api.get("/admin/analytics").then((r) => r.data);
export const adminRefreshNow = () =>
  api.post("/admin/refresh-now").then((r) => r.data);
export const adminReseed = () => api.post("/admin/reseed").then((r) => r.data);
export const adminClearSeed = () =>
  api.post("/admin/clear-seed-outbreaks").then((r) => r.data);
export const adminAiBackfill = () =>
  api.post("/admin/ai-backfill-outbreaks").then((r) => r.data);
export const fetchHealth = () => api.get("/health").then((r) => r.data);
