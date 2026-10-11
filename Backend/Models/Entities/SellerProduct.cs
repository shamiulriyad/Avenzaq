namespace Backend.Models.Entities;

public class SellerProduct : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }

    public Product Product { get; set; } = null!;
    public SellerProfile Seller { get; set; } = null!;
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
}