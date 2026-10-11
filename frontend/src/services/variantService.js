import apiClient from "./apiClient";
import { getImageUrl } from "./imageUploadService";

/**
 * Get all variants for a specific product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} List of variants
 */
export async function getProductVariants(productId) {
  try {
    const { data } = await apiClient.get(`/productvariants/product/${productId}`);
    return data;
  } catch (error) {
    console.error("Error fetching variants:", error);
    throw error;
  }
}

/**
 * Get variant by ID
 * @param {string} variantId - Variant ID
 * @returns {Promise<Object>} Variant details with images
 */
export async function getVariantById(variantId) {
  try {
    const { data } = await apiClient.get(`/productvariants/${variantId}`);
    return data;
  } catch (error) {
    console.error("Error fetching variant:", error);
    throw error;
  }
}

/**
 * Get variant by SKU
 * @param {string} sku - Variant SKU
 * @returns {Promise<Object>} Variant details
 */
export async function getVariantBySku(sku) {
  try {
    const { data } = await apiClient.get(`/productvariants/sku/${sku}`);
    return data;
  } catch (error) {
    console.error("Error fetching variant by SKU:", error);
    throw error;
  }
}

/**
 * Create a new variant for a product
 * @param {string} productId - Product ID
 * @param {Object} variantData - Variant data
 * @param {string} variantData.color - Color
 * @param {string} variantData.size - Size
 * @param {number} variantData.price - Price
 * @param {number} variantData.stock - Stock quantity
 * @param {string} variantData.sku - Unique SKU
 * @returns {Promise<Object>} Created variant
 */
export async function createVariant(productId, variantData) {
  try {
    const { data } = await apiClient.post(
      `/productvariants/${productId}/variants`,
      variantData
    );
    return data;
  } catch (error) {
    console.error("Error creating variant:", error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Update an existing variant
 * @param {string} variantId - Variant ID
 * @param {Object} variantData - Updated variant data
 * @returns {Promise<Object>} Updated variant
 */
export async function updateVariant(variantId, variantData) {
  try {
    const { data } = await apiClient.put(
      `/productvariants/${variantId}`,
      variantData
    );
    return data;
  } catch (error) {
    console.error("Error updating variant:", error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Delete a variant
 * @param {string} variantId - Variant ID
 * @returns {Promise<void>}
 */
export async function deleteVariant(variantId) {
  try {
    await apiClient.delete(`/productvariants/${variantId}`);
  } catch (error) {
    console.error("Error deleting variant:", error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Format variant for display
 * @param {Object} variant - Variant from API
 * @returns {Object} Formatted variant
 */
export function formatVariant(variant) {
  const originalPrice = Number(variant.price || 0);
  const finalPrice = Number(variant.finalPrice ?? variant.price ?? 0);
  const normalizedImages = Array.isArray(variant.images)
    ? variant.images
        .map((img) => {
          if (!img) return "";
          if (typeof img === "string") return getImageUrl(img);
          return getImageUrl(img.imageUrl || img.url || "");
        })
        .filter(Boolean)
    : [];

  return {
    id: variant.id,
    productId: variant.productId,
    sellerProductId: variant.sellerProductId,
    sellerId: variant.sellerId,
    color: variant.color,
    size: variant.size,
    price: finalPrice,
    originalPrice: finalPrice < originalPrice ? originalPrice : null,
    finalPrice,
    discountType: variant.discountType || null,
    discountValue: Number(variant.discountValue || 0),
    discountLabel: variant.discountLabel || "",
    discountApplied: Boolean(variant.discountApplied ?? (finalPrice < originalPrice)),
    stock: Number(variant.stock || 0),
    sku: variant.sku,
    isActive: variant.isActive !== false,
    images: normalizedImages,
    primaryImage: normalizedImages[0] || null,
    label: `${variant.color || ""}${variant.size ? " - " + variant.size : ""}`.trim() || `Variant ${String(variant.id || "").slice(0, 8)}`
  };
}

/**
 * Check if variant is in stock
 * @param {Object} variant - Variant object
 * @returns {boolean}
 */
export function isVariantInStock(variant) {
  return variant.stock > 0 && variant.isActive;
}

/**
 * Format variants list for display
 * @param {Array} variants - List of variants
 * @returns {Array} Formatted variants
 */
export function formatVariantsList(variants) {
  return variants.map(formatVariant);
}
