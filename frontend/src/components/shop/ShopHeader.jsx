import { getImageUrl } from "../../services/imageUploadService";

export default function ShopHeader({ shop }) {
  return (
    <header className="shop-header card">
      <div className="shop-header__left">
        <img
          src={getImageUrl(shop.logoUrl) || "https://via.placeholder.com/96x96?text=Shop"}
          alt={`${shop.name} logo`}
          className="shop-header__logo"
        />
        <div>
          <h1 className="shop-header__name">{shop.name}</h1>
          <div className="shop-header__meta">
            <span>Rating: {Number(shop.rating || 0).toFixed(1)} / 5</span>
            {shop.ownerName ? <span>Owner: {shop.ownerName}</span> : null}
            {shop.location ? <span>Location: {shop.location}</span> : null}
          </div>
        </div>
      </div>
    </header>
  );
}
