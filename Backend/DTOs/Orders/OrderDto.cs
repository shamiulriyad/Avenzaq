using Backend.Models.Enums;

namespace Backend.DTOs.Orders;

public class OrderDto
{
    public Guid Id { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
    public List<SellerOrderDto> SellerOrders { get; set; } = new();
}

public class OrderItemDto
{
    public Guid ProductId { get; set; }
    public Guid? VariantId { get; set; }
    public Guid SellerId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string SellerShopName { get; set; } = string.Empty;
    public string? PrimaryImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal FinalPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public bool DiscountApplied { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class SellerOrderDto
{
    public Guid Id { get; set; }
    public Guid SellerId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public OrderStatus Status { get; set; }
}
