import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/productService";
import { getCategories } from "../../services/categoriesService";
import VariantManager from "../../components/VariantManager";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    stockQty: ""
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            categoryId: data[0].id
          }));
        }
      } catch (err) {
        setError("Failed to load categories. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (!formData.stockQty || parseInt(formData.stockQty) < 0) {
      setError("Stock quantity must be 0 or greater.");
      return;
    }

    if (categories.length === 0) {
      setError("No categories available. Please contact an administrator.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Parse numeric values
      const productData = {
        ...formData,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        stockQty: parseInt(formData.stockQty)
      };

      const created = await createProduct(productData);
      setCreatedProduct(created);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create product.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>Add New Product</h1>
          <p style={styles.subtitle}>Fill in the product details below</p>
        </div>

        {/* No categories warning */}
        {categories.length === 0 && (
          <div style={styles.warningBox}>
            <strong>No categories available</strong>
            <p>Please contact an administrator to create categories before adding products.</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={styles.successBox}>
            <strong>✓ Product created successfully!</strong>
            <p>You can now add variants and upload multiple photos for each variant below.</p>
          </div>
        )}

        {/* Error message */}
        {error && !success && (
          <div style={styles.errorBox}>
            <strong>✗ {error}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Category <span style={styles.required}>*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              disabled={categories.length === 0}
              style={styles.select}
            >
              <option value="">-- Select a category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Product Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
              maxLength={100}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#1a56db'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)'}
            />
            <small style={styles.charCount}>{formData.name.length}/100</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description (optional)"
              maxLength={1000}
              rows={5}
              style={styles.textarea}
              onFocus={(e) => e.target.style.borderColor = '#1a56db'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)'}
            />
            <small style={styles.charCount}>{formData.description.length}/1000</small>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Price <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputWithUnit}>
                <span style={styles.unit}>$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  min="0.01"
                  step="0.01"
                  style={styles.inputWithUnitField}
                  onFocus={(e) => e.target.style.borderColor = '#1a56db'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)'}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Stock Quantity <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="stockQty"
                value={formData.stockQty}
                onChange={handleChange}
                placeholder="0"
                required
                min="0"
                step="1"
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#1a56db'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)'}
              />
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="submit"
              disabled={submitting || categories.length === 0 || success}
              style={{
                ...styles.submitButton,
                ...(submitting || categories.length === 0 || success ? styles.submitButtonDisabled : {})
              }}
            >
              {submitting ? "Creating..." : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              disabled={submitting}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>

        {success && createdProduct?.id && (
          <div style={{ marginTop: "2rem" }}>
            <div style={styles.header}>
              <h2 style={styles.heading}>Add Variants & Images</h2>
              <p style={styles.subtitle}>
                Add color/size variants and upload multiple photos for each one.
              </p>
            </div>
            <VariantManager productId={createdProduct.id} />
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <button
                type="button"
                onClick={() => navigate("/seller/products")}
                style={styles.submitButton}
              >
                Go to My Products
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setCreatedProduct(null);
                  setFormData({ categoryId: categories[0]?.id || "", name: "", description: "", price: "", stockQty: "" });
                }}
                style={styles.cancelButton}
              >
                Create Another Product
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  section: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "2rem 1rem",
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "2rem"
  },
  header: {
    marginBottom: "2rem",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "1rem"
  },
  heading: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0 0 0.5rem 0"
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#718096",
    margin: "0"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem"
  },
  loadingSpinner: {
    width: "2rem",
    height: "2rem",
    border: "3px solid #e2e8f0",
    borderTopColor: "#1a56db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem"
  },
  loadingText: {
    color: "#718096",
    fontSize: "0.875rem"
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    borderLeft: "4px solid #f59e0b",
    padding: "1rem",
    borderRadius: "0.375rem",
    marginBottom: "1.5rem"
  },
  successBox: {
    backgroundColor: "#d1fae5",
    borderLeft: "4px solid #10b981",
    padding: "1rem",
    borderRadius: "0.375rem",
    marginBottom: "1.5rem"
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderLeft: "4px solid #ef4444",
    padding: "1rem",
    borderRadius: "0.375rem",
    marginBottom: "1.5rem",
    color: "#991b1b"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#2d3748"
  },
  required: {
    color: "#ef4444"
  },
  input: {
    padding: "0.625rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    fontSize: "0.875rem",
    fontFamily: 'inherit',
    transition: "border-color 0.2s",
    boxSizing: "border-box"
  },
  select: {
    padding: "0.625rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    fontSize: "0.875rem",
    fontFamily: 'inherit',
    transition: "border-color 0.2s",
    cursor: "pointer",
    backgroundColor: "white"
  },
  textarea: {
    padding: "0.625rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    fontSize: "0.875rem",
    fontFamily: 'inherit',
    transition: "border-color 0.2s",
    resize: "vertical",
    boxSizing: "border-box"
  },
  charCount: {
    fontSize: "0.75rem",
    color: "#a0aec0",
    textAlign: "right"
  },
  inputWithUnit: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  unit: {
    position: "absolute",
    left: "0.75rem",
    color: "#718096",
    pointerEvents: "none"
  },
  inputWithUnitField: {
    padding: "0.625rem 0.75rem",
    paddingLeft: "1.75rem",
    borderRadius: "0.375rem",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    fontSize: "0.875rem",
    fontFamily: 'inherit',
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem"
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem"
  },
  submitButton: {
    flex: 1,
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1a56db",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  submitButtonDisabled: {
    backgroundColor: "#cbd5e0",
    cursor: "not-allowed"
  },
  cancelButton: {
    flex: 1,
    padding: "0.75rem 1.5rem",
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
    border: "none",
    borderRadius: "0.375rem",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s"
  }
};

// Add CSS for animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
