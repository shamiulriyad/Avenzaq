using Backend.DTOs.Cart;
using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;
    private readonly MarketplaceDbContext _db;

    public CartService(ICartRepository cartRepository, IProductRepository productRepository, MarketplaceDbContext db)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _db = db;
    }

    public async Task<CartDto> GetAsync(Guid customerId)
    {
        var cart = await EnsureCart(customerId);
        return Map(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid customerId, AddCartItemDto dto)
    {
        var cart = await EnsureCart(customerId);

        if (dto.Quantity <= 0)
        {
            throw new InvalidOperationException("Quantity must be greater than zero.");
        }

        var product = await _productRepository.GetByIdAsync(dto.ProductId)
            ?? throw new InvalidOperationException("Product not found.");

        var seller = await _db.SellerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == dto.SellerId)
            ?? throw new InvalidOperationException("Seller not found.");

        var sellerProduct = await _db.SellerProducts
            .AsNoTracking()
            .FirstOrDefaultAsync(sp => sp.ProductId == dto.ProductId && sp.SellerId == dto.SellerId)
            ?? throw new InvalidOperationException("This seller does not offer the selected product.");

        ProductVariant? variant = null;
        if (dto.VariantId.HasValue)
        {
            variant = await _db.ProductVariants
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == dto.VariantId.Value && v.SellerProductId == sellerProduct.Id && v.IsActive);

            if (variant == null)
            {
                throw new InvalidOperationException("Selected variant is not available for this seller.");
            }
        }

        var availableStock = variant?.Stock ?? product.StockQty;

        if (!product.IsActive || availableStock < dto.Quantity)
        {
            throw new InvalidOperationException("Product is not available in requested quantity.");
        }

        var existing = cart.Items.FirstOrDefault(i =>
            i.ProductId == dto.ProductId &&
            i.SellerId == dto.SellerId &&
            i.VariantId == dto.VariantId);

        var pricing = variant == null
            ? PricingHelper.Calculate(product.Price, null, null, null, null)
            : PricingHelper.Calculate(variant.Price, variant.DiscountType, variant.DiscountValue, variant.DiscountStart, variant.DiscountEnd);

        if (existing == null)
        {
            cart.Items.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                SellerId = seller.Id,
                VariantId = variant?.Id,
                Quantity = dto.Quantity,
                OriginalPrice = pricing.OriginalPrice,
                FinalPrice = pricing.FinalPrice,
                DiscountAmount = pricing.DiscountAmount,
                DiscountApplied = pricing.DiscountApplied,
                UnitPrice = pricing.FinalPrice
            });
        }
        else
        {
            existing.Quantity += dto.Quantity;
            if (existing.Quantity > availableStock)
            {
                throw new InvalidOperationException("Requested quantity exceeds available stock.");
            }
            existing.OriginalPrice = pricing.OriginalPrice;
            existing.FinalPrice = pricing.FinalPrice;
            existing.DiscountAmount = pricing.DiscountAmount;
            existing.DiscountApplied = pricing.DiscountApplied;
            existing.UnitPrice = pricing.FinalPrice;
        }

        await _cartRepository.SaveChangesAsync();
        var updated = await _cartRepository.GetByCustomerIdWithItemsAsync(customerId) ?? cart;
        return Map(updated);
    }

    public async Task<CartDto> UpdateItemAsync(Guid customerId, Guid itemId, int quantity)
    {
        var cart = await EnsureCart(customerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new InvalidOperationException("Cart item not found.");

        if (quantity <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            item.Quantity = quantity;
        }

        await _cartRepository.SaveChangesAsync();
        var updated = await _cartRepository.GetByCustomerIdWithItemsAsync(customerId) ?? cart;
        return Map(updated);
    }

    public async Task<CartDto> RemoveItemAsync(Guid customerId, Guid itemId)
    {
        var cart = await EnsureCart(customerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new InvalidOperationException("Cart item not found.");

        cart.Items.Remove(item);
        await _cartRepository.SaveChangesAsync();

        var updated = await _cartRepository.GetByCustomerIdWithItemsAsync(customerId) ?? cart;
        return Map(updated);
    }

    private async Task<Cart> EnsureCart(Guid customerId)
    {
        var cart = await _cartRepository.GetByCustomerIdWithItemsAsync(customerId);
        if (cart != null)
        {
            return cart;
        }

        cart = new Cart { CustomerId = customerId };
        await _cartRepository.AddAsync(cart);
        await _cartRepository.SaveChangesAsync();
        return cart;
    }

    private static CartDto Map(Cart cart)
    {
        var items = cart.Items.Select(i => new CartItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            SellerId = i.SellerId,
            VariantId = i.VariantId,
            ProductName = i.Product?.Name ?? string.Empty,
            SellerShopName = i.Seller?.ShopName ?? string.Empty,
            VariantLabel = i.Variant == null
                ? string.Empty
                : $"{i.Variant.Color}{(string.IsNullOrWhiteSpace(i.Variant.Size) ? string.Empty : " / " + i.Variant.Size)}",
            OriginalPrice = i.OriginalPrice,
            FinalPrice = i.FinalPrice,
            DiscountAmount = i.DiscountAmount,
            DiscountApplied = i.DiscountApplied,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity,
            LineTotal = i.FinalPrice * i.Quantity
        }).ToList();

        return new CartDto
        {
            Id = cart.Id,
            Items = items,
            TotalAmount = items.Sum(i => i.LineTotal)
        };
    }
}
