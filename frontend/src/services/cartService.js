import apiClient from "./apiClient";

export async function getCart() {
  const { data } = await apiClient.get("/cart");
  return data;
}

export async function addItem(payload) {
  const { data } = await apiClient.post("/cart/items", payload);
  return data;
}

export async function updateItem(itemId, quantity) {
  const { data } = await apiClient.put(`/cart/items/${itemId}`, { quantity });
  return data;
}

export async function removeItem(itemId) {
  const { data } = await apiClient.delete(`/cart/items/${itemId}`);
  return data;
}
