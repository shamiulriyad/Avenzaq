import apiClient from "./apiClient";

/**
 * Upload single image to variant
 * @param {string} variantId - Variant ID
 * @param {File} file - Image file
 * @param {boolean} isPrimary - Set as primary image
 * @returns {Promise<Object>} Uploaded image data
 */
export async function uploadImage(variantId, file, isPrimary = false) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams();
    if (isPrimary) params.append("isPrimary", "true");

    const { data } = await apiClient.post(
      `/productvariants/${variantId}/images?${params.toString()}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error uploading image:", error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Upload multiple images to variant
 * @param {string} variantId - Variant ID
 * @param {File[]} files - Array of image files
 * @returns {Promise<Array>} Array of uploaded image data
 */
export async function uploadMultipleImages(variantId, files) {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("files", file);
    });

    const { data } = await apiClient.post(
      `/productvariants/${variantId}/images/batch`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error uploading images:", error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Get all images for a variant
 * @param {string} variantId - Variant ID
 * @returns {Promise<Array>} List of images
 */
export async function getVariantImages(variantId) {
  try {
    const { data } = await apiClient.get(`/productvariants/${variantId}/images`);
    return data;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
}

/**
 * Delete an image
 * @param {string} imageId - Image ID
 * @returns {Promise<void>}
 */
export async function deleteImage(imageId) {
  try {
    await apiClient.delete(`/productvariants/images/${imageId}`);
  } catch (error) {
    console.error("Error deleting image:", error.response?.data?.message || error.message);
    throw error;
  }
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export function validateImageFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const errors = [];

  if (!file) {
    errors.push("No file selected");
  } else {
    if (file.size > maxSize) {
      errors.push(`File size must be less than 5 MB (current: ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be JPEG, PNG, GIF, or WEBP (current: ${file.type || "unknown"})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple image files
 * @param {File[]} files - Array of files
 * @returns {Object} Validation result
 */
export function validateImageFiles(files) {
  const errors = [];
  const validFiles = [];

  if (!files || files.length === 0) {
    errors.push("No files selected");
    return { valid: false, errors, validFiles };
  }

  files.forEach((file, index) => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push(`File ${index + 1} (${file.name}): ${validation.errors.join(", ")}`);
    }
  });

  return {
    valid: validFiles.length > 0 && errors.length === 0,
    errors,
    validFiles,
  };
}

/**
 * Create preview URL for image file
 * @param {File} file - Image file
 * @returns {string} Canvas URL for preview
 */
export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL (cleanup)
 * @param {string} url - Preview URL
 */
export function revokePreviewUrl(url) {
  URL.revokeObjectURL(url);
}

/**
 * Get image URL (full path)
 * @param {string} imageUrl - Relative image URL from API
 * @param {string} baseUrl - Optional base URL (default: window.location.origin)
 * @returns {string} Full image URL
 */
export function getImageUrl(imageUrl, baseUrl = "") {
  if (!imageUrl) return "";

  const resolvedBaseUrl =
    baseUrl ||
    apiClient.defaults?.baseURL?.replace(/\/api\/?$/, "") ||
    process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5199";

  if (imageUrl.startsWith("http")) return imageUrl;
  return `${resolvedBaseUrl}${imageUrl}`;
}

/**
 * Format image for display
 * @param {Object} image - Image object from API
 * @returns {Object} Formatted image
 */
export function formatImage(image) {
  return {
    id: image.id,
    variantId: image.variantId,
    imageUrl: image.imageUrl,
    fileName: image.fileName,
    displayOrder: image.displayOrder,
    isPrimary: image.isPrimary,
    fullUrl: getImageUrl(image.imageUrl),
  };
}

/**
 * Sort images by display order
 * @param {Array} images - List of images
 * @returns {Array} Sorted images
 */
export function sortImages(images) {
  return [...images].sort((a, b) => a.displayOrder - b.displayOrder);
}
