import { useState, useEffect, useCallback } from "react";
import { getSellers, approveSeller, rejectSeller, suspendSeller } from "../../services/adminService";

/* ─── Google Font Injection ─────────────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="DM+Sans"]')) document.head.appendChild(fontLink);

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const T = {
  primary:   "#1d5bf5",
  text:      "#1a1916",
  muted:     "#a09f97",
  bg:        "#f5f4f0",
  white:     "#ffffff",
  border:    "#e8e7e3",
  borderHov: "#d0cfc9",
  green:     "#16a34a",
  greenBg:   "#f0fdf4",
  greenBd:   "#bbf7d0",
  orange:    "#ea580c",
  orangeBg:  "#fff7ed",
  orangeBd:  "#fed7aa",
  red:       "#dc2626",
  redBg:     "#fef2f2",
  redBd:     "#fecaca",
  blueBg:    "#eff4ff",
  blueBd:    "#c7d7fd",
  amber:     "#d97706",
  amberBg:   "#fffbeb",
  amberBd:   "#fde68a",
  purple:    "#7c3aed",
  purpleBg:  "#f5f3ff",
  purpleBd:  "#ddd6fe",
  font:      "'DM Sans', sans-serif",
  radius:    8,
  radiusSm:  6,
  radiusLg:  12,
  shadow:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:  "0 4px 16px rgba(0,0,0,0.08)",
  shadowLg:  "0 8px 32px rgba(0,0,0,0.12)",
};

/* ─── Mock Data ─────────────────────────────────────────────────────────────── */
const MOCK_SELLERS = [
  {
    id: "s001", shopName: "TechZone BD", ownerName: "Arif Hossain", email: "arif.h@techzone.com",
    phone: "+880-1711-001001", totalProducts: 142, totalSales: 1248500, status: "approved",
    verified: true, joinDate: "2022-05-10", avatar: "TZ", location: "Dhaka, Bangladesh",
    address: "Level 4, Multiplan Centre, Elephant Road, Dhaka", category: "Electronics",
    rating: 4.8, totalOrders: 3210,
    products: [
      { id: "P001", name: "Wireless Earbuds Pro", price: 2499, stock: 80, sales: 430 },
      { id: "P002", name: "USB-C Hub 7-in-1",     price: 1850, stock: 55, sales: 290 },
      { id: "P003", name: "Smart Watch Series X",  price: 8900, stock: 20, sales: 110 },
    ],
    orders: [
      { id: "ORD-441", date: "2025-03-28", amount: 12400, status: "delivered" },
      { id: "ORD-392", date: "2025-03-15", amount: 8900,  status: "delivered" },
      { id: "ORD-301", date: "2025-02-20", amount: 5600,  status: "returned"  },
    ],
  },
  {
    id: "s002", shopName: "Fashion Hub", ownerName: "Nasrin Akter", email: "nasrin@fashionhub.bd",
    phone: "+880-1812-002002", totalProducts: 89, totalSales: 620300, status: "approved",
    verified: true, joinDate: "2023-01-22", avatar: "FH", location: "Chittagong, Bangladesh",
    address: "Shop 12, Khatunganj Market, Chittagong", category: "Fashion",
    rating: 4.5, totalOrders: 1870,
    products: [
      { id: "P011", name: "Cotton Kurti Set",   price: 1200, stock: 200, sales: 560 },
      { id: "P012", name: "Denim Jacket",        price: 2800, stock: 90,  sales: 210 },
    ],
    orders: [
      { id: "ORD-510", date: "2025-04-01", amount: 3600, status: "processing" },
      { id: "ORD-488", date: "2025-03-20", amount: 2400, status: "delivered"  },
    ],
  },
  {
    id: "s003", shopName: "GreenGrocer", ownerName: "Sabbir Rahman", email: "sabbir@greengrocer.com",
    phone: "+880-1916-003003", totalProducts: 34, totalSales: 98700, status: "pending",
    verified: false, joinDate: "2025-03-18", avatar: "GG", location: "Sylhet, Bangladesh",
    address: "Ambarkhana, Sylhet", category: "Groceries",
    rating: 0, totalOrders: 0,
    products: [],
    orders: [],
  },
  {
    id: "s004", shopName: "HomeDecor Palace", ownerName: "Fatema Khanam", email: "fatema@homedecor.bd",
    phone: "+880-1677-004004", totalProducts: 211, totalSales: 2340800, status: "approved",
    verified: true, joinDate: "2021-11-05", avatar: "HD", location: "Dhaka, Bangladesh",
    address: "House 7, Road 11, Banani, Dhaka", category: "Home & Living",
    rating: 4.9, totalOrders: 5440,
    products: [
      { id: "P021", name: "Ceramic Vase Set",      price: 1800, stock: 45, sales: 780 },
      { id: "P022", name: "Bamboo Shelf Unit",      price: 4500, stock: 18, sales: 320 },
      { id: "P023", name: "LED String Lights 10m",  price: 650,  stock: 300,sales: 1200},
    ],
    orders: [
      { id: "ORD-601", date: "2025-04-01", amount: 9000,  status: "shipped"   },
      { id: "ORD-577", date: "2025-03-25", amount: 13000, status: "delivered" },
    ],
  },
  {
    id: "s005", shopName: "BookNest", ownerName: "Imran Chowdhury", email: "imran@booknest.com",
    phone: "+880-1533-005005", totalProducts: 520, totalSales: 312000, status: "suspended",
    verified: true, joinDate: "2022-08-14", avatar: "BN", location: "Rajshahi, Bangladesh",
    address: "Saheb Bazar, Rajshahi", category: "Books & Stationery",
    rating: 3.2, totalOrders: 2100,
    products: [
      { id: "P031", name: "SSC Math Guide 2025",  price: 280, stock: 500, sales: 940 },
      { id: "P032", name: "English Grammar Book", price: 350, stock: 320, sales: 610 },
    ],
    orders: [
      { id: "ORD-200", date: "2025-01-10", amount: 1400, status: "cancelled" },
    ],
  },
  {
    id: "s006", shopName: "SpeedParts Auto", ownerName: "Kamal Uddin", email: "kamal@speedparts.com",
    phone: "+880-1788-006006", totalProducts: 0, totalSales: 0, status: "pending",
    verified: false, joinDate: "2025-03-30", avatar: "SP", location: "Khulna, Bangladesh",
    address: "Sonadanga Industrial Area, Khulna", category: "Automotive",
    rating: 0, totalOrders: 0,
    products: [],
    orders: [],
  },
  {
    id: "s007", shopName: "BabyWorld", ownerName: "Rupa Begum", email: "rupa@babyworld.bd",
    phone: "+880-1855-007007", totalProducts: 77, totalSales: 445200, status: "approved",
    verified: false, joinDate: "2023-09-01", avatar: "BW", location: "Comilla, Bangladesh",
    address: "Kandirpar, Comilla", category: "Baby & Kids",
    rating: 4.3, totalOrders: 1320,
    products: [
      { id: "P041", name: "Soft Plush Toy Bear", price: 750, stock: 150, sales: 430 },
      { id: "P042", name: "Baby Monitor Pro",    price: 5200,stock: 30,  sales: 88  },
    ],
    orders: [
      { id: "ORD-390", date: "2025-03-18", amount: 2250, status: "delivered" },
    ],
  },
  {
    id: "s008", shopName: "OrganicLife", ownerName: "Tanvir Islam", email: "tanvir@organiclife.com",
    phone: "+880-1922-008008", totalProducts: 48, totalSales: 185000, status: "pending",
    verified: false, joinDate: "2025-02-14", avatar: "OL", location: "Dhaka, Bangladesh",
    address: "Mirpur DOHS, Dhaka", category: "Health & Beauty",
    rating: 0, totalOrders: 0,
    products: [],
    orders: [],
  },
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const fmt     = n  => "৳" + (n || 0).toLocaleString("en-BD");
const fmtDate = d  => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "N/A";
const relDate = d  => {
  if (!d) return "N/A";
  const diff = Math.floor((Date.now()-new Date(d))/86400000);
  return diff===0?"Today":diff===1?"Yesterday":diff<30?`${diff}d ago`:diff<365?`${Math.floor(diff/30)}mo ago`:`${Math.floor(diff/365)}y ago`;
};

// Normalize API response data
const normalizeSeller = (seller) => ({
  id: seller.id || "",
  shopName: seller.shopName || seller.name || "Unnamed Shop",
  ownerName: seller.ownerName || seller.owner?.name || "Unknown",
  email: seller.email || "",
  phone: seller.phone || "",
  totalProducts: seller.totalProducts || 0,
  totalSales: seller.totalSales || seller.totalRevenue || 0,
  status: seller.status || "pending",
  verified: seller.verified || false,
  joinDate: seller.joinDate || seller.createdAt || new Date().toISOString(),
  avatar: (seller.ownerName || seller.name || "?").slice(0, 2).toUpperCase(),
  location: seller.location || "N/A",
  address: seller.address || "",
  category: seller.category || "General",
  rating: seller.rating || 0,
  totalOrders: seller.totalOrders || 0,
  products: seller.products || [],
  orders: seller.orders || [],
});

const AVATAR_PALETTES = [
  { bg:"#eff4ff", color:"#1d5bf5" },
  { bg:"#f0fdf4", color:"#16a34a" },
  { bg:"#fff7ed", color:"#ea580c" },
  { bg:"#fdf4ff", color:"#7c3aed" },
  { bg:"#fffbeb", color:"#d97706" },
  { bg:"#fef2f2", color:"#dc2626" },
];

// Simple hash function for any string ID
const hashId = (id) => {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const avatarPalette = id => AVATAR_PALETTES[hashId(id) % AVATAR_PALETTES.length];

/* ─── Sub-Components ────────────────────────────────────────────────────────── */

function HoverBtn({ base, hover, children, onClick, title }) {
  const [h, setH] = useState(false);
  return (
    <button title={title} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ ...base, ...(h ? hover : {}), cursor:"pointer", fontFamily:T.font }}>
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    approved:  { bg:T.greenBg,  bd:T.greenBd,  color:T.green,  dot:T.green,  label:"Approved"  },
    pending:   { bg:T.amberBg,  bd:T.amberBd,  color:T.amber,  dot:T.amber,  label:"Pending"   },
    suspended: { bg:T.redBg,    bd:T.redBd,     color:T.red,    dot:T.red,    label:"Suspended" },
  }[status] || { bg:T.bg, bd:T.border, color:T.muted, dot:T.muted, label:status };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, background:cfg.bg, border:`1px solid ${cfg.bd}`, color:cfg.color, fontSize:12, fontWeight:500, fontFamily:T.font, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
}

function VerifyBadge({ verified }) {
  return verified
    ? <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, background:T.blueBg, border:`1px solid ${T.blueBd}`, color:T.primary, fontSize:11, fontWeight:600, fontFamily:T.font, whiteSpace:"nowrap" }}>✓ Verified</span>
    : <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, background:T.bg, border:`1px solid ${T.border}`, color:T.muted, fontSize:11, fontWeight:500, fontFamily:T.font, whiteSpace:"nowrap" }}>Unverified</span>;
}

function OrderBadge({ status }) {
  const cfg = { delivered:{bg:"#f0fdf4",color:"#16a34a"}, processing:{bg:"#eff4ff",color:"#1d5bf5"}, shipped:{bg:"#f5f3ff",color:"#7c3aed"}, cancelled:{bg:"#fef2f2",color:"#dc2626"}, returned:{bg:"#fff7ed",color:"#ea580c"} }[status] || { bg:T.bg, color:T.muted };
  return <span style={{ fontSize:11, padding:"2px 9px", borderRadius:99, background:cfg.bg, color:cfg.color, fontWeight:500, textTransform:"capitalize", fontFamily:T.font, whiteSpace:"nowrap" }}>{status}</span>;
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ flex:1, minWidth:110, background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:"16px 18px", boxShadow:T.shadow }}>
      <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.7, color:T.muted, fontFamily:T.font, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:600, color:color||T.text, fontFamily:T.font, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:T.muted, marginTop:4, fontFamily:T.font }}>{sub}</div>}
    </div>
  );
}

function IconBtn({ icon, label, onClick, hoverColor, hoverBg, hoverBd }) {
  const [h, setH] = useState(false);
  return (
    <button title={label} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:30, height:30, borderRadius:T.radiusSm, border:`1px solid ${h&&hoverBd?hoverBd:T.border}`, background:h&&hoverBg?hoverBg:T.white, color:h&&hoverColor?hoverColor:T.muted, cursor:"pointer", display:"grid", placeItems:"center", fontSize:14, transition:"all 0.15s", flexShrink:0, fontFamily:T.font }}>
      {icon}
    </button>
  );
}

function InfoTile({ label, children, accent }) {
  return (
    <div style={{ background:accent?accent.bg:T.bg, border:`1px solid ${accent?accent.bd:T.border}`, borderRadius:T.radiusSm, padding:"12px 14px" }}>
      <div style={{ fontSize:10, color:accent?accent.color:T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.7, fontFamily:T.font, marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:500, color:accent?accent.color:T.text, fontFamily:T.font }}>{children}</div>
    </div>
  );
}

function Stars({ rating }) {
  if (!rating) return <span style={{ fontSize:12, color:T.muted, fontFamily:T.font }}>No ratings yet</span>;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
      <span style={{ fontSize:13, color:"#f59e0b" }}>{"★".repeat(Math.floor(rating))}{"☆".repeat(5-Math.floor(rating))}</span>
      <span style={{ fontSize:12, fontWeight:600, color:T.text, fontFamily:T.font }}>{rating.toFixed(1)}</span>
    </span>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const PER_PAGE = 6;

export default function AdminSellersPage() {
  const [sellers,       setSellers]  = useState([]);
  const [loading,       setLoading]  = useState(true);
  const [error,         setError]    = useState(null);
  const [search,        setSearch]   = useState("");
  const [filterStatus,  setFStatus]  = useState("all");
  const [filterVerify,  setFVerify]  = useState("all");
  const [sortBy,        setSort]     = useState("newest");
  const [selected,      setSelected] = useState(null);
  const [toast,         setToast]    = useState(null);
  const [confirm,       setConfirm]  = useState(null);
  const [hovRow,        setHovRow]   = useState(null);
  const [page,          setPage]     = useState(1);
  const [drawerTab,     setDrawerTab]= useState("info");
  const [isMobile,      setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const loadSellers = async () => {
      setLoading(true);
      try {
        const data = await getSellers();
        const normalized = (data || []).map(normalizeSeller);
        setSellers(normalized);
        setError(null);
      } catch (err) {
        console.error("Failed to load sellers:", err);
        setError("Failed to load sellers.");
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };
    loadSellers();
  }, []);

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ── Actions ── */
  const updateSeller = useCallback((id, patch) => {
    setSellers(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
    setSelected(p => p?.id === id ? { ...p, ...patch } : p);
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveSeller(id);
      updateSeller(id, { status:"approved" });
      showToast("Seller approved successfully", "success");
    } catch (err) {
      console.error("Failed to approve seller:", err);
      showToast("Failed to approve seller", "error");
    }
  };

  const handleReject = (id) => {
    setConfirm({
      title:"Reject Seller?",
      desc:"The seller's application will be rejected. They can re-apply later.",
      confirmLabel:"Reject", confirmColor:T.red,
      onConfirm:async () => {
        try {
          await rejectSeller(id);
          updateSeller(id, { status:"suspended" });
          setConfirm(null);
          showToast("Seller application rejected","error");
        } catch (err) {
          console.error("Failed to reject seller:", err);
          showToast("Failed to reject seller", "error");
        }
      }
    });
  };

  const handleSuspend = (id) => {
    setConfirm({
      title:"Suspend Seller?",
      desc:"The seller's shop will be deactivated and their products hidden from the marketplace.",
      confirmLabel:"Suspend", confirmColor:T.red,
      onConfirm:async () => {
        try {
          await suspendSeller(id);
          updateSeller(id, { status:"suspended" });
          setConfirm(null);
          showToast("Seller suspended","error");
        } catch (err) {
          console.error("Failed to suspend seller:", err);
          showToast("Failed to suspend seller", "error");
        }
      }
    });
  };

  const handleReactivate = async (id) => {
    try {
      await approveSeller(id);
      updateSeller(id, { status:"approved" });
      showToast("Seller reactivated successfully", "success");
    } catch (err) {
      console.error("Failed to reactivate seller:", err);
      showToast("Failed to reactivate seller", "error");
    }
  };

  const handleVerify = (id) => {
    updateSeller(id, { verified:true });
    showToast("Seller verified", "success");
  };

  /* ── Filter + Sort ── */
  const displayed = sellers
    .filter(s => {
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterVerify === "verified"   && !s.verified) return false;
      if (filterVerify === "unverified" &&  s.verified) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return s.shopName.toLowerCase().includes(q) || s.ownerName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.joinDate) - new Date(a.joinDate);
      if (sortBy === "oldest") return new Date(a.joinDate) - new Date(b.joinDate);
      if (sortBy === "sales")  return b.totalSales - a.totalSales;
      if (sortBy === "products") return b.totalProducts - a.totalProducts;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(displayed.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = displayed.slice((safePage-1)*PER_PAGE, safePage*PER_PAGE);

  const stats = {
    total:     sellers.length,
    approved:  sellers.filter(s => s.status === "approved").length,
    pending:   sellers.filter(s => s.status === "pending").length,
    suspended: sellers.filter(s => s.status === "suspended").length,
    verified:  sellers.filter(s => s.verified).length,
    revenue:   sellers.reduce((s, x) => s + x.totalSales, 0),
  };

  /* ── Shared style shorthands ── */
  const pad       = isMobile ? "12px 16px" : "16px 32px";
  const thBase    = { fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.7, color:T.muted, padding:"10px 16px", borderBottom:`1px solid ${T.border}`, textAlign:"left", whiteSpace:"nowrap", background:T.bg, fontFamily:T.font };
  const tdBase    = { padding:"13px 16px", borderBottom:`1px solid ${T.border}`, fontSize:14, verticalAlign:"middle", fontFamily:T.font };
  const inputBase = { width:"100%", background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"9px 12px 9px 36px", color:T.text, fontFamily:T.font, fontSize:14, outline:"none" };
  const selBase   = { background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"9px 12px", color:T.text, fontFamily:T.font, fontSize:13, outline:"none", cursor:"pointer" };

  /* ── Action buttons config per status ── */
  const rowActions = (s) => {
    const btns = [];
    if (s.status === "pending") {
      btns.push({ icon:"✓", label:"Approve", onClick:()=>handleApprove(s.id), hoverColor:T.green,  hoverBg:T.greenBg, hoverBd:T.greenBd });
      btns.push({ icon:"✕", label:"Reject",  onClick:()=>handleReject(s.id),  hoverColor:T.red,    hoverBg:T.redBg,   hoverBd:T.redBd   });
    }
    if (s.status === "approved") {
      btns.push({ icon:"⊘", label:"Suspend",    onClick:()=>handleSuspend(s.id),    hoverColor:T.red,    hoverBg:T.redBg,    hoverBd:T.redBd    });
    }
    if (s.status === "suspended") {
      btns.push({ icon:"↺", label:"Reactivate", onClick:()=>handleReactivate(s.id), hoverColor:T.green,  hoverBg:T.greenBg,  hoverBd:T.greenBd  });
    }
    if (!s.verified) {
      btns.push({ icon:"✔", label:"Verify",     onClick:()=>handleVerify(s.id),     hoverColor:T.primary, hoverBg:T.blueBg,  hoverBd:T.blueBd   });
    }
    btns.push({ icon:"👁", label:"View Details", onClick:()=>{ setSelected(s); setDrawerTab("info"); }, hoverColor:T.primary, hoverBg:T.blueBg, hoverBd:T.blueBd });
    return btns;
  };

  /* ════════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text }}>
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes drawerIn  { from { transform: translateX(100%); } }
        @keyframes toastIn   { from { transform: translateY(16px); opacity: 0; } }
        @keyframes fadeIn    { from { opacity: 0; } }
        input:focus  { border-color: ${T.primary} !important; box-shadow: 0 0 0 3px rgba(29,91,245,0.08) !important; }
        select:focus { border-color: ${T.primary} !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ padding:isMobile?"14px 16px":"18px 32px", background:T.white, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <div style={{ width:36, height:36, borderRadius:T.radiusSm, background:T.blueBg, border:`1px solid ${T.blueBd}`, display:"grid", placeItems:"center", fontSize:18, flexShrink:0 }}>🏪</div>
        <div>
          <div style={{ fontSize:17, fontWeight:600, color:T.text }}>Seller Management</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:1 }}>/admin/sellers</div>
        </div>
        <div style={{ flex:1 }} />
        {/* Pending alert pill */}
        {stats.pending > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.amber, background:T.amberBg, border:`1px solid ${T.amberBd}`, padding:"5px 12px", borderRadius:99, fontWeight:600, cursor:"pointer" }} onClick={()=>{ setFStatus("pending"); setPage(1); }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:T.amber, animation:"pulse 1.5s infinite" }} />
            {stats.pending} Pending Approval
          </div>
        )}
        <div style={{ fontSize:12, color:T.muted, background:T.bg, border:`1px solid ${T.border}`, padding:"5px 14px", borderRadius:99, fontWeight:500 }}>{displayed.length} / {sellers.length} sellers</div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ padding:pad, display:"flex", gap:10, flexWrap:"wrap" }}>
        <StatCard label="Total Sellers"   value={stats.total}        color={T.primary} />
        <StatCard label="Approved"        value={stats.approved}     color={T.green}   />
        <StatCard label="Pending"         value={stats.pending}      color={T.amber}   />
        <StatCard label="Suspended"       value={stats.suspended}    color={T.red}     />
        <StatCard label="Verified"        value={stats.verified}     color={T.primary} />
        <StatCard label="Total Sales"     value={fmt(stats.revenue)} color={T.green}   />
      </div>

      {/* ── Controls ── */}
      <div style={{ padding:isMobile?"0 16px 14px":"0 32px 16px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:T.muted, fontSize:14, pointerEvents:"none" }}>🔍</span>
          <input style={inputBase} placeholder="Search shop, owner or email…" value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} />
        </div>
        <select style={selBase} value={filterStatus} onChange={e=>{ setFStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <select style={selBase} value={filterVerify} onChange={e=>{ setFVerify(e.target.value); setPage(1); }}>
          <option value="all">All Verification</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        <select style={selBase} value={sortBy} onChange={e=>setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="sales">Top Sellers</option>
          <option value="products">Most Products</option>
        </select>
        <HoverBtn
          base={{ padding:"9px 14px", borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.muted, fontSize:13, fontWeight:500 }}
          hover={{ borderColor:T.borderHov, color:T.text }}
          onClick={()=>{ setSearch(""); setFStatus("all"); setFVerify("all"); setSort("newest"); setPage(1); }}
        >↺ Reset</HoverBtn>
      </div>

      {/* ── Table / Cards ── */}
      <div style={{ padding:isMobile?"0 16px 32px":"0 32px 32px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ width:28, height:28, border:`2px solid ${T.border}`, borderTopColor:T.primary, borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 14px" }} />
            <div style={{ fontSize:15, fontWeight:500 }}>Loading sellers…</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>Fetching from /api/sellers</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:15, fontWeight:500 }}>Something went wrong</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && displayed.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:40, marginBottom:12, opacity:0.35 }}>🏪</div>
            <div style={{ fontSize:15, fontWeight:500 }}>No sellers found</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>Try adjusting your search or filters</div>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && !error && displayed.length > 0 && isMobile && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {paginated.map(s => {
              const ac = avatarPalette(s.id);
              return (
                <div key={s.id} onClick={()=>{ setSelected(s); setDrawerTab("info"); }}
                  style={{ background:T.white, border:`1px solid ${T.border}`, borderLeft:`3px solid ${s.status==="pending"?T.amber:s.status==="suspended"?T.red:T.green}`, borderRadius:T.radiusLg, padding:16, boxShadow:T.shadow, cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:T.radiusSm, background:ac.bg, color:ac.color, display:"grid", placeItems:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>{s.avatar}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:14 }}>{s.shopName}</div>
                      <div style={{ fontSize:12, color:T.muted, marginTop:1 }}>{s.ownerName} · {s.category}</div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                    {[["Products", s.totalProducts, T.text], ["Sales", fmt(s.totalSales), T.green], ["Joined", relDate(s.joinDate), T.muted]].map(([l,v,c])=>(
                      <div key={l}><div style={{ fontSize:10, color:T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:600, color:c }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Desktop Table */}
        {!loading && !error && displayed.length > 0 && !isMobile && (
          <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, overflow:"hidden", boxShadow:T.shadow }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Shop","Owner","Products","Total Sales","Status","Verified","Joined","Actions"].map(h=>(
                    <th key={h} style={thBase}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(s => {
                  const ac  = avatarPalette(s.id);
                  const hov = hovRow === s.id;
                  const acts = rowActions(s);
                  return (
                    <tr key={s.id} onMouseEnter={()=>setHovRow(s.id)} onMouseLeave={()=>setHovRow(null)}
                      style={{ background:hov?T.bg:T.white, transition:"background 0.1s", borderLeft:`3px solid ${s.status==="pending"?T.amber:s.status==="suspended"?T.red:"transparent"}` }}>

                      {/* Shop */}
                      <td style={{ ...tdBase, cursor:"pointer" }} onClick={()=>{ setSelected(s); setDrawerTab("info"); }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:T.radiusSm, background:ac.bg, color:ac.color, display:"grid", placeItems:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>{s.avatar}</div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:14 }}>{s.shopName}</div>
                            <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{s.category}</div>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td style={{ ...tdBase, cursor:"pointer" }} onClick={()=>{ setSelected(s); setDrawerTab("info"); }}>
                        <div style={{ fontSize:13, fontWeight:500 }}>{s.ownerName}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{s.email}</div>
                      </td>

                      {/* Products */}
                      <td style={{ ...tdBase, fontWeight:600, cursor:"pointer" }} onClick={()=>{ setSelected(s); setDrawerTab("products"); }}>{s.totalProducts}</td>

                      {/* Sales */}
                      <td style={{ ...tdBase, fontWeight:600, color:T.green, cursor:"pointer" }} onClick={()=>{ setSelected(s); setDrawerTab("info"); }}>
                        <div>{fmt(s.totalSales)}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{s.totalOrders} orders</div>
                      </td>

                      {/* Status */}
                      <td style={{ ...tdBase, cursor:"pointer" }} onClick={()=>{ setSelected(s); setDrawerTab("info"); }}>
                        <StatusBadge status={s.status} />
                      </td>

                      {/* Verified */}
                      <td style={tdBase}><VerifyBadge verified={s.verified} /></td>

                      {/* Joined */}
                      <td style={{ ...tdBase, cursor:"pointer" }} onClick={()=>{ setSelected(s); setDrawerTab("info"); }}>
                        <div style={{ fontSize:13 }}>{fmtDate(s.joinDate)}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{relDate(s.joinDate)}</div>
                      </td>

                      {/* Actions */}
                      <td style={tdBase}>
                        <div style={{ display:"flex", gap:4, opacity:hov?1:0, transition:"opacity 0.15s" }}>
                          {acts.map(a => <IconBtn key={a.label} {...a} />)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ fontSize:13, color:T.muted }}>Showing {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, displayed.length)} of {displayed.length}</div>
            <div style={{ display:"flex", gap:4 }}>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>{
                const active = p === safePage;
                return (
                  <HoverBtn key={p}
                    base={{ width:32, height:32, borderRadius:T.radiusSm, border:`1px solid ${active?T.primary:T.border}`, background:active?T.primary:T.white, color:active?"#fff":T.muted, fontSize:13, fontWeight:active?600:400, display:"grid", placeItems:"center", padding:0 }}
                    hover={{ borderColor:T.primary, color:active?"#fff":T.primary, background:active?T.primary:T.blueBg }}
                    onClick={()=>setPage(p)}
                  >{p}</HoverBtn>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          SELLER DETAIL DRAWER
      ══════════════════════════════════════════════════════════════════════════ */}
      {selected && (() => {
        const ac = avatarPalette(selected.id);
        const tabs = [
          { key:"info",     label:"Overview"  },
          { key:"products", label:`Products (${selected.products.length})` },
          { key:"orders",   label:`Orders (${selected.orders.length})`     },
        ];
        return (
          <>
            <div onClick={()=>setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(26,25,22,0.4)", backdropFilter:"blur(3px)", zIndex:100, animation:"fadeIn 0.2s" }} />
            <div style={{ position:"fixed", right:0, top:0, bottom:0, width:isMobile?"100%":500, background:T.white, borderLeft:`1px solid ${T.border}`, zIndex:101, display:"flex", flexDirection:"column", boxShadow:T.shadowLg, animation:"drawerIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>

              {/* Drawer Header */}
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:T.radiusLg, background:ac.bg, color:ac.color, display:"grid", placeItems:"center", fontSize:17, fontWeight:700, flexShrink:0 }}>{selected.avatar}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:17, fontWeight:600 }}>{selected.shopName}</div>
                    <div style={{ fontSize:13, color:T.muted, marginTop:2 }}>{selected.category} · {selected.location}</div>
                    <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
                      <StatusBadge status={selected.status} />
                      <VerifyBadge verified={selected.verified} />
                    </div>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{ width:32, height:32, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", display:"grid", placeItems:"center", fontSize:15, flexShrink:0 }}>✕</button>
                </div>

                {/* Quick action buttons */}
                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  {selected.status === "pending" && <>
                    <HoverBtn base={{ flex:1, padding:"8px 0", borderRadius:T.radiusSm, border:`1px solid ${T.greenBd}`, background:T.greenBg, color:T.green, fontSize:13, fontWeight:600, textAlign:"center" }} hover={{ background:T.green, color:"#fff", borderColor:T.green }} onClick={()=>handleApprove(selected.id)}>✓ Approve</HoverBtn>
                    <HoverBtn base={{ flex:1, padding:"8px 0", borderRadius:T.radiusSm, border:`1px solid ${T.redBd}`,   background:T.redBg,   color:T.red,   fontSize:13, fontWeight:600, textAlign:"center" }} hover={{ background:T.red,   color:"#fff", borderColor:T.red   }} onClick={()=>handleReject(selected.id)}>✕ Reject</HoverBtn>
                  </>}
                  {selected.status === "approved" && (
                    <HoverBtn base={{ flex:1, padding:"8px 0", borderRadius:T.radiusSm, border:`1px solid ${T.redBd}`, background:T.redBg, color:T.red, fontSize:13, fontWeight:600, textAlign:"center" }} hover={{ background:T.red, color:"#fff", borderColor:T.red }} onClick={()=>handleSuspend(selected.id)}>⊘ Suspend Shop</HoverBtn>
                  )}
                  {selected.status === "suspended" && (
                    <HoverBtn base={{ flex:1, padding:"8px 0", borderRadius:T.radiusSm, border:`1px solid ${T.greenBd}`, background:T.greenBg, color:T.green, fontSize:13, fontWeight:600, textAlign:"center" }} hover={{ background:T.green, color:"#fff", borderColor:T.green }} onClick={()=>handleReactivate(selected.id)}>↺ Reactivate</HoverBtn>
                  )}
                  {!selected.verified && (
                    <HoverBtn base={{ flex:1, padding:"8px 0", borderRadius:T.radiusSm, border:`1px solid ${T.blueBd}`, background:T.blueBg, color:T.primary, fontSize:13, fontWeight:600, textAlign:"center" }} hover={{ background:T.primary, color:"#fff", borderColor:T.primary }} onClick={()=>handleVerify(selected.id)}>✔ Verify Seller</HoverBtn>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, flexShrink:0, padding:"0 24px" }}>
                {tabs.map(t => (
                  <button key={t.key} onClick={()=>setDrawerTab(t.key)}
                    style={{ padding:"10px 16px", border:"none", borderBottom:`2px solid ${drawerTab===t.key?T.primary:"transparent"}`, background:"transparent", color:drawerTab===t.key?T.primary:T.muted, fontSize:13, fontWeight:drawerTab===t.key?600:400, cursor:"pointer", fontFamily:T.font, transition:"all 0.15s", whiteSpace:"nowrap" }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Body */}
              <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

                {/* ─ Overview Tab ─ */}
                {drawerTab === "info" && (
                  <>
                    {/* KPIs */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                      <InfoTile label="Total Sales"   accent={{ bg:T.greenBg,  bd:T.greenBd,  color:T.green   }}><span style={{ fontSize:20, fontWeight:600 }}>{fmt(selected.totalSales)}</span></InfoTile>
                      <InfoTile label="Total Orders"  accent={{ bg:T.blueBg,   bd:T.blueBd,   color:T.primary }}><span style={{ fontSize:20, fontWeight:600 }}>{selected.totalOrders}</span></InfoTile>
                      <InfoTile label="Products"      accent={{ bg:T.purpleBg, bd:T.purpleBd, color:T.purple  }}><span style={{ fontSize:20, fontWeight:600 }}>{selected.totalProducts}</span></InfoTile>
                      <InfoTile label="Rating"><Stars rating={selected.rating} /></InfoTile>
                    </div>

                    {/* Shop Info */}
                    <div style={{ marginBottom:20 }}>
                      <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, color:T.muted, marginBottom:10 }}>Shop Info</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        <InfoTile label="Category">{selected.category}</InfoTile>
                        <InfoTile label="Location">{selected.location}</InfoTile>
                        <InfoTile label="Joined">{fmtDate(selected.joinDate)} · {relDate(selected.joinDate)}</InfoTile>
                        <InfoTile label="Address"><span style={{ fontSize:12 }}>{selected.address}</span></InfoTile>
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, color:T.muted, marginBottom:10 }}>Owner Info</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        <InfoTile label="Full Name">{selected.ownerName}</InfoTile>
                        <InfoTile label="Phone">{selected.phone}</InfoTile>
                        <InfoTile label="Email" ><span style={{ fontSize:12 }}>{selected.email}</span></InfoTile>
                      </div>
                    </div>
                  </>
                )}

                {/* ─ Products Tab ─ */}
                {drawerTab === "products" && (
                  <>
                    {selected.products.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"48px 0", color:T.muted, fontSize:13 }}>No products listed yet</div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {selected.products.map(p => (
                          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
                            <div style={{ width:36, height:36, borderRadius:T.radiusSm, background:T.blueBg, color:T.primary, display:"grid", placeItems:"center", fontSize:16, flexShrink:0 }}>📦</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Stock: {p.stock} · Sales: {p.sales}</div>
                            </div>
                            <div style={{ fontSize:14, fontWeight:600, color:T.green, flexShrink:0 }}>{fmt(p.price)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ─ Orders Tab ─ */}
                {drawerTab === "orders" && (
                  <>
                    {selected.orders.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"48px 0", color:T.muted, fontSize:13 }}>No orders yet</div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {selected.orders.map(o => (
                          <div key={o.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:600, color:T.primary }}>{o.id}</div>
                              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{fmtDate(o.date)}</div>
                            </div>
                            <OrderBadge status={o.status} />
                            <div style={{ fontSize:14, fontWeight:600, flexShrink:0 }}>{fmt(o.amount)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Confirm Dialog ── */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,25,22,0.5)", zIndex:200, display:"grid", placeItems:"center", padding:16, animation:"fadeIn 0.15s" }}>
          <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:28, maxWidth:380, width:"100%", boxShadow:T.shadowLg }}>
            <div style={{ fontSize:17, fontWeight:600, marginBottom:8 }}>{confirm.title}</div>
            <div style={{ fontSize:14, color:T.muted, lineHeight:1.55, marginBottom:24 }}>{confirm.desc}</div>
            <div style={{ display:"flex", gap:10 }}>
              <HoverBtn base={{ flex:1, padding:"10px 0", borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.muted, fontSize:14, fontWeight:500, textAlign:"center" }} hover={{ borderColor:T.borderHov, color:T.text }} onClick={()=>setConfirm(null)}>Cancel</HoverBtn>
              <button onClick={confirm.onConfirm} style={{ flex:1, padding:"10px 0", borderRadius:T.radiusSm, border:"none", background:confirm.confirmColor||T.primary, color:"#fff", fontFamily:T.font, fontSize:14, fontWeight:600, cursor:"pointer" }}>{confirm.confirmLabel||"Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:300, background:T.white, border:`1px solid ${toast.type==="success"?T.greenBd:toast.type==="error"?T.redBd:T.amberBd}`, borderRadius:T.radius, padding:"11px 18px", display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:500, color:T.text, boxShadow:T.shadowMd, animation:"toastIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
          {toast.type==="success"?"✅":toast.type==="error"?"🚫":"⚠️"} {toast.msg}
        </div>
      )}
    </div>
  );
}