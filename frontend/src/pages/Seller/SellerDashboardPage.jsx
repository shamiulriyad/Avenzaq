import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerDashboard } from "../../services/sellerService";
import { getImageUrl } from "../../services/imageUploadService";

const C = {
  primary: "#1d5bf5",
  primaryDark: "#1648d0",
  primarySoft: "#eef2fe",
  blue: "#1d5bf5",
  blueBg: "#eef2fe",
  blueText: "#1e3a8a",
  text: "#1a1916",
  textSub: "#5f5e5a",
  muted: "#8f8d86",
  bg: "#f5f4f0",
  white: "#ffffff",
  border: "#e2e1da",
  borderSoft: "#f0efe9",
  green: "#16a34a",
  greenBg: "#dcfce7",
  greenText: "#14532d",
  orange: "#ea580c",
  orangeBg: "#fff7ed",
  orangeText: "#9a3412",
  red: "#dc2626",
  redBg: "#fef2f2",
  redText: "#991b1b",
  yellow: "#ca8a04",
  yellowBg: "#fefce8",
  yellowText: "#713f12",
  purple: "#7c3aed",
  purpleBg: "#f3f0ff",
  purpleText: "#4c1d95",
  teal: "#0f766e",
  tealBg: "#ccfbf1",
  tealText: "#134e4a",
  font: "'DM Sans', sans-serif",
};

const MONTHS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function formatCompact(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Number(value || 0));
}

function badgeMeta(status) {
  const key = String(status || "").toLowerCase();
  const map = {
    pending: { label: "Pending", color: C.orangeText, bg: C.orangeBg },
    shipped: { label: "Shipped", color: C.blueText, bg: C.blueBg },
    delivered: { label: "Delivered", color: C.greenText, bg: C.greenBg },
    completed: { label: "Completed", color: C.greenText, bg: C.greenBg },
    low: { label: "Low Stock", color: C.orangeText, bg: C.orangeBg },
    out: { label: "Out of Stock", color: C.redText, bg: C.redBg },
    ok: { label: "In Stock", color: C.greenText, bg: C.greenBg },
    approved: { label: "Approved", color: C.greenText, bg: C.greenBg },
  };

  return map[key] || { label: status || "Unknown", color: C.muted, bg: C.bg };
}

function Badge({ status }) {
  const meta = badgeMeta(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: meta.bg,
        color: meta.color,
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </span>
  );
}

function Card({ children, style = {}, pad = 16 }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: pad,
        boxShadow: "0 8px 28px rgba(26, 25, 22, 0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, variant = "ghost", size = "md", onClick, disabled = false }) {
  const [hover, setHover] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: size === "sm" ? "7px 12px" : "9px 16px",
    borderRadius: 10,
    fontFamily: C.font,
    fontSize: size === "sm" ? 12 : 13,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all .15s ease",
    opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary: { background: hover ? C.primaryDark : C.primary, color: C.white },
    ghost: { background: hover ? C.bg : C.white, color: C.text, border: `1px solid ${C.border}` },
    soft: { background: hover ? "#dde6fd" : C.primarySoft, color: C.primary },
    danger: { background: hover ? "#fee2e2" : C.redBg, color: C.red, border: `1px solid #fca5a5` },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</div>
        {sub ? <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sub}</div> : null}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, change, icon, accent, accentBg, negative = false }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {icon}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: negative ? C.red : C.green,
            background: negative ? C.redBg : C.greenBg,
            padding: "3px 8px",
            borderRadius: 999,
          }}
        >
          {negative ? "↓" : "↑"} {change}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{label}</div>
    </Card>
  );
}

function SellerProfileCard({ dashboard, navigate }) {
  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: C.primarySoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: C.primary,
              flexShrink: 0,
            }}
          >
            {dashboard?.shopName ? dashboard.shopName.slice(0, 2).toUpperCase() : "S"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{dashboard?.shopName || "Seller Store"}</span>
              {dashboard?.isVerified ? <span style={{ fontSize: 10, padding: "2px 8px", background: C.greenBg, color: C.greenText, borderRadius: 999, fontWeight: 800 }}>Verified</span> : <span style={{ fontSize: 10, padding: "2px 8px", background: C.orangeBg, color: C.orangeText, borderRadius: 999, fontWeight: 800 }}>Pending</span>}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {dashboard?.isVerified ? "Your shop is active and visible to customers." : "Your profile is still pending approval."}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="soft" size="sm" onClick={() => navigate("/seller/products")}>Manage Products</Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/seller/products/new")}>Add Product</Button>
        </div>
      </div>
    </Card>
  );
}

function QuickActions({ navigate }) {
  const actions = [
    { label: "Add Product", icon: "➕", color: C.primary, bg: C.primarySoft, onClick: () => navigate("/seller/products/new") },
    { label: "Manage Products", icon: "📦", color: C.purple, bg: C.purpleBg, onClick: () => navigate("/seller/products") },
    { label: "View Orders", icon: "🗂", color: C.green, bg: C.greenBg, onClick: () => navigate("/seller/orders") },
    { label: "Settings", icon: "👤", color: C.teal, bg: C.tealBg, onClick: () => navigate("/seller/settings") },
    { label: "Earnings", icon: "💳", color: C.orange, bg: C.orangeBg, onClick: () => navigate("/seller/earnings") },
    { label: "Notifications", icon: "🔔", color: C.textSub, bg: C.bg, onClick: () => navigate("/seller/notifications") },
  ];

  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionHeader title="Quick Actions" sub="Common seller tasks" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "14px 10px",
              borderRadius: 14,
              cursor: "pointer",
              background: action.bg,
              border: `1px solid transparent`,
              transition: "all .15s ease",
            }}
          >
            <span style={{ fontSize: 22 }}>{action.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: action.color, textAlign: "center" }}>{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function SalesChartCard({ dashboard }) {
  const total = dashboard.salesChart.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...dashboard.salesChart, 1);

  return (
    <Card>
      <SectionHeader title="Sales Overview" sub="Last 7 days" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, alignItems: "end" }}>
        <div>
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: C.muted }}>Total Sales</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{formatMoney(dashboard.totalSales)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.muted }}>Avg Order Value</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>{formatMoney(dashboard.avgOrderValue)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.muted }}>Conversion Rate</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.teal }}>{Number(dashboard.conversionRate || 0).toFixed(1)}%</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "end", height: 140 }}>
            {dashboard.salesChart.map((value, index) => {
              const barHeight = Math.max(12, Math.round((value / max) * 100));
              return (
                <div key={`${index}-${value}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "end", gap: 8 }}>
                  <div style={{ fontSize: 10, color: C.muted, textAlign: "center" }}>{MONTHS[index] || index + 1}</div>
                  <div style={{ height: `${barHeight}%`, minHeight: 12, borderRadius: "10px 10px 0 0", background: index === dashboard.salesChart.length - 1 ? C.primary : C.primarySoft }} />
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ padding: 14, borderRadius: 14, background: C.bg, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.muted }}>Total Sales Events</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{formatCompact(total)}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 14, background: C.primarySoft, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.primary }}>Low Stock Items</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>{dashboard.lowStockCount}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 14, background: C.greenBg }}>
            <div style={{ fontSize: 12, color: C.greenText }}>Returning Customers</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.greenText }}>{dashboard.returningCustomers}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TopProductsCard({ products, navigate }) {
  return (
    <Card style={{ marginBottom: 20 }} pad={0}>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.border}` }}>
        <SectionHeader title="Top Products" sub="Best performing items in the selected period" action={<Button size="sm" onClick={() => navigate("/seller/products")}>View all</Button>} />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Product", "Sold", "Revenue", "Status"].map((header) => (
                <th key={header} style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".5px", padding: "12px 16px", textAlign: "left" }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stockStatus = product.sold > 0 ? "ok" : "low";
              return (
                <tr key={product.id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {product.image ? <img src={getImageUrl(product.image)} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 12, color: C.muted }}>P</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{product.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{product.sold}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatMoney(product.revenue)}</td>
                  <td style={{ padding: "12px 16px" }}><Badge status={stockStatus} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RecentOrdersCard({ orders, navigate }) {
  return (
    <Card style={{ marginBottom: 20 }} pad={0}>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.border}` }}>
        <SectionHeader title="Recent Orders" sub="Latest customer purchases" action={<Button size="sm" onClick={() => navigate("/seller/orders")}>View all</Button>} />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Order", "Customer", "Amount", "Status"].map((header) => (
                <th key={header} style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".5px", padding: "12px 16px", textAlign: "left" }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: C.primary, background: C.primarySoft, padding: "3px 8px", borderRadius: 6 }}>{String(order.id).slice(0, 8)}</span>
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{order.customerName}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{formatMoney(order.amount)}</td>
                <td style={{ padding: "12px 16px" }}><Badge status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReviewsCard({ reviews }) {
  return (
    <Card>
      <SectionHeader title="Recent Reviews" sub="Feedback from customers" />
      <div style={{ display: "grid", gap: 10 }}>
        {reviews.length === 0 ? (
          <div style={{ fontSize: 13, color: C.muted }}>No reviews yet.</div>
        ) : (
          reviews.map((review, index) => (
            <div key={`${review.customerName}-${index}`} style={{ padding: 12, borderRadius: 14, background: C.bg }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{review.customerName}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{review.productName}</div>
                </div>
                <Badge status="approved" />
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 2, color: C.yellow, fontSize: 12 }}>
                {Array.from({ length: Math.max(0, review.rating || 0) }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.textSub, marginTop: 8, lineHeight: 1.5 }}>{review.comment || "No comment provided."}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function EarningsCard({ dashboard }) {
  const gross = Number(dashboard.totalSales || 0);
  const pending = gross * 0.05;
  const platformFee = gross * 0.05;
  const tax = gross * 0.025;
  const net = gross - platformFee - tax;

  return (
    <Card>
      <SectionHeader title="Earnings Summary" sub="This period" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Gross Revenue", value: formatMoney(gross), icon: "💰", color: C.primary, bg: C.primarySoft },
          { label: "Net Earnings", value: formatMoney(net), icon: "📈", color: C.green, bg: C.greenBg },
          { label: "Platform Fee", value: formatMoney(platformFee), icon: "🧾", color: C.orange, bg: C.orangeBg },
          { label: "Pending Payout", value: formatMoney(pending), icon: "⏳", color: C.purple, bg: C.purpleBg },
        ].map((entry) => (
          <div key={entry.label} style={{ background: C.bg, borderRadius: 14, padding: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: entry.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{entry.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{entry.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{entry.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 14, background: C.primarySoft, borderRadius: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>Average Rating</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>{Number(dashboard.averageRating || 0).toFixed(1)} / 5.0</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: C.muted }}>Sales Change</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: dashboard.salesChange < 0 ? C.red : C.green }}>
            {dashboard.salesChange >= 0 ? "+" : ""}{dashboard.salesChange}%
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("week");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSellerDashboard(dateRange);
        if (!active) return;
        setDashboard(data);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || "Failed to load seller dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [dateRange, refreshTick]);

  const initials = useMemo(() => {
    if (!dashboard?.shopName) return "S";
    return dashboard.shopName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [dashboard?.shopName]);

  const stats = dashboard
    ? [
        { label: "Total Products", value: formatCompact(dashboard.totalProducts), change: dashboard.productsChange || 0, icon: "🏪", accent: C.primary, accentBg: C.primarySoft },
        { label: "Pending Orders", value: formatCompact(dashboard.pendingOrders), change: dashboard.ordersChange || 0, icon: "📦", accent: C.orange, accentBg: C.orangeBg, negative: (dashboard.ordersChange || 0) < 0 },
        { label: "Total Sales", value: formatMoney(dashboard.totalSales), change: dashboard.salesChange || 0, icon: "💰", accent: C.green, accentBg: C.greenBg },
        { label: "Average Rating", value: Number(dashboard.averageRating || 0).toFixed(1), change: dashboard.ratingChange || 0, icon: "⭐", accent: C.yellow, accentBg: C.yellowBg },
      ]
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400;1,700&display=swap');
        * { box-sizing: border-box; }
        body { background: ${C.bg}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 999px; }
      `}</style>
      <div style={{ fontFamily: C.font, minHeight: "100vh", background: C.bg, padding: 24, color: C.text }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>
              Seller Dashboard
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              Live store performance, orders, products, and reviews.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontFamily: C.font, fontSize: 13, color: C.text }}
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 12 months</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => navigate("/seller/products")}>Manage Products</Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/seller/products/new")}>Add Product</Button>
          </div>
        </div>

        {error ? (
          <div style={{ background: C.redBg, border: `1px solid #fecaca`, color: C.redText, padding: "12px 14px", borderRadius: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{error}</span>
            <Button variant="danger" size="sm" onClick={() => setRefreshTick((value) => value + 1)}>
              Retry
            </Button>
          </div>
        ) : null}

        {loading ? (
          <Card>
            <div style={{ fontSize: 14, color: C.muted }}>Loading dashboard…</div>
          </Card>
        ) : dashboard ? (
          <>
            <SellerProfileCard dashboard={{ ...dashboard, initials }} navigate={navigate} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} negative={Boolean(stat.negative || stat.change < 0)} change={`${Math.abs(stat.change || 0)}%`} />
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <QuickActions navigate={navigate} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 20 }}>
              <SalesChartCard dashboard={dashboard} />
              <EarningsCard dashboard={dashboard} />
            </div>

            <TopProductsCard products={dashboard.topProducts || []} navigate={navigate} />
            <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20, marginBottom: 20 }}>
              <RecentOrdersCard orders={dashboard.recentOrders || []} navigate={navigate} />
              <ReviewsCard reviews={dashboard.recentReviews || []} />
            </div>

            <div style={{ textAlign: "center", padding: "18px 0 6px", fontSize: 11, color: C.muted }}>
              Seller Panel · Live data from your store
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
