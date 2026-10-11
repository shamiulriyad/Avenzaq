export default function ProductFilterBar({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) {
  return (
    <div className="filters">
      <input
        className="input"
        type="number"
        placeholder="Min price"
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
      />
      <input
        className="input"
        type="number"
        placeholder="Max price"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
      />
    </div>
  );
}
