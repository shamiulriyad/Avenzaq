using Backend.DTOs.Cart;
using Backend.Interfaces.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> Get()
    {
        var cart = await _cartService.GetAsync(User.GetUserId());
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddCartItemDto dto)
    {
        var cart = await _cartService.AddItemAsync(User.GetUserId(), dto);
        return Ok(cart);
    }

    [HttpPut("items/{itemId:guid}")]
    public async Task<ActionResult<CartDto>> UpdateItem(Guid itemId, [FromBody] UpdateCartItemDto dto)
    {
        var cart = await _cartService.UpdateItemAsync(User.GetUserId(), itemId, dto.Quantity);
        return Ok(cart);
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<ActionResult<CartDto>> RemoveItem(Guid itemId)
    {
        var cart = await _cartService.RemoveItemAsync(User.GetUserId(), itemId);
        return Ok(cart);
    }
}
