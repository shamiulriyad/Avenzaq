import apiClient from "./apiClient";

export async function login(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function getProfile() {
  const { data } = await apiClient.get("/users/me");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.put("/users/me", payload);
  return data;
}
