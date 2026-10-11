import { useState, useEffect, useCallback } from "react";
import { getUsers, blockUser, unblockUser } from "../../services/adminService";

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
  font:      "'DM Sans', sans-serif",
  radius:    8,
  radiusSm:  6,
  radiusLg:  12,
  shadow:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:  "0 4px 16px rgba(0,0,0,0.08)",
  shadowLg:  "0 8px 32px rgba(0,0,0,0.12)",
};

/* ─── Mock Data ─────────────────────────────────────────────────────────────── */
const MOCK_USERS = [
  { id:"u001", name:"Ayesha Rahman",   email:"ayesha.r@gmail.com",   phone:"+880-1711-234567", totalOrders:47, totalSpent:128450, status:"active",  joinDate:"2023-02-14", avatar:"AR", location:"Dhaka, Bangladesh",      address:"House 12, Road 5, Dhanmondi", flagged:false, orders:[{id:"ORD-881",date:"2025-03-20",amount:3200,status:"delivered"},{id:"ORD-754",date:"2025-02-10",amount:8900,status:"delivered"},{id:"ORD-601",date:"2025-01-05",amount:1450,status:"returned"}] },
  { id:"u002", name:"Rahul Karim",     email:"rahul.k@outlook.com",  phone:"+880-1812-345678", totalOrders:12, totalSpent:34200,  status:"active",  joinDate:"2024-06-01", avatar:"RK", location:"Chittagong, Bangladesh", address:"Flat 4B, Tower View, Agrabad", flagged:true,  orders:[{id:"ORD-920",date:"2025-03-28",amount:4500,status:"processing"},{id:"ORD-880",date:"2025-03-01",amount:2700,status:"delivered"}] },
  { id:"u003", name:"Nadia Sultana",   email:"nadia.s@yahoo.com",    phone:"+880-1916-456789", totalOrders:3,  totalSpent:6750,   status:"blocked", joinDate:"2024-11-20", avatar:"NS", location:"Sylhet, Bangladesh",      address:"Uposhohor, Sylhet",            flagged:true,  orders:[{id:"ORD-700",date:"2024-12-15",amount:3500,status:"cancelled"}] },
  { id:"u004", name:"Farhan Ahmed",    email:"farhan.a@gmail.com",   phone:"+880-1677-567890", totalOrders:89, totalSpent:245800, status:"active",  joinDate:"2022-08-30", avatar:"FA", location:"Dhaka, Bangladesh",      address:"Gulshan-2, Dhaka",             flagged:false, orders:[{id:"ORD-999",date:"2025-04-01",amount:12000,status:"shipped"},{id:"ORD-950",date:"2025-03-15",amount:7800,status:"delivered"}] },
  { id:"u005", name:"Tania Hossain",   email:"tania.h@gmail.com",    phone:"+880-1533-678901", totalOrders:21, totalSpent:58900,  status:"active",  joinDate:"2023-09-11", avatar:"TH", location:"Rajshahi, Bangladesh",    address:"Boalia, Rajshahi",             flagged:false, orders:[{id:"ORD-870",date:"2025-02-28",amount:5600,status:"delivered"}] },
  { id:"u006", name:"Kamal Uddin",     email:"kamal.u@hotmail.com",  phone:"+880-1788-789012", totalOrders:0,  totalSpent:0,      status:"active",  joinDate:"2025-03-25", avatar:"KU", location:"Khulna, Bangladesh",      address:"Sonadanga, Khulna",            flagged:false, orders:[] },
  { id:"u007", name:"Shirin Akter",    email:"shirin.a@gmail.com",   phone:"+880-1855-890123", totalOrders:56, totalSpent:189300, status:"blocked", joinDate:"2022-12-01", avatar:"SA", location:"Dhaka, Bangladesh",      address:"Mirpur-10, Dhaka",             flagged:true,  orders:[{id:"ORD-500",date:"2025-01-10",amount:9200,status:"delivered"}] },
  { id:"u008", name:"Imran Chowdhury", email:"imran.c@gmail.com",    phone:"+880-1922-901234", totalOrders:34, totalSpent:95600,  status:"active",  joinDate:"2023-05-18", avatar:"IC", location:"Comilla, Bangladesh",     address:"Kandirpar, Comilla",           flagged:false, orders:[{id:"ORD-810",date:"2025-03-10",amount:3300,status:"delivered"}] },
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const fmt     = n => "৳" + (n || 0).toLocaleString("en-BD");
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "N/A";
const relDate = d => {
  if (!d) return "N/A";
  const diff = Math.floor((Date.now()-new Date(d))/86400000);
  return diff===0?"Today":diff===1?"Yesterday":diff<30?`${diff}d ago`:diff<365?`${Math.floor(diff/30)}mo ago`:`${Math.floor(diff/365)}y ago`;
};

// Normalize API response data
const normalizeUser = (user) => ({
  id: user.id || "",
  name: user.name || user.fullName || "Unknown User",
  email: user.email || "",
  phone: user.phone || "",
  totalOrders: user.totalOrders || user.orderCount || 0,
  totalSpent: user.totalSpent || user.totalAmount || 0,
  status: user.status || "active",
  joinDate: user.joinDate || user.createdAt || new Date().toISOString(),
  avatar: (user.name || user.fullName || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
  location: user.location || "N/A",
  address: user.address || "",
  flagged: user.flagged || user.isFlagged || false,
  orders: user.orders || [],
});

const AVATAR_PALETTES = [
  { bg:"#eff4ff", color:"#1d5bf5" },
  { bg:"#f0fdf4", color:"#16a34a" },
  { bg:"#fff7ed", color:"#ea580c" },
  { bg:"#fdf4ff", color:"#9333ea" },
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

/* ─── Reusable Components ───────────────────────────────────────────────────── */

function HoverBtn({ base, hover, children, onClick, title, disabled }) {
  const [h, setH] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ ...base, ...(h && !disabled ? hover : {}), cursor: disabled ? "default" : "pointer", fontFamily: T.font, border: "1px solid transparent", ...base, ...(h && !disabled ? hover : {}) }}
    >{children}</button>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    active:  { bg: T.greenBg,  bd: T.greenBd,  color: T.green,  dot: T.green,  label: "Active"  },
    blocked: { bg: T.redBg,    bd: T.redBd,     color: T.red,    dot: T.red,    label: "Blocked" },
  }[status] || { bg: T.bg, bd: T.border, color: T.muted, dot: T.muted, label: status };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, background:cfg.bg, border:`1px solid ${cfg.bd}`, color:cfg.color, fontSize:12, fontWeight:500, fontFamily:T.font, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
}

function OrderBadge({ status }) {
  const cfg = {
    delivered:  { bg:"#f0fdf4", color:"#16a34a" },
    processing: { bg:"#eff4ff", color:"#1d5bf5" },
    shipped:    { bg:"#f5f3ff", color:"#7c3aed" },
    cancelled:  { bg:"#fef2f2", color:"#dc2626" },
    returned:   { bg:"#fff7ed", color:"#ea580c" },
  }[status] || { bg: T.bg, color: T.muted };
  return (
    <span style={{ fontSize:11, padding:"2px 9px", borderRadius:99, background:cfg.bg, color:cfg.color, fontWeight:500, textTransform:"capitalize", fontFamily:T.font, whiteSpace:"nowrap" }}>{status}</span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex:1, minWidth:110, background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:"16px 18px", boxShadow:T.shadow }}>
      <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.7, color:T.muted, fontFamily:T.font, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:600, color: color||T.text, fontFamily:T.font, lineHeight:1 }}>{value}</div>
    </div>
  );
}

function IconBtn({ icon, label, onClick, hoverColor, hoverBg, hoverBd }) {
  const [h, setH] = useState(false);
  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ width:30, height:30, borderRadius:T.radiusSm, border:`1px solid ${h && hoverBd ? hoverBd : T.border}`, background:h && hoverBg ? hoverBg : T.white, color:h && hoverColor ? hoverColor : T.muted, cursor:"pointer", display:"grid", placeItems:"center", fontSize:14, transition:"all 0.15s", flexShrink:0, fontFamily:T.font }}
    >{icon}</button>
  );
}

function InfoTile({ label, children, accent }) {
  return (
    <div style={{ background: accent ? accent.bg : T.bg, border:`1px solid ${accent ? accent.bd : T.border}`, borderRadius:T.radiusSm, padding:"12px 14px" }}>
      <div style={{ fontSize:10, color: accent ? accent.color : T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.7, fontFamily:T.font, marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:500, color: accent ? accent.color : T.text, fontFamily:T.font }}>{children}</div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const PER_PAGE = 6;

export default function AdminUsersPage() {
  const [users,        setUsers]     = useState([]);
  const [loading,      setLoading]   = useState(true);
  const [error,        setError]     = useState(null);
  const [search,       setSearch]    = useState("");
  const [filterStatus, setFilter]    = useState("all");
  const [sortBy,       setSort]      = useState("newest");
  const [selected,     setSelected]  = useState(null);
  const [toast,        setToast]     = useState(null);
  const [confirm,      setConfirm]   = useState(null);
  const [hovRow,       setHovRow]    = useState(null);
  const [page,         setPage]      = useState(1);
  const [isMobile,     setIsMobile]  = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        const normalized = (data || []).map(normalizeUser);
        setUsers(normalized);
        setError(null);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load users. Please try again.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleBlock = useCallback(async (id) => {
    const user = users.find(x => x.id === id);
    if (!user) return;
    
    try {
      if (user.status === "active") {
        await blockUser(id);
        setUsers(u => u.map(x => x.id === id ? { ...x, status: "blocked" } : x));
        setSelected(p => p?.id === id ? { ...p, status: "blocked" } : p);
        showToast("User blocked successfully", "error");
      } else {
        await unblockUser(id);
        setUsers(u => u.map(x => x.id === id ? { ...x, status: "active" } : x));
        setSelected(p => p?.id === id ? { ...p, status: "active" } : p);
        showToast("User unblocked successfully", "success");
      }
    } catch (err) {
      console.error("Failed to update user status:", err);
      showToast("Failed to update user status", "error");
    }
  }, [users, showToast]);

  const handleFlag = useCallback((id) => {
    setUsers(u => u.map(x => x.id === id ? { ...x, flagged: !x.flagged } : x));
    setSelected(p => p?.id === id ? { ...p, flagged: !p.flagged } : p);
    const u = users.find(x => x.id === id);
    showToast(u?.flagged ? "Flag removed" : "User flagged as suspicious", "warn");
  }, [users, showToast]);

  const handleDelete = useCallback((id) => {
    setConfirm({
      title: "Delete User?",
      desc: "This action is permanent and cannot be undone. All user data will be removed from the system.",
      onConfirm: () => {
        setUsers(u => u.filter(x => x.id !== id));
        setSelected(null);
        setConfirm(null);
        showToast("User permanently deleted", "error");
      },
    });
  }, [showToast]);

  /* Derived data */
  const displayed = users
    .filter(u => {
      if (filterStatus !== "all" && u.status !== filterStatus) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.joinDate) - new Date(a.joinDate);
      if (sortBy === "oldest") return new Date(a.joinDate) - new Date(b.joinDate);
      if (sortBy === "spent")  return b.totalSpent - a.totalSpent;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(displayed.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = displayed.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const stats = {
    total:   users.length,
    active:  users.filter(u => u.status === "active").length,
    blocked: users.filter(u => u.status === "blocked").length,
    flagged: users.filter(u => u.flagged).length,
    revenue: users.reduce((s, u) => s + u.totalSpent, 0),
  };

  /* Shared style snippets */
  const pad = isMobile ? "12px 16px" : "16px 32px";
  const inputBase = { width:"100%", background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"9px 12px 9px 36px", color:T.text, fontFamily:T.font, fontSize:14, fontWeight:400, outline:"none" };
  const selectBase = { background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"9px 12px", color:T.text, fontFamily:T.font, fontSize:13, fontWeight:400, outline:"none", cursor:"pointer" };
  const thBase = { fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.7, color:T.muted, padding:"10px 16px", borderBottom:`1px solid ${T.border}`, textAlign:"left", whiteSpace:"nowrap", background:T.bg, fontFamily:T.font };
  const tdBase = { padding:"13px 16px", borderBottom:`1px solid ${T.border}`, fontSize:14, verticalAlign:"middle", fontFamily:T.font };

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text }}>

      {/* Keyframe injections */}
      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes drawerIn { from { transform: translateX(100%); } }
        @keyframes toastIn  { from { transform: translateY(16px); opacity: 0; } }
        input:focus { border-color: ${T.primary} !important; box-shadow: 0 0 0 3px rgba(29,91,245,0.08); }
        select:focus { border-color: ${T.primary} !important; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: isMobile ? "14px 16px" : "18px 32px", background:T.white, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <div style={{ width:36, height:36, borderRadius:T.radiusSm, background:T.blueBg, border:`1px solid ${T.blueBd}`, display:"grid", placeItems:"center", fontSize:18, flexShrink:0 }}>👥</div>
        <div>
          <div style={{ fontSize:17, fontWeight:600, color:T.text, lineHeight:1.2 }}>Users Management</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:1 }}>/admin/users</div>
        </div>
        <div style={{ flex:1 }} />
        <div style={{ fontSize:12, color:T.muted, background:T.bg, border:`1px solid ${T.border}`, padding:"5px 14px", borderRadius:99, fontWeight:500 }}>
          {displayed.length} / {users.length} users
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ padding:pad, display:"flex", gap:10, flexWrap:"wrap" }}>
        <StatCard label="Total Users"   value={stats.total}        color={T.primary} />
        <StatCard label="Active"        value={stats.active}       color={T.green}   />
        <StatCard label="Blocked"       value={stats.blocked}      color={T.red}     />
        <StatCard label="Flagged"       value={stats.flagged}      color={T.orange}  />
        <StatCard label="Total Revenue" value={fmt(stats.revenue)} color={T.green}   />
      </div>

      {/* ── Controls ── */}
      <div style={{ padding: isMobile ? "0 16px 14px" : "0 32px 16px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:T.muted, fontSize:14, pointerEvents:"none" }}>🔍</span>
          <input
            style={inputBase}
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select style={selectBase} value={filterStatus} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
        <select style={selectBase} value={sortBy} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="spent">Highest Spenders</option>
          <option value="orders">Most Orders</option>
        </select>
        <HoverBtn
          base={{ padding:"9px 14px", borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.muted, fontSize:13, fontWeight:500 }}
          hover={{ borderColor:T.borderHov, color:T.text }}
          onClick={() => { setSearch(""); setFilter("all"); setSort("newest"); setPage(1); }}
        >↺ Reset</HoverBtn>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: isMobile ? "0 16px 32px" : "0 32px 32px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ width:28, height:28, border:`2px solid ${T.border}`, borderTopColor:T.primary, borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 14px" }} />
            <div style={{ fontSize:15, fontWeight:500, color:T.text }}>Loading users…</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>Fetching from /api/users</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:15, fontWeight:500, color:T.text }}>Something went wrong</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && displayed.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:40, marginBottom:12, opacity:0.35 }}>🔍</div>
            <div style={{ fontSize:15, fontWeight:500, color:T.text }}>No users found</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>Try adjusting your search or filters</div>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && !error && displayed.length > 0 && isMobile && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {paginated.map(u => {
              const ac = avatarPalette(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => setSelected(u)}
                  style={{ background:T.white, border:`1px solid ${T.border}`, borderLeft:`3px solid ${u.flagged ? T.orange : u.status === "blocked" ? T.red : T.border}`, borderRadius:T.radiusLg, padding:16, boxShadow:T.shadow, cursor:"pointer" }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:38, height:38, borderRadius:T.radiusSm, background:u.status==="blocked"?T.redBg:u.flagged?T.orangeBg:ac.bg, color:u.status==="blocked"?T.red:u.flagged?T.orange:ac.color, display:"grid", placeItems:"center", fontSize:12, fontWeight:600, flexShrink:0 }}>{u.avatar}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:500, fontSize:14, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        {u.name}
                        {u.flagged && <span style={{ fontSize:10, background:T.orangeBg, color:T.orange, border:`1px solid ${T.orangeBd}`, padding:"1px 7px", borderRadius:99, fontWeight:500 }}>Flagged</span>}
                      </div>
                      <div style={{ fontSize:12, color:T.muted, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</div>
                    </div>
                    <StatusBadge status={u.status} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                    {[["Orders", u.totalOrders, T.text], ["Spent", fmt(u.totalSpent), T.green], ["Joined", relDate(u.joinDate), T.muted]].map(([l, v, c]) => (
                      <div key={l}>
                        <div style={{ fontSize:10, color:T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:c }}>{v}</div>
                      </div>
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
                  {["User", "Phone", "Orders", "Total Spent", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} style={thBase}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(u => {
                  const ac  = avatarPalette(u.id);
                  const hov = hovRow === u.id;
                  const rowBg = hov ? T.bg : u.flagged ? "#fffcf8" : T.white;
                  return (
                    <tr key={u.id} onMouseEnter={() => setHovRow(u.id)} onMouseLeave={() => setHovRow(null)} style={{ background:rowBg, transition:"background 0.1s" }}>

                      {/* User */}
                      <td style={{ ...tdBase, cursor:"pointer" }} onClick={() => setSelected(u)}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:T.radiusSm, background:u.status==="blocked"?T.redBg:u.flagged?T.orangeBg:ac.bg, color:u.status==="blocked"?T.red:u.flagged?T.orange:ac.color, display:"grid", placeItems:"center", fontSize:12, fontWeight:600, flexShrink:0 }}>{u.avatar}</div>
                          <div>
                            <div style={{ fontWeight:500, fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
                              {u.name}
                              {u.flagged && <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange, display:"inline-block", flexShrink:0 }} title="Flagged" />}
                            </div>
                            <div style={{ fontSize:12, color:T.muted, marginTop:1 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ ...tdBase, fontSize:13, color:T.muted, cursor:"pointer" }} onClick={() => setSelected(u)}>{u.phone}</td>

                      {/* Orders */}
                      <td style={{ ...tdBase, fontWeight:600, cursor:"pointer" }} onClick={() => setSelected(u)}>{u.totalOrders}</td>

                      {/* Spent */}
                      <td style={{ ...tdBase, fontWeight:600, color:T.green, cursor:"pointer" }} onClick={() => setSelected(u)}>{fmt(u.totalSpent)}</td>

                      {/* Status */}
                      <td style={{ ...tdBase, cursor:"pointer" }} onClick={() => setSelected(u)}><StatusBadge status={u.status} /></td>

                      {/* Joined */}
                      <td style={{ ...tdBase, cursor:"pointer" }} onClick={() => setSelected(u)}>
                        <div style={{ fontSize:13, color:T.text }}>{fmtDate(u.joinDate)}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{relDate(u.joinDate)}</div>
                      </td>

                      {/* Actions */}
                      <td style={tdBase}>
                        <div style={{ display:"flex", gap:4, opacity: hov ? 1 : 0, transition:"opacity 0.15s" }}>
                          <IconBtn icon="👁"  label="View Details" onClick={() => setSelected(u)} hoverColor={T.primary} hoverBg={T.blueBg}   hoverBd={T.blueBd}   />
                          <IconBtn icon={u.status==="active"?"🚫":"✅"} label={u.status==="active"?"Block User":"Unblock User"} onClick={() => handleBlock(u.id)} hoverColor={u.status==="active"?T.red:T.green} hoverBg={u.status==="active"?T.redBg:T.greenBg} hoverBd={u.status==="active"?T.redBd:T.greenBd} />
                          <IconBtn icon={u.flagged?"🏳":"🚩"} label={u.flagged?"Remove Flag":"Flag Suspicious"} onClick={() => handleFlag(u.id)} hoverColor={T.orange} hoverBg={T.orangeBg} hoverBd={T.orangeBd} />
                          <IconBtn icon="🗑"  label="Delete User"  onClick={() => handleDelete(u.id)} hoverColor={T.red}   hoverBg={T.redBg}    hoverBd={T.redBd}    />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && totalPages > 1 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ fontSize:13, color:T.muted }}>
              Showing {(safePage-1)*PER_PAGE+1}–{Math.min(safePage*PER_PAGE, displayed.length)} of {displayed.length}
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {Array.from({ length:totalPages }, (_,i) => i+1).map(p => {
                const active = p === safePage;
                return (
                  <HoverBtn
                    key={p}
                    base={{ width:32, height:32, borderRadius:T.radiusSm, border:`1px solid ${active ? T.primary : T.border}`, background: active ? T.primary : T.white, color: active ? "#fff" : T.muted, fontSize:13, fontWeight: active ? 600 : 400, display:"grid", placeItems:"center", padding:0 }}
                    hover={{ borderColor:T.primary, color: active ? "#fff" : T.primary, background: active ? T.primary : T.blueBg }}
                    onClick={() => setPage(p)}
                  >{p}</HoverBtn>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── User Detail Drawer ── */}
      {selected && (() => {
        const ac = avatarPalette(selected.id);
        const avatarBg    = selected.status==="blocked" ? T.redBg    : selected.flagged ? T.orangeBg : ac.bg;
        const avatarColor = selected.status==="blocked" ? T.red      : selected.flagged ? T.orange   : ac.color;
        return (
          <>
            <div onClick={() => setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(26,25,22,0.4)", backdropFilter:"blur(3px)", zIndex:100 }} />
            <div style={{ position:"fixed", right:0, top:0, bottom:0, width: isMobile ? "100%" : 460, background:T.white, borderLeft:`1px solid ${T.border}`, zIndex:101, display:"flex", flexDirection:"column", boxShadow:T.shadowLg, animation:"drawerIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>

              {/* Drawer Header */}
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"flex-start", gap:14, flexShrink:0 }}>
                <div style={{ width:50, height:50, borderRadius:T.radiusLg, background:avatarBg, color:avatarColor, display:"grid", placeItems:"center", fontSize:16, fontWeight:700, flexShrink:0 }}>{selected.avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:17, fontWeight:600, color:T.text }}>{selected.name}</div>
                  <div style={{ fontSize:13, color:T.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selected.email}</div>
                  <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
                    <StatusBadge status={selected.status} />
                    {selected.flagged && (
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, padding:"3px 10px", borderRadius:99, background:T.orangeBg, border:`1px solid ${T.orangeBd}`, color:T.orange, fontWeight:500 }}>🚩 Flagged</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ width:32, height:32, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", display:"grid", placeItems:"center", fontSize:15, flexShrink:0, fontFamily:T.font }}>✕</button>
              </div>

              {/* Quick Actions */}
              <div style={{ padding:"16px 24px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
                <div style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, color:T.muted, fontFamily:T.font, marginBottom:12 }}>ACTIONS</div>
                <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                  <button
                    title="View Details"
                    onClick={() => {}}
                    style={{ width:40, height:40, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.primary, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"all 0.15s", flexShrink:0, fontFamily:T.font }}
                    onMouseEnter={(e) => { e.target.style.background = T.blueBg; e.target.style.borderColor = T.blueBd; }}
                    onMouseLeave={(e) => { e.target.style.background = T.white; e.target.style.borderColor = T.border; }}
                  >👁️</button>
                  
                  <button
                    title={selected.status==="active"?"Block User":"Unblock User"}
                    onClick={() => handleBlock(selected.id)}
                    style={{ width:40, height:40, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:selected.status==="active"?T.red:T.green, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"all 0.15s", flexShrink:0, fontFamily:T.font }}
                    onMouseEnter={(e) => { e.target.style.background = selected.status==="active"?T.redBg:T.greenBg; e.target.style.borderColor = selected.status==="active"?T.redBd:T.greenBd; }}
                    onMouseLeave={(e) => { e.target.style.background = T.white; e.target.style.borderColor = T.border; }}
                  >{selected.status==="active"?"🚫":"✅"}</button>
                  
                  <button
                    title={selected.flagged?"Remove Flag":"Flag Suspicious"}
                    onClick={() => handleFlag(selected.id)}
                    style={{ width:40, height:40, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.orange, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"all 0.15s", flexShrink:0, fontFamily:T.font }}
                    onMouseEnter={(e) => { e.target.style.background = T.orangeBg; e.target.style.borderColor = T.orangeBd; }}
                    onMouseLeave={(e) => { e.target.style.background = T.white; e.target.style.borderColor = T.border; }}
                  >{selected.flagged?"🏳":"🚩"}</button>
                  
                  <button
                    title="Delete User"
                    onClick={() => handleDelete(selected.id)}
                    style={{ width:40, height:40, borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"all 0.15s", flexShrink:0, fontFamily:T.font }}
                    onMouseEnter={(e) => { e.target.style.background = T.redBg; e.target.style.borderColor = T.redBd; }}
                    onMouseLeave={(e) => { e.target.style.background = T.white; e.target.style.borderColor = T.border; }}
                  >🗑️</button>
                </div>
              </div>

              {/* Drawer Body */}
              <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

                {/* Profile */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, color:T.muted, fontFamily:T.font, marginBottom:10 }}>Profile Info</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <InfoTile label="Phone">{selected.phone}</InfoTile>
                    <InfoTile label="Location">{selected.location}</InfoTile>
                    <InfoTile label="Joined">{fmtDate(selected.joinDate)}</InfoTile>
                    <InfoTile label="Address"><span style={{ fontSize:12 }}>{selected.address}</span></InfoTile>
                  </div>
                </div>

                {/* Order Summary */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, color:T.muted, fontFamily:T.font, marginBottom:10 }}>Order Summary</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <InfoTile label="Total Orders" accent={{ bg:T.blueBg, bd:T.blueBd, color:T.primary }}>
                      <span style={{ fontSize:26, fontWeight:600 }}>{selected.totalOrders}</span>
                    </InfoTile>
                    <InfoTile label="Total Spent" accent={{ bg:T.greenBg, bd:T.greenBd, color:T.green }}>
                      <span style={{ fontSize:20, fontWeight:600 }}>{fmt(selected.totalSpent)}</span>
                    </InfoTile>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, color:T.muted, fontFamily:T.font, marginBottom:10 }}>Recent Orders</div>
                  {selected.orders.length === 0 ? (
                    <div style={{ fontSize:13, color:T.muted, padding:"12px 0" }}>No orders placed yet</div>
                  ) : selected.orders.map(o => (
                    <div key={o.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, marginBottom:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.primary }}>{o.id}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{fmtDate(o.date)}</div>
                      </div>
                      <OrderBadge status={o.status} />
                      <div style={{ fontSize:14, fontWeight:600, color:T.text, flexShrink:0 }}>{fmt(o.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div style={{ padding:"14px 24px", borderTop:`1px solid ${T.border}`, display:"flex", gap:8, flexShrink:0 }}>
                <HoverBtn
                  base={{ flex:1, padding:"9px 0", borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.text, fontSize:13, fontWeight:500, textAlign:"center" }}
                  hover={{ background:selected.status==="active"?T.redBg:T.greenBg, borderColor:selected.status==="active"?T.redBd:T.greenBd, color:selected.status==="active"?T.red:T.green }}
                  onClick={() => handleBlock(selected.id)}
                >{selected.status === "active" ? "🚫 Block" : "✅ Unblock"}</HoverBtn>

                <HoverBtn
                  base={{ flex:1, padding:"9px 0", borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.text, fontSize:13, fontWeight:500, textAlign:"center" }}
                  hover={{ background:T.orangeBg, borderColor:T.orangeBd, color:T.orange }}
                  onClick={() => handleFlag(selected.id)}
                >{selected.flagged ? "🏳 Unflag" : "🚩 Flag"}</HoverBtn>

                <HoverBtn
                  base={{ flex:1, padding:"9px 0", borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.text, fontSize:13, fontWeight:500, textAlign:"center" }}
                  hover={{ background:T.redBg, borderColor:T.redBd, color:T.red }}
                  onClick={() => handleDelete(selected.id)}
                >🗑 Delete</HoverBtn>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Confirm Dialog ── */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,25,22,0.5)", zIndex:200, display:"grid", placeItems:"center", padding:16 }}>
          <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:28, maxWidth:380, width:"100%", boxShadow:T.shadowLg }}>
            <div style={{ fontSize:17, fontWeight:600, color:T.text, marginBottom:8, fontFamily:T.font }}>{confirm.title}</div>
            <div style={{ fontSize:14, color:T.muted, lineHeight:1.55, marginBottom:24, fontFamily:T.font }}>{confirm.desc}</div>
            <div style={{ display:"flex", gap:10 }}>
              <HoverBtn
                base={{ flex:1, padding:"10px 0", borderRadius:T.radiusSm, border:`1px solid ${T.border}`, background:T.white, color:T.muted, fontSize:14, fontWeight:500, textAlign:"center" }}
                hover={{ borderColor:T.borderHov, color:T.text }}
                onClick={() => setConfirm(null)}
              >Cancel</HoverBtn>
              <button onClick={confirm.onConfirm} style={{ flex:1, padding:"10px 0", borderRadius:T.radiusSm, border:"none", background:T.red, color:"#fff", fontFamily:T.font, fontSize:14, fontWeight:600, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:300,
          background:T.white,
          border:`1px solid ${toast.type==="success" ? T.greenBd : toast.type==="error" ? T.redBd : T.orangeBd}`,
          borderRadius:T.radius, padding:"11px 18px",
          display:"flex", alignItems:"center", gap:8,
          fontSize:14, fontWeight:500, fontFamily:T.font, color:T.text,
          boxShadow:T.shadowMd, animation:"toastIn 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {toast.type === "success" ? "✅" : toast.type === "error" ? "🚫" : "⚠️"}
          {toast.msg}
        </div>
      )}
    </div>
  );
}