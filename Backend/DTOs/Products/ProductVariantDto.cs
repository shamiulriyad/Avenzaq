namespace Backend.DTOs.Products;

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid SellerProductId { get; set; }
    public Guid SellerId { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal FinalPrice { get; set; }
    public string? DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public DateTime? DiscountStart { get; set; }
    public DateTime? DiscountEnd { get; set; }
    public string DiscountLabel { get; set; } = string.Empty;
    public int Stock { get; set; }
    public string SKU { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<VariantImageDto> Images { get; set; } = new();
}

public class ProductVariantCreateDto
{
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public DateTime? DiscountStart { get; set; }
    public DateTime? DiscountEnd { get; set; }
}

public class ProductVariantUpdateDto
{
    public string? Color { get; set; }
    public string? Size { get; set; }
    public decimal? Price { get; set; }
    public int? Stock { get; set; }
    public string? SKU { get; set; }
    public bool? IsActive { get; set; }
    public string? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public DateTime? DiscountStart { get; set; }
    public DateTime? DiscountEnd { get; set; }
}

public class ProductWithVariantsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public List<ProductVariantDto> Variants { get; set; } = new();
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public int TotalStock { get; set; }
    public List<string> Images { get; set; } = new();
    public double AverageRating { get; set; }
    public bool IsActive { get; set; }
}
