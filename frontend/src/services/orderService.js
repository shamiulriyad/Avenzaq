import apiClient from "./apiClient";

export async function checkout(payload) {
  const { data } = await apiClient.post("/orders/checkout", payload);
  return data;
}

export async function getMyOrders() {
  const { data } = await apiClient.get("/orders/my");
  return data;
}

export async function getSellerOrders() {
  const { data } = await apiClient.get("/sellers/orders");
  return data;
}

export async function updateSellerOrderStatus(orderId, status) {
  await apiClient.patch(`/sellers/orders/${orderId}/status`, null, {
    params: { status },
  });
}
