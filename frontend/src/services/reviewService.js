import apiClient from "./apiClient";

export async function getProductReviews(productId) {
  const { data } = await apiClient.get(`/reviews/product/${productId}`);
  return data;
}

export async function createReview(payload) {
  const { data } = await apiClient.post("/reviews", payload);
  return data;
}

export async function getSellerReviews(filters = {}) {
  const { data } = await apiClient.get("/sellers/me/reviews", { params: filters });
  return data;
}

export async function replyToReview(reviewId, comment) {
  const { data } = await apiClient.post(`/reviews/${reviewId}/reply`, { comment });
  return data;
}
