using Backend.DTOs.Products;
using Backend.Data;
using Backend.Models.Entities;
using Backend.Repositories;
using Backend.Interfaces.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IProductVariantService
{
    Task<ProductVariantDto> CreateVariantAsync(Guid sellerUserId, Guid productId, ProductVariantCreateDto dto);
    Task<ProductVariantDto?> GetVariantAsync(Guid id);
    Task<ProductVariantDto?> GetVariantBySkuAsync(string sku);
    Task<List<ProductVariantDto>> GetProductVariantsAsync(Guid productId);
    Task<ProductVariantDto> UpdateVariantAsync(Guid id, ProductVariantUpdateDto dto);
    Task DeleteVariantAsync(Guid id);
    Task<VariantImageDto> AddImageAsync(Guid variantId, IFormFile file, int displayOrder = 0, bool isPrimary = false);
    Task<List<VariantImageDto>> AddMultipleImagesAsync(Guid variantId, List<IFormFile> files);
    Task DeleteImageAsync(Guid imageId);
    Task<List<VariantImageDto>> GetVariantImagesAsync(Guid variantId);
}

public class ProductVariantService : IProductVariantService
{
    private readonly IProductVariantRepository _variantRepo;
    private readonly IVariantImageRepository _imageRepo;
    private readonly IFileUploadService _fileUploadService;
    private readonly IProductRepository _productRepo;
    private readonly ISellerRepository _sellerRepository;
    private readonly MarketplaceDbContext _db;

    public ProductVariantService(
        IProductVariantRepository variantRepo,
        IVariantImageRepository imageRepo,
        IFileUploadService fileUploadService,
        IProductRepository productRepo,
        ISellerRepository sellerRepository,
        MarketplaceDbContext db)
    {
        _variantRepo = variantRepo;
        _imageRepo = imageRepo;
        _fileUploadService = fileUploadService;
        _productRepo = productRepo;
        _sellerRepository = sellerRepository;
        _db = db;
    }

    public async Task<ProductVariantDto> CreateVariantAsync(Guid sellerUserId, Guid productId, ProductVariantCreateDto dto)
    {
        // Verify product exists
        var product = await _productRepo.GetByIdAsync(productId);
        if (product == null)
            throw new InvalidOperationException($"Product with ID {productId} not found");

        var seller = await _sellerRepository.GetByUserIdAsync(sellerUserId)
            ?? throw new InvalidOperationException("Seller profile not found");

        // Check SKU uniqueness
        var existingVariant = await _variantRepo.GetBySkuAsync(dto.SKU);
        if (existingVariant != null)
            throw new InvalidOperationException($"SKU '{dto.SKU}' already exists");

        var sellerProduct = await _db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.ProductId == productId && sp.SellerId == seller.Id);

        if (sellerProduct == null)
        {
            sellerProduct = new SellerProduct
            {
                ProductId = productId,
                SellerId = seller.Id
            };

            await _db.SellerProducts.AddAsync(sellerProduct);
            await _db.SaveChangesAsync();
        }

        var variant = new ProductVariant
        {
            ProductId = productId,
            SellerProductId = sellerProduct.Id,
            Color = dto.Color,
            Size = dto.Size,
            Price = dto.Price,
            Stock = dto.Stock,
            SKU = dto.SKU,
            IsActive = true,
            DiscountType = string.IsNullOrWhiteSpace(dto.DiscountType) ? null : dto.DiscountType.Trim().ToLowerInvariant(),
            DiscountValue = dto.DiscountValue,
            DiscountStart = dto.DiscountStart,
            DiscountEnd = dto.DiscountEnd
        };

        await _variantRepo.CreateAsync(variant);
        return MapToDto(variant);
    }

    public async Task<ProductVariantDto?> GetVariantAsync(Guid id)
    {
        var variant = await _variantRepo.GetByIdAsync(id);
        return variant == null ? null : MapToDto(variant);
    }

    public async Task<ProductVariantDto?> GetVariantBySkuAsync(string sku)
    {
        var variant = await _variantRepo.GetBySkuAsync(sku);
        return variant == null ? null : MapToDto(variant);
    }

    public async Task<List<ProductVariantDto>> GetProductVariantsAsync(Guid productId)
    {
        var variants = await _variantRepo.GetByProductIdAsync(productId);
        return variants.Select(MapToDto).ToList();
    }

    public async Task<ProductVariantDto> UpdateVariantAsync(Guid id, ProductVariantUpdateDto dto)
    {
        var variant = await _variantRepo.GetByIdAsync(id);
        if (variant == null)
            throw new InvalidOperationException($"Variant with ID {id} not found");

        if (!string.IsNullOrEmpty(dto.SKU) && dto.SKU != variant.SKU)
        {
            var existingVariant = await _variantRepo.GetBySkuAsync(dto.SKU);
            if (existingVariant != null)
                throw new InvalidOperationException($"SKU '{dto.SKU}' already exists");
            variant.SKU = dto.SKU;
        }

        if (!string.IsNullOrEmpty(dto.Color))
            variant.Color = dto.Color;

        if (!string.IsNullOrEmpty(dto.Size))
            variant.Size = dto.Size;

        if (dto.Price.HasValue)
            variant.Price = dto.Price.Value;

        if (dto.Stock.HasValue)
            variant.Stock = dto.Stock.Value;

        if (dto.IsActive.HasValue)
            variant.IsActive = dto.IsActive.Value;

        if (dto.DiscountType != null)
            variant.DiscountType = string.IsNullOrWhiteSpace(dto.DiscountType) ? null : dto.DiscountType.Trim().ToLowerInvariant();

        if (dto.DiscountValue.HasValue)
            variant.DiscountValue = dto.DiscountValue.Value;

        if (dto.DiscountStart.HasValue || dto.DiscountStart == null)
            variant.DiscountStart = dto.DiscountStart;

        if (dto.DiscountEnd.HasValue || dto.DiscountEnd == null)
            variant.DiscountEnd = dto.DiscountEnd;

        await _variantRepo.UpdateAsync(variant);
        return MapToDto(variant);
    }

    public async Task DeleteVariantAsync(Guid id)
    {
        await _variantRepo.DeleteAsync(id);
    }

    public async Task<VariantImageDto> AddImageAsync(Guid variantId, IFormFile file, int displayOrder = 0, bool isPrimary = false)
    {
        var variant = await _variantRepo.GetByIdAsync(variantId);
        if (variant == null)
            throw new InvalidOperationException($"Variant with ID {variantId} not found");

        var uploadResult = await _fileUploadService.UploadImageAsync(file, "variants");
        
        // If setting as primary, unset other primary images
        if (isPrimary)
        {
            var existingImages = await _imageRepo.GetByVariantIdAsync(variantId);
            foreach (var img in existingImages.Where(i => i.IsPrimary))
            {
                img.IsPrimary = false;
                await _imageRepo.UpdateAsync(img);
            }
        }

        var image = new VariantImage
        {
            VariantId = variantId,
            ImageUrl = uploadResult.ImageUrl,
            FileName = uploadResult.FileName,
            DisplayOrder = displayOrder,
            IsPrimary = isPrimary
        };

        await _imageRepo.CreateAsync(image);
        return MapImageToDto(image);
    }

    public async Task<List<VariantImageDto>> AddMultipleImagesAsync(Guid variantId, List<IFormFile> files)
    {
        var images = new List<VariantImageDto>();
        int displayOrder = 0;

        foreach (var file in files)
        {
            bool isPrimary = displayOrder == 0; // First image is primary
            var image = await AddImageAsync(variantId, file, displayOrder, isPrimary);
            images.Add(image);
            displayOrder++;
        }

        return images;
    }

    public async Task DeleteImageAsync(Guid imageId)
    {
        var image = await _imageRepo.GetByIdAsync(imageId);
        if (image != null)
        {
            await _fileUploadService.DeleteImageAsync(image.FileName);
            await _imageRepo.DeleteAsync(imageId);
        }
    }

    public async Task<List<VariantImageDto>> GetVariantImagesAsync(Guid variantId)
    {
        var images = await _imageRepo.GetByVariantIdAsync(variantId);
        return images.Select(MapImageToDto).ToList();
    }

    private ProductVariantDto MapToDto(ProductVariant variant)
    {
        var pricing = PricingHelper.Calculate(
            variant.Price,
            variant.DiscountType,
            variant.DiscountValue,
            variant.DiscountStart,
            variant.DiscountEnd);

        return new ProductVariantDto
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
            SellerProductId = variant.SellerProductId,
            SellerId = variant.SellerProduct?.SellerId ?? Guid.Empty,
            Color = variant.Color,
            Size = variant.Size,
            Price = variant.Price,
            FinalPrice = pricing.FinalPrice,
            DiscountType = pricing.DiscountType,
            DiscountValue = pricing.DiscountValue,
            DiscountStart = variant.DiscountStart,
            DiscountEnd = variant.DiscountEnd,
            DiscountLabel = pricing.DiscountLabel,
            Stock = variant.Stock,
            SKU = variant.SKU,
            IsActive = variant.IsActive,
            Images = variant.Images.Select(MapImageToDto).ToList()
        };
    }

    private VariantImageDto MapImageToDto(VariantImage image)
    {
        return new VariantImageDto
        {
            Id = image.Id,
            VariantId = image.VariantId,
            ImageUrl = image.ImageUrl,
            FileName = image.FileName,
            DisplayOrder = image.DisplayOrder,
            IsPrimary = image.IsPrimary
        };
    }
}
