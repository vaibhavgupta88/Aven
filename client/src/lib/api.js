import axios from "axios";

// Resolves API Base URL:
// - On local desktop dev: http://localhost:3000
// - On local mobile / Wi-Fi dev: http://<local-ip>:3000
// - On deployed Vercel production: "" (relative URL hitting current active deployment)
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BASE_URL;

  // 1. If VITE_BASE_URL is explicitly set to a valid external URL, use it
  if (
    envUrl &&
    envUrl.trim() !== "" &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1")
  ) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 2. Local network or desktop dev detection
  if (typeof window !== "undefined" && window.location.hostname) {
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3000";
    }

    const isLocalNetworkIp =
      /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|.*\.local$)/.test(host);

    if (isLocalNetworkIp) {
      return `http://${host}:3000`;
    }
  }

  // 3. Fallback for deployed production (relative URL hits active deployment)
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
      error.message =
        "Network error: Unable to connect to server. Please check your connection.";
    }
    return Promise.reject(error);
  }
);

export default axios;
