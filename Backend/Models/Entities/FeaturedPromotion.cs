namespace Backend.Models.Entities;

public class FeaturedPromotion : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }
    public DateTime StartAtUtc { get; set; }
    public DateTime EndAtUtc { get; set; }
    public decimal AmountPaid { get; set; }
    public bool IsActive { get; set; }

    public Product Product { get; set; } = null!;
    public SellerProfile Seller { get; set; } = null!;
}
