export default function CartItemRow({ item, onQtyChange, onRemove }) {
  return (
    <div className="cart-row">
      <div>{item.productName}</div>
      <div>
        <div>${Number(item.finalPrice ?? item.unitPrice ?? 0).toFixed(2)}</div>
        {item.discountApplied && item.originalPrice ? (
          <div style={{ color: "#94a3b8", textDecoration: "line-through", fontSize: 12 }}>
            ${Number(item.originalPrice).toFixed(2)}
          </div>
        ) : null}
      </div>
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => onQtyChange(item.id, Number(e.target.value))}
      />
      <div>${Number(item.lineTotal ?? 0).toFixed(2)}</div>
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </div>
  );
}
