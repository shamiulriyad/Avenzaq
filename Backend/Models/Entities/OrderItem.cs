namespace Backend.Models.Entities;

public class OrderItem : BaseEntity
{
    public Guid SellerOrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }
    public Guid? VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal FinalPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public bool DiscountApplied { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }

    public SellerOrder SellerOrder { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public SellerProfile Seller { get; set; } = null!;
    public ProductVariant? Variant { get; set; }
}
