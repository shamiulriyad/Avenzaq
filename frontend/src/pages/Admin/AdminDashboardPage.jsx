import { useState, useEffect, useCallback } from "react";
import { getAdminDashboard } from "../../services/adminService";

// ─── Font Injection ───────────────────────────────────────────────────────────
(() => {
  if (!document.getElementById("dm-sans-font")) {
    const l = document.createElement("link");
    l.id = "dm-sans-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap";
    document.head.appendChild(l);
  }
})();

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary:      "#1d5bf5",
  primaryLight: "#e8effe",
  primaryMid:   "#c5d5fd",
  text:         "#1a1916",
  textSoft:     "#4a4845",
  muted:        "#a09f97",
  bg:           "#f5f4f0",
  white:        "#ffffff",
  border:       "#e8e7e3",
  green:        "#16a34a",
  greenLight:   "#dcfce7",
  orange:       "#ea580c",
  orangeLight:  "#fff0e6",
  red:          "#dc2626",
  redLight:     "#fee2e2",
  yellow:       "#ca8a04",
  yellowLight:  "#fef9c3",
  teal:         "#0d9488",
  tealLight:    "#ccfbf1",
  purple:       "#7c3aed",
  purpleLight:  "#ede9fe",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (n) => (n ?? 0).toLocaleString("en-US");
const fmtK    = (n) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);
const fmtBDT  = (n) => `৳${fmt(n)}`;
const timeAgo = (ms) => {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
};
const mkSpark = (base, n = 8) =>
  Array.from({ length: n }, (_, i) =>
    Math.max(0, Math.round(base * (0.5 + 0.7 * (i / (n - 1))) + (Math.random() - 0.4) * base * 0.35))
  );

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mkData = () => {
  const days7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    stats: {
      revenue:  { value: 1284507, growth: 12.4  },
      orders:   { value: 38420,   growth: 8.7   },
      users:    { value: 24810,   growth: 15.2  },
      sellers:  { value: 1847,    growth: 6.1   },
      products: { value: 52340,   growth: 3.8   },
      pending:  { value: 498,     growth: -2.1  },
    },
    revenueChart: days7.map((d, i) => ({ label: d, value: 120000 + i * 14000 + Math.round(Math.random() * 30000), commission: 18000 + i * 2100 + Math.round(Math.random() * 4000) })),
    ordersChart:  days7.map((d, i) => ({ label: d, completed: 700 + i * 60 + Math.round(Math.random() * 120), pending: 80 + Math.round(Math.random() * 60), cancelled: 20 + Math.round(Math.random() * 30) })),
    userChart:    days7.map((d, i) => ({ label: d, value: 200 + i * 28 + Math.round(Math.random() * 60) })),
    sellerChart:  days7.map((d, i) => ({ label: d, value: 12 + i * 3 + Math.round(Math.random() * 8) })),
    alerts: {
      lowStock:       [{ name: "Smart Watch S4", stock: 9, cat: "Electronics" }, { name: "Coffee Maker Pro", stock: 7, cat: "Kitchen" }, { name: "Winter Jacket XL", stock: 5, cat: "Fashion" }],
      pendingSellers: [{ name: "TechShop24", submitted: "2h ago" }, { name: "FreshMart BD", submitted: "5h ago" }, { name: "KidsWorld Store", submitted: "1d ago" }],
      newOrders:      [{ id: "#ORD-8842", amount: 4200, customer: "Rahim A." }, { id: "#ORD-8841", amount: 1850, customer: "Priya S." }, { id: "#ORD-8840", amount: 9200, customer: "Omar F." }],
      failedPayments: [{ id: "#PAY-221", amount: 3400, user: "Karim H." }, { id: "#PAY-220", amount: 8900, user: "Nadia I." }],
      suspicious:     [{ user: "user_99234", action: "Multiple failed logins" }, { user: "seller_4421", action: "Rapid product listings" }],
    },
    topSellers: [
      { name: "TechZone BD",  revenue: 284000, orders: 412, rating: 4.8 },
      { name: "Fashion Hub",  revenue: 221000, orders: 389, rating: 4.7 },
      { name: "HomeDecor+",   revenue: 189000, orders: 301, rating: 4.6 },
      { name: "Sports Arena", revenue: 152000, orders: 278, rating: 4.5 },
    ],
    topProducts: [
      { name: "iPhone 15 Pro Case", sold: 892, revenue: 133800, cat: "Accessories" },
      { name: "Running Shoes X9",   sold: 743, revenue: 743000, cat: "Sports"      },
      { name: "Smart Watch S4",     sold: 621, revenue: 931500, cat: "Electronics" },
      { name: "Yoga Mat Pro",       sold: 518, revenue: 259000, cat: "Fitness"     },
    ],
    recentOrders: [
      { id: "#ORD-8842", customer: "Rahim Ahmed",  amount: 4200, status: "pending",   time: Date.now() - 180000  },
      { id: "#ORD-8841", customer: "Priya Singh",  amount: 1850, status: "completed", time: Date.now() - 620000  },
      { id: "#ORD-8840", customer: "Omar Faruk",   amount: 9200, status: "completed", time: Date.now() - 1200000 },
      { id: "#ORD-8839", customer: "Nadia Islam",  amount: 3100, status: "cancelled", time: Date.now() - 2400000 },
      { id: "#ORD-8838", customer: "Karim Hassan", amount: 6700, status: "completed", time: Date.now() - 3600000 },
    ],
    newUsers: [
      { name: "Rahim Ahmed", joined: Date.now() - 180000,  orders: 0 },
      { name: "Salma Begum", joined: Date.now() - 900000,  orders: 2 },
      { name: "Jamal Uddin", joined: Date.now() - 2700000, orders: 1 },
      { name: "Ritu Sharma", joined: Date.now() - 7200000, orders: 0 },
    ],
    activity: [
      { type: "order",   msg: "New order #ORD-8842 placed by Rahim Ahmed",    time: Date.now() - 180000  },
      { type: "user",    msg: "Salma Begum registered as a new user",          time: Date.now() - 420000  },
      { type: "product", msg: "TechZone BD added 12 new products",             time: Date.now() - 900000  },
      { type: "status",  msg: "Order #ORD-8836 marked as completed",           time: Date.now() - 1800000 },
      { type: "seller",  msg: "FreshMart BD submitted seller application",     time: Date.now() - 2700000 },
      { type: "payment", msg: "Payment #PAY-221 failed — ৳3,400",             time: Date.now() - 3600000 },
      { type: "order",   msg: "New order #ORD-8841 placed by Priya Singh",     time: Date.now() - 5400000 },
      { type: "status",  msg: "Order #ORD-8830 cancelled by customer",         time: Date.now() - 7200000 },
    ],
  };
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 36 }) {
  if (!data?.length) return null;
  const max = Math.max(...data) || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const fill = [`0,${height}`, ...pts, `100,${height}`].join(" ");
  const gId = `sg${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${gId})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// ─── SVG Chart ────────────────────────────────────────────────────────────────
function Chart({ data, keys, colors, labels, type = "bar", height = 200 }) {
  const [hov, setHov] = useState(null);
  if (!data?.length) return <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 12, fontFamily: "DM Sans" }}>No data</div>;

  const allV = data.flatMap(d => keys.map(k => d[k] || 0));
  const max  = Math.max(...allV) || 1;
  const pL = 42, pR = 8, pT = 10, pB = 28;
  const W = 560, H = height;
  const cW = W - pL - pR, cH = H - pT - pB;
  const xOf = i => pL + (cW / (data.length - 1 || 1)) * i;
  const yOf = v => pT + cH - (v / max) * cH;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const bW   = type === "bar" ? (cW / data.length) * 0.72 : 0;
  const bGap = type === "bar" ? (cW / data.length) * 0.28 : 0;

  return (
    <div onMouseLeave={() => setHov(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, overflow: "visible" }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pL} y1={pT + cH - t * cH} x2={W - pR} y2={pT + cH - t * cH} stroke={C.border} strokeWidth={0.8} />
            <text x={pL - 5} y={pT + cH - t * cH + 3} textAnchor="end" fontSize={8} fill={C.muted} fontFamily="DM Sans">{fmtK(Math.round(max * t))}</text>
          </g>
        ))}

        {type === "bar"
          ? data.map((d, i) => {
              const x0 = pL + i * (cW / data.length) + bGap / 2;
              const kW  = bW / keys.length;
              return (
                <g key={i} onMouseEnter={() => setHov({ i, d })} style={{ cursor: "pointer" }}>
                  {keys.map((k, ki) => {
                    const v  = d[k] || 0;
                    const bH = (v / max) * cH;
                    return <rect key={ki} x={x0 + ki * kW} y={pT + cH - bH} width={kW - 0.5} height={bH} fill={colors[ki]} opacity={hov?.i === i ? 1 : 0.8} rx={2} />;
                  })}
                  <text x={x0 + bW / 2} y={H - pB + 12} textAnchor="middle" fontSize={8} fill={C.muted} fontFamily="DM Sans">{d.label}</text>
                </g>
              );
            })
          : keys.map((k, ki) => {
              const ptsArr  = data.map((d, i) => `${xOf(i)},${yOf(d[k] || 0)}`);
              const fillPts = [`${pL},${pT + cH}`, ...ptsArr, `${pL + cW},${pT + cH}`].join(" ");
              const gId = `cg${ki}`;
              return (
                <g key={ki}>
                  <defs>
                    <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={colors[ki]} stopOpacity=".14" />
                      <stop offset="100%" stopColor={colors[ki]} stopOpacity="0"   />
                    </linearGradient>
                  </defs>
                  <polygon points={fillPts} fill={`url(#${gId})`} />
                  <polyline points={ptsArr.join(" ")} fill="none" stroke={colors[ki]} strokeWidth={2} strokeLinejoin="round" />
                  {data.map((d, i) => (
                    <circle key={i} cx={xOf(i)} cy={yOf(d[k] || 0)} r={hov?.i === i ? 4 : 2.2} fill={colors[ki]}
                      onMouseEnter={() => setHov({ i, d })} style={{ cursor: "pointer" }} />
                  ))}
                </g>
              );
            })
        }

        {type === "line" && data.map((d, i) => (
          <text key={i} x={xOf(i)} y={H - pB + 12} textAnchor="middle" fontSize={8} fill={C.muted} fontFamily="DM Sans">{d.label}</text>
        ))}

        {hov && (() => {
          const tx  = type === "bar" ? pL + hov.i * (cW / data.length) + bW / 2 + bGap / 2 : xOf(hov.i);
          const tx2 = Math.min(tx + 8, W - 115);
          return (
            <g>
              <line x1={tx} y1={pT} x2={tx} y2={pT + cH} stroke={C.muted} strokeWidth={1} strokeDasharray="3,3" />
              <rect x={tx2} y={pT + 4} width={108} height={keys.length * 14 + 14} fill={C.text} rx={5} opacity={0.93} />
              {keys.map((k, ki) => (
                <text key={ki} x={tx2 + 8} y={pT + 14 + ki * 14} fontSize={9} fill={colors[ki]} fontFamily="DM Sans">
                  {labels[ki]}: {fmtK(hov.d[k] || 0)}
                </text>
              ))}
            </g>
          );
        })()}
      </svg>

      <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
        {keys.map((k, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[i] }} />
            <span style={{ fontSize: 11, color: C.muted, fontFamily: "DM Sans" }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, growth, icon, color, lightColor, spark, delay = 0 }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const up = growth >= 0;
  return (
    <div
      style={{
        background: C.white, borderRadius: 14, padding: "18px 20px",
        border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10,
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, fontFamily: "DM Sans", marginBottom: 5 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "DM Sans", lineHeight: 1 }}>{value}</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: lightColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      {spark && <div style={{ marginTop: -4 }}><Sparkline data={spark} color={color} height={34} /></div>}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: up ? C.green : C.red, background: up ? C.greenLight : C.redLight, padding: "2px 7px", borderRadius: 20, fontFamily: "DM Sans" }}>
          {up ? "▲" : "▼"} {Math.abs(growth)}%
        </span>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: "DM Sans" }}>vs last period</span>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, title, subtitle, action, style = {} }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", ...style }}>
      {title && (
        <div style={{ padding: "18px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "DM Sans" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontFamily: "DM Sans" }}>{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: title ? "0 20px 20px" : 20 }}>{children}</div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed: [C.green,  C.greenLight,  "Completed"],
    pending:   [C.orange, C.orangeLight, "Pending"  ],
    cancelled: [C.red,    C.redLight,    "Cancelled"],
  };
  const [color, bg, label] = map[status] || [C.muted, C.bg, status];
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color, background: bg, padding: "2px 8px", borderRadius: 20, fontFamily: "DM Sans", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─── Mini Table ───────────────────────────────────────────────────────────────
function MiniTable({ rows, cols }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "DM Sans" }}>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} style={{ padding: "8px 10px", textAlign: c.right ? "right" : "left", fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}
              style={{ transition: "background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {cols.map((c, ci) => (
                <td key={ci} style={{ padding: "10px 10px", fontSize: 12, color: C.text, textAlign: c.right ? "right" : "left", borderBottom: `1px solid ${C.bg}` }}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Alert Accordion ─────────────────────────────────────────────────────────
function AlertAccordion({ icon, label, count, color, bg, items, expanded, onToggle }) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${color}28`, overflow: "hidden", marginBottom: 8 }}>
      <div
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: bg, cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: "DM Sans" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}22`, padding: "1px 8px", borderRadius: 20, fontFamily: "DM Sans" }}>{count}</span>
          <span style={{ fontSize: 10, color, display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
        </div>
      </div>
      {expanded && (
        <div style={{ background: C.white, padding: "8px 14px", borderTop: `1px solid ${color}18` }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.bg}` : "none" }}>
              <span style={{ fontSize: 12, color: C.textSoft, fontFamily: "DM Sans" }}>{it.name || it.id || it.user}</span>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "DM Sans" }}>
                {it.stock != null ? `Stock: ${it.stock}` : it.submitted || (it.amount ? fmtBDT(it.amount) : it.action || "")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({ icon, label, color, lightColor, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        padding: "16px 10px", borderRadius: 12, border: `1.5px solid ${hov ? color : C.border}`,
        background: hov ? lightColor : C.white, cursor: "pointer", transition: "all 0.18s",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: hov ? color : C.text, fontFamily: "DM Sans" }}>{label}</span>
    </button>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 14 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 13, color: C.muted, fontFamily: "DM Sans" }}>Loading dashboard…</div>
    </div>
  );
}

// ─── Activity Maps ────────────────────────────────────────────────────────────
const actIcon  = { order: "🛒", user: "👤", product: "📦", status: "🔄", seller: "🏪", payment: "💳" };
const actColor = { order: C.primary, user: C.green, product: C.teal, status: C.orange, seller: C.purple, payment: C.red };

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT — drop inside your existing layout
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [chartView,   setChartView]   = useState("revenue");
  const [expandAlert, setExpandAlert] = useState("lowStock");
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768);
  const [isTablet,    setIsTablet]    = useState(window.innerWidth < 1100);

  useEffect(() => {
    const h = () => { setIsMobile(window.innerWidth < 768); setIsTablet(window.innerWidth < 1100); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Fetch real dashboard data from API
      const apiData = await getAdminDashboard();
      console.log("API Dashboard Data:", apiData); // Debug log
      
      // Get mock chart data (can be replaced with real data later)
      const mockData = mkData();
      
      // Normalize and merge API data with mock charts/alerts
      // API returns: totalUsers, totalSellers, totalOrders, totalProducts, platformRevenue, pendingSellerApprovals, alerts
      const normalizedData = {
        stats: {
          revenue:  { value: apiData.platformRevenue ?? 0,           growth: 12.4  },
          orders:   { value: apiData.totalOrders ?? 0,               growth: 8.7   },
          users:    { value: apiData.totalUsers ?? 0,                growth: 15.2  },
          sellers:  { value: apiData.totalSellers ?? 0,              growth: 6.1   },
          products: { value: apiData.totalProducts ?? 0,             growth: 3.8   },
          pending:  { value: apiData.pendingSellerApprovals ?? 0,     growth: -2.1  },
        },
        // Use mock charts for now (can be replaced with API data)
        revenueChart: mockData.revenueChart,
        ordersChart:  mockData.ordersChart,
        userChart:    mockData.userChart,
        sellerChart:  mockData.sellerChart,
        alerts: apiData.alerts ? {
          lowStock:       Array(apiData.alerts.lowStockProducts || 0).fill(null).map((_, i) => ({ name: `Product ${i+1}`, stock: 9, cat: "Category" })),
          pendingSellers: Array(apiData.alerts.pendingSellerApprovals || 0).fill(null).map((_, i) => ({ name: `Seller ${i+1}`, submitted: "Pending" })),
          newOrders:      Array(apiData.alerts.newOrders || 0).fill(null).map((_, i) => ({ id: `#ORD-${1000+i}`, amount: 0, customer: "Customer" })),
          failedPayments: Array(apiData.alerts.failedPayments || 0).fill(null).map((_, i) => ({ id: `#PAY-${200+i}`, amount: 0, user: "User" })),
          suspicious:     Array(apiData.alerts.suspiciousActivity || 0).fill(null).map((_, i) => ({ user: `user_${i}`, action: "Flagged" })),
        } : mockData.alerts,
        topSellers:   apiData.topSellers && apiData.topSellers.length > 0 
          ? apiData.topSellers.map(s => ({
              name: s.shopName || s.name || "Unknown",
              revenue: s.revenue || 0,
              orders: s.orders || 0,
              rating: 4.8
            }))
          : mockData.topSellers,
        topProducts:  mockData.topProducts,
        recentOrders: apiData.recentOrders && apiData.recentOrders.length > 0
          ? apiData.recentOrders.map(o => ({
              id: o.orderNumber || `#ORD-${o.id}`,
              customer: o.customer || "Unknown",
              amount: 0,
              status: "completed",
              time: new Date().getTime()
            }))
          : mockData.recentOrders,
        newUsers:     mockData.newUsers,
        activity:     apiData.recentActivities && apiData.recentActivities.length > 0
          ? apiData.recentActivities.map(a => ({
              type: a.type || "activity",
              msg: a.action || "",
              time: new Date().getTime()
            }))
          : mockData.activity,
      };
      
      setData(normalizedData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      // Fallback to mock data on error
      setData(mkData());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartTabs = data ? [
    { id: "revenue", label: "Revenue", keys: ["value", "commission"],               colors: [C.primary, C.teal],            labels: ["Revenue", "Commission"],              src: data.revenueChart, type: "bar"  },
    { id: "orders",  label: "Orders",  keys: ["completed", "pending", "cancelled"], colors: [C.green, C.orange, C.red],     labels: ["Completed", "Pending", "Cancelled"],  src: data.ordersChart,  type: "bar"  },
    { id: "users",   label: "Users",   keys: ["value"],                             colors: [C.purple],                     labels: ["New Users"],                          src: data.userChart,    type: "line" },
    { id: "sellers", label: "Sellers", keys: ["value"],                             colors: [C.teal],                       labels: ["New Sellers"],                        src: data.sellerChart,  type: "line" },
  ] : [];

  const activeChart = chartTabs.find(c => c.id === chartView);

  const alertSections = data ? [
    { key: "lowStock",       icon: "⚠️", label: "Low Stock Products",       color: C.orange,  bg: C.orangeLight,  items: data.alerts.lowStock,       count: data.alerts.lowStock.length       },
    { key: "pendingSellers", icon: "🏪", label: "Pending Seller Approvals", color: C.primary, bg: C.primaryLight, items: data.alerts.pendingSellers, count: data.alerts.pendingSellers.length },
    { key: "newOrders",      icon: "📦", label: "New Orders",               color: C.teal,    bg: C.tealLight,    items: data.alerts.newOrders,       count: data.alerts.newOrders.length      },
    { key: "failedPayments", icon: "💳", label: "Failed Payments",          color: C.red,     bg: C.redLight,     items: data.alerts.failedPayments,  count: data.alerts.failedPayments.length },
    { key: "suspicious",     icon: "🚨", label: "Suspicious Activity",      color: C.yellow,  bg: C.yellowLight,  items: data.alerts.suspicious,      count: data.alerts.suspicious.length     },
  ] : [];

  const col2 = isMobile ? "1fr" : "repeat(2, 1fr)";
  const col6 = isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(6, 1fr)";

  return (
    <div style={{ background: C.bg, fontFamily: "DM Sans, sans-serif", padding: isMobile ? "14px" : "24px 28px", minHeight: "100vh" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: C.text }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Admin 👋
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Here's your marketplace overview for today.</div>
        </div>
        <button
          onClick={fetchData}
          style={{ padding: "8px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "DM Sans", display: "flex", alignItems: "center", gap: 6 }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ background: C.redLight, border: `1px solid ${C.red}28`, borderRadius: 10, padding: "13px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.red, fontFamily: "DM Sans" }}>⚠️ {error}</span>
          <button onClick={fetchData} style={{ background: C.red, color: C.white, border: "none", borderRadius: 7, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans" }}>Retry</button>
        </div>
      )}

      {loading ? <Loading /> : data && (
        <>
          {/* ── 6 Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: col6, gap: 12, marginBottom: 22 }}>
            {[
              { label: "Total Revenue",  value: fmtBDT(data.stats.revenue.value),  growth: data.stats.revenue.growth,  icon: "💰", color: C.primary, lightColor: C.primaryLight, spark: mkSpark(data.stats.revenue.value / 7)  },
              { label: "Total Orders",   value: fmt(data.stats.orders.value),       growth: data.stats.orders.growth,   icon: "📦", color: C.teal,    lightColor: C.tealLight,    spark: mkSpark(data.stats.orders.value / 7)   },
              { label: "Total Users",    value: fmt(data.stats.users.value),        growth: data.stats.users.growth,    icon: "👥", color: C.purple,  lightColor: C.purpleLight,  spark: mkSpark(data.stats.users.value / 7)    },
              { label: "Total Sellers",  value: fmt(data.stats.sellers.value),      growth: data.stats.sellers.growth,  icon: "🏪", color: C.green,   lightColor: C.greenLight,   spark: mkSpark(data.stats.sellers.value / 7)  },
              { label: "Total Products", value: fmt(data.stats.products.value),     growth: data.stats.products.growth, icon: "🛍️", color: C.orange,  lightColor: C.orangeLight,  spark: mkSpark(data.stats.products.value / 7) },
              { label: "Pending Orders", value: fmt(data.stats.pending.value),      growth: data.stats.pending.growth,  icon: "⏳", color: C.red,     lightColor: C.redLight,     spark: mkSpark(data.stats.pending.value)      },
            ].map((s, i) => <StatCard key={i} {...s} delay={i * 55} />)}
          </div>

          {/* ── Charts + Alerts Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 290px", gap: 16, marginBottom: 18 }}>

            {/* Performance Chart */}
            <Card
              title="Performance Overview"
              subtitle="Last 7 days · hover for details"
              action={
                <div style={{ display: "flex", gap: 3, background: C.bg, padding: 3, borderRadius: 8, flexWrap: "wrap" }}>
                  {chartTabs.map(t => (
                    <button key={t.id} onClick={() => setChartView(t.id)} style={{
                      padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                      fontFamily: "DM Sans", fontSize: 11, fontWeight: 500, transition: "all 0.15s",
                      background: chartView === t.id ? C.white : "transparent",
                      color:      chartView === t.id ? C.text  : C.muted,
                      boxShadow:  chartView === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}>{t.label}</button>
                  ))}
                </div>
              }
            >
              {activeChart && (
                <Chart
                  data={activeChart.src}
                  keys={activeChart.keys}
                  colors={activeChart.colors}
                  labels={activeChart.labels}
                  type={activeChart.type}
                  height={200}
                />
              )}
            </Card>

            {/* Alerts Panel */}
            <Card title="🔔 Alerts" subtitle="Items needing attention">
              {alertSections.map(a => (
                <AlertAccordion
                  key={a.key} {...a}
                  expanded={expandAlert === a.key}
                  onToggle={() => setExpandAlert(p => p === a.key ? null : a.key)}
                />
              ))}
            </Card>
          </div>

          {/* ── Quick Actions ── */}
          <Card title="Quick Actions" subtitle="Navigate to key sections" style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { icon: "📦", label: "Orders",   color: C.primary, lightColor: C.primaryLight },
                { icon: "🏪", label: "Sellers",  color: C.teal,    lightColor: C.tealLight    },
                { icon: "🛍️", label: "Products", color: C.orange,  lightColor: C.orangeLight  },
                { icon: "📊", label: "Reports",  color: C.purple,  lightColor: C.purpleLight  },
                { icon: "👥", label: "Users",    color: C.green,   lightColor: C.greenLight   },
                { icon: "💳", label: "Payments", color: C.red,     lightColor: C.redLight     },
              ].map((a, i) => <QuickAction key={i} {...a} onClick={() => {}} />)}
            </div>
          </Card>

          {/* ── Overview Tables ── */}
          <div style={{ display: "grid", gridTemplateColumns: col2, gap: 16, marginBottom: 18 }}>

            {/* Top Sellers */}
            <Card title="🏆 Top Sellers" subtitle="By revenue this period">
              <MiniTable
                rows={data.topSellers}
                cols={[
                  { label: "Seller", render: r => (
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🏪</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{r.name}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{fmt(r.orders)} orders</div>
                      </div>
                    </div>
                  )},
                  { label: "Revenue", right: true, render: r => <span style={{ fontWeight: 700, fontSize: 12, color: C.green }}>{fmtBDT(r.revenue)}</span> },
                  { label: "⭐",      right: true, render: r => <span style={{ fontSize: 11, color: C.yellow, fontWeight: 700 }}>{r.rating}</span> },
                ]}
              />
            </Card>

            {/* Top Products */}
            <Card title="🔥 Top Products" subtitle="Best selling this period">
              <MiniTable
                rows={data.topProducts}
                cols={[
                  { label: "Product", render: r => (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{r.name}</div>
                      <span style={{ fontSize: 10, color: C.primary, background: C.primaryLight, padding: "1px 6px", borderRadius: 20 }}>{r.cat}</span>
                    </div>
                  )},
                  { label: "Sold",    right: true, render: r => <span style={{ fontWeight: 600, fontSize: 12 }}>{fmt(r.sold)}</span> },
                  { label: "Revenue", right: true, render: r => <span style={{ fontWeight: 700, fontSize: 12, color: C.green }}>{fmtBDT(r.revenue)}</span> },
                ]}
              />
            </Card>

            {/* Recent Orders */}
            <Card title="📦 Recent Orders" subtitle="Latest order activity">
              <MiniTable
                rows={data.recentOrders}
                cols={[
                  { label: "Order", render: r => (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: C.primary }}>{r.id}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{r.customer}</div>
                    </div>
                  )},
                  { label: "Amount", right: true, render: r => <span style={{ fontWeight: 600, fontSize: 12 }}>{fmtBDT(r.amount)}</span> },
                  { label: "Status", right: true, render: r => <StatusBadge status={r.status} /> },
                ]}
              />
            </Card>

            {/* New Users */}
            <Card title="✨ New Users" subtitle="Recently joined members">
              <MiniTable
                rows={data.newUsers}
                cols={[
                  { label: "User", render: r => (
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.purpleLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.purple, flexShrink: 0 }}>
                        {r.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{r.name}</span>
                    </div>
                  )},
                  { label: "Joined", right: true, render: r => <span style={{ fontSize: 11, color: C.muted }}>{timeAgo(r.joined)}</span> },
                  { label: "Orders", right: true, render: r => <span style={{ fontWeight: 600, fontSize: 12 }}>{r.orders}</span> },
                ]}
              />
            </Card>
          </div>

          {/* ── Activity Feed ── */}
          <Card title="📋 Recent Activity" subtitle="Live feed of marketplace events">
            {data.activity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i < data.activity.length - 1 ? `1px solid ${C.bg}` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${actColor[a.type]}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  {actIcon[a.type] || "📌"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500, fontFamily: "DM Sans" }}>{a.msg}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontFamily: "DM Sans" }}>{timeAgo(a.time)}</div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: actColor[a.type], marginTop: 5, flexShrink: 0 }} />
              </div>
            ))}
          </Card>

          {/* ── Footer ── */}
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: C.muted, fontFamily: "DM Sans", paddingBottom: 4 }}>
            Data refreshed at {new Date().toLocaleTimeString()} · All amounts in BDT (Bangladeshi Taka)
          </div>
        </>
      )}
    </div>
  );
}