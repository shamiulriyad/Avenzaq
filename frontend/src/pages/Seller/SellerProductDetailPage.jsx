import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/productService";
import VariantManager from "../../components/VariantManager";

const SellerProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("variants");

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(productId);
      setProduct(data);
    } catch (err) {
      setError("Failed to load product: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "600px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          ← Back
        </button>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
        Product not found
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8faff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "24px", backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            ← Back
          </button>

          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            {/* Product Image */}
            {product.images && product.images.length > 0 && (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#e2e8f0",
                  flexShrink: 0,
                }}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            {/* Product Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: "600", color: "#0f172a" }}>
                {product.name}
              </h1>
              <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "14px" }}>
                {product.description ? product.description.substring(0, 100) : "No description"}
              </p>

              <div style={{ display: "flex", gap: "32px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Category:</span>
                  <span style={{ marginLeft: "8px", fontWeight: "500", color: "#0f172a" }}>
                    {product.categoryName || "General"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Status:</span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontWeight: "500",
                      color: product.isActive ? "#0f172a" : "#991b1b",
                    }}
                  >
                    {product.isActive ? "✓ Active" : "✗ Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            gap: "24px",
            padding: "0 24px",
          }}
        >
          <button
            onClick={() => setActiveTab("variants")}
            style={{
              padding: "16px 0",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              color: activeTab === "variants" ? "#1a56db" : "#64748b",
              borderBottom: activeTab === "variants" ? "2px solid #1a56db" : "none",
            }}
          >
            Variants
          </button>
          <button
            onClick={() => setActiveTab("details")}
            style={{
              padding: "16px 0",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              color: activeTab === "details" ? "#1a56db" : "#64748b",
              borderBottom: activeTab === "details" ? "2px solid #1a56db" : "none",
            }}
          >
            Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", backgroundColor: "#f8faff", minHeight: "400px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {activeTab === "variants" && <VariantManager productId={productId} />}

          {activeTab === "details" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: "16px", fontWeight: "600" }}>Product Details</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "20px" }}>
                {/* Name */}
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={product.name}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      backgroundColor: "#f8faff",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={product.categoryName || ""}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      backgroundColor: "#f8faff",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Description */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Description
                  </label>
                  <textarea
                    value={product.description || ""}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      backgroundColor: "#f8faff",
                      fontSize: "14px",
                      minHeight: "120px",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Created At */}
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Created At
                  </label>
                  <input
                    type="text"
                    value={new Date(product.createdAtUtc).toLocaleDateString()}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      backgroundColor: "#f8faff",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                    Status
                  </label>
                  <div
                    style={{
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      backgroundColor: product.isActive ? "#e0f2fe" : "#fee2e2",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: product.isActive ? "#0c4a6e" : "#991b1b",
                    }}
                  >
                    {product.isActive ? "✓ Active" : "✗ Inactive"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f8faff", borderRadius: "6px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  💡 Use the <strong>Variants tab</strong> to add colors, sizes, and manage images for this product.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProductDetailPage;
