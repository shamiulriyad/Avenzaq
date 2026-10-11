namespace Backend.DTOs.Products;

/// <summary>
/// Seller information summary displayed on Product Details page
/// </summary>
public class SellerSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;  // ShopName
    public string ShopSlug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }  // Avatar/Logo
    public string? BannerUrl { get; set; }
    public bool IsVerified { get; set; }  // IsApproved status
    public string? Location { get; set; }
    
    // Reputation metrics (calculated from reviews)
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    
    // Shop details
    public string? Description { get; set; }
    public bool AcceptsCOD { get; set; }
    public string ProcessingTime { get; set; } = "1-3";
}
