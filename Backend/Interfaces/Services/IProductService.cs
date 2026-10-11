using Backend.DTOs.Products;

namespace Backend.Interfaces.Services;

public interface IProductService
{
    Task<List<ProductListItemDto>> SearchAsync(string? search, Guid? categoryId, decimal? minPrice, decimal? maxPrice);
    Task<ProductDetailsDto?> GetByIdAsync(Guid id);
    Task<ProductDetailsFullDto?> GetByIdFullAsync(Guid id);  // New method for full details with seller info
    Task<ProductDetailsDto> CreateAsync(Guid sellerUserId, ProductCreateDto dto);
    Task<bool> UpdateAsync(Guid sellerUserId, Guid id, ProductUpdateDto dto);
    Task<bool> DeleteAsync(Guid sellerUserId, Guid id);
    Task<bool> AddImageAsync(Guid sellerUserId, Guid productId, string imageUrl);
}
