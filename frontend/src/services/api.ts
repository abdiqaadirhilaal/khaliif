import axios from "axios";
export const TOKEN_KEY = "khaliif_token";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use(c => { const t = localStorage.getItem(TOKEN_KEY); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) { localStorage.removeItem(TOKEN_KEY); window.location.href = "/login"; }
  return Promise.reject(e);
});
export const errMsg = (e: any) => e?.response?.data?.message || (e?.request ? "Cannot reach the server. Check that the backend is running." : "Something went wrong");
