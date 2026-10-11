using Backend.DTOs.Shops;

namespace Backend.Interfaces.Services;

public interface IShopService
{
    Task<List<ShopListItemDto>> GetAllApprovedShopsAsync();
    Task<ShopDetailsDto?> GetShopByIdAsync(Guid id);
    Task<ShopDetailsDto?> GetShopBySlugAsync(string slug);
    Task<ShopDetailsDto?> GetShopByUserIdAsync(Guid userId);
    Task<ShopPageDto?> GetShopPageBySlugAsync(string slug);
    Task<PagedResultDto<ShopProductListItemDto>> GetShopProductsAsync(
        Guid shopId,
        Guid? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        string? sort,
        int page,
        int pageSize);
    Task<PagedResultDto<ShopProductListItemDto>> GetShopProductsBySlugAsync(
        string shopSlug,
        Guid? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        string? sort,
        int page,
        int pageSize);
    Task<List<ShopReviewDto>> GetShopReviewsAsync(Guid shopId);
}
