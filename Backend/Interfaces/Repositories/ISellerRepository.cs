using Backend.Models.Entities;

namespace Backend.Interfaces.Repositories;

public interface ISellerRepository
{
    Task<SellerProfile?> GetByUserIdAsync(Guid userId);
    Task<SellerProfile?> GetByIdAsync(Guid id);
    Task AddAsync(SellerProfile sellerProfile);
    Task<decimal> GetCommissionRateAsync(Guid sellerId);
    Task<int> SaveChangesAsync();
}
