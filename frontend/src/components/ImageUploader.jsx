import React, { useState, useRef } from "react";
import { VariantImageManager, ImagePreview } from "../services/variantImageService";

const ImageUploader = ({ variantId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const imagePreviewRef = useRef(new ImagePreview());

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);

    // Create previews
    const previews = imagePreviewRef.current.createMultiple(files, "upload");
    setSelectedFiles(files);
    setPreviewUrls(previews);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select images to upload");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const imageManager = new VariantImageManager(variantId);
      
      if (selectedFiles.length === 1) {
        await imageManager.addImage(selectedFiles[0], previewUrls.length === 0);
      } else {
        await imageManager.addImages(selectedFiles);
      }

      // Cleanup previews
      previewUrls.forEach(p => imagePreviewRef.current.remove(p.key));

      setSelectedFiles([]);
      setPreviewUrls([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to upload images";
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePreview = (key) => {
    imagePreviewRef.current.remove(key);
    setPreviewUrls(prev => prev.filter(p => p.key !== key));
    setSelectedFiles(prev => prev.filter((_, i) => `upload_${i}` !== key));
  };

  const handleClearAll = () => {
    previewUrls.forEach(p => imagePreviewRef.current.remove(p.key));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setError(null);
  };

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f8faff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        marginTop: "12px",
      }}
    >
      <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>
        Upload Images
      </h4>

      {error && (
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "6px",
            color: "#991b1b",
            marginBottom: "12px",
            fontSize: "13px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* File Input Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: "24px",
          border: "2px dashed #cbd5e1",
          borderRadius: "8px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: "#f1f5f9",
          transition: "all 0.2s",
          marginBottom: "12px",
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#e2e8f0"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f1f5f9"}
      >
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
        <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>
          Click to upload images
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
          or drag and drop (JPEG, PNG, GIF, WEBP - Max 5MB each)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div>
          <p style={{ margin: "12px 0 8px", fontSize: "12px", fontWeight: "500", color: "#475569" }}>
            Selected: {previewUrls.length} image{previewUrls.length !== 1 ? "s" : ""}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {previewUrls.map(preview => (
              <div
                key={preview.key}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "6px",
                  overflow: "hidden",
                  backgroundColor: "#e2e8f0",
                }}
              >
                <img
                  src={preview.url}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => handleRemovePreview(preview.key)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleUpload}
              disabled={loading || previewUrls.length === 0}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: loading ? "#cbd5e1" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {loading ? "⏳ Uploading..." : "✓ Upload Images"}
            </button>
            <button
              onClick={handleClearAll}
              disabled={loading}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "13px",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {previewUrls.length === 0 && !error && (
        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
          No images selected yet
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
