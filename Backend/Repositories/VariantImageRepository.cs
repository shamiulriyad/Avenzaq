using Backend.Data;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public interface IVariantImageRepository
{
    Task<VariantImage?> GetByIdAsync(Guid id);
    Task<List<VariantImage>> GetByVariantIdAsync(Guid variantId);
    Task<VariantImage?> GetPrimaryImageAsync(Guid variantId);
    Task<VariantImage> CreateAsync(VariantImage image);
    Task<VariantImage> UpdateAsync(VariantImage image);
    Task DeleteAsync(Guid id);
    Task DeleteByVariantIdAsync(Guid variantId);
}

public class VariantImageRepository : IVariantImageRepository
{
    private readonly MarketplaceDbContext _db;

    public VariantImageRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public async Task<VariantImage?> GetByIdAsync(Guid id)
    {
        return await _db.VariantImages
            .FirstOrDefaultAsync(vi => vi.Id == id);
    }

    public async Task<List<VariantImage>> GetByVariantIdAsync(Guid variantId)
    {
        return await _db.VariantImages
            .Where(vi => vi.VariantId == variantId)
            .OrderBy(vi => vi.DisplayOrder)
            .ToListAsync();
    }

    public async Task<VariantImage?> GetPrimaryImageAsync(Guid variantId)
    {
        return await _db.VariantImages
            .FirstOrDefaultAsync(vi => vi.VariantId == variantId && vi.IsPrimary);
    }

    public async Task<VariantImage> CreateAsync(VariantImage image)
    {
        _db.VariantImages.Add(image);
        await _db.SaveChangesAsync();
        return image;
    }

    public async Task<VariantImage> UpdateAsync(VariantImage image)
    {
        _db.VariantImages.Update(image);
        await _db.SaveChangesAsync();
        return image;
    }

    public async Task DeleteAsync(Guid id)
    {
        var image = await GetByIdAsync(id);
        if (image != null)
        {
            _db.VariantImages.Remove(image);
            await _db.SaveChangesAsync();
        }
    }

    public async Task DeleteByVariantIdAsync(Guid variantId)
    {
        var images = await GetByVariantIdAsync(variantId);
        if (images.Count > 0)
        {
            _db.VariantImages.RemoveRange(images);
            await _db.SaveChangesAsync();
        }
    }
}
