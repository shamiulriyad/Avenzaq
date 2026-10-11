using Backend.Models.Enums;

namespace Backend.Models.Entities;

public class Order : BaseEntity
{
    public Guid CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public User Customer { get; set; } = null!;
    public ICollection<SellerOrder> SellerOrders { get; set; } = new List<SellerOrder>();
}
