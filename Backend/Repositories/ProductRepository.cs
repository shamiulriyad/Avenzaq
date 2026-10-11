using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly MarketplaceDbContext _db;

    public ProductRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public async Task<List<Product>> SearchAsync(string? search, Guid? categoryId, decimal? minPrice, decimal? maxPrice)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Include(p => p.Variants)
                .ThenInclude(v => v.Images)
            .Include(p => p.SellerProducts)
                .ThenInclude(sp => sp.Seller)
            .Include(p => p.SellerProducts)
                .ThenInclude(sp => sp.Variants)
                .ThenInclude(v => v.Images)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        return await query.Where(p => p.IsActive).ToListAsync();
    }

    public Task<Product?> GetByIdAsync(Guid id)
        => _db.Products
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .ThenInclude(r => r.Customer)
            .Include(p => p.Variants)
                .ThenInclude(v => v.Images)
            .Include(p => p.SellerProducts)
                .ThenInclude(sp => sp.Seller)
            .Include(p => p.SellerProducts)
                .ThenInclude(sp => sp.Variants)
                .ThenInclude(v => v.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task AddAsync(Product product)
        => await _db.Products.AddAsync(product);

    public void Update(Product product)
        => _db.Products.Update(product);

    public void Remove(Product product)
        => _db.Products.Remove(product);

    public Task<int> SaveChangesAsync()
        => _db.SaveChangesAsync();
}
