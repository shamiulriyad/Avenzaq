export default function CartSummary({ totalAmount, items = [] }) {
  const originalTotal = items.reduce((sum, item) => sum + Number(item.originalPrice || item.finalPrice || item.unitPrice || 0) * Number(item.quantity || 0), 0);
  return (
    <aside className="card">
      <h3>Order Summary</h3>
      {originalTotal > totalAmount ? <p style={{ color: "#94a3b8", textDecoration: "line-through" }}>Original: ${originalTotal.toFixed(2)}</p> : null}
      <p>Total: ${Number(totalAmount || 0).toFixed(2)}</p>
    </aside>
  );
}
