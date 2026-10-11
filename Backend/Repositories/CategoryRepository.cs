using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly MarketplaceDbContext _db;

    public CategoryRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public Task<List<Category>> GetAllAsync()
        => _db.Categories.OrderBy(x => x.Name).ToListAsync();

    public Task<Category?> GetByIdAsync(Guid id)
        => _db.Categories.FirstOrDefaultAsync(x => x.Id == id);

    public Task<Category?> GetByNameAsync(string name)
        => _db.Categories.FirstOrDefaultAsync(x => x.Name.ToLower() == name.ToLower());

    public Task<Category?> GetBySlugAsync(string slug)
        => _db.Categories.FirstOrDefaultAsync(x => x.Slug == slug);

    public async Task AddAsync(Category category)
        => await _db.Categories.AddAsync(category);

    public void Update(Category category)
        => _db.Categories.Update(category);

    public void Remove(Category category)
        => _db.Categories.Remove(category);

    public Task<int> SaveChangesAsync()
        => _db.SaveChangesAsync();
}
