using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class SellerRepository : ISellerRepository
{
    private readonly MarketplaceDbContext _db;

    public SellerRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public Task<SellerProfile?> GetByUserIdAsync(Guid userId)
        => _db.SellerProfiles.FirstOrDefaultAsync(s => s.UserId == userId);

    public Task<SellerProfile?> GetByIdAsync(Guid id)
        => _db.SellerProfiles.FirstOrDefaultAsync(s => s.Id == id);

    public async Task AddAsync(SellerProfile sellerProfile)
        => await _db.SellerProfiles.AddAsync(sellerProfile);

    public async Task<decimal> GetCommissionRateAsync(Guid sellerId)
    {
        var seller = await _db.SellerProfiles.FirstOrDefaultAsync(s => s.Id == sellerId);
        return seller?.CommissionRate ?? 0.10m;
    }

    public Task<int> SaveChangesAsync()
        => _db.SaveChangesAsync();
}
