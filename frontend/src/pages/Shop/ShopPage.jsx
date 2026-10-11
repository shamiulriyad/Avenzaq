import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopPageBySlug, getShopReviews } from "../../services/shopService";
import { getImageUrl } from "../../services/imageUploadService";

const defaultFilters = {
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

/* ─────────────────────────── styles ─────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  .shop-page { all: unset; display: block; }

  .shop-page *, .shop-page *::before, .shop-page *::after {
    box-sizing: border-box;
  }

  /* ── tokens ── */
  .shop-page {
    --sp-bg:          #f8f6f2;
    --sp-surface:     #ffffff;
    --sp-surface2:    #f2efe9;
    --sp-ink:         #1a1714;
    --sp-ink2:        #5c574f;
    --sp-ink3:        #9b9590;
    --sp-accent:      #c8853a;
    --sp-accent-lt:   #f5ead8;
    --sp-border:      rgba(26,23,20,0.10);
    --sp-border-sm:   rgba(26,23,20,0.06);
    --ff-display:     'DM Serif Display', Georgia, serif;
    --ff-body:        'DM Sans', system-ui, sans-serif;
    background: var(--sp-bg);
    font-family: var(--ff-body);
    color: var(--sp-ink);
    min-height: 100vh;
  }

  /* ── wrap ── */
  .shop-wrap {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 24px 100px;
  }

  /* ── banner ── */
  .sp-banner {
    position: relative;
    width: 100%; height: 320px;
    overflow: hidden;
    border-radius: 0 0 24px 24px;
  }
  .sp-banner img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .sp-banner-fallback {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #2a1f14 0%, #7a4e2a 50%, #c8853a 100%);
  }
  .sp-banner-pattern {
    position: absolute; inset: 0;
    opacity: 0.06;
    background-image: repeating-linear-gradient(
      45deg, #fff 0, #fff 1px, transparent 0, transparent 50%
    );
    background-size: 20px 20px;
  }
  .sp-banner-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(20,14,8,0.75) 0%, transparent 60%);
  }
  .sp-banner-content {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 32px 40px;
    display: flex; align-items: flex-end; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .sp-shop-eyebrow {
    font-size: 11px; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.6);
    font-family: var(--ff-body); margin-bottom: 8px;
  }
  .sp-shop-name {
    font-family: var(--ff-display);
    font-size: 48px; font-style: italic;
    color: #fff; line-height: 1;
    letter-spacing: -0.5px;
  }
  .sp-banner-badges {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .sp-badge {
    font-size: 12px; font-weight: 500; letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 6px 14px; border-radius: 20px;
    background: rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.9);
    border: 1px solid rgba(255,255,255,0.22);
    backdrop-filter: blur(8px);
    font-family: var(--ff-body);
  }
  .sp-rating-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 500; color: #fff;
    font-family: var(--ff-body);
  }
  .sp-star { color: #f5c842; }

  /* ── layout ── */
  .sp-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 32px;
    margin-top: 32px;
    align-items: start;
  }

  /* ── sidebar ── */
  .sp-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 24px; }

  .sp-card {
    background: var(--sp-surface);
    border: 0.5px solid var(--sp-border);
    border-radius: 16px;
    padding: 20px;
  }

  .sp-section-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--sp-ink3);
    margin-bottom: 14px;
  }

  .sp-shop-desc {
    font-size: 14px; line-height: 1.7; color: var(--sp-ink2);
  }

  .sp-stat-row {
    display: flex; flex-direction: column; gap: 10px;
    margin-top: 14px; border-top: 0.5px solid var(--sp-border-sm);
    padding-top: 14px;
  }
  .sp-stat {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px;
  }
  .sp-stat-label { color: var(--sp-ink3); }
  .sp-stat-value { font-weight: 500; color: var(--sp-ink); }

  /* search */
  .sp-search-wrap { position: relative; }
  .sp-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    font-size: 15px; color: var(--sp-ink3); pointer-events: none;
    line-height: 1;
  }
  .sp-search-input {
    width: 100%;
    padding: 10px 14px 10px 36px;
    border-radius: 10px;
    border: 0.5px solid var(--sp-border);
    background: var(--sp-surface2);
    font-family: var(--ff-body); font-size: 14px;
    color: var(--sp-ink);
    outline: none;
    transition: border-color 0.2s;
  }
  .sp-search-input:focus { border-color: var(--sp-accent); }
  .sp-search-input::placeholder { color: var(--sp-ink3); }

  /* categories */
  .sp-cat-list { display: flex; flex-direction: column; gap: 2px; }
  .sp-cat-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 10px; border-radius: 9px;
    font-size: 13px; cursor: pointer;
    transition: background 0.15s, color 0.15s;
    color: var(--sp-ink2);
    border: none; background: transparent;
    font-family: var(--ff-body); text-align: left; width: 100%;
  }
  .sp-cat-item:hover { background: var(--sp-surface2); }
  .sp-cat-item.active {
    background: var(--sp-accent-lt); color: var(--sp-accent); font-weight: 500;
  }
  .sp-cat-count {
    font-size: 11px; color: var(--sp-ink3);
    background: var(--sp-surface2);
    padding: 2px 7px; border-radius: 10px;
  }
  .sp-cat-item.active .sp-cat-count {
    background: rgba(200,133,58,0.15); color: var(--sp-accent);
  }

  /* filter */
  .sp-filter-group { display: flex; flex-direction: column; gap: 6px; }
  .sp-filter-sublabel { font-size: 12px; color: var(--sp-ink3); margin-bottom: 2px; margin-top: 6px; }
  .sp-filter-row { display: flex; gap: 8px; align-items: center; }
  .sp-filter-select,
  .sp-filter-input {
    flex: 1; min-width: 0;
    padding: 8px 10px; border-radius: 8px;
    border: 0.5px solid var(--sp-border);
    background: var(--sp-surface2);
    font-family: var(--ff-body); font-size: 13px;
    color: var(--sp-ink); outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
  }
  .sp-filter-sep { font-size: 12px; color: var(--sp-ink3); flex-shrink: 0; }
  .sp-filter-input { text-align: center; }
  .sp-reset-btn {
    width: 100%; padding: 9px; margin-top: 6px;
    border: 0.5px solid var(--sp-border);
    border-radius: 8px; background: transparent;
    font-family: var(--ff-body); font-size: 13px;
    color: var(--sp-ink2); cursor: pointer;
    transition: background 0.15s;
  }
  .sp-reset-btn:hover { background: var(--sp-surface2); }

  /* ── main content ── */
  .sp-main { display: flex; flex-direction: column; gap: 24px; }

  .sp-topbar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
  }
  .sp-topbar-title {
    font-family: var(--ff-display);
    font-size: 28px; font-style: italic; font-weight: 400;
    color: var(--sp-ink);
  }
  .sp-result-count { font-size: 13px; color: var(--sp-ink3); }

  /* ── product grid ── */
  .sp-product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
    gap: 18px;
  }

  .sp-product-card {
    background: var(--sp-surface);
    border: 0.5px solid var(--sp-border);
    border-radius: 16px; overflow: hidden;
    cursor: pointer; position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    text-decoration: none; display: block;
  }
  .sp-product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(26,23,20,0.09);
  }

  .sp-product-img {
    width: 100%; aspect-ratio: 1;
    background: var(--sp-surface2);
    overflow: hidden; position: relative;
  }
  .sp-product-img img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.35s ease;
  }
  .sp-product-card:hover .sp-product-img img { transform: scale(1.04); }

  .sp-product-tag {
    position: absolute; top: 10px; left: 10px;
    font-size: 10px; font-weight: 500; letter-spacing: 0.06em;
    text-transform: uppercase; padding: 4px 10px; border-radius: 12px;
    background: var(--sp-surface); color: var(--sp-ink2);
    border: 0.5px solid var(--sp-border);
    font-family: var(--ff-body);
  }

  .sp-product-body { padding: 14px 16px 18px; }
  .sp-product-cat {
    font-size: 11px; color: var(--sp-ink3); text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 4px;
  }
  .sp-product-name {
    font-size: 14px; font-weight: 500; color: var(--sp-ink);
    line-height: 1.45; margin-bottom: 6px;
  }
  .sp-product-rating { font-size: 12px; color: var(--sp-ink3); }
  .sp-product-price {
    font-family: var(--ff-display);
    font-size: 22px; font-style: italic;
    color: var(--sp-accent); margin-top: 8px; line-height: 1;
  }

  /* empty state */
  .sp-empty {
    grid-column: 1 / -1;
    padding: 64px 24px; text-align: center;
    color: var(--sp-ink3); font-size: 15px;
  }

  /* ── pagination ── */
  .sp-pagination {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 4px 0;
  }
  .sp-page-btn {
    min-width: 36px; height: 36px; border-radius: 9px;
    border: 0.5px solid var(--sp-border);
    background: var(--sp-surface);
    display: flex; align-items: center; justify-content: center;
    padding: 0 10px;
    cursor: pointer; font-family: var(--ff-body); font-size: 13px;
    color: var(--sp-ink2); transition: all 0.15s;
  }
  .sp-page-btn:hover:not(:disabled) {
    background: var(--sp-accent-lt);
    color: var(--sp-accent);
    border-color: rgba(200,133,58,0.3);
  }
  .sp-page-btn:disabled { opacity: 0.3; cursor: default; }
  .sp-page-btn.active {
    background: var(--sp-accent); color: #fff;
    border-color: var(--sp-accent); font-weight: 500;
  }
  .sp-page-sep { font-size: 13px; color: var(--sp-ink3); padding: 0 4px; }

  /* ── divider ── */
  .sp-divider { border: none; border-top: 0.5px solid var(--sp-border); }

  /* ── reviews ── */
  .sp-reviews { display: flex; flex-direction: column; gap: 16px; padding-top: 4px; }

  .sp-reviews-header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .sp-reviews-title {
    font-family: var(--ff-display);
    font-size: 24px; font-style: italic; font-weight: 400;
    color: var(--sp-ink);
  }
  .sp-rating-summary { display: flex; align-items: center; gap: 10px; }
  .sp-big-rating {
    font-size: 36px; font-weight: 300; line-height: 1;
    color: var(--sp-ink);
  }
  .sp-rating-stars { font-size: 15px; color: #f5c842; letter-spacing: 1px; }
  .sp-rating-count { font-size: 12px; color: var(--sp-ink3); margin-top: 3px; }

  .sp-review-card {
    background: var(--sp-surface);
    border: 0.5px solid var(--sp-border);
    border-radius: 14px; padding: 18px 20px;
    transition: border-color 0.15s;
  }
  .sp-review-card:hover { border-color: rgba(26,23,20,0.18); }

  .sp-review-top {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  }
  .sp-review-avatar {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    background: var(--sp-accent-lt);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 500; color: var(--sp-accent);
  }
  .sp-review-name { font-size: 14px; font-weight: 500; color: var(--sp-ink); }
  .sp-review-date { font-size: 12px; color: var(--sp-ink3); margin-top: 2px; }
  .sp-review-stars { margin-left: auto; font-size: 13px; color: #f5c842; }
  .sp-review-text { font-size: 14px; line-height: 1.75; color: var(--sp-ink2); }
  .sp-review-verified {
    display: inline-block; margin-top: 10px;
    font-size: 11px; color: #3a7c55; font-weight: 500;
    background: #eaf5ee; padding: 3px 9px; border-radius: 8px;
  }

  /* ── loading / error ── */
  .sp-state-card {
    margin: 48px auto; max-width: 480px;
    background: var(--sp-surface);
    border: 0.5px solid var(--sp-border);
    border-radius: 16px; padding: 40px 32px;
    text-align: center;
  }
  .sp-state-title { font-family: var(--ff-display); font-size: 22px; font-style: italic; margin-bottom: 8px; }
  .sp-state-sub { font-size: 14px; color: var(--sp-ink2); }

  /* ── responsive ── */
  @media (max-width: 820px) {
    .sp-layout { grid-template-columns: 1fr; }
    .sp-sidebar { position: static; }
    .sp-shop-name { font-size: 34px; }
    .sp-banner { height: 240px; }
    .sp-banner-content { padding: 24px 24px; }
  }
  @media (max-width: 480px) {
    .shop-wrap { padding: 0 16px 60px; }
    .sp-product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }
`;

/* ─────────────────────────── helpers ─────────────────────────── */
function starsString(rating) {
  const full = Math.round(rating ?? 0);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─────────────────────────── sub-components ─────────────────────────── */
function BannerSection({ shop }) {
  const bannerSrc = shop.bannerUrl ? getImageUrl(shop.bannerUrl) : null;
  const avgRating = shop.averageRating ?? 4.9;
  const salesCount = shop.salesCount ?? 0;

  return (
    <div className="sp-banner">
      {bannerSrc ? (
        <img src={bannerSrc} alt={`${shop.name} banner`} />
      ) : (
        <>
          <div className="sp-banner-fallback" />
          <div className="sp-banner-pattern" />
        </>
      )}
      <div className="sp-banner-overlay" />
      <div className="sp-banner-content">
        <div>
          <div className="sp-shop-eyebrow">{shop.category ?? "Shop"}</div>
          <div className="sp-shop-name">{shop.name}</div>
        </div>
        <div className="sp-banner-badges">
          {avgRating > 0 && (
            <div className="sp-rating-badge">
              <span className="sp-star">★</span> {avgRating.toFixed(1)}
            </div>
          )}
          {shop.isVerified && <div className="sp-badge">Verified Seller</div>}
          {salesCount > 0 && <div className="sp-badge">{salesCount.toLocaleString()} sales</div>}
        </div>
      </div>
    </div>
  );
}

function AboutCard({ shop }) {
  const avgDelivery = shop.avgDeliveryDays ?? "4–6 days";
  const responseRate = shop.responseRate ?? null;
  const memberSince = shop.createdAt
    ? new Date(shop.createdAt).getFullYear()
    : null;

  return (
    <div className="sp-card">
      <div className="sp-section-label">About this shop</div>
      <p className="sp-shop-desc">{shop.description || "No description available."}</p>
      {(memberSince || avgDelivery || responseRate) && (
        <div className="sp-stat-row">
          {memberSince && (
            <div className="sp-stat">
              <span className="sp-stat-label">Member since</span>
              <span className="sp-stat-value">{memberSince}</span>
            </div>
          )}
          {avgDelivery && (
            <div className="sp-stat">
              <span className="sp-stat-label">Avg. delivery</span>
              <span className="sp-stat-value">{avgDelivery}</span>
            </div>
          )}
          {responseRate && (
            <div className="sp-stat">
              <span className="sp-stat-label">Response rate</span>
              <span className="sp-stat-value">{responseRate}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ categories, activeCategoryId, onSelect }) {
  const totalCount = categories.reduce((s, c) => s + (c.productCount ?? 0), 0);

  return (
    <div className="sp-card">
      <div className="sp-section-label">Categories</div>
      <div className="sp-cat-list">
        <button
          type="button"
          className={`sp-cat-item${activeCategoryId === "" ? " active" : ""}`}
          onClick={() => onSelect("")}
        >
          All products
          <span className="sp-cat-count">{totalCount}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`sp-cat-item${activeCategoryId === cat.id ? " active" : ""}`}
            onClick={() => onSelect(cat.id)}
          >
            {cat.name}
            {cat.productCount != null && (
              <span className="sp-cat-count">{cat.productCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterCard({ filters, onFilterChange, onReset }) {
  return (
    <div className="sp-card">
      <div className="sp-section-label">Filter &amp; Sort</div>
      <div className="sp-filter-group">
        <div className="sp-filter-sublabel">Price range</div>
        <div className="sp-filter-row">
          <input
            type="number"
            className="sp-filter-input"
            placeholder="Min"
            value={filters.minPrice}
            min={0}
            onChange={(e) => onFilterChange("minPrice", e.target.value)}
          />
          <span className="sp-filter-sep">–</span>
          <input
            type="number"
            className="sp-filter-input"
            placeholder="Max"
            value={filters.maxPrice}
            min={0}
            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
          />
        </div>
        <div className="sp-filter-sublabel">Sort by</div>
        <div className="sp-filter-row">
          <select
            className="sp-filter-select"
            value={filters.sort}
            onChange={(e) => onFilterChange("sort", e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="price-low-high">Price: low to high</option>
            <option value="price-high-low">Price: high to low</option>
          </select>
        </div>
        <button type="button" className="sp-reset-btn" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const imgSrc = product.imageUrl;
  const tagLabel = product.isNew ? "New" : product.isBestseller ? "Bestseller" : null;

  return (
    <div className="sp-product-card">
      <div className="sp-product-img">
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} loading="lazy" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#f0ece3" }} />
        )}
        {tagLabel && <div className="sp-product-tag">{tagLabel}</div>}
      </div>
      <div className="sp-product-body">
        {product.categoryName && (
          <div className="sp-product-cat">{product.categoryName}</div>
        )}
        <div className="sp-product-name">{product.name}</div>
        {product.rating != null && (
          <div className="sp-product-rating">
            {starsString(product.rating)}&nbsp;&nbsp;({product.reviewCount ?? 0})
          </div>
        )}
        <div className="sp-product-price">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: product.currency ?? "USD",
            maximumFractionDigits: 0,
          }).format(product.price)}
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);

  return (
    <div className="sp-pagination">
      <button
        type="button"
        className="sp-page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`sp-page-btn${p === page ? " active" : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {totalPages > 5 && (
        <>
          <span className="sp-page-sep">…</span>
          <button
            type="button"
            className={`sp-page-btn${page === totalPages ? " active" : ""}`}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        type="button"
        className="sp-page-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}

function ReviewList({ reviews, loading, error }) {
  if (loading) return <p style={{ fontSize: 14, color: "#9b9590" }}>Loading reviews…</p>;
  if (error) return <p style={{ fontSize: 14, color: "#9b9590" }}>{error}</p>;
  if (!reviews.length) return <p style={{ fontSize: 14, color: "#9b9590" }}>No reviews yet.</p>;

  const avg =
    reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;

  return (
    <div className="sp-reviews">
      <div className="sp-reviews-header">
        <div className="sp-reviews-title">Customer reviews</div>
        <div className="sp-rating-summary">
          <div className="sp-big-rating">{avg.toFixed(1)}</div>
          <div>
            <div className="sp-rating-stars">{starsString(Math.round(avg))}</div>
            <div className="sp-rating-count">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>
      </div>
      {reviews.map((review, idx) => (
        <div key={review.id ?? idx} className="sp-review-card">
          <div className="sp-review-top">
            <div className="sp-review-avatar">{initials(review.authorName)}</div>
            <div>
              <div className="sp-review-name">{review.authorName ?? "Anonymous"}</div>
              <div className="sp-review-date">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </div>
            </div>
            {review.rating != null && (
              <div className="sp-review-stars">{starsString(review.rating)}</div>
            )}
          </div>
          <p className="sp-review-text">{review.body}</p>
          {review.isVerified && (
            <span className="sp-review-verified">✓ Verified purchase</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── main page ─────────────────────────── */
export default function ShopPage() {
  const { shopSlug } = useParams();

  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewsError, setReviewsError] = useState("");

  /* load shop */
  useEffect(() => {
    if (!shopSlug) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getShopPageBySlug(shopSlug);
        if (!mounted) return;

        const shopData = res?.shop ?? null;
        const cats = Array.isArray(res?.categories) ? res.categories : [];
        const prods = Array.isArray(res?.products) ? res.products : [];

        setShop(shopData);
        setCategories(cats);
        setProducts(
          prods.map((p) => ({ ...p, imageUrl: getImageUrl(p.imageUrl) }))
        );
        localStorage.setItem("lastShop", shopSlug);
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message ?? "Unable to load this shop.");
          setShop(null);
          setCategories([]);
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [shopSlug]);

  /* load reviews */
  useEffect(() => {
    if (!shop?.id) return;
    let mounted = true;

    (async () => {
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const res = await getShopReviews(shop.id);
        if (mounted) setReviews(Array.isArray(res) ? res : []);
      } catch (err) {
        if (mounted)
          setReviewsError(
            err.response?.data?.message ?? "Unable to load reviews."
          );
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [shop?.id]);

  /* reset page on filter / search change */
  useEffect(() => { setPage(1); }, [
    search,
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ]);

  /* filter + sort */
  const filteredProducts = useMemo(() => {
    let items = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q)
      );
    }
    if (filters.categoryId)
      items = items.filter((p) => p.categoryId === filters.categoryId);
    if (filters.minPrice !== "")
      items = items.filter((p) => Number(p.price) >= Number(filters.minPrice));
    if (filters.maxPrice !== "")
      items = items.filter((p) => Number(p.price) <= Number(filters.maxPrice));

    if (filters.sort === "price-low-high")
      items.sort((a, b) => Number(a.price) - Number(b.price));
    else if (filters.sort === "price-high-low")
      items.sort((a, b) => Number(b.price) - Number(a.price));

    return items;
  }, [products, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleReset() {
    setSearch("");
    setFilters(defaultFilters);
  }

  /* ── render ── */
  if (loading) {
    return (
      <div className="shop-page">
        <style>{styles}</style>
        <div className="shop-wrap">
          <div className="sp-state-card">
            <div className="sp-state-title">Loading shop…</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="shop-page">
        <style>{styles}</style>
        <div className="shop-wrap">
          <div className="sp-state-card">
            <div className="sp-state-title">Shop not found</div>
            <p className="sp-state-sub">{error || "This shop doesn't exist or may have moved."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <style>{styles}</style>

      <BannerSection shop={shop} />

      <div className="shop-wrap">
        <div className="sp-layout">

          {/* ── sidebar ── */}
          <aside className="sp-sidebar">
            <AboutCard shop={shop} />

            <div className="sp-card">
              <div className="sp-section-label">Search</div>
              <div className="sp-search-wrap">
                <span className="sp-search-icon">⌕</span>
                <input
                  type="search"
                  className="sp-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <CategoryCard
                categories={categories}
                activeCategoryId={filters.categoryId}
                onSelect={(id) => handleFilterChange("categoryId", id)}
              />
            )}

            <FilterCard
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </aside>

          {/* ── main ── */}
          <main className="sp-main">
            <div className="sp-topbar">
              <div className="sp-topbar-title">
                {filters.categoryId
                  ? categories.find((c) => c.id === filters.categoryId)?.name ?? "Products"
                  : "All products"}
              </div>
              <span className="sp-result-count">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="sp-product-grid">
              {pagedProducts.length > 0 ? (
                pagedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="sp-empty">No products match your filters.</div>
              )}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />

            <hr className="sp-divider" />

            <ReviewList
              reviews={reviews}
              loading={reviewsLoading}
              error={reviewsError}
            />
          </main>

        </div>
      </div>
    </div>
  );
}