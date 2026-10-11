import { Link } from "react-router-dom";
import { getImageUrl } from "../../services/imageUploadService";

export default function ProductCard({ product }) {
  return (
    <article className="card shop-product-card">
      <img
        src={getImageUrl(product.imageUrl) || "https://via.placeholder.com/400x240?text=Product"}
        alt={product.name}
        className="shop-product-card__image"
      />
      <h3>{product.name}</h3>
      <p className="shop-product-card__price">${Number(product.price || 0).toFixed(2)}</p>
      <p className="shop-product-card__category">{product.categoryName || "Uncategorized"}</p>
      <div className="card-actions">
        <Link to={`/products/${product.id}`}>Details</Link>
      </div>
    </article>
  );
}
