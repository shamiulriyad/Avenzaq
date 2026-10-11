namespace Backend.Models.Entities;

public class VariantImage : BaseEntity
{
    public Guid VariantId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;

    // Navigation properties
    public ProductVariant Variant { get; set; } = null!;
}
