// ShopNexus — Premium Marketplace Homepage
// React Component | Light & Clean / Sleek & Minimal
// Design: White + Blue (#1a56db) system
// Instrument Serif + DM Sans typography
//
// SETUP:
//   1. Add Google Fonts to index.html <head>:
//      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
//   2. import HomePage from "./HomePage";
//
// SECTIONS:
//   ① Hero Banner (with auto-rotating slides)
//   ② Stats Bar
//   ③ Category Grid
//   ④ Flash Sale (with countdown timer)
//   ⑤ Trending Products Grid
//   ⑥ Promo Banner Strip
//   ⑦ Best Sellers
//   ⑧ Featured Shops
//   ⑨ Newsletter
//   ⑩ Footer

import { useState, useEffect, useCallback } from "react";
import { useWishlist } from '../../hooks/useWishlist';
import { useCategories } from '../../context/CategoryContext';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  brand:      "#1a56db",
  brandHover: "#1447c0",
  brandLight: "#eff5ff",
  ink:        "#0f172a",
  muted:      "#64748b",
  faint:      "#f8fafc",
  line:       "#e2e8f0",
  white:      "#ffffff",
  danger:     "#dc2626",
  dangerBg:   "#fef2f2",
  success:    "#16a34a",
  amber:      "#f59e0b",
  page:       "#f1f5f9",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: "New Arrivals — Summer 2025",
    headline: ["Discover Everything", "You Need"],
    italic: "Everything",
    sub: "Premium marketplace with thousands of products across every category — fashion, electronics, home, beauty & more.",
    cta: "Shop Now",
    cta2: "Browse Categories",
    accent: T.brand,
    bg: "#eff5ff",
    decorBg: "#dbeafe",
    cards: [
      { emoji: "📱", name: "iPhone 15 Pro", price: "$999", tag: "Electronics", bg: "#e0f2fe" },
      { emoji: "👟", name: "Air Sneakers",  price: "$129", tag: "Fashion",     bg: "#dcfce7" },
      { emoji: "🎧", name: "Pro Headphones",price: "$249", tag: "Audio",       bg: "#fef9c3" },
      { emoji: "🌿", name: "Face Serum",    price: "$45",  tag: "Beauty",      bg: "#fdf4ff" },
    ],
  },
  {
    id: 2,
    eyebrow: "Flash Sale — Up to 60% Off",
    headline: ["Unbeatable Deals", "Every Day"],
    italic: "Deals",
    sub: "Limited-time offers across fashion, electronics & home categories. Don't miss out on the best prices of the season.",
    cta: "View All Deals",
    cta2: "Electronics Sale",
    accent: T.danger,
    bg: "#fff1f2",
    decorBg: "#fecdd3",
    cards: [
      { emoji: "💻", name: "MacBook Air M3",price: "$1,099", tag: "−15%", bg: "#fef3c7" },
      { emoji: "⌚", name: "Apple Watch S9",price: "$399",   tag: "−20%", bg: "#ede9fe" },
      { emoji: "🎮", name: "PS5 Controller",price: "$69",    tag: "−30%", bg: "#dcfce7" },
      { emoji: "☕", name: "Nespresso Pop", price: "$129",   tag: "−25%", bg: "#fce7f3" },
    ],
  },
  {
    id: 3,
    eyebrow: "Trending This Week",
    headline: ["Shop the Latest", "Trends"],
    italic: "Latest",
    sub: "Curated collections from top brands and verified sellers. Stay ahead of the curve with ShopNexus.",
    cta: "Explore Trends",
    cta2: "View Lookbook",
    accent: "#0f766e",
    bg: "#f0fdfa",
    decorBg: "#ccfbf1",
    cards: [
      { emoji: "👗", name: "Floral Maxi Dress",price: "$89",  tag: "Fashion", bg: "#fce7f3" },
      { emoji: "🕶️", name: "Aviator Sunglasses",price: "$59", tag: "Style",   bg: "#fef9c3" },
      { emoji: "👜", name: "Leather Tote Bag",  price: "$149",tag: "Bags",    bg: "#ede9fe" },
      { emoji: "🧴", name: "Skincare Routine",  price: "$78", tag: "Beauty",  bg: "#dcfce7" },
    ],
  },
];

const FLASH_PRODUCTS = [
  { id:1, name:"Samsung Galaxy S24 Ultra",cat:"Electronics",emoji:"📱",price:849,original:1199,rating:4.8,reviews:320,discount:29,bg:"#eff5ff" },
  { id:2, name:"Nike Air Max 270 React",  cat:"Shoes",      emoji:"👟",price:89, original:129, rating:4.7,reviews:891,discount:31,bg:"#f0fdf4" },
  { id:3, name:"Sony WH-1000XM5",        cat:"Audio",      emoji:"🎧",price:249,original:350, rating:4.9,reviews:1240,discount:29,bg:"#fefce8" },
  { id:4, name:"MacBook Air M3 13\"",    cat:"Computers",  emoji:"💻",price:1099,original:1299,rating:4.9,reviews:512,discount:15,bg:"#fdf4ff" },
];

const TRENDING_PRODUCTS = [
  { id:1,  name:"iPhone 15 Pro Max 256GB",      cat:"Electronics",emoji:"📱",price:1199,original:null, rating:4.9,reviews:1247,isNew:true,  bg:"#eff5ff" },
  { id:2,  name:"Vitamin C Brightening Serum",  cat:"Beauty",     emoji:"🌿",price:38,  original:null, rating:4.6,reviews:2100,isNew:false, bg:"#f0fdf4" },
  { id:3,  name:"Apple Watch Series 9",         cat:"Wearables",  emoji:"⌚",price:399, original:null, rating:4.9,reviews:3400,isNew:false, bg:"#fdf4ff" },
  { id:4,  name:"Levi's 501 Original Jeans",    cat:"Clothing",   emoji:"👖",price:69,  original:98,   rating:4.7,reviews:4200,isNew:false, bg:"#fefce8" },
  { id:5,  name:"Nespresso Vertuo Pop",         cat:"Kitchen",    emoji:"☕",price:129, original:179,  rating:4.8,reviews:654,isNew:false, bg:"#fdf2f8" },
  { id:6,  name:"PS5 DualSense Controller",     cat:"Gaming",     emoji:"🎮",price:69,  original:null, rating:4.8,reviews:1800,isNew:false, bg:"#eff5ff" },
  { id:7,  name:"Adidas Ultraboost 23",         cat:"Shoes",      emoji:"👟",price:149, original:180,  rating:4.6,reviews:720,isNew:false, bg:"#f0fdf4" },
  { id:8,  name:"KitchenAid Stand Mixer 5Qt",   cat:"Kitchen",    emoji:"🍰",price:349, original:449,  rating:4.9,reviews:2800,isNew:false, bg:"#fefce8" },
];

const BEST_SELLERS = [
  { id:1, name:"AirPods Pro 2nd Gen",        cat:"Audio",    emoji:"🎧",price:249,rating:4.7,reviews:5600,sold:12400,bg:"#fefce8" },
  { id:2, name:"LANEIGE Lip Sleeping Mask",  cat:"Beauty",   emoji:"💋",price:24, rating:4.8,reviews:8900,sold:32000,bg:"#fdf2f8" },
  { id:3, name:"The Alchemist — Paperback",  cat:"Books",    emoji:"📖",price:14, rating:4.9,reviews:14200,sold:55000,bg:"#fff7ed" },
  { id:4, name:"Instant Pot Duo 7-in-1",    cat:"Kitchen",  emoji:"🍲",price:99, rating:4.8,reviews:22000,sold:41000,bg:"#f0fdf4" },
  { id:5, name:"Dyson V15 Detect Vacuum",   cat:"Home",     emoji:"🌀",price:599,rating:4.7,reviews:3200,sold:8900,bg:"#eff5ff" },
  { id:6, name:"Kindle Paperwhite 11th Gen",cat:"Electronics",emoji:"📱",price:139,rating:4.8,reviews:11000,sold:29000,bg:"#f0fdf4" },
];

const FEATURED_SHOPS = [
  { id:1, name:"TechVault",    category:"Electronics",emoji:"🔌",rating:4.9,products:1240,verified:true,badge:"Top Rated"    },
  { id:2, name:"StyleHaus",   category:"Fashion",    emoji:"👔",rating:4.8,products:3200,verified:true,badge:"Best Seller"  },
  { id:3, name:"GreenLeaf Co",category:"Grocery",    emoji:"🌿",rating:4.7,products:580, verified:true,badge:"Eco Friendly" },
  { id:4, name:"LuxeBeauty",  category:"Beauty",     emoji:"💄",rating:4.9,products:890, verified:true,badge:"Premium"      },
];

const STATS = [
  { value:"2.4M+", label:"Products Listed" },
  { value:"180K+", label:"Happy Customers" },
  { value:"12K+",  label:"Verified Sellers" },
  { value:"4.9★",  label:"Average Rating" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: T.amber, fontSize: 11, letterSpacing: -0.5 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

function Badge({ children, color = T.brand, bg = T.brandLight }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
      color, background: bg,
      padding: "3px 8px", borderRadius: 20,
    }}>
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, subtitle, cta, onCta }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
      <div>
        {eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: T.brand, marginBottom: 6 }}>
            {eyebrow}
          </div>
        )}
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: T.ink, letterSpacing: -0.5, lineHeight: 1.1, margin: 0 }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>{subtitle}</p>}
      </div>
      {cta && (
        <button
          style={{ fontSize: 12, fontWeight: 500, color: T.brand, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit" }}
          onClick={onCta}
        >
          {cta} →
        </button>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const [hovered, setHovered] = useState(false);
  const { isWished, toggleWish } = useWishlist();
  const wished = isWished(product.id);
  const disc = product.original
    ? Math.round((1 - product.price / product.original) * 100)
    : product.discount || null;

  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${hovered ? T.brand : T.line}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div style={{ height: 160, background: product.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
        {product.emoji}
        {disc && (
          <span style={{ position: "absolute", top: 10, left: 10, background: T.danger, color: T.white, fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 4 }}>
            −{disc}%
          </span>
        )}
        {product.isNew && !disc && (
          <span style={{ position: "absolute", top: 10, left: 10, background: T.brand, color: T.white, fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 4 }}>
            New
          </span>
        )}
        <button
          style={{
            position: "absolute", top: 10, right: 10,
            width: 28, height: 28, borderRadius: "50%",
            background: T.white, border: `1px solid ${T.line}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 13,
            color: wished ? T.danger : T.muted,
            transition: "all 0.15s",
          }}
          onClick={(e) => { e.stopPropagation(); toggleWish({ id: product.id, name: product.name, price: product.price, image: product.image || null }); }}
          aria-label="Wishlist"
        >
          {wished ? "♥" : "♡"}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          {product.cat}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 8, lineHeight: 1.3, flex: 1 }}>
          {product.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <StarRating rating={product.rating} />
          <span style={{ fontSize: 11, color: T.muted }}>({product.reviews?.toLocaleString()})</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: T.brand }}>${product.price}</span>
          {product.original && (
            <span style={{ fontSize: 12, color: T.muted, textDecoration: "line-through" }}>${product.original}</span>
          )}
        </div>
        <button
          style={{
            width: "100%", background: hovered ? T.brand : "none",
            color: hovered ? T.white : T.ink,
            border: `1px solid ${hovered ? T.brand : T.line}`,
            borderRadius: 7, padding: "8px",
            fontSize: 12, fontWeight: 500,
            cursor: "pointer", transition: "all 0.2s",
            fontFamily: "inherit",
          }}
          onClick={(e) => { e.stopPropagation(); onAdd?.(product); }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroBanner({ onNavigate }) {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setSlide(idx); setAnimating(false); }, 200);
  }, [animating]);

  useEffect(() => {
    const timer = setInterval(() => goTo((slide + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, [slide, goTo]);

  const s = HERO_SLIDES[slide];

  return (
    <section style={{ background: s.bg, transition: "background 0.4s", padding: "0 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        {/* Left */}
        <div style={{ opacity: animating ? 0 : 1, transition: "opacity 0.2s", transform: animating ? "translateY(8px)" : "translateY(0)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: s.accent, background: `${s.accent}18`, padding: "4px 12px", borderRadius: 20, marginBottom: 20 }}>
            ✦ {s.eyebrow}
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 52, lineHeight: 1.08, color: T.ink, marginBottom: 16, letterSpacing: -1.5 }}>
            {s.headline[0].includes(s.italic)
              ? <>{s.headline[0].replace(s.italic, "")} <em style={{ color: s.accent, fontStyle: "italic" }}>{s.italic}</em><br />{s.headline[1]}</>
              : <>{s.headline[0]}<br /><em style={{ color: s.accent, fontStyle: "italic" }}>{s.headline[1]}</em></>
            }
          </h1>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, marginBottom: 28, maxWidth: 420 }}>
            {s.sub}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{ background: s.accent, color: T.white, border: "none", borderRadius: 9, padding: "12px 28px", fontSize: 14, fontFamily: "inherit", fontWeight: 500, cursor: "pointer", transition: "opacity 0.15s" }}
              onClick={() => onNavigate?.("shop")}
            >
              {s.cta}
            </button>
            <button
              style={{ background: "none", color: T.ink, border: `1px solid ${T.line}`, borderRadius: 9, padding: "12px 28px", fontSize: 14, fontFamily: "inherit", fontWeight: 500, cursor: "pointer", transition: "border-color 0.15s" }}
              onClick={() => onNavigate?.("categories")}
            >
              {s.cta2}
            </button>
          </div>
          {/* Dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? s.accent : `${s.accent}40`, border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right — product cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, opacity: animating ? 0 : 1, transition: "opacity 0.2s" }}>
          {s.cards.map((card, i) => (
            <div
              key={i}
              style={{
                background: T.white,
                border: `1px solid ${T.line}`,
                borderRadius: 12, padding: 16,
                marginTop: i % 2 === 1 ? 20 : 0,
                cursor: "pointer",
                transition: "transform 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = s.accent; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = T.line; }}
            >
              <div style={{ height: 72, background: card.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 10 }}>
                {card.emoji}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: T.ink, marginBottom: 2 }}>{card.name}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: s.accent }}>{card.price}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{card.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section style={{ background: T.white, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: T.brand, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryGrid({ onNavigate }) {
  const [hovered, setHovered] = useState(null);
  const { categories, isCategoriesLoading, categoriesError, hasNoCategoriesData } = useCategories();
  
  // Color palette for categories - cycling through different colors for visual variety
  const categoryColors = [
    { bg: "#eff5ff", color: T.brand },
    { bg: "#fefce8", color: "#854d0e" },
    { bg: "#f0fdf4", color: "#166534" },
    { bg: "#fdf4ff", color: "#7e22ce" },
    { bg: "#fff7ed", color: "#9a3412" },
    { bg: "#f0fdf4", color: "#166534" },
    { bg: "#fdf2f8", color: "#9d174d" },
    { bg: "#eff5ff", color: T.brand },
  ];

  if (isCategoriesLoading) {
    return (
      <section style={{ padding: "48px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader eyebrow="Browse by" title="Shop by Category" cta="View all" onCta={() => onNavigate?.("categories")} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: 120, background: T.faint, borderRadius: 10,
              animation: "pulse 2s infinite", border: `1px solid ${T.line}`
            }} />
          ))}
        </div>
      </section>
    );
  }

  if (categoriesError || hasNoCategoriesData) {
    return (
      <section style={{ padding: "48px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader eyebrow="Browse by" title="Shop by Category" cta="View all" onCta={() => onNavigate?.("categories")} />
        <div style={{
          textAlign: "center", padding: "40px", background: T.brandLight, borderRadius: 10,
          color: T.brand, fontSize: 14
        }}>
          {categoriesError 
            ? "Unable to load categories. Please try again later."
            : "No categories available at this time."}
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "48px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <SectionHeader eyebrow="Browse by" title="Shop by Category" cta="View all" onCta={() => onNavigate?.("categories")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {categories.map((cat, idx) => {
          const colorPair = categoryColors[idx % categoryColors.length];
          return (
            <button
              key={cat.id}
              style={{
                background: hovered === cat.id ? colorPair.bg : T.faint,
                border: `1px solid ${hovered === cat.id ? colorPair.color + "40" : T.line}`,
                borderRadius: 10, padding: "20px 10px",
                textAlign: "center", cursor: "pointer",
                transition: "all 0.18s",
                fontFamily: "inherit",
                transform: hovered === cat.id ? "translateY(-2px)" : "none",
              }}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onNavigate?.(cat.slug)}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: hovered === cat.id ? colorPair.color : T.ink, marginBottom: 2, transition: "color 0.18s" }}>{cat.name}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{cat.slug}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FlashSale({ onNavigate, onAdd }) {
  // Countdown — 2h 47m 33s from mount
  const [secs, setSecs] = useState(2 * 3600 + 47 * 60 + 33);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h  = Math.floor(secs / 3600);
  const m  = Math.floor((secs % 3600) / 60);
  const s  = secs % 60;
  const pad = n => String(n).padStart(2, "0");

  const TimeBox = ({ v }) => (
    <div style={{ background: T.ink, color: T.white, borderRadius: 6, padding: "6px 10px", minWidth: 38, textAlign: "center", fontSize: 18, fontWeight: 500, fontFamily: "'Instrument Serif', serif", lineHeight: 1.2 }}>
      {v}
    </div>
  );

  return (
    <section style={{ padding: "0 32px 48px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: T.danger, marginBottom: 4 }}>Limited Time</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: T.ink, letterSpacing: -0.5, margin: 0 }}>⚡ Flash Sale</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <TimeBox v={pad(h)} />
            <span style={{ fontSize: 18, fontWeight: 500, color: T.muted }}>:</span>
            <TimeBox v={pad(m)} />
            <span style={{ fontSize: 18, fontWeight: 500, color: T.muted }}>:</span>
            <TimeBox v={pad(s)} />
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: T.muted, marginLeft: 4 }}>
            <span>hrs</span><span style={{ marginLeft: 20 }}>min</span><span style={{ marginLeft: 20 }}>sec</span>
          </div>
        </div>
        <button style={{ fontSize: 12, fontWeight: 500, color: T.danger, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={() => onNavigate?.("flash-sale")}>
          See all deals →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {FLASH_PRODUCTS.map(p => (
          <div
            key={p.id}
            style={{
              background: T.white,
              border: `1px solid ${T.line}`,
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.danger; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ height: 150, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, position: "relative" }}>
              {p.emoji}
              <span style={{ position: "absolute", top: 10, left: 10, background: T.danger, color: T.white, fontSize: 11, fontWeight: 500, padding: "4px 9px", borderRadius: 5 }}>−{p.discount}%</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{p.cat}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: T.danger }}>${p.price}</span>
                <span style={{ fontSize: 12, color: T.muted, textDecoration: "line-through" }}>${p.original}</span>
              </div>
              {/* Progress bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted, marginBottom: 4 }}>
                  <span>Sold: {Math.floor(Math.random() * 60 + 30)}%</span>
                  <span>Hurry!</span>
                </div>
                <div style={{ height: 4, background: "#fee2e2", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.floor(Math.random() * 40 + 40)}%`, background: T.danger, borderRadius: 4 }} />
                </div>
              </div>
              <button
                style={{ width: "100%", background: T.danger, color: T.white, border: "none", borderRadius: 7, padding: "8px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" }}
                onClick={() => onAdd?.(p)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PromoBannerStrip({ onNavigate }) {
  const promos = [
    { emoji: "🚚", title: "Free Delivery", sub: "On orders above $50", color: T.brand, bg: T.brandLight },
    { emoji: "↩️", title: "Easy Returns",  sub: "30-day return policy", color: "#0f766e", bg: "#f0fdfa" },
    { emoji: "🔒", title: "Secure Payment",sub: "100% protected checkout", color: "#7c3aed", bg: "#f5f3ff" },
    { emoji: "⭐", title: "Verified Sellers",sub: "All shops are vetted", color: "#b45309", bg: "#fffbeb" },
  ];
  return (
    <section style={{ padding: "0 32px 48px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {promos.map((p, i) => (
          <div key={i} style={{ background: p.bg, borderRadius: 10, padding: "18px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{p.emoji}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: p.color }}>{p.title}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{p.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrendingProducts({ onNavigate, onAdd }) {
  return (
    <section style={{ padding: "0 32px 56px", maxWidth: 1100, margin: "0 auto" }}>
      <SectionHeader eyebrow="Hot right now" title="Trending Products" cta="View all" onCta={() => onNavigate?.("shop")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {TRENDING_PRODUCTS.map(p => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

function BigPromoBanner({ onNavigate }) {
  return (
    <section style={{ padding: "0 32px 56px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ background: T.brand, borderRadius: 16, padding: "44px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", right: -60, top: -60, width: 240, height: 240, background: "rgba(255,255,255,0.05)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 80, bottom: -80, width: 180, height: 180, background: "rgba(255,255,255,0.05)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>✦ Summer Sale 2025</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: T.white, lineHeight: 1.15, marginBottom: 10, letterSpacing: -0.5 }}>
            Up to <em style={{ fontStyle: "italic" }}>60% Off</em> Sitewide
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 24, maxWidth: 340 }}>
            Shop thousands of deals across fashion, electronics, home & more. Limited time only.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{ background: T.white, color: T.brand, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => onNavigate?.("sale")}
            >
              Shop the Sale
            </button>
            <button
              style={{ background: "rgba(255,255,255,0.15)", color: T.white, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => onNavigate?.("categories")}
            >
              Browse Categories
            </button>
          </div>
        </div>
        <div style={{ fontSize: 100, opacity: 0.12, position: "relative", zIndex: 1, flexShrink: 0 }}>🛍️</div>
      </div>
    </section>
  );
}

function BestSellers({ onNavigate, onAdd }) {
  return (
    <section style={{ padding: "0 32px 56px", maxWidth: 1100, margin: "0 auto" }}>
      <SectionHeader eyebrow="Most purchased" title="Best Sellers" cta="View all" onCta={() => onNavigate?.("best-sellers")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {BEST_SELLERS.map(p => (
          <div
            key={p.id}
            style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 12, padding: 16, display: "flex", gap: 14, cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", alignItems: "center" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.transform = "translateX(2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ width: 72, height: 72, background: p.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
              {p.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{p.cat}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <StarRating rating={p.rating} />
                <span style={{ fontSize: 11, color: T.muted }}>({p.reviews.toLocaleString()})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: T.brand }}>${p.price}</span>
                <span style={{ fontSize: 10, color: T.muted }}>{p.sold.toLocaleString()} sold</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedShops({ onNavigate }) {
  return (
    <section style={{ background: T.faint, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: "48px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader eyebrow="Top verified stores" title="Featured Shops" cta="Browse all shops" onCta={() => onNavigate?.("shops")} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {FEATURED_SHOPS.map(shop => (
            <div
              key={shop.id}
              style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.transform = "none"; }}
              onClick={() => onNavigate?.(`shop/${shop.id}`)}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.brandLight, border: `2px solid ${T.brand}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 12px" }}>
                {shop.emoji}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 2 }}>{shop.name}</div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>{shop.category}</div>
              <Badge>{shop.badge}</Badge>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12, fontSize: 11, color: T.muted }}>
                <span>⭐ {shop.rating}</span>
                <span>·</span>
                <span>{shop.products.toLocaleString()} items</span>
              </div>
              {shop.verified && (
                <div style={{ marginTop: 8, fontSize: 10, color: T.success, fontWeight: 500 }}>✓ Verified Seller</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section style={{ padding: "56px 32px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: T.brand, marginBottom: 12 }}>
          Stay in the loop
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: T.ink, marginBottom: 12, letterSpacing: -0.5 }}>
          Get the best deals first
        </h2>
        <p style={{ fontSize: 14, color: T.muted, marginBottom: 28, lineHeight: 1.7 }}>
          Subscribe to our newsletter and never miss a flash sale, new arrival, or exclusive offer.
        </p>
        {submitted ? (
          <div style={{ background: "#f0fdf4", border: `1px solid #bbf7d0`, borderRadius: 10, padding: "16px 24px", color: T.success, fontSize: 14, fontWeight: 500 }}>
            ✓ You're subscribed! Welcome to ShopNexus.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={{ flex: 1, border: `1.5px solid ${T.line}`, borderRadius: 9, padding: "11px 16px", fontSize: 13, fontFamily: "inherit", color: T.ink, outline: "none", background: T.white }}
              onFocus={e => e.target.style.borderColor = T.brand}
              onBlur={e => e.target.style.borderColor = T.line}
              onKeyDown={e => e.key === "Enter" && email && setSubmitted(true)}
            />
            <button
              style={{ background: T.brand, color: T.white, border: "none", borderRadius: 9, padding: "11px 24px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
              onClick={() => email && setSubmitted(true)}
            >
              Subscribe
            </button>
          </div>
        )}
        <p style={{ fontSize: 11, color: T.muted, marginTop: 12 }}>No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}

// ─── Main HomePage Component ──────────────────────────────────────────────────
export default function HomePage({ onNavigate, onAddToCart }) {
  // Inject global styles once
  useEffect(() => {
    const id = "shopnexus-home-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: #f1f5f9;
          color: #0f172a;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const navigate = (page, meta) => onNavigate?.(page, meta);
  const addToCart = (product) => onAddToCart?.(product);

  return (
    <main style={{ background: T.page }}>
      {/* ① Hero */}
      <HeroBanner onNavigate={navigate} />

      {/* ② Stats */}
      <StatsBar />

      {/* ③ Categories */}
      <CategoryGrid onNavigate={navigate} />

      {/* ④ Flash Sale */}
      <FlashSale onNavigate={navigate} onAdd={addToCart} />

      {/* ⑤ Promo features strip */}
      <PromoBannerStrip onNavigate={navigate} />

      {/* ⑥ Trending Products */}
      <TrendingProducts onNavigate={navigate} onAdd={addToCart} />

      {/* ⑦ Big promo banner */}
      <BigPromoBanner onNavigate={navigate} />

      {/* ⑧ Best Sellers */}
      <BestSellers onNavigate={navigate} onAdd={addToCart} />

      {/* ⑨ Featured Shops */}
      <FeaturedShops onNavigate={navigate} />

      {/* ⑩ Newsletter */}
      <Newsletter />

    </main>
  );
}

// ─── Usage ────────────────────────────────────────────────────────────────────
//
// import HomePage from "./HomePage";
//
// function App() {
//   const handleNav = (page, meta) => {
//     // e.g. react-router: navigate(`/${page}`)
//     console.log("Navigate:", page, meta);
//   };
//
//   const handleAddToCart = (product) => {
//     console.log("Added to cart:", product);
//     // update your cart state here
//   };
//
//   return (
//     <>
//       <Navbar cartCount={cartItems.length} onNavigate={handleNav} />
//       <HomePage onNavigate={handleNav} onAddToCart={handleAddToCart} />
//     </>
//   );
// }