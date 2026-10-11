import ProductCard from "./ProductCard";

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return <div className="card">Loading products...</div>;
  }

  if (error) {
    return <div className="card">{error}</div>;
  }

  if (!products.length) {
    return <div className="card">No products in this shop.</div>;
  }

  return (
    <section className="shop-products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
