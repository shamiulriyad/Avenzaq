import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../services/categoriesService";
import { useCategories } from "../../context/CategoryContext";

export default function AdminCategoriesPage() {
  const { refreshCategories } = useCategories();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: ""
  });

  // Load categories on mount
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name });
    } else {
      setEditingId(null);
      setFormData({ name: "" });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "" });
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({
      name: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError("Category name cannot be empty.");
      return;
    }

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Category name must be between 2 and 50 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingId) {
        // Update category
        const updated = await updateCategory(editingId, { name: trimmedName });
        setCategories(prev =>
          prev.map(cat => cat.id === editingId ? updated : cat)
        );
        // Refresh global category context
        await refreshCategories();
        setSuccess("Category updated successfully!");
      } else {
        // Create category
        const created = await createCategory({ name: trimmedName });
        setCategories(prev => [...prev, created]);
        // Refresh global category context to update navbar and other components
        await refreshCategories();
        setSuccess("Category created successfully!");
      }

      handleCloseModal();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to save category.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async (id) => {
    try {
      setSubmitting(true);
      setError(null);
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      // Refresh global category context
      await refreshCategories();
      setSuccess("Category deleted successfully!");
      setDeleteConfirm(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete category.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
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
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Category Management</h1>
            <p style={styles.subtitle}>Manage product categories for your marketplace</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            style={styles.addButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0e3a9c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a56db'}
          >
            + New Category
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div style={styles.successBox}>
            <strong>✓ {success}</strong>
          </div>
        )}
        {error && (
          <div style={styles.errorBox}>
            <strong>✗ {error}</strong>
          </div>
        )}

        {/* Categories List */}
        <div style={styles.listContainer}>
          {categories.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No categories yet</p>
              <p style={styles.emptyHint}>Create your first category to get started</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.headerCell}>Name</th>
                  <th style={styles.headerCell}>Slug</th>
                  <th style={styles.headerCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id} style={{
                    ...styles.tableRow,
                    ...((index + 1) % 2 === 0 ? styles.tableRowAlt : {})
                  }}>
                    <td style={styles.tableCell}>
                      <strong>{category.name}</strong>
                    </td>
                    <td style={styles.tableCell}>
                      <code style={styles.slug}>{category.slug}</code>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.cellActions}>
                        <button
                          onClick={() => handleOpenModal(category)}
                          style={styles.editButton}
                          title="Edit category"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category.id)}
                          style={styles.deleteButton}
                          title="Delete category"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={handleCloseModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editingId ? "Edit Category" : "New Category"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  style={styles.closeButton}
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>

              {error && (
                <div style={styles.errorBox}>
                  <strong>✗ {error}</strong>
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Category Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    required
                    maxLength={50}
                    autoFocus
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = '#1a56db'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)'}
                  />
                  <small style={styles.charCount}>{formData.name.length}/50</small>
                </div>

                <div style={styles.formActions}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      ...styles.submitButton,
                      ...(submitting ? styles.submitButtonDisabled : {})
                    }}
                  >
                    {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div style={styles.modalOverlay} onClick={handleCancelDelete}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Confirm Delete</h2>
              </div>

              <p style={styles.confirmText}>
                Are you sure you want to delete this category? This action cannot be undone.
              </p>

              <div style={styles.formActions}>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirm)}
                  disabled={submitting}
                  style={{
                    ...styles.submitButton,
                    ...styles.submitButtonDanger,
                    ...(submitting ? styles.submitButtonDisabled : {})
                  }}
                >
                  {submitting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={submitting}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
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
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "2rem"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "1rem",
    gap: "1rem",
    flexWrap: "wrap"
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
  addButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1a56db",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap"
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
  successBox: {
    backgroundColor: "#d1fae5",
    borderLeft: "4px solid #10b981",
    padding: "1rem",
    borderRadius: "0.375rem",
    marginBottom: "1.5rem",
    color: "#065f46"
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderLeft: "4px solid #ef4444",
    padding: "1rem",
    borderRadius: "0.375rem",
    marginBottom: "1.5rem",
    color: "#991b1b"
  },
  listContainer: {
    overflow: "x-auto"
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem"
  },
  emptyText: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#4a5568",
    margin: "0 0 0.5rem 0"
  },
  emptyHint: {
    fontSize: "0.875rem",
    color: "#718096",
    margin: "0"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.875rem"
  },
  headerRow: {
    backgroundColor: "#f7fafc",
    borderBottom: "2px solid #e2e8f0"
  },
  headerCell: {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "600",
    color: "#2d3748"
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0"
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc"
  },
  tableCell: {
    padding: "1rem",
    color: "#4a5568"
  },
  slug: {
    backgroundColor: "#edf2f7",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontFamily: "monospace",
    fontSize: "0.75rem",
    color: "#4a5568"
  },
  cellActions: {
    display: "flex",
    gap: "0.5rem"
  },
  editButton: {
    padding: "0.375rem 0.75rem",
    backgroundColor: "#edf2f7",
    color: "#2d3748",
    border: "1px solid #cbd5e0",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  deleteButton: {
    padding: "0.375rem 0.75rem",
    backgroundColor: "#fed7d7",
    color: "#742a2a",
    border: "1px solid #fc8181",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    padding: "1.5rem"
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0"
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "1.5rem",
    color: "#718096",
    cursor: "pointer",
    padding: "0",
    width: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  form: {
    padding: "1.5rem"
  },
  formGroup: {
    marginBottom: "1.5rem"
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "0.5rem"
  },
  required: {
    color: "#ef4444"
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    fontSize: "0.875rem",
    fontFamily: 'inherit',
    transition: "border-color 0.2s",
    boxSizing: "border-box"
  },
  charCount: {
    fontSize: "0.75rem",
    color: "#a0aec0",
    display: "block",
    textAlign: "right",
    marginTop: "0.25rem"
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem"
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
  submitButtonDanger: {
    backgroundColor: "#ef4444"
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
  },
  confirmText: {
    padding: "1.5rem",
    fontSize: "0.875rem",
    color: "#4a5568",
    margin: "0"
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
