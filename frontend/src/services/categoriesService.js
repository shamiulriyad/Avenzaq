import apiClient from "./apiClient";

/**
 * GET /api/categories - Fetch all categories
 * @returns {Promise<Array>} List of categories with { id, name, slug }
 */
export async function getCategories() {
  try {
    const { data } = await apiClient.get("/categories");
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

/**
 * GET /api/categories/{id} - Fetch a single category
 * @param {string} categoryId - The category ID
 * @returns {Promise<Object>} Category object { id, name, slug }
 */
export async function getCategory(categoryId) {
  try {
    const { data } = await apiClient.get(`/categories/${categoryId}`);
    return data;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    throw error;
  }
}

/**
 * POST /api/categories - Create a new category (Admin only)
 * @param {Object} categoryData - { name }
 * @returns {Promise<Object>} Created category object { id, name, slug }
 */
export async function createCategory(categoryData) {
  try {
    const { data } = await apiClient.post("/categories", categoryData);
    return data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

/**
 * PUT /api/categories/{id} - Update a category (Admin only)
 * @param {string} categoryId - The category ID
 * @param {Object} categoryData - { name }
 * @returns {Promise<Object>} Updated category object { id, name, slug }
 */
export async function updateCategory(categoryId, categoryData) {
  try {
    const { data } = await apiClient.put(`/categories/${categoryId}`, categoryData);
    return data;
  } catch (error) {
    console.error(`Error updating category ${categoryId}:`, error);
    throw error;
  }
}

/**
 * DELETE /api/categories/{id} - Delete a category (Admin only)
 * @param {string} categoryId - The category ID
 * @returns {Promise<void>}
 */
export async function deleteCategory(categoryId) {
  try {
    await apiClient.delete(`/categories/${categoryId}`);
  } catch (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    throw error;
  }
}
