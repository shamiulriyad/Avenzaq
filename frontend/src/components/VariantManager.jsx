import React, { useState, useEffect, useCallback } from "react";
import { createVariant, updateVariant, deleteVariant, getProductVariants, formatVariant } from "../services/variantService";
import VariantList from "./VariantList";

const VariantManager = ({ productId, onVariantCreated }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [formData, setFormData] = useState({
    color: "",
    size: "",
    price: "",
    stock: "",
    sku: "",
    discountType: "",
    discountValue: "",
    discountStart: "",
    discountEnd: "",
  });

  // Load variants on mount
  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductVariants(productId);
      setVariants(data.map(formatVariant));
    } catch (err) {
      setError("Failed to load variants: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.color.trim()) {
      setError("Color is required");
      return;
    }
    if (!formData.size.trim()) {
      setError("Size is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError("Stock must be 0 or greater");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const variantPayload = {
        color: formData.color.trim(),
        size: formData.size.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku.trim(),
        discountType: formData.discountType || null,
        discountValue: formData.discountValue === "" ? null : parseFloat(formData.discountValue),
        discountStart: formData.discountStart || null,
        discountEnd: formData.discountEnd || null,
      };

      if (editingVariantId) {
        // Update existing variant
        const updated = await updateVariant(editingVariantId, variantPayload);
        setVariants(prev =>
          prev.map(v => v.id === editingVariantId ? formatVariant(updated) : v)
        );
        setEditingVariantId(null);
      } else {
        // Create new variant
        const created = await createVariant(productId, variantPayload);
        const newVariant = formatVariant(created);
        setVariants(prev => [...prev, newVariant]);
        if (onVariantCreated) {
          onVariantCreated(newVariant);
        }
      }

      // Reset form
      setFormData({ color: "", size: "", price: "", stock: "", sku: "", discountType: "", discountValue: "", discountStart: "", discountEnd: "" });
      setShowForm(false);
    } catch (err) {
      setError("Failed to save variant: " + err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (variant) => {
    setFormData({
      color: variant.color,
      size: variant.size,
      price: variant.price.toString(),
      stock: variant.stock.toString(),
      sku: variant.sku,
      discountType: variant.discountType || "",
      discountValue: variant.discountValue ? String(variant.discountValue) : "",
      discountStart: variant.discountStart ? String(variant.discountStart).slice(0, 10) : "",
      discountEnd: variant.discountEnd ? String(variant.discountEnd).slice(0, 10) : "",
    });
    setEditingVariantId(variant.id);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteVariant(variantId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
    } catch (err) {
      setError("Failed to delete variant: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVariantId(null);
    setFormData({ color: "", size: "", price: "", stock: "", sku: "", discountType: "", discountValue: "", discountStart: "", discountEnd: "" });
    setError(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0 }}>Product Variants</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "10px 16px",
              backgroundColor: "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            + Add Variant
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#991b1b",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8faff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {editingVariantId ? "Edit Variant" : "Create New Variant"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              {/* Color */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Blue, Red, Black"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Size */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g., S, M, L, XL"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Price */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Price (BDT)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 1500"
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Stock */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Discount Type */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">No Discount</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Discount Value
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Discount Start */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Discount Start
                </label>
                <input
                  type="date"
                  name="discountStart"
                  value={formData.discountStart}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Discount End */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  Discount End
                </label>
                <input
                  type="date"
                  name="discountEnd"
                  value={formData.discountEnd}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* SKU */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>
                  SKU (Unique identifier)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g., TSHIRT-BLUE-M-001"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  Make sure this is unique across all variants
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: loading ? "#cbd5e1" : "#1a56db",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {loading ? "Saving..." : editingVariantId ? "Update Variant" : "Create Variant"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading variants...
        </div>
      ) : variants.length > 0 ? (
        <div>
          <VariantList
            variants={variants}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onImageUploadComplete={loadVariants}
          />
        </div>
      ) : !showForm ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No variants yet. Create one to get started!
        </div>
      ) : null}
    </div>
  );
};

export default VariantManager;
