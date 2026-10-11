using Backend.DTOs.Sellers;

namespace Backend.Interfaces.Services;

public interface ISellerService
{
    Task RegisterAsync(Guid userId, RegisterSellerDto dto);
    Task<SellerDashboardDto> GetDashboardAsync(Guid userId, string dateRange = "week");
    Task<SellerProfileDto?> GetProfileAsync(Guid userId);
    Task UpdateProfileAsync(Guid userId, SellerProfileDto dto);
}
