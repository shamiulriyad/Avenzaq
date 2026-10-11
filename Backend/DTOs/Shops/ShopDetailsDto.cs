namespace Backend.DTOs.Shops;

public class ShopDetailsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string? Location { get; set; }
    public decimal Rating { get; set; }
    public Guid UserId { get; set; }
}
