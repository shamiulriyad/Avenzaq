using Backend.DTOs.Shops;
using Backend.Interfaces.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShopsController : ControllerBase
{
    private readonly IShopService _shopService;

    public ShopsController(IShopService shopService)
    {
        _shopService = shopService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ShopListItemDto>>> GetAll()
    {
        var shops = await _shopService.GetAllApprovedShopsAsync();
        return Ok(shops);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ShopDetailsDto>> GetById(Guid id)
    {
        var shop = await _shopService.GetShopByIdAsync(id);
        if (shop == null)
        {
            return NotFound(new { message = "Shop not found." });
        }

        return Ok(shop);
    }

    [HttpGet("slug/{shopSlug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ShopDetailsDto>> GetBySlug(string shopSlug)
    {
        var shop = await _shopService.GetShopBySlugAsync(shopSlug);
        if (shop == null)
        {
            return NotFound(new { message = "Shop not found." });
        }

        return Ok(shop);
    }

    [HttpGet("{shopSlug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ShopPageDto>> GetShopPage(string shopSlug)
    {
        var shopPage = await _shopService.GetShopPageBySlugAsync(shopSlug);
        if (shopPage == null)
        {
            return NotFound(new { message = "Shop not found." });
        }

        return Ok(shopPage);
    }

    [HttpGet("me/shop")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<ShopDetailsDto>> GetMyShop()
    {
        var shop = await _shopService.GetShopByUserIdAsync(User.GetUserId());
        if (shop == null)
        {
            return NotFound(new { message = "Seller shop not found." });
        }

        return Ok(shop);
    }

    [HttpGet("id/{id:guid}/products")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResultDto<ShopProductListItemDto>>> GetProducts(
        Guid id,
        [FromQuery] Guid? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var shop = await _shopService.GetShopByIdAsync(id);
        if (shop == null)
        {
            return NotFound(new { message = "Shop not found." });
        }

        var products = await _shopService.GetShopProductsAsync(id, categoryId, minPrice, maxPrice, sort, page, pageSize);
        return Ok(products);
    }

    [HttpGet("slug/{shopSlug}/products")]
    [HttpGet("{shopSlug}/products")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResultDto<ShopProductListItemDto>>> GetProductsBySlug(
        string shopSlug,
        [FromQuery] Guid? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var shop = await _shopService.GetShopBySlugAsync(shopSlug);
        if (shop == null)
        {
            return NotFound(new { message = "Shop not found." });
        }

        var products = await _shopService.GetShopProductsBySlugAsync(shopSlug, categoryId, minPrice, maxPrice, sort, page, pageSize);
        return Ok(products);
    }

    [HttpGet("id/{id:guid}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ShopReviewDto>>> GetReviews(Guid id)
    {
        var shop = await _shopService.GetShopByIdAsync(id);
        if (shop == null)
        {
            return NotFound(new { message = "Shop not found." });
        }

        var reviews = await _shopService.GetShopReviewsAsync(id);
        return Ok(reviews);
    }
}
