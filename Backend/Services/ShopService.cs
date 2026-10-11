using Backend.Data;
using Backend.DTOs.Shops;
using Backend.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ShopService : IShopService
{
    private readonly MarketplaceDbContext _db;

    public ShopService(MarketplaceDbContext db)
    {
        _db = db;
    }

    public async Task<List<ShopListItemDto>> GetAllApprovedShopsAsync()
    {
        return await _db.SellerProfiles
            .AsNoTracking()
            .Where(s => s.IsApproved)
            .OrderByDescending(s => s.CreatedAtUtc)
            .Select(s => new ShopListItemDto
            {
                Id = s.Id,
                Name = s.ShopName,
                Slug = s.ShopSlug,
                LogoUrl = s.LogoUrl,
                Rating = _db.Reviews
                    .Where(r => r.Product.SellerId == s.Id)
                    .Select(r => (decimal?)r.Rating)
                    .Average() ?? 0
            })
            .ToListAsync();
    }

    public async Task<ShopDetailsDto?> GetShopByIdAsync(Guid id)
    {
        var shop = await _db.SellerProfiles
            .AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.Id == id && s.IsApproved)
            .Select(s => new ShopDetailsDto
            {
                Id = s.Id,
                Name = s.ShopName,
                OwnerName = s.OwnerName ?? s.User.FullName,
                Slug = s.ShopSlug,
                Description = s.Description,
                LogoUrl = s.LogoUrl,
                BannerUrl = s.BannerUrl,
                Location = s.Location,
                UserId = s.UserId,
                Rating = _db.Reviews
                    .Where(r => r.Product.SellerId == s.Id)
                    .Select(r => (decimal?)r.Rating)
                    .Average() ?? 0
            })
            .FirstOrDefaultAsync();

        return shop;
    }

    public async Task<ShopDetailsDto?> GetShopBySlugAsync(string slug)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();

        var shop = await _db.SellerProfiles
            .AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.ShopSlug == normalizedSlug && s.IsApproved)
            .Select(s => new ShopDetailsDto
            {
                Id = s.Id,
                Name = s.ShopName,
                OwnerName = s.OwnerName ?? s.User.FullName,
                Slug = s.ShopSlug,
                Description = s.Description,
                LogoUrl = s.LogoUrl,
                BannerUrl = s.BannerUrl,
                Location = s.Location,
                UserId = s.UserId,
                Rating = _db.Reviews
                    .Where(r => r.Product.SellerId == s.Id)
                    .Select(r => (decimal?)r.Rating)
                    .Average() ?? 0
            })
            .FirstOrDefaultAsync();

        return shop;
    }

    public async Task<PagedResultDto<ShopProductListItemDto>> GetShopProductsAsync(
        Guid shopId,
        Guid? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        string? sort,
        int page,
        int pageSize)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 12 : Math.Min(pageSize, 100);

        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.SellerId == shopId && p.IsActive)
            .AsQueryable();

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

        query = (sort ?? string.Empty).ToLowerInvariant() switch
        {
            "price-low-high" => query.OrderBy(p => p.Price),
            "price-high-low" => query.OrderByDescending(p => p.Price),
            _ => query.OrderByDescending(p => p.CreatedAtUtc)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ShopProductListItemDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.Images
                    .OrderByDescending(i => i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault(),
                SellerId = p.SellerId,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return new PagedResultDto<ShopProductListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ShopDetailsDto?> GetShopByUserIdAsync(Guid userId)
    {
        var shop = await _db.SellerProfiles
            .AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.UserId == userId)
            .Select(s => new ShopDetailsDto
            {
                Id = s.Id,
                Name = s.ShopName,
                OwnerName = s.OwnerName,
                Slug = s.ShopSlug,
                Description = s.Description,
                LogoUrl = s.LogoUrl,
                BannerUrl = s.BannerUrl,
                Location = s.Location,
                UserId = s.UserId,
                Rating = _db.Reviews
                    .Where(r => r.Product.SellerId == s.Id)
                    .Select(r => (decimal?)r.Rating)
                    .Average() ?? 0
            })
            .FirstOrDefaultAsync();

        return shop;
    }

    public async Task<ShopPageDto?> GetShopPageBySlugAsync(string slug)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();

        var shopEntity = await _db.SellerProfiles
            .AsNoTracking()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.ShopSlug == normalizedSlug && s.IsApproved);

        if (shopEntity == null)
        {
            return null;
        }

        var shopId = shopEntity.Id;

        var productsQuery = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.SellerId == shopId && p.IsActive)
            .OrderByDescending(p => p.CreatedAtUtc);

        var products = await productsQuery
            .Select(p => new ShopProductListItemDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.Images
                    .OrderByDescending(i => i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault(),
                SellerId = p.SellerId,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        var categories = products
            .GroupBy(p => new { p.CategoryId, p.CategoryName })
            .Select(group => new ShopCategoryDto
            {
                Id = group.Key.CategoryId,
                Name = group.Key.CategoryName,
                Slug = group.Key.CategoryName.Trim().ToLowerInvariant().Replace(" ", "-"),
                ProductCount = group.Count()
            })
            .OrderBy(category => category.Name)
            .ToList();

        return new ShopPageDto
        {
            Shop = new ShopDetailsDto
            {
                Id = shopEntity.Id,
                Name = shopEntity.ShopName,
                OwnerName = shopEntity.OwnerName ?? shopEntity.User.FullName,
                Slug = shopEntity.ShopSlug,
                Description = shopEntity.Description,
                LogoUrl = shopEntity.LogoUrl,
                BannerUrl = shopEntity.BannerUrl,
                Location = shopEntity.Location,
                UserId = shopEntity.UserId,
                Rating = await _db.Reviews
                    .Where(r => r.Product.SellerId == shopId)
                    .Select(r => (decimal?)r.Rating)
                    .AverageAsync() ?? 0
            },
            Categories = categories,
            Products = products
        };
    }

    public async Task<PagedResultDto<ShopProductListItemDto>> GetShopProductsBySlugAsync(
        string shopSlug,
        Guid? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        string? sort,
        int page,
        int pageSize)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 12 : Math.Min(pageSize, 100);

        var normalizedSlug = shopSlug.Trim().ToLowerInvariant();

        var shopId = await _db.SellerProfiles
            .AsNoTracking()
            .Where(s => s.ShopSlug == normalizedSlug && s.IsApproved)
            .Select(s => (Guid?)s.Id)
            .FirstOrDefaultAsync();

        if (!shopId.HasValue)
        {
            return new PagedResultDto<ShopProductListItemDto>
            {
                Items = new List<ShopProductListItemDto>(),
                Page = page,
                PageSize = pageSize,
                TotalCount = 0
            };
        }

        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.SellerId == shopId && p.IsActive)
            .AsQueryable();

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

        query = (sort ?? string.Empty).ToLowerInvariant() switch
        {
            "price-low-high" => query.OrderBy(p => p.Price),
            "price-high-low" => query.OrderByDescending(p => p.Price),
            _ => query.OrderByDescending(p => p.CreatedAtUtc)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ShopProductListItemDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.Images
                    .OrderByDescending(i => i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault(),
                SellerId = p.SellerId,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return new PagedResultDto<ShopProductListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public Task<List<ShopReviewDto>> GetShopReviewsAsync(Guid shopId)
        => _db.Reviews
            .AsNoTracking()
            .Where(r => r.Product.SellerId == shopId)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new ShopReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product.Name,
                UserId = r.CustomerId,
                UserName = r.Customer.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAtUtc = r.CreatedAtUtc
            })
            .ToListAsync();
}
