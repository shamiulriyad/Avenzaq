namespace Backend.DTOs.Products;

public class ProductDetailsDto : ProductListItemDto
{
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public new List<string> Images { get; set; } = new();
    public double AverageRating { get; set; }
}
