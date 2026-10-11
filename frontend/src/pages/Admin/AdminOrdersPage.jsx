import { useState, useEffect, useMemo } from "react";
import { getOrders, getSellers } from "../../services/adminService";

// ── Mock Data ──────────────────────────────────────────────────────────────
const SELLERS = ["TechVault Store", "StyleHub BD", "HomeNest Co.", "GlowBeauty", "SportZone", "GadgetWorld"];
const CUSTOMERS = [
  { name: "Arif Hossain", email: "arif@email.com", phone: "+880 171 234 5678" },
  { name: "Nusrat Jahan", email: "nusrat@email.com", phone: "+880 182 345 6789" },
  { name: "Rahim Uddin", email: "rahim@email.com", phone: "+880 191 456 7890" },
  { name: "Sumaiya Akter", email: "sumaiya@email.com", phone: "+880 161 567 8901" },
  { name: "Kamal Pasha", email: "kamal@email.com", phone: "+880 151 678 9012" },
  { name: "Fatema Begum", email: "fatema@email.com", phone: "+880 171 789 0123" },
  { name: "Tanvir Ahmed", email: "tanvir@email.com", phone: "+880 181 890 1234" },
  { name: "Sabina Islam", email: "sabina@email.com", phone: "+880 192 901 2345" },
];
const ADDRESSES = [
  "House 12, Road 5, Dhanmondi, Dhaka 1205",
  "Flat 3B, Gulshan Ave, Gulshan-2, Dhaka 1212",
  "Block C, Apt 7, Mirpur-10, Dhaka 1216",
  "Plot 44, Sector 7, Uttara, Dhaka 1230",
  "House 8, Lane 3, Banani, Dhaka 1213",
  "Flat 201, Bashundhara R/A, Dhaka 1229",
];
const PRODUCTS = [
  { name: "Wireless Earbuds Pro", price: 2499, emoji: "🎧" },
  { name: "Smart Watch Series 5", price: 8999, emoji: "⌚" },
  { name: "Running Shoes X3", price: 3499, emoji: "👟" },
  { name: "Linen Maxi Dress", price: 1899, emoji: "👗" },
  { name: "LED Desk Lamp", price: 1299, emoji: "🏮" },
  { name: "Vitamin C Serum", price: 899, emoji: "🧴" },
  { name: "Bluetooth Speaker", price: 3299, emoji: "🔊" },
  { name: "USB-C Hub 7-Port", price: 1799, emoji: "🖥️" },
  { name: "Yoga Mat Premium", price: 1499, emoji: "🧘" },
  { name: "Face Moisturizer", price: 749, emoji: "💆" },
];
const PAYMENT_METHODS = ["bKash", "Nagad", "Credit Card", "Cash on Delivery", "Bank Transfer"];
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["paid", "unpaid", "refunded"];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function genOrders() {
  return Array.from({ length: 42 }, (_, i) => {
    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const seller = SELLERS[i % SELLERS.length];
    const itemCount = rand(1, 4);
    const items = Array.from({ length: itemCount }, () => {
      const p = pick(PRODUCTS);
      return { ...p, qty: rand(1, 3), id: rand(1000, 9999) };
    });
    const subtotal = items.reduce((s, p) => s + p.price * p.qty, 0);
    const shipping = rand(0, 1) === 0 ? 0 : 60;
    const total = subtotal + shipping;
    const orderStatus = ORDER_STATUSES[i % ORDER_STATUSES.length];
    const payStatus = orderStatus === "cancelled" ? "refunded"
      : orderStatus === "pending" ? pick(["paid", "unpaid"])
      : "paid";
    return {
      id: "ORD-" + String(10000 + i + 1),
      customer,
      seller,
      address: ADDRESSES[i % ADDRESSES.length],
      items,
      subtotal,
      shipping,
      total,
      orderStatus,
      paymentStatus: payStatus,
      paymentMethod: pick(PAYMENT_METHODS),
      createdAt: new Date(Date.now() - rand(1, 90) * 86400000),
    };
  });
}

const MOCK_ORDERS = genOrders();

// ── Normalize API response data ─────────────────────────────────────────────
const normalizeOrder = (order) => ({
  id: order.id || "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  customer: order.customer || { name: "Unknown", email: "", phone: "" },
  seller: order.seller || "Unknown Seller",
  address: order.address || "",
  items: order.items || [],
  subtotal: order.subtotal || 0,
  shipping: order.shipping || 0,
  total: order.total || 0,
  orderStatus: order.orderStatus || "pending",
  paymentStatus: order.paymentStatus || "unpaid",
  paymentMethod: order.paymentMethod || "Bank Transfer",
  createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
  flagged: order.flagged || false,
});

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => "৳" + n.toLocaleString();
const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
const fmtDateTime = (d) => d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });

const ORDER_STATUS_CFG = {
  pending:    { bg: "#fef3e2", color: "#b06000", dot: "#f59e0b" },
  processing: { bg: "#e8f0fe", color: "#1755c2", dot: "#1d5bf5" },
  shipped:    { bg: "#f0f4ff", color: "#4338ca", dot: "#6366f1" },
  delivered:  { bg: "#e6f4ea", color: "#1e7e34", dot: "#22c55e" },
  cancelled:  { bg: "#fce8e6", color: "#d93025", dot: "#ef4444" },
};
const PAY_STATUS_CFG = {
  paid:     { bg: "#e6f4ea", color: "#1e7e34" },
  unpaid:   { bg: "#fce8e6", color: "#d93025" },
  refunded: { bg: "#f0efe9", color: "#5f5e5a" },
};

// ── Shared styles ──────────────────────────────────────────────────────────
const S = {
  input: {
    height: 38, borderRadius: 9, border: "0.5px solid rgba(0,0,0,0.14)",
    background: "#fff", padding: "0 12px", fontSize: 13, color: "#1a1916",
    outline: "none", width: "100%",
  },
  select: {
    height: 38, borderRadius: 9, border: "0.5px solid rgba(0,0,0,0.14)",
    background: "#fff", padding: "0 10px", fontSize: 13, color: "#1a1916",
    outline: "none", cursor: "pointer",
  },
  btn: {
    fontSize: 12, fontWeight: 500, padding: "6px 13px", borderRadius: 8,
    border: "0.5px solid rgba(0,0,0,0.12)", background: "#fff",
    color: "#1a1916", cursor: "pointer", transition: "all 0.12s",
  },
  cardBtn: {
    fontSize: 12, padding: "5px 11px", borderRadius: 8,
    border: "0.5px solid rgba(0,0,0,0.1)", background: "#f5f4f0",
    color: "#1a1916", cursor: "pointer", fontWeight: 500,
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────
function Badge({ cfg, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, padding: "3px 9px",
      borderRadius: 20, whiteSpace: "nowrap",
    }}>
      {cfg.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />}
      {label}
    </span>
  );
}

function SellerChip({ name }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#e8f0fe", color: "#1755c2",
      fontSize: 11, fontWeight: 600, padding: "3px 9px",
      borderRadius: 20, whiteSpace: "nowrap", maxWidth: "100%",
      overflow: "hidden", textOverflow: "ellipsis",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1d5bf5", flexShrink: 0 }} />
      {name}
    </span>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#f0efe9", borderRadius: 12, padding: "14px 16px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 10, color: "#6b6a63", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "#1a1916" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#a09f97", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3.5rem 1rem", gap: 12 }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        border: "3px solid #e5e4de", borderTopColor: "#1d5bf5",
        animation: "spin 0.7s linear infinite",
      }} />
      <span style={{ fontSize: 13, color: "#a09f97" }}>Loading orders…</span>
    </div>
  );
}

// ── Order Detail Drawer ────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, onStatusChange, isMobile }) {
  if (!order) return null;
  const osCfg = ORDER_STATUS_CFG[order.orderStatus];
  const psCfg = PAY_STATUS_CFG[order.paymentStatus];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
          zIndex: 200, transition: "opacity 0.2s",
        }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: isMobile ? "100%" : Math.min(520, window.innerWidth * 0.9),
        background: "#fff", zIndex: 201, overflowY: "auto",
        boxShadow: "-4px 0 40px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s ease",
      }}>
        {/* Drawer header */}
        <div style={{
          padding: "16px 20px", borderBottom: "0.5px solid rgba(0,0,0,0.09)",
          position: "sticky", top: 0, background: "#fff", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1916", fontFamily: "'DM Mono', monospace" }}>{order.id}</div>
            <div style={{ fontSize: 12, color: "#a09f97", marginTop: 2 }}>{fmtDateTime(order.createdAt)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge cfg={osCfg} label={order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)} />
            <button onClick={onClose} style={{ ...S.btn, padding: "5px 10px", fontSize: 16, color: "#a09f97" }}>✕</button>
          </div>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

          {/* Status update */}
          <Section title="Update Order Status">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ORDER_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(order.id, s)}
                  style={{
                    ...S.btn,
                    background: order.orderStatus === s ? ORDER_STATUS_CFG[s].bg : "#f5f4f0",
                    color: order.orderStatus === s ? ORDER_STATUS_CFG[s].color : "#6b6a63",
                    border: order.orderStatus === s ? `1.5px solid ${ORDER_STATUS_CFG[s].color}40` : "0.5px solid rgba(0,0,0,0.1)",
                    fontWeight: order.orderStatus === s ? 700 : 500,
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Section>

          {/* Customer */}
          <Section title="Customer">
            <InfoRow label="Name" value={order.customer.name} />
            <InfoRow label="Email" value={order.customer.email} />
            <InfoRow label="Phone" value={order.customer.phone} />
            <InfoRow label="Shipping address" value={order.address} />
          </Section>

          {/* Seller */}
          <Section title="Seller">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "#e8f0fe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "#1755c2", fontWeight: 700,
              }}>
                {order.seller[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{order.seller}</div>
                <div style={{ fontSize: 11, color: "#a09f97" }}>Verified Seller</div>
              </div>
            </div>
          </Section>

          {/* Products */}
          <Section title={`Ordered Items (${order.items.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", background: "#f8f7f3",
                  borderRadius: 10, border: "0.5px solid rgba(0,0,0,0.07)",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    border: "0.5px solid rgba(0,0,0,0.08)", flexShrink: 0,
                  }}>{item.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, color: "#1a1916", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#a09f97" }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment Summary">
            <div style={{ background: "#f8f7f3", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6b6a63" }}>
                <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "#6b6a63" }}>
                <span>Shipping</span><span>{order.shipping === 0 ? "Free" : fmt(order.shipping)}</span>
              </div>
              <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.09)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}>
                <span>Total</span><span style={{ color: "#1d5bf5" }}>{fmt(order.total)}</span>
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#a09f97" }}>{order.paymentMethod}</span>
                <Badge cfg={psCfg} label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)} />
              </div>
            </div>
          </Section>

        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#a09f97", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13 }}>
      <span style={{ color: "#a09f97", minWidth: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#1a1916", fontWeight: 500, wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

// ── Mobile Order Card ──────────────────────────────────────────────────────
function OrderCard({ order, onView, onStatusChange }) {
  const osCfg = ORDER_STATUS_CFG[order.orderStatus];
  const psCfg = PAY_STATUS_CFG[order.paymentStatus];
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "0.5px solid rgba(0,0,0,0.09)", padding: 14,
      display: "flex", flexDirection: "column", gap: 10,
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 13, color: "#1d5bf5" }}>{order.id}</div>
          <div style={{ fontSize: 12, color: "#a09f97", marginTop: 2 }}>{fmtDate(order.createdAt)}</div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1916" }}>{fmt(order.total)}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <Badge cfg={osCfg} label={order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)} />
        <Badge cfg={psCfg} label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)} />
        <SellerChip name={order.seller} />
      </div>

      <div style={{ fontSize: 13, color: "#6b6a63" }}>
        <span style={{ color: "#a09f97" }}>Customer: </span>
        <span style={{ fontWeight: 500 }}>{order.customer.name}</span>
      </div>

      <div style={{ display: "flex", gap: 6, borderTop: "0.5px solid rgba(0,0,0,0.07)", paddingTop: 10 }}>
        <button onClick={() => onView(order)} style={{ ...S.btn, flex: 1 }}>View details</button>
        <select
          value={order.orderStatus}
          onChange={e => onStatusChange(order.id, e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{ ...S.select, flex: 1, fontSize: 12 }}
        >
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPay, setFilterPay] = useState("");
  const [filterSeller, setFilterSeller] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1100);
  const PER_PAGE = isMobile ? 8 : 12;

  // Fetch orders from API
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrders();
        const normalized = (data || []).map(normalizeOrder);
        setOrders(normalized);
        setError(null);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Failed to load orders. Please try again.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  // Fetch sellers from API
  useEffect(() => {
    const loadSellers = async () => {
      setSellersLoading(true);
      try {
        const data = await getSellers();
        setSellers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load sellers:", err);
        setSellers([]);
      } finally {
        setSellersLoading(false);
      }
    };
    loadSellers();
  }, []);

  useEffect(() => {
    const fn = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1100);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const updateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus: newStatus } : o));
    if (drawer?.id === id) setDrawer(prev => ({ ...prev, orderStatus: newStatus }));
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let list = orders.filter(o => {
      const q = search.toLowerCase();
      if (q && !o.id.toLowerCase().includes(q) && !o.customer.name.toLowerCase().includes(q)) return false;
      if (filterStatus && o.orderStatus !== filterStatus) return false;
      if (filterPay && o.paymentStatus !== filterPay) return false;
      if (filterSeller && o.seller !== filterSeller) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === "newest") return b.createdAt - a.createdAt;
      if (sort === "oldest") return a.createdAt - b.createdAt;
      if (sort === "amount-high") return b.total - a.total;
      if (sort === "amount-low") return a.total - b.total;
      return 0;
    });
    return list;
  }, [orders, search, filterStatus, filterPay, filterSeller, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const resetPage = () => setPage(1);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === "pending").length,
    delivered: orders.filter(o => o.orderStatus === "delivered").length,
    revenue: orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0),
  }), [orders]);

  // Sync drawer with latest order state
  const liveDrawer = drawer ? orders.find(o => o.id === drawer.id) || drawer : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .row-hover:hover { background: #f8f7f3 !important; }
        input:focus, select:focus { box-shadow: 0 0 0 3px rgba(29,91,245,0.12); border-color: #1d5bf5 !important; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f0efe9; }
        ::-webkit-scrollbar-thumb { background: #d0cfc8; border-radius: 10px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Top Nav ── */}
        <div style={{
          background: "#fff", borderBottom: "0.5px solid rgba(0,0,0,0.09)",
          padding: isMobile ? "0 16px" : "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 56, position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, background: "#1d5bf5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: "#fff", fontWeight: 800,
            }}>A</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1916" }}>
              {isMobile ? "Admin" : "Admin Panel"}
            </span>
            {!isMobile && (
              <span style={{ fontSize: 12, color: "#a09f97", marginLeft: 4 }}>/ Orders</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px #dcfce7" }} />
            <span style={{ fontSize: 12, color: "#6b6a63" }}>Live</span>
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ padding: isMobile ? 16 : isTablet ? 20 : 28, maxWidth: 1440, margin: "0 auto" }}>

          {/* Header */}
          <div style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between", gap: 12, marginBottom: 20,
            animation: "fadeIn 0.35s ease",
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1a1916", margin: 0 }}>
                Order management
              </h1>
              <p style={{ fontSize: 13, color: "#6b6a63", marginTop: 4 }}>
                Monitor and control all marketplace orders · read-only admin view
              </p>
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const data = await getOrders();
                  const normalized = (data || []).map(normalizeOrder);
                  setOrders(normalized);
                  setError(null);
                } catch (err) {
                  console.error("Failed to refresh orders:", err);
                  setError("Failed to refresh orders");
                } finally {
                  setLoading(false);
                }
              }}
              style={{ ...S.btn, display: "flex", alignItems: "center", gap: 5 }}
            >
              ↻ Refresh
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", animation: "fadeIn 0.35s ease 0.05s both" }}>
            <StatCard label="Total orders" value={stats.total} sub="all time" />
            <StatCard label="Pending" value={stats.pending} color="#b06000" sub="awaiting action" />
            <StatCard label="Delivered" value={stats.delivered} color="#1e7e34" sub="completed" />
            <StatCard label="Revenue" value={fmt(stats.revenue)} color="#1d5bf5" sub="paid orders" />
          </div>

          {/* Toolbar */}
          <div style={{ animation: "fadeIn 0.35s ease 0.1s both" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#a09f97", fontSize: 14, pointerEvents: "none" }}>⌕</span>
                <input
                  type="text" placeholder="Search by order ID or customer…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); resetPage(); }}
                  style={{ ...S.input, paddingLeft: 32 }}
                />
              </div>

              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); resetPage(); }} style={S.select}>
                <option value="">All statuses</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>

              <select value={filterPay} onChange={e => { setFilterPay(e.target.value); resetPage(); }} style={S.select}>
                <option value="">All payments</option>
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>

              {!isMobile && (
                <select value={filterSeller} onChange={e => { setFilterSeller(e.target.value); resetPage(); }} style={S.select}>
                  <option value="">All sellers</option>
                  {sellersLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    sellers.map(s => {
                      const name = typeof s === 'string' ? s : s.shopName || s.name || s.id || '';
                      const key = typeof s === 'string' ? s : s.id || s.shopName || s.name || '';
                      return (
                        <option key={key} value={name}>
                          {name}
                        </option>
                      );
                    })
                  )}
                </select>
              )}

              <select value={sort} onChange={e => { setSort(e.target.value); resetPage(); }} style={S.select}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount-high">Amount ↓</option>
                <option value="amount-low">Amount ↑</option>
              </select>
            </div>

            {isMobile && (
              <div style={{ marginBottom: 8 }}>
                <select value={filterSeller} onChange={e => { setFilterSeller(e.target.value); resetPage(); }} style={{ ...S.select, width: "100%" }}>
                  <option value="">All sellers</option>
                  {sellersLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    sellers.map(s => {
                      const name = typeof s === 'string' ? s : s.shopName || s.name || s.id || '';
                      const key = typeof s === 'string' ? s : s.id || s.shopName || s.name || '';
                      return (
                        <option key={key} value={name}>
                          {name}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            )}

            <div style={{ fontSize: 12, color: "#a09f97", marginBottom: 10 }}>
              {!loading && `${filtered.length} order${filtered.length !== 1 ? "s" : ""} found`}
            </div>
          </div>

          {/* Content */}
          <div style={{ animation: "fadeIn 0.35s ease 0.15s both" }}>
            {loading ? (
              <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)" }}>
                <Spinner />
              </div>

            ) : error ? (
              <div style={{
                background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)",
                padding: "3rem 1.5rem", textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
                <div style={{ fontWeight: 700, color: "#d93025", marginBottom: 6 }}>Something went wrong</div>
                <div style={{ fontSize: 13, color: "#a09f97", marginBottom: 16 }}>{error}</div>
                <button onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await getOrders();
                    const normalized = (data || []).map(normalizeOrder);
                    setOrders(normalized);
                    setError(null);
                  } catch (err) {
                    console.error("Failed to reload orders:", err);
                    setError("Failed to reload orders. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }} style={S.btn}>
                  Try again
                </button>
              </div>

            ) : filtered.length === 0 ? (
              <div style={{
                background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)",
                padding: "3rem 1.5rem", textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <div style={{ fontWeight: 700, color: "#1a1916", marginBottom: 6 }}>No orders found</div>
                <div style={{ fontSize: 13, color: "#a09f97", marginBottom: 16 }}>Try adjusting your filters or search</div>
                <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterPay(""); setFilterSeller(""); }} style={S.btn}>
                  Clear all filters
                </button>
              </div>

            ) : isMobile ? (
              /* ── Mobile: Cards ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {paged.map(o => (
                  <OrderCard key={o.id} order={o} onView={setDrawer} onStatusChange={updateStatus} />
                ))}
              </div>

            ) : (
              /* ── Desktop/Tablet: Table ── */
              <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: isTablet ? 780 : 1000 }}>
                    <thead>
                      <tr style={{ background: "#f8f7f3", borderBottom: "0.5px solid rgba(0,0,0,0.09)" }}>
                        {["Order ID", "Customer", "Seller", "Total", "Payment", "Status", !isTablet && "Date", "Actions"]
                          .filter(Boolean)
                          .map((h, i) => (
                            <th key={i} style={{
                              padding: "11px 14px", textAlign: "left", fontWeight: 700,
                              fontSize: 10, color: "#6b6a63", textTransform: "uppercase",
                              letterSpacing: "0.06em", whiteSpace: "nowrap",
                            }}>{h}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(o => {
                        const osCfg = ORDER_STATUS_CFG[o.orderStatus];
                        const psCfg = PAY_STATUS_CFG[o.paymentStatus];
                        return (
                          <tr
                            key={o.id}
                            className="row-hover"
                            style={{ borderBottom: "0.5px solid rgba(0,0,0,0.07)", cursor: "pointer", transition: "background 0.1s" }}
                            onClick={() => setDrawer(o)}
                          >
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 12, color: "#1d5bf5" }}>{o.id}</span>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ fontWeight: 500, fontSize: 13, color: "#1a1916" }}>{o.customer.name}</div>
                              <div style={{ fontSize: 11, color: "#a09f97" }}>{o.customer.email}</div>
                            </td>
                            <td style={{ padding: "12px 14px" }}><SellerChip name={o.seller} /></td>
                            <td style={{ padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(o.total)}</td>
                            <td style={{ padding: "12px 14px" }}><Badge cfg={psCfg} label={o.paymentStatus.charAt(0).toUpperCase() + o.paymentStatus.slice(1)} /></td>
                            <td style={{ padding: "12px 14px" }}>
                              <Badge cfg={osCfg} label={o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1)} />
                            </td>
                            {!isTablet && (
                              <td style={{ padding: "12px 14px", fontSize: 12, color: "#a09f97", whiteSpace: "nowrap" }}>
                                {fmtDate(o.createdAt)}
                              </td>
                            )}
                            <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 5 }}>
                                <button onClick={() => setDrawer(o)} style={{ ...S.cardBtn, fontSize: 11, padding: "4px 10px" }}>View</button>
                                <select
                                  value={o.orderStatus}
                                  onChange={e => updateStatus(o.id, e.target.value)}
                                  style={{ ...S.select, height: 30, fontSize: 11, padding: "0 8px", borderRadius: 7 }}
                                >
                                  {ORDER_STATUSES.map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: 14, flexWrap: "wrap", gap: 8,
            }}>
              <span style={{ fontSize: 12, color: "#a09f97" }}>
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...S.cardBtn, opacity: page === 1 ? 0.4 : 1 }}>←</button>
                {Array.from({ length: Math.min(totalPages, isMobile ? 4 : 7) }, (_, i) => {
                  const maxShow = isMobile ? 4 : 7;
                  const pg = totalPages <= maxShow ? i + 1
                    : page <= 3 ? i + 1
                    : page >= totalPages - 2 ? totalPages - maxShow + 1 + i
                    : page - Math.floor(maxShow / 2) + i;
                  return (
                    <button key={pg} onClick={() => setPage(pg)} style={{
                      ...S.cardBtn, minWidth: 34,
                      background: pg === page ? "#1d5bf5" : "#f5f4f0",
                      color: pg === page ? "#fff" : "#1a1916",
                      border: pg === page ? "none" : "0.5px solid rgba(0,0,0,0.1)",
                      fontWeight: pg === page ? 700 : 500,
                    }}>{pg}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...S.cardBtn, opacity: page === totalPages ? 0.4 : 1 }}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      {liveDrawer && (
        <OrderDrawer
          order={liveDrawer}
          onClose={() => setDrawer(null)}
          onStatusChange={updateStatus}
          isMobile={isMobile}
        />
      )}
    </>
  );
}