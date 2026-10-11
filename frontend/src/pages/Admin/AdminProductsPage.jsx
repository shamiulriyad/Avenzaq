import { useState, useEffect, useMemo } from "react";
import { getProducts, getSellers } from "../../services/adminService";
import { getCategories } from "../../services/categoriesService";

// ── Mock Data ──────────────────────────────────────────────────────────────
const EMOJIS = ["👟","📱","🛋️","💄","⚽","🎧","👗","🏠","🧴","🎒","⌚","🖥️","👒","🕯️","🧦","🎮","👜","🪴","🧪","🏋️"];
const NAMES = [
  "Wireless Earbuds Pro","Running Shoes X3","Marble Coffee Table","Vitamin C Serum","Football Training Kit",
  "Smart Watch Series 5","Linen Maxi Dress","LED Desk Lamp","Face Moisturizer SPF50","Yoga Mat Premium",
  "Bluetooth Speaker Mini","Cargo Joggers","Bamboo Shelf Unit","Lip Gloss Set","Basketball Official",
  "USB-C Hub 7-Port","Cotton Crew Tee","Scented Candle Set","Eye Shadow Palette","Tennis Racket Pro",
  "Noise-Cancel Headphones","Oversized Blazer","Plant Stand Trio","Hair Oil Serum","Gym Gloves Pair",
  "Mechanical Keyboard","Linen Jogger Pants","Ceramic Vase Set","Retinol Night Cream","Soccer Cleats Elite",
];
const STATUSES = ["active","active","active","active","outofstock","hidden","flagged"];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Normalize API response data
const normalizeProduct = (product) => ({
  id: product.id || "",
  name: product.name || "Unknown Product",
  emoji: product.emoji || "📦",
  sku: product.sku || "SKU-" + String(Math.random()).slice(2, 8).toUpperCase(),
  category: product.category || "Other",
  seller: product.seller || "Unknown Seller",
  status: product.status || "active",
  stock: product.stock || 0,
  price: product.price || 0,
  createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
  flagged: product.flagged || false,
});

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (p) => "৳" + p.toLocaleString();
const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
const statusLabel = { active: "Active", outofstock: "Out of stock", hidden: "Hidden", flagged: "Flagged" };

// ── Sub-components ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    active:     { bg: "#e6f4ea", color: "#1e7e34" },
    outofstock: { bg: "#fef3e2", color: "#b06000" },
    hidden:     { bg: "#f1f0eb", color: "#5f5e5a" },
    flagged:    { bg: "#fce8e6", color: "#d93025" },
  }[status] || { bg: "#f1f0eb", color: "#5f5e5a" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 9px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      background: cfg.bg, color: cfg.color,
    }}>
      {statusLabel[status] || status}
    </span>
  );
}

function SellerBadge({ name }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#e8f0fe", color: "#1755c2",
      fontSize: 11, fontWeight: 600, padding: "3px 9px",
      borderRadius: 20, maxWidth: "100%", overflow: "hidden",
      textOverflow: "ellipsis", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1d5bf5", flexShrink: 0 }} />
      {name}
    </span>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#f0efe9", borderRadius: 12, padding: "14px 16px", flex: 1, minWidth: 120,
    }}>
      <div style={{ fontSize: 11, color: "#6b6a63", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: color || "#1a1916" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#a09f97", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1rem", gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "3px solid #e5e4de", borderTopColor: "#1d5bf5",
        animation: "spin 0.7s linear infinite",
      }} />
      <span style={{ fontSize: 13, color: "#a09f97" }}>Loading products…</span>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onHide, onFlag, onDelete }) {
  if (!product) return null;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: "1.5rem",
        width: "100%", maxWidth: 440, boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#1a1916" }}>Product details</div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div style={{ ...styles.thumb, width: 56, height: 56, fontSize: 28 }}>{product.emoji}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1916" }}>{product.name}</div>
            <div style={{ fontSize: 12, color: "#a09f97", marginTop: 2 }}>{product.sku}</div>
            <div style={{ marginTop: 6 }}><StatusBadge status={product.status} /></div>
          </div>
        </div>

        <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[["Price", fmt(product.price)], ["Category", product.category], ["Stock", product.stock + " units"], ["Added", fmtDate(product.createdAt)]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: "#a09f97", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1916" }}>{v}</div>
            </div>
          ))}
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ fontSize: 10, color: "#a09f97", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Seller</div>
            <SellerBadge name={product.seller} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => { onHide(product.id); onClose(); }} style={{ ...styles.actionBtn, background: "#fef3e2", color: "#b06000", border: "none" }}>
            {product.status === "hidden" ? "Unhide" : "Hide product"}
          </button>
          <button onClick={() => { onFlag(product.id); onClose(); }} style={{ ...styles.actionBtn, background: "#fce8e6", color: "#d93025", border: "none" }}>
            Flag suspicious
          </button>
          <button onClick={() => { onDelete(product.id); onClose(); }} style={{ ...styles.actionBtn, background: "#f1f0eb", color: "#5f5e5a", border: "none" }}>
            Delete
          </button>
          <button onClick={onClose} style={{ ...styles.actionBtn, marginLeft: "auto" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Card ────────────────────────────────────────────────────────────
function ProductCard({ product, onView, onHide, onFlag, onDelete }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)",
      padding: 14, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ ...styles.thumb, flexShrink: 0 }}>{product.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1916", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</div>
          <div style={{ fontSize: 11, color: "#a09f97", marginTop: 2 }}>{product.sku}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <StatusBadge status={product.status} />
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1916", flexShrink: 0 }}>{fmt(product.price)}</div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <SellerBadge name={product.seller} />
        <span style={{ fontSize: 11, color: "#6b6a63", background: "#f0efe9", padding: "3px 8px", borderRadius: 20 }}>{product.category}</span>
        <span style={{ fontSize: 11, color: product.stock < 10 && product.stock > 0 ? "#d93025" : "#6b6a63", marginLeft: "auto" }}>
          Stock: <strong>{product.stock}</strong>
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderTop: "0.5px solid rgba(0,0,0,0.07)", paddingTop: 10 }}>
        <button onClick={() => onView(product)} style={styles.cardBtn}>View</button>
        <button onClick={() => onHide(product.id)} style={{ ...styles.cardBtn, color: "#b06000" }}>
          {product.status === "hidden" ? "Unhide" : "Hide"}
        </button>
        <button onClick={() => onFlag(product.id)} style={{ ...styles.cardBtn, color: "#d93025" }}>Flag</button>
        <button onClick={() => onDelete(product.id)} style={{ ...styles.cardBtn, color: "#d93025" }}>Delete</button>
        <span style={{ fontSize: 11, color: "#a09f97", marginLeft: "auto", alignSelf: "center" }}>{fmtDate(product.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Shared Styles ──────────────────────────────────────────────────────────
const styles = {
  thumb: {
    width: 38, height: 38, borderRadius: 10, background: "#f0efe9",
    border: "0.5px solid rgba(0,0,0,0.09)", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 20,
  },
  actionBtn: {
    fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 8,
    border: "0.5px solid rgba(0,0,0,0.12)", background: "#fff",
    color: "#1a1916", cursor: "pointer",
  },
  cardBtn: {
    fontSize: 12, padding: "5px 11px", borderRadius: 8,
    border: "0.5px solid rgba(0,0,0,0.1)", background: "#f5f4f0",
    color: "#1a1916", cursor: "pointer", fontWeight: 500,
  },
  closeBtn: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 16, color: "#a09f97", padding: "2px 6px", borderRadius: 6,
  },
  input: {
    height: 38, borderRadius: 9, border: "0.5px solid rgba(0,0,0,0.13)",
    background: "#fff", padding: "0 12px", fontSize: 13, color: "#1a1916",
    outline: "none", width: "100%",
  },
  select: {
    height: 38, borderRadius: 9, border: "0.5px solid rgba(0,0,0,0.13)",
    background: "#fff", padding: "0 10px", fontSize: 13, color: "#1a1916",
    outline: "none", cursor: "pointer",
  },
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterSeller, setFilterSeller] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  const PER_PAGE = isMobile ? 6 : 10;

  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        const normalized = (data || []).map(normalizeProduct);
        setProducts(normalized);
        setError(null);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
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

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fn = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Actions
  const toggleHide = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "hidden" ? "active" : "hidden" } : p));
  const flagProduct = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "flagged" } : p));
  const deleteProduct = (id) => { setProducts(prev => prev.filter(p => p.id !== id)); setModal(null); };

  // Filter + sort
  const filtered = useMemo(() => {
    let list = products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat && p.category !== filterCat) return false;
      if (filterSeller && p.seller !== filterSeller) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === "newest") return b.createdAt - a.createdAt;
      if (sort === "oldest") return a.createdAt - b.createdAt;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "price-low") return a.price - b.price;
      if (sort === "stock-low") return a.stock - b.stock;
      return 0;
    });
    return list;
  }, [products, search, filterCat, filterSeller, filterStatus, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === "active").length,
    outofstock: products.filter(p => p.status === "outofstock").length,
    flagged: products.filter(p => p.status === "flagged").length,
  }), [products]);

  const resetPage = () => setPage(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        .row-hover:hover { background: #f8f7f3 !important; }
        input:focus, select:focus { box-shadow: 0 0 0 3px rgba(29,91,245,0.15); border-color: #1d5bf5 !important; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f0efe9; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
      `}</style>

      {/* Page wrapper */}
      <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Top nav */}
        <div style={{
          background: "#fff", borderBottom: "0.5px solid rgba(0,0,0,0.09)",
          padding: isMobile ? "0 16px" : "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 56, position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: "#1d5bf5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "#fff", fontWeight: 700,
            }}>A</div>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1916" }}>
              {isMobile ? "Admin" : "Admin Panel"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#1e7e34",
              boxShadow: "0 0 0 3px #e6f4ea",
            }} />
            <span style={{ fontSize: 12, color: "#6b6a63" }}>Live</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: isMobile ? "16px" : isTablet ? "20px" : "28px", maxWidth: 1400, margin: "0 auto" }}>

          {/* Header */}
          <div style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between", gap: 12, marginBottom: 20,
            animation: "fadeIn 0.4s ease",
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1a1916", margin: 0 }}>
                Product catalog
              </h1>
              <p style={{ fontSize: 13, color: "#6b6a63", marginTop: 4 }}>
                Monitor and moderate all seller products · read-only admin view
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#a09f97" }}>Synced just now</span>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await getProducts();
                    const normalized = (data || []).map(normalizeProduct);
                    setProducts(normalized);
                    setError(null);
                  } catch (err) {
                    console.error("Failed to refresh products:", err);
                    setError("Failed to refresh products");
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{ ...styles.actionBtn, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap",
            animation: "fadeIn 0.4s ease 0.05s both",
          }}>
            <StatCard label="Total products" value={stats.total} sub={`${sellers.length} sellers`} />
            <StatCard label="Active" value={stats.active} color="#1e7e34" sub="live on platform" />
            <StatCard label="Out of stock" value={stats.outofstock} color="#b06000" sub="needs restock" />
            <StatCard label="Flagged" value={stats.flagged} color="#d93025" sub="needs review" />
          </div>

          {/* Toolbar */}
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14,
            animation: "fadeIn 0.4s ease 0.1s both",
          }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#a09f97", pointerEvents: "none" }}>⌕</span>
              <input
                type="text" placeholder="Search products…"
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage(); }}
                style={{ ...styles.input, paddingLeft: 32 }}
              />
            </div>

            <select value={filterCat} onChange={e => { setFilterCat(e.target.value); resetPage(); }} style={styles.select}>
              <option value="">All categories</option>
              {categoriesLoading ? (
                <option disabled>Loading...</option>
              ) : (
                categories.map(c => {
                  const name = typeof c === 'string' ? c : c.name || c.id || '';
                  const key = typeof c === 'string' ? c : c.id || c.name || '';
                  return (
                    <option key={key} value={name}>
                      {name}
                    </option>
                  );
                })
              )}
            </select>

            {!isMobile && (
              <select value={filterSeller} onChange={e => { setFilterSeller(e.target.value); resetPage(); }} style={styles.select}>
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

            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); resetPage(); }} style={styles.select}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="outofstock">Out of stock</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
            </select>

            <select value={sort} onChange={e => { setSort(e.target.value); resetPage(); }} style={styles.select}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-high">Price ↓</option>
              <option value="price-low">Price ↑</option>
              <option value="stock-low">Stock ↑</option>
            </select>
          </div>

          {/* Mobile: seller filter below */}
          {isMobile && (
            <div style={{ marginBottom: 14 }}>
              <select value={filterSeller} onChange={e => { setFilterSeller(e.target.value); resetPage(); }} style={{ ...styles.select, width: "100%" }}>
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

          {/* Result count */}
          <div style={{ fontSize: 12, color: "#a09f97", marginBottom: 10 }}>
            {!loading && `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
          </div>

          {/* Content area */}
          <div style={{ animation: "fadeIn 0.4s ease 0.15s both" }}>

            {loading ? (
              <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)" }}>
                <Spinner />
              </div>
            ) : error ? (
              <div style={{
                background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)",
                textAlign: "center", padding: "3rem 1rem",
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
                <div style={{ fontWeight: 600, color: "#1a1916", marginBottom: 4 }}>Something went wrong</div>
                <div style={{ fontSize: 13, color: "#a09f97" }}>{error}</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)",
                textAlign: "center", padding: "3rem 1rem",
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                <div style={{ fontWeight: 600, color: "#1a1916", marginBottom: 4 }}>No products found</div>
                <div style={{ fontSize: 13, color: "#a09f97" }}>Try adjusting your filters or search term</div>
                <button onClick={() => { setSearch(""); setFilterCat(""); setFilterSeller(""); setFilterStatus(""); }} style={{ ...styles.actionBtn, marginTop: 14 }}>
                  Clear filters
                </button>
              </div>

            ) : isMobile ? (
              /* ── Mobile: Card Grid ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {paged.map(p => (
                  <ProductCard
                    key={p.id} product={p}
                    onView={setModal}
                    onHide={toggleHide}
                    onFlag={flagProduct}
                    onDelete={deleteProduct}
                  />
                ))}
              </div>

            ) : (
              /* ── Desktop/Tablet: Table ── */
              <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.09)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: isTablet ? 700 : 900 }}>
                    <thead>
                      <tr style={{ background: "#f8f7f3", borderBottom: "0.5px solid rgba(0,0,0,0.09)" }}>
                        {["", "Product", "Price", "Category", "Seller", "Stock", "Status", !isTablet && "Added", "Actions"]
                          .filter(Boolean)
                          .map((h, i) => (
                            <th key={i} style={{
                              padding: "10px 12px", textAlign: "left", fontWeight: 600,
                              fontSize: 10, color: "#6b6a63", textTransform: "uppercase",
                              letterSpacing: "0.06em", whiteSpace: "nowrap",
                              ...(i === 0 ? { width: 52 } : {}),
                            }}>{h}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(p => (
                        <tr
                          key={p.id}
                          className="row-hover"
                          style={{ borderBottom: "0.5px solid rgba(0,0,0,0.07)", cursor: "pointer", transition: "background 0.1s" }}
                          onClick={() => setModal(p)}
                        >
                          <td style={{ padding: "10px 12px" }}>
                            <div style={styles.thumb}>{p.emoji}</div>
                          </td>
                          <td style={{ padding: "10px 12px", maxWidth: 180 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1916", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#a09f97", marginTop: 1, fontFamily: "'DM Mono', monospace" }}>{p.sku}</div>
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(p.price)}</td>
                          <td style={{ padding: "10px 12px", color: "#6b6a63", whiteSpace: "nowrap" }}>{p.category}</td>
                          <td style={{ padding: "10px 12px" }}><SellerBadge name={p.seller} /></td>
                          <td style={{ padding: "10px 12px", fontWeight: 600, color: p.stock < 10 && p.stock > 0 ? "#d93025" : "#1a1916" }}>
                            {p.stock}
                          </td>
                          <td style={{ padding: "10px 12px" }}><StatusBadge status={p.status} /></td>
                          {!isTablet && <td style={{ padding: "10px 12px", fontSize: 12, color: "#a09f97", whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</td>}
                          <td style={{ padding: "10px 12px" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button onClick={() => setModal(p)} style={{ ...styles.cardBtn, fontSize: 11, padding: "4px 9px" }}>View</button>
                              <button onClick={() => toggleHide(p.id)} style={{ ...styles.cardBtn, fontSize: 11, padding: "4px 9px", color: "#b06000" }}>
                                {p.status === "hidden" ? "Show" : "Hide"}
                              </button>
                              <button onClick={() => deleteProduct(p.id)} style={{ ...styles.cardBtn, fontSize: 11, padding: "4px 9px", color: "#d93025" }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ ...styles.cardBtn, opacity: page === 1 ? 0.4 : 1 }}
                >←</button>
                {Array.from({ length: Math.min(totalPages, isMobile ? 4 : 7) }, (_, i) => {
                  const pg = totalPages <= (isMobile ? 4 : 7) ? i + 1
                    : page <= 3 ? i + 1
                    : page >= totalPages - 2 ? totalPages - (isMobile ? 3 : 6) + i
                    : page - 2 + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      style={{
                        ...styles.cardBtn,
                        background: pg === page ? "#1d5bf5" : "#f5f4f0",
                        color: pg === page ? "#fff" : "#1a1916",
                        border: pg === page ? "none" : "0.5px solid rgba(0,0,0,0.1)",
                        fontWeight: pg === page ? 600 : 500,
                        minWidth: 32,
                      }}
                    >{pg}</button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ ...styles.cardBtn, opacity: page === totalPages ? 0.4 : 1 }}
                >→</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal */}
      <ProductModal
        product={modal}
        onClose={() => setModal(null)}
        onHide={toggleHide}
        onFlag={flagProduct}
        onDelete={deleteProduct}
      />
    </>
  );
}