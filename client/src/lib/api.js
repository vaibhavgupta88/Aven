import axios from "axios";

// Resolves API Base URL:
// - In production (Vercel deployment), uses VITE_BASE_URL (e.g. https://aven-server.vercel.app).
// - In local development accessed over Wi-Fi / local IP, resolves to http://<hostname>:3000.
// - In local desktop dev, uses relative paths "" (proxied by Vite dev server).
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BASE_URL;

  // 1. If VITE_BASE_URL is set to a real production URL (e.g. https://aven-server.vercel.app), use it
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }

  // 2. If running locally in browser and accessing via local IP or mobile Wi-Fi
  if (typeof window !== "undefined" && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:3000`;
    }
  }

  // 3. Fallback for desktop dev (Vite server proxying)
  return envUrl && envUrl.startsWith("http") ? envUrl : "";
};

axios.defaults.baseURL = getApiBaseUrl();

// Global Axios Interceptor for network and server error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) {
      error.message = serverMessage;
    } else if (error.code === "ERR_NETWORK" || !error.response) {
      error.message = "Network error: Unable to connect to server. Please check your connection.";
    }
    return Promise.reject(error);
  }
);

export default axios;

