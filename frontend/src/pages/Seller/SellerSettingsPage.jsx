import { useState, useEffect } from "react";
import { getSellerProfile, updateSellerProfile } from "../../services/sellerService";

export default function SellerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");
  const [message, setMessage] = useState("");
  
  const [shopInfo, setShopInfo] = useState({
    shopName: "",
    description: "",
    category: "",
    website: "",
    shippingPolicy: "",
    returnPolicy: "",
    processingTime: "1-3",
    acceptsCOD: true
  });

  const [ownerInfo, setOwnerInfo] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerAddress: ""
  });

  const [bankInfo, setBankInfo] = useState({
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranch: ""
  });

  useEffect(() => {
    loadSellerProfile();
  }, []);

  const loadSellerProfile = async () => {
    try {
      setLoading(true);
      const profile = await getSellerProfile();
      if (profile) {
        setShopInfo({
          shopName: profile.shopName || "",
          description: profile.description || "",
          category: profile.category || "",
          website: profile.website || "",
          shippingPolicy: profile.shippingPolicy || "",
          returnPolicy: profile.returnPolicy || "",
          processingTime: profile.processingTime || "1-3",
          acceptsCOD: profile.acceptsCOD ?? true
        });
        setOwnerInfo({
          ownerName: profile.ownerName || "",
          ownerEmail: profile.ownerEmail || "",
          ownerPhone: profile.ownerPhone || "",
          ownerAddress: profile.ownerAddress || ""
        });
        setBankInfo({
          bankAccountName: profile.bankAccountName || "",
          bankAccountNumber: profile.bankAccountNumber || "",
          bankName: profile.bankName || "",
          bankBranch: profile.bankBranch || ""
        });
      }
    } catch (error) {
      console.error("Failed to load seller profile:", error);
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...shopInfo, ...ownerInfo, ...bankInfo };
      await updateSellerProfile(data);
      setMessage("✅ Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("❌ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleShopChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShopInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankInfo(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: isActive ? "#1a56db" : "#6b7280",
    borderBottom: isActive ? "2px solid #1a56db" : "2px solid transparent",
    transition: "all 0.2s ease"
  });

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s ease"
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#374151"
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "30px", color: "#111827" }}>
        Seller Settings
      </h1>

      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "6px",
          marginBottom: "20px",
          background: message.includes("✅") ? "#dcfce7" : "#fee2e2",
          color: message.includes("✅") ? "#166534" : "#991b1b",
          fontSize: "14px"
        }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "30px" }}>
        <button style={tabStyle(activeTab === "shop")} onClick={() => setActiveTab("shop")}>
          🏪 Shop Information
        </button>
        <button style={tabStyle(activeTab === "owner")} onClick={() => setActiveTab("owner")}>
          👤 Owner Information
        </button>
        <button style={tabStyle(activeTab === "bank")} onClick={() => setActiveTab("bank")}>
          🏦 Bank Details
        </button>
      </div>

      {/* Shop Info Tab */}
      {activeTab === "shop" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div>
            <label style={labelStyle}>Shop Name *</label>
            <input
              type="text"
              name="shopName"
              value={shopInfo.shopName}
              onChange={handleShopChange}
              style={inputStyle}
              placeholder="Your shop name"
            />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <input
              type="text"
              name="category"
              value={shopInfo.category}
              onChange={handleShopChange}
              style={inputStyle}
              placeholder="e.g., Electronics, Fashion"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Shop Description *</label>
            <textarea
              name="description"
              value={shopInfo.description}
              onChange={handleShopChange}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              placeholder="Describe your shop..."
            />
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input
              type="url"
              name="website"
              value={shopInfo.website}
              onChange={handleShopChange}
              style={inputStyle}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Processing Time</label>
            <select
              name="processingTime"
              value={shopInfo.processingTime}
              onChange={handleShopChange}
              style={inputStyle}
            >
              <option>1-3</option>
              <option>3-5</option>
              <option>5-7</option>
              <option>7-14</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Return Policy *</label>
            <textarea
              name="returnPolicy"
              value={shopInfo.returnPolicy}
              onChange={handleShopChange}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              placeholder="Describe your return policy..."
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Shipping Policy *</label>
            <textarea
              name="shippingPolicy"
              value={shopInfo.shippingPolicy}
              onChange={handleShopChange}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              placeholder="Describe your shipping policy..."
            />
          </div>
          <div>
            <label style={{ ...labelStyle, marginBottom: "8px" }}>
              <input
                type="checkbox"
                name="acceptsCOD"
                checked={shopInfo.acceptsCOD}
                onChange={handleShopChange}
                style={{ marginRight: "8px" }}
              />
              Accept Cash on Delivery (COD)
            </label>
          </div>
        </div>
      )}

      {/* Owner Info Tab */}
      {activeTab === "owner" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div>
            <label style={labelStyle}>Owner Name *</label>
            <input
              type="text"
              name="ownerName"
              value={ownerInfo.ownerName}
              onChange={handleOwnerChange}
              style={inputStyle}
              placeholder="Full name"
            />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              name="ownerEmail"
              value={ownerInfo.ownerEmail}
              onChange={handleOwnerChange}
              style={inputStyle}
              placeholder="Email"
            />
          </div>
          <div>
            <label style={labelStyle}>Phone *</label>
            <input
              type="tel"
              name="ownerPhone"
              value={ownerInfo.ownerPhone}
              onChange={handleOwnerChange}
              style={inputStyle}
              placeholder="Phone number"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Address *</label>
            <textarea
              name="ownerAddress"
              value={ownerInfo.ownerAddress}
              onChange={handleOwnerChange}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              placeholder="Full address..."
            />
          </div>
        </div>
      )}

      {/* Bank Info Tab */}
      {activeTab === "bank" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div>
            <label style={labelStyle}>Account Holder Name *</label>
            <input
              type="text"
              name="bankAccountName"
              value={bankInfo.bankAccountName}
              onChange={handleBankChange}
              style={inputStyle}
              placeholder="Name on account"
            />
          </div>
          <div>
            <label style={labelStyle}>Bank Name *</label>
            <input
              type="text"
              name="bankName"
              value={bankInfo.bankName}
              onChange={handleBankChange}
              style={inputStyle}
              placeholder="Bank name"
            />
          </div>
          <div>
            <label style={labelStyle}>Account Number *</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={bankInfo.bankAccountNumber}
              onChange={handleBankChange}
              style={inputStyle}
              placeholder="Account number"
            />
          </div>
          <div>
            <label style={labelStyle}>Branch *</label>
            <input
              type="text"
              name="bankBranch"
              value={bankInfo.bankBranch}
              onChange={handleBankChange}
              style={inputStyle}
              placeholder="Branch name"
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 24px",
            background: saving ? "#9ca3af" : "#1a56db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: saving ? "default" : "pointer",
            transition: "background 0.2s ease"
          }}
        >
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>
      </div>
    </div>
  );
}
