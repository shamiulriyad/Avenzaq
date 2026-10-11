import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../services/productService";
import { formatVariant } from "../../services/variantService";
import { getImageUrl } from "../../services/imageUploadService";
import { addItem as addCartItem } from "../../services/cartService";



// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --primary: #1a56db;
      --primary-light: #e8f0fd;
      --success: #0e9f6e;
      --warning: #f59e0b;
      --danger: #e53e3e;
      --text: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
      --bg: #f8fafc;
    }

    .pdp-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
    .pdp-serif { font-family: 'Instrument Serif', serif !important; font-weight: 400; }

    @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    .pdp-fade    { animation: fadeInUp 0.4s ease both; }
    .pdp-spinner { animation: spin 0.8s linear infinite; display:inline-block; }

    /* hide number arrows */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
    input[type=number] { -moz-appearance:textfield; }

    /* hide scrollbar */
    .no-sb { scrollbar-width:none; }
    .no-sb::-webkit-scrollbar { display:none; }

    /* pill badge */
    .pdp-pill {
      display:inline-flex; align-items:center; gap:4px;
      padding:3px 10px; border-radius:999px;
      font-size:.71rem; font-weight:600; letter-spacing:.03em; white-space:nowrap;
    }

    /* star colours */
    .s-on  { color:#f59e0b; }
    .s-off { color:#d1d5db; }

    /* two-column layout */
    .pdp-grid {
      display:grid;
      grid-template-columns: 1fr;
      gap:32px;
      align-items:start;
    }
    @media(min-width:1024px){
      .pdp-grid { grid-template-columns:1fr 1fr; }
    }

    /* ── quantity stepper — always horizontal ── */
    .qty-wrap {
      display:inline-flex !important;
      flex-direction:row !important;
      align-items:stretch;
      border:1px solid var(--border);
      border-radius:12px;
      overflow:hidden;
      height:42px;
      flex-shrink:0;
    }
    .qty-btn {
      width:42px; height:42px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-size:1.3rem; line-height:1;
      background:#fff; border:none; cursor:pointer; color:var(--text);
      transition:background .15s;
    }
    .qty-btn:hover  { background:#f3f4f6; }
    .qty-btn:active { background:#e5e7eb; }
    .qty-input {
      width:46px; height:42px; flex-shrink:0;
      text-align:center; font-size:.95rem; font-weight:600;
      background:#fff; color:var(--text);
      border:none; border-left:1px solid var(--border); border-right:1px solid var(--border);
      outline:none; font-family:'DM Sans',sans-serif;
    }

    /* CTA row — always horizontal */
    .cta-row {
      display:flex !important;
      flex-direction:row !important;
      align-items:stretch;
      gap:10px;
    }

    /* shipping grid */
    .ship-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    @media(min-width:640px){ .ship-grid { grid-template-columns:repeat(4,1fr); } }

    /* thumb strip — always horizontal */
    .thumb-strip {
      display:flex !important;
      flex-direction:row !important;
      gap:8px;
      overflow-x:auto;
      padding-bottom:4px;
    }
    .thumb-btn {
      flex-shrink:0; width:62px; height:62px;
      border-radius:12px; overflow:hidden; padding:0;
      border:2px solid transparent; cursor:pointer; background:none;
      transition:transform .15s, border-color .15s, opacity .15s;
    }
    .thumb-btn:hover { transform:scale(1.06); opacity:1 !important; }
    .thumb-btn.t-active { border-color:var(--primary); box-shadow:0 2px 8px rgba(26,86,219,.25); }

    /* related card */
    .rel-card {
      flex-shrink:0; width:220px;
      background:#fff; border-radius:16px; overflow:hidden;
      border:1px solid var(--border);
      transition:box-shadow .2s, transform .2s;
      cursor:pointer;
    }
    .rel-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.1); transform:translateY(-3px); }
    .rel-img { transition:transform .3s; }
    .rel-card:hover .rel-img { transform:scale(1.05); }

    /* tab button */
    .tab-btn {
      padding:12px 20px; font-size:.875rem; font-weight:500;
      border:none; border-bottom:2px solid transparent; margin-bottom:-1px;
      background:none; cursor:pointer; color:var(--muted);
      transition:color .15s, border-color .15s;
      font-family:'DM Sans',sans-serif; white-space:nowrap;
    }
    .tab-btn.t-active { color:var(--primary); border-bottom-color:var(--primary); }

    /* add-to-cart btn */
    .btn-cart {
      flex:1; height:48px; border-radius:12px;
      font-weight:600; font-size:.875rem;
      display:flex; align-items:center; justify-content:center; gap:8px;
      border:none; cursor:pointer; color:#fff;
      font-family:'DM Sans',sans-serif;
      transition:opacity .15s, transform .1s;
    }
    .btn-cart:hover  { opacity:.9; }
    .btn-cart:active { transform:scale(.97); }
    .btn-cart:disabled { opacity:.6; cursor:not-allowed; }

    /* wishlist btn */
    .btn-wish {
      width:48px; height:48px; flex-shrink:0; border-radius:12px;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; font-size:1.3rem;
      border:2px solid var(--border); background:#fff;
      transition:transform .15s, border-color .15s, background .15s;
    }
    .btn-wish:hover  { transform:scale(1.1); }
    .btn-wish.w-on   { border-color:#e53e3e; background:#fff5f5; color:#e53e3e; }

    /* outline buy-now */
    .btn-outline {
      width:100%; height:48px; border-radius:12px;
      font-weight:600; font-size:.875rem;
      border:2px solid var(--primary); color:var(--primary); background:#fff;
      cursor:pointer; font-family:'DM Sans',sans-serif;
      transition:opacity .15s, transform .1s;
    }
    .btn-outline:hover  { opacity:.85; }
    .btn-outline:active { transform:scale(.97); }

    /* card surface */
    .pdp-card {
      background:#fff; border-radius:16px;
      border:1px solid var(--border); box-shadow:0 1px 4px rgba(0,0,0,.05);
    }

    /* review card */
    .rev-card {
      background:#fff; border-radius:16px; padding:20px;
      border:1px solid var(--border); box-shadow:0 1px 4px rgba(0,0,0,.04);
    }

    /* toast */
    .pdp-toast {
      position:fixed; top:20px; right:20px; z-index:9999;
      display:flex; align-items:center; gap:12px;
      padding:12px 16px; border-radius:12px; color:#fff;
      font-size:.875rem; font-weight:500;
      box-shadow:0 8px 24px rgba(0,0,0,.18); max-width:320px;
      animation:fadeInUp .3s ease both;
      font-family:'DM Sans',sans-serif;
    }

    /* spec stripes */
    .spec-row:nth-child(odd)  { background:#f9fafb; }
    .spec-row:nth-child(even) { background:#fff; }

    /* reviews two-col */
    .rev-grid {
      display:grid;
      grid-template-columns:1fr;
      gap:28px;
    }
    @media(min-width:1024px){
      .rev-grid { grid-template-columns:320px 1fr; }
    }
  `}</style>
);

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const Stars = ({ rating, size = "sm", interactive = false, onChange }) => {
  const [hover, setHover] = useState(0);
  const sz = size === "sm" ? ".85rem" : size === "md" ? "1.05rem" : "1.5rem";
  const active = interactive ? hover || rating : rating;
  return (
    <span style={{ display:"inline-flex", gap:"2px" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          className={active >= s ? "s-on" : "s-off"}
          style={{ fontSize:sz, cursor:interactive?"pointer":"default", userSelect:"none",
            display:"inline-block", transition:"transform .1s" }}
          onMouseEnter={e => { if(interactive){ setHover(s); e.currentTarget.style.transform="scale(1.25)"; }}}
          onMouseLeave={e => { if(interactive){ setHover(0); e.currentTarget.style.transform="scale(1)"; }}}
          onClick={() => interactive && onChange?.(s)}
        >★</span>
      ))}
    </span>
  );
};

const Pill = ({ children, color, bg }) => (
  <span className="pdp-pill" style={{ color, background:bg }}>{children}</span>
);

// ─── IMAGE CAROUSEL ────────────────────────────────────────────────────────────
const ProductImageCarousel = ({ images = [] }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mouse, setMouse] = useState({ x:50, y:50 });

  // Filter out empty strings and ensure at least one image
  const validImages = images?.filter(img => img?.trim?.() || img) || [];
  const safeImages = validImages.length > 0 ? validImages : ["https://via.placeholder.com/600?text=No+Image&bg=f0f0f0&tc=999"];

  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    setMouse({ x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100 });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px", width:"100%" }}>
      {/* Main image */}
      <div
        style={{ position:"relative", width:"100%", aspectRatio:"1/1", borderRadius:"20px",
          overflow:"hidden", background:"#fff", border:"1px solid var(--border)",
          boxShadow:"0 4px 20px rgba(0,0,0,.08)", cursor:zoomed?"zoom-out":"zoom-in" }}
        onMouseMove={onMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <img src={safeImages[active]} alt="Product" draggable={false}
          style={{ width:"100%", height:"100%", objectFit:"cover",
            transform: zoomed ? `scale(1.75)` : "scale(1)",
            transformOrigin:`${mouse.x}% ${mouse.y}%`,
            transition:"transform .25s ease", userSelect:"none" }}
        />
        {safeImages.length > 1 && <>
          <button onClick={() => setActive(a=>(a-1+safeImages.length)%safeImages.length)} style={arrowSt("left")}>‹</button>
          <button onClick={() => setActive(a=>(a+1)%safeImages.length)} style={arrowSt("right")}>›</button>
        </>}
        {safeImages.length > 1 && (
          <div style={{ position:"absolute", bottom:"12px", left:"50%", transform:"translateX(-50%)",
            display:"flex", gap:"6px" }}>
            {safeImages.map((_,i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                width: i===active?"18px":"8px", height:"8px", borderRadius:"99px",
                border:"none", cursor:"pointer", padding:0,
                background: i===active?"var(--primary)":"rgba(0,0,0,.25)",
                transition:"all .2s",
              }} />
            ))}
          </div>
        )}
        <div style={{ position:"absolute", top:"10px", right:"10px", background:"rgba(255,255,255,.85)",
          borderRadius:"8px", padding:"4px 8px", fontSize:".7rem", color:"#6b7280",
          pointerEvents:"none", userSelect:"none" }}>🔍 Hover to zoom</div>
      </div>

      {/* Thumbs — always row */}
      <div className="thumb-strip no-sb">
        {safeImages.map((img,i) => (
          <button key={i} className={`thumb-btn ${i===active?"t-active":""}`}
            onClick={() => setActive(i)} style={{ opacity:i===active?1:.6 }}>
            <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </button>
        ))}
      </div>
    </div>
  );
};

const arrowSt = side => ({
  position:"absolute", [side]:"10px", top:"50%", transform:"translateY(-50%)",
  width:"36px", height:"36px", borderRadius:"50%", background:"rgba(255,255,255,.9)",
  border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
  fontSize:"1.35rem", color:"#374151", zIndex:2, boxShadow:"0 2px 8px rgba(0,0,0,.15)",
  transition:"background .15s",
});

// ─── QTY SELECTOR ──────────────────────────────────────────────────────────────
const QuantitySelector = ({ value, onChange, max }) => (
  <div className="qty-wrap">
    <button className="qty-btn" onClick={() => onChange(Math.max(1, value-1))}>−</button>
    <input className="qty-input" type="number" min={1} max={max} value={value}
      onChange={e => onChange(Math.min(max, Math.max(1, parseInt(e.target.value)||1)))} />
    <button className="qty-btn" onClick={() => onChange(Math.min(max, value+1))}>+</button>
  </div>
);

// ─── ADD TO CART ───────────────────────────────────────────────────────────────
const AddToCartButton = ({ onClick, loading, added, disabled }) => (
  <button className="btn-cart" onClick={onClick} disabled={loading || disabled}
    style={{ background: added?"#0e9f6e":"var(--primary)",
      boxShadow: added?"0 4px 14px rgba(14,159,110,.35)":"0 4px 14px rgba(26,86,219,.35)" }}>
    {loading
      ? <svg className="pdp-spinner" style={{ width:18,height:18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/>
        </svg>
      : added ? "✓ Added to Cart"
      : <><CartIcon/> Add to Cart</>
    }
  </button>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

// ─── REVIEW CARD ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(review.helpful ?? 0);
  return (
    <div className="rev-card pdp-fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <img src={review.avatar} alt={review.name}
            style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
              <span style={{ fontWeight:600, fontSize:".875rem" }}>{review.name}</span>
              {review.verified && <span className="pdp-pill" style={{ color:"var(--success)", background:"#ecfdf5", fontSize:".67rem" }}>✓ Verified</span>}
            </div>
            <div style={{ fontSize:".75rem", color:"var(--muted)", marginTop:"2px" }}>{review.date}</div>
          </div>
        </div>
        <Stars rating={review.rating} size="sm" />
      </div>
      <div style={{ fontWeight:600, fontSize:".875rem", marginTop:"12px" }}>{review.title}</div>
      <p style={{ fontSize:".875rem", color:"var(--muted)", marginTop:"6px", lineHeight:1.65 }}>{review.body}</p>
      <button onClick={() => { setLiked(l=>!l); setCount(c=>liked?c-1:c+1); }}
        style={{ marginTop:"10px", display:"flex", alignItems:"center", gap:"6px",
          fontSize:".75rem", color:liked?"var(--primary)":"var(--muted)",
          background:"none", border:"none", cursor:"pointer", padding:0,
          fontFamily:"'DM Sans',sans-serif", transition:"color .15s" }}>
        👍 Helpful ({count})
      </button>
    </div>
  );
};

// ─── RELATED CAROUSEL ──────────────────────────────────────────────────────────
const RelatedProductsCarousel = ({ products }) => {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left:d*240, behavior:"smooth" });

  return (
    <div style={{ position:"relative", paddingLeft:"20px", paddingRight:"20px" }}>
      <button onClick={()=>scroll(-1)} style={carArrow("left")}>‹</button>
      <div ref={ref} className="no-sb"
        style={{ display:"flex", flexDirection:"row", gap:"16px", overflowX:"auto", paddingBottom:"8px" }}>
        {products.map(p => {
          // handle both p.image and p.images[]
          const img = p.image || (Array.isArray(p.images)?p.images[0]:null) || "https://via.placeholder.com/400?text=No+Image&bg=f0f0f0&tc=999";
          const salePrice = p.discount ?? p.discountedPrice ?? null;
          return (
            <div key={p.id} className="rel-card">
              <div style={{ width:"100%", height:"160px", overflow:"hidden" }}>
                <img src={img} alt={p.name} className="rel-img"
                  style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div style={{ padding:"12px" }}>
                <p style={{ fontWeight:500, fontSize:".85rem", lineHeight:1.35,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {p.name}
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:"4px", marginTop:"5px" }}>
                  <Stars rating={p.rating} size="sm"/>
                  <span style={{ fontSize:".72rem", color:"var(--muted)" }}>({p.reviews??p.reviewCount??0})</span>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:"6px", marginTop:"5px", flexWrap:"wrap" }}>
                  {salePrice && salePrice < p.price ? <>
                    <span style={{ fontWeight:700, fontSize:".875rem", color:"var(--primary)" }}>${salePrice.toFixed(2)}</span>
                    <span style={{ fontSize:".75rem", textDecoration:"line-through", color:"var(--muted)" }}>${p.price.toFixed(2)}</span>
                  </> : <span style={{ fontWeight:700, fontSize:".875rem" }}>${p.price.toFixed(2)}</span>}
                </div>
                <button style={{ marginTop:"8px", width:"100%", height:"32px", borderRadius:"8px",
                  background:"var(--primary-light)", color:"var(--primary)", border:"none",
                  cursor:"pointer", fontWeight:600, fontSize:".78rem",
                  fontFamily:"'DM Sans',sans-serif", transition:"opacity .15s" }}
                  onMouseOver={e=>e.currentTarget.style.opacity=".8"}
                  onMouseOut={e=>e.currentTarget.style.opacity="1"}
                >Add to Cart</button>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={()=>scroll(1)} style={carArrow("right")}>›</button>
    </div>
  );
};

const carArrow = side => ({
  position:"absolute", [side]:"-2px", top:"38%", transform:"translateY(-50%)", zIndex:2,
  width:"34px", height:"34px", borderRadius:"50%", background:"#fff",
  border:"1px solid var(--border)", cursor:"pointer", display:"flex",
  alignItems:"center", justifyContent:"center", fontSize:"1.3rem", color:"#374151",
  boxShadow:"0 2px 8px rgba(0,0,0,.1)", transition:"box-shadow .15s",
});

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [related, setRelated]   = useState([]);

  const [qty, setQty]                     = useState(1);
  const [cartLoading, setCartLoading]     = useState(false);
  const [cartAdded, setCartAdded]         = useState(false);
  const [wishlisted, setWishlisted]       = useState(false);
  const [activeTab, setActiveTab]         = useState("description");
  const [toast, setToast]                 = useState(null);
  const [reviewForm, setReviewForm]       = useState({ name:"", rating:0, title:"", body:"" });
  const [reviewSubmitting, setRSub]       = useState(false);
  const [copied, setCopied]               = useState(false);

  // Variant management
  const [variants, setVariants]           = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [sellers, setSellers]             = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // Parse ID - could be numeric (from mock) or GUID format
        const parsedId = id.includes('-') ? id : id;
        
        // Fetch from actual API
        const apiProduct = await getProductById(parsedId);
        
        const normalizedSellers = Array.isArray(apiProduct.sellers)
          ? apiProduct.sellers.map((sellerGroup) => ({
              id: sellerGroup.sellerId,
              sellerProductId: sellerGroup.sellerProductId,
              name: sellerGroup.shopName || "Unknown Seller",
              verified: sellerGroup.isVerified || false,
              rating: Number(sellerGroup.averageRating || 0),
              reviews: Number(sellerGroup.totalReviews || 0),
              shopSlug: sellerGroup.shopSlug || "",
              variants: Array.isArray(sellerGroup.variants)
                ? sellerGroup.variants.map(formatVariant).filter((v) => v.isActive !== false)
                : [],
            }))
          : [];

        const fallbackSeller = apiProduct.seller ? {
          id: apiProduct.sellerId,
          sellerProductId: null,
          name: apiProduct.seller.name || "Unknown Seller",
          verified: apiProduct.seller.isVerified || false,
          rating: Number(apiProduct.seller.averageRating || 0),
          reviews: Number(apiProduct.seller.totalReviews || 0),
          shopSlug: apiProduct.seller.shopSlug || apiProduct.sellerShopSlug || "",
          variants: [],
        } : null;

        const sellerList = normalizedSellers.length > 0
          ? normalizedSellers
          : (fallbackSeller ? [fallbackSeller] : []);

        const initialSeller = sellerList.find((s) => s.variants.some((v) => v.stock > 0))
          || sellerList[0]
          || null;

        const initialVariants = initialSeller?.variants || [];

        setSellers(sellerList);
        setSelectedSellerId(initialSeller?.id || "");
        setVariants(initialVariants);
        setSelectedVariant(initialVariants.find((v) => v.stock > 0) || initialVariants[0] || null);

        // Map API response to component's expected structure
        const product = {
          id: apiProduct.id,
          name: apiProduct.name,
          price: Number(apiProduct.finalPrice ?? apiProduct.price ?? 0),
          originalPrice: Number(apiProduct.finalPrice ?? apiProduct.price ?? 0) < Number(apiProduct.price ?? 0)
            ? Number(apiProduct.price ?? 0)
            : null,
          discountedPrice: Number(apiProduct.finalPrice ?? apiProduct.price ?? 0),
          discountPercent: apiProduct.discountType === "percentage" && apiProduct.discountValue
            ? Number(apiProduct.discountValue)
            : 0,
          discountLabel: apiProduct.discountLabel || "",
          category: apiProduct.categoryName || "General",
          stock: apiProduct.stockQty || 0,
          rating: apiProduct.averageRating || 0,
          reviewCount: apiProduct.reviewCount || 0,
          
          // Images from API - with fallback placeholder
          images: (apiProduct.images?.filter(img => img?.trim()))?.length 
            ? apiProduct.images.filter(img => img?.trim()).map((img) => getImageUrl(img))
            : (apiProduct.primaryImageUrl?.trim() ? [getImageUrl(apiProduct.primaryImageUrl)] : ["https://via.placeholder.com/600?text=No+Image&bg=f0f0f0&tc=999"]),
          
          // Description from API
          description: apiProduct.description || "<p>No description available</p>",
          
          // Seller information (active seller, multi-vendor aware)
          seller: initialSeller || {
            id: apiProduct.sellerId,
            name: apiProduct.seller?.name || "Unknown Seller",
            verified: apiProduct.seller?.isVerified || false,
            rating: Number(apiProduct.seller?.averageRating || 0),
            reviews: Number(apiProduct.seller?.totalReviews || 0),
            shopSlug: apiProduct.seller?.shopSlug || apiProduct.sellerShopSlug || "",
            variants: [],
          },
          
          sellerId: apiProduct.sellerId,
          categoryId: apiProduct.categoryId,
          
          // Empty defaults - avoid synthetic data
          badges: [],
          tags: [],
          specifications: [],
          ingredients: "",
          lowStockThreshold: 10,
          
          // Default shipping info
          shipping: {
            free: true,
            estimated: "2–5 days",
            express: "Next day +$5",
            returns: "14 days",
          },
        };
        
        setProduct(product);
        
        // Set reviews from API if available
        if (apiProduct.recentReviews?.length) {
          setReviews(apiProduct.recentReviews.map((r) => ({
            id: r.id,
            name: r.customerName || "Anonymous",
            avatar: `https://i.pravatar.cc/40?u=${r.customerName || r.id}`,
            rating: r.rating,
            title: `${r.rating} star${r.rating !== 1 ? 's' : ''} review`,
            date: new Date(r.createdAtUtc).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            verified: true,
            helpful: 0,
            body: r.comment || "",
          })));
        } else {
          setReviews([]); // No fallback to mock - just empty array
        }
        
        // Set related products (from same category)
        setRelated([]);  // Will be populated from another API call if implemented
        
      } catch (err) {
        console.error("Error loading product:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Update visible variants when seller changes
  useEffect(() => {
    if (!sellers.length) {
      setVariants([]);
      setSelectedVariant(null);
      return;
    }

    const selectedSeller = sellers.find((s) => s.id === selectedSellerId) || sellers[0];
    const sellerVariants = selectedSeller?.variants || [];

    setVariants(sellerVariants);
    setSelectedVariant((prev) =>
      sellerVariants.find((v) => v.id === prev?.id)
      || sellerVariants.find((v) => v.stock > 0)
      || sellerVariants[0]
      || null
    );
    setQty(1);
  }, [selectedSellerId, sellers]);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async () => {
    const selectedSeller = sellers.find((s) => s.id === selectedSellerId) || product.seller;
    if (!selectedSeller?.id) {
      showToast("Please select a seller", "error");
      return;
    }

    // Validate variant selection if variants exist
    if (variants.length > 0 && !selectedVariant) {
      showToast("Please select a variant before adding to cart", "error");
      return;
    }

    // Validate stock availability
    const availableStock = selectedVariant?.stock ?? product.stock;
    if (availableStock <= 0) {
      showToast("This product is out of stock", "error");
      return;
    }

    if (qty > availableStock) {
      showToast(`Only ${availableStock} item(s) available`, "error");
      return;
    }

    setCartLoading(true);
    try {
      await addCartItem({
        productId: product.id,
        sellerId: selectedSeller.id,
        variantId: selectedVariant?.id || null,
        quantity: qty,
      });

      const itemName = selectedVariant 
        ? `${product.name} (${selectedVariant.color || ''} ${selectedVariant.size || ''})`
        : product.name;
      showToast(`${qty} × ${itemName} from ${selectedSeller.name} added to cart!`, "success");
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 3500);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to add to cart. Please try again.", "error");
      console.error("Add to cart error:", err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = () => {
    setWishlisted(w => !w);
    showToast(wishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️", wishlisted?"info":"success");
  };

  const handleReview = async e => {
    e.preventDefault();
    if (!reviewForm.rating || !reviewForm.body.trim() || !reviewForm.name.trim()) return;
    setRSub(true);
    await new Promise(r => setTimeout(r, 900));
    setReviews(prev => [{
      id: Date.now(), name: reviewForm.name, rating: reviewForm.rating,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewForm.name)}&background=random&size=60`,
      title: reviewForm.title || "My review", body: reviewForm.body,
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      verified:false, helpful:0,
    }, ...prev]);
    setReviewForm({ name:"", rating:0, title:"", body:"" });
    setRSub(false);
    showToast("Review submitted — thank you!");
  };

  const handleShare = platform => {
    if (platform === "copy") {
      navigator.clipboard?.writeText(window.location.href).catch(()=>{});
      setCopied(true); setTimeout(()=>setCopied(false),2000);
      showToast("Link copied!");
    } else {
      const url = encodeURIComponent(window.location.href);
      const txt = encodeURIComponent(product?.name??"");
      const links = {
        twitter:`https://twitter.com/intent/tweet?text=${txt}&url=${url}`,
        facebook:`https://www.facebook.com/sharer/sharer.php?u=${url}`,
        whatsapp:`https://wa.me/?text=${txt}%20${url}`,
      };
      window.open(links[platform],"_blank","noopener");
    }
  };

  // ── Loading / error ──
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, border:"3px solid #e5e7eb", borderTopColor:"var(--primary)",
          borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ color:"var(--muted)", fontSize:".9rem" }}>Loading product…</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
      <div>
        <div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>😕</div>
        <h2 className="pdp-serif" style={{ fontSize:"1.5rem", marginBottom:"8px" }}>Product Not Found</h2>
        <p style={{ color:"var(--muted)", marginBottom:"20px" }}>{error}</p>
        <a href="/products" style={{ color:"var(--primary)", fontWeight:600, textDecoration:"none" }}>← Back to Products</a>
      </div>
    </div>
  );

  const activeSeller = sellers.find((s) => s.id === selectedSellerId) || product.seller;
  const sellerMinPrice = variants.length > 0
    ? Math.min(...variants.map((v) => Number(v.price || 0)).filter((price) => price > 0))
    : Number(product.price || 0);
  const activePrice = selectedVariant?.finalPrice ?? selectedVariant?.price ?? sellerMinPrice;
  const activeOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice ?? null;
  const activeStock = selectedVariant?.stock ?? product.stock;
  const activeDiscountedPrice = activePrice;
  const activeDiscountPercent = selectedVariant?.discountType === "percentage"
    ? Number(selectedVariant?.discountValue || 0)
    : 0;
  const isLowStock = activeStock > 0 && activeStock <= (product.lowStockThreshold ?? 10);
  const ratingBreakdown = [5,4,3,2,1].map(s => ({
    stars:s,
    count: reviews.filter(r=>r.rating===s).length,
    pct: reviews.length ? (reviews.filter(r=>r.rating===s).length / reviews.length)*100 : 0,
  }));

  return (
    <>
      <GlobalStyles />

      {/* Toast */}
      {toast && (
        <div className="pdp-toast" style={{
          background: toast.type==="success"?"var(--success)":toast.type==="info"?"var(--primary)":"#374151"
        }}>
          <span style={{ flex:1 }}>{toast.msg}</span>
          <button onClick={()=>setToast(null)}
            style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:"1.1rem", lineHeight:1, opacity:.75 }}>×</button>
        </div>
      )}

      <div className="pdp-root">
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 16px" }}>

          {/* Breadcrumb */}
          <nav style={{ display:"flex", alignItems:"center", gap:"6px", paddingTop:"24px", paddingBottom:"8px",
            fontSize:".78rem", color:"var(--muted)", flexWrap:"wrap" }}>
            {["Home", product.category, product.name].map((crumb,i,arr) => (
              <span key={i} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={i===arr.length-1
                  ? { color:"var(--text)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"200px" }
                  : { cursor:"pointer" }}
                  onMouseOver={e => i<arr.length-1 && (e.currentTarget.style.color="var(--primary)")}
                  onMouseOut={e => i<arr.length-1 && (e.currentTarget.style.color="var(--muted)")}
                >{crumb}</span>
                {i<arr.length-1 && <span style={{ opacity:.35 }}>/</span>}
              </span>
            ))}
          </nav>

          {/* ── TWO-COLUMN PRODUCT SECTION ── */}
          <div className="pdp-grid" style={{ paddingTop:"16px", paddingBottom:"32px" }}>

            {/* LEFT — image carousel */}
            <div className="pdp-fade" style={{ animationDelay:"0ms" }}>
              <ProductImageCarousel images={selectedVariant?.images?.length ? selectedVariant.images : product.images} />
            </div>

            {/* RIGHT — product info */}
            <div className="pdp-fade" style={{ animationDelay:"60ms", display:"flex", flexDirection:"column", gap:"16px" }}>

              {/* Badges */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", alignItems:"center" }}>
                {product.badges.map(b => <Pill key={b.label} {...b} />)}
                <Pill
                  color={activeStock>0?"var(--success)":"var(--danger)"}
                  bg={activeStock>0?"#ecfdf5":"#fef2f2"}
                >{activeStock>0?"● In Stock":"✕ Out of Stock"}</Pill>
              </div>

              {/* Title */}
              <div>
                <h1 className="pdp-serif" style={{ fontSize:"clamp(1.4rem,3vw,2rem)", lineHeight:1.25, color:"var(--text)" }}>
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                <Stars rating={product.rating} size="md"/>
                <span style={{ fontWeight:600, fontSize:".875rem" }}>{product.rating}</span>
                <span style={{ fontSize:".875rem", color:"var(--muted)" }}>({product.reviewCount} reviews)</span>
                <button onClick={()=>setActiveTab("reviews")}
                  style={{ fontSize:".875rem", color:"var(--primary)", background:"none", border:"none",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", padding:0 }}>See all →</button>
              </div>

              {/* Price */}
              <div style={{ display:"flex", alignItems:"baseline", gap:"10px", flexWrap:"wrap" }}>
                <span style={{ fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:700, color:"var(--primary)" }}>
                  ${activeDiscountedPrice.toFixed(2)}
                </span>
                {activeOriginalPrice && activeOriginalPrice > activeDiscountedPrice && (
                  <span style={{ fontSize:"1rem", textDecoration:"line-through", color:"var(--muted)", fontWeight:300 }}>
                    ${activeOriginalPrice.toFixed(2)}
                  </span>
                )}
                {activeDiscountPercent > 0 && (
                  <span className="pdp-pill" style={{ color:"#fff", background:"var(--danger)", fontSize:".74rem" }}>
                    −{activeDiscountPercent}% OFF
                  </span>
                )}
                {!activeDiscountPercent && selectedVariant?.discountLabel ? (
                  <span className="pdp-pill" style={{ color:"#fff", background:"var(--danger)", fontSize:".74rem" }}>
                    {selectedVariant.discountLabel}
                  </span>
                ) : null}
              </div>

              {/* Low stock */}
              {isLowStock && (
                <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 16px",
                  borderRadius:"12px", background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa",
                  fontSize:".875rem", fontWeight:500 }}>
                  ⚡ Only <strong style={{ marginLeft:3 }}>{activeStock} left</strong> — order soon!
                </div>
              )}

              {/* Seller Selector */}
              {sellers.length > 0 && (
                <div style={{ padding:"14px 16px", borderRadius:"14px", background:"#f9fafb", border:"1px solid var(--border)" }}>
                  <div style={{ fontSize:".875rem", fontWeight:600, color:"var(--text)", marginBottom:"10px" }}>
                    Choose Seller ({sellers.length})
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                    {sellers.map((seller) => {
                      const isSelected = (selectedSellerId || activeSeller?.id) === seller.id;
                      const sellerStock = seller.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
                      return (
                        <button
                          key={seller.id}
                          onClick={() => setSelectedSellerId(seller.id)}
                          style={{
                            padding:"10px 14px",
                            borderRadius:"8px",
                            border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                            background: isSelected ? "#e0e7ff" : "#fff",
                            color: isSelected ? "var(--primary)" : "var(--text)",
                            cursor:"pointer",
                            fontSize:".82rem",
                            fontWeight: isSelected ? 600 : 500,
                            fontFamily:"'DM Sans',sans-serif",
                            transition:"all .15s",
                            display:"flex",
                            alignItems:"center",
                            gap:"6px",
                          }}
                        >
                          <span>{seller.name}</span>
                          {seller.verified && <span style={{ fontSize:".75rem" }}>✓</span>}
                          <span style={{ color:"var(--muted)", fontSize:".75rem" }}>({sellerStock})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div style={{ padding:"14px 16px", borderRadius:"14px", background:"#f9fafb", border:"1px solid var(--border)" }}>
                  <div style={{ marginBottom:"12px" }}>
                    <label style={{ fontSize:".875rem", fontWeight:600, color:"var(--text)", display:"block", marginBottom:"8px" }}>
                      Choose Variant ({variants.length}):
                    </label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            padding:"10px 14px",
                            borderRadius:"8px",
                            border: selectedVariant?.id === v.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                            background: selectedVariant?.id === v.id ? "#e0e7ff" : "#fff",
                            color: selectedVariant?.id === v.id ? "var(--primary)" : "var(--text)",
                            cursor:"pointer",
                            fontSize:".85rem",
                            fontWeight: selectedVariant?.id === v.id ? 600 : 500,
                            fontFamily:"'DM Sans',sans-serif",
                            transition:"all .15s",
                            whiteSpace:"nowrap"
                          }}
                          onMouseOver={e=>{
                            if(selectedVariant?.id !== v.id) {
                              e.currentTarget.style.borderColor="var(--primary)";
                              e.currentTarget.style.background="#f3f4f6";
                            }
                          }}
                          onMouseOut={e=>{
                            if(selectedVariant?.id !== v.id) {
                              e.currentTarget.style.borderColor="var(--border)";
                              e.currentTarget.style.background="#fff";
                            }
                          }}
                        >
                          {v.color && v.size ? `${v.color} / ${v.size}` : v.color || v.size || `Variant ${v.id.slice(0,8)}`}
                          {v.stock === 0 ? " · Out" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Variant Details */}
                  {selectedVariant && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", fontSize:".875rem", marginTop:"12px" }}>
                      <div>
                        <span style={{ color:"var(--muted)", fontWeight:500 }}>Price: </span>
                        <span style={{ fontWeight:700, color:"var(--primary)" }}>৳{Number((selectedVariant.finalPrice ?? selectedVariant.price) || 0).toLocaleString()}</span>
                      </div>
                      {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.finalPrice && (
                        <div>
                          <span style={{ color:"var(--muted)", fontWeight:500 }}>Original: </span>
                          <span style={{ fontWeight:700, color:"var(--muted)", textDecoration:"line-through" }}>৳{Number(selectedVariant.originalPrice).toLocaleString()}</span>
                        </div>
                      )}
                      <div>
                        <span style={{ color:"var(--muted)", fontWeight:500 }}>Stock: </span>
                        <span style={{ fontWeight:700, color: selectedVariant.stock > 0 ? "var(--success)" : "var(--danger)" }}>
                          {selectedVariant.stock} {selectedVariant.stock === 0 ? "- Out of Stock" : "available"}
                        </span>
                      </div>
                      {selectedVariant.sku && (
                        <div style={{ gridColumn:"1 / -1" }}>
                          <span style={{ color:"var(--muted)", fontWeight:500 }}>SKU: </span>
                          <span style={{ fontFamily:"monospace", fontSize:".8rem" }}>{selectedVariant.sku}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Seller */}
              <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px",
                borderRadius:"14px", background:"var(--primary-light)", border:"1px solid #c3d9f8" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => activeSeller?.shopSlug && navigate(`/shop/${activeSeller.shopSlug}`)}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === " ") && activeSeller?.shopSlug) {
                          navigate(`/shop/${activeSeller.shopSlug}`);
                        }
                      }}
                      style={{
                        fontWeight:600,
                        fontSize:".875rem",
                        overflow:"hidden",
                        textOverflow:"ellipsis",
                        whiteSpace:"nowrap",
                        cursor: activeSeller?.shopSlug ? "pointer" : "default",
                        textDecoration: activeSeller?.shopSlug ? "underline" : "none",
                        textUnderlineOffset: 2,
                      }}
                    >
                      {activeSeller?.name || product.seller.name}
                    </span>
                    {(activeSeller?.verified || product.seller.verified) && <span style={{ color:"var(--primary)", fontSize:".85rem" }}>✓</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"3px" }}>
                    <Stars rating={activeSeller?.rating ?? product.seller.rating} size="sm"/>
                    <span style={{ fontSize:".72rem", color:"var(--muted)" }}>
                      {(activeSeller?.rating ?? product.seller.rating)} · {(activeSeller?.reviews ?? product.seller.reviews).toLocaleString()} reviews
                    </span>
                  </div>
                </div>
                <button style={{ flexShrink:0, background:"var(--primary)", color:"#fff", border:"none",
                  cursor:"pointer", borderRadius:"8px", padding:"7px 14px", fontSize:".78rem",
                  fontWeight:600, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", transition:"opacity .15s" }}
                  onMouseOver={e=>e.currentTarget.style.opacity=".8"}
                  onMouseOut={e=>e.currentTarget.style.opacity="1"}
                  onClick={() => activeSeller?.shopSlug && navigate(`/shop/${activeSeller.shopSlug}`)}
                >Visit Shop</button>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {product.tags.map(t => (
                    <span key={t} style={{ fontSize:".78rem", padding:"5px 12px", borderRadius:"999px",
                      background:"#f3f4f6", color:"var(--muted)", border:"1px solid var(--border)",
                      cursor:"pointer", transition:"transform .15s, background .15s", whiteSpace:"nowrap" }}
                      onMouseOver={e=>{ e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.background="#e5e7eb"; }}
                      onMouseOut={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.background="#f3f4f6"; }}
                    >#{t}</span>
                  ))}
                </div>
              )}

              <hr style={{ borderColor:"var(--border)", margin:0 }} />

              {/* Qty + CTA group */}
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {/* Quantity — always horizontal */}
                <div style={{ display:"flex", flexDirection:"row", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
                  <span style={{ fontSize:".875rem", fontWeight:500, whiteSpace:"nowrap" }}>Quantity:</span>
                  <QuantitySelector value={qty} onChange={setQty} max={selectedVariant?.stock ?? product.stock ?? 99} />
                  <span style={{ fontSize:".78rem", color:"var(--muted)", whiteSpace:"nowrap" }}>({selectedVariant?.stock != null ? selectedVariant.stock : product.stock} available)</span>
                </div>

                {/* Cart + Wish — always horizontal row */}
                <div className="cta-row">
                  <AddToCartButton 
                    onClick={handleAddToCart} 
                    loading={cartLoading} 
                    added={cartAdded}
                    disabled={!activeSeller?.id || (variants.length > 0 && !selectedVariant)}
                  />
                  <button className={`btn-wish ${wishlisted?"w-on":""}`} onClick={handleWishlist}
                    title={wishlisted?"Remove from wishlist":"Add to wishlist"}
                    style={{ color: wishlisted?"#e53e3e":"var(--muted)" }}>
                    {wishlisted?"♥":"♡"}
                  </button>
                </div>

                {/* Buy Now */}
                <button className="btn-outline">⚡ Buy Now</button>
              </div>

              {/* Shipping */}
              <div className="ship-grid">
                {[
                  { icon:"🚚", label:product.shipping.free?"Free Delivery":"Paid Delivery", sub:product.shipping.estimated },
                  { icon:"⚡", label:"Express", sub:product.shipping.express },
                  { icon:"↩️", label:"Easy Returns", sub:product.shipping.returns },
                  { icon:"🔒", label:"Secure Checkout", sub:"SSL encrypted" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", alignItems:"flex-start", gap:"8px",
                    padding:"10px 12px", borderRadius:"12px", background:"#f9fafb", border:"1px solid var(--border)" }}>
                    <span style={{ fontSize:"1rem", lineHeight:"1.4", flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight:500, fontSize:".75rem" }}>{item.label}</div>
                      <div style={{ color:"var(--muted)", fontSize:".7rem", marginTop:"2px" }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                <span style={{ fontSize:".78rem", fontWeight:500, color:"var(--muted)" }}>Share:</span>
                {[
                  { id:"twitter", icon:"𝕏" }, { id:"facebook", icon:"f" },
                  { id:"whatsapp", icon:"💬" }, { id:"copy", icon:copied?"✓":"🔗" },
                ].map(s => (
                  <button key={s.id} onClick={()=>handleShare(s.id)}
                    style={{ width:32, height:32, borderRadius:"50%", background:"#f3f4f6",
                      border:"1px solid var(--border)", cursor:"pointer", fontSize:".85rem",
                      display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .15s" }}
                    onMouseOver={e=>e.currentTarget.style.transform="scale(1.12)"}
                    onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}
                  >{s.icon}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <div style={{ borderBottom:"1px solid var(--border)", display:"flex", overflowX:"auto" }} className="no-sb">
            {[
              { id:"description", label:"Description" },
              { id:"specifications", label:"Specifications" },
              { id:"reviews", label:`Reviews (${reviews.length})` },
            ].map(tab => (
              <button key={tab.id} className={`tab-btn ${activeTab===tab.id?"t-active":""}`}
                onClick={()=>setActiveTab(tab.id)}>{tab.label}</button>
            ))}
          </div>

          <div style={{ padding:"32px 0" }} className="pdp-fade">

            {/* Description tab */}
            {activeTab==="description" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"32px" }}>
                <style>{`@media(min-width:768px){ .desc-grid{ grid-template-columns:1fr 1fr !important; } }`}</style>
                <div className="desc-grid" style={{ display:"grid", gridTemplateColumns:"1fr", gap:"32px" }}>
                  <div>
                    <h2 className="pdp-serif" style={{ fontSize:"1.5rem", marginBottom:"16px" }}>Product Description</h2>
                    <div style={{ fontSize:".875rem", lineHeight:1.75, color:"#374151" }}
                      dangerouslySetInnerHTML={{ __html:product.description }} />
                  </div>
                  <div>
                    <h3 className="pdp-serif" style={{ fontSize:"1.25rem", marginBottom:"12px" }}>Ingredients</h3>
                    {product.ingredients ? (
                      <p style={{ fontSize:".875rem", lineHeight:1.7, padding:"16px", borderRadius:"12px",
                        background:"#f9fafb", color:"var(--muted)", border:"1px solid var(--border)" }}>
                        {product.ingredients}
                      </p>
                    ) : (
                      <p style={{ fontSize:".875rem", lineHeight:1.7, padding:"16px", borderRadius:"12px",
                        background:"#f9fafb", color:"var(--muted)", border:"1px solid var(--border)" }}>
                        No ingredients information available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Specifications tab */}
            {activeTab==="specifications" && (
              <div style={{ maxWidth:"560px" }}>
                <h2 className="pdp-serif" style={{ fontSize:"1.5rem", marginBottom:"20px" }}>Product Specifications</h2>
                {product.specifications?.length > 0 ? (
                  <div style={{ borderRadius:"16px", overflow:"hidden", border:"1px solid var(--border)" }}>
                    {product.specifications.map((spec,i) => (
                      <div key={i} className="spec-row" style={{ display:"flex",
                        borderBottom:i<product.specifications.length-1?"1px solid var(--border)":"none" }}>
                        <div style={{ width:"160px", padding:"12px 20px", fontSize:".875rem",
                          fontWeight:500, color:"var(--muted)", flexShrink:0 }}>{spec.label}</div>
                        <div style={{ flex:1, padding:"12px 20px", fontSize:".875rem" }}>{spec.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color:"var(--muted)", fontSize:".875rem" }}>No specifications available</p>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab==="reviews" && (
              <div className="rev-grid">

                {/* Left: summary + form */}
                <div>
                  <h2 className="pdp-serif" style={{ fontSize:"1.5rem", marginBottom:"16px" }}>Customer Reviews</h2>
                  <div className="pdp-card" style={{ padding:"24px" }}>
                    <div style={{ textAlign:"center", marginBottom:"16px" }}>
                      <div style={{ fontSize:"3rem", fontWeight:700, lineHeight:1 }}>{product.rating}</div>
                      <div style={{ marginTop:"6px" }}><Stars rating={product.rating} size="lg"/></div>
                      <div style={{ fontSize:".8rem", color:"var(--muted)", marginTop:"4px" }}>Based on {reviews.length} reviews</div>
                    </div>
                    {ratingBreakdown.map(rb => (
                      <div key={rb.stars} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                        <span style={{ fontSize:".75rem", width:"12px", textAlign:"right", flexShrink:0 }}>{rb.stars}</span>
                        <span style={{ color:"#f59e0b", fontSize:".75rem", flexShrink:0 }}>★</span>
                        <div style={{ flex:1, height:"8px", borderRadius:"99px", background:"#f3f4f6", overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:"99px", background:"var(--warning)",
                            width:`${rb.pct}%`, transition:"width .7s ease" }} />
                        </div>
                        <span style={{ fontSize:".72rem", color:"var(--muted)", width:"14px", flexShrink:0 }}>{rb.count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Submit form */}
                  <div className="pdp-card" style={{ padding:"20px", marginTop:"20px" }}>
                    <h3 className="pdp-serif" style={{ fontSize:"1.1rem", marginBottom:"14px" }}>Write a Review</h3>
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                      <div>
                        <label style={{ fontSize:".75rem", fontWeight:500, color:"var(--muted)", display:"block", marginBottom:"4px" }}>Your rating *</label>
                        <Stars rating={reviewForm.rating} size="lg" interactive onChange={r=>setReviewForm(f=>({...f,rating:r}))} />
                      </div>
                      {[
                        { key:"name", ph:"Your name *" },
                        { key:"title", ph:"Review title" },
                      ].map(f => (
                        <input key={f.key} type="text" placeholder={f.ph} value={reviewForm[f.key]}
                          onChange={e=>setReviewForm(prev=>({...prev,[f.key]:e.target.value}))}
                          style={{ width:"100%", height:"40px", borderRadius:"8px", padding:"0 12px",
                            fontSize:".875rem", border:"1px solid var(--border)", outline:"none",
                            fontFamily:"'DM Sans',sans-serif", color:"var(--text)" }}
                          onFocus={e=>e.currentTarget.style.borderColor="var(--primary)"}
                          onBlur={e=>e.currentTarget.style.borderColor="var(--border)"}
                        />
                      ))}
                      <textarea placeholder="Share your experience *" value={reviewForm.body}
                        onChange={e=>setReviewForm(f=>({...f,body:e.target.value}))}
                        style={{ width:"100%", minHeight:"90px", borderRadius:"8px", padding:"10px 12px",
                          fontSize:".875rem", border:"1px solid var(--border)", outline:"none",
                          resize:"none", fontFamily:"'DM Sans',sans-serif", color:"var(--text)" }}
                        onFocus={e=>e.currentTarget.style.borderColor="var(--primary)"}
                        onBlur={e=>e.currentTarget.style.borderColor="var(--border)"}
                      />
                      <button onClick={handleReview}
                        disabled={reviewSubmitting||!reviewForm.rating||!reviewForm.body.trim()||!reviewForm.name.trim()}
                        style={{ height:"40px", borderRadius:"10px", background:"var(--primary)",
                          color:"#fff", border:"none", cursor:"pointer", fontWeight:600,
                          fontSize:".875rem", fontFamily:"'DM Sans',sans-serif",
                          display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                          opacity:(reviewSubmitting||!reviewForm.rating||!reviewForm.body.trim()||!reviewForm.name.trim())?0.55:1,
                          transition:"opacity .15s" }}>
                        {reviewSubmitting
                          ? <><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.3)",
                              borderTopColor:"#fff", borderRadius:"50%", display:"inline-block",
                              animation:"spin .8s linear infinite" }} /> Submitting…</>
                          : "Submit Review"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: review list */}
                <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Related products ── */}
          <div style={{ paddingBottom:"64px" }}>
            <h2 className="pdp-serif" style={{ fontSize:"1.5rem", marginBottom:"20px" }}>You May Also Like</h2>
            {related.length > 0
              ? <RelatedProductsCarousel products={related} />
              : <p style={{ color:"var(--muted)", fontSize:".875rem" }}>No related products found.</p>}
          </div>

        </div>
      </div>
    </>
  );
}