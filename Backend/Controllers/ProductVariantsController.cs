using Backend.DTOs.Products;
using Backend.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductVariantsController : ControllerBase
{
    private readonly IProductVariantService _variantService;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public ProductVariantsController(IProductVariantService variantService, JwtTokenGenerator jwtTokenGenerator)
    {
        _variantService = variantService;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    /// <summary>
    /// Create a new product variant for a specific product
    /// POST: api/productvariants/{productId}/variants
    /// </summary>
    [HttpPost("{productId:guid}/variants")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<ProductVariantDto>> CreateVariant(
        Guid productId,
        [FromBody] ProductVariantCreateDto dto)
    {
        try
        {
            var result = await _variantService.CreateVariantAsync(User.GetUserId(), productId, dto);
            return CreatedAtAction(nameof(GetVariant), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating variant", error = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific variant by ID
    /// GET: api/productvariants/{id}
    /// </summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductVariantDto>> GetVariant(Guid id)
    {
        var variant = await _variantService.GetVariantAsync(id);
        if (variant == null)
            return NotFound(new { message = "Variant not found" });

        return Ok(variant);
    }

    /// <summary>
    /// Get variant by SKU
    /// GET: api/productvariants/sku/{sku}
    /// </summary>
    [HttpGet("sku/{sku}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductVariantDto>> GetVariantBySku(string sku)
    {
        var variant = await _variantService.GetVariantBySkuAsync(sku);
        if (variant == null)
            return NotFound(new { message = "Variant not found" });

        return Ok(variant);
    }

    /// <summary>
    /// Get all variants for a specific product
    /// GET: api/productvariants/product/{productId}
    /// </summary>
    [HttpGet("product/{productId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProductVariantDto>>> GetProductVariants(Guid productId)
    {
        var variants = await _variantService.GetProductVariantsAsync(productId);
        return Ok(variants);
    }

    /// <summary>
    /// Update a variant
    /// PUT: api/productvariants/{id}
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<ProductVariantDto>> UpdateVariant(
        Guid id,
        [FromBody] ProductVariantUpdateDto dto)
    {
        try
        {
            var result = await _variantService.UpdateVariantAsync(id, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating variant", error = ex.Message });
        }
    }

    /// <summary>
    /// Delete a variant
    /// DELETE: api/productvariants/{id}
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> DeleteVariant(Guid id)
    {
        try
        {
            await _variantService.DeleteVariantAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting variant", error = ex.Message });
        }
    }

    /// <summary>
    /// Upload single image to variant
    /// POST: api/productvariants/{variantId}/images
    /// </summary>
    [HttpPost("{variantId:guid}/images")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<VariantImageDto>> UploadImage(
        Guid variantId,
        IFormFile file,
        [FromQuery] bool isPrimary = false)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided" });

            var result = await _variantService.AddImageAsync(variantId, file, isPrimary: isPrimary);
            return CreatedAtAction(nameof(GetVariantImages), new { variantId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error uploading image", error = ex.Message });
        }
    }

    /// <summary>
    /// Upload multiple images to variant
    /// POST: api/productvariants/{variantId}/images/batch
    /// </summary>
    [HttpPost("{variantId:guid}/images/batch")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<List<VariantImageDto>>> UploadMultipleImages(
        Guid variantId)
    {
        try
        {
            var files = Request.Form.Files;
            if (files == null || files.Count == 0)
                return BadRequest(new { message = "No files provided" });

            var results = await _variantService.AddMultipleImagesAsync(variantId, files.ToList());
            return CreatedAtAction(nameof(GetVariantImages), new { variantId }, results);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error uploading images", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all images for a variant
    /// GET: api/productvariants/{variantId}/images
    /// </summary>
    [HttpGet("{variantId:guid}/images")]
    [AllowAnonymous]
    public async Task<ActionResult<List<VariantImageDto>>> GetVariantImages(Guid variantId)
    {
        var images = await _variantService.GetVariantImagesAsync(variantId);
        return Ok(images);
    }

    /// <summary>
    /// Delete a variant image
    /// DELETE: api/productvariants/images/{imageId}
    /// </summary>
    [HttpDelete("images/{imageId:guid}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> DeleteImage(Guid imageId)
    {
        try
        {
            await _variantService.DeleteImageAsync(imageId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting image", error = ex.Message });
        }
    }
}
