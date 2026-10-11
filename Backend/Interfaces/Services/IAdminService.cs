using Backend.DTOs.Admin;

namespace Backend.Interfaces.Services;

public interface IAdminService
{
    Task<AdminDashboardDto> GetDashboardAsync();
    Task<bool> ApproveSellerAsync(Guid sellerId);
    Task CreateFeaturedPromotionAsync(CreateFeaturedPromotionDto dto);
    Task<List<AdminPromotionDto>> GetFeaturedPromotionsAsync();
    Task<bool> UpdateFeaturedPromotionAsync(Guid promotionId, CreateFeaturedPromotionDto dto);
    Task<bool> DeleteFeaturedPromotionAsync(Guid promotionId);
    Task<List<AdminSellerDto>> GetSellersAsync();
    Task<bool> RejectSellerAsync(Guid sellerId);
    Task<bool> SuspendSellerAsync(Guid sellerId);
    Task<List<object>> GetUsersAsync();
    Task<bool> BlockUserAsync(Guid userId);
    Task<bool> UnblockUserAsync(Guid userId);
    Task<List<object>> GetProductsAsync();
    Task<List<object>> GetOrdersAsync();
}
