// ShopNexus — Premium Marketplace Navbar
// React Component | Light & Clean / Sleek & Minimal
// Design: White + Blue (#1a56db) system
//
// SETUP:
//   1. npm install
//   2. Add Google Fonts to your index.html <head>:
//      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
//   3. Import and use: <Navbar cartCount={2} />
//
// PROPS:
//   cartCount   {number}   — items in cart (default 0)
//   onNavigate  {fn}       — called with page name on nav actions
//   initialUser {object}   — { name, email } if pre-logged-in (optional)

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useCategories } from "../../context/CategoryContext";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  brand:       "#1a56db",
  brandHover:  "#1447c0",
  brandLight:  "#eff5ff",
  ink:         "#0f172a",
  muted:       "#64748b",
  faint:       "#f8fafc",
  line:        "#e2e8f0",
  white:       "#ffffff",
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  success:     "#16a34a",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  Arrow: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Clock: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
    </svg>
  ),
  Globe: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Menu: () => (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor">
      <rect y="0"  width="16" height="1.8" rx="1" />
      <rect y="6"  width="16" height="1.8" rx="1" />
      <rect y="12" width="16" height="1.8" rx="1" />
    </svg>
  ),
  Chevron: ({ open }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Store: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Cart: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  User: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Orders: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Heart: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Settings: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  TrendUp: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Recent: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="12 8 12 12 14 14" /><circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

const TOPBAR_ACTIONS = [
  { id: "track-order", label: "Track Order", icon: Icon.Clock },
  { id: "help", label: "Help Center", icon: null },
];

const SEARCH_TYPE_MAP = {
  Products: "Products",
  Shops: "Shops",
  Categories: "Categories",
};

function getActiveNavFromLocation(pathname, search, categorySlugs) {
  if (pathname === "/") return "home";
  if (pathname === "/products") {
    const params = new URLSearchParams(search);
    const category = params.get("category");
    if (category && categorySlugs.has(category)) return category;
    if (params.get("sale") === "true") return "sale";
  }
  return "home";
}

const TRENDING = ["iPhone 15", "basmati rice", "summer dress", "Nike Air Max", "laptop stand"];
const RECENT   = ["black t-shirt", "wireless headphones"];

// ─── Styles ───────────────────────────────────────────────────────────────────
// All styles as JS objects — no external CSS needed, no Tailwind required.
// Just drop this file into any React project and it works.
const S = {
  // Top bar
  topbar: {
    background: T.brand,
    height: 34,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 600,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.88)" },
  topbarRight: { display: "flex", alignItems: "center", gap: 14 },
  topbarLink: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 11, color: "rgba(255,255,255,0.8)",
    cursor: "pointer", textDecoration: "none",
    transition: "color 0.15s",
    background: "none", border: "none", fontFamily: "inherit",
  },
  topbarSep: { color: "rgba(255,255,255,0.3)", fontSize: 10 },

  // Main nav
  navbar: {
    background: T.white,
    borderBottom: `1px solid ${T.line}`,
    height: 64,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    gap: 0,
    position: "sticky",
    top: 34,
    zIndex: 500,
  },

  // Logo
  logo: {
    display: "flex", alignItems: "center", gap: 8,
    cursor: "pointer", flexShrink: 0, marginRight: 20,
    textDecoration: "none",
  },
  logoIcon: {
    width: 34, height: 34, background: T.brand,
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 20, color: T.ink, letterSpacing: -0.5, lineHeight: 1,
  },

  // Category trigger
  catTrigger: (open) => ({
    display: "flex", alignItems: "center", gap: 7,
    padding: "0 14px", height: 64, cursor: "pointer",
    fontSize: 13, fontWeight: 500,
    color: open ? T.brand : T.ink,
    borderRight: `1px solid ${T.line}`,
    flexShrink: 0, position: "relative",
    transition: "color 0.15s", userSelect: "none",
    background: "none", border: "none",
    fontFamily: "inherit",
  }),

  // Dropdown
  dropdown: {
    position: "absolute",
    top: 64, left: 0, width: 260,
    background: T.white,
    border: `1px solid ${T.line}`,
    borderTop: `2px solid ${T.brand}`,
    borderRadius: "0 0 10px 10px",
    zIndex: 400,
    overflow: "hidden",
    animation: "dropIn 0.18s ease",
  },
  catItem: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "11px 16px", cursor: "pointer",
    borderBottom: `0.5px solid ${T.line}`,
    transition: "background 0.12s",
    background: "none", border: "none",
    width: "100%", textAlign: "left",
    fontFamily: "inherit",
  },
  catIconWrap: (bg) => ({
    width: 32, height: 32, borderRadius: 7,
    background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, flexShrink: 0,
  }),
  catItemName: { fontSize: 13, fontWeight: 500, color: T.ink },
  catItemCount: { fontSize: 11, color: T.muted, marginLeft: "auto" },
  catFooter: {
    padding: "10px 16px", background: T.faint,
    borderTop: `1px solid ${T.line}`,
    fontSize: 12, color: T.brand, cursor: "pointer",
    fontWeight: 500, textAlign: "center",
    border: "none", width: "100%", fontFamily: "inherit",
  },

  // Search
  searchWrap: { flex: 1, maxWidth: 520, margin: "0 16px", position: "relative" },
  searchBox: (focused) => ({
    display: "flex", alignItems: "center",
    border: `1.5px solid ${focused ? T.brand : T.line}`,
    borderRadius: 9, overflow: "hidden",
    background: focused ? T.white : T.faint,
    transition: "border-color 0.15s, background 0.15s",
  }),
  searchTypeSelect: {
    border: "none", background: "transparent",
    padding: "0 10px 0 12px",
    fontSize: 12, fontFamily: "inherit",
    color: T.muted, outline: "none",
    height: 42, borderRight: `1px solid ${T.line}`,
    cursor: "pointer",
  },
  searchInput: {
    flex: 1, border: "none", background: "transparent",
    outline: "none", padding: "0 12px",
    fontSize: 13, fontFamily: "inherit",
    color: T.ink, height: 42,
  },
  searchBtn: {
    width: 44, height: 42,
    background: T.brand,
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, color: T.white,
    transition: "background 0.15s",
  },

  // Suggestions
  suggestions: {
    position: "absolute", top: "calc(100% + 4px)",
    left: 0, right: 0,
    background: T.white,
    border: `1px solid ${T.line}`,
    borderRadius: 9, zIndex: 300,
    overflow: "hidden",
    animation: "dropIn 0.15s ease",
  },
  suggestSection: { padding: "8px 0" },
  suggestLabel: {
    fontSize: 10, textTransform: "uppercase",
    letterSpacing: "0.08em", color: T.muted,
    padding: "4px 14px 6px", fontWeight: 500,
  },
  suggestItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 14px", cursor: "pointer",
    fontSize: 13, color: T.ink,
    transition: "background 0.1s",
    border: "none", background: "none",
    width: "100%", textAlign: "left", fontFamily: "inherit",
  },

  // Nav actions
  navActions: { display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", flexShrink: 0 },

  // Seller button
  sellerBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px",
    border: `1.5px solid ${T.brand}`,
    borderRadius: 8, fontSize: 12, fontWeight: 500,
    color: T.brand, cursor: "pointer",
    background: "none", fontFamily: "inherit",
    transition: "all 0.15s", whiteSpace: "nowrap",
  },

  // Cart button
  cartBtn: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "8px 14px", borderRadius: 8,
    fontSize: 13, fontWeight: 500, color: T.ink,
    cursor: "pointer", background: "none",
    border: "none", fontFamily: "inherit",
    transition: "all 0.15s", position: "relative", whiteSpace: "nowrap",
  },
  cartBadge: {
    position: "absolute", top: 3, right: 5,
    background: T.brand, color: T.white,
    fontSize: 9, fontWeight: 500,
    minWidth: 16, height: 16, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 3px", lineHeight: 1,
  },

  // Auth
  authWrap: { position: "relative" },
  authBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 8,
    cursor: "pointer", background: "none",
    border: "none", fontFamily: "inherit",
    transition: "background 0.15s",
  },
  authBtnText: { fontSize: 13, fontWeight: 500, color: T.ink },
  authBtnSub:  { fontSize: 10, color: T.muted, display: "block", lineHeight: 1 },

  // Auth dropdown
  authPanel: {
    position: "absolute", top: "calc(100% + 8px)", right: 0,
    width: 220, background: T.white,
    border: `1px solid ${T.line}`,
    borderRadius: 10, zIndex: 400, overflow: "hidden",
    animation: "dropIn 0.18s ease",
  },
  authPanelTop: { padding: "16px", borderBottom: `1px solid ${T.line}` },
  authPanelTitle: { fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 4 },
  authPanelSub:   { fontSize: 11, color: T.muted },
  authPanelBtns:  { display: "flex", flexDirection: "column", gap: 8, padding: 12 },
  loginBtn: {
    width: "100%", background: T.brand, color: T.white,
    border: "none", borderRadius: 7, padding: "9px",
    fontSize: 13, fontFamily: "inherit", fontWeight: 500,
    cursor: "pointer", transition: "background 0.15s",
  },
  registerBtn: {
    width: "100%", background: "none", color: T.ink,
    border: `1px solid ${T.line}`, borderRadius: 7, padding: "9px",
    fontSize: 13, fontFamily: "inherit", fontWeight: 500,
    cursor: "pointer", transition: "all 0.15s",
  },

  // Profile dropdown
  profilePanel: {
    position: "absolute", top: "calc(100% + 8px)", right: 0,
    width: 244, background: T.white,
    border: `1px solid ${T.line}`,
    borderRadius: 10, zIndex: 400, overflow: "hidden",
    animation: "dropIn 0.18s ease",
  },
  ppHeader: {
    padding: "14px 16px", borderBottom: `1px solid ${T.line}`,
    display: "flex", alignItems: "center", gap: 10,
  },
  ppAvatar: {
    width: 38, height: 38, borderRadius: "50%",
    background: T.brandLight, border: `2px solid ${T.brand}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 500, color: T.brand, flexShrink: 0,
  },
  ppName:  { fontSize: 13, fontWeight: 500, color: T.ink },
  ppEmail: { fontSize: 11, color: T.muted },
  ppItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 16px", cursor: "pointer",
    fontSize: 13, color: T.ink,
    transition: "background 0.1s",
    border: "none", background: "none",
    width: "100%", textAlign: "left", fontFamily: "inherit",
    borderBottom: `0.5px solid ${T.line}`,
  },

  // Category quick nav
  catNav: {
    background: T.white,
    borderBottom: `1px solid ${T.line}`,
    padding: "0 32px",
    display: "flex", alignItems: "center",
    height: 38, overflowX: "auto",
    position: "sticky", top: 34 + 64, zIndex: 490,
    scrollbarWidth: "none",
  },
  catNavItem: (active, isSale) => ({
    padding: "0 14px", height: 38,
    display: "flex", alignItems: "center",
    fontSize: 12,
    fontWeight: active ? 500 : 400,
    color: isSale ? T.danger : active ? T.brand : T.muted,
    cursor: "pointer", whiteSpace: "nowrap",
    borderBottom: `2px solid ${active ? (isSale ? T.danger : T.brand) : "transparent"}`,
    transition: "all 0.15s",
    background: "none", border: "none",
    fontFamily: "inherit",
    flexShrink: 0,
  }),
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

function TopBar({ onNavigate, userRole }) {
  const topbarActions = TOPBAR_ACTIONS.filter((action) => {
    if (action.id === "track-order") {
      return userRole !== "Admin";
    }

    return true;
  });

  return (
    <div className="sn-topbar" style={S.topbar}>
      <div className="sn-topbar-left" style={S.topbarLeft}>
        <Icon.Arrow />
        Free shipping on orders over $50 — Use code <strong style={{ color: "#fff" }}>NEXUS10</strong> for 10% off
      </div>
      <div className="sn-topbar-right" style={S.topbarRight}>
        {topbarActions.map((action, index) => {
          const TopIcon = action.icon;
          return (
            <div key={action.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button style={S.topbarLink} onClick={() => onNavigate?.(action.id)}>
                {TopIcon ? <TopIcon /> : null}
                {action.label}
              </button>
              {index < topbarActions.length - 1 ? <span style={S.topbarSep}>|</span> : null}
            </div>
          );
        })}
        <span style={S.topbarSep}>|</span>
        <button style={S.topbarLink}>
          <Icon.Globe /> EN
        </button>
      </div>
    </div>
  );
}

function Logo({ onNavigate }) {
  return (
    <div style={S.logo} onClick={() => onNavigate?.("home")} role="link" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onNavigate?.("home")}>
      <div style={S.logoIcon}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" fill="#1a56db" stroke="#fff" strokeWidth="0.5" />
        </svg>
      </div>
      <span style={S.logoText}>
        Shop<span style={{ color: T.brand }}>Nexus</span>
      </span>
    </div>
  );
}

function CategoriesMenu({ categories, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", height: 64, display: "flex", alignItems: "center" }}>
      <button
        style={{ ...S.catTrigger(open), borderRight: `1px solid ${T.line}` }}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Icon.Menu />
        <span style={{ marginLeft: 4 }}>All Categories</span>
        <Icon.Chevron open={open} />
      </button>

      {open && (
        <div style={S.dropdown} role="menu">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              style={{ ...S.catItem, borderBottom: i < categories.length - 1 ? `0.5px solid ${T.line}` : "none" }}
              onClick={() => { onNavigate?.("category", { slug: cat.slug, categoryId: cat.id }); setOpen(false); }}
              onMouseEnter={e => { e.currentTarget.style.background = T.brandLight; e.currentTarget.querySelector(".cn").style.color = T.brand; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.querySelector(".cn").style.color = T.ink; }}
              role="menuitem"
            >
              <div style={S.catIconWrap(cat.bg)}>{cat.name.slice(0, 1).toUpperCase()}</div>
              <span className="cn" style={S.catItemName}>{cat.name}</span>
              <span style={S.catItemCount}>{cat.slug}</span>
            </button>
          ))}
          <button
            style={S.catFooter}
            onClick={() => { onNavigate?.("all-categories"); setOpen(false); }}
            onMouseEnter={e => e.currentTarget.style.color = T.brandHover}
            onMouseLeave={e => e.currentTarget.style.color = T.brand}
          >
            View all categories →
          </button>
        </div>
      )}
    </div>
  );
}

function SearchBar({ onNavigate }) {
  const [query, setQuery]     = useState("");
  const [focused, setFocused] = useState(false);
  const [type, setType]       = useState("Products");
  const [hoveredSuggest, setHoveredSuggest] = useState(null);
  const showSuggest = focused;
  const inputRef = useRef(null);

  const handleSelect = (val) => {
    setQuery(val);
    setFocused(false);
    onNavigate?.("search", { query: val, type: SEARCH_TYPE_MAP[type] || "Products" });
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    if (query.trim()) {
      onNavigate?.("search", { query, type: SEARCH_TYPE_MAP[type] || "Products" });
      setFocused(false);
    }
  };

  return (
    <div style={S.searchWrap}>
      <div style={S.searchBox(focused)}>
        <select
          style={S.searchTypeSelect}
          value={type}
          onChange={e => setType(e.target.value)}
          aria-label="Search type"
        >
          <option>Products</option>
          <option>Shops</option>
          <option>Categories</option>
        </select>

        <input
          ref={inputRef}
          style={S.searchInput}
          type="text"
          value={query}
          placeholder={`Try "black t-shirt" or "rice"...`}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          aria-label="Search products"
          autoComplete="off"
        />

        <button
          style={S.searchBtn}
          onClick={handleSearch}
          onMouseEnter={e => e.currentTarget.style.background = T.brandHover}
          onMouseLeave={e => e.currentTarget.style.background = T.brand}
          aria-label="Search"
        >
          <Icon.Search />
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggest && (
        <div style={S.suggestions} role="listbox">
          <div style={S.suggestSection}>
            <div style={S.suggestLabel}>Recent searches</div>
            {RECENT.map(item => (
              <button
                key={item}
                style={{
                  ...S.suggestItem,
                  background: hoveredSuggest === `r-${item}` ? T.faint : "none",
                  color: hoveredSuggest === `r-${item}` ? T.brand : T.ink,
                }}
                onMouseEnter={() => setHoveredSuggest(`r-${item}`)}
                onMouseLeave={() => setHoveredSuggest(null)}
                onMouseDown={() => handleSelect(item)}
                aria-selected={false}
                role="option"
              >
                <Icon.Recent />
                {item}
              </button>
            ))}
          </div>
          <div style={{ ...S.suggestSection, borderTop: `0.5px solid ${T.line}` }}>
            <div style={S.suggestLabel}>Trending</div>
            {TRENDING.map(item => (
              <button
                key={item}
                style={{
                  ...S.suggestItem,
                  background: hoveredSuggest === `t-${item}` ? T.faint : "none",
                  color: hoveredSuggest === `t-${item}` ? T.brand : T.ink,
                }}
                onMouseEnter={() => setHoveredSuggest(`t-${item}`)}
                onMouseLeave={() => setHoveredSuggest(null)}
                onMouseDown={() => handleSelect(item)}
                aria-selected={false}
                role="option"
              >
                <Icon.TrendUp />
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SellerButton({ onNavigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...S.sellerBtn,
        background: hovered ? T.brand : "none",
        color: hovered ? T.white : T.brand,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate?.("become-seller")}
    >
      <Icon.Store />
      Become a Seller
    </button>
  );
}

function CartButton({ cartCount = 0, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...S.cartBtn,
        background: hovered ? T.faint : "none",
        color: hovered ? T.brand : T.ink,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate?.("cart")}
      aria-label={`Cart, ${cartCount} items`}
    >
      <Icon.Cart />
      <span>Cart</span>
      {cartCount > 0 && (
        <span style={S.cartBadge}>{cartCount > 99 ? "99+" : cartCount}</span>
      )}
    </button>
  );
}

function AuthMenu({ user, onLogin, onLogout, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = user?.fullName || user?.name || user?.email || "Account";
  const firstName = displayName.split(" ")[0] || "Account";
  const initials = user
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const profileMenuItems = useMemo(() => {
    const NotificationIcon = () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );

    const notificationItem = { id: "notifications", label: "Notifications", icon: <NotificationIcon />, badge: null };

    if (user?.role === "Customer") {
      return [
        { id: "profile", label: "My Profile", icon: <Icon.User />, badge: null },
        { id: "orders", label: "My Orders", icon: <Icon.Orders />, badge: null },
        { id: "wishlist", label: "Wishlist", icon: <Icon.Heart />, badge: null },
        notificationItem,
        { id: "settings", label: "Settings", icon: <Icon.Settings />, badge: null },
      ];
    }

    if (user?.role === "Seller") {
      return [
        { id: "profile", label: "My Profile", icon: <Icon.User />, badge: null },
        { id: "orders", label: "Seller Orders", icon: <Icon.Orders />, badge: null },
        notificationItem,
        { id: "settings", label: "Settings", icon: <Icon.Settings />, badge: null },
      ];
    }

    if (user?.role === "Admin") {
      return [
        { id: "profile", label: "My Profile", icon: <Icon.User />, badge: null },
        { id: "admin-dashboard", label: "Admin Dashboard", icon: <Icon.TrendUp />, badge: null },
        notificationItem,
        { id: "settings", label: "Settings", icon: <Icon.Settings />, badge: null },
      ];
    }

    return [notificationItem];
  }, [user?.role]);

  return (
    <div ref={ref} style={S.authWrap}>
      <button
        style={{ ...S.authBtn, background: open ? T.faint : "none" }}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user ? (
          <div style={{ ...S.ppAvatar, width: 30, height: 30, fontSize: 11 }}>{initials}</div>
        ) : (
          <Icon.User />
        )}
        <div style={{ textAlign: "left" }}>
          <span style={S.authBtnText}>{user ? firstName : "Account"}</span>
          <span style={S.authBtnSub}>{user ? "My Account" : "Login / Register"}</span>
        </div>
        <Icon.Chevron open={open} />
      </button>

      {open && !user && (
        <div style={S.authPanel} role="dialog" aria-label="Sign in">
          <div style={S.authPanelTop}>
            <div style={S.authPanelTitle}>Welcome back!</div>
            <div style={S.authPanelSub}>Sign in to your account</div>
          </div>
          <div style={S.authPanelBtns}>
            <button
              style={S.loginBtn}
              onClick={() => { onLogin?.(); setOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background = T.brandHover}
              onMouseLeave={e => e.currentTarget.style.background = T.brand}
            >
              Login
            </button>
            <button
              style={S.registerBtn}
              onClick={() => { onNavigate?.("register"); setOpen(false); }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.color = T.ink; }}
            >
              Create Account
            </button>
          </div>
          <div style={{ padding: "0 12px 12px", textAlign: "center", fontSize: 11, color: T.muted }}>
            New here?{" "}
            <span
              style={{ color: T.brand, cursor: "pointer", fontWeight: 500 }}
              onClick={() => { onNavigate?.("register"); setOpen(false); }}
            >
              Register free →
            </span>
          </div>
        </div>
      )}

      {open && user && (
        <div style={S.profilePanel} role="menu">
          <div style={S.ppHeader}>
            <div style={S.ppAvatar}>{initials}</div>
            <div>
              <div style={S.ppName}>{displayName}</div>
              <div style={S.ppEmail}>{user.email}</div>
            </div>
          </div>

          {profileMenuItems.map((item, i) => (
            <button
              key={item.id}
              style={{
                ...S.ppItem,
                background: hoveredItem === item.id ? T.faint : "none",
                color: hoveredItem === item.id ? T.brand : T.ink,
                borderBottom: i < profileMenuItems.length - 1 ? `0.5px solid ${T.line}` : "none",
              }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => { onNavigate?.(item.id); setOpen(false); }}
              role="menuitem"
            >
              {item.icon}
              {item.label}
              {item.badge && (
                <span style={{
                  marginLeft: "auto", fontSize: 10,
                  background: T.brandLight, color: T.brandHover,
                  padding: "2px 7px", borderRadius: 10, fontWeight: 500,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <button
            style={{
              ...S.ppItem,
              borderBottom: "none",
              color: hoveredItem === "logout" ? T.danger : T.danger,
              background: hoveredItem === "logout" ? "#fef2f2" : "none",
            }}
            onMouseEnter={() => setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => { onLogout?.(); setOpen(false); }}
            role="menuitem"
          >
            <Icon.Logout />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryQuickNav({ items, activeNav, onNavigate }) {
  return (
    <div style={S.catNav}>
      {items.map(item => (
        <button
          key={item.id}
          style={S.catNavItem(activeNav === item.id, item.isSale)}
          onClick={() => onNavigate?.(item.type, item.meta)}
          onMouseEnter={e => {
            if (activeNav !== item.id) {
              e.currentTarget.style.color = item.isSale ? T.danger : T.brand;
              e.currentTarget.style.borderBottom = `2px solid ${item.isSale ? T.danger : T.brand}`;
            }
          }}
          onMouseLeave={e => {
            if (activeNav !== item.id) {
              e.currentTarget.style.color = item.isSale ? T.danger : T.muted;
              e.currentTarget.style.borderBottom = "2px solid transparent";
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Navbar Component ────────────────────────────────────────────────────
export default function Navbar({
  onNavigate = null,
}) {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { categories } = useCategories();
  const cartCount = (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const isCustomer = !user || user.role === "Customer";
  const canBecomeSeller = !user || user.role === "Customer";

  const [activeNav, setActiveNav] = useState("home");

  const categorySlugs = useMemo(
    () => new Set(categories.map((category) => category.slug)),
    [categories]
  );

  const quickNavItems = useMemo(() => {
    const categoryItems = categories.map((category) => ({
      id: category.slug,
      label: category.name,
      isSale: false,
      type: "category",
      meta: { slug: category.slug, categoryId: category.id },
    }));

    return [
      { id: "home", label: "Home", isSale: false, type: "home", meta: null },
      ...categoryItems,
      { id: "sale", label: "Sale", isSale: true, type: "sale", meta: null },
    ];
  }, [categories]);

  // Inject keyframe animation once
  useEffect(() => {
    const id = "shopnexus-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-nav::-webkit-scrollbar { display: none; }

        @media (max-width: 1024px) {
          .sn-navbar {
            padding: 0 14px !important;
            gap: 8px !important;
          }

          .sn-nav-actions {
            gap: 2px !important;
          }
        }

        @media (max-width: 768px) {
          .sn-topbar {
            display: none !important;
          }

          .sn-navbar {
            top: 0 !important;
            height: auto !important;
            min-height: 56px !important;
            padding: 10px 12px !important;
            flex-wrap: wrap !important;
            row-gap: 8px !important;
          }

          .sn-topbar-left {
            display: none !important;
          }

          .sn-cat-nav {
            display: none !important;
          }

          .sn-nav-actions {
            margin-left: auto !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    setActiveNav(getActiveNavFromLocation(location.pathname, location.search, categorySlugs));
  }, [location.pathname, location.search, categorySlugs]);

  const navigate = useCallback((page, meta) => {
    setActiveNav(meta?.slug || page);

    switch (page) {
      case "home":
        routerNavigate("/");
        break;
      case "category": {
        const params = new URLSearchParams();
        if (meta?.slug) params.set("category", meta.slug);
        if (meta?.categoryId) params.set("categoryId", meta.categoryId);
        const search = params.toString();
        routerNavigate(search ? `/products?${search}` : "/products");
        break;
      }
      case "all-categories":
        routerNavigate("/products");
        break;
      case "sale":
        routerNavigate("/products?sale=true");
        break;
      case "search": {
        const params = new URLSearchParams();
        const query = meta?.query?.trim();
        if (query) params.set("search", query);
        if (meta?.type) params.set("type", meta.type);
        const search = params.toString();
        routerNavigate(search ? `/products?${search}` : "/products");
        break;
      }
      case "cart":
        routerNavigate("/cart");
        break;
      case "become-seller":
        if (!user) {
          routerNavigate("/login");
          break;
        }

        routerNavigate(user.role === "Customer" ? "/seller/apply" : "/seller/dashboard");
        break;
      case "admin-dashboard":
        routerNavigate("/admin/dashboard");
        break;
      case "register":
        routerNavigate("/register");
        break;
      case "profile":
        routerNavigate("/profile");
        break;
      case "orders":
        routerNavigate(user?.role === "Seller" ? "/seller/orders" : user?.role === "Admin" ? "/admin/dashboard" : "/checkout");
        break;
      case "wishlist":
        routerNavigate("/profile");
        break;
      case "settings":
        routerNavigate("/profile?tab=settings");
        break;
      case "notifications":
        routerNavigate("/notifications");
        break;
      case "help":
        routerNavigate("/products");
        break;
      case "track-order":
        routerNavigate(user?.role === "Admin" ? "/admin/dashboard" : "/checkout");
        break;
      default:
        routerNavigate("/");
        break;
    }

    onNavigate?.(page, meta);
  }, [onNavigate, routerNavigate, user]);

  const handleLogin = () => {
    routerNavigate("/login");
  };

  const handleLogout = () => {
    logout();
    routerNavigate("/");
  };

  return (
    <header>
      {/* ① Top announcement bar */}
      <TopBar onNavigate={navigate} userRole={user?.role} />

      {/* ② Main navbar */}
      <nav className="sn-navbar" style={S.navbar} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Logo onNavigate={navigate} />

        {/* Categories dropdown */}
        <CategoriesMenu categories={categories} onNavigate={navigate} />

        {/* Search bar */}
        <SearchBar onNavigate={navigate} />

        {/* Right-side actions */}
        <div className="sn-nav-actions" style={S.navActions}>
          {canBecomeSeller && <SellerButton onNavigate={navigate} />}
          {isCustomer && <CartButton cartCount={cartCount} onNavigate={navigate} />}
          <AuthMenu
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onNavigate={navigate}
          />
        </div>
      </nav>

      {/* ③ Category quick-nav bar */}
      <div className="sn-cat-nav">
        <CategoryQuickNav items={quickNavItems} activeNav={activeNav} onNavigate={navigate} />
      </div>
    </header>
  );
}

// ─── Usage Example ────────────────────────────────────────────────────────────
//
// import Navbar from "./Navbar";
//
// function App() {
//   const handleNav = (page, meta) => {
//     console.log("Navigate to:", page, meta);
//     // Use react-router: navigate(`/${page}`)
//   };
//
//   return (
//     <>
//       <Navbar
//         cartCount={3}
//         onNavigate={handleNav}
//         initialUser={null}   // or { name: "Alex Johnson", email: "alex@email.com" }
//       />
//       {/* your page content */}
//     </>
//   );
// }