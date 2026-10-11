import {
  uploadImage,
  uploadMultipleImages,
  getVariantImages,
  deleteImage,
  validateImageFile,
  validateImageFiles,
  createPreviewUrl,
  revokePreviewUrl,
  getImageUrl,
  formatImage,
  sortImages,
} from "./imageUploadService";

/**
 * Image Manager for variant images
 */
export class VariantImageManager {
  constructor(variantId) {
    this.variantId = variantId;
    this.images = [];
    this.isLoading = false;
    this.error = null;
  }

  /**
   * Load all images for this variant
   * @returns {Promise<Array>}
   */
  async loadImages() {
    try {
      this.isLoading = true;
      this.error = null;
      this.images = await getVariantImages(this.variantId);
      return sortImages(this.images);
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Add single image
   * @param {File} file
   * @param {boolean} isPrimary
   * @returns {Promise<Object>}
   */
  async addImage(file, isPrimary = false) {
    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      const uploadedImage = await uploadImage(this.variantId, file, isPrimary);
      this.images.push(uploadedImage);

      if (isPrimary) {
        this.images.forEach(img => {
          if (img.id !== uploadedImage.id) {
            img.isPrimary = false;
          }
        });
      }

      return formatImage(uploadedImage);
    } catch (error) {
      this.error = error.message;
      throw error;
    }
  }

  /**
   * Add multiple images
   * @param {File[]} files
   * @returns {Promise<Array>}
   */
  async addImages(files) {
    try {
      const validation = validateImageFiles(files);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      const uploadedImages = await uploadMultipleImages(
        this.variantId,
        validation.validFiles
      );
      this.images = [...this.images, ...uploadedImages];

      return uploadedImages.map(formatImage);
    } catch (error) {
      this.error = error.message;
      throw error;
    }
  }

  /**
   * Remove image
   * @param {string} imageId
   * @returns {Promise<void>}
   */
  async removeImage(imageId) {
    try {
      await deleteImage(imageId);
      this.images = this.images.filter(img => img.id !== imageId);
    } catch (error) {
      this.error = error.message;
      throw error;
    }
  }

  /**
   * Get primary image
   * @returns {Object|null}
   */
  getPrimaryImage() {
    return this.images.find(img => img.isPrimary) || null;
  }

  /**
   * Get all images sorted by display order
   * @returns {Array}
   */
  getSortedImages() {
    return sortImages(this.images);
  }

  /**
   * Get image by ID
   * @param {string} imageId
   * @returns {Object|null}
   */
  getImage(imageId) {
    return this.images.find(img => img.id === imageId) || null;
  }

  /**
   * Format all images for display
   * @returns {Array}
   */
  getFormattedImages() {
    return sortImages(this.images).map(formatImage);
  }

  /**
   * Clear all data
   */
  clear() {
    this.images = [];
    this.error = null;
  }
}

/**
 * Create image preview with cleanup
 */
export class ImagePreview {
  constructor() {
    this.urls = new Map();
  }

  /**
   * Create preview from file
   * @param {File} file
   * @param {string} key
   * @returns {string} Preview URL
   */
  create(file, key) {
    const url = createPreviewUrl(file);
    this.urls.set(key, url);
    return url;
  }

  /**
   * Create previews for multiple files
   * @param {File[]} files
   * @param {string} keyPrefix
   * @returns {Array} Preview URLs
   */
  createMultiple(files, keyPrefix = "preview") {
    return files.map((file, index) => {
      const key = `${keyPrefix}_${index}`;
      return {
        key,
        url: this.create(file, key),
        file,
      };
    });
  }

  /**
   * Get preview URL
   * @param {string} key
   * @returns {string}
   */
  get(key) {
    return this.urls.get(key);
  }

  /**
   * Remove preview
   * @param {string} key
   */
  remove(key) {
    const url = this.urls.get(key);
    if (url) {
      revokePreviewUrl(url);
      this.urls.delete(key);
    }
  }

  /**
   * Clean all previews
   */
  clear() {
    this.urls.forEach(url => revokePreviewUrl(url));
    this.urls.clear();
  }

  /**
   * Cleanup on unmount
   */
  cleanup() {
    this.clear();
  }
}

/**
 * Export helper functions
 */
export {
  validateImageFile,
  validateImageFiles,
  getImageUrl,
  formatImage,
  sortImages,
};
