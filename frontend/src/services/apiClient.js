import axios from "axios";

const getBaseUrl = () => {
  // Avoid stale env/cache confusion during local development.
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5199/api";
  }

  return process.env.REACT_APP_API_URL || "/api";
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
});

apiClient.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === "development") {
    const fullUrl = `${config.baseURL || ""}${config.url || ""}`;
    // Helpful while tracking unexpected 404 sources.
    console.log("[api]", (config.method || "get").toUpperCase(), fullUrl);
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
