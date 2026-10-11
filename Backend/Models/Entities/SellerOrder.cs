using Backend.Models.Enums;

namespace Backend.Models.Entities;

public class SellerOrder : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid SellerId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public Order Order { get; set; } = null!;
    public SellerProfile Seller { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
