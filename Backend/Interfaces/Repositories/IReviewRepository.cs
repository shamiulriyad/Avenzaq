using Backend.Models.Entities;

namespace Backend.Interfaces.Repositories;

public interface IReviewRepository
{
    Task<List<Review>> GetByProductIdAsync(Guid productId);
    Task AddAsync(Review review);
    Task<int> SaveChangesAsync();
}
