namespace Backend.Models.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid SellerProductId { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string SKU { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public DateTime? DiscountStart { get; set; }
    public DateTime? DiscountEnd { get; set; }

    // Navigation properties
    public Product Product { get; set; } = null!;
    public SellerProduct SellerProduct { get; set; } = null!;
    public ICollection<VariantImage> Images { get; set; } = new List<VariantImage>();
}
