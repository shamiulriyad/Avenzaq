namespace Backend.DTOs.Products;

public class VariantImageDto
{
    public Guid Id { get; set; }
    public Guid VariantId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}

public class VariantImageCreateDto
{
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}
