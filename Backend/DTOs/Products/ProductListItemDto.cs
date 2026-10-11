namespace Backend.DTOs.Products;

public class ProductListItemDto
{
    public Guid Id { get; set; }
    public Guid SellerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal FinalPrice { get; set; }
    public string? DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public string DiscountLabel { get; set; } = string.Empty;
    public int StockQty { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string SellerShopName { get; set; } = string.Empty;
    public string SellerShopSlug { get; set; } = string.Empty;
    public string? PrimaryImageUrl { get; set; }
    public List<string> Images { get; set; } = new();  // All product images
}
