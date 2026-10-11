export default function ShopFilters({
  categories,
  filters,
  onFilterChange,
  onReset,
}) {
  return (
    <section className="card shop-filters">
      <div>
        <label htmlFor="shop-category">Category</label>
        <select
          id="shop-category"
          value={filters.categoryId}
          onChange={(event) => onFilterChange("categoryId", event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="shop-min-price">Min price</label>
        <input
          id="shop-min-price"
          type="number"
          min="0"
          step="0.01"
          value={filters.minPrice}
          onChange={(event) => onFilterChange("minPrice", event.target.value)}
          placeholder="0"
        />
      </div>

      <div>
        <label htmlFor="shop-max-price">Max price</label>
        <input
          id="shop-max-price"
          type="number"
          min="0"
          step="0.01"
          value={filters.maxPrice}
          onChange={(event) => onFilterChange("maxPrice", event.target.value)}
          placeholder="1000"
        />
      </div>

      <div>
        <label htmlFor="shop-sort">Sort</label>
        <select
          id="shop-sort"
          value={filters.sort}
          onChange={(event) => onFilterChange("sort", event.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
        </select>
      </div>

      <button type="button" onClick={onReset}>
        Reset
      </button>
    </section>
  );
}
