using Backend.Models.Entities;

namespace Backend.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(Guid id);
    Task<Category?> GetByNameAsync(string name);
    Task<Category?> GetBySlugAsync(string slug);
    Task AddAsync(Category category);
    void Update(Category category);
    void Remove(Category category);
    Task<int> SaveChangesAsync();
}
