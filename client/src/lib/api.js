import axios from "axios";

// Resolves API Base URL dynamically:
// - On mobile devices (e.g. Android phone over Wi-Fi), replaces 'localhost'
//   with the active device hostname (e.g. 10.45.x.x or 192.168.x.x) so API requests reach the Express server.
// - On desktop localhost, uses localhost:3000.
// - In production (Vercel), uses VITE_BASE_URL.
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
  if (typeof window !== "undefined" && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return `http://${host}:3000`;
      }
    }
  }
  return envUrl;
};

axios.defaults.baseURL = getApiBaseUrl();

export default axios;
