import axios from "axios";

// Resolves API Base URL:
// - In production (Vercel deployment), uses VITE_BASE_URL (e.g. https://aven-server.vercel.app).
// - In local development accessed over Wi-Fi / local IP, resolves to http://<hostname>:3000.
// - In local desktop dev, uses relative paths "" (proxied by Vite dev server).
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BASE_URL;

  // 1. If VITE_BASE_URL is explicitly set, use it (removing any trailing slash)
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 2. If running in local network dev over Wi-Fi / local IP (e.g. 10.x.x.x, 192.168.x.x, 172.x.x.x)
  if (typeof window !== "undefined" && window.location.hostname) {
    const host = window.location.hostname;
    const isLocalNetworkIp =
      /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|.*\.local$)/.test(host);

    if (isLocalNetworkIp) {
      return `http://${host}:3000`;
    }
  }

  // 3. Fallback for relative requests
  return "";
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

