import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { getImageUrl } from "../../services/imageUploadService";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWished, toggleWish } = useWishlist();
  const wished = isWished(product.id);

  const shopSlug = product.sellerShopSlug || product.sellerId;

  return (
    <article className="card" style={{ position: "relative" }}>
      <button
        onClick={(e) => { e.preventDefault(); toggleWish(product); }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        style={{
          position: "absolute", top: 8, right: 8,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: "50%", width: 30, height: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 14,
          color: wished ? "#dc2626" : "#94a3b8",
          zIndex: 1,
        }}
      >
        {wished ? "♥" : "♡"}
      </button>
      <img src={getImageUrl(product.primaryImageUrl || product.imageUrl || product.images?.[0]) || "https://via.placeholder.com/300x180"} alt={product.name} />
      <h3>{product.name}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>${Number(product.price || 0).toFixed(2)}</p>
        {product.originalPrice ? (
          <p style={{ margin: 0, color: "#94a3b8", textDecoration: "line-through" }}>${Number(product.originalPrice).toFixed(2)}</p>
        ) : null}
        {product.discountLabel ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", background: "#fef2f2", padding: "2px 6px", borderRadius: 4 }}>
            {product.discountLabel}
          </span>
        ) : null}
      </div>
      {shopSlug ? (
        <p style={{ margin: "6px 0 0" }}>
          <Link to={`/shop/${shopSlug}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Visit Shop
          </Link>
          <span style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {product.sellerShopName || "Shop"}
          </span>
        </p>
      ) : null}
      <div className="card-actions">
        <Link to={`/products/${product.id}`}>Details</Link>
        <button onClick={() => addToCart(product.id, 1)}>Add to Cart</button>
      </div>
    </article>
  );
}
