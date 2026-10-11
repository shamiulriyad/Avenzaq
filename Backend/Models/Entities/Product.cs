namespace Backend.Models.Entities;

public class Product : BaseEntity
{
    public Guid SellerId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQty { get; set; }
    public bool IsActive { get; set; } = true;

    public SellerProfile Seller { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<SellerProduct> SellerProducts { get; set; } = new List<SellerProduct>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
