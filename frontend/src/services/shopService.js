import apiClient from "./apiClient";

export async function getAllShops() {
  const { data } = await apiClient.get(`/shops`);
  return data;
}

export async function getShopBySlug(shopSlug) {
  const { data } = await apiClient.get(`/shops/${shopSlug}`);
  return data.shop || data;
}

export async function getShopPageBySlug(shopSlug) {
  const { data } = await apiClient.get(`/shops/${shopSlug}`);
  return data;
}

export async function getShopProducts(shopId, params = {}) {
  const { data } = await apiClient.get(`/shops/${shopId}/products`, { params });
  return data;
}

export async function getShopProductsBySlug(shopSlug, params = {}) {
  const { data } = await apiClient.get(`/shops/slug/${shopSlug}/products`, { params });
  return data;
}

export async function getShopReviews(shopId) {
  const { data } = await apiClient.get(`/shops/${shopId}/reviews`);
  return data;
}
