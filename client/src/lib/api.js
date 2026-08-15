import axios from "axios";

// Resolves API Base URL dynamically:
// When testing on mobile devices (e.g. Android phone over Wi-Fi), replaces 'localhost'
// with the current device's hostname (e.g. 192.168.x.x) so API requests reach the backend.
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    envUrl.includes("localhost")
  ) {
    return envUrl.replace("localhost", window.location.hostname);
  }
  return envUrl;
};

axios.defaults.baseURL = getApiBaseUrl();

export default axios;
