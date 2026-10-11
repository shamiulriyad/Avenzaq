using Backend.Models.Entities;

namespace Backend.Interfaces.Repositories;

public interface IProductRepository
{
    Task<List<Product>> SearchAsync(string? search, Guid? categoryId, decimal? minPrice, decimal? maxPrice);
    Task<Product?> GetByIdAsync(Guid id);
    Task AddAsync(Product product);
    void Update(Product product);
    void Remove(Product product);
    Task<int> SaveChangesAsync();
}
