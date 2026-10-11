import apiClient from "./apiClient";

export async function registerSeller(payload) {
  const { data } = await apiClient.post("/sellers/register", payload);
  return data;
}

export async function getSellerDashboard(dateRange = "week") {
  const { data } = await apiClient.get("/sellers/me/dashboard", {
    params: { dateRange }
  });
  return data;
}

export async function getSellerProfile() {
  const { data } = await apiClient.get("/sellers/me/profile");
  return data;
}

export async function updateSellerProfile(payload) {
  const { data } = await apiClient.put("/sellers/me/profile", payload);
  return data;
}

export async function getSellerEarnings() {
  const { data } = await apiClient.get("/sellers/me/earnings");
  return data;
}

export async function requestPayout(amount) {
  const { data } = await apiClient.post("/sellers/me/payout/request", { amount });
  return data;
}
