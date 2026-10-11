namespace Backend.DTOs.Products;

public class ProductImageUploadDto
{
    public IFormFile File { get; set; } = default!;
}

public class ProductImagesUploadDto
{
    public List<IFormFile> Images { get; set; } = new();
}
