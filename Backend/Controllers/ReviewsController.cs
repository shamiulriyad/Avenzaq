using Backend.DTOs.Reviews;
using Backend.Interfaces.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("product/{productId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ReviewDto>>> GetForProduct(Guid productId)
    {
        var reviews = await _reviewService.GetByProductIdAsync(productId);
        return Ok(reviews);
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewDto dto)
    {
        var review = await _reviewService.CreateAsync(User.GetUserId(), dto);
        return Ok(review);
    }
}
