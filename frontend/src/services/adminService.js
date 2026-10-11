import apiClient from "./apiClient";

export async function getAdminDashboard() {
  const { data } = await apiClient.get("/admin/dashboard");
  return data;
}

export async function approveSeller(sellerId) {
  await apiClient.patch(`/admin/sellers/${sellerId}/approve`);
}

export async function getSellers() {
  const { data } = await apiClient.get("/admin/sellers");
  return data;
}

export async function rejectSeller(sellerId) {
  await apiClient.patch(`/admin/sellers/${sellerId}/reject`);
}

export async function suspendSeller(sellerId) {
  await apiClient.patch(`/admin/sellers/${sellerId}/suspend`);
}

export async function getUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data;
}

export async function blockUser(userId) {
  await apiClient.patch(`/admin/users/${userId}/block`);
}

export async function unblockUser(userId) {
  await apiClient.patch(`/admin/users/${userId}/unblock`);
}

export async function getProducts() {
  const { data } = await apiClient.get("/admin/products");
  return data;
}

export async function getOrders() {
  const { data } = await apiClient.get("/admin/orders");
  return data;
}

export async function createFeaturedPromotion(payload) {
  await apiClient.post("/admin/promotions/featured", payload);
}

export async function getPromotions() {
  const { data } = await apiClient.get("/admin/promotions");
  return data;
}

export async function updatePromotion(promotionId, payload) {
  await apiClient.put(`/admin/promotions/${promotionId}`, payload);
}

export async function deletePromotion(promotionId) {
  await apiClient.delete(`/admin/promotions/${promotionId}`);
}
