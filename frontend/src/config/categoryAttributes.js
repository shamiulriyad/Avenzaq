/**
 * Category Attributes Configuration
 * 
 * Maps product categories to their variant attributes
 * This is used by EnhancedVariantManager to show dynamic fields based on category
 */

export const CATEGORY_ATTRIBUTES = {
  // Clothing & Fashion
  "clothing": ["color", "size", "material", "fit"],
  "fashion": ["color", "size", "material"],
  "shoes": ["color", "size", "material"],
  "accessories": ["color", "material"],
  
  // Electronics
  "electronics": ["brand", "color"],
  "phones": ["brand", "color", "ram", "storage"],
  "laptops": ["brand", "color", "ram", "storage"],
  "tablets": ["brand", "color", "ram", "storage"],
  "smartwatches": ["brand", "color"],
  "headphones": ["brand", "color"],
  
  // Home & Garden
  "home": ["color", "material", "size"],
  "furniture": ["color", "material"],
  "decor": ["color", "material"],
  "lighting": ["color"],
  
  // Sports & Outdoors
  "sports": ["color", "size"],
  "fitness": ["color", "size"],
  "outdoor": ["color"],
  
  // Books & Media
  "books": ["format"],
  "media": ["format"],
  
  // Beauty & Personal Care
  "beauty": ["color", "size"],
  "skincare": ["size"],
  "haircare": ["size"],
};

/**
 * Get attributes for a category
 * Falls back to generic attributes if category not found
 */
export function getAttributesForCategory(categoryNameOrId) {
  if (!categoryNameOrId) return ["color", "size"];
  
  const normalized = categoryNameOrId.toLowerCase().trim().replace(/\s+/g, "");
  
  // Try exact match
  const exact = Object.keys(CATEGORY_ATTRIBUTES).find(
    key => key.toLowerCase() === normalized
  );
  if (exact) return CATEGORY_ATTRIBUTES[exact];
  
  // Try partial match
  const partial = Object.keys(CATEGORY_ATTRIBUTES).find(
    key => normalized.includes(key) || key.includes(normalized)
  );
  if (partial) return CATEGORY_ATTRIBUTES[partial];
  
  // Default attributes for any category
  return ["color", "size"];
}

/**
 * Get human-readable label for an attribute
 */
export function getAttributeLabel(attr) {
  const labels = {
    color: "Color",
    size: "Size",
    material: "Material",
    brand: "Brand",
    fit: "Fit",
    ram: "RAM (GB)",
    storage: "Storage (GB)",
    warranty: "Warranty (months)",
    weight: "Weight (kg)",
    format: "Format",
  };
  return labels[attr] || attr.charAt(0).toUpperCase() + attr.slice(1);
}

export default CATEGORY_ATTRIBUTES;
