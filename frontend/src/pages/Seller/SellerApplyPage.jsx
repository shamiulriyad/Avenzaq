import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerSeller } from "../../services/sellerService";
import { getCategories } from "../../services/categoriesService";
import { useEffect } from "react";

export default function SellerApplyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    // Step 1: Basic Info
    shopName: "",
    description: "",
    category: "",
    establishedYear: "",
    website: "",
    
    // Step 2: Owner Info
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerAddress: "",
    ownerIdType: "nid",
    ownerIdNumber: "",
    
    // Step 3: Business Details
    businessType: "individual",
    taxId: "",
    businessLicense: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranch: "",
    
    // Step 4: Policies
    returnPolicy: "",
    shippingPolicy: "",
    processingTime: "1-3",
    acceptsCOD: true,
    
    // Documents
    documents: []
  });

  const [documents, setDocuments] = useState({
    nid: null,
    tradeLicense: null,
    tin: null,
    bankStatement: null
  });

  const [categories, setCategories] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const businessTypes = [
    { value: "individual", label: "Individual/Sole Proprietor" },
    { value: "partnership", label: "Partnership" },
    { value: "llc", label: "LLC" },
    { value: "corporation", label: "Corporation" },
    { value: "nonprofit", label: "Non-profit" }
  ];

  const idTypes = [
    { value: "nid", label: "National ID Card" },
    { value: "passport", label: "Passport" },
    { value: "driving", label: "Driving License" },
    { value: "birth", label: "Birth Certificate" }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }));
      
      // In a real app, you might upload immediately or store for later
      setForm(prev => ({
        ...prev,
        documents: [...prev.documents, { type: docType, file, name: file.name }]
      }));
    }
  };

  const validateStep = () => {
    switch(currentStep) {
      case 1:
        if (!form.shopName) return "Shop name is required";
        if (!form.category) return "Please select a category";
        return null;
      case 2:
        if (!form.ownerName) return "Owner name is required";
        if (!form.ownerEmail) return "Owner email is required";
        if (!form.ownerPhone) return "Owner phone is required";
        if (!form.ownerIdNumber) return "ID number is required";
        if (!documents.nid) return "Please upload ID document";
        return null;
      case 3:
        if (!form.bankAccountName) return "Account holder name is required";
        if (!form.bankAccountNumber) return "Account number is required";
        if (!form.bankName) return "Bank name is required";
        if (!documents.tradeLicense && form.businessType !== 'individual') 
          return "Trade license is required for businesses";
        return null;
      case 4:
        if (!form.returnPolicy) return "Please describe your return policy";
        if (!form.shippingPolicy) return "Please describe your shipping policy";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setError(error);
      window.scrollTo(0, 0);
    } else {
      setError("");
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateStep();
    if (error) {
      setError(error);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create FormData and append form fields
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== 'documents') {
          formData.append(key, form[key]);
        }
      });
      
      // Append documents with correct field names expected by backend
      if (documents.nid) formData.append('NidDocument', documents.nid);
      if (documents.tradeLicense) formData.append('TradeLicenseFile', documents.tradeLicense);
      if (documents.tin) formData.append('TinDocument', documents.tin);
      if (documents.bankStatement) formData.append('BankStatementFile', documents.bankStatement);

      await registerSeller(formData);
      setSuccess(true);
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      setError(apiMessage || "Failed to submit seller application.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, name: "Shop Info", icon: "🏪" },
    { number: 2, name: "Owner Details", icon: "👤" },
    { number: 3, name: "Business Details", icon: "📋" },
    { number: 4, name: "Policies", icon: "📜" }
  ];

  if (success) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.heading}>Application Submitted!</h1>
            <p style={styles.successMessage}>
              Thank you for applying to become a seller on our marketplace.
            </p>
            <div style={styles.successDetails}>
              <p>Your application has been received and is pending review.</p>
              <p>We'll notify you via email once your shop is approved.</p>
              <p style={styles.referenceNumber}>
                Reference: {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
            </div>
            <div style={styles.actions}>
              <button style={styles.primaryBtn} onClick={() => navigate("/profile")}>
                Go to Profile
              </button>
              <button style={styles.secondaryBtn} onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Become a Seller</h1>
          <p style={styles.subheading}>Join our marketplace and start selling to thousands of customers</p>

          {/* Progress Steps */}
          <div style={styles.progressContainer}>
            {steps.map((step, index) => (
              <div key={step.number} style={styles.stepWrapper}>
                <div style={styles.stepLineContainer}>
                  {index > 0 && (
                    <div style={{
                      ...styles.stepLine,
                      backgroundColor: currentStep > index ? '#1a56db' : '#e2e8f0'
                    }} />
                  )}
                </div>
                <div style={styles.stepContent}>
                  <div style={{
                    ...styles.stepCircle,
                    backgroundColor: currentStep >= step.number ? '#1a56db' : '#ffffff',
                    borderColor: currentStep >= step.number ? '#1a56db' : '#cbd5e1',
                    color: currentStep >= step.number ? '#ffffff' : '#64748b'
                  }}>
                    {currentStep > step.number ? '✓' : step.icon}
                  </div>
                  <span style={{
                    ...styles.stepName,
                    color: currentStep >= step.number ? '#1a56db' : '#64748b'
                  }}>
                    {step.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            {/* Step 1: Shop Information */}
            {currentStep === 1 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepTitle}>Shop Information</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Shop Name *</label>
                  <input
                    type="text"
                    name="shopName"
                    style={styles.input}
                    value={form.shopName}
                    onChange={handleInputChange}
                    placeholder="Your shop name"
                    required
                    maxLength={120}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    name="description"
                    style={styles.textarea}
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Tell us about your products and business"
                    rows={4}
                  />
                  <span style={styles.hint}>Describe what you sell and your business story</span>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category *</label>
                    <select
                      name="category"
                      style={styles.select}
                      value={form.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Established Year</label>
                    <input
                      type="number"
                      name="establishedYear"
                      style={styles.input}
                      value={form.establishedYear}
                      onChange={handleInputChange}
                      placeholder="2024"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    style={styles.input}
                    value={form.website}
                    onChange={handleInputChange}
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Owner Details */}
            {currentStep === 2 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepTitle}>Owner Information</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    style={styles.input}
                    value={form.ownerName}
                    onChange={handleInputChange}
                    placeholder="Owner's full name"
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email *</label>
                    <input
                      type="email"
                      name="ownerEmail"
                      style={styles.input}
                      value={form.ownerEmail}
                      onChange={handleInputChange}
                      placeholder="owner@email.com"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone *</label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      style={styles.input}
                      value={form.ownerPhone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <textarea
                    name="ownerAddress"
                    style={styles.textarea}
                    value={form.ownerAddress}
                    onChange={handleInputChange}
                    placeholder="Owner's address"
                    rows={2}
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ID Type *</label>
                    <select
                      name="ownerIdType"
                      style={styles.select}
                      value={form.ownerIdType}
                      onChange={handleInputChange}
                    >
                      {idTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>ID Number *</label>
                    <input
                      type="text"
                      name="ownerIdNumber"
                      style={styles.input}
                      value={form.ownerIdNumber}
                      onChange={handleInputChange}
                      placeholder="ID card number"
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Upload ID Document *</label>
                  <div style={styles.fileInput}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'nid')}
                      style={styles.file}
                    />
                    {documents.nid && (
                      <span style={styles.fileName}>{documents.nid.name}</span>
                    )}
                  </div>
                  <span style={styles.hint}>Upload clear photo/scans of your ID (PDF, JPG, PNG)</span>
                </div>
              </div>
            )}

            {/* Step 3: Business Details */}
            {currentStep === 3 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepTitle}>Business Details</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Type *</label>
                  <select
                    name="businessType"
                    style={styles.select}
                    value={form.businessType}
                    onChange={handleInputChange}
                  >
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {form.businessType !== 'individual' && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Trade License Number</label>
                      <input
                        type="text"
                        name="businessLicense"
                        style={styles.input}
                        value={form.businessLicense}
                        onChange={handleInputChange}
                        placeholder="License number"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Tax ID / TIN</label>
                      <input
                        type="text"
                        name="taxId"
                        style={styles.input}
                        value={form.taxId}
                        onChange={handleInputChange}
                        placeholder="Tax identification number"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Upload Trade License</label>
                      <div style={styles.fileInput}>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'tradeLicense')}
                          style={styles.file}
                        />
                        {documents.tradeLicense && (
                          <span style={styles.fileName}>{documents.tradeLicense.name}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <h3 style={styles.sectionSubtitle}>Bank Account Details</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Holder Name *</label>
                  <input
                    type="text"
                    name="bankAccountName"
                    style={styles.input}
                    value={form.bankAccountName}
                    onChange={handleInputChange}
                    placeholder="Name on bank account"
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Account Number *</label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      style={styles.input}
                      value={form.bankAccountNumber}
                      onChange={handleInputChange}
                      placeholder="Bank account number"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Bank Name *</label>
                    <input
                      type="text"
                      name="bankName"
                      style={styles.input}
                      value={form.bankName}
                      onChange={handleInputChange}
                      placeholder="Bank name"
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Branch</label>
                  <input
                    type="text"
                    name="bankBranch"
                    style={styles.input}
                    value={form.bankBranch}
                    onChange={handleInputChange}
                    placeholder="Bank branch"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Upload Bank Statement (Optional)</label>
                  <div style={styles.fileInput}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'bankStatement')}
                      style={styles.file}
                    />
                    {documents.bankStatement && (
                      <span style={styles.fileName}>{documents.bankStatement.name}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Policies */}
            {currentStep === 4 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepTitle}>Shop Policies</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Return Policy *</label>
                  <textarea
                    name="returnPolicy"
                    style={styles.textarea}
                    value={form.returnPolicy}
                    onChange={handleInputChange}
                    placeholder="Describe your return policy (e.g., 7-day return, conditions, etc.)"
                    rows={4}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Shipping Policy *</label>
                  <textarea
                    name="shippingPolicy"
                    style={styles.textarea}
                    value={form.shippingPolicy}
                    onChange={handleInputChange}
                    placeholder="Describe your shipping policy (e.g., delivery time, costs, areas served)"
                    rows={4}
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Processing Time</label>
                    <select
                      name="processingTime"
                      style={styles.select}
                      value={form.processingTime}
                      onChange={handleInputChange}
                    >
                      <option value="1-3">1-3 business days</option>
                      <option value="3-5">3-5 business days</option>
                      <option value="5-7">5-7 business days</option>
                      <option value="7-14">7-14 business days</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Payment Methods</label>
                    <div style={styles.checkboxGroup}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="acceptsCOD"
                          checked={form.acceptsCOD}
                          onChange={handleInputChange}
                          style={styles.checkbox}
                        />
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                </div>

                <div style={styles.agreementBox}>
                  <h4 style={styles.agreementTitle}>Seller Agreement</h4>
                  <p style={styles.agreementText}>
                    By submitting this application, you agree to our Seller Terms and Conditions. 
                    You confirm that all information provided is accurate and you have the legal 
                    right to sell the products you intend to list.
                  </p>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      required
                      style={styles.checkbox}
                    />
                    I agree to the Seller Terms and Conditions
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={styles.navigation}>
              {currentStep > 1 && (
                <button 
                  type="button" 
                  style={styles.secondaryBtn} 
                  onClick={handleBack}
                >
                  ← Back
                </button>
              )}
              
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  style={styles.primaryBtn} 
                  onClick={handleNext}
                >
                  Continue →
                </button>
              ) : (
                <button 
                  type="submit" 
                  style={styles.primaryBtn} 
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>

            <div style={styles.footerNote}>
              <p>Need help? <a href="/contact">Contact support</a></p>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap');

          @media (max-width: 768px) {
            div[style*="display: flex; justify-content: space-between; align-items: center;"] {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            div[style*="grid-template-columns: repeat(2, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </section>
  );
}

const styles = {
  section: {
    minHeight: "calc(100vh - 200px)",
    background: "#f8fafc",
    padding: "3rem 1rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(26, 86, 219, 0.12)",
    borderRadius: "16px",
    padding: "2.5rem",
  },
  heading: {
    margin: 0,
    color: "#1a56db",
    fontFamily: "'Instrument Serif', serif",
    fontSize: "2.5rem",
  },
  subheading: {
    marginTop: "0.5rem",
    color: "#64748b",
    fontSize: "1.1rem",
  },
  progressContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "2rem 0 2.5rem",
    position: "relative",
  },
  stepWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  stepLineContainer: {
    position: "absolute",
    top: "24px",
    left: "calc(-50% + 40px)",
    right: "calc(50% + 40px)",
    height: "2px",
    zIndex: 1,
  },
  stepLine: {
    height: "100%",
    transition: "background-color 0.3s ease",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  stepCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    border: "2px solid",
    backgroundColor: "#ffffff",
    marginBottom: "0.5rem",
  },
  stepName: {
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  stepTitle: {
    fontSize: "1.3rem",
    color: "#1a56db",
    marginBottom: "1.5rem",
  },
  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#334155",
    margin: "1.5rem 0 1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    color: "#334155",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  input: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "0.75rem",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  select: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "0.75rem",
    fontSize: "0.95rem",
    outline: "none",
    backgroundColor: "#fff",
  },
  textarea: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "0.75rem",
    fontSize: "0.95rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "'DM Sans', sans-serif",
  },
  hint: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
  fileInput: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  file: {
    padding: "0.5rem 0",
  },
  fileName: {
    fontSize: "0.9rem",
    color: "#1a56db",
  },
  checkboxGroup: {
    display: "flex",
    gap: "1rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.95rem",
    color: "#334155",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#1a56db",
  },
  agreementBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "1.5rem",
    marginTop: "1rem",
  },
  agreementTitle: {
    fontSize: "1rem",
    color: "#1a56db",
    marginBottom: "0.75rem",
  },
  agreementText: {
    fontSize: "0.95rem",
    color: "#475569",
    marginBottom: "1rem",
    lineHeight: 1.6,
  },
  navigation: {
    display: "flex",
    gap: "1rem",
    justifyContent: "space-between",
    marginTop: "1rem",
  },
  primaryBtn: {
    border: "none",
    background: "#1a56db",
    color: "#fff",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    flex: 1,
  },
  secondaryBtn: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  error: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
    padding: "1rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
  },
  footerNote: {
    textAlign: "center",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e2e8f0",
  },
  successCard: {
    background: "#fff",
    border: "1px solid rgba(26, 86, 219, 0.12)",
    borderRadius: "16px",
    padding: "3rem 2rem",
    textAlign: "center",
  },
  successIcon: {
    width: "80px",
    height: "80px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
    margin: "0 auto 2rem",
  },
  successMessage: {
    fontSize: "1.1rem",
    color: "#334155",
    margin: "1rem 0",
  },
  successDetails: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "1.5rem",
    margin: "2rem 0",
  },
  referenceNumber: {
    fontSize: "1rem",
    color: "#1a56db",
    fontWeight: 600,
    marginTop: "1rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "2rem",
  },
};