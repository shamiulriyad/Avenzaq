import React, { useState } from "react";
import { getImageUrl } from "../services/imageUploadService";
import ImageUploader from "./ImageUploader";

const VariantList = ({ variants, onEdit, onDelete, onImageUploadComplete }) => {
  const [expandedVariantId, setExpandedVariantId] = useState(null);

  const toggleExpand = (variantId) => {
    setExpandedVariantId(expandedVariantId === variantId ? null : variantId);
  };

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {variants.map(variant => (
        <div
          key={variant.id}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "white",
          }}
        >
          {/* Variant Header - Always Visible */}
          <div
            onClick={() => toggleExpand(variant.id)}
            style={{
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              backgroundColor: "#f8faff",
              borderBottom: expandedVariantId === variant.id ? "1px solid #e2e8f0" : "none",
            }}
          >
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: 1 }}>
              {/* Primary Image */}
              {variant.primaryImage && (
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    backgroundColor: "#e2e8f0",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={getImageUrl(variant.primaryImage.imageUrl)}
                    alt={`${variant.color} ${variant.size}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              {/* Variant Info */}
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                >
                  {variant.color} {variant.size && `- ${variant.size}`}
                </h4>
                <div style={{ display: "flex", gap: "16px", marginTop: "4px", fontSize: "12px", color: "#64748b" }}>
                  <span>৳{Number(variant.finalPrice ?? variant.price ?? 0).toLocaleString()}</span>
                  {variant.originalPrice ? <span style={{ textDecoration: "line-through" }}>৳{Number(variant.originalPrice).toLocaleString()}</span> : null}
                  {variant.discountLabel ? <span style={{ color: "#b91c1c", fontWeight: 700 }}>{variant.discountLabel}</span> : null}
                  <span>{variant.stock} in stock</span>
                  <span>SKU: {variant.sku}</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div
              style={{
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "500",
                backgroundColor: variant.isActive ? "#dbeafe" : "#fed7aa",
                color: variant.isActive ? "#0c4a6e" : "#92400e",
                marginRight: "12px",
              }}
            >
              {variant.isActive ? "Active" : "Inactive"}
            </div>

            {/* Expand Indicator */}
            <div style={{ fontSize: "18px", color: "#94a3b8" }}>
              {expandedVariantId === variant.id ? "▼" : "▶"}
            </div>
          </div>

          {/* Variant Details - Expanded View */}
          {expandedVariantId === variant.id && (
            <div style={{ padding: "16px", backgroundColor: "white" }}>
              {/* Images Section */}
              <div style={{ marginBottom: "20px" }}>
                <h5 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                  Images ({variant.images.length})
                </h5>

                {variant.images.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {variant.images.map(image => (
                      <div
                        key={image.id}
                        style={{
                          position: "relative",
                          aspectRatio: "1",
                          borderRadius: "6px",
                          overflow: "hidden",
                          backgroundColor: "#e2e8f0",
                          border: image.isPrimary ? "2px solid #1a56db" : "1px solid #e2e8f0",
                        }}
                      >
                        <img
                          src={getImageUrl(image.imageUrl)}
                          alt="Variant"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {image.isPrimary && (
                          <div
                            style={{
                              position: "absolute",
                              top: "2px",
                              left: "2px",
                              backgroundColor: "#1a56db",
                              color: "white",
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "3px",
                            }}
                          >
                            ⭐ Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                    No images uploaded yet
                  </p>
                )}

                {/* Image Uploader */}
                <ImageUploader
                  variantId={variant.id}
                  onSuccess={onImageUploadComplete}
                />
              </div>

              {/* Details */}
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Color:</span>
                    <span style={{ marginLeft: "8px", fontWeight: "500", color: "#0f172a" }}>
                      {variant.color}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Size:</span>
                    <span style={{ marginLeft: "8px", fontWeight: "500", color: "#0f172a" }}>
                      {variant.size || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Price:</span>
                    <span style={{ marginLeft: "8px", fontWeight: "500", color: "#0f172a" }}>
                      ৳{Number(variant.finalPrice ?? variant.price ?? 0).toLocaleString()}
                    </span>
                  </div>
                  {variant.originalPrice ? (
                    <div>
                      <span style={{ color: "#64748b" }}>Original:</span>
                      <span style={{ marginLeft: "8px", fontWeight: "500", color: "#94a3b8", textDecoration: "line-through" }}>
                        ৳{Number(variant.originalPrice).toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                  <div>
                    <span style={{ color: "#64748b" }}>Stock:</span>
                    <span style={{ marginLeft: "8px", fontWeight: "500", color: "#0f172a" }}>
                      {variant.stock}
                    </span>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "#64748b" }}>SKU:</span>
                    <span style={{ marginLeft: "8px", fontWeight: "500", color: "#0f172a", fontFamily: "monospace" }}>
                      {variant.sku}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => onEdit(variant)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(variant.id)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VariantList;
