namespace Backend.DTOs.Products;

using Backend.DTOs.Reviews;

/// <summary>
/// Comprehensive Product Details DTO with all related information
/// Used by GET /api/products/{id} endpoint for Product Details page
/// </summary>
public class ProductDetailsFullDto : ProductListItemDto
{
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public new List<string> Images { get; set; } = new();
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    
    // Seller Information - Full object with details
    public SellerSummaryDto? Seller { get; set; }
    public List<ProductSellerVariantsDto> Sellers { get; set; } = new();
    public Guid CategoryId { get; set; }
    
    // Optional: Latest reviews (simplified format for display)
    public List<ReviewSummaryDto>? RecentReviews { get; set; }
}

/// <summary>
/// Simplified review summary for display on product details page
/// </summary>
public class ReviewSummaryDto
{
    public Guid Id { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
