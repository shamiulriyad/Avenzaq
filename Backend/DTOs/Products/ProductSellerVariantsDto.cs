namespace Backend.DTOs.Products;

public class ProductSellerVariantsDto
{
    public Guid SellerProductId { get; set; }
    public Guid SellerId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string ShopSlug { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public List<ProductVariantDto> Variants { get; set; } = new();
}