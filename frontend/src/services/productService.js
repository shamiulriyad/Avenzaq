import apiClient from "./apiClient";
import { getImageUrl } from "./imageUploadService";

export async function getProducts(params) {
  const { data } = await apiClient.get("/products", { params });
  return data;
}

export async function getProductById(id) {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
}

function normalizeSellerProduct(product) {
  const images = Array.isArray(product.images)
    ? product.images.map((image) => getImageUrl(image)).filter(Boolean)
    : [];

  return {
    id: product.id,
    name: product.name,
    price: Number(product.finalPrice ?? product.price ?? 0),
    originalPrice: Number(product.finalPrice ?? product.price ?? 0) < Number(product.price ?? 0)
      ? Number(product.price ?? 0)
      : null,
    discountType: product.discountType || null,
    discountValue: Number(product.discountValue || 0),
    discountLabel: product.discountLabel || "",
    stock: product.stockQty ?? 0,
    category: product.categoryName || "",
    sku: product.slug || "",
    image: getImageUrl(product.primaryImageUrl) || images[0] || "",
    images: images.length > 0 ? images : (product.primaryImageUrl ? [getImageUrl(product.primaryImageUrl)] : []),
    isActive: typeof product.isActive === "boolean" ? product.isActive : true,
    status: (typeof product.isActive === "boolean" ? product.isActive : true)
      ? "active"
      : "draft",
    comparePrice: null,
  };
}

function sortSellerProducts(items, sort) {
  const list = [...items];

  switch (sort) {
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "price-low":
      return list.sort((a, b) => a.price - b.price);
    case "price-high":
      return list.sort((a, b) => b.price - a.price);
    case "stock-low":
      return list.sort((a, b) => a.stock - b.stock);
    case "oldest":
      return list;
    case "newest":
    default:
      return list.reverse();
  }
}

export async function getSellerProducts({ status, search, sort } = {}) {
  // Backend does not expose seller-only listing yet, so reuse products list for now.
  const { data } = await apiClient.get("/products");
  let items = (data || []).map(normalizeSellerProduct);

  if (status) {
    items = items.filter((item) => item.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
    );
  }

  return sortSellerProducts(items, sort);
}

export async function deleteProduct(productId) {
  await apiClient.delete(`/products/${productId}`);
}

export async function updateProductStatus(productId, status) {
  const product = await getProductById(productId);

  await apiClient.put(`/products/${productId}`, {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description || "",
    price: product.price,
    stockQty: product.stockQty ?? 0,
    isActive: status === "active",
  });
}

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @param {string} productData.categoryId - Category UUID
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {number} productData.price - Product price
 * @param {number} productData.stockQty - Stock quantity
 * @returns {Promise<Object>} Created product details
 */
export async function createProduct(productData) {
  const { data } = await apiClient.post("/products", {
    categoryId: productData.categoryId,
    name: productData.name,
    description: productData.description || "",
    price: parseFloat(productData.price),
    stockQty: parseInt(productData.stockQty) || 0,
  });
  return data;
}

/**
 * Get reviews for a specific product
 * @param {string} productId - Product ID/UUID
 * @returns {Promise<Array>} Array of review objects
 */
export async function getProductReviews(productId) {
  const { data } = await apiClient.get(`/products/${productId}/reviews`);
  return data;
}

/**
 * Get related/similar products
 * @param {string} category - Product category
 * @param {number} limit - Number of products to return (default: 4)
 * @returns {Promise<Array>} Array of related products
 */
export async function getRelatedProducts(category, limit = 4) {
  const { data } = await apiClient.get("/products", {
    params: { category, limit }
  });
  return data;
}

/**
 * Upload an image for a product
 * @param {string} productId - Product ID/UUID
 * @param {File} imageFile - Image file object from file input
 * @returns {Promise<Object>} Response with imageUrl
 */
export async function uploadProductImage(productId, imageFile) {
  if (!imageFile) {
    throw new Error("Image file is required");
  }

  if (!imageFile.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (imageFile.size > maxSize) {
    throw new Error("Image file must be smaller than 10MB");
  }

  const formData = new FormData();
  formData.append("file", imageFile);

  const { data } = await apiClient.post(
    `/products/${productId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

/**
 * Upload multiple images for a product
 * @param {string} productId - Product ID/UUID
 * @param {File[]} imageFiles - Image files from file input
 * @returns {Promise<Array>} Response with uploaded image URLs
 */
export async function uploadProductImages(productId, imageFiles) {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    throw new Error("At least one image file is required");
  }

  const formData = new FormData();
  imageFiles.forEach((file) => {
    if (file && file.type?.startsWith("image/")) {
      formData.append("images", file);
    }
  });

  const { data } = await apiClient.post(
    `/products/${productId}/images/batch`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
