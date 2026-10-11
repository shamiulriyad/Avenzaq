using Backend.Data;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public interface IProductVariantRepository
{
    Task<ProductVariant?> GetByIdAsync(Guid id);
    Task<ProductVariant?> GetBySkuAsync(string sku);
    Task<List<ProductVariant>> GetByProductIdAsync(Guid productId);
    Task<List<ProductVariant>> GetBySellerProductIdAsync(Guid sellerProductId);
    Task<ProductVariant> CreateAsync(ProductVariant variant);
    Task<ProductVariant> UpdateAsync(ProductVariant variant);
    Task DeleteAsync(Guid id);
    Task<List<ProductVariant>> GetAllAsync();
}

public class ProductVariantRepository : IProductVariantRepository
{
    private readonly MarketplaceDbContext _db;

    public ProductVariantRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public async Task<ProductVariant?> GetByIdAsync(Guid id)
    {
        return await _db.ProductVariants
            .Include(pv => pv.Images)
            .Include(pv => pv.SellerProduct)
            .FirstOrDefaultAsync(pv => pv.Id == id);
    }

    public async Task<ProductVariant?> GetBySkuAsync(string sku)
    {
        return await _db.ProductVariants
            .Include(pv => pv.Images)
            .Include(pv => pv.SellerProduct)
            .FirstOrDefaultAsync(pv => pv.SKU == sku);
    }

    public async Task<List<ProductVariant>> GetByProductIdAsync(Guid productId)
    {
        return await _db.ProductVariants
            .Where(pv => pv.ProductId == productId)
            .Include(pv => pv.Images)
            .Include(pv => pv.SellerProduct)
            .OrderBy(pv => pv.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<List<ProductVariant>> GetBySellerProductIdAsync(Guid sellerProductId)
    {
        return await _db.ProductVariants
            .Where(pv => pv.SellerProductId == sellerProductId)
            .Include(pv => pv.Images)
            .Include(pv => pv.SellerProduct)
            .OrderBy(pv => pv.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<ProductVariant> CreateAsync(ProductVariant variant)
    {
        _db.ProductVariants.Add(variant);
        await _db.SaveChangesAsync();
        return variant;
    }

    public async Task<ProductVariant> UpdateAsync(ProductVariant variant)
    {
        _db.ProductVariants.Update(variant);
        await _db.SaveChangesAsync();
        return variant;
    }

    public async Task DeleteAsync(Guid id)
    {
        var variant = await GetByIdAsync(id);
        if (variant != null)
        {
            _db.ProductVariants.Remove(variant);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<List<ProductVariant>> GetAllAsync()
    {
        return await _db.ProductVariants
            .Include(pv => pv.Images)
            .Include(pv => pv.SellerProduct)
            .ToListAsync();
    }
}
