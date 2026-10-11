import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoriesService";
import { getImageUrl } from "../../services/imageUploadService";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; }

    .font-serif  { font-family: 'Instrument Serif', serif; }
    .font-sans   { font-family: 'DM Sans', sans-serif; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

    /* Price slider */
    .price-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px;
      background: #e2e8f0; border-radius: 99px; outline: none; }
    .price-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none;
      width: 18px; height: 18px; border-radius: 50%; background: #1a56db;
      cursor: pointer; border: 2px solid #fff; box-shadow: 0 0 0 2px #1a56db; transition: transform .15s; }
    .price-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }

    /* Carousel */
    .carousel-wrap { overflow: hidden; }
    .carousel-inner { display: flex; transition: transform .35s cubic-bezier(.4,0,.2,1); }
    .carousel-inner img { width: 100%; flex-shrink: 0; object-fit: cover; }

    /* Fade-in animation */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp .35s ease both; }

    /* Wishlist pulse */
    @keyframes heartPop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.35); }
      100% { transform: scale(1); }
    }
    .heart-pop { animation: heartPop .3s ease; }

    /* Badge shimmer */
    @keyframes shimmer {
      from { background-position: -200% 0; }
      to   { background-position: 200% 0; }
    }
    .badge-sale {
      background: linear-gradient(90deg, #ef4444, #f97316, #ef4444);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }

    /* Line-clamp */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Hover card lift */
    .product-card { transition: box-shadow .2s, transform .2s; }
    .product-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(26,86,219,.13); }

    /* List row hover */
    .list-row { transition: background .15s, box-shadow .15s; }
    .list-row:hover { background: #f8faff; box-shadow: 0 2px 12px rgba(26,86,219,.08); }

    /* Sidebar mobile slide */
    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }
    .sidebar-slide { animation: slideIn .25s cubic-bezier(.4,0,.2,1); }

    /* Search focus ring */
    .search-box:focus { outline: none; box-shadow: 0 0 0 3px rgba(26,86,219,.18); }

    /* Toast */
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(20px) scale(.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .toast { animation: toastIn .3s ease; }
  `}</style>
);

// ── Convert Backend Product DTO to Frontend Format ──────────────────────────
const mapProductDTO = (product) => ({
  id: product.id,
  name: product.name,
  category: product.categoryName || "Uncategorized",
  categoryId: product.categoryId,
  seller: product.sellerShopName || "Unknown Seller",
  sellerId: product.sellerShopSlug || product.id,
  sellerShopSlug: product.sellerShopSlug || product.id,
  price: Number(product.finalPrice ?? product.price ?? 0),
  originalPrice: Number(product.finalPrice ?? product.price ?? 0) < Number(product.price ?? 0)
    ? Number(product.price ?? 0)
    : null,
  discountLabel: product.discountLabel || "",
  rating: 4.0,
  reviews: 0,
  badge: product.stockQty <= 5 && product.stockQty > 0 ? "low-stock" : null,
  images: Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((image) => getImageUrl(image)).filter(Boolean)
    : (product.primaryImageUrl ? [getImageUrl(product.primaryImageUrl)] : ["https://via.placeholder.com/400?text=No+Image"]),
  inStock: product.stockQty > 0,
  isNew: false,
  createdAt: new Date().toISOString(),
});

// ── Stars ─────────────────────────────────────────────────────────────────────
const StarRating = ({ rating, reviews }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= .5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1,2,3,4,5].map(s => (
          <svg key={s} width="13" height="13" viewBox="0 0 20 20" fill={s <= full ? "#f59e0b" : (s === full + 1 && half ? "url(#half)" : "#e2e8f0")}>
            <defs>
              <linearGradient id="half"><stop offset="50%" stopColor="#f59e0b"/><stop offset="50%" stopColor="#e2e8f0"/></linearGradient>
            </defs>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      <span style={{ fontSize: 12, color: "#64748b" }}>({reviews.toLocaleString()})</span>
    </div>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ type }) => {
  if (!type) return null;
  const cfg = {
    sale: { label: "SALE", cls: "badge-sale", color: "#fff" },
    featured: { label: "★ FEATURED", cls: "", style: { background: "#1a56db", color: "#fff" } },
    "low-stock": { label: "LOW STOCK", cls: "", style: { background: "#fef3c7", color: "#92400e" } },
  }[type];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: ".05em", padding: "3px 8px",
      borderRadius: 4, color: cfg.color, ...(cfg.style || {}),
    }} className={cfg.cls}>{cfg.label}</span>
  );
};

// ── Image Carousel ────────────────────────────────────────────────────────────
const ImageCarousel = ({ images, name }) => {
  const [idx, setIdx] = useState(0);
  const next = (e) => { e.stopPropagation(); setIdx(p => (p + 1) % images.length); };
  const prev = (e) => { e.stopPropagation(); setIdx(p => (p - 1 + images.length) % images.length); };
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "12px 12px 0 0", background: "#f8fafc" }}>
      <div className="carousel-wrap" style={{ aspectRatio: "1/1" }}>
        <div className="carousel-inner" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {images.map((src, i) => (
            <img key={i} src={src} alt={`${name} ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", flexShrink: 0 }} loading="lazy"/>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <button onClick={prev} style={{
            position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,.9)", border: "none", borderRadius: "50%",
            width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,.15)", transition: "opacity .15s",
          }}>‹</button>
          <button onClick={next} style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,.9)", border: "none", borderRadius: "50%",
            width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,.15)",
          }}>›</button>
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} style={{
                width: i === idx ? 16 : 6, height: 6, borderRadius: 3, border: "none",
                background: i === idx ? "#1a56db" : "rgba(255,255,255,.7)", cursor: "pointer", transition: "all .2s",
              }}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
    {toasts.map(t => (
      <div key={t.id} className="toast" style={{
        background: t.type === "cart" ? "#1a56db" : "#7c3aed",
        color: "#fff", padding: "12px 20px", borderRadius: 12,
        fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.18)",
        display: "flex", alignItems: "center", gap: 10, minWidth: 240,
      }}>
        <span style={{ fontSize: 18 }}>{t.type === "cart" ? "🛒" : "❤️"}</span>
        {t.message}
      </div>
    ))}
  </div>
);

// ── Product Card (Grid) ───────────────────────────────────────────────────────
const ProductCard = ({ product, cart, wishlist, onCart, onWishlist, onProductClick, style }) => {
  const inCart = cart.has(product.id);
  const inWish = wishlist.has(product.id);
  const [wishAnim, setWishAnim] = useState(false);

  const handleWish = (e) => {
    e.stopPropagation();
    onWishlist(product);
    setWishAnim(true);
    setTimeout(() => setWishAnim(false), 400);
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking wishlist button
    if (e.target.closest('button')) return;
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  return (
    <div className="product-card fade-up" onClick={handleCardClick} style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,.07)", display: "flex", flexDirection: "column",
      cursor: "pointer", position: "relative", ...style,
    }}>
      {/* Badges */}
      {(product.badge || product.isNew) && (
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {product.badge && <Badge type={product.badge}/>}
          {product.isNew && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".05em", padding: "3px 8px",
              borderRadius: 4, background: "#ecfdf5", color: "#065f46" }}>NEW</span>
          )}
        </div>
      )}

      {/* Wishlist button */}
      <button onClick={handleWish} className={wishAnim ? "heart-pop" : ""} style={{
        position: "absolute", top: 12, right: 12, zIndex: 2,
        background: inWish ? "#fef2f2" : "rgba(255,255,255,.9)",
        border: "none", borderRadius: "50%", width: 34, height: 34,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,.12)", transition: "background .2s",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={inWish ? "#ef4444" : "none"}
          stroke={inWish ? "#ef4444" : "#94a3b8"} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <ImageCarousel images={product.images} name={product.name}/>

      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {/* Category tag */}
        <span style={{ fontSize: 11, fontWeight: 600, color: "#1a56db", textTransform: "uppercase", letterSpacing: ".06em" }}>
          {product.category}
        </span>

        {/* Name */}
        <p className="line-clamp-2 font-sans" style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.4, margin: 0 }}>
          {product.name}
        </p>

        {/* Rating */}
        <StarRating rating={product.rating} reviews={product.reviews}/>

        {/* Seller */}
        <a href={`/shop/${product.sellerShopSlug || product.sellerId}`} onClick={e => e.stopPropagation()} style={{
          fontSize: 12, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", width: "fit-content",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#1a56db"}
          onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Visit Shop
          <span style={{ color: "#94a3b8" }}>{product.seller}</span>
        </a>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through" }}>${product.originalPrice.toFixed(2)}</span>
          )}
          {product.originalPrice && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "#fef2f2", padding: "2px 6px", borderRadius: 4 }}>
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button onClick={(e) => { e.stopPropagation(); onCart(product); }} style={{
          marginTop: 4, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600, transition: "all .2s",
          background: inCart ? "#ecfdf5" : "#1a56db",
          color: inCart ? "#065f46" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
          onMouseEnter={e => { if (!inCart) e.currentTarget.style.background = "#1e40af"; }}
          onMouseLeave={e => { if (!inCart) e.currentTarget.style.background = "#1a56db"; }}>
          {inCart ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Product Row (List) ────────────────────────────────────────────────────────
const ProductRow = ({ product, cart, wishlist, onCart, onWishlist, onProductClick }) => {
  const inCart = cart.has(product.id);
  const inWish = wishlist.has(product.id);
  
  const handleRowClick = (e) => {
    // Don't navigate if clicking buttons or seller link
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (onProductClick) {
      onProductClick(product.id);
    }
  };
  
  return (
    <div className="list-row" onClick={handleRowClick} style={{
      display: "flex", gap: 20, background: "#fff", borderRadius: 16,
      overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.06)", cursor: "pointer", padding: 0,
    }}>
      <div style={{ width: 160, minWidth: 160, position: "relative" }}>
        <img src={product.images[0]} alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy"/>
        {product.badge && (
          <div style={{ position: "absolute", top: 10, left: 10 }}><Badge type={product.badge}/></div>
        )}
      </div>
      <div style={{ flex: 1, padding: "18px 18px 18px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1a56db", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {product.category}
            </span>
            <p className="font-sans" style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: "4px 0 0", lineHeight: 1.35 }}>
              {product.name}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", textAlign: "right" }}>${product.price.toFixed(2)}</div>
              {product.originalPrice && (
                <div style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through", textAlign: "right" }}>${product.originalPrice.toFixed(2)}</div>
              )}
            </div>
          </div>
        </div>

        <StarRating rating={product.rating} reviews={product.reviews}/>

        <a href={`/shop/${product.sellerShopSlug || product.sellerId}`} onClick={e => e.stopPropagation()} style={{
          fontSize: 12, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, width: "fit-content",
          padding: "6px 10px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#1a56db"}
          onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Visit Shop
          <span style={{ color: "#94a3b8" }}>{product.seller}</span>
        </a>

        <div style={{ marginTop: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={(e) => { e.stopPropagation(); onCart(product); }} style={{
            padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, transition: "all .2s",
            background: inCart ? "#ecfdf5" : "#1a56db", color: inCart ? "#065f46" : "#fff",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {inCart ? "✓ Added" : "Add to Cart"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onWishlist(product); }} style={{
            padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${inWish ? "#ef4444" : "#e2e8f0"}`,
            background: inWish ? "#fef2f2" : "#fff", cursor: "pointer", transition: "all .2s",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={inWish ? "#ef4444" : "none"}
              stroke={inWish ? "#ef4444" : "#94a3b8"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Filter Panel ──────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, onChange, onClear, mobile, onClose, categories = [] }) => {
  const { categoryId, maxPrice } = filters;

  return (
    <div style={{
      background: "#fff", borderRadius: mobile ? 0 : 16,
      boxShadow: mobile ? "none" : "0 2px 12px rgba(0,0,0,.07)",
      padding: 24, display: "flex", flexDirection: "column", gap: 24,
      height: mobile ? "100%" : "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="font-serif" style={{ fontSize: 20, margin: 0, color: "#0f172a" }}>Filters</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClear} style={{ fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "DM Sans" }}>
            Clear all
          </button>
          {mobile && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#64748b" }}>✕</button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 12px" }}>Category</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button onClick={() => onChange("categoryId", null)} style={{
            textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none",
            cursor: "pointer", fontSize: 14, fontWeight: categoryId === null ? 600 : 400,
            transition: "all .15s", fontFamily: "DM Sans",
            background: categoryId === null ? "#eff6ff" : "transparent",
            color: categoryId === null ? "#1a56db" : "#374151",
          }}>
            All Categories
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => onChange("categoryId", cat.id)} style={{
              textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: categoryId === cat.id ? 600 : 400,
              transition: "all .15s", fontFamily: "DM Sans",
              background: categoryId === cat.id ? "#eff6ff" : "transparent",
              color: categoryId === cat.id ? "#1a56db" : "#374151",
            }}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 12px" }}>Price Range</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["Min BDT", "minPrice"], ["Max BDT", "maxPrice"]].map(([label, key]) => (
            <label key={key} style={{ flex: 1 }}>
              <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</span>
              <input type="number" placeholder="0" value={filters[key] === 0 ? "" : filters[key]} 
                onChange={e => onChange(key, e.target.value === "" ? 0 : Number(e.target.value))}
                style={{
                  width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0",
                  borderRadius: 8, fontSize: 14, fontFamily: "DM Sans", color: "#0f172a",
                  outline: "none", transition: "border-color .15s",
                }}
                onFocus={e => e.target.style.borderColor = "#1a56db"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </label>
          ))}
        </div>
        <input type="range" className="price-slider" min={0} max={10000000}
          value={maxPrice} onChange={e => onChange("maxPrice", Number(e.target.value))}/>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
          <span>৳0</span><span>৳1,00,00,000</span>
        </div>
      </div>

      {/* In Stock Only */}
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ position: "relative", width: 40, height: 22 }}>
          <input type="checkbox" checked={filters.inStockOnly} onChange={e => onChange("inStockOnly", e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}/>
          <div style={{
            position: "absolute", inset: 0, borderRadius: 11, transition: "background .2s",
            background: filters.inStockOnly ? "#1a56db" : "#e2e8f0",
          }}>
            <div style={{
              position: "absolute", top: 3, left: filters.inStockOnly ? 21 : 3, width: 16, height: 16,
              borderRadius: "50%", background: "#fff", transition: "left .2s",
              boxShadow: "0 1px 3px rgba(0,0,0,.2)",
            }}/>
          </div>
        </div>
        <span style={{ fontSize: 14, color: "#374151" }}>In stock only</span>
      </label>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ current, total, onChange }) => {
  const pages = [];
  const delta = 2;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
      <button onClick={() => onChange(current - 1)} disabled={current === 1} style={{
        padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0",
        background: "#fff", cursor: current === 1 ? "not-allowed" : "pointer",
        color: current === 1 ? "#cbd5e1" : "#374151", fontSize: 14, fontFamily: "DM Sans",
        transition: "all .15s",
      }}>← Prev</button>

      {pages.map((p, i) => (
        <button key={i} onClick={() => typeof p === "number" && onChange(p)} disabled={p === "…"} style={{
          width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${p === current ? "#1a56db" : "#e2e8f0"}`,
          background: p === current ? "#1a56db" : "#fff",
          color: p === current ? "#fff" : p === "…" ? "#94a3b8" : "#374151",
          cursor: p === "…" ? "default" : "pointer", fontSize: 14, fontWeight: p === current ? 700 : 400,
          fontFamily: "DM Sans", transition: "all .15s",
        }}>{p}</button>
      ))}

      <button onClick={() => onChange(current + 1)} disabled={current === total} style={{
        padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0",
        background: "#fff", cursor: current === total ? "not-allowed" : "pointer",
        color: current === total ? "#cbd5e1" : "#374151", fontSize: 14, fontFamily: "DM Sans",
        transition: "all .15s",
      }}>Next →</button>
    </div>
  );
};

// ── All Products Page ─────────────────────────────────────────────────────────
export default function AllProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ categoryId: null, minPrice: 0, maxPrice: 10000000, inStockOnly: false });
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState(new Set());
  const [wishlist, setWishlist] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const PER_PAGE = 12;
  const toastRef = useRef(0);

  // ── Fetch Categories on Mount ────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // ── Fetch Products When Filters/Search Change ────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (search) params.search = search;
        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.minPrice > 0) params.minPrice = filters.minPrice;
        if (filters.maxPrice < 10000000) params.maxPrice = filters.maxPrice;

        const data = await getProducts(params);
        const mappedProducts = (Array.isArray(data) ? data : []).map(mapProductDTO);
        setProducts(mappedProducts);
        setPage(1);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300); // Debounce
    return () => clearTimeout(timer);
  }, [search, filters]);

  const addToast = (message, type) => {
    const id = ++toastRef.current;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800);
  };

  const handleCart = useCallback((product) => {
    setCart(prev => {
      const next = new Set(prev);
      if (next.has(product.id)) { next.delete(product.id); addToast("Removed from cart", "cart"); }
      else { next.add(product.id); addToast(`${product.name.slice(0, 28)}… added to cart`, "cart"); }
      return next;
    });
  }, []);

  const handleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(product.id)) { next.delete(product.id); addToast("Removed from wishlist", "wish"); }
      else { next.add(product.id); addToast(`Saved to wishlist ❤️`, "wish"); }
      return next;
    });
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const updateFilter = (key, val) => { setFilters(p => ({ ...p, [key]: val })); setPage(1); };
  const clearFilters = () => { setFilters({ categoryId: null, minPrice: 0, maxPrice: 10000000, inStockOnly: false }); setSearch(""); setPage(1); };

  // Filter & sort (API already filters by category, price, search)
  const filtered = products.filter(p => {
    if (filters.inStockOnly && !p.inStock) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [search, filters, sort]);

  const activeFiltersCount = [
    filters.categoryId !== null, filters.minPrice > 0, filters.maxPrice < 500, filters.inStockOnly, search.length > 0,
  ].filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "DM Sans, sans-serif" }}>
      <FontLoader/>
      <ToastContainer toasts={toasts}/>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
          <div onClick={() => setMobileSidebar(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)" }}/>
          <div className="sidebar-slide" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 300, background: "#fff", overflow: "auto" }}>
            <FilterPanel filters={filters} onChange={updateFilter} onClear={clearFilters} mobile onClose={() => setMobileSidebar(false)} categories={categories}/>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: 34, margin: 0, color: "#0f172a", lineHeight: 1.1 }}>All Products</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
              {loading ? "Loading..." : `${filtered.length.toLocaleString()} products found`}
              {filters.categoryId && categories.length > 0 && ` in ${categories.find(c => c.id === filters.categoryId)?.name || "selected category"}`}
            </p>
          </div>

          {/* Header actions */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="search-box" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                style={{
                  paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                  border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontFamily: "DM Sans",
                  color: "#0f172a", background: "#fff", width: 240, transition: "border-color .15s",
                }}
                onFocus={e => e.target.style.borderColor = "#1a56db"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16 }}>✕</button>
              )}
            </div>

            <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
              {[["grid", "⊞"], ["list", "☰"]].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "9px 13px", border: "none", cursor: "pointer", fontSize: 15,
                  background: view === v ? "#eff6ff" : "#fff", color: view === v ? "#1a56db" : "#94a3b8",
                  transition: "all .15s",
                }}>{icon}</button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{
                padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10,
                fontSize: 13, fontFamily: "DM Sans", color: "#0f172a", background: "#fff", cursor: "pointer",
                outline: "none",
              }}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button onClick={() => setMobileSidebar(true)} style={{
              display: "none",
              padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10,
              background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans",
              color: "#374151", alignItems: "center", gap: 6,
            }} className="mobile-filter-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px 48px", display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Sidebar */}
        <div style={{ width: 260, minWidth: 260, position: "sticky", top: 24 }}>
          <FilterPanel filters={filters} onChange={updateFilter} onClear={clearFilters} categories={categories}/>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Active filters */}
          {(activeFiltersCount > 0) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {search && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#eff6ff", color: "#1a56db", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                  🔍 "{search}"
                  <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a56db", fontSize: 14, padding: 0 }}>✕</button>
                </span>
              )}
              {filters.categoryId && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#eff6ff", color: "#1a56db", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                  {categories.find(c => c.id === filters.categoryId)?.name}
                  <button onClick={() => updateFilter("categoryId", null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a56db", fontSize: 14, padding: 0 }}>✕</button>
                </span>
              )}
              {(filters.minPrice > 0 || filters.maxPrice < 500) && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#eff6ff", color: "#1a56db", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                  ${filters.minPrice}–${filters.maxPrice}
                  <button onClick={() => { updateFilter("minPrice", 0); updateFilter("maxPrice", 500); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a56db", fontSize: 14, padding: 0 }}>✕</button>
                </span>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <p style={{ color: "#991b1b", fontSize: 14, margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.07)", height: 320 }}>
                  <div style={{ width: "100%", height: 200, background: "#f0f0f0", animation: "pulse 2s infinite" }}/>
                  <div style={{ padding: 16, gap: 8, display: "flex", flexDirection: "column" }}>
                    <div style={{ height: 12, background: "#f0f0f0", borderRadius: 4, animation: "pulse 2s infinite" }}/>
                    <div style={{ height: 16, background: "#f0f0f0", borderRadius: 4, width: "80%", animation: "pulse 2s infinite" }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Grid / List */}
          {!loading && paginated.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
              <h3 className="font-serif" style={{ fontSize: 26, color: "#0f172a", margin: "0 0 10px" }}>No products found</h3>
              <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 24px" }}>Try adjusting your filters or search term</p>
              <button onClick={clearFilters} style={{
                padding: "11px 28px", background: "#1a56db", color: "#fff", border: "none",
                borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "DM Sans",
              }}>Clear all filters</button>
            </div>
          ) : !loading && view === "grid" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}>
              {paginated.map((p, i) => (
                <ProductCard key={p.id} product={p} cart={cart} wishlist={wishlist}
                  onCart={handleCart} onWishlist={handleWishlist} onProductClick={handleProductClick}
                  style={{ animationDelay: `${i * 40}ms` }}
                />
              ))}
            </div>
          ) : !loading && view === "list" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {paginated.map(p => (
                <ProductRow key={p.id} product={p} cart={cart} wishlist={wishlist}
                  onCart={handleCart} onWishlist={handleWishlist} onProductClick={handleProductClick}/>
              ))}
            </div>
          ) : null}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ marginTop: 40 }}>
              <Pagination current={page} total={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}/>
              <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 12 }}>
                Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, sorted.length)} of {sorted.length} products
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart / Wishlist status bar */}
      {(cart.size > 0 || wishlist.size > 0) && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#fff", borderTop: "1px solid #f1f5f9",
          padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 24, boxShadow: "0 -4px 16px rgba(0,0,0,.06)", zIndex: 100,
        }}>
          <span style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "#1a56db", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{cart.size}</span>
            items in cart
          </span>
          {wishlist.size > 0 && (
            <span style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: "#fef2f2", color: "#ef4444", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{wishlist.size}</span>
              saved to wishlist
            </span>
          )}
          <button style={{
            padding: "8px 22px", background: "#1a56db", color: "#fff", border: "none",
            borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans",
          }}>View Cart →</button>
        </div>
      )}
    </div>
  );
}