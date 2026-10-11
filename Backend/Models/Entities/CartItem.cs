namespace Backend.Models.Entities;

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }
    public Guid? VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal FinalPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public bool DiscountApplied { get; set; }
    public decimal UnitPrice { get; set; }

    public Cart Cart { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public SellerProfile Seller { get; set; } = null!;
    public ProductVariant? Variant { get; set; }
}
