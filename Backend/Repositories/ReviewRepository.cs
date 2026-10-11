using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly MarketplaceDbContext _db;

    public ReviewRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public Task<List<Review>> GetByProductIdAsync(Guid productId)
        => _db.Reviews
            .Include(r => r.Customer)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync();

    public async Task AddAsync(Review review)
        => await _db.Reviews.AddAsync(review);

    public Task<int> SaveChangesAsync()
        => _db.SaveChangesAsync();
}
