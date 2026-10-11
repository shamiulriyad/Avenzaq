using Backend.DTOs.Products;
using Backend.Interfaces.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IWebHostEnvironment _env;

    public ProductsController(IProductService productService, IWebHostEnvironment env)
    {
        _productService = productService;
        _env = env;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProductListItemDto>>> Search(
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        var products = await _productService.SearchAsync(search, categoryId, minPrice, maxPrice);
        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductDetailsFullDto>> GetById(Guid id)
    {
        // Return full product details with seller information for Product Details page
        var product = await _productService.GetByIdFullAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<ProductDetailsDto>> Create([FromBody] ProductCreateDto dto)
    {
        try
        {
            var userId = User.GetUserId();
            var created = await _productService.CreateAsync(userId, dto);
            return Ok(created);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProductUpdateDto dto)
    {
        try
        {
            var ok = await _productService.UpdateAsync(User.GetUserId(), id, dto);
            return ok ? NoContent() : Forbid();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var ok = await _productService.DeleteAsync(User.GetUserId(), id);
            return ok ? NoContent() : Forbid();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/images")]
    [Authorize(Roles = "Seller")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(Guid id, [FromForm] ProductImageUploadDto dto)
    {
        var file = dto.File;
        if (file == null || file.Length == 0)
        {
            return BadRequest("Image file is required.");
        }

        var uploadsPath = Path.Combine(_env.WebRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var absolutePath = Path.Combine(uploadsPath, fileName);

        await using (var stream = System.IO.File.Create(absolutePath))
        {
            await file.CopyToAsync(stream);
        }

        var imageUrl = $"/uploads/products/{fileName}";
        var absoluteImageUrl = $"{Request.Scheme}://{Request.Host}{imageUrl}";

        try
        {
            var ok = await _productService.AddImageAsync(User.GetUserId(), id, imageUrl);
            return ok ? Ok(new { imageUrl, absoluteImageUrl }) : Forbid();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/images/batch")]
    [Authorize(Roles = "Seller")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImages(Guid id, [FromForm] ProductImagesUploadDto dto)
    {
        var images = dto.Images;
        if (images == null || images.Count == 0)
        {
            return BadRequest("At least one image file is required.");
        }

        var uploadsPath = Path.Combine(_env.WebRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsPath);

        var uploaded = new List<object>();

        foreach (var file in images)
        {
            if (file == null || file.Length == 0)
            {
                continue;
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var absolutePath = Path.Combine(uploadsPath, fileName);

            await using (var stream = System.IO.File.Create(absolutePath))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/products/{fileName}";
            var absoluteImageUrl = $"{Request.Scheme}://{Request.Host}{imageUrl}";

            try
            {
                var ok = await _productService.AddImageAsync(User.GetUserId(), id, imageUrl);
                if (!ok)
                {
                    return Forbid();
                }

                uploaded.Add(new { imageUrl, absoluteImageUrl });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }

        return Ok(uploaded);
    }
}
