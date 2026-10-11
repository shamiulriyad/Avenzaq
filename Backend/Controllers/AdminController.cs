using Backend.DTOs.Admin;
using Backend.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> Dashboard()
    {
        var dashboard = await _adminService.GetDashboardAsync();
        return Ok(dashboard);
    }

    [HttpPatch("sellers/{sellerId:guid}/approve")]
    public async Task<IActionResult> ApproveSeller(Guid sellerId)
    {
        var ok = await _adminService.ApproveSellerAsync(sellerId);
        return ok ? NoContent() : NotFound();
    }

    [HttpGet("sellers")]
    public async Task<ActionResult<List<AdminSellerDto>>> GetSellers()
    {
        var sellers = await _adminService.GetSellersAsync();
        return Ok(sellers);
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<object>>> GetUsers()
    {
        var users = await _adminService.GetUsersAsync();
        return Ok(users);
    }

    [HttpPatch("users/{userId:guid}/block")]
    public async Task<IActionResult> BlockUser(Guid userId)
    {
        var ok = await _adminService.BlockUserAsync(userId);
        return ok ? NoContent() : NotFound();
    }

    [HttpPatch("users/{userId:guid}/unblock")]
    public async Task<IActionResult> UnblockUser(Guid userId)
    {
        var ok = await _adminService.UnblockUserAsync(userId);
        return ok ? NoContent() : NotFound();
    }

    [HttpGet("products")]
    public async Task<ActionResult<List<object>>> GetProducts()
    {
        var products = await _adminService.GetProductsAsync();
        return Ok(products);
    }

    [HttpGet("orders")]
    public async Task<ActionResult<List<object>>> GetOrders()
    {
        var orders = await _adminService.GetOrdersAsync();
        return Ok(orders);
    }

    [HttpPatch("sellers/{sellerId:guid}/reject")]
    public async Task<IActionResult> RejectSeller(Guid sellerId)
    {
        var ok = await _adminService.RejectSellerAsync(sellerId);
        return ok ? NoContent() : NotFound();
    }

    [HttpPatch("sellers/{sellerId:guid}/suspend")]
    public async Task<IActionResult> SuspendSeller(Guid sellerId)
    {
        var ok = await _adminService.SuspendSellerAsync(sellerId);
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("promotions/featured")]
    public async Task<IActionResult> CreateFeatured([FromBody] CreateFeaturedPromotionDto dto)
    {
        await _adminService.CreateFeaturedPromotionAsync(dto);
        return NoContent();
    }

    [HttpGet("promotions")]
    public async Task<ActionResult<List<AdminPromotionDto>>> GetPromotions()
    {
        var promotions = await _adminService.GetFeaturedPromotionsAsync();
        return Ok(promotions);
    }

    [HttpPut("promotions/{promotionId:guid}")]
    public async Task<IActionResult> UpdatePromotion(Guid promotionId, [FromBody] CreateFeaturedPromotionDto dto)
    {
        var ok = await _adminService.UpdateFeaturedPromotionAsync(promotionId, dto);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("promotions/{promotionId:guid}")]
    public async Task<IActionResult> DeletePromotion(Guid promotionId)
    {
        var ok = await _adminService.DeleteFeaturedPromotionAsync(promotionId);
        return ok ? NoContent() : NotFound();
    }
}
