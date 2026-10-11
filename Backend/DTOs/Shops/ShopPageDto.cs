namespace Backend.DTOs.Shops;

public class ShopPageDto
{
    public ShopDetailsDto Shop { get; set; } = new();
    public List<ShopCategoryDto> Categories { get; set; } = new();
    public List<ShopProductListItemDto> Products { get; set; } = new();
}