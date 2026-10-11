using Backend.Data;
using Backend.DTOs.Products;
using Backend.Interfaces.Repositories;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ISellerRepository _sellerRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly MarketplaceDbContext _db;

    public ProductService(
        IProductRepository productRepository,
        ISellerRepository sellerRepository,
        ICategoryRepository categoryRepository,
        MarketplaceDbContext db)
    {
        _productRepository = productRepository;
        _sellerRepository = sellerRepository;
        _categoryRepository = categoryRepository;
        _db = db;
    }

    public async Task<List<ProductListItemDto>> SearchAsync(string? search, Guid? categoryId, decimal? minPrice, decimal? maxPrice)
    {
        var products = await _productRepository.SearchAsync(search, categoryId, minPrice, maxPrice);
        return products.Select(MapToListDto).ToList();
    }

    public async Task<ProductDetailsDto?> GetByIdAsync(Guid id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
        {
            return null;
        }

        return MapToDetailsDto(product);
    }

    // New method for full product details with seller information
    public async Task<ProductDetailsFullDto?> GetByIdFullAsync(Guid id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
        {
            return null;
        }

        return MapToDetailsFullDto(product);
    }

    public async Task<ProductDetailsDto> CreateAsync(Guid sellerUserId, ProductCreateDto dto)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(sellerUserId)
            ?? throw new InvalidOperationException("Seller profile not found.");

        // Allow product creation for all sellers during development 
        // In production, remove this comment and uncomment the check below:
        // if (!seller.IsApproved)
        // {
        //     throw new UnauthorizedAccessException("Seller profile is pending admin approval.");
        // }

        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(dto.CategoryId)
            ?? throw new InvalidOperationException($"Category with ID '{dto.CategoryId}' not found.");

        var product = new Product
        {
            SellerId = seller.Id,
            CategoryId = dto.CategoryId,
            Name = dto.Name.Trim(),
            Slug = Slugify(dto.Name),
            Description = dto.Description,
            Price = dto.Price,
            StockQty = dto.StockQty,
            IsActive = true
        };

        await _productRepository.AddAsync(product);
        await _productRepository.SaveChangesAsync();

        await _db.SellerProducts.AddAsync(new SellerProduct
        {
            ProductId = product.Id,
            SellerId = seller.Id
        });
        await _db.SaveChangesAsync();

        var loaded = await _productRepository.GetByIdAsync(product.Id) ?? product;
        return MapToDetailsDto(loaded);
    }

    public async Task<bool> UpdateAsync(Guid sellerUserId, Guid id, ProductUpdateDto dto)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(sellerUserId);
        if (seller == null)
        {
            return false;
        }

        // Allow product updates for all sellers during development
        // In production, remove this comment and uncomment the check below:
        // if (!seller.IsApproved)
        // {
        //     throw new UnauthorizedAccessException("Seller profile is pending admin approval.");
        // }

        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
        {
            return false;
        }

        var sellerOwnsProduct = product.SellerId == seller.Id
            || await _db.SellerProducts.AnyAsync(sp => sp.ProductId == product.Id && sp.SellerId == seller.Id);

        if (!sellerOwnsProduct)
        {
            return false;
        }

        // Validate category exists if CategoryId is being changed
        if (dto.CategoryId != product.CategoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId)
                ?? throw new InvalidOperationException($"Category with ID '{dto.CategoryId}' not found.");
        }

        product.CategoryId = dto.CategoryId;
        product.Name = dto.Name.Trim();
        product.Slug = Slugify(dto.Name);
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQty = dto.StockQty;
        product.IsActive = dto.IsActive;

        _productRepository.Update(product);
        await _productRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid sellerUserId, Guid id)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(sellerUserId);
        if (seller == null)
        {
            return false;
        }

        if (!seller.IsApproved)
        {
            throw new UnauthorizedAccessException("Seller profile is pending admin approval.");
        }

        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
        {
            return false;
        }

        var sellerOwnsProduct = product.SellerId == seller.Id
            || await _db.SellerProducts.AnyAsync(sp => sp.ProductId == product.Id && sp.SellerId == seller.Id);

        if (!sellerOwnsProduct)
        {
            return false;
        }

        // Check if product has associated OrderItems (orders prevent deletion)
        var hasOrders = await _db.OrderItems.AnyAsync(oi => oi.ProductId == id);
        
        if (hasOrders)
        {
            throw new InvalidOperationException(
                "Cannot delete product that has been ordered. Please contact support if you need to remove this product.");
        }

        try
        {
            var productVariantIds = await _db.ProductVariants
                .Where(v => v.ProductId == id)
                .Select(v => v.Id)
                .ToListAsync();

            var relatedCartItems = await _db.CartItems
                .Where(ci => ci.ProductId == id || (ci.VariantId.HasValue && productVariantIds.Contains(ci.VariantId.Value)))
                .ToListAsync();

            if (relatedCartItems.Count > 0)
            {
                _db.CartItems.RemoveRange(relatedCartItems);
            }

            var productImages = await _db.ProductImages
                .Where(i => i.ProductId == id)
                .ToListAsync();

            if (productImages.Count > 0)
            {
                _db.ProductImages.RemoveRange(productImages);
            }

            var productVariants = await _db.ProductVariants
                .Where(v => v.ProductId == id)
                .ToListAsync();

            if (productVariants.Count > 0)
            {
                _db.ProductVariants.RemoveRange(productVariants);
            }

            var sellerProducts = await _db.SellerProducts
                .Where(sp => sp.ProductId == id)
                .ToListAsync();

            if (sellerProducts.Count > 0)
            {
                _db.SellerProducts.RemoveRange(sellerProducts);
            }

            _productRepository.Remove(product);
            await _productRepository.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException ex)
        {
            // Catch constraint violations or other database errors
            throw new InvalidOperationException(
                "Failed to delete product. The product may have associated orders or other active relationships. Please try again or contact support.",
                ex);
        }
    }

    public async Task<bool> AddImageAsync(Guid sellerUserId, Guid productId, string imageUrl)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(sellerUserId);
        if (seller == null)
        {
            return false;
        }

        // Allow image uploads for all sellers during development
        // In production, remove this comment and uncomment the check below:
        // if (!seller.IsApproved)
        // {
        //     throw new UnauthorizedAccessException("Seller profile is pending admin approval.");
        // }

        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null)
        {
            return false;
        }

        var sellerOwnsProduct = product.SellerId == seller.Id
            || await _db.SellerProducts.AnyAsync(sp => sp.ProductId == product.Id && sp.SellerId == seller.Id);

        if (!sellerOwnsProduct)
        {
            return false;
        }

        var isPrimary = !await _db.ProductImages.AnyAsync(i => i.ProductId == product.Id);

        await _db.ProductImages.AddAsync(new ProductImage
        {
            ProductId = product.Id,
            ImageUrl = imageUrl,
            IsPrimary = isPrimary
        });

        await _productRepository.SaveChangesAsync();
        return true;
    }

    private static ProductListItemDto MapToListDto(Product p) => new()
    {
        Id = p.Id,
        SellerId = p.SellerProducts.FirstOrDefault()?.SellerId ?? p.SellerId,
        Name = p.Name,
        Slug = p.Slug,
        Price = GetBestPricing(p).OriginalPrice,
        FinalPrice = GetBestPricing(p).FinalPrice,
        DiscountType = GetBestPricing(p).DiscountType,
        DiscountValue = GetBestPricing(p).DiscountValue,
        DiscountLabel = GetBestPricing(p).DiscountLabel,
        StockQty = p.SellerProducts
                    .SelectMany(sp => sp.Variants)
                    .Where(v => v.IsActive)
                    .Select(v => v.Stock)
                    .DefaultIfEmpty(p.StockQty)
                    .Sum(),
        CategoryName = p.Category?.Name ?? string.Empty,
        SellerShopName = p.SellerProducts.FirstOrDefault()?.Seller?.ShopName ?? p.Seller?.ShopName ?? string.Empty,
        SellerShopSlug = p.SellerProducts.FirstOrDefault()?.Seller?.ShopSlug ?? p.Seller?.ShopSlug ?? string.Empty,
        // Use primary image if exists, otherwise null (no placeholder)
        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
        // Include all images
        Images = p.Images.Select(i => i.ImageUrl).ToList()
    };

    private static ProductDetailsDto MapToDetailsDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        Price = GetBestPricing(p).OriginalPrice,
        FinalPrice = GetBestPricing(p).FinalPrice,
        DiscountType = GetBestPricing(p).DiscountType,
        DiscountValue = GetBestPricing(p).DiscountValue,
        DiscountLabel = GetBestPricing(p).DiscountLabel,
        StockQty = p.SellerProducts
                    .SelectMany(sp => sp.Variants)
                    .Where(v => v.IsActive)
                    .Select(v => v.Stock)
                    .DefaultIfEmpty(p.StockQty)
                    .Sum(),
        CategoryName = p.Category?.Name ?? string.Empty,
        SellerShopName = p.SellerProducts.FirstOrDefault()?.Seller?.ShopName ?? p.Seller?.ShopName ?? string.Empty,
        // Use primary image if exists, otherwise null (no placeholder)
        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
        Description = p.Description,
        IsActive = p.IsActive,
        // Return actual stored images only, no placeholders
        Images = p.Images.Select(i => i.ImageUrl).ToList(),
        AverageRating = p.Reviews.Count == 0 ? 0 : p.Reviews.Average(r => r.Rating)
    };

    /// <summary>
    /// Maps Product entity to full DTO including all seller details and reviews
    /// Used for Product Details page with comprehensive information
    /// </summary>
    private static ProductDetailsFullDto MapToDetailsFullDto(Product p) => new()
    {
        // Base product info
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        Price = GetBestPricing(p).OriginalPrice,
        FinalPrice = GetBestPricing(p).FinalPrice,
        DiscountType = GetBestPricing(p).DiscountType,
        DiscountValue = GetBestPricing(p).DiscountValue,
        DiscountLabel = GetBestPricing(p).DiscountLabel,
        StockQty = p.SellerProducts
                .SelectMany(sp => sp.Variants)
                .Where(v => v.IsActive)
                .Select(v => v.Stock)
                .DefaultIfEmpty(p.StockQty)
                .Sum(),
        SellerId = p.SellerProducts.FirstOrDefault()?.SellerId ?? p.SellerId,
        CategoryId = p.CategoryId,
        
        // Category info
        CategoryName = p.Category?.Name ?? string.Empty,
        
        // Seller basic info
        SellerShopName = p.Seller?.ShopName ?? string.Empty,
        SellerShopSlug = p.Seller?.ShopSlug ?? string.Empty,
        // Use primary image if exists, otherwise null (no placeholder)
        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
        
        // Product images and description
        Description = p.Description,
        IsActive = p.IsActive,
        // Return actual stored images only (no auto-generated placeholders)
        Images = p.Images.Select(i => i.ImageUrl).ToList(),
        
        // Ratings and reviews
        AverageRating = p.Reviews.Count == 0 ? 0 : p.Reviews.Average(r => r.Rating),
        ReviewCount = p.Reviews.Count,
        
        // Full seller object with details
        Seller = p.Seller == null ? null : new SellerSummaryDto
        {
            Id = p.Seller.Id,
            Name = p.Seller.ShopName,
            ShopSlug = p.Seller.ShopSlug,
            LogoUrl = p.Seller.LogoUrl,
            BannerUrl = p.Seller.BannerUrl,
            IsVerified = p.Seller.IsApproved,  // Use IsApproved as verified status
            Location = p.Seller.Location,
            Description = p.Seller.Description,
            AcceptsCOD = p.Seller.AcceptsCOD,
            ProcessingTime = p.Seller.ProcessingTime,
            
            // Seller reputation: average rating and review count from shop's products
            // Check if any products have reviews before calling Average (prevents "Sequence contains no elements" error)
            AverageRating = p.Seller.Products.Any(pr => pr.Reviews.Count > 0) ? 
                            p.Seller.Products.Where(pr => pr.Reviews.Count > 0)
                                            .Average(pr => pr.Reviews.Average(r => r.Rating)) : 0,
            TotalReviews = p.Seller.Products.SelectMany(pr => pr.Reviews).Count()
        },
        Sellers = p.SellerProducts.Any()
            ? p.SellerProducts
                .Select(sp => new ProductSellerVariantsDto
                {
                    SellerProductId = sp.Id,
                    SellerId = sp.SellerId,
                    ShopName = sp.Seller?.ShopName ?? string.Empty,
                    ShopSlug = sp.Seller?.ShopSlug ?? string.Empty,
                    IsVerified = sp.Seller?.IsApproved ?? false,
                    AverageRating = sp.Seller == null
                        ? 0
                        : (sp.Seller.Products.Any(pr => pr.Reviews.Count > 0)
                            ? sp.Seller.Products.Where(pr => pr.Reviews.Count > 0)
                                .Average(pr => pr.Reviews.Average(r => r.Rating))
                            : 0),
                    TotalReviews = sp.Seller?.Products.SelectMany(pr => pr.Reviews).Count() ?? 0,
                    Variants = sp.Variants
                        .OrderBy(v => v.CreatedAtUtc)
                        .Select(v => new ProductVariantDto
                        {
                            Id = v.Id,
                            ProductId = p.Id,
                            SellerProductId = sp.Id,
                            SellerId = sp.SellerId,
                            Color = v.Color,
                            Size = v.Size,
                            Price = v.Price,
                            FinalPrice = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).FinalPrice,
                            DiscountType = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).DiscountType,
                            DiscountValue = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).DiscountValue,
                            DiscountStart = v.DiscountStart,
                            DiscountEnd = v.DiscountEnd,
                            DiscountLabel = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).DiscountLabel,
                            Stock = v.Stock,
                            SKU = v.SKU,
                            IsActive = v.IsActive,
                            Images = v.Images
                                .OrderBy(i => i.DisplayOrder)
                                .Select(i => new VariantImageDto
                                {
                                    Id = i.Id,
                                    VariantId = i.VariantId,
                                    ImageUrl = i.ImageUrl,
                                    FileName = i.FileName,
                                    DisplayOrder = i.DisplayOrder,
                                    IsPrimary = i.IsPrimary
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .OrderBy(s => s.ShopName)
                .ToList()
            : new List<ProductSellerVariantsDto>
            {
                new()
                {
                    SellerProductId = Guid.Empty,
                    SellerId = p.SellerId,
                    ShopName = p.Seller?.ShopName ?? string.Empty,
                    ShopSlug = p.Seller?.ShopSlug ?? string.Empty,
                    IsVerified = p.Seller?.IsApproved ?? false,
                    AverageRating = p.Seller?.Products.Any(pr => pr.Reviews.Count > 0) == true
                        ? p.Seller.Products.Where(pr => pr.Reviews.Count > 0)
                            .Average(pr => pr.Reviews.Average(r => r.Rating))
                        : 0,
                    TotalReviews = p.Seller?.Products.SelectMany(pr => pr.Reviews).Count() ?? 0,
                    Variants = p.Variants
                        .OrderBy(v => v.CreatedAtUtc)
                        .Select(v => new ProductVariantDto
                        {
                            Id = v.Id,
                            ProductId = p.Id,
                            SellerProductId = v.SellerProductId,
                            SellerId = p.SellerId,
                            Color = v.Color,
                            Size = v.Size,
                            Price = v.Price,
                            FinalPrice = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).FinalPrice,
                            DiscountType = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).DiscountType,
                            DiscountValue = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).DiscountValue,
                            DiscountStart = v.DiscountStart,
                            DiscountEnd = v.DiscountEnd,
                            DiscountLabel = PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd).DiscountLabel,
                            Stock = v.Stock,
                            SKU = v.SKU,
                            IsActive = v.IsActive,
                            Images = v.Images
                                .OrderBy(i => i.DisplayOrder)
                                .Select(i => new VariantImageDto
                                {
                                    Id = i.Id,
                                    VariantId = i.VariantId,
                                    ImageUrl = i.ImageUrl,
                                    FileName = i.FileName,
                                    DisplayOrder = i.DisplayOrder,
                                    IsPrimary = i.IsPrimary
                                })
                                .ToList()
                        })
                        .ToList()
                }
            },
        
        // Recent reviews (limited to 5 most recent)
        RecentReviews = p.Reviews
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(5)
            .Select(r => new ReviewSummaryDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                CustomerName = r.Customer?.Email?.Split('@')[0] ?? "Anonymous",
                CreatedAtUtc = r.CreatedAtUtc
            })
            .ToList()
    };

    private static string Slugify(string input)
        => input.Trim().ToLowerInvariant().Replace(" ", "-");

    private static PriceCalculationResult GetBestPricing(Product product)
    {
        var variantPricing = product.SellerProducts
            .SelectMany(sp => sp.Variants)
            .Where(v => v.IsActive)
            .Select(v => PricingHelper.Calculate(v.Price, v.DiscountType, v.DiscountValue, v.DiscountStart, v.DiscountEnd))
            .OrderBy(result => result.FinalPrice)
            .ThenBy(result => result.OriginalPrice)
            .FirstOrDefault();

        return variantPricing ?? PricingHelper.Calculate(product.Price, null, null, null, null);
    }
}
