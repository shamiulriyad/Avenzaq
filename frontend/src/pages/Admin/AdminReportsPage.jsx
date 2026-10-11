import { useState, useEffect, useCallback } from "react";

// ─── Google Font ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  primary: "#1d5bf5",
  primaryLight: "#e8effe",
  primaryMid: "#c5d5fd",
  text: "#1a1916",
  muted: "#a09f97",
  bg: "#f5f4f0",
  white: "#ffffff",
  border: "#e8e7e3",
  green: "#16a34a",
  greenLight: "#dcfce7",
  orange: "#ea580c",
  orangeLight: "#fff0e6",
  red: "#dc2626",
  redLight: "#fee2e2",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  teal: "#0d9488",
  tealLight: "#ccfbf1",
};

// ─── Mock API Data ────────────────────────────────────────────────────────────
const generateMockData = (range) => {
  const multiplier = range === "today" ? 0.1 : range === "week" ? 0.5 : range === "month" ? 1 : 3;

  const days = range === "today" ? 8 : range === "week" ? 7 : range === "month" ? 30 : 90;
  const labels =
    range === "today"
      ? ["12am","3am","6am","9am","12pm","3pm","6pm","9pm"]
      : Array.from({ length: days }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (days - 1 - i));
          return range === "month" || range === "custom"
            ? `${d.getDate()}/${d.getMonth() + 1}`
            : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
        });

  return {
    revenue: {
      total: Math.round(128450 * multiplier),
      commission: Math.round(19267 * multiplier),
      growth: 12.4,
      chart: labels.map((l) => ({
        label: l,
        value: Math.round((Math.random() * 8000 + 2000) * multiplier),
        commission: Math.round((Math.random() * 1200 + 300) * multiplier),
      })),
    },
    orders: {
      total: Math.round(3842 * multiplier),
      completed: Math.round(3124 * multiplier),
      pending: Math.round(498 * multiplier),
      cancelled: Math.round(220 * multiplier),
      growth: 8.7,
      chart: labels.map((l) => ({
        label: l,
        completed: Math.round((Math.random() * 200 + 60) * multiplier),
        pending: Math.round((Math.random() * 40 + 10) * multiplier),
        cancelled: Math.round((Math.random() * 20 + 5) * multiplier),
      })),
    },
    sellers: {
      top: [
        { name: "TechZone BD", revenue: Math.round(28400 * multiplier), orders: Math.round(412 * multiplier), rating: 4.8, growth: 18 },
        { name: "Fashion Hub", revenue: Math.round(22100 * multiplier), orders: Math.round(389 * multiplier), rating: 4.7, growth: 12 },
        { name: "HomeDecor Plus", revenue: Math.round(18900 * multiplier), orders: Math.round(301 * multiplier), rating: 4.6, growth: 9 },
        { name: "Sports Arena", revenue: Math.round(15200 * multiplier), orders: Math.round(278 * multiplier), rating: 4.5, growth: 6 },
        { name: "BookWorld", revenue: Math.round(12800 * multiplier), orders: Math.round(244 * multiplier), rating: 4.4, growth: 4 },
      ],
      low: [
        { name: "OldShop Co", revenue: Math.round(420 * multiplier), orders: Math.round(8 * multiplier), rating: 3.1, issues: 5 },
        { name: "SlowVendor", revenue: Math.round(680 * multiplier), orders: Math.round(12 * multiplier), rating: 3.4, issues: 3 },
        { name: "MissingStock", revenue: Math.round(290 * multiplier), orders: Math.round(5 * multiplier), rating: 2.9, issues: 7 },
      ],
    },
    products: {
      topSelling: [
        { name: "iPhone 15 Pro Case", category: "Accessories", sold: Math.round(892 * multiplier), revenue: Math.round(13380 * multiplier), stock: 241 },
        { name: "Running Shoes X9", category: "Sports", sold: Math.round(743 * multiplier), revenue: Math.round(74300 * multiplier), stock: 88 },
        { name: "Smart Watch S4", category: "Electronics", sold: Math.round(621 * multiplier), revenue: Math.round(93150 * multiplier), stock: 54 },
        { name: "Yoga Mat Pro", category: "Fitness", sold: Math.round(518 * multiplier), revenue: Math.round(25900 * multiplier), stock: 130 },
        { name: "Desk Lamp LED", category: "Home", sold: Math.round(467 * multiplier), revenue: Math.round(14010 * multiplier), stock: 22 },
      ],
      mostViewed: [
        { name: "Gaming Chair RGB", views: Math.round(12840 * multiplier), category: "Furniture", conversion: 2.4 },
        { name: "Wireless Earbuds Z", views: Math.round(10320 * multiplier), category: "Electronics", conversion: 4.1 },
        { name: "Protein Powder X", views: Math.round(8910 * multiplier), category: "Health", conversion: 3.8 },
        { name: "Canvas Backpack", views: Math.round(7430 * multiplier), category: "Bags", conversion: 5.2 },
      ],
      lowStock: [
        { name: "Desk Lamp LED", stock: 22, threshold: 30, category: "Home" },
        { name: "Smart Watch S4", stock: 54, threshold: 60, category: "Electronics" },
        { name: "Bluetooth Speaker", stock: 18, threshold: 50, category: "Audio" },
        { name: "Coffee Maker Pro", stock: 9, threshold: 25, category: "Kitchen" },
        { name: "Winter Jacket XL", stock: 7, threshold: 20, category: "Fashion" },
      ],
    },
    users: {
      total: Math.round(24810 * multiplier),
      newUsers: Math.round(1284 * multiplier),
      activeUsers: Math.round(8420 * multiplier),
      growth: 15.2,
      topCustomers: [
        { name: "Rahim Ahmed", orders: Math.round(48 * multiplier), spent: Math.round(12400 * multiplier), joined: "Jan 2023" },
        { name: "Priya Singh", orders: Math.round(41 * multiplier), spent: Math.round(9800 * multiplier), joined: "Mar 2023" },
        { name: "Karim Hassan", orders: Math.round(38 * multiplier), spent: Math.round(8900 * multiplier), joined: "Feb 2023" },
        { name: "Nadia Islam", orders: Math.round(35 * multiplier), spent: Math.round(7600 * multiplier), joined: "Apr 2023" },
        { name: "Omar Faruk", orders: Math.round(32 * multiplier), spent: Math.round(6900 * multiplier), joined: "May 2023" },
      ],
    },
  };
};

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString("en-US") ?? "0";
const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);
const fmtCurrency = (n) => `৳${fmt(n)}`;

// ─── SVG Mini Bar Chart ───────────────────────────────────────────────────────
function MiniBarChart({ data, color = C.primary, height = 48 }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.value));
  const w = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = max > 0 ? (d.value / max) * (height - 4) : 0;
        return (
          <rect
            key={i}
            x={i * w + 0.5}
            y={height - barH}
            width={w - 1}
            height={barH}
            fill={color}
            opacity={0.15 + (i / data.length) * 0.85}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

// ─── Full Bar Chart ───────────────────────────────────────────────────────────
function BarLineChart({ data, keys, colors, labels, height = 220, chartType = "bar" }) {
  const [hovered, setHovered] = useState(null);
  if (!data?.length) return <EmptyState small />;

  const allVals = data.flatMap((d) => keys.map((k) => d[k] || 0));
  const max = Math.max(...allVals) || 1;
  const padL = 48, padR = 12, padT = 12, padB = 36;
  const W = 600, H = height;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = chartType === "bar" ? (chartW / data.length) * 0.7 : 0;
  const gap = chartType === "bar" ? (chartW / data.length) * 0.3 : 0;

  const getX = (i) => padL + (chartW / (data.length - 1 || 1)) * i;
  const getY = (v) => padT + chartH - (v / max) * chartH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padT + chartH - t * chartH,
    label: fmtK(Math.round(max * t)),
  }));

  // Show every Nth label to avoid crowding
  const labelStep = data.length > 20 ? Math.ceil(data.length / 10) : 1;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height, overflow: "visible" }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke={C.border} strokeWidth={1} />
            <text x={padL - 6} y={t.y + 4} textAnchor="end" fontSize={9} fill={C.muted} fontFamily="DM Sans">
              {t.label}
            </text>
          </g>
        ))}

        {/* Bars or Lines */}
        {chartType === "bar"
          ? data.map((d, i) => {
              const x0 = padL + i * (chartW / data.length) + gap / 2;
              const kW = barW / keys.length;
              return (
                <g key={i} onMouseEnter={() => setHovered({ i, d })} style={{ cursor: "pointer" }}>
                  {keys.map((k, ki) => {
                    const v = d[k] || 0;
                    const bH = (v / max) * chartH;
                    return (
                      <rect
                        key={ki}
                        x={x0 + ki * kW}
                        y={padT + chartH - bH}
                        width={kW - 1}
                        height={bH}
                        fill={colors[ki]}
                        opacity={hovered?.i === i ? 1 : 0.82}
                        rx={2}
                      />
                    );
                  })}
                  {i % labelStep === 0 && (
                    <text
                      x={x0 + barW / 2}
                      y={H - padB + 14}
                      textAnchor="middle"
                      fontSize={8}
                      fill={C.muted}
                      fontFamily="DM Sans"
                    >
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })
          : keys.map((k, ki) => {
              const pts = data.map((d, i) => `${getX(i)},${getY(d[k] || 0)}`).join(" ");
              const fillPts = [
                `${padL},${padT + chartH}`,
                ...data.map((d, i) => `${getX(i)},${getY(d[k] || 0)}`),
                `${padL + chartW},${padT + chartH}`,
              ].join(" ");
              return (
                <g key={ki}>
                  <polygon points={fillPts} fill={colors[ki]} opacity={0.08} />
                  <polyline points={pts} fill="none" stroke={colors[ki]} strokeWidth={2} strokeLinejoin="round" />
                  {data.map((d, i) => (
                    <circle
                      key={i}
                      cx={getX(i)}
                      cy={getY(d[k] || 0)}
                      r={hovered?.i === i ? 4 : 2.5}
                      fill={colors[ki]}
                      onMouseEnter={() => setHovered({ i, d })}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </g>
              );
            })}

        {/* X labels for line chart */}
        {chartType === "line" &&
          data.map((d, i) =>
            i % labelStep === 0 ? (
              <text
                key={i}
                x={getX(i)}
                y={H - padB + 14}
                textAnchor="middle"
                fontSize={8}
                fill={C.muted}
                fontFamily="DM Sans"
              >
                {d.label}
              </text>
            ) : null
          )}

        {/* Tooltip */}
        {hovered && (
          <g>
            <line
              x1={chartType === "line" ? getX(hovered.i) : padL + hovered.i * (chartW / data.length) + barW / 2 + gap / 2}
              y1={padT}
              x2={chartType === "line" ? getX(hovered.i) : padL + hovered.i * (chartW / data.length) + barW / 2 + gap / 2}
              y2={padT + chartH}
              stroke={C.muted}
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <rect
              x={Math.min(
                chartType === "line" ? getX(hovered.i) + 6 : padL + hovered.i * (chartW / data.length) + barW / 2 + gap / 2 + 6,
                W - 120
              )}
              y={padT + 4}
              width={110}
              height={keys.length * 16 + 20}
              fill={C.text}
              rx={4}
              opacity={0.92}
            />
            {keys.map((k, ki) => (
              <text
                key={ki}
                x={Math.min(
                  chartType === "line" ? getX(hovered.i) + 12 : padL + hovered.i * (chartW / data.length) + barW / 2 + gap / 2 + 12,
                  W - 114
                )}
                y={padT + 18 + ki * 16}
                fontSize={9}
                fill={colors[ki]}
                fontFamily="DM Sans"
              >
                {labels[ki]}: {fmtK(hovered.d[k] || 0)}
              </text>
            ))}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
        {keys.map((k, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i] }} />
            <span style={{ fontSize: 11, color: C.muted, fontFamily: "DM Sans" }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color = C.primary, lightColor, growth, chart }) {
  const bg = lightColor || C.primaryLight;
  return (
    <div style={{
      background: C.white, borderRadius: 14, padding: "20px 22px",
      border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12,
      transition: "box-shadow 0.2s", cursor: "default",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 6, fontFamily: "DM Sans" }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: "DM Sans", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: "DM Sans" }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: bg,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
        }}>{icon}</div>
      </div>

      {chart && (
        <div style={{ marginTop: -4 }}>
          <MiniBarChart data={chart} color={color} height={40} />
        </div>
      )}

      {growth !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: growth >= 0 ? C.green : C.red,
            background: growth >= 0 ? C.greenLight : C.redLight,
            padding: "2px 8px", borderRadius: 20, fontFamily: "DM Sans",
          }}>
            {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
          </span>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: "DM Sans" }}>vs last period</span>
        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "DM Sans" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: "DM Sans" }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 14, padding: 22,
      border: `1px solid ${C.border}`, ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function DataTable({ columns, rows, emptyMsg = "No data" }) {
  if (!rows?.length) return (
    <div style={{ textAlign: "center", padding: "32px 0", color: C.muted, fontSize: 13, fontFamily: "DM Sans" }}>
      {emptyMsg}
    </div>
  );
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "DM Sans" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {columns.map((c, i) => (
              <th key={i} style={{
                padding: "10px 12px", textAlign: c.right ? "right" : "left",
                fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.04em", whiteSpace: "nowrap",
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${C.bg}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {columns.map((c, ci) => (
                <td key={ci} style={{
                  padding: "11px 12px", fontSize: 13, color: C.text,
                  textAlign: c.right ? "right" : "left",
                }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color, background: bg,
      padding: "3px 8px", borderRadius: 20, fontFamily: "DM Sans",
    }}>{label}</span>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "80px 0", gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, border: `3px solid ${C.border}`,
        borderTopColor: C.primary, borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 13, color: C.muted, fontFamily: "DM Sans" }}>Loading reports…</div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ small }) {
  return (
    <div style={{
      textAlign: "center", padding: small ? "24px 0" : "60px 0",
      color: C.muted, fontSize: small ? 12 : 14, fontFamily: "DM Sans",
    }}>
      📭 No data available for this period
    </div>
  );
}

// ─── Stock Bar ────────────────────────────────────────────────────────────────
function StockBar({ stock, threshold }) {
  const pct = Math.min((stock / threshold) * 100, 100);
  const color = pct < 30 ? C.red : pct < 60 ? C.orange : C.green;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600, fontFamily: "DM Sans", minWidth: 28 }}>{stock}</span>
    </div>
  );
}

// ─── Export Button ────────────────────────────────────────────────────────────
function ExportBtn({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
        background: hov ? C.bg : C.white, cursor: "pointer",
        fontSize: 12, fontWeight: 500, color: C.text, fontFamily: "DM Sans",
        display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ─── Date Filter ──────────────────────────────────────────────────────────────
function DateFilter({ value, onChange }) {
  const options = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, background: C.bg, padding: 4, borderRadius: 10 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
            fontFamily: "DM Sans", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
            background: value === o.value ? C.white : "transparent",
            color: value === o.value ? C.text : C.muted,
            boxShadow: value === o.value ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: "10px 18px", border: "none", cursor: "pointer", background: "none",
            fontFamily: "DM Sans", fontSize: 13, fontWeight: 500,
            color: active === t.id ? C.primary : C.muted,
            borderBottom: `2px solid ${active === t.id ? C.primary : "transparent"}`,
            marginBottom: -1, transition: "all 0.15s",
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(filename, headers, rows) {
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [range, setRange] = useState("month");
  const [activeTab, setActiveTab] = useState("revenue");
  const [chartType, setChartType] = useState("bar");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 700));
      setData(generateMockData(range));
    } catch {
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { id: "revenue", label: "Revenue", icon: "💰" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "sellers", label: "Sellers", icon: "🏪" },
    { id: "products", label: "Products", icon: "🛍️" },
    { id: "users", label: "Users", icon: "👥" },
  ];

  const gridCols = isMobile ? "1fr" : "repeat(2, 1fr)";
  const gridCols3 = isMobile ? "1fr" : "repeat(3, 1fr)";
  const gridCols4 = isMobile ? "1fr" : "repeat(4, 1fr)";

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, fontFamily: "DM Sans, sans-serif",
      padding: isMobile ? 16 : 28,
    }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
        flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Reports & Analytics</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
            Marketplace performance insights · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <DateFilter value={range} onChange={setRange} />
          <ExportBtn
            label="⬇ Export CSV"
            onClick={() => data && exportCSV("report.csv",
              ["Metric", "Value"],
              [
                ["Total Revenue", data.revenue.total],
                ["Commission", data.revenue.commission],
                ["Total Orders", data.orders.total],
                ["Total Users", data.users.total],
              ]
            )}
          />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: C.redLight, border: `1px solid ${C.red}`, borderRadius: 10,
          padding: "14px 18px", marginBottom: 20, color: C.red, fontSize: 13,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchData} style={{
            background: C.red, color: C.white, border: "none", borderRadius: 6,
            padding: "5px 12px", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans",
          }}>Retry</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? <LoadingSpinner /> : data && (
        <>
          {/* ── KPI Overview ── */}
          <div style={{ display: "grid", gridTemplateColumns: gridCols4, gap: 14, marginBottom: 24 }}>
            <StatCard
              label="Total Revenue"
              value={fmtCurrency(data.revenue.total)}
              sub={`Commission: ${fmtCurrency(data.revenue.commission)}`}
              icon="💰" color={C.primary} lightColor={C.primaryLight}
              growth={data.revenue.growth}
              chart={data.revenue.chart.slice(-12).map((d) => ({ value: d.value }))}
            />
            <StatCard
              label="Total Orders"
              value={fmt(data.orders.total)}
              sub={`${fmt(data.orders.completed)} completed`}
              icon="📦" color={C.teal} lightColor={C.tealLight}
              growth={data.orders.growth}
              chart={data.orders.chart.slice(-12).map((d) => ({ value: d.completed }))}
            />
            <StatCard
              label="Total Users"
              value={fmt(data.users.total)}
              sub={`${fmt(data.users.newUsers)} new this period`}
              icon="👥" color={C.purple} lightColor={C.purpleLight}
              growth={data.users.growth}
              chart={data.orders.chart.slice(-12).map((d, i) => ({ value: Math.round((i + 1) * 80 + Math.random() * 40) }))}
            />
            <StatCard
              label="Active Users"
              value={fmt(data.users.activeUsers)}
              sub="Daily active sessions"
              icon="🔥" color={C.orange} lightColor={C.orangeLight}
              chart={data.orders.chart.slice(-12).map((d, i) => ({ value: Math.round((i + 1) * 60 + Math.random() * 30) }))}
            />
          </div>

          {/* ── Tabs ── */}
          <Card style={{ marginBottom: 20 }}>
            <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

            {/* ── REVENUE TAB ── */}
            {activeTab === "revenue" && (
              <>
                <SectionHeader
                  title="Revenue Overview"
                  subtitle={`${range === "today" ? "Hourly" : range === "week" ? "Daily" : "Daily"} revenue breakdown`}
                  action={
                    <div style={{ display: "flex", gap: 4 }}>
                      {["bar", "line"].map((t) => (
                        <button key={t} onClick={() => setChartType(t)} style={{
                          padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                          background: chartType === t ? C.primary : C.white,
                          color: chartType === t ? C.white : C.muted,
                          fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans",
                          textTransform: "capitalize",
                        }}>{t}</button>
                      ))}
                    </div>
                  }
                />
                <BarLineChart
                  data={data.revenue.chart}
                  keys={["value", "commission"]}
                  colors={[C.primary, C.teal]}
                  labels={["Revenue", "Commission"]}
                  chartType={chartType}
                  height={240}
                />

                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 14, marginTop: 20 }}>
                  <div style={{ padding: "18px 20px", borderRadius: 12, background: C.primaryLight, border: `1px solid ${C.primaryMid}` }}>
                    <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginBottom: 6 }}>Gross Revenue</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{fmtCurrency(data.revenue.total)}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Before platform fees</div>
                  </div>
                  <div style={{ padding: "18px 20px", borderRadius: 12, background: C.tealLight }}>
                    <div style={{ fontSize: 12, color: C.teal, fontWeight: 600, marginBottom: 6 }}>Commission Earned</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{fmtCurrency(data.revenue.commission)}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                      {((data.revenue.commission / data.revenue.total) * 100).toFixed(1)}% commission rate
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <>
                <SectionHeader title="Order Analytics" subtitle="Order volume and status breakdown" />
                <div style={{ display: "grid", gridTemplateColumns: gridCols3, gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Completed", value: data.orders.completed, color: C.green, bg: C.greenLight, icon: "✅" },
                    { label: "Pending", value: data.orders.pending, color: C.orange, bg: C.orangeLight, icon: "⏳" },
                    { label: "Cancelled", value: data.orders.cancelled, color: C.red, bg: C.redLight, icon: "❌" },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: "16px 18px", borderRadius: 12, background: s.bg,
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{fmt(s.value)}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {((s.value / data.orders.total) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <BarLineChart
                  data={data.orders.chart}
                  keys={["completed", "pending", "cancelled"]}
                  colors={[C.green, C.orange, C.red]}
                  labels={["Completed", "Pending", "Cancelled"]}
                  chartType="bar"
                  height={220}
                />
              </>
            )}

            {/* ── SELLERS TAB ── */}
            {activeTab === "sellers" && (
              <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 20 }}>
                <div>
                  <SectionHeader title="🏆 Top Sellers" subtitle="By revenue this period" />
                  <DataTable
                    columns={[
                      { label: "#", render: (_, i) => <span style={{ color: C.muted, fontWeight: 600, fontSize: 12 }}>{i + 1}</span> },
                      { label: "Seller", key: "name", render: (r) => (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{fmt(r.orders)} orders</div>
                        </div>
                      )},
                      { label: "Revenue", key: "revenue", right: true, render: (r) => (
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{fmtCurrency(r.revenue)}</span>
                      )},
                      { label: "Growth", right: true, render: (r) => (
                        <Badge label={`+${r.growth}%`} color={C.green} bg={C.greenLight} />
                      )},
                    ]}
                    rows={data.sellers.top.map((s, i) => ({ ...s, _i: i + 1 }))}
                  />
                </div>
                <div>
                  <SectionHeader title="⚠️ Low Performing" subtitle="Sellers needing attention" />
                  <DataTable
                    columns={[
                      { label: "Seller", key: "name", render: (r) => (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{fmt(r.orders)} orders</div>
                        </div>
                      )},
                      { label: "Revenue", right: true, render: (r) => (
                        <span style={{ fontWeight: 600, color: C.red, fontSize: 13 }}>{fmtCurrency(r.revenue)}</span>
                      )},
                      { label: "Issues", right: true, render: (r) => (
                        <Badge label={`${r.issues} issues`} color={C.orange} bg={C.orangeLight} />
                      )},
                    ]}
                    rows={data.sellers.low}
                  />
                  <div style={{
                    marginTop: 16, padding: "12px 16px", borderRadius: 10,
                    background: C.orangeLight, border: `1px solid ${C.orange}22`,
                    fontSize: 12, color: C.orange, fontWeight: 500,
                  }}>
                    ⚠️ These sellers may need support or review to improve performance.
                  </div>
                </div>
              </div>
            )}

            {/* ── PRODUCTS TAB ── */}
            {activeTab === "products" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 20, marginBottom: 20 }}>
                  <div>
                    <SectionHeader title="🔥 Top Selling Products" />
                    <DataTable
                      columns={[
                        { label: "Product", render: (r) => (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                            <Badge label={r.category} color={C.primary} bg={C.primaryLight} />
                          </div>
                        )},
                        { label: "Sold", right: true, render: (r) => <span style={{ fontWeight: 600 }}>{fmt(r.sold)}</span> },
                        { label: "Revenue", right: true, render: (r) => (
                          <span style={{ color: C.green, fontWeight: 600 }}>{fmtCurrency(r.revenue)}</span>
                        )},
                      ]}
                      rows={data.products.topSelling}
                    />
                  </div>
                  <div>
                    <SectionHeader title="👁️ Most Viewed" />
                    <DataTable
                      columns={[
                        { label: "Product", render: (r) => (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                            <Badge label={r.category} color={C.purple} bg={C.purpleLight} />
                          </div>
                        )},
                        { label: "Views", right: true, render: (r) => <span style={{ fontWeight: 600 }}>{fmtK(r.views)}</span> },
                        { label: "Conv.", right: true, render: (r) => (
                          <span style={{ color: r.conversion > 4 ? C.green : C.orange, fontWeight: 600 }}>
                            {r.conversion}%
                          </span>
                        )},
                      ]}
                      rows={data.products.mostViewed}
                    />
                  </div>
                </div>

                <SectionHeader title="⚡ Low Stock Alerts" subtitle="Products below threshold" />
                <div style={{ display: "grid", gap: 10 }}>
                  {data.products.lowStock.map((p, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 10,
                      background: p.stock < 15 ? C.redLight : C.orangeLight,
                      border: `1px solid ${p.stock < 15 ? C.red : C.orange}22`,
                    }}>
                      <span style={{ fontSize: 16 }}>{p.stock < 15 ? "🔴" : "🟡"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{p.category} · Threshold: {p.threshold}</div>
                      </div>
                      <div style={{ width: isMobile ? 100 : 160, flexShrink: 0 }}>
                        <StockBar stock={p.stock} threshold={p.threshold} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === "users" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: gridCols3, gap: 14, marginBottom: 20 }}>
                  {[
                    { label: "Total Users", value: fmt(data.users.total), color: C.purple, bg: C.purpleLight, icon: "👥" },
                    { label: "New Users", value: fmt(data.users.newUsers), color: C.primary, bg: C.primaryLight, icon: "✨" },
                    { label: "Active Users", value: fmt(data.users.activeUsers), color: C.teal, bg: C.tealLight, icon: "🔥" },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: "18px 20px", borderRadius: 12, background: s.bg,
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                      <span style={{ fontSize: 26 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <SectionHeader title="🏅 Top Customers" subtitle="By lifetime spend" />
                <DataTable
                  columns={[
                    { label: "#", render: (r, i) => <span style={{ color: C.muted, fontWeight: 700 }}>{i + 1}</span> },
                    { label: "Customer", render: (r) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: C.primaryLight,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: C.primary, flexShrink: 0,
                        }}>
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>Since {r.joined}</div>
                        </div>
                      </div>
                    )},
                    { label: "Orders", right: true, render: (r) => <span style={{ fontWeight: 600 }}>{fmt(r.orders)}</span> },
                    { label: "Total Spent", right: true, render: (r) => (
                      <span style={{ fontWeight: 700, color: C.green, fontSize: 14 }}>{fmtCurrency(r.spent)}</span>
                    )},
                    { label: "Tier", right: true, render: (r) => {
                      const tier = r.spent > 10000 ? ["💎 Diamond", C.primary, C.primaryLight]
                        : r.spent > 7000 ? ["🥇 Gold", "#b45309", "#fef3c7"]
                        : ["🥈 Silver", C.muted, C.bg];
                      return <Badge label={tier[0]} color={tier[1]} bg={tier[2]} />;
                    }},
                  ]}
                  rows={data.users.topCustomers}
                />
              </>
            )}
          </Card>

          {/* ── Footer note ── */}
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.muted }}>
            Data refreshed on {new Date().toLocaleString()} · All amounts in BDT (Bangladeshi Taka)
          </div>
        </>
      )}
    </div>
  );
}