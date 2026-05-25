// src/utils/api.js
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api").replace(/\/$/, "");
const APP_URL = API_BASE_URL.replace(/\/api$/, "");
const STORAGE_URL = (import.meta.env.VITE_STORAGE_URL || `${APP_URL}/storage`).replace(/\/$/, "");

export const getApiUrl = () => API_BASE_URL;
export const getStorageUrl = () => STORAGE_URL;
export const getAppUrl = () => APP_URL;

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/storage/")) return `${APP_URL}${path}`;
  if (path.startsWith("storage/")) return `${APP_URL}/${path}`;
  return `${STORAGE_URL}/${path}`;
};

export const apiRequest = async (url, method = "GET", body = null, token = null, isFormData = false) => {
  const options = { method, headers: { Accept: "application/json" } };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (body) {
    if (isFormData) options.body = body;
    else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }
  const response = await fetch(`${API_BASE_URL}${url}`, options);
  if (method === "GET" && response.status === 404) return { success: false, data: null };
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
};