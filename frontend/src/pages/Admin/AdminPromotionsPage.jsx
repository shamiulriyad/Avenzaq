import { useState, useEffect, useCallback } from "react";

// ─── Design Tokens ────────────────────────────────────────────────
const T = {
  primary: "#1d5bf5",
  primaryHover: "#1a4fd8",
  text: "#1a1916",
  muted: "#a09f97",
  bg: "#f5f4f0",
  white: "#ffffff",
  border: "#e2e1da",
  success: "#27ae60",
  warning: "#f39c12",
  danger: "#e74c3c",
  successBg: "#e8f8ef",
  successText: "#1a7a42",
  warningBg: "#fff3e0",
  warningText: "#b8610a",
  dangerBg: "#fef0f0",
  dangerText: "#c0392b",
  blueBg: "#eef2fe",
  blueText: "#1d5bf5",
  grayBg: "#f0efe9",
  grayText: "#5f5e5a",
  font: "'DM Sans', sans-serif",
};

// ─── Inline Styles ────────────────────────────────────────────────
const S = {
  app: {
    fontFamily: T.font,
    fontSize: 13,
    color: T.text,
    background: T.bg,
    minHeight: "100vh",
  },
  topbar: {
    background: T.white,
    borderBottom: `0.5px solid ${T.border}`,
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  main: { display: "flex" },
  sidebar: {
    width: 200,
    background: T.white,
    borderRight: `0.5px solid ${T.border}`,
    minHeight: "calc(100vh - 56px)",
    padding: "16px 0",
    flexShrink: 0,
  },
  content: { flex: 1, padding: 24, overflowAuto: "auto" },
};

// ─── Mock Data ────────────────────────────────────────────────────
const COUPONS = [
  { id: 1, code: "EID2024", type: "Percent", value: "20%", category: "All", expiry: "2024-04-15", limit: 500, used: 312, status: "active" },
  { id: 2, code: "FLAT150", type: "Fixed", value: "$15", category: "Electronics", expiry: "2024-12-31", limit: 200, used: 87, status: "active" },
  { id: 3, code: "NEWUSER", type: "Percent", value: "30%", category: "All", expiry: "2025-06-01", limit: 1000, used: 641, status: "active" },
  { id: 4, code: "BFRIDAY", type: "Percent", value: "40%", category: "Fashion", expiry: "2024-11-30", limit: 300, used: 300, status: "expired" },
  { id: 5, code: "SUMMER10", type: "Percent", value: "10%", category: "Home", expiry: "2025-08-31", limit: 400, used: 23, status: "inactive" },
  { id: 6, code: "VIP50", type: "Fixed", value: "$50", category: "All", expiry: "2025-03-31", limit: 50, used: 18, status: "active" },
];

const CAMPAIGNS = [
  { id: 1, name: "Eid ul-Adha Sale", emoji: "🌙", target: "All Categories", start: "2024-06-15", end: "2024-06-20", discount: "25%", status: "upcoming", orders: 0, revenue: 0, reach: 42000 },
  { id: 2, name: "Black Friday 2024", emoji: "🖤", target: "Electronics, Fashion", start: "2024-11-29", end: "2024-11-30", discount: "40%", status: "scheduled", orders: 0, revenue: 0, reach: 89000 },
  { id: 3, name: "Ramadan Deals", emoji: "⭐", target: "Food, Fashion", start: "2024-03-10", end: "2024-04-09", discount: "15%", status: "ended", orders: 2341, revenue: 62100, reach: 71000 },
  { id: 4, name: "Back to School", emoji: "📚", target: "Stationery, Electronics", start: "2024-08-20", end: "2024-09-05", discount: "18%", status: "active", orders: 876, revenue: 21400, reach: 33000 },
];

const BANNERS = [
  { id: 1, name: "Eid Sale Hero", label: "Eid Sale Banner", url: "https://store.com/eid-sale", start: "Jun 1", end: "Jun 20", status: "scheduled", color: "linear-gradient(135deg,#eef2fe,#dde6fd)", icon: "🌙" },
  { id: 2, name: "Flash Sale Strip", label: "Flash Sale 48H", url: "https://store.com/flash", start: "Now", end: "48h", status: "active", color: "linear-gradient(135deg,#fff3e0,#ffe0b0)", icon: "⚡" },
  { id: 3, name: "New Arrivals", label: "New Arrivals Summer", url: "https://store.com/new", start: "Jul 1", end: "Jul 31", status: "inactive", color: "linear-gradient(135deg,#e8f8ef,#c8eeda)", icon: "🌿" },
  { id: 4, name: "App Download", label: "Download App Banner", url: "https://store.com/app", start: "Always", end: "Always", status: "active", color: "linear-gradient(135deg,#fef0f0,#fdd)", icon: "📱" },
];

const PRODUCTS = [
  { id: 1, name: "Wireless Headphones Pro", sku: "WHP-001", category: "Electronics", price: "$129", discount: "15%", salePrice: "$109.65", stock: 234, flash: true, status: "active" },
  { id: 2, name: "Cotton Summer Dress", sku: "FAS-044", category: "Fashion", price: "$45", discount: "30%", salePrice: "$31.50", stock: 89, flash: false, status: "active" },
  { id: 3, name: "Smart Watch Series 5", sku: "WCH-012", category: "Electronics", price: "$299", discount: "10%", salePrice: "$269.10", stock: 12, flash: true, status: "active" },
  { id: 4, name: "Leather Handbag Classic", sku: "HBG-007", category: "Fashion", price: "$189", discount: "20%", salePrice: "$151.20", stock: 45, flash: false, status: "inactive" },
  { id: 5, name: "Yoga Mat Premium", sku: "SPT-033", category: "Sports", price: "$55", discount: "25%", salePrice: "$41.25", stock: 178, flash: false, status: "active" },
];

const AUDIENCE_SEGMENTS = [
  { id: "all", icon: "🌐", name: "All Users", desc: "Target every registered user on the platform", count: "84,231 users", color: "#eef2fe" },
  { id: "new", icon: "🆕", name: "New Users", desc: "Users who registered in the last 30 days", count: "3,142 users", color: "#e8f8ef" },
  { id: "high", icon: "💎", name: "High Spenders", desc: "Users with lifetime spend over $500", count: "8,904 users", color: "#fff3e0" },
  { id: "inactive", icon: "😴", name: "Inactive Users", desc: "No purchase in the last 60 days", count: "12,340 users", color: "#fef0f0" },
  { id: "loyal", icon: "🏆", name: "Loyal Customers", desc: "5+ orders with 4+ star avg rating", count: "4,211 users", color: "#f3eeff" },
  { id: "cart", icon: "🛒", name: "Abandoned Cart", desc: "Added to cart but did not complete purchase", count: "6,782 users", color: "#fafaf8" },
];

const NAV_ITEMS = [
  { id: "coupons", icon: "🏷", label: "Coupons" },
  { id: "campaigns", icon: "📣", label: "Campaigns" },
  { id: "banners", icon: "🖼", label: "Banners" },
  { id: "discounts", icon: "💸", label: "Product Discounts" },
  { id: "audience", icon: "👥", label: "Target Audience" },
  { id: "analytics", icon: "📊", label: "Analytics" },
];

// ─── Reusable Components ──────────────────────────────────────────

const Badge = ({ children, variant = "gray" }) => {
  const variants = {
    green: { background: T.successBg, color: T.successText },
    orange: { background: T.warningBg, color: T.warningText },
    red: { background: T.dangerBg, color: T.dangerText },
    blue: { background: T.blueBg, color: T.blueText },
    gray: { background: T.grayBg, color: T.grayText },
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, ...variants[variant] }}>
      {children}
    </span>
  );
};

const Btn = ({ children, variant = "ghost", size = "md", onClick, style = {} }) => {
  const [hover, setHover] = useState(false);
  const base = { padding: size === "sm" ? "5px 10px" : "7px 16px", borderRadius: 7, fontFamily: T.font, fontSize: size === "sm" ? 11 : 12, fontWeight: 500, cursor: "pointer", border: "none", transition: "all .15s" };
  const variants = {
    primary: { background: hover ? T.primaryHover : T.primary, color: T.white, border: "none" },
    ghost: { background: hover ? T.bg : "transparent", color: T.text, border: `0.5px solid ${T.border}` },
    danger: { background: hover ? "#fdd" : T.dangerBg, color: T.dangerText, border: `0.5px solid #fcc` },
    success: { background: hover ? "#c8eeda" : T.successBg, color: T.successText, border: `0.5px solid #b2ecc8` },
  };
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

const Toggle = ({ checked, onChange }) => (
  <label style={{ position: "relative", width: 34, height: 19, flexShrink: 0, display: "inline-block" }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
    <span style={{
      position: "absolute", inset: 0,
      background: checked ? T.primary : T.border,
      borderRadius: 19, cursor: "pointer", transition: ".2s",
    }}>
      <span style={{
        position: "absolute", width: 13, height: 13,
        left: checked ? 18 : 3, bottom: 3,
        background: T.white, borderRadius: "50%", transition: ".2s",
      }} />
    </span>
  </label>
);

const SectionCard = ({ title, sub, action, children }) => (
  <div style={{ background: T.white, border: `0.5px solid ${T.border}`, borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
    <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const StatCard = ({ label, value, change, up }) => (
  <div style={{ background: T.white, border: `0.5px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
    <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 600, color: T.text, lineHeight: 1 }}>{value}</div>
    {change && <div style={{ fontSize: 11, marginTop: 4, color: up ? T.success : T.danger }}>{up ? "↑" : "↓"} {change}</div>}
  </div>
);

const ProgressBar = ({ value, max }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const fillColor = pct > 90 ? T.danger : pct > 70 ? T.warning : T.primary;
  return (
    <div style={{ width: "100%", height: 5, background: T.grayBg, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: fillColor, borderRadius: 3, transition: "width .3s" }} />
    </div>
  );
};

const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.grayText, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".4px" }}>{label}</label>
    {children}
  </div>
);

const FormInput = ({ ...props }) => (
  <input {...props} style={{ width: "100%", padding: "8px 11px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 13, color: T.text, outline: "none", boxSizing: "border-box" }} />
);

const FormSelect = ({ children, ...props }) => (
  <select {...props} style={{ width: "100%", padding: "8px 11px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 13, color: T.text, background: T.white, outline: "none" }}>
    {children}
  </select>
);

// ─── Modal Component ──────────────────────────────────────────────
const Modal = ({ type, onClose }) => {
  const titles = { coupon: "Create New Coupon", campaign: "Create Campaign", banner: "Upload Banner", flashsale: "Create Flash Sale" };
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(26,25,22,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.white, borderRadius: 12, width: 460, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "18px 20px", borderBottom: `0.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{titles[type]}</span>
          <button onClick={onClose} style={{ width: 24, height: 24, border: "none", background: T.bg, borderRadius: 6, cursor: "pointer", fontSize: 14, color: T.grayText }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          {type === "coupon" && <CouponForm />}
          {type === "campaign" && <CampaignForm />}
          {type === "banner" && <BannerForm />}
          {type === "flashsale" && <FlashSaleForm />}
        </div>
        <div style={{ padding: "14px 20px", borderTop: `0.5px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary">Save</Btn>
        </div>
      </div>
    </div>
  );
};

const CouponForm = () => (
  <>
    <FormGroup label="Coupon Code"><FormInput placeholder="e.g. SUMMER30" style={{ textTransform: "uppercase" }} /></FormGroup>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Discount Type"><FormSelect><option>Percentage</option><option>Fixed Amount</option></FormSelect></FormGroup>
      <FormGroup label="Value"><FormInput placeholder="e.g. 20 or 15.00" /></FormGroup>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Usage Limit"><FormInput type="number" placeholder="e.g. 500" /></FormGroup>
      <FormGroup label="Expiry Date"><FormInput type="date" /></FormGroup>
    </div>
    <FormGroup label="Apply To"><FormSelect><option>All Categories</option><option>Electronics</option><option>Fashion</option><option>Food</option><option>Sports</option></FormSelect></FormGroup>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Toggle checked={true} onChange={() => {}} />
      <span style={{ fontSize: 13 }}>Activate immediately</span>
    </div>
  </>
);

const CampaignForm = () => (
  <>
    <FormGroup label="Campaign Name"><FormInput placeholder="e.g. Eid Sale 2025" /></FormGroup>
    <FormGroup label="Discount"><FormInput placeholder="e.g. 25%" /></FormGroup>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Start Date"><FormInput type="date" /></FormGroup>
      <FormGroup label="End Date"><FormInput type="date" /></FormGroup>
    </div>
    <FormGroup label="Target Categories">
      <select multiple style={{ width: "100%", height: 80, padding: "4px 8px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 12, color: T.text, outline: "none" }}>
        {["All Categories", "Electronics", "Fashion", "Food", "Sports", "Home"].map(c => <option key={c}>{c}</option>)}
      </select>
    </FormGroup>
  </>
);

const BannerForm = () => (
  <>
    <FormGroup label="Banner Name"><FormInput placeholder="e.g. Eid Sale Hero" /></FormGroup>
    <FormGroup label="Redirect URL"><FormInput placeholder="https://..." /></FormGroup>
    <div style={{ border: `1.5px dashed ${T.border}`, borderRadius: 8, padding: 24, textAlign: "center", cursor: "pointer", background: "#fafaf8", marginBottom: 14 }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>📤</div>
      <div style={{ fontSize: 12, color: T.muted }}>Click to upload or drag & drop<br /><span style={{ fontSize: 11 }}>PNG, JPG up to 5MB · Recommended 1920×600px</span></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Active From"><FormInput type="date" /></FormGroup>
      <FormGroup label="Active Until"><FormInput type="date" /></FormGroup>
    </div>
  </>
);

const FlashSaleForm = () => (
  <>
    <FormGroup label="Sale Name"><FormInput placeholder="e.g. Summer Flash Sale" /></FormGroup>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Duration"><FormSelect><option>6 hours</option><option>12 hours</option><option>24 hours</option><option>48 hours</option></FormSelect></FormGroup>
      <FormGroup label="Discount"><FormInput placeholder="e.g. 35%" /></FormGroup>
    </div>
    <FormGroup label="Select Products">
      <div style={{ border: `0.5px solid ${T.border}`, borderRadius: 7, maxHeight: 140, overflowY: "auto" }}>
        {PRODUCTS.map(p => (
          <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `0.5px solid ${T.grayBg}`, cursor: "pointer" }}>
            <input type="checkbox" style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: 12 }}>{p.name}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>{p.price}</span>
          </label>
        ))}
      </div>
    </FormGroup>
  </>
);

// ─── Tab: Coupons ─────────────────────────────────────────────────
const CouponsTab = ({ onModal }) => {
  const [coupons, setCoupons] = useState(COUPONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = coupons.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  };

  const statusBadge = (s) => s === "active" ? "green" : s === "expired" ? "red" : "gray";

  return (
    <SectionCard title="Coupons" sub="Manage discount codes" action={<Btn variant="primary" size="sm" onClick={() => onModal("coupon")}>+ Create Coupon</Btn>}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `0.5px solid ${T.border}`, background: "#fafaf8" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupon code..." style={{ flex: 1, padding: "6px 10px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 12, color: T.text, background: T.white, outline: "none" }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "6px 10px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 12, color: T.text, background: T.white, outline: "none" }}>
          {["All", "Active", "Inactive", "Expired"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ padding: "6px 10px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 12, color: T.text, background: T.white, outline: "none" }}>
          {["All Types", "Percent", "Fixed"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${T.border}` }}>
              {["Code", "Type", "Discount", "Category", "Usage", "Expiry", "Status", "Actions"].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 16px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: `0.5px solid ${T.grayBg}` }}>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontFamily: "monospace", background: T.grayBg, padding: "2px 7px", borderRadius: 4, fontSize: 12, fontWeight: 600, letterSpacing: ".5px" }}>{c.code}</span>
                </td>
                <td style={{ padding: "10px 16px" }}><Badge variant="blue">{c.type}</Badge></td>
                <td style={{ padding: "10px 16px" }}><strong>{c.value}</strong></td>
                <td style={{ padding: "10px 16px" }}>{c.category}</td>
                <td style={{ padding: "10px 16px", minWidth: 130 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={c.used} max={c.limit} /></div>
                    <span style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap" }}>{c.used}/{c.limit}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 16px", fontSize: 11, color: T.grayText }}>{c.expiry}</td>
                <td style={{ padding: "10px 16px" }}><Badge variant={statusBadge(c.status)}>{c.status}</Badge></td>
                <td style={{ padding: "10px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Toggle checked={c.status === "active"} onChange={() => toggleStatus(c.id)} />
                    <Btn size="sm">Edit</Btn>
                    <Btn size="sm" variant="danger">Del</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `0.5px solid ${T.border}` }}>
        <span style={{ fontSize: 11, color: T.muted }}>Showing {filtered.length} of 24 coupons</span>
        <div style={{ display: "flex", gap: 4 }}>
          {["‹", "1", "2", "3", "4", "›"].map((p, i) => (
            <div key={i} style={{ width: 28, height: 28, border: `0.5px solid ${i === 1 ? T.primary : T.border}`, background: i === 1 ? T.primary : T.white, borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: i === 1 ? T.white : T.grayText }}>{p}</div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};

// ─── Tab: Campaigns ───────────────────────────────────────────────
const CampaignsTab = ({ onModal }) => {
  const statusVariant = (s) => ({ active: "green", ended: "gray", upcoming: "blue", scheduled: "orange" }[s]);

  return (
    <SectionCard title="Campaigns" sub="Seasonal & promotional campaigns" action={<Btn variant="primary" size="sm" onClick={() => onModal("campaign")}>+ New Campaign</Btn>}>
      <div style={{ padding: "4px 0" }}>
        {CAMPAIGNS.map(c => (
          <div key={c.id} style={{ border: `0.5px solid ${T.border}`, borderRadius: 9, padding: 14, margin: "12px 16px", transition: ".15s" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.emoji} {c.name}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.target} · {c.start} → {c.end}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.blueBg, color: T.blueText }}>{c.discount} off</span>
                <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                <Toggle checked={c.status === "active" || c.status === "scheduled"} onChange={() => {}} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[["Orders", c.orders.toLocaleString()], ["Revenue", `$${c.revenue.toLocaleString()}`], ["Reach", `${(c.reach / 1000).toFixed(0)}K`]].map(([lbl, val]) => (
                <div key={lbl} style={{ background: T.bg, borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

// ─── Tab: Banners ─────────────────────────────────────────────────
const BannersTab = ({ onModal }) => (
  <SectionCard title="Banner Management" sub="Homepage & page banners" action={<Btn variant="primary" size="sm" onClick={() => onModal("banner")}>+ Upload Banner</Btn>}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, padding: 16 }}>
      {BANNERS.map(b => (
        <div key={b.id} style={{ border: `0.5px solid ${T.border}`, borderRadius: 9, overflow: "hidden" }}>
          <div style={{ height: 90, background: b.color, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{b.label}</div>
            </div>
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <Badge variant={b.status === "active" ? "green" : b.status === "scheduled" ? "blue" : "gray"}>{b.status}</Badge>
            </div>
          </div>
          <div style={{ padding: "10px 12px", borderTop: `0.5px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{b.name}</div>
            <a href="#" style={{ fontSize: 11, color: T.primary, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{b.url}</a>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 10, color: T.muted }}>{b.start} – {b.end}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Toggle checked={b.status === "active"} onChange={() => {}} />
                <Btn size="sm">Edit</Btn>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </SectionCard>
);

// ─── Flash Timer Hook ─────────────────────────────────────────────
const useFlashTimer = () => {
  const [time, setTime] = useState("05:32:14");
  useEffect(() => {
    let totalSec = 5 * 3600 + 32 * 60 + 14;
    const iv = setInterval(() => {
      if (totalSec <= 0) { clearInterval(iv); return; }
      totalSec--;
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  return time;
};

// ─── Tab: Discounts ───────────────────────────────────────────────
const DiscountsTab = ({ onModal }) => {
  const [products, setProducts] = useState(PRODUCTS);
  const timer = useFlashTimer();

  const toggleFlash = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, flash: !p.flash } : p));

  return (
    <SectionCard title="Product Discounts" sub="Flash sales & individual product discounts" action={<Btn variant="ghost" size="sm" onClick={() => onModal("flashsale")}>⚡ Flash Sale</Btn>}>
      <div style={{ border: `0.5px solid ${T.warning}`, borderRadius: 9, padding: 14, margin: "12px 16px", background: "#fffdf7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Flash Sale — Summer Electronics</span>
          <span style={{ fontSize: 10, padding: "2px 7px", background: T.warningBg, color: T.warningText, borderRadius: 4, fontWeight: 600 }}>LIVE</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>Ends in:</span>
          <span style={{ fontSize: 12, color: T.warningText, fontWeight: 600, fontFamily: "monospace" }}>{timer}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[["3", "Products"], ["127", "Orders today"], ["$4,210", "Revenue"]].map(([v, l]) => (
            <div key={l} style={{ background: "#fff8ec", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.warningText }}>{v}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `0.5px solid ${T.border}`, background: "#fafaf8" }}>
        <input placeholder="Search products..." style={{ flex: 1, padding: "6px 10px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 12, color: T.text, background: T.white, outline: "none" }} />
        <select style={{ padding: "6px 10px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 12, color: T.text, background: T.white, outline: "none" }}>
          {["All Categories", "Electronics", "Fashion", "Sports"].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${T.border}` }}>
              {["Product", "Category", "Original", "Discount", "Sale Price", "Stock", "Flash", "Status"].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 16px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: `0.5px solid ${T.grayBg}` }}>
                <td style={{ padding: "10px 16px" }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{p.sku}</div>
                </td>
                <td style={{ padding: "10px 16px" }}><Badge>{p.category}</Badge></td>
                <td style={{ padding: "10px 16px", color: T.muted, textDecoration: "line-through" }}>{p.price}</td>
                <td style={{ padding: "10px 16px" }}><span style={{ background: T.blueBg, color: T.blueText, padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{p.discount}</span></td>
                <td style={{ padding: "10px 16px" }}><strong>{p.salePrice}</strong></td>
                <td style={{ padding: "10px 16px", fontSize: 11 }}>{p.stock} units</td>
                <td style={{ padding: "10px 16px" }}><Toggle checked={p.flash} onChange={() => toggleFlash(p.id)} /></td>
                <td style={{ padding: "10px 16px" }}><Badge variant={p.status === "active" ? "green" : "gray"}>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

// ─── Tab: Audience ────────────────────────────────────────────────
const AudienceTab = () => {
  const [selected, setSelected] = useState(["all"]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? (prev.length > 1 ? prev.filter(a => a !== id) : prev) : [...prev, id]);
  };

  return (
    <SectionCard title="Target Audience" sub="Select who receives this promotion">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, padding: 16 }}>
        {AUDIENCE_SEGMENTS.map(s => (
          <div key={s.id} onClick={() => toggle(s.id)} style={{ border: `0.5px solid ${selected.includes(s.id) ? T.primary : T.border}`, borderRadius: 9, padding: 14, cursor: "pointer", transition: ".15s", position: "relative", background: selected.includes(s.id) ? "#f5f8ff" : T.white }}>
            {selected.includes(s.id) && (
              <div style={{ position: "absolute", top: 10, right: 10, width: 16, height: 16, borderRadius: "50%", background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.white }}>✓</div>
            )}
            <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{s.desc}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.primary, marginTop: 6 }}>{s.count}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", borderTop: `0.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: T.grayText }}>Selected: <strong>{selected.length} segment{selected.length !== 1 ? "s" : ""}</strong></span>
        <Btn variant="primary" size="sm">Apply Targeting</Btn>
      </div>
    </SectionCard>
  );
};

// ─── Tab: Analytics ───────────────────────────────────────────────
const BarChart = ({ data, max, color, altColor }) => (
  <div style={{ height: 120, display: "flex", alignItems: "flex-end", gap: 4, padding: 8, background: "#fafaf8", border: `0.5px solid ${T.border}`, borderRadius: 8, position: "relative" }}>
    {data.map((v, i) => (
      <div key={i} title={`${v}`} style={{ flex: 1, height: `${Math.round((v / max) * 100)}%`, background: i === data.length - 2 ? color : altColor, borderRadius: "3px 3px 0 0", transition: ".3s" }} />
    ))}
  </div>
);

const AnalyticsTab = () => {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const rev = [22, 18, 31, 27, 45, 38, 52, 48, 61, 54, 70, 62];
  const conv = [12, 11, 15, 13, 18, 16, 21, 19, 24, 22, 27, 23];
  const couponStats = [
    { code: "EID2024", uses: 312, rev: "$8,230", avg: "$26.4", conv: "24.1%" },
    { code: "NEWUSER", uses: 641, rev: "$14,120", avg: "$22.0", conv: "31.2%" },
    { code: "FLAT150", uses: 87, rev: "$3,190", avg: "$36.7", conv: "18.4%" },
    { code: "VIP50", uses: 18, rev: "$2,940", avg: "$163.3", conv: "42.0%" },
  ];

  return (
    <SectionCard title="Promotion Analytics" sub="Revenue, usage & conversion tracking"
      action={<select style={{ padding: "6px 10px", border: `0.5px solid ${T.border}`, borderRadius: 7, fontFamily: T.font, fontSize: 12, color: T.text, background: T.white, outline: "none" }}>
        {["Last 12 months", "Last 30 days", "Last 7 days"].map(o => <option key={o}>{o}</option>)}
      </select>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16 }}>
        {[
          { label: "Revenue from Promotions ($K)", data: rev, max: Math.max(...rev), color: T.primary, alt: "#c5d5fc" },
          { label: "Conversion Rate (%)", data: conv, max: Math.max(...conv), color: T.success, alt: "#b2ecc8" },
        ].map(({ label, data, max, color, alt }) => (
          <div key={label}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.grayText, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 8 }}>{label}</div>
            <BarChart data={data} max={max} color={color} altColor={alt} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 2px" }}>
              {months.map(m => <span key={m} style={{ fontSize: 9, color: T.muted }}>{m}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: `0.5px solid ${T.border}` }}>
        {[
          { label: "Top Coupon", val: "EID2024", sub: "312 uses this month" },
          { label: "Best Campaign", val: "Ramadan Deals", sub: "$62,100 revenue" },
          { label: "Avg Discount Used", val: "22.4%", sub: "across all promos" },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "14px 16px", borderRight: i < 2 ? `0.5px solid ${T.border}` : "none" }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 16px", borderTop: `0.5px solid ${T.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.grayText, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 10 }}>Coupon Usage Breakdown</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${T.border}` }}>
              {["Coupon", "Uses", "Revenue", "Avg Order", "Conv. Rate"].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".5px", padding: "8px 12px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {couponStats.map(r => (
              <tr key={r.code} style={{ borderBottom: `0.5px solid ${T.grayBg}` }}>
                <td style={{ padding: "9px 12px" }}><span style={{ fontFamily: "monospace", background: T.grayBg, padding: "2px 7px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{r.code}</span></td>
                <td style={{ padding: "9px 12px" }}>{r.uses}</td>
                <td style={{ padding: "9px 12px" }}><strong>{r.rev}</strong></td>
                <td style={{ padding: "9px 12px" }}>{r.avg}</td>
                <td style={{ padding: "9px 12px" }}><Badge variant="green">{r.conv}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

// ─── Root App ─────────────────────────────────────────────────────
export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState("coupons");
  const [modal, setModal] = useState(null);

  const tabContent = {
    coupons: <CouponsTab onModal={setModal} />,
    campaigns: <CampaignsTab onModal={setModal} />,
    banners: <BannersTab onModal={setModal} />,
    discounts: <DiscountsTab onModal={setModal} />,
    audience: <AudienceTab />,
    analytics: <AnalyticsTab />,
  };

  const statsRow = [
    { label: "Active Coupons", value: "24", change: "3 this week", up: true },
    { label: "Revenue from Promos", value: "$48.2K", change: "12.4%", up: true },
    { label: "Coupon Uses", value: "1,847", change: "8.1%", up: true },
    { label: "Conversion Rate", value: "18.3%", change: "1.2%", up: false },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={S.app}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, border: `0.5px solid ${T.border}`, background: T.bg, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: T.muted }}>←</div>
            <div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Promotions</span>
              <span style={{ fontSize: 12, color: T.muted, marginLeft: 8 }}>Marketing & Campaigns</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Btn size="sm" onClick={() => setModal("campaign")}>+ Campaign</Btn>
            <Btn variant="primary" size="sm" onClick={() => setModal("coupon")}>+ New Coupon</Btn>
          </div>
        </div>

        <div style={S.main}>
          {/* Sidebar */}
          <div style={S.sidebar}>
            <div style={{ padding: "0 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: ".8px", textTransform: "uppercase", padding: "8px 8px 4px" }}>Promotions</div>
              {NAV_ITEMS.map(item => (
                <div key={item.id} onClick={() => setActiveTab(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 7, cursor: "pointer",
                  fontSize: 12, fontWeight: 500, marginBottom: 1, transition: "all .15s",
                  background: activeTab === item.id ? "#eef2fe" : "transparent",
                  color: activeTab === item.id ? T.primary : T.grayText,
                }}>
                  <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              {statsRow.map(s => <StatCard key={s.label} {...s} />)}
            </div>
            {tabContent[activeTab]}
          </div>
        </div>

        {/* Modal */}
        {modal && <Modal type={modal} onClose={() => setModal(null)} />}
      </div>
    </>
  );
}