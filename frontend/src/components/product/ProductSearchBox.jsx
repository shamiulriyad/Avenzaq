export default function ProductSearchBox({ value, onChange }) {
  return (
    <input
      className="input"
      placeholder="Search products"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
