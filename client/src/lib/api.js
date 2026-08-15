import axios from "axios";

// Resolves API Base URL:
// - In local dev (whether on laptop or Android phone on Wi-Fi),
//   uses relative paths "" so Vite proxies /api directly to the backend seamlessly.
// - In production (Vercel), uses VITE_BASE_URL (e.g. https://aven-server.vercel.app).
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BASE_URL || "";
  if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
    return "";
  }
  return envUrl;
};

axios.defaults.baseURL = getApiBaseUrl();

export default axios;
