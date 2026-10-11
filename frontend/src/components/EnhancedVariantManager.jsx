import React, { useState, useEffect } from "react";
import DynamicAttributeForm from "./DynamicAttributeForm";
import { uploadProductImage } from "../services/productService";

/**
 * EnhancedVariantManager
 * 
 * Production-quality variant management component with:
 * - Dynamic attributes based on category
 * - Image upload per variant
 * - Add/edit/delete variants
 * - Real-time preview
 */

const TOKEN_COLORS = {
  primary: "#1d5bf5",
  primaryHov: "#1649d4",
  primaryLt: "rgba(29, 91, 245, 0.08)",
  text: "#1a1916",
  sub: "#6b6b67",
  border: "#e8e7e2",
  surface: "#ffffff",
  bg: "#f5f4f0",
  danger: "#dc2626",
  dangerLt: "rgba(220, 38, 38, 0.08)",
  mutedLight: "#d4d3ce",
  muted: "#a09f97",
};

export default function EnhancedVariantManager({ 
  categoryId, 
  categoryName,
  categoryAttributes = [],
  productId,
  existingVariants = [],
  onVariantsUpdate 
}) {
  const [variants, setVariants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setVariants(existingVariants || []);
  }, [existingVariants]);

  const resetForm = () => {
    setFormData({});
    setImages([]);
    setPreviewUrls([]);
    setErrors({});
    setEditing(null);
  };

  const handleAttributeChange = (attrs) => {
    setFormData(prev => ({ ...prev, ...attrs }));
    setErrors(prev => {
      const newErrs = { ...prev };
      Object.keys(attrs).forEach(k => delete newErrs[k]);
      return newErrs;
    });
  };

  const handleImageSelect = (newFiles) => {
    const files = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    
    Promise.all(files.map(f => {
      return new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res({ file: f, url: reader.result });
        reader.readAsDataURL(f);
      });
    })).then(results => {
      setImages(prev => [...prev, ...results.map(r => r.file)]);
      setPreviewUrls(prev => [...prev, ...results.map(r => r.url)]);
    });
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const newErrs = {};
    
    if (!categoryAttributes.includes("sku") && !formData.sku) {
      newErrs.sku = "SKU is required";
    }
    
    categoryAttributes.forEach(attr => {
      if (!formData[attr]?.toString().trim()) {
        newErrs[attr] = `${attr} is required`;
      }
    });

    if (categoryAttributes.includes("price") && (!formData.price || parseFloat(formData.price) <= 0)) {
      newErrs.price = "Price must be > 0";
    }

    if (categoryAttributes.includes("stock") && (!formData.stock || parseInt(formData.stock) < 0)) {
      newErrs.stock = "Stock must be >= 0";
    }

    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let uploadedImages = [];

      // Upload images if there are new ones
      if (images.length > 0 && productId) {
        for (const file of images) {
          try {
            const result = await uploadProductImage(productId, file);
            uploadedImages.push(result.imageUrl);
          } catch (err) {
            console.warn("Image upload failed:", err);
          }
        }
      }

      const variantData = {
        ...formData,
        images: [...(editing?.images || []), ...uploadedImages],
        id: editing?.id,
      };

      if (editing) {
        setVariants(prev =>
          prev.map(v => (v.id === editing.id ? { ...v, ...variantData } : v))
        );
      } else {
        setVariants(prev => [...prev, { ...variantData, id: Math.random() }]);
      }

      if (onVariantsUpdate) {
        onVariantsUpdate(editing ? [...variants] : [...variants, variantData]);
      }

      resetForm();
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (variant) => {
    setEditing(variant);
    setFormData(variant);
    setPreviewUrls(variant.images || []);
    setImages([]);
    setShowForm(true);
  };

  const handleDelete = (variantId) => {
    setDeleteConfirm(variantId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      const newVariants = variants.filter(v => v.id !== deleteConfirm);
      setVariants(newVariants);
      if (onVariantsUpdate) onVariantsUpdate(newVariants);
      setDeleteConfirm(null);
    }
  };

  return (
    <div style={{ marginTop: "20px", borderTop: `1px solid ${TOKEN_COLORS.border}`, paddingTop: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: TOKEN_COLORS.text }}>
            Product Variants
          </h3>
          <p style={{ fontSize: "12px", color: TOKEN_COLORS.muted, margin: "4px 0 0" }}>
            {variants.length} variant{variants.length !== 1 ? "s" : ""} added
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "8px 16px",
              background: TOKEN_COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => e.target.style.background = TOKEN_COLORS.primaryHov}
            onMouseLeave={(e) => e.target.style.background = TOKEN_COLORS.primary}
          >
            + Add Variant
          </button>
        )}
      </div>

      {/* Variant List */}
      {variants.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          {variants.map((variant) => (
            <div
              key={variant.id}
              style={{
                padding: "12px",
                background: TOKEN_COLORS.surface,
                border: `1px solid ${TOKEN_COLORS.border}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              {/* Thumbnail */}
              {variant.images?.length > 0 && (
                <img
                  src={variant.images[0]}
                  alt=""
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    background: TOKEN_COLORS.bg,
                  }}
                />
              )}

              {/* Variant Info */}
              <div style={{ fontSize: "13px" }}>
                {categoryAttributes.map(attr => (
                  <div key={attr} style={{ marginBottom: "4px" }}>
                    <span style={{ color: TOKEN_COLORS.muted, textTransform: "capitalize" }}>
                      {attr}:{" "}
                    </span>
                    <span style={{ fontWeight: 500, color: TOKEN_COLORS.text }}>
                      {variant[attr]}
                    </span>
                  </div>
                ))}
                {variant.price && (
                  <div style={{ marginBottom: "4px" }}>
                    <span style={{ color: TOKEN_COLORS.muted }}>Price: </span>
                    <span style={{ fontWeight: 600, color: TOKEN_COLORS.primary }}>
                      ${parseFloat(variant.price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <button
                  onClick={() => handleEdit(variant)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: TOKEN_COLORS.primaryLt,
                    color: TOKEN_COLORS.primary,
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(variant.id)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: TOKEN_COLORS.dangerLt,
                    color: TOKEN_COLORS.danger,
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{
          background: TOKEN_COLORS.bg,
          border: `1px solid ${TOKEN_COLORS.border}`,
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}>
          <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 16px", color: TOKEN_COLORS.text }}>
            {editing ? "Edit Variant" : "Add New Variant"}
          </h4>

          {/* Dynamic Attributes */}
          <DynamicAttributeForm
            attributes={categoryAttributes}
            formData={formData}
            onChange={handleAttributeChange}
            categoryName={categoryName}
            cols={2}
          />

          {/* Price & Stock (Always included) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "6px", display: "block" }}>
                Price *
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) => handleAttributeChange({ price: e.target.value })}
                placeholder="19.99"
                step="0.01"
                min="0"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: `1px solid ${errors.price ? TOKEN_COLORS.danger : TOKEN_COLORS.border}`,
                  borderRadius: "6px",
                }}
              />
              {errors.price && <p style={{ fontSize: "12px", color: TOKEN_COLORS.danger, margin: "4px 0 0" }}>{errors.price}</p>}
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "6px", display: "block" }}>
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock || ""}
                onChange={(e) => handleAttributeChange({ stock: e.target.value })}
                placeholder="100"
                min="0"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: `1px solid ${errors.stock ? TOKEN_COLORS.danger : TOKEN_COLORS.border}`,
                  borderRadius: "6px",
                }}
              />
              {errors.stock && <p style={{ fontSize: "12px", color: TOKEN_COLORS.danger, margin: "4px 0 0" }}>{errors.stock}</p>}
            </div>
          </div>

          {/* Discount Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "6px", display: "block" }}>
                Discount Type
              </label>
              <select
                value={formData.discountType || ""}
                onChange={(e) => handleAttributeChange({ discountType: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: `1px solid ${TOKEN_COLORS.border}`,
                  borderRadius: "6px",
                }}
              >
                <option value="">No Discount</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "6px", display: "block" }}>
                Discount Value
              </label>
              <input
                type="number"
                value={formData.discountValue || ""}
                onChange={(e) => handleAttributeChange({ discountValue: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: `1px solid ${TOKEN_COLORS.border}`,
                  borderRadius: "6px",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "6px", display: "block" }}>
                Discount Start
              </label>
              <input
                type="date"
                value={formData.discountStart || ""}
                onChange={(e) => handleAttributeChange({ discountStart: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: `1px solid ${TOKEN_COLORS.border}`,
                  borderRadius: "6px",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "6px", display: "block" }}>
                Discount End
              </label>
              <input
                type="date"
                value={formData.discountEnd || ""}
                onChange={(e) => handleAttributeChange({ discountEnd: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: `1px solid ${TOKEN_COLORS.border}`,
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>

          {/* SKU */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "6px", display: "block" }}>
              SKU *
            </label>
            <input
              type="text"
              value={formData.sku || ""}
              onChange={(e) => handleAttributeChange({ sku: e.target.value })}
              placeholder="e.g., TSHIRT-BLK-M-001"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "13px",
                border: `1px solid ${errors.sku ? TOKEN_COLORS.danger : TOKEN_COLORS.border}`,
                borderRadius: "6px",
              }}
            />
            {errors.sku && <p style={{ fontSize: "12px", color: TOKEN_COLORS.danger, margin: "4px 0 0" }}>{errors.sku}</p>}
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: TOKEN_COLORS.text, marginBottom: "8px", display: "block" }}>
              Variant Images
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = TOKEN_COLORS.primaryLt; }}
              onDragLeave={(e) => { e.currentTarget.style.background = TOKEN_COLORS.bg; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.background = TOKEN_COLORS.bg;
                handleImageSelect(e.dataTransfer.files);
              }}
              onClick={() => document.getElementById("variant-image-input")?.click()}
              style={{
                border: `2px dashed ${TOKEN_COLORS.border}`,
                borderRadius: "6px",
                padding: "24px",
                textAlign: "center",
                cursor: "pointer",
                background: TOKEN_COLORS.bg,
                transition: "all 0.15s",
              }}
            >
              <p style={{ fontSize: "13px", color: TOKEN_COLORS.text, marginBottom: "4px" }}>
                📸 Drop images here or click to select
              </p>
              <p style={{ fontSize: "12px", color: TOKEN_COLORS.muted, margin: 0 }}>
                PNG, JPG, WEBP · max 10MB
              </p>
              <input
                id="variant-image-input"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleImageSelect(e.target.files)}
              />
            </div>

            {/* Preview */}
            {previewUrls.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px" }}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: `1px solid ${TOKEN_COLORS.border}`,
                      }}
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: TOKEN_COLORS.danger,
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              disabled={loading}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: TOKEN_COLORS.primary,
                border: `1px solid ${TOKEN_COLORS.border}`,
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: "8px 16px",
                background: TOKEN_COLORS.primary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : editing ? "Update Variant" : "Add Variant"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.14)",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 12px", color: TOKEN_COLORS.text }}>
              Delete Variant?
            </h3>
            <p style={{ fontSize: "13px", color: TOKEN_COLORS.sub, margin: "0 0 20px", lineHeight: 1.5 }}>
              This action cannot be undone. The variant will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "8px 16px",
                  background: TOKEN_COLORS.bg,
                  color: TOKEN_COLORS.text,
                  border: `1px solid ${TOKEN_COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "8px 16px",
                  background: TOKEN_COLORS.danger,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
