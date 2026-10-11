using Backend.DTOs.Sellers;
using Backend.DTOs.Orders;
using Backend.Interfaces.Services;
using Backend.Models.Enums;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SellersController : ControllerBase
{
    private readonly ISellerService _sellerService;
    private readonly IOrderService _orderService;

    public SellersController(ISellerService sellerService, IOrderService orderService)
    {
        _sellerService = sellerService;
        _orderService = orderService;
    }

    [HttpPost("register")]
    [Authorize(Roles = "Customer,Seller")]
    public async Task<IActionResult> Register([FromForm] RegisterSellerDto dto)
    {
        try
        {
            await _sellerService.RegisterAsync(User.GetUserId(), dto);
            return Ok(new { message = "Application submitted successfully. Pending admin review." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("me/dashboard")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<SellerDashboardDto>> Dashboard([FromQuery] string dateRange = "week")
    {
        try
        {
            var dashboard = await _sellerService.GetDashboardAsync(User.GetUserId(), dateRange);
            return Ok(dashboard);
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

    [HttpGet("me/profile")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<SellerProfileDto>> GetProfile()
    {
        try
        {
            var profile = await _sellerService.GetProfileAsync(User.GetUserId());
            if (profile == null)
                return NotFound(new { message = "Seller profile not found." });
            
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("me/profile")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> UpdateProfile([FromBody] SellerProfileDto dto)
    {
        try
        {
            await _sellerService.UpdateProfileAsync(User.GetUserId(), dto);
            return Ok(new { message = "Profile updated successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("orders")]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<List<SellerOrderDto>>> Orders()
    {
        try
        {
            var orders = await _orderService.GetSellerOrdersAsync(User.GetUserId());
            return Ok(orders);
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

    [HttpPatch("orders/{sellerOrderId:guid}/status")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> UpdateStatus(Guid sellerOrderId, [FromQuery] OrderStatus status)
    {
        try
        {
            var ok = await _orderService.UpdateSellerOrderStatusAsync(User.GetUserId(), sellerOrderId, status);
            return ok ? NoContent() : Forbid();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("me/earnings")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> GetEarnings()
    {
        try
        {
            var earnings = new
            {
                totalEarnings = 0m,
                pendingEarnings = 0m,
                paidEarnings = 0m,
                payoutHistory = new List<object>()
            };
            return Ok(earnings);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("me/reviews")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> GetReviews([FromQuery] int? rating, [FromQuery] string? status)
    {
        try
        {
            var reviews = new
            {
                reviews = new List<object>(),
                stats = new
                {
                    totalReviews = 0,
                    avgRating = 0m,
                    ratingDistribution = new[] { 0, 0, 0, 0, 0 }
                }
            };
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
