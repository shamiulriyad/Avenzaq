namespace Backend.DTOs.Products;

public class ProductUpdateDto
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQty { get; set; }
    public bool IsActive { get; set; }
}
