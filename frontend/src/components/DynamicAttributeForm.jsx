import React from "react";

/**
 * DynamicAttributeForm
 * 
 * Renders input fields based on category attributes
 * Supports common e-commerce attributes:
 * - color: color input/dropdown
 * - size: size input/dropdown  
 * - material: material input
 * - brand: brand input
 * - ram: RAM input (for electronics)
 * - storage: storage input (for electronics)
 * - warranty: warranty input
 * - fit: fit dropdown (for clothing)
 */

const ATTRIBUTE_CONFIG = {
  color: { label: "Color", type: "text", placeholder: "e.g., Black, Red, Blue" },
  size: { label: "Size", type: "text", placeholder: "e.g., S, M, L, XL or 6, 7, 8" },
  material: { label: "Material", type: "text", placeholder: "e.g., Cotton, Polyester" },
  brand: { label: "Brand", type: "text", placeholder: "e.g., Nike, Apple" },
  ram: { label: "RAM (GB)", type: "number", placeholder: "e.g., 4, 8, 12, 16" },
  storage: { label: "Storage (GB)", type: "number", placeholder: "e.g., 64, 128, 256, 512" },
  warranty: { label: "Warranty (months)", type: "number", placeholder: "e.g., 12, 24" },
  fit: { label: "Fit", type: "select", options: ["Regular", "Slim", "Oversized", "Classic"] },
  weight: { label: "Weight (kg)", type: "number", placeholder: "e.g., 0.5, 1.2" },
};

const COLORS_PRESET = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", 
  "Pink", "Purple", "Orange", "Brown", "Gray", "Beige"
];

const SIZES_PRESET = [
  "XS", "S", "M", "L", "XL", "XXL", 
  "6", "7", "8", "9", "10", "11", "12", "13"
];

export default function DynamicAttributeForm({ 
  attributes, 
  formData, 
  onChange,
  categoryName = "",
  cols = 2
}) {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  const handleChange = (fieldName, value) => {
    onChange({ [fieldName]: value });
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "16px",
      marginBottom: "16px",
      padding: "14px",
      background: "#f9fafb",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
    }}>
      {attributes.map((attr) => {
        const config = ATTRIBUTE_CONFIG[attr] || { 
          label: attr.charAt(0).toUpperCase() + attr.slice(1), 
          type: "text",
          placeholder: `Enter ${attr}`
        };

        const value = formData?.[attr] || "";
        const isPreset = attr === "color" && config.type === "text";
        const isSizePreset = attr === "size" && config.type === "text";

        if (config.type === "select") {
          return (
            <div key={attr}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>
                {config.label}
              </label>
              <select
                value={value}
                onChange={(e) => handleChange(attr, e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <option value="">Select {config.label}</option>
                {config.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }

        if (isPreset || isSizePreset) {
          const presets = isPreset ? COLORS_PRESET : SIZES_PRESET;
          return (
            <div key={attr}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>
                {config.label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(attr, e.target.value)}
                placeholder={config.placeholder}
                list={`${attr}_list`}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontFamily: "inherit",
                }}
              />
              <datalist id={`${attr}_list`}>
                {presets.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          );
        }

        return (
          <div key={attr}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>
              {config.label}
            </label>
            <input
              type={config.type}
              value={value}
              onChange={(e) => handleChange(attr, e.target.value)}
              placeholder={config.placeholder}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontFamily: "inherit",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
